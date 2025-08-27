export default function Footer() {
    return (
        <footer className="border-t bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} OreTec. Todos los derechos reservados.</p>
        <p className="opacity-80">Formación en Prevención y Seguridad Laboral — e-learning Chile</p>
        </div>
        </footer>
    );
}
