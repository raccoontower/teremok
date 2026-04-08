import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, orderBy, limit, startAfter, serverTimestamp, increment,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Housing, HousingListingType, PropertyType, BedroomsCount, SectionStatus } from '@/types';
import type { User } from 'firebase/auth';

const PER_PAGE = 20;

export interface HousingFilters {
  cityId?: string;
  listingType?: HousingListingType;
  propertyType?: PropertyType;
  bedrooms?: BedroomsCount;
  petFriendly?: boolean;
  limit?: number;
}

export async function getHousingListings(
  filters: HousingFilters = {},
  lastDoc?: QueryDocumentSnapshot
): Promise<{ listings: Housing[]; lastDoc: QueryDocumentSnapshot | null }> {
  const ref = collection(db, 'housing');
  const q = query(
    ref,
    orderBy('createdAt', 'desc'),
    limit((filters.limit ?? PER_PAGE) * 2),
    ...(lastDoc ? [startAfter(lastDoc)] : [])
  );
  const snapshot = await getDocs(q);

  let listings: Housing[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Housing[];
  listings = listings.filter(h => h.status === 'active');
  if (filters.cityId) listings = listings.filter(h => h.cityId === filters.cityId);
  if (filters.listingType) listings = listings.filter(h => h.listingType === filters.listingType);
  if (filters.propertyType) listings = listings.filter(h => h.propertyType === filters.propertyType);
  if (filters.bedrooms !== undefined) listings = listings.filter(h => h.bedrooms === filters.bedrooms);
  if (filters.petFriendly !== undefined) listings = listings.filter(h => h.petFriendly === filters.petFriendly);

  const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
  return { listings, lastDoc: newLastDoc };
}

export async function getHousingListing(id: string): Promise<Housing | null> {
  const docRef = doc(db, 'housing', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  const data = snapshot.data() as Housing;
  try {
    if (data.status === 'active') await updateDoc(docRef, { viewsCount: increment(1) });
  } catch { /* ignore */ }
  return { ...data, id: snapshot.id };
}

export async function createHousingListing(
  data: Omit<Housing, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'isPremium' | 'status'>,
  user: User
): Promise<string> {
  const ref = collection(db, 'housing');
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

export async function updateHousingListing(id: string, data: Partial<Omit<Housing, 'id' | 'createdAt' | 'authorId'>>): Promise<void> {
  await updateDoc(doc(db, 'housing', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteHousingListing(id: string): Promise<void> {
  await updateDoc(doc(db, 'housing', id), { status: 'closed' as SectionStatus, updatedAt: serverTimestamp() });
}
