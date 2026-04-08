import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = getAdminDb();
    const snap = await db.collection('posts')
      .orderBy('publishedAt', 'desc')
      .limit(50)
      .get();

    const posts = snap.docs
      .map((d) => serializeDoc({ id: d.id, ...d.data() }))
      .filter((d) => d.status === 'published');

    return NextResponse.json({ posts }, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' },
    });
  } catch (err) {
    console.error('[API /blog]', err);
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
  }
}
