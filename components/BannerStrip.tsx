/* eslint-disable @next/next/no-img-element */
"use client"

// Banner: usa el SVG tal cual de /public, sin parámetros para evitar cacheos raros.
export default function BannerStrip() {
  return (
    <div className="relative mx-auto max-w-6xl px-4">
      <div className="relative h-[180px] overflow-hidden rounded-3xl shadow-soft md:h-[220px]">
        <img
          src="/images/banner-abstract.svg"
          alt=""
          role="presentation"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
      </div>
    </div>
  )
}
