import type { Metadata, Viewport } from 'next'
import { Barlow, Roboto_Mono, Saira_Condensed } from 'next/font/google'
import './globals.css'

const body = Barlow({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' })
const mono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' })
const display = Saira_Condensed({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display' })

export const metadata: Metadata = { title: 'Teremok', robots: { index: false, follow: false } }
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#07090d' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${mono.variable} ${display.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  )
}
