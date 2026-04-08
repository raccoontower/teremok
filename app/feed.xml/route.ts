import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { BlogPost } from '@/types';
import { Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirestoreInstance() {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig, 'rss-app');
  return getFirestore(app);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(ts: Timestamp | undefined): string {
  if (!ts) return new Date().toUTCString();
  const date = ts.toDate ? ts.toDate() : new Date(ts as unknown as number);
  return date.toUTCString();
}

export async function GET() {
  const SITE_URL = 'https://teremok-app.vercel.app';

  try {
    const db = getFirestoreInstance();
    const ref = collection(db, 'posts');
    const q = query(ref, orderBy('publishedAt', 'desc'), limit(20));
    const snapshot = await getDocs(q);

    const posts = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as BlogPost))
      .filter((p) => p.status === 'published');

    const items = posts
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/blog/${escapeXml(post.slug)}</link>
      <description>${escapeXml(post.excerpt || '')}</description>
      <pubDate>${toRfc822(post.publishedAt)}</pubDate>
      <guid>${SITE_URL}/blog/${escapeXml(post.slug)}</guid>
      <category>${escapeXml(post.category || '')}</category>
    </item>`
      )
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Теремок</title>
    <link>${SITE_URL}</link>
    <description>Русское сообщество в США</description>
    <language>ru</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[RSS] Failed to fetch posts:', error);

    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Теремок</title>
    <link>${SITE_URL}</link>
    <description>Русское сообщество в США</description>
    <language>ru</language>
  </channel>
</rss>`;

    return new NextResponse(emptyXml, {
      status: 200,
      headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
    });
  }
}
