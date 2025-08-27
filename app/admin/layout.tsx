import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="es">
        <body>
        <header
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid #e5e7eb",
            background: "white",
            position: "sticky",
            top: 0,
            zIndex: 10,
        }}
        >
        <strong>Panel Admin — Órdenes</strong>
        {/* Quitamos el botón aquí para no duplicar.
            Si lo quieres también arriba, avísame y lo agrego igual que en la página (POST a /api/admin/logout). */}
            </header>
            <main style={{ padding: 16 }}>{children}</main>
            </body>
            </html>
    );
}
