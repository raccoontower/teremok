import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CityProvider } from '@/contexts/CityContext';
import { Header } from '@/components/layout/Header';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Teremok — Русское сообщество в США',
    template: '%s | Teremok',
  },
  description: 'Бесплатные объявления, работа, жильё и услуги для русскоязычных в США. Найдите квартиру, работу или мастера на родном языке.',
  keywords: [
    'объявления США', 'русские в Америке', 'работа для русскоязычных',
    'жильё в США', 'услуги на русском', 'русское сообщество США',
    'бесплатные объявления', 'доска объявлений США',
  ],
  authors: [{ name: 'Teremok' }],
  creator: 'Teremok',
  metadataBase: new URL('https://teremok-app.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://teremok-app.vercel.app',
    siteName: 'Teremok',
    title: 'Teremok — Русское сообщество в США',
    description: 'Бесплатные объявления, работа, жильё и услуги для русскоязычных в США.',
    images: [{ url: '/logo.jpg', width: 1200, height: 630, alt: 'Teremok' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teremok — Русское сообщество в США',
    description: 'Бесплатные объявления, работа, жильё и услуги для русскоязычных в США.',
    images: ['/logo.jpg'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  alternates: {
    canonical: 'https://teremok-app.vercel.app',
    types: {
      'application/rss+xml': 'https://teremok-app.vercel.app/feed.xml',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
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
              <Footer />
            </CityProvider>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
