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
import type { Service, ServiceCategory, ServiceArea, SectionStatus } from '@/types';
import type { User } from 'firebase/auth';

const SERVICES_PER_PAGE = 20;
const COLLECTION = 'services';

// Фильтры для getServices
export interface ServiceFilters {
  cityId?: string;
  category?: ServiceCategory;
  serviceArea?: ServiceArea;
  limit?: number;
}

/**
 * Получить список услуг с фильтрами и пагинацией.
 * Premium услуги идут первыми, затем сортировка по дате.
 */
export async function getServices(
  filters: ServiceFilters = {},
  lastDoc?: QueryDocumentSnapshot
): Promise<{ services: Service[]; lastDoc: QueryDocumentSnapshot | null }> {
  const ref = collection(db, COLLECTION);
  const pageSize = filters.limit ?? SERVICES_PER_PAGE;

  const constraints = [
    where('status', '==', 'active' as SectionStatus),
    ...(filters.cityId ? [where('cityId', '==', filters.cityId)] : []),
    ...(filters.category ? [where('category', '==', filters.category)] : []),
    ...(filters.serviceArea ? [where('serviceArea', '==', filters.serviceArea)] : []),
    // Premium сверху, затем по дате
    // orderBy('isPremium', 'desc'), // включить после монетизации
    orderBy('createdAt', 'desc'),
    limit(pageSize),
    ...(lastDoc ? [startAfter(lastDoc)] : []),
  ];

  const q = query(ref, ...constraints);
  const snapshot = await getDocs(q);

  const services: Service[] = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Service[];

  const newLastDoc = snapshot.docs.length > 0
    ? snapshot.docs[snapshot.docs.length - 1]
    : null;

  return { services, lastDoc: newLastDoc };
}

/**
 * Получить одну услугу по ID и увеличить счётчик просмотров.
 */
export async function getService(id: string): Promise<Service | null> {
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data() as Service;

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
 * Создать новую услугу.
 */
export async function createService(
  data: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'isPremium' | 'status'>,
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
 * Обновить услугу.
 */
export async function updateService(
  id: string,
  data: Partial<Omit<Service, 'id' | 'createdAt' | 'authorId'>>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Мягкое удаление услуги (меняем статус на closed).
 */
export async function deleteService(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    status: 'closed' as SectionStatus,
    updatedAt: serverTimestamp(),
  });
}
