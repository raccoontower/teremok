import type { ReactNode } from 'react';

/**
 * Центрированный layout для auth страниц (логин, регистрация)
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
