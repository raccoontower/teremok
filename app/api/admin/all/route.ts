import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';
import { isAdmin } from '@/lib/constants/admins';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await getAdminAuth().verifyIdToken(token);
    if (!isAdmin(decoded.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = getAdminDb();

    // Собираем всё самое свежее из 4-х коллекций
    const [listingsSnap, jobsSnap, housingSnap, servicesSnap] = await Promise.all([
      db.collection('listings').orderBy('createdAt', 'desc').limit(100).get(),
      db.collection('jobs').orderBy('createdAt', 'desc').limit(100).get(),
      db.collection('housing').orderBy('createdAt', 'desc').limit(100).get(),
      db.collection('services').orderBy('createdAt', 'desc').limit(100).get(),
    ]);

    const serialize = (snap: FirebaseFirestore.QuerySnapshot, type: string) =>
      snap.docs.map((d) => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
          _type: type,
          createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        };
      });

    return NextResponse.json({
      items: [
        ...serialize(listingsSnap, 'listing'),
        ...serialize(jobsSnap, 'job'),
        ...serialize(housingSnap, 'housing'),
        ...serialize(servicesSnap, 'service'),
      ].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      }),
    });
  } catch (err) {
    console.error('[admin/all]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
