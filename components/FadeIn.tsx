'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

type Props = {
    children: ReactNode
    delay?: number
    duration?: number
    y?: number
}

export default function FadeIn({
    children,
    delay = 0,
    duration = 0.5,
    y = 20,
}: Props) {
    return (
        <motion.div
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration, ease: 'easeOut', delay }}
        >
        {children}
        </motion.div>
    )
}
