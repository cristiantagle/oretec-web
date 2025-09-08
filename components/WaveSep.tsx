"use client"

import { motion } from 'framer-motion'

export default function WaveSep() {
    return (
        <motion.div
        className="relative w-full overflow-hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{
            type: 'spring',
            stiffness: 50,
            damping: 12,
            delay: 0.2,
        }}
        >
        <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        className="absolute bottom-0 left-0 w-full h-[120px] sm:h-[160px]"
        animate={{ y: [0, -3, 0] }}
        transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
        }}
        >
        <defs>
        <linearGradient id="waveGradient" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
        </linearGradient>
        </defs>
        <path
        fill="url(#waveGradient)"
        d="M0,160L1440,96L1440,0L0,0Z"
        ></path>
        </motion.svg>
        </motion.div>
    )
}
