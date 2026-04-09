import type { Metadata } from 'next';
import { ListingDetailClient } from '@/components/listings/ListingDetailClient';
import { getAdminDb } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';
import type { Listing } from '@/types';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = getAdminDb();
    const doc = await db.collection('listings').doc(id).get();
    if (!doc.exists) return { title: 'Объявление не найдено' };
    const d = doc.data()!;
    return {
      title: `${d.title} — Teremok`,
      description: (d.description as string)?.slice(0, 160),
      openGraph: { title: d.title as string, description: (d.description as string)?.slice(0, 160), images: d.photos?.[0] ? [d.photos[0]] : [] },
    };
  } catch { return { title: 'Объявление — Teremok' }; }
}

export default async function ListingPage({ params }: Props) {
  const { id } = await params;
  let initialListing: Listing | null = null;
  try {
    const db = getAdminDb();
    const doc = await db.collection('listings').doc(id).get();
    if (doc.exists) initialListing = serializeDoc({ id: doc.id, ...doc.data() }) as unknown as Listing;
  } catch { /* клиент сам загрузит */ }
  return <ListingDetailClient id={id} initialListing={initialListing} />;
}
