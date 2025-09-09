/* eslint-disable @next/next/no-img-element */
"use client"

export default function BannerStrip() {
  return (
    <div className="relative mx-auto max-w-6xl px-4">
      <div className="relative h-[220px] overflow-hidden rounded-3xl shadow-soft md:h-[260px]">
        {/* Fondo SVG local correcto */}
        <img
          src="/images/banner-abstract.svg"
          alt="Fondo abstracto"
          role="presentation"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />

        {/* Panel principal centrado */}
        <div className="relative z-10 flex h-full items-center justify-center px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white/70 px-6 py-5 text-center backdrop-blur md:px-8 md:py-6">
            <h2 className="text-lg font-semibold text-blue-950 md:text-xl">
              ¿Tienes dudas o necesitas cotización rápida?
            </h2>
            <p className="mt-1 text-sm text-slate-700">
              Contáctanos y recibe atención inmediata de nuestro equipo.
            </p>
            <div className="mt-3 flex justify-center">
              <a
                href="/contact"
                className="inline-flex items-center rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300">
                Solicitar cotización
              </a>
            </div>
          </div>
        </div>

        {/* UNA sola tarjeta inferior (no duplicar) */}
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 md:inset-x-8">
          <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-2xl bg-white/85 p-3 shadow backdrop-blur">
            <div>
              <p className="text-sm font-medium text-blue-950">
                ¿Tienes dudas o necesitas una cotización rápida?
              </p>
              <p className="text-xs text-slate-600">
                Conversemos y armamos el plan de formación que necesitas.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href="/contact"
                className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800">
                Ir a Contacto
              </a>
              <a
                href="/contact#whatsapp"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50">
                Escríbenos
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
