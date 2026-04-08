import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getAdminDb();
    const doc = await db.collection('services').doc(params.id).get();
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    doc.ref.update({ viewsCount: (doc.data()?.viewsCount ?? 0) + 1 }).catch(() => {});
    return NextResponse.json({ service: serializeDoc({ id: doc.id, ...doc.data()! }) });
  } catch (err) {
    console.error('[API /services/:id]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
