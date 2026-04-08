import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const runtime = 'nodejs';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!.trim(),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!.trim(),
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.trim().replace(/\\n/g, '\n'),
    }),
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') ?? undefined;
    const categoryId = searchParams.get('categoryId') ?? undefined;
    const limitN = Math.min(parseInt(searchParams.get('limit') ?? '40'), 100);

    const db = getAdminDb();
    const snap = await db.collection('listings').orderBy('createdAt', 'desc').limit(limitN).get();

    let docs = snap.docs.map((d) => serializeDoc({ id: d.id, ...d.data() }));
    docs = docs.filter((d) => d.status === 'active');
    if (cityId) docs = docs.filter((d) => d.cityId === cityId);
    if (categoryId) docs = docs.filter((d) => d.categoryId === categoryId);

    return NextResponse.json({ listings: docs }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (err) {
    console.error('[API GET /listings]', err);
    return NextResponse.json({ error: 'Failed to load listings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Верифицируем токен пользователя
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token);

    const body = await req.json() as Record<string, unknown>;
    const db = getAdminDb();
    const { FieldValue } = await import('firebase-admin/firestore');

    const docRef = await db.collection('listings').add({
      ...body,
      authorId: decoded.uid,
      authorName: decoded.name ?? decoded.email ?? 'Пользователь',
      status: 'active',
      viewsCount: 0,
      isPremium: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (err) {
    console.error('[API POST /listings]', err);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
