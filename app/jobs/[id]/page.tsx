import type { Metadata } from 'next';
import { JobDetailClient } from '@/components/jobs/JobDetailClient';
import { getAdminDb } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';
import type { Job } from '@/types';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = getAdminDb();
    const doc = await db.collection('jobs').doc(id).get();
    if (!doc.exists) return { title: 'Вакансия не найдена' };
    const d = doc.data()!;
    return {
      title: `${d.title} — Teremok`,
      description: (d.description as string)?.slice(0, 160),
    };
  } catch { return { title: 'Вакансия — Teremok' }; }
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  let initialJob: Job | null = null;
  try {
    const db = getAdminDb();
    const doc = await db.collection('jobs').doc(id).get();
    if (doc.exists) initialJob = serializeDoc({ id: doc.id, ...doc.data() }) as unknown as Job;
  } catch { /* клиент сам загрузит */ }
  return <JobDetailClient id={id} initialJob={initialJob} />;
}
