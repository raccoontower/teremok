import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await getAdminAuth().verifyIdToken(token);
    const { collection, id } = await req.json() as { collection: string; id: string };

    const allowed = ['listings', 'jobs', 'housing', 'services'];
    if (!allowed.includes(collection)) return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });

    const db = getAdminDb();
    const doc = await db.collection(collection).doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (doc.data()?.authorId !== decoded.uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await db.collection(collection).doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[profile/delete]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
