import type { Metadata } from 'next';
import { HousingDetailClient } from '@/components/housing/HousingDetailClient';
import { getAdminDb } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';
import type { Housing } from '@/types';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = getAdminDb();
    const doc = await db.collection('housing').doc(id).get();
    if (!doc.exists) return { title: 'Объявление не найдено' };
    const d = doc.data()!;
    return {
      title: `${d.title} — Teremok`,
      description: (d.description as string)?.slice(0, 160),
    };
  } catch { return { title: 'Жильё — Teremok' }; }
}

export default async function HousingDetailPage({ params }: Props) {
  const { id } = await params;
  let initialListing: Housing | null = null;
  try {
    const db = getAdminDb();
    const doc = await db.collection('housing').doc(id).get();
    if (doc.exists) initialListing = serializeDoc({ id: doc.id, ...doc.data() }) as unknown as Housing;
  } catch { /* клиент сам загрузит */ }
  return <HousingDetailClient id={id} initialListing={initialListing} />;
}
