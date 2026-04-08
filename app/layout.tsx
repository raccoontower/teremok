import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CityProvider } from '@/contexts/CityContext';
import { Header } from '@/components/layout/Header';
import { MainNav } from '@/components/layout/MainNav';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Теремок — Объявления',
  description: 'Бесплатная доска объявлений. Продавайте, покупайте, меняйте.',
  keywords: ['объявления', 'доска объявлений', 'теремок'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-gray-50">
        <AuthProvider>
          {/* CityProvider оборачивает всё — даёт доступ к выбранному городу */}
          {/* Suspense нужен, т.к. CityProvider использует useSearchParams */}
          <Suspense>
            <CityProvider>
              <Header />
              <MainNav />
              <main className="flex-1">
                {children}
              </main>
              <footer className="border-t border-gray-200 bg-white py-6 mt-8">
                <div className="max-w-screen-lg mx-auto px-4 text-center text-sm text-gray-500">
                  © {new Date().getFullYear()} Теремок. Все права защищены.
                </div>
              </footer>
            </CityProvider>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
