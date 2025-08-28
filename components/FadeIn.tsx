'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export default function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
    return (
        <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay }}
        >
        {children}
        </motion.div>
    )
}
