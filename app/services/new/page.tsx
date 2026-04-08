import type { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ServiceForm } from '@/components/services/ServiceForm';
import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Разместить услугу — Теремок',
};

export default function NewServicePage() {
  return (
    <AuthGuard>
      <Container className="py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Разместить услугу</h1>
        <ServiceForm />
      </Container>
    </AuthGuard>
  );
}
