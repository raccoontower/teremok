import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Listing, Category, City, ListingFilters, CreateListingData, UpdateListingData } from '@/types';
import { LISTINGS_PER_PAGE } from '@/lib/constants/limits';

// --- Листинги ---

/**
 * Получить список объявлений с фильтрами и пагинацией
 */
export async function getListings(
  filters: ListingFilters = {},
  lastDoc?: QueryDocumentSnapshot
): Promise<{ listings: Listing[]; lastDoc: QueryDocumentSnapshot | null }> {
  const listingsRef = collection(db, 'listings');

  // Строим запрос динамически
  const constraints = [
    where('status', '==', filters.status ?? 'active'),
    ...(filters.cityId ? [where('cityId', '==', filters.cityId)] : []),
    ...(filters.categoryId ? [where('categoryId', '==', filters.categoryId)] : []),
    orderBy('createdAt', 'desc'),
    limit(LISTINGS_PER_PAGE),
    ...(lastDoc ? [startAfter(lastDoc)] : []),
  ];

  const q = query(listingsRef, ...constraints);
  const snapshot = await getDocs(q);

  const listings: Listing[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Listing[];

  const newLastDoc = snapshot.docs.length > 0
    ? snapshot.docs[snapshot.docs.length - 1]
    : null;

  return { listings, lastDoc: newLastDoc };
}

/**
 * Получить одно объявление по ID и увеличить счётчик просмотров
 */
export async function getListing(id: string): Promise<Listing | null> {
  const docRef = doc(db, 'listings', id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data() as Listing;

  // Увеличиваем счётчик просмотров только для неудалённых объявлений
  if (data.status !== 'deleted') {
    await updateDoc(docRef, { viewsCount: increment(1) });
  }

  return { ...data, id: snapshot.id };
}

/**
 * Создать новое объявление
 */
export async function createListing(data: CreateListingData): Promise<string> {
  const listingsRef = collection(db, 'listings');

  const docRef = await addDoc(listingsRef, {
    ...data,
    status: 'active',
    viewsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Обновить объявление
 */
export async function updateListing(id: string, data: UpdateListingData): Promise<void> {
  const docRef = doc(db, 'listings', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Мягкое удаление объявления (меняем статус на deleted)
 */
export async function deleteListing(id: string): Promise<void> {
  const docRef = doc(db, 'listings', id);
  await updateDoc(docRef, {
    status: 'deleted',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Получить объявления конкретного пользователя
 */
export async function getUserListings(
  userId: string,
  lastDoc?: QueryDocumentSnapshot
): Promise<{ listings: Listing[]; lastDoc: QueryDocumentSnapshot | null }> {
  const listingsRef = collection(db, 'listings');

  const constraints = [
    where('authorId', '==', userId),
    where('status', '!=', 'deleted'),
    orderBy('status'),
    orderBy('createdAt', 'desc'),
    limit(LISTINGS_PER_PAGE),
    ...(lastDoc ? [startAfter(lastDoc)] : []),
  ];

  const q = query(listingsRef, ...constraints);
  const snapshot = await getDocs(q);

  const listings: Listing[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Listing[];

  const newLastDoc = snapshot.docs.length > 0
    ? snapshot.docs[snapshot.docs.length - 1]
    : null;

  return { listings, lastDoc: newLastDoc };
}

// --- Категории ---

/**
 * Получить все активные категории, отсортированные по порядку
 */
export async function getCategories(): Promise<Category[]> {
  const categoriesRef = collection(db, 'categories');
  const q = query(
    categoriesRef,
    where('isActive', '==', true),
    orderBy('order', 'asc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    slug: doc.id,
  })) as Category[];
}

// --- Города ---

/**
 * Получить все активные города, отсортированные по порядку
 */
export async function getCities(): Promise<City[]> {
  const citiesRef = collection(db, 'cities');
  const q = query(
    citiesRef,
    where('isActive', '==', true),
    orderBy('order', 'asc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    slug: doc.id,
  })) as City[];
}
