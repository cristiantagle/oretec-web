// components/SectionWave.tsx
'use client'

export default function SectionWave({
    flip = false,
    className = '',
}: { flip?: boolean; className?: string }) {
    return (
        <div
        className={className}
        style={{
            transform: flip ? 'scaleY(-1)' : 'none',
            lineHeight: 0,
        }}
        aria-hidden
        >
        <svg
        viewBox="0 0 1440 140"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="h-[80px] w-full md:h-[120px]"
        >
        <path
        d="M0,64L48,64C96,64,192,64,288,85.3C384,107,480,149,576,149.3C672,149,768,107,864,85.3C960,64,1056,64,1152,85.3C1248,107,1344,149,1392,170.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        fill="#EEF3FF"
        />
        </svg>
        </div>
    )
}
