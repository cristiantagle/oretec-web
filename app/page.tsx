// app/page.tsx
import HeroElearn from '@/components/HeroElearn'
import LogosStrip from '@/components/LogosStrip'
import FeatureCards from '@/components/FeatureCards'
import CTASection from '@/components/CTASection'
import PromoBanner from '@/components/PromoBanner'
import Testimonials from '@/components/Testimonials'

// Nuevos
import StatsBand from '@/components/StatsBand'
import ParallaxBreak from '@/components/ParallaxBreak'
import ScrollTop from '@/components/ScrollTop'
import WhatsappFab from '@/components/WhatsappFab'

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

    {/* Separador visual suave */}
    <ParallaxBreak caption="Aprende a tu ritmo — 100% online" image="/images/hero-elearning.png?v=2" />

    {/* Testimonios */}
    <Testimonials />

    <section className="mx-auto max-w-6xl px-4 py-16">
    <CTASection />
    </section>

    {/* Utilidades flotantes */}
    <ScrollTop />
    <WhatsappFab phone="56912345678" message="Hola, quiero información sobre los cursos de OreTec." />
    </main>
  )
}
