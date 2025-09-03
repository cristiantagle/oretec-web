'use client'

type Props = {
    className?: string
    title?: string
    primary?: string
    accent?: string
    skin?: string
    hair?: string
}

export default function HeroVector({
    className,
    title = 'Capacitación e-learning en prevención y seguridad laboral',
    primary = '#1E3A8A',
    accent = '#93C5FD',
    skin = '#F2D6C9',
    hair = '#2F2F2F',
}: Props) {
    return (
        <svg
        viewBox="0 0 820 560"
        role="img"
        aria-label={title}
        className={className}
        >
        <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff"/>
        <stop offset="55%" stopColor="#ffffff"/>
        <stop offset="100%" stopColor="#F0F7FF"/>
        </linearGradient>
        <linearGradient id="blob" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={accent} stopOpacity=".35"/>
        <stop offset="100%" stopColor={primary} stopOpacity=".15"/>
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="14" />
        </filter>
        </defs>

        {/* fondo */}
        <rect width="100%" height="100%" fill="url(#bg)"/>

        {/* blobs decorativos */}
        <ellipse cx="650" cy="120" rx="190" ry="90" fill="url(#blob)" filter="url(#soft)" />
        <ellipse cx="140" cy="400" rx="160" ry="80" fill="url(#blob)" filter="url(#soft)" />

        {/* escritorio */}
        <rect x="420" y="290" width="320" height="14" rx="7" fill="#E6EEF9"/>
        <rect x="475" y="304" width="12" height="70" rx="6" fill="#D7E5F6"/>
        <rect x="670" y="304" width="12" height="70" rx="6" fill="#D7E5F6"/>

        {/* monitor */}
        <rect x="460" y="170" width="260" height="150" rx="14" fill="#FFFFFF" stroke="#D8E4F6"/>
        <rect x="460" y="210" width="260" height="4" fill="#EEF4FF"/>
        <circle cx="480" cy="190" r="6" fill="#F87171"/>
        <circle cx="498" cy="190" r="6" fill="#FBBF24"/>
        <circle cx="516" cy="190" r="6" fill="#34D399"/>

        {/* contenido del monitor (tarjetas) */}
        <rect x="480" y="228" width="88" height="66" rx="10" fill="#F6FAFF" stroke="#E3EEFF"/>
        <rect x="492" y="238" width="64" height="12" rx="6" fill="#CBDCF6"/>
        <rect x="492" y="256" width="48" height="8" rx="4" fill="#E1ECFF"/>

        <rect x="580" y="228" width="120" height="66" rx="10" fill="#F6FAFF" stroke="#E3EEFF"/>
        <rect x="594" y="238" width="90" height="12" rx="6" fill="#CBDCF6"/>
        <rect x="594" y="256" width="72" height="8" rx="4" fill="#E1ECFF"/>

        {/* figura persona (estilo editorial simple) */}
        {/* torso */}
        <path d="M265 320 C275 280, 340 270, 360 312 L360 372 L260 372 Z" fill={primary} opacity=".9"/>
        {/* cabeza */}
        <circle cx="320" cy="250" r="28" fill={skin}/>
        {/* pelo */}
        <path d="M300 236 C312 220, 340 222, 344 242 C336 236, 320 236, 300 236 Z" fill={hair}/>
        {/* brazo */}
        <path d="M360 320 C380 330, 390 350, 390 365 C368 358, 360 345, 357 335 Z" fill={skin}/>
        {/* notebook */}
        <rect x="380" y="320" width="90" height="10" rx="3" fill="#C7D7EE"/>
        <rect x="392" y="288" width="120" height="40" rx="6" fill="#FFFFFF" stroke="#D8E4F6"/>
        <rect x="402" y="298" width="60" height="8" rx="4" fill="#CBDCF6"/>

        {/* base */}
        <rect x="120" y="372" width="560" height="10" rx="5" fill="#E8F1FF"/>

        {/* ondas */}
        <path d="M40,520 C180,480 260,520 400,500 C540,480 620,520 780,490 L780,560 L40,560 Z"
        fill={accent} opacity=".15"/>

        {/* borde decorativo */}
        <rect x="0.5" y="0.5" width="819" height="559" rx="18" fill="none" stroke="#EEF4FF"/>
        </svg>
    )
}
