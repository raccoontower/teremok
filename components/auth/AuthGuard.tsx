'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { FullScreenSpinner } from '@/components/ui/Spinner';
import { ROUTES } from '@/lib/constants/routes';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Защищённый wrapper: если пользователь не авторизован — редиректит на /login.
 * Пока идёт проверка auth state — показывает спиннер.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(ROUTES.login);
    }
  }, [user, loading, router]);

  if (loading) return <FullScreenSpinner />;
  if (!user) return null;

  return <>{children}</>;
}
