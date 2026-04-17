import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';
import { getAuth } from 'firebase-admin/auth';
import { getApps } from 'firebase-admin/app';

export const runtime = 'nodejs';

function getAdminAuthApp() { return getApps()[0]; }

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') ?? undefined;
    const listingType = searchParams.get('listingType') ?? undefined;
    const propertyType = searchParams.get('propertyType') ?? undefined;
    const limitN = Math.min(parseInt(searchParams.get('limit') ?? '40'), 100);

    const db = getAdminDb();
    // Загружаем из housing + объявления с categoryId='real-estate' из listings
    const [housingSnap, listingsSnap] = await Promise.all([
      db.collection('housing').orderBy('createdAt', 'desc').limit(limitN).get(),
      db.collection('listings').orderBy('createdAt', 'desc').limit(100).get(),
    ]);

    let docs = housingSnap.docs.map((d) => serializeDoc({ id: d.id, ...d.data() }));
    const crossListings = listingsSnap.docs
      .map((d) => serializeDoc({ id: d.id, ...d.data() }))
      .filter((d) => d.categoryId === 'real-estate' && d.status === 'active');
    docs = [...docs, ...crossListings];

    docs = docs.filter((d) => d.status === 'active');
    const seen = new Set<string>();
    docs = docs.filter(d => { const id = String(d.id); if (seen.has(id)) return false; seen.add(id); return true; });
    if (cityId) docs = docs.filter((d) => d.cityId === cityId);
    if (listingType) docs = docs.filter((d) => d.listingType === listingType);
    if (propertyType) docs = docs.filter((d) => d.propertyType === propertyType);
    docs.sort((a, b) => new Date(String(b.createdAt ?? '')).getTime() - new Date(String(a.createdAt ?? '')).getTime());

    return NextResponse.json({ listings: docs.slice(0, limitN) }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (err) {
    console.error('[API GET /housing]', err);
    return NextResponse.json({ error: 'Failed to load housing' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await getAuth(getAdminAuthApp()).verifyIdToken(authHeader.slice(7));
    const body = await req.json() as Record<string, unknown>;
    const db = getAdminDb();
    const { FieldValue } = await import('firebase-admin/firestore');
    const docRef = await db.collection('housing').add({
      ...body, authorId: decoded.uid, authorName: decoded.name ?? decoded.email ?? 'Пользователь',
      status: 'active', viewsCount: 0, isPremium: false,
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (err) {
    console.error('[API POST /housing]', err);
    return NextResponse.json({ error: 'Failed to create housing' }, { status: 500 });
  }
}
