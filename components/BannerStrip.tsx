/* eslint-disable @next/next/no-img-element */
"use client"

// Banner con imagen SVG de fondo + texto y botones de acción (en español).
// - Mantiene el SVG como <img> para evitar rasterización y aprovechar su escalabilidad.
// - Superpone un gradiente suave y contenido (título, subtítulo y CTAs).

import Link from "next/link"

export default function BannerStrip() {
  return (
    <div className="relative mx-auto max-w-6xl px-4">
      <div className="relative h-[200px] overflow-hidden rounded-3xl shadow-soft md:h-[240px]">
        {/* Capa 1: Imagen SVG como fondo (cubre todo) */}
        <img
          src="/images/banner-abstract.svg?v=1"
          alt=""
          role="presentation"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />

        {/* Capa 2: Gradiente sutil por encima del fondo (pero debajo del texto) */}
        <div
          aria-hidden
          className="absolute inset-0 z-[5] bg-gradient-to-r from-white/70 via-white/30 to-transparent"
        />

        {/* Capa 3: Contenido (texto + CTAs) */}
        <div className="relative z-20 flex h-full items-center">
          <div className="px-5 md:px-10">
            <p className="text-[11px] md:text-xs uppercase tracking-wide text-blue-900/70">
              Formación certificada · SENCE
            </p>
            <h2 className="mt-1 text-xl font-semibold text-blue-950 md:text-3xl">
              ¿Tienes dudas o necesitas cotización rápida?
            </h2>
            <p className="mt-1 text-sm text-blue-900/80 md:text-base">
              Resolvemos tus consultas y armamos una propuesta a medida para tu equipo.
            </p>
            <div className="mt-3 flex gap-3">
              <Link
                href="/contact"
                prefetch={false}
                className="inline-flex items-center rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 md:text-base"
              >
                Cotizar ahora
              </Link>
              <Link
                href="/courses"
                prefetch={false}
                className="inline-flex items-center rounded-lg bg-white/85 px-4 py-2 text-sm font-medium text-blue-900 backdrop-blur shadow ring-1 ring-blue-900/10 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 md:text-base"
              >
                Ver cursos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
