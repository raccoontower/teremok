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
    const category = searchParams.get('category') ?? undefined;
    const limitN = Math.min(parseInt(searchParams.get('limit') ?? '40'), 100);

    const db = getAdminDb();
    // Загружаем из services + объявления с categoryId='services' из listings
    const [servicesSnap, listingsSnap] = await Promise.all([
      db.collection('services').orderBy('createdAt', 'desc').limit(limitN).get(),
      db.collection('listings').orderBy('createdAt', 'desc').limit(100).get(),
    ]);

    let docs = servicesSnap.docs.map((d) => serializeDoc({ id: d.id, ...d.data() }));
    const crossListings = listingsSnap.docs
      .map((d) => serializeDoc({ id: d.id, ...d.data() }))
      .filter((d) => d.categoryId === 'services' && d.status === 'active');
    docs = [...docs, ...crossListings];

    docs = docs.filter((d) => d.status === 'active');
    const seen = new Set<string>();
    docs = docs.filter(d => { const id = String(d.id); if (seen.has(id)) return false; seen.add(id); return true; });
    if (cityId) docs = docs.filter((d) => d.cityId === cityId);
    if (category) docs = docs.filter((d) => d.category === category);
    docs.sort((a, b) => new Date(String(b.createdAt ?? '')).getTime() - new Date(String(a.createdAt ?? '')).getTime());

    return NextResponse.json({ services: docs.slice(0, limitN) }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (err) {
    console.error('[API GET /services]', err);
    return NextResponse.json({ error: 'Failed to load services' }, { status: 500 });
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
    const docRef = await db.collection('services').add({
      ...body, authorId: decoded.uid, authorName: decoded.name ?? decoded.email ?? 'Пользователь',
      status: 'active', viewsCount: 0, isPremium: false,
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (err) {
    console.error('[API POST /services]', err);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
