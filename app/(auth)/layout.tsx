// app/(auth)/layout.tsx
export const metadata = {
    title: {
        default: 'Acceso — OreTec',
            template: '%s — OreTec',
    },
    description: 'Accede o crea tu cuenta para gestionar cursos OreTec.',
}

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="w-full max-w-md p-6">{children}</div>
        </div>
    )
}
