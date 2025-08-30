'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export default function SectionTitle({ children, subtitle }: { children: ReactNode; subtitle?: ReactNode }) {
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
        {/* Línea decorativa con animación */}
        <motion.span
        className="mt-2 block h-1 w-20 rounded-full bg-gradient-to-r from-blue-700 to-indigo-500 mx-auto"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
        viewport={{ once: true }}
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
