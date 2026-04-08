import type { Metadata } from 'next';
import { ListingDetailClient } from '@/components/listings/ListingDetailClient';

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Объявление — Теремок',
};

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  return <ListingDetailClient id={id} />;
}
