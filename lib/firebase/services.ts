import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, orderBy, limit, startAfter, serverTimestamp, increment,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Service, ServiceCategory, ServiceArea, SectionStatus } from '@/types';
import type { User } from 'firebase/auth';
import { withTimeout } from '@/lib/firebase/utils';

const PER_PAGE = 20;

export interface ServiceFilters {
  cityId?: string;
  category?: ServiceCategory;
  serviceArea?: ServiceArea;
  limit?: number;
}

export async function getServices(
  filters: ServiceFilters = {},
  lastDoc?: QueryDocumentSnapshot
): Promise<{ services: Service[]; lastDoc: QueryDocumentSnapshot | null }> {
  const ref = collection(db, 'services');
  const q = query(
    ref,
    orderBy('createdAt', 'desc'),
    limit((filters.limit ?? PER_PAGE) * 2),
    ...(lastDoc ? [startAfter(lastDoc)] : [])
  );
  const snapshot = await withTimeout(getDocs(q));

  let services: Service[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Service[];
  services = services.filter(s => s.status === 'active');
  if (filters.cityId) services = services.filter(s => s.cityId === filters.cityId);
  if (filters.category) services = services.filter(s => s.category === filters.category);
  if (filters.serviceArea) services = services.filter(s => s.serviceArea === filters.serviceArea);

  const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
  return { services, lastDoc: newLastDoc };
}

export async function getService(id: string): Promise<Service | null> {
  const docRef = doc(db, 'services', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  const data = snapshot.data() as Service;
  try {
    if (data.status === 'active') await updateDoc(docRef, { viewsCount: increment(1) });
  } catch { /* ignore */ }
  return { ...data, id: snapshot.id };
}

export async function createService(
  data: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'isPremium' | 'status'>,
  user: User
): Promise<string> {
  const ref = collection(db, 'services');
  const docRef = await addDoc(ref, {
    ...data,
    authorId: user.uid,
    authorName: user.displayName || 'Пользователь',
    status: 'active' as SectionStatus,
    viewsCount: 0,
    isPremium: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateService(id: string, data: Partial<Omit<Service, 'id' | 'createdAt' | 'authorId'>>): Promise<void> {
  await updateDoc(doc(db, 'services', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteService(id: string): Promise<void> {
  await updateDoc(doc(db, 'services', id), { status: 'closed' as SectionStatus, updatedAt: serverTimestamp() });
}
