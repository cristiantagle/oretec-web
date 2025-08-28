import './globals.css'
import type { ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HomeButton from '@/components/HomeButton'
import { Inter, Poppins } from 'next/font/google'

export const metadata = {
  title: 'OreTec',
  description: 'Formación en Prevención y Seguridad Laboral',
}

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })
const poppins = Poppins({ subsets: ['latin'], weight: ['500','600','700'], display: 'swap', variable: '--font-display' })

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
    {/* aplicamos ambas fuentes como variables; Inter por defecto */}
    <body className={`${inter.variable} ${poppins.variable}`} style={{ fontFamily: 'var(--font-inter)' }}>
    <Navbar />
    {children}
    <Footer />
    <HomeButton />
    </body>
    </html>
  )
}
