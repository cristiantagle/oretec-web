import './globals.css'
import type { ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollTop from '@/components/ScrollTop'
import { Inter, Poppins } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata = {
  title: 'OreTec',
  description: 'Formación en Prevención y Seguridad Laboral',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // Inline script para evitar FOUC: setea data-theme lo antes posible
  const themeInit = `
  (function(){
    try {
      var ls = localStorage.getItem('theme');
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var t = (ls === 'dark' || ls === 'light') ? ls : (prefersDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', t);
    } catch(e) {}
  })();`

  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
    <head>
    <script dangerouslySetInnerHTML={{ __html: themeInit }} />
    </head>
    <body className="font-sans bg-[var(--bg)] text-[var(--text)]">
    <Navbar />
    <main>{children}</main>
    <Footer />
    <ScrollTop />
    </body>
    </html>
  )
}
