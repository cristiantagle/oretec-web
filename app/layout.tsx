import './globals.css'
import type { ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'OreTec',
  description: 'Formación en Prevención y Seguridad Laboral',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
    <body className="bg-white text-slate-900">
    <Navbar />
    <main>{children}</main>
    <Footer />
    </body>
    </html>
  )
}
