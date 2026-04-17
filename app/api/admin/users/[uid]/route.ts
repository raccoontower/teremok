import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { isAdmin } from '@/lib/constants/admins';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: { uid: string } }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await getAdminAuth().verifyIdToken(token);
    if (!isAdmin(decoded.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json() as { disabled?: boolean; displayName?: string };
    const auth = getAdminAuth();
    await auth.updateUser(params.uid, {
      ...(body.disabled !== undefined && { disabled: body.disabled }),
      ...(body.displayName && { displayName: body.displayName }),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/users PATCH]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { uid: string } }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await getAdminAuth().verifyIdToken(token);
    if (!isAdmin(decoded.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await getAdminAuth().deleteUser(params.uid);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/users DELETE]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
