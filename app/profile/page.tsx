import type { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ProfileClient } from '@/components/profile/ProfileClient';

export const metadata: Metadata = {
  title: 'Мой профиль — Теремок',
};

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileClient />
    </AuthGuard>
  );
}
