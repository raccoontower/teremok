import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, orderBy, limit, startAfter, serverTimestamp, increment,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Job, JobCategory, JobListingType, JobType, SectionStatus } from '@/types';
import type { User } from 'firebase/auth';
import { withTimeout } from '@/lib/firebase/utils';

const JOBS_PER_PAGE = 20;

export interface JobFilters {
  cityId?: string;
  category?: JobCategory;
  jobType?: JobType;
  listingType?: JobListingType;
  limit?: number;
}

export async function getJobs(
  filters: JobFilters = {},
  lastDoc?: QueryDocumentSnapshot
): Promise<{ jobs: Job[]; lastDoc: QueryDocumentSnapshot | null }> {
  const ref = collection(db, 'jobs');
  const q = query(
    ref,
    orderBy('createdAt', 'desc'),
    limit((filters.limit ?? JOBS_PER_PAGE) * 2),
    ...(lastDoc ? [startAfter(lastDoc)] : [])
  );
  const snapshot = await withTimeout(getDocs(q));

  let jobs: Job[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Job[];
  // Фильтрация на клиенте
  jobs = jobs.filter(j => j.status === 'active');
  if (filters.cityId) jobs = jobs.filter(j => j.cityId === filters.cityId);
  if (filters.category) jobs = jobs.filter(j => j.category === filters.category);
  if (filters.jobType) jobs = jobs.filter(j => j.jobType === filters.jobType);
  if (filters.listingType) jobs = jobs.filter(j => j.listingType === filters.listingType);

  const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
  return { jobs, lastDoc: newLastDoc };
}

export async function getJob(id: string): Promise<Job | null> {
  const docRef = doc(db, 'jobs', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  const data = snapshot.data() as Job;
  try {
    if (data.status === 'active') await updateDoc(docRef, { viewsCount: increment(1) });
  } catch { /* ignore */ }
  return { ...data, id: snapshot.id };
}

export async function createJob(
  data: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'isPremium' | 'status'>,
  user: User
): Promise<string> {
  const ref = collection(db, 'jobs');
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

export async function updateJob(id: string, data: Partial<Omit<Job, 'id' | 'createdAt' | 'authorId'>>): Promise<void> {
  await updateDoc(doc(db, 'jobs', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteJob(id: string): Promise<void> {
  await updateDoc(doc(db, 'jobs', id), { status: 'closed' as SectionStatus, updatedAt: serverTimestamp() });
}
