import type { Metadata } from 'next';
import { ListingsClientPage } from '@/components/listings/ListingsClientPage';

export const metadata: Metadata = {
  title: 'Объявления — Теремок',
  description: 'Все объявления на доске Теремок',
};

export default function ListingsPage() {
  return <ListingsClientPage />;
}
