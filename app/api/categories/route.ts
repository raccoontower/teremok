import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = getAdminDb();
    const snap = await db.collection('categories').get();
    const categories = snap.docs.map((d) => serializeDoc({ id: d.id, ...d.data() }));
    return NextResponse.json({ categories }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    });
  } catch (err) {
    console.error('[API /categories]', err);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}
