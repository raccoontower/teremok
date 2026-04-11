import { AdminClient } from '@/components/admin/AdminClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Админ-панель — Teremok',
  robots: 'noindex, nofollow',
};

export default function AdminPage() {
  return <AdminClient />;
}
