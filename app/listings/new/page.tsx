import type { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ListingForm } from '@/components/listings/ListingForm';
import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Новое объявление — Теремок',
};

export default function NewListingPage() {
  return (
    <AuthGuard>
      <Container className="py-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Подать объявление</h1>
        <ListingForm />
      </Container>
    </AuthGuard>
  );
}
