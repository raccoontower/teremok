import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') ?? undefined;
    const categoryId = searchParams.get('categoryId') ?? undefined;
    const limitN = Math.min(parseInt(searchParams.get('limit') ?? '40'), 100);

    const db = getAdminDb();
    const ref = db.collection('listings');
    const snap = await ref.orderBy('createdAt', 'desc').limit(limitN).get();

    let docs = snap.docs.map((d) => serializeDoc({ id: d.id, ...d.data() }));

    // Фильтрация
    docs = docs.filter((d: Record<string, unknown>) => d.status === 'active');
    if (cityId) docs = docs.filter((d: Record<string, unknown>) => d.cityId === cityId);
    if (categoryId) docs = docs.filter((d: Record<string, unknown>) => d.categoryId === categoryId);

    return NextResponse.json({ listings: docs }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (err) {
    console.error('[API /listings]', err);
    return NextResponse.json({ error: 'Failed to load listings' }, { status: 500 });
  }
}
