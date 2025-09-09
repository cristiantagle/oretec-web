/* eslint-disable @next/next/no-img-element */
"use client"

export default function BannerStrip() {
  return (
    <div className="relative mx-auto max-w-6xl px-4">
      <div className="relative h-[180px] overflow-hidden rounded-3xl shadow-soft md:h-[220px]">
        {/* Fondo SVG definitivo */}
        <img
          src="/images/banner-abstract.svg"
          alt="Fondo decorativo"
          role="presentation"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />

        {/* Overlay de textos */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
          <h2 className="text-lg font-semibold text-blue-950 drop-shadow-sm md:text-xl">
            ¿Tienes dudas o necesitas cotización rápida?
          </h2>
          <p className="mt-1 text-sm text-slate-700 md:text-base">
            Contáctanos y recibe atención inmediata de nuestro equipo.
          </p>
          <a
            href="/contact"
            className="mt-3 inline-block rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-800"
          >
            Solicitar cotización
          </a>
        </div>

        {/* Capa semitransparente para legibilidad */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
      </div>
    </div>
  )
}
