import type { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { JobForm } from '@/components/jobs/JobForm';
import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Разместить вакансию — Теремок',
};

export default function NewJobPage() {
  return (
    <AuthGuard>
      <Container className="py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Разместить вакансию</h1>
        <JobForm />
      </Container>
    </AuthGuard>
  );
}
