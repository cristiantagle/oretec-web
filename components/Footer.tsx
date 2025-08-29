import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="mt-16 border-t bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3">
        {/* Marca */}
        <div className="flex items-center gap-3">
        <Image
        src="/images/logo-oretec.png?v=3"
        alt="OreTec"
        width={40}
        height={40}
        priority={false}
        className="block"
        />
        <span className="font-semibold" style={{ color: '#1E3A8A' }}>
        ORETEC
        </span>
        </div>

        {/* Descripción corta */}
        <div className="text-sm text-slate-600">
        <div className="font-medium text-slate-900">Formación e-learning</div>
        <p className="mt-1">Prevención y Seguridad Laboral — Chile.</p>
        </div>

        {/* Enlaces */}
        <div className="text-sm text-slate-600">
        <div className="font-medium text-slate-900">Enlaces</div>
        <ul className="mt-1 space-y-1">
        <li>
        <Link href="/courses" className="hover:underline">Cursos</Link>
        </li>
        <li>
        <a href="mailto:contacto@oretec.cl" className="hover:underline">
        contacto@oretec.cl
        </a>
        </li>
        <li>
        <Link href="/admin" className="hover:underline">Admin</Link>
        </li>
        </ul>
        </div>
        </div>

        <div className="border-t py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} OreTec. Todos los derechos reservados.
        </div>
        </footer>
    )
}
