import './globals.css'
import type { ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HomeButton from '@/components/HomeButton'
import { Inter } from 'next/font/google'

export const metadata = {
  title: 'OreTec',
  description: 'Formación en Prevención y Seguridad Laboral',
}

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
    <body className={inter.className}>
    <Navbar />
    {children}
    <Footer />
    {/* Botón global (no se muestra en "/") */}
    <HomeButton />
    </body>
    </html>
  )
}
