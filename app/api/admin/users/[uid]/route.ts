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

    const body = await req.json() as { disabled?: boolean; displayName?: string; email?: string; phoneNumber?: string };
    const auth = getAdminAuth();
    const update: Record<string, unknown> = {};
    if (body.disabled !== undefined) update.disabled = body.disabled;
    if (body.displayName !== undefined) update.displayName = body.displayName;
    if (body.email) update.email = body.email;
    await auth.updateUser(params.uid, update);
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
