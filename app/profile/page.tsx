import { Suspense } from 'react';
import { ProfileClient } from '@/components/profile/ProfileClient';
import { FullScreenSpinner } from '@/components/ui/Spinner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Мой профиль — Teremok',
  description: 'Ваши объявления, вакансии и услуги на Teremok.',
  robots: 'noindex',
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <ProfileClient />
    </Suspense>
  );
}
