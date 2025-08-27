import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
    {/* HERO */}
    <section className="relative overflow-hidden">
    {/* Fondo degradé */}
    <div
    className="absolute inset-0 -z-10"
    style={{
      background:
      "radial-gradient(1200px 600px at 20% 0%, #1E3A8A22 0%, transparent 60%), radial-gradient(900px 500px at 100% 0%, #1E3A8A11 0%, transparent 60%), linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 60%)",
    }}
    />
    {/* Ornamentos */}
    <div
    className="pointer-events-none absolute -top-24 -left-24 h-[35rem] w-[35rem] -z-10 rounded-full blur-3xl opacity-30"
    style={{ background: "conic-gradient(from 210deg, #1E3A8A33, transparent 50%, #1E3A8A22)" }}
    />
    <div
    className="pointer-events-none absolute -bottom-24 -right-24 h-[30rem] w-[30rem] -z-10 rounded-full blur-3xl opacity-20"
    style={{ background: "radial-gradient(50% 50% at 50% 50%, #1E3A8A22 0%, transparent 60%)" }}
    />

    <div className="mx-auto max-w-6xl px-4 py-16 lg:py-24">
    <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
    <div className="max-w-2xl">
    <span className="inline-block rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur">
    Formación 100% online · Chile
    </span>
    <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
    Capacitación en <span className="text-[#1E3A8A]">Prevención y Seguridad Laboral</span>
    </h1>
    <p className="mt-4 text-slate-600 md:text-lg">
    Programas e-learning para empresas y trabajadores: cursos actualizados, certificados y con soporte.
    </p>

    <div className="mt-6 flex flex-wrap gap-3">
    <Link
    href="/courses"
    className="rounded-xl bg-[#1E3A8A] px-5 py-3 text-sm font-medium text-white shadow hover:opacity-95"
    >
    Ver cursos
    </Link>
    <Link
    href="/dashboard/proof"
    className="rounded-xl border border-[#1E3A8A] px-5 py-3 text-sm font-medium text-[#1E3A8A] hover:bg-[#1E3A8A]/5"
    >
    Enviar comprobante
    </Link>
    <Link
    href="/admin"
    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
    Admin
    </Link>
    </div>
    </div>

    {/* Tarjeta destacada */}
    <div className="mt-10 w-full max-w-sm md:mt-0">
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="bg-gradient-to-r from-[#1E3A8A] to-[#1E3A8A]/70 px-5 py-4 text-white">
    <p className="text-sm/5 font-semibold">Novedad</p>
    <p className="text-sm/5 opacity-90">Plan e-learning empresas</p>
    </div>
    <div className="px-5 py-5">
    <ul className="grid gap-2 text-sm text-slate-700">
    <li>• Biblioteca de cursos priorizados PRL</li>
    <li>• Seguimiento y reportes</li>
    <li>• Certificados descargables</li>
    </ul>
    <Link
    href="/courses"
    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:opacity-95"
    >
    Explorar catálogo
    </Link>
    </div>
    </div>
    </div>
    </div>

    {/* logos/confianza (placeholder) */}
    <div className="mt-12 grid grid-cols-2 items-center gap-6 opacity-70 sm:grid-cols-4">
    <div className="h-8 rounded bg-slate-100" />
    <div className="h-8 rounded bg-slate-100" />
    <div className="h-8 rounded bg-slate-100" />
    <div className="h-8 rounded bg-slate-100" />
    </div>
    </div>
    </section>

    {/* BENEFICIOS */}
    <section className="mx-auto max-w-6xl px-4 py-14">
    <h2 className="text-2xl font-semibold text-slate-900">¿Por qué OreTec?</h2>
    <div className="mt-6 grid gap-4 md:grid-cols-3">
    {[
      {
        t: "100% Online",
        d: "Cursos e-learning diseñados para Chile: flexibles y accesibles.",
      },
      { t: "Certificación", d: "Constancias descargables y verificables." },
      { t: "Actualización", d: "Contenidos al día en prevención y seguridad." },
    ].map((i) => (
      <div
      key={i.t}
      className="rounded-2xl border border-slate-200 bg-white/60 p-5 backdrop-blur-sm"
      >
      <div className="text-base font-semibold text-slate-900">{i.t}</div>
      <div className="mt-1 text-sm text-slate-600">{i.d}</div>
      </div>
    ))}
    </div>
    </section>

    {/* CTA */}
    <section className="relative overflow-hidden">
    <div
    className="absolute inset-0 -z-10"
    style={{
      background:
      "linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 40%), radial-gradient(800px 400px at 100% 50%, #1E3A8A11 0%, transparent 60%)",
    }}
    />
    <div className="mx-auto max-w-6xl px-4 py-14">
    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm md:px-10 md:py-12">
    <h3 className="text-xl font-semibold text-slate-900">
    ¿Necesitas capacitar a tu equipo?
    </h3>
    <p className="mt-2 text-slate-600">
    Te ayudamos a elegir los cursos adecuados y a certificar a tu personal.
    </p>
    <div className="mt-6 flex justify-center gap-3">
    <Link
    href="/courses"
    className="rounded-xl bg-[#1E3A8A] px-5 py-3 text-sm font-medium text-white shadow hover:opacity-95"
    >
    Ver cursos
    </Link>
    <Link
    href="/dashboard/proof"
    className="rounded-xl border border-[#1E3A8A] px-5 py-3 text-sm font-medium text-[#1E3A8A] hover:bg-[#1E3A8A]/5"
    >
    Enviar comprobante
    </Link>
    </div>
    </div>
    </div>
    </section>
    </main>
  );
}
