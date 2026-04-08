import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Listing, Category, City, ListingFilters, CreateListingData, UpdateListingData } from '@/types';
import { LISTINGS_PER_PAGE } from '@/lib/constants/limits';

// --- Листинги ---

export async function getListings(
  filters: ListingFilters = {},
  lastDoc?: QueryDocumentSnapshot
): Promise<{ listings: Listing[]; lastDoc: QueryDocumentSnapshot | null }> {
  const ref = collection(db, 'listings');

  // Простой запрос — только orderBy без composite index
  const q = query(
    ref,
    orderBy('createdAt', 'desc'),
    limit(LISTINGS_PER_PAGE * 2),
    ...(lastDoc ? [startAfter(lastDoc)] : [])
  );

  const snapshot = await getDocs(q);

  let listings: Listing[] = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Listing[];

  // Фильтрация на клиенте — composite indexes могут ещё строиться
  listings = listings.filter(l => l.status === 'active');
  if (filters.cityId) listings = listings.filter(l => l.cityId === filters.cityId);
  if (filters.categoryId) listings = listings.filter(l => l.categoryId === filters.categoryId);

  const newLastDoc = snapshot.docs.length > 0
    ? snapshot.docs[snapshot.docs.length - 1]
    : null;

  return { listings, lastDoc: newLastDoc };
}

export async function getListing(id: string): Promise<Listing | null> {
  const docRef = doc(db, 'listings', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  const data = snapshot.data() as Listing;
  try {
    if (data.status !== 'deleted') {
      await updateDoc(docRef, { viewsCount: increment(1) });
    }
  } catch { /* анонимные пользователи не могут писать */ }
  return { ...data, id: snapshot.id };
}

export async function createListing(data: CreateListingData): Promise<string> {
  const ref = collection(db, 'listings');
  const docRef = await addDoc(ref, {
    ...data,
    status: 'active',
    viewsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateListing(id: string, data: UpdateListingData): Promise<void> {
  const docRef = doc(db, 'listings', id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteListing(id: string): Promise<void> {
  const docRef = doc(db, 'listings', id);
  await updateDoc(docRef, { status: 'deleted', updatedAt: serverTimestamp() });
}

export async function getUserListings(
  userId: string,
  lastDoc?: QueryDocumentSnapshot
): Promise<{ listings: Listing[]; lastDoc: QueryDocumentSnapshot | null }> {
  const ref = collection(db, 'listings');
  const q = query(
    ref,
    where('authorId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(LISTINGS_PER_PAGE),
    ...(lastDoc ? [startAfter(lastDoc)] : [])
  );
  const snapshot = await getDocs(q);
  const listings: Listing[] = snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Listing))
    .filter(l => l.status !== 'deleted');
  const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
  return { listings, lastDoc: newLastDoc };
}

// --- Категории ---

export async function getCategories(): Promise<Category[]> {
  const snapshot = await getDocs(collection(db, 'categories'));
  return snapshot.docs
    .map((d) => ({ ...d.data(), slug: d.id } as Category))
    .filter(c => c.isActive)
    .sort((a, b) => a.order - b.order);
}

// --- Города ---

export async function getCities(): Promise<City[]> {
  const snapshot = await getDocs(collection(db, 'cities'));
  return snapshot.docs
    .map((d) => ({ ...d.data(), slug: d.id } as City))
    .filter(c => c.isActive)
    .sort((a, b) => a.order - b.order);
}
