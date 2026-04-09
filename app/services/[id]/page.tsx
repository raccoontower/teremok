import type { Metadata } from 'next';
import { ServiceDetailClient } from '@/components/services/ServiceDetailClient';
import { getAdminDb } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';
import type { Service } from '@/types';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = getAdminDb();
    const doc = await db.collection('services').doc(id).get();
    if (!doc.exists) return { title: 'Услуга не найдена' };
    const d = doc.data()!;
    return {
      title: `${d.title} — Teremok`,
      description: (d.description as string)?.slice(0, 160),
    };
  } catch { return { title: 'Услуга — Teremok' }; }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params;
  let initialService: Service | null = null;
  try {
    const db = getAdminDb();
    const doc = await db.collection('services').doc(id).get();
    if (doc.exists) initialService = serializeDoc({ id: doc.id, ...doc.data() }) as unknown as Service;
  } catch { /* клиент сам загрузит */ }
  return <ServiceDetailClient id={id} initialService={initialService} />;
}
