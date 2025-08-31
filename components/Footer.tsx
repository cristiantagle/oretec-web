'use client'
import Image from 'next/image'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'

export default function Footer() {
    return (
        <footer className="mt-20 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-300">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-4">
        {/* Marca */}
        <FadeIn>
        <div>
        <div className="flex items-center gap-3">
        <Image
        src="/images/logo-oretec.png"
        alt="OreTec"
        width={40}
        height={40}
        className="rounded-md bg-white p-1"
        priority
        />
        <span className="font-semibold text-white">ORETEC</span>
        </div>
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
        Formación e-learning en prevención y seguridad laboral — Chile.
        </p>
        </div>
        </FadeIn>

        {/* Enlaces */}
        <FadeIn delay={0.05}>
        <div className="text-sm">
        <div className="font-semibold text-white">Enlaces</div>
        <ul className="mt-3 space-y-2">
        <li><Link href="/courses" className="link-anim text-slate-300 hover:text-white">Cursos</Link></li>
        <li><Link href="/#contacto" className="link-anim text-slate-300 hover:text-white">Contacto</Link></li>
        <li><Link href="/admin" className="link-anim text-slate-300 hover:text-white">Admin</Link></li>
        </ul>
        </div>
        </FadeIn>

        {/* Contacto */}
        <FadeIn delay={0.1}>
        <div className="text-sm">
        <div className="font-semibold text-white">Contacto</div>
        <ul className="mt-3 space-y-2">
        <li>
        <a href="mailto:contacto@oretec.cl" className="link-anim text-slate-300 hover:text-white">
        contacto@oretec.cl
        </a>
        </li>
        </ul>
        </div>
        </FadeIn>

        {/* Síguenos */}
        <FadeIn delay={0.15}>
        <div className="text-sm">
        <div className="font-semibold text-white">Síguenos</div>
        <div className="mt-4 flex items-center gap-3">
        <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-btn bg-slate-800 border-slate-700 hover:bg-blue-700 hover:text-white">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0 8.98h5V24H0zM8.98 8.98H14v2.05h.08c.7-1.32 2.4-2.71 4.94-2.71C23.6 8.32 24 12 24 16.44V24h-5v-6.6c0-1.57-.03-3.59-2.19-3.59-2.19 0-2.53 1.71-2.53 3.47V24h-5z"/></svg>
        </a>
        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-btn bg-slate-800 border-slate-700 hover:bg-pink-600 hover:text-white">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10zm-5 3.5A5.5 5.5 0 1 0 17.5 13 5.51 5.51 0 0 0 12 7.5zm0 2A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5zm5.25-2.75a1.25 1.25 0 1 0 1.25 1.25 1.25 1.25 0 0 0-1.25-1.25z"/></svg>
        </a>
        <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-btn bg-slate-800 border-slate-700 hover:bg-blue-600 hover:text-white">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 5 3.66 9.15 8.44 9.93v-7.03H7.9v-2.9h2.54v-2.2c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.85h2.78l-.44 2.9h-2.34V22c4.78-.78 8.44-4.93 8.44-9.93z"/></svg>
        </a>
        </div>
        </div>
        </FadeIn>
        </div>

        <FadeIn delay={0.2}>
        <div className="border-t border-slate-700 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} OreTec. Todos los derechos reservados.
        </div>
        </FadeIn>
        </footer>
    )
}
