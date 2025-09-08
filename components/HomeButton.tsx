"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HomeButton() {
    const pathname = usePathname();
    if (pathname === '/') return null;

    return (
        <Link
        href="/"
        aria-label="Volver al inicio"
        className="fixed bottom-4 right-4 rounded-full px-4 py-2 shadow border text-sm"
        style={{ background: 'white', borderColor: '#1E3A8A', color: '#1E3A8A' }}
        >
        ⟵ Volver al inicio
        </Link>
    );
}
