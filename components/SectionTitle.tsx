"use client"

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export default function SectionTitle({
    children,
    subtitle,
}: {
    children: ReactNode
    subtitle?: ReactNode
}) {
    return (
        <div className="mb-12 text-center">
        <motion.h2
        className="relative inline-block text-3xl font-bold tracking-tight text-slate-900"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true }}
        >
        {children}

        {/* Línea decorativa con gradiente animado */}
        <motion.span
        className="mt-3 block h-1 w-24 rounded-full mx-auto bg-gradient-to-r from-blue-700 via-indigo-500 to-blue-700 bg-[length:200%_100%]"
        initial={{ backgroundPosition: '100% 0', scaleX: 0 }}
        whileInView={{ backgroundPosition: '0% 0', scaleX: 1 }}
        transition={{
            duration: 0.8,
            delay: 0.3,
            ease: 'easeOut',
        }}
        viewport={{ once: true }}
        style={{ transformOrigin: 'center' }}
        />
        </motion.h2>

        {subtitle && (
            <motion.p
            className="mt-3 text-slate-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            viewport={{ once: true }}
            >
            {subtitle}
            </motion.p>
        )}
        </div>
    )
}
