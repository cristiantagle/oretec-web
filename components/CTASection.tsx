"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CTASection() {
    return (
        <motion.div
        id="contacto"
        className="relative overflow-hidden rounded-2xl p-10 text-center shadow-soft bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true }}
        >
        <div className="absolute inset-0 opacity-10 bg-[url('/images/pattern.svg')] bg-center bg-cover pointer-events-none" />
        <h3 className="relative text-2xl font-bold text-white">¿Necesitas cotizar para tu empresa?</h3>
        <p className="relative mt-3 text-blue-100 max-w-xl mx-auto">
        Diseñamos planes de formación a medida para cumplir con normativa y metas internas.
        </p>

        <div className="relative mt-6 flex flex-wrap justify-center gap-4">
        <Link href="/courses" className="btn-primary">Ver catálogo</Link>
        <a href="mailto:contacto@oretec.cl" className="btn-secondary bg-white/90 backdrop-blur">Escríbenos</a>
        </div>

        {/* Línea de acceso Auth */}
        <div className="relative mt-6 text-sm text-blue-100">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="underline underline-offset-2 hover:opacity-90">Ingresar</Link>
        {'  '}·{'  '}
        ¿Nuevo aquí?{' '}
        <Link href="/register" className="underline underline-offset-2 hover:opacity-90">Crear cuenta</Link>
        </div>

        {/* Accesos directos por tipo */}
        <div className="relative mt-3 flex flex-wrap justify-center gap-2">
        <Link href="/register?type=individual" className="chip bg-white/90 text-slate-800">Particular</Link>
        <Link href="/register?type=company" className="chip bg-white/90 text-slate-800">Empresa</Link>
        </div>
        </motion.div>
    )
}
