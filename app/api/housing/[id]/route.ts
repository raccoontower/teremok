import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';
import { isAdmin } from '@/lib/constants/admins';

export const runtime = 'nodejs';

const COLLECTION = 'housing';
const KEY = 'housing';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getAdminDb();
    const doc = await db.collection(COLLECTION).doc(params.id).get();
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    doc.ref.update({ viewsCount: (doc.data()?.viewsCount ?? 0) + 1 }).catch(() => {});
    return NextResponse.json({ [KEY]: serializeDoc({ id: doc.id, ...doc.data()! }) });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await getAdminAuth().verifyIdToken(token);
    const db = getAdminDb();
    const doc = await db.collection(COLLECTION).doc(params.id).get();
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (doc.data()?.authorId !== decoded.uid && !isAdmin(decoded.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await req.json();
    const allowed = ['title','description','price','priceType','category','cityId','status','contact','photos','listingType','rooms','area','bedrooms','propertyType'];
    const update: Record<string, unknown> = { updatedAt: new Date() };
    for (const key of allowed) { if (key in body) update[key] = body[key]; }
    await db.collection(COLLECTION).doc(params.id).update(update);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
