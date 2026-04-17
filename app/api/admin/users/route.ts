import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { isAdmin } from '@/lib/constants/admins';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await getAdminAuth().verifyIdToken(token);
    if (!isAdmin(decoded.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const auth = getAdminAuth();
    const result = await auth.listUsers(500);
    const users = result.users.map(u => ({
      uid: u.uid,
      email: u.email ?? '',
      displayName: u.displayName ?? '',
      photoURL: u.photoURL ?? '',
      disabled: u.disabled,
      createdAt: u.metadata.creationTime ?? '',
      lastLogin: u.metadata.lastSignInTime ?? '',
      emailVerified: u.emailVerified,
    }));
    return NextResponse.json({ users });
  } catch (err) {
    console.error('[admin/users GET]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
