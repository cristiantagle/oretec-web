import { ReactNode } from "react";
import HomeButton from "@/components/HomeButton";

/**
 * Layout de la sección /admin.
 * - Mantiene el header tipo barra (como lo tenías).
 * - Conserva paddings y proporciones.
 * - No usa <html>/<body> para evitar choques con el RootLayout.
 * - Permite que el Navbar/Footer globales sigan visibles (si quieres ocultarlos en admin, te doy variante).
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="bg-white">
        {/* Barra superior propia del panel admin */}
        <header
        className="sticky top-0 z-10 border-b bg-white"
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
        }}
        >
        <strong style={{ color: "#1E3A8A" }}>Panel Admin — Órdenes</strong>
        {/* Si quieres volver a tener botones aquí, los agregamos sin problema */}
        </header>

        {/* Contenido del panel */}
        <main style={{ padding: 16 }}>{children}</main>

        {/* Botón global para volver al inicio (no aparece en "/") */}
        <HomeButton />
        </div>
    );
}
