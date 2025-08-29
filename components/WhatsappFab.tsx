// components/WhatsappFab.tsx
'use client'
type Props = {
    phone?: string // en formato internacional, ej: "56912345678"
    message?: string
}

export default function WhatsappFab({
    phone = '56912345678',
    message = 'Hola, quiero información sobre los cursos de OreTec.',
}: Props) {
    const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    return (
        <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:scale-105 active:scale-95"
        aria-label="Escríbenos por WhatsApp"
        title="Escríbenos por WhatsApp"
        >
        <svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor" aria-hidden>
        <path d="M19.11 17.19c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.41-1.47-.89-.8-1.49-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.52s1.08 2.93 1.23 3.13c.15.2 2.12 3.23 5.14 4.53.72.31 1.28.5 1.72.64.72.23 1.37.2 1.89.12.57-.09 1.77-.72 2.02-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35zM16.02 3.2c-6.96 0-12.6 5.64-12.6 12.6 0 2.21.58 4.29 1.59 6.09L3.2 28.8l7.09-1.86c1.73.95 3.72 1.49 5.83 1.49 6.96 0 12.6-5.64 12.6-12.6s-5.64-12.6-12.6-12.6zm0 22.77c-1.99 0-3.84-.58-5.39-1.58l-.39-.25-4.21 1.1 1.12-4.1-.26-.42a10.4 10.4 0 0 1-1.61-5.58c0-5.75 4.7-10.45 10.45-10.45s10.45 4.7 10.45 10.45-4.7 10.45-10.45 10.45z" />
        </svg>
        WhatsApp
        </a>
    )
}
