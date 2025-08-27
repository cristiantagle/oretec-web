import './globals.css'
import HomeButton from '@/components/HomeButton'

export const metadata = {
  title: 'OreTec',
  description: 'Formación en Prevención y Seguridad Laboral',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
    <body>
    {children}
    {/* Botón global (no se muestra en "/") */}
    <HomeButton />
    </body>
    </html>
  )
}
