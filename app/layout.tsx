import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = { title: 'Teremok — учёт', robots: { index: false, follow: false } }
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-dvh">
        <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur">
          <nav className="mx-auto flex max-w-3xl items-center gap-5 px-4 py-3 text-sm">
            <Link href="/" className="font-semibold tracking-tight">Teremok</Link>
            <Link href="/sites" className="text-[var(--muted)] hover:text-[var(--fg)]">Объекты</Link>
            <Link href="/schedule" className="text-[var(--muted)] hover:text-[var(--fg)]">Расписание</Link>
            <Link href="/add" className="ml-auto rounded-full bg-white px-4 py-1.5 font-medium text-black">+ Расход</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
