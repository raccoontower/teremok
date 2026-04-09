import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE_URL = 'https://teremok.live';

function escapeXml(str: string): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(ts: unknown): string {
  try {
    if (!ts) return new Date().toUTCString();
    if (typeof ts === 'string') return new Date(ts).toUTCString();
    if (typeof ts === 'object' && ts !== null) {
      if ('seconds' in ts) return new Date((ts as { seconds: number }).seconds * 1000).toUTCString();
      if ('_seconds' in ts) return new Date((ts as { _seconds: number })._seconds * 1000).toUTCString();
    }
    return new Date().toUTCString();
  } catch { return new Date().toUTCString(); }
}

export async function GET() {
  try {
    const db = getAdminDb();
    const snap = await db.collection('posts')
      .where('status', '==', 'published')
      .orderBy('publishedAt', 'desc')
      .limit(20)
      .get();

    const items = snap.docs.map((d) => {
      const p = d.data();
      return `
    <item>
      <title>${escapeXml(p.title as string)}</title>
      <link>${SITE_URL}/blog/${escapeXml(p.slug as string)}</link>
      <description>${escapeXml(p.excerpt as string || '')}</description>
      <pubDate>${toRfc822(p.publishedAt)}</pubDate>
      <guid>${SITE_URL}/blog/${escapeXml(p.slug as string)}</guid>
      <category>${escapeXml(p.category as string || '')}</category>
    </item>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Teremok — Ваш дом в США</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Блог для русскоязычных в США: жильё, работа, советы иммигрантам</description>
    <language>ru</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
      },
    });
  } catch (err) {
    console.error('[RSS]', err);
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Teremok</title><link>${SITE_URL}</link></channel></rss>`, {
      headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
    });
  }
}
