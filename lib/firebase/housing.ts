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
import type { Housing, HousingListingType, PropertyType, BedroomsCount, SectionStatus } from '@/types';
import type { User } from 'firebase/auth';

const HOUSING_PER_PAGE = 20;
const COLLECTION = 'housing';

// Фильтры для getHousingListings
export interface HousingFilters {
  cityId?: string;
  listingType?: HousingListingType;
  propertyType?: PropertyType;
  bedrooms?: BedroomsCount;
  petFriendly?: boolean;
  limit?: number;
}

/**
 * Получить список объявлений о жилье с фильтрами и пагинацией.
 * Premium объявления идут первыми, затем сортировка по дате.
 */
export async function getHousingListings(
  filters: HousingFilters = {},
  lastDoc?: QueryDocumentSnapshot
): Promise<{ listings: Housing[]; lastDoc: QueryDocumentSnapshot | null }> {
  const ref = collection(db, COLLECTION);
  const pageSize = filters.limit ?? HOUSING_PER_PAGE;

  const constraints = [
    where('status', '==', 'active' as SectionStatus),
    ...(filters.cityId ? [where('cityId', '==', filters.cityId)] : []),
    ...(filters.listingType ? [where('listingType', '==', filters.listingType)] : []),
    ...(filters.propertyType ? [where('propertyType', '==', filters.propertyType)] : []),
    ...(filters.bedrooms !== undefined ? [where('bedrooms', '==', filters.bedrooms)] : []),
    ...(filters.petFriendly !== undefined ? [where('petFriendly', '==', filters.petFriendly)] : []),
    // Premium сверху, затем по дате
    orderBy('isPremium', 'desc'),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
    ...(lastDoc ? [startAfter(lastDoc)] : []),
  ];

  const q = query(ref, ...constraints);
  const snapshot = await getDocs(q);

  const listings: Housing[] = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Housing[];

  const newLastDoc = snapshot.docs.length > 0
    ? snapshot.docs[snapshot.docs.length - 1]
    : null;

  return { listings, lastDoc: newLastDoc };
}

/**
 * Получить одно объявление о жилье по ID и увеличить счётчик просмотров.
 */
export async function getHousingListing(id: string): Promise<Housing | null> {
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data() as Housing;

  // Увеличиваем счётчик просмотров — не критично, не ломаем основной запрос
  try {
    if (data.status === 'active') {
      await updateDoc(docRef, { viewsCount: increment(1) });
    }
  } catch {
    // Анонимные пользователи не могут писать — игнорируем
  }

  return { ...data, id: snapshot.id };
}

/**
 * Создать новое объявление о жилье.
 */
export async function createHousingListing(
  data: Omit<Housing, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'isPremium' | 'status'>,
  user: User
): Promise<string> {
  const ref = collection(db, COLLECTION);

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

/**
 * Обновить объявление о жилье.
 */
export async function updateHousingListing(
  id: string,
  data: Partial<Omit<Housing, 'id' | 'createdAt' | 'authorId'>>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Мягкое удаление объявления (меняем статус на closed).
 */
export async function deleteHousingListing(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    status: 'closed' as SectionStatus,
    updatedAt: serverTimestamp(),
  });
}
