// app/layout.tsx
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
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable}`}>
    <body className="bg-white text-slate-900 font-sans">
    <Navbar />
    <main>{children}</main>
    <Footer />
    <ScrollTop />
    </body>
    </html>
  )
}
