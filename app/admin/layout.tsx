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
        <strong>Panel de Administración – OreTec</strong>
        <form action="/api/admin/logout" method="post">
        <button
        type="submit"
        style={{
            background: "#111827",
            color: "white",
            borderRadius: 8,
            padding: "8px 12px",
            border: "none",
            cursor: "pointer",
        }}
        >
        Cerrar sesión
        </button>
        </form>
        </header>
        <main style={{ padding: 16 }}>{children}</main>
        </body>
        </html>
    );
}
