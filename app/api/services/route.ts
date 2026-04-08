import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') ?? undefined;
    const category = searchParams.get('category') ?? undefined;
    const limitN = Math.min(parseInt(searchParams.get('limit') ?? '40'), 100);

    const db = getAdminDb();
    const snap = await db.collection('services').orderBy('createdAt', 'desc').limit(limitN).get();

    let docs = snap.docs.map((d) => serializeDoc({ id: d.id, ...d.data() }));

    docs = docs.filter((d: Record<string, unknown>) => d.status === 'active');
    if (cityId) docs = docs.filter((d: Record<string, unknown>) => d.cityId === cityId);
    if (category) docs = docs.filter((d: Record<string, unknown>) => d.category === category);

    return NextResponse.json({ services: docs }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (err) {
    console.error('[API /services]', err);
    return NextResponse.json({ error: 'Failed to load services' }, { status: 500 });
  }
}
