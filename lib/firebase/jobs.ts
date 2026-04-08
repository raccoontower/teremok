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
import type { Job, JobCategory, JobType, SectionStatus } from '@/types';
import type { User } from 'firebase/auth';

const JOBS_PER_PAGE = 20;
const COLLECTION = 'jobs';

// Фильтры для getJobs
export interface JobFilters {
  cityId?: string;
  category?: JobCategory;
  jobType?: JobType;
  limit?: number;
}

/**
 * Получить список вакансий с фильтрами и пагинацией.
 * Premium вакансии идут первыми, затем сортировка по дате.
 */
export async function getJobs(
  filters: JobFilters = {},
  lastDoc?: QueryDocumentSnapshot
): Promise<{ jobs: Job[]; lastDoc: QueryDocumentSnapshot | null }> {
  const ref = collection(db, COLLECTION);
  const pageSize = filters.limit ?? JOBS_PER_PAGE;

  const constraints = [
    where('status', '==', 'active' as SectionStatus),
    ...(filters.cityId ? [where('cityId', '==', filters.cityId)] : []),
    ...(filters.category ? [where('category', '==', filters.category)] : []),
    ...(filters.jobType ? [where('jobType', '==', filters.jobType)] : []),
    // Premium сверху, затем по дате создания
    orderBy('isPremium', 'desc'),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
    ...(lastDoc ? [startAfter(lastDoc)] : []),
  ];

  const q = query(ref, ...constraints);
  const snapshot = await getDocs(q);

  const jobs: Job[] = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Job[];

  const newLastDoc = snapshot.docs.length > 0
    ? snapshot.docs[snapshot.docs.length - 1]
    : null;

  return { jobs, lastDoc: newLastDoc };
}

/**
 * Получить одну вакансию по ID и увеличить счётчик просмотров.
 */
export async function getJob(id: string): Promise<Job | null> {
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data() as Job;

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
 * Создать новую вакансию.
 */
export async function createJob(
  data: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'isPremium' | 'status'>,
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
 * Обновить вакансию.
 */
export async function updateJob(
  id: string,
  data: Partial<Omit<Job, 'id' | 'createdAt' | 'authorId'>>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Мягкое удаление вакансии (меняем статус на closed).
 */
export async function deleteJob(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    status: 'closed' as SectionStatus,
    updatedAt: serverTimestamp(),
  });
}
