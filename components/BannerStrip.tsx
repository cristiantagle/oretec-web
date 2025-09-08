"use client";

import Image from "next/image";

export default function BannerStrip() {
    return (
        <div className="relative mx-auto max-w-6xl px-4">
        <div className="relative h-[180px] overflow-hidden rounded-3xl shadow-soft md:h-[220px]">
        {/* SVG escalable: se adapta a cualquier ancho */}
        <Image
        src="/images/banner-abstract.svg?v=1"
        alt=""
        role="presentation"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 960px"
        className="object-cover"
        />
        </div>
        </div>
    );
}
