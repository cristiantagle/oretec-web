import Link from 'next/link'
import HeroElearn from '@/components/HeroElearn'
import LogosStrip from '@/components/LogosStrip'
import FeatureCards from '@/components/FeatureCards'
import CTASection from '@/components/CTASection'

export const metadata = {
  title: 'OreTec — Formación e-learning en Prevención y Seguridad Laboral',
  description: 'Cursos online en prevención y seguridad laboral, certificados y 100% e-learning.',
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
    <HeroElearn />

    <section className="mx-auto max-w-6xl px-4 py-10">
    <LogosStrip />
    </section>

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

    <section className="mx-auto max-w-6xl px-4 py-16">
    <CTASection />
    </section>
    </main>
  )
}
