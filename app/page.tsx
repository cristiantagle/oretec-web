// app/page.tsx
import Link from 'next/link'
import HeroElearn from '@/components/HeroElearn'
import LogosStrip from '@/components/LogosStrip'
import FeatureCards from '@/components/FeatureCards'
import CTASection from '@/components/CTASection'
import PromoBanner from '@/components/PromoBanner'
import Testimonials from '@/components/Testimonials'

// Nuevos / utilidades
import StatsBand from '@/components/StatsBand'
import ScrollTop from '@/components/ScrollTop'
import WhatsappFab from '@/components/WhatsappFab'

// Banner SVG (nuevo)
import BannerStrip from '@/components/BannerStrip'

// Añadidos visuales
import SectionWave from '@/components/SectionWave'
import TiltCard from '@/components/TiltCard'
import GlowBreak from '@/components/GlowBreak'

// Títulos unificados
import SectionTitle from '@/components/SectionTitle'

export const metadata = {
  title: 'OreTec - Formación e-learning en Prevención y Seguridad Laboral',
  description: 'Cursos online en prevención y seguridad laboral, certificados y 100% e-learning.',
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
    {/* Banner superior (cerrable) */}
    <PromoBanner />

    <HeroElearn />

    <section className="mx-auto max-w-6xl px-4 py-10">
    <LogosStrip />
    </section>

    {/* Mini-banda Auth (nuevo) */}
    <section className="mx-auto max-w-6xl px-4">
    <div className="card shadow-soft p-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
    <h3 className="text-base font-semibold text-slate-900">Accede a tu cuenta</h3>
    <p className="mt-1 text-sm text-slate-600">Compra cursos, revisa tu progreso y descarga certificados.</p>
    </div>
    <div className="flex flex-wrap gap-2">
    <Link href="/login" className="btn-secondary">Ingresar</Link>
    <Link href="/register" className="btn-primary">Crear cuenta</Link>
    <Link href="/register?type=individual" className="chip">Particular</Link>
    <Link href="/register?type=company" className="chip">Empresa</Link>
    </div>
    </div>
    </div>
    </section>

    {/* Métricas animadas */}
    <StatsBand />

    {/* Corte suave hacia la sección con gradiente */}
    <SectionWave />

    <section className="relative">
    <div className="absolute inset-0 -z-10 bg-oret-gradient" />
    <div className="mx-auto max-w-6xl px-4 py-16">
    <SectionTitle subtitle="Plataforma e-learning enfocada en seguridad y prevención laboral en Chile.">
    ¿Por qué elegir OreTec?
    </SectionTitle>
    <FeatureCards />
    </div>
    </section>

    {/* Cierre del bloque con gradiente */}
    <SectionWave flip />

    {/* Separador visual: banner SVG abstracto sin texto */}
    <div className="py-6">
    <BannerStrip />
    </div>

    {/* Mini-CTA hacia Contacto (nuevo) */}
    <section className="mx-auto max-w-6xl px-4">
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
    <h3 className="text-base font-semibold text-slate-900">
    ¿Tienes dudas o necesitas una cotización rápida?
    </h3>
    <p className="mt-1 text-sm text-slate-600">
    Conversemos y armamos el plan de formación que necesitas.
    </p>
    </div>
    <div className="flex gap-2">
    <Link href="/contact" className="btn-primary">Ir a Contacto</Link>
    <a href="mailto:contacto@oretec.cl" className="btn-secondary">Escríbenos</a>
    </div>
    </div>
    </div>
    </section>

    {/* Brillo sutil antes de testimonios */}
    <GlowBreak />

    {/* Testimonios */}
    <section className="mx-auto max-w-6xl px-4 py-16">
    <SectionTitle subtitle="Empresas y profesionales que ya capacitan con OreTec.">
    Qué dicen nuestros clientes
    </SectionTitle>
    <Testimonials />
    </section>

    <section className="mx-auto max-w-6xl px-4 py-16">
    {/* CTA con tilt sutil */}
    <TiltCard>
    <CTASection />
    </TiltCard>
    </section>

    {/* Utilidades flotantes */}
    <ScrollTop />
    <WhatsappFab
    phone="56912345678"
    message="Hola, quiero información sobre los cursos de OreTec."
    />
    </main>
  )
}
