import type { Metadata } from 'next';
import { ListingsClientPage } from '@/components/listings/ListingsClientPage';
import { getAdminDb } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';
import type { Listing } from '@/types';

export const metadata: Metadata = {
  title: 'Объявления — Teremok',
  description: 'Бесплатная доска объявлений для русскоязычных в США. Купля-продажа, авто, электроника и другие товары.',
};

interface Props { searchParams: Promise<{ city?: string; category?: string }> }

export default async function ListingsPage({ searchParams }: Props) {
  const { city, category } = await searchParams;
  let initialListings: Listing[] = [];
  try {
    const db = getAdminDb();
    const snap = await db.collection('listings').orderBy('createdAt', 'desc').limit(40).get();
    let docs = snap.docs.map((d) => serializeDoc({ id: d.id, ...d.data() }));
    docs = docs.filter((d) => d.status === 'active');
    if (city) docs = docs.filter((d) => d.cityId === city);
    if (category) docs = docs.filter((d) => d.categoryId === category);
    initialListings = docs as unknown as Listing[];
  } catch { /* клиент сам загрузит */ }
  return <ListingsClientPage initialListings={initialListings} />;
}
