// components/GlowBreak.tsx
'use client'

export default function GlowBreak() {
    return (
        <div className="relative isolate">
        <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
            background:
            'radial-gradient(600px 200px at 50% -50px, rgba(30,58,138,0.12), transparent 60%)',
        }}
        />
        <div className="pointer-events-none absolute inset-0 -z-10"
        style={{
            background:
            'radial-gradient(300px 140px at 15% 0%, rgba(99,102,241,0.08), transparent 60%), radial-gradient(300px 140px at 85% 0%, rgba(59,130,246,0.10), transparent 60%)',
        }}
        />
        </div>
    )
}
