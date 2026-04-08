import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';
import { getAuth } from 'firebase-admin/auth';
import { getApps } from 'firebase-admin/app';

export const runtime = 'nodejs';

function getAdminAuthApp() {
  return getApps()[0];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') ?? undefined;
    const listingType = searchParams.get('listingType') ?? undefined;
    const category = searchParams.get('category') ?? undefined;
    const limitN = Math.min(parseInt(searchParams.get('limit') ?? '40'), 100);

    const db = getAdminDb();
    const snap = await db.collection('jobs').orderBy('createdAt', 'desc').limit(limitN).get();

    let docs = snap.docs.map((d) => serializeDoc({ id: d.id, ...d.data() }));
    docs = docs.filter((d) => d.status === 'active');
    if (cityId) docs = docs.filter((d) => d.cityId === cityId);
    if (listingType) docs = docs.filter((d) => d.listingType === listingType);
    if (category) docs = docs.filter((d) => d.category === category);

    return NextResponse.json({ jobs: docs }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (err) {
    console.error('[API GET /jobs]', err);
    return NextResponse.json({ error: 'Failed to load jobs' }, { status: 500 });
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
    const docRef = await db.collection('jobs').add({
      ...body, authorId: decoded.uid, authorName: decoded.name ?? decoded.email ?? 'Пользователь',
      status: 'active', viewsCount: 0, isPremium: false,
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (err) {
    console.error('[API POST /jobs]', err);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
