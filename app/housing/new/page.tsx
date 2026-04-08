import type { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { HousingForm } from '@/components/housing/HousingForm';
import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Разместить объявление о жилье — Теремок',
};

export default function NewHousingPage() {
  return (
    <AuthGuard>
      <Container className="py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Разместить объявление о жилье</h1>
        <HousingForm />
      </Container>
    </AuthGuard>
  );
}
