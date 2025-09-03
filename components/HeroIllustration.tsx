// components/HeroIllustration.tsx
"use client"
import * as React from "react"

type Props = {
  className?: string
  title?: string
  primary?: string
  accent?: string
  skin?: string
  hair?: string
}

export default function HeroIllustration({
  className = "w-full h-auto",
  title = "Capacitación e-learning en prevención y seguridad laboral",
  primary = "#1E3A8A",
  accent = "#93C5FD",
  skin = "#F8D7B9",
  hair = "#0F172A",
}: Props) {
  return (
    <svg
      role="img"
      aria-labelledby="hero-title"
      viewBox="0 0 600 400"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="hero-title">{title}</title>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={accent} />
          <stop offset="1" stopColor="#E0EAFF" />
        </linearGradient>
      </defs>
      <path
        d="M80,120 C120,40 280,20 360,80 C420,120 520,110 540,190 C560,280 460,340 360,330 C230,320 60,300 80,200 Z"
        fill="url(#bg)"
        opacity="0.45"
      />
      <rect x="70" y="260" width="460" height="12" rx="6" fill="#E5E7EB" />
      <rect x="95" y="272" width="410" height="6" rx="3" fill="#CBD5E1" />
      <g transform="translate(290 180)">
        <rect x="-85" y="-55" width="170" height="110" rx="10" fill="#111827" />
        <rect x="-78" y="-48" width="156" height="86" rx="6" fill="#0B1220" />
        <rect x="-75" y="-45" width="150" height="80" rx="6" fill="#111827" />
        <rect x="-72" y="-42" width="144" height="74" rx="6" fill="#1F2937" />
        <rect x="-72" y="-42" width="144" height="74" rx="6" fill="#172554" opacity="0.85" />
        <path d="M-72,-42 L72,32 L72,-42 Z" fill="#3B82F6" opacity="0.25" />
        <rect x="-95" y="58" width="190" height="10" rx="5" fill="#9CA3AF" />
      </g>
      <g transform="translate(210 150)">
        <circle cx="0" cy="0" r="26" fill={skin} />
        <path
          d="M-28,-2 C-25,-22 -8,-34 0,-34 C14,-34 26,-22 28,-8 C22,-10 14,-6 10,-2 C4,4 -6,8 -14,6 C-22,4 -26,2 -28,-2 Z"
          fill={hair}
        />
      </g>
      <g transform="translate(210 150)">
        <path
          d="M-28,16 C-16,6 -6,6 0,6 C6,6 16,6 28,16 C32,28 34,50 32,60 L-32,60 C-34,50 -32,28 -28,16 Z"
          fill={primary}
        />
      </g>
      <path d="M190,195 C200,210 220,225 245,230" stroke={skin} strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M230,195 C240,210 260,220 285,225" stroke={skin} strokeWidth="10" strokeLinecap="round" fill="none" />
      <g transform="translate(280 190)" opacity="0.8">
        <rect x="-60" y="-20" width="60" height="10" rx="3" fill={accent} />
        <rect x="5" y="-20" width="40" height="10" rx="3" fill="#60A5FA" />
        <rect x="-60" y="-5" width="45" height="8" rx="3" fill="#93C5FD" />
        <rect x="-60" y="8" width="55" height="8" rx="3" fill="#60A5FA" />
        <rect x="0" y="8" width="38" height="8" rx="3" fill="#3B82F6" />
      </g>
      <g fill={primary} opacity="0.5">
        <circle cx="120" cy="90" r="3" />
        <circle cx="510" cy="160" r="3" />
        <circle cx="470" cy="100" r="2.5" />
      </g>
    </svg>
  )
}
