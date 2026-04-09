import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await getAdminAuth().verifyIdToken(token);
    const db = getAdminDb();

    const [listingsSnap, jobsSnap, housingSnap, servicesSnap] = await Promise.all([
      db.collection('listings').where('authorId', '==', decoded.uid).orderBy('createdAt', 'desc').limit(50).get(),
      db.collection('jobs').where('authorId', '==', decoded.uid).orderBy('createdAt', 'desc').limit(50).get(),
      db.collection('housing').where('authorId', '==', decoded.uid).orderBy('createdAt', 'desc').limit(50).get(),
      db.collection('services').where('authorId', '==', decoded.uid).orderBy('createdAt', 'desc').limit(50).get(),
    ]);

    const serialize = (snap: FirebaseFirestore.QuerySnapshot, type: string) =>
      snap.docs.map((d) => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
          _type: type,
          createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
        };
      });

    return NextResponse.json({
      listings: serialize(listingsSnap, 'listing'),
      jobs: serialize(jobsSnap, 'job'),
      housing: serialize(housingSnap, 'housing'),
      services: serialize(servicesSnap, 'service'),
    });
  } catch (err) {
    console.error('[profile/listings]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
