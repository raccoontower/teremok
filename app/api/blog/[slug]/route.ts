import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const db = getAdminDb();
    const snap = await db.collection('posts').where('slug', '==', params.slug).limit(1).get();
    if (snap.empty) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const doc = snap.docs[0];
    doc.ref.update({ viewsCount: (doc.data()?.viewsCount ?? 0) + 1 }).catch(() => {});
    return NextResponse.json({ post: serializeDoc({ id: doc.id, ...doc.data() }) });
  } catch (err) {
    console.error('[API /blog/:slug]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
