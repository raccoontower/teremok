import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CityProvider } from '@/contexts/CityContext';
import { Header } from '@/components/layout/Header';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components/layout/Footer';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Teremok — Ваш дом в США',
    template: '%s | Teremok',
  },
  description: 'Бесплатные объявления, работа, жильё и услуги для русскоязычных в США. Найдите квартиру, работу или мастера на родном языке.',
  keywords: [
    'объявления США', 'русские в Америке', 'работа для русскоязычных',
    'жильё в США', 'услуги на русском', 'сообщество русскоязычных США',
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
    title: 'Teremok — Ваш дом в США',
    description: 'Бесплатные объявления, работа, жильё и услуги для русскоязычных в США.',
    images: [{ url: '/logo.jpg', width: 1200, height: 630, alt: 'Teremok' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teremok — Ваш дом в США',
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

        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K5JC947NR3"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-K5JC947NR3',{page_path:window.location.pathname});`}
        </Script>

        {/* Vercel Speed Insights + Analytics */}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
