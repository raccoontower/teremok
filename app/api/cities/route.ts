import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = getAdminDb();
    const snap = await db.collection('cities').get();
    const cities = snap.docs.map((d) => serializeDoc({ id: d.id, ...d.data() }));
    return NextResponse.json({ cities }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    });
  } catch (err) {
    console.error('[API /cities]', err);
    return NextResponse.json({ error: 'Failed to load cities' }, { status: 500 });
  }
}
