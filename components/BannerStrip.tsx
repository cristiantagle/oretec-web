/* eslint-disable @next/next/no-img-element */
"use client"

export default function BannerStrip() {
  return (
    <div className="relative mx-auto max-w-6xl px-4">
      <div className="relative h-[180px] overflow-hidden rounded-3xl shadow-soft md:h-[220px]">
        {/* SVG local escalable y ligero */}
        <img
          src="/images/banner-abstract.svg"
          alt=""
          role="presentation"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  )
}
