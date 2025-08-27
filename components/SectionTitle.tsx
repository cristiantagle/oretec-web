import { ReactNode } from 'react'

export default function SectionTitle({ children, subtitle }: { children: ReactNode; subtitle?: ReactNode }) {
    return (
        <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">{children}</h2>
        {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
        </div>
    )
}
