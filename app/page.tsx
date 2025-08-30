// app/page.tsx
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

// Añadidos visuales (nuevos)
import SectionWave from '@/components/SectionWave'
import TiltCard from '@/components/TiltCard'
import GlowBreak from '@/components/GlowBreak'

export const metadata = {
  title: 'OreTec — Formación e-learning en Prevención y Seguridad Laboral',
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

    {/* Métricas animadas */}
    <StatsBand />

    {/* Corte suave hacia la sección con gradiente */}
    <SectionWave />

    <section className="relative">
    <div className="absolute inset-0 -z-10 bg-oret-gradient" />
    <div className="mx-auto max-w-6xl px-4 py-16">
    <div className="mb-8 text-center">
    <h2 className="text-2xl font-semibold text-slate-900">¿Por qué elegir OreTec?</h2>
    <p className="mt-2 text-slate-600">
    Plataforma e-learning enfocada en seguridad y prevención laboral en Chile.
    </p>
    </div>
    <FeatureCards />
    </div>
    </section>

    {/* Cierre del bloque con gradiente */}
    <SectionWave flip />

    {/* Separador visual: banner SVG abstracto sin texto */}
    <div className="py-6">
    <BannerStrip />
    </div>

    {/* Brillo sutil antes de testimonios */}
    <GlowBreak />

    {/* Testimonios */}
    <Testimonials />

    <section className="mx-auto max-w-6xl px-4 py-16">
    {/* CTA con tilt sutil */}
    <TiltCard>
    <CTASection />
    </TiltCard>
    </section>

    {/* Utilidades flotantes */}
    <ScrollTop />
    <WhatsappFab phone="56912345678" message="Hola, quiero información sobre los cursos de OreTec." />
    </main>
  )
}
