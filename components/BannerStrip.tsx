/* eslint-disable @next/next/no-img-element */
"use client"

export default function BannerStrip() {
  return (
    <div className="relative mx-auto max-w-6xl px-4">
      <div className="relative h-[180px] overflow-hidden rounded-3xl shadow-soft md:h-[220px]">
        {/* Fondo SVG local (no se pixela) */}
        <img
          src="/images/banner-abstract.svg"
          alt="Fondo abstracto"
          role="presentation"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />

        {/* Overlay de textos y CTA */}
        <div className="relative z-10 flex h-full items-center">
          <div className="mx-6 max-w-[75%] rounded-xl bg-white/65 px-4 py-3 backdrop-blur md:mx-8 md:max-w-[60%] md:px-6 md:py-4">
            <h2 className="text-base font-semibold leading-tight text-blue-950 md:text-lg">
              ¿Tienes dudas o necesitas cotización rápida?
            </h2>
            <p className="mt-1 text-xs text-slate-700 md:text-sm">
              Escríbenos y te respondemos a la brevedad. También podemos ayudarte a elegir el curso ideal para tu equipo.
            </p>
            <div className="mt-2">
              <a
                href="/contact"
                className="inline-flex items-center rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 md:text-sm"
              >
                Cotizar ahora
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
