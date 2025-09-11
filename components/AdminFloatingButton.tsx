// components/AdminFloatingButton.tsx
"use client"

import Link from "next/link";

/**
 * Botón flotante que enlaza a /admin (login maestro con clave cr1st1an).
 * No depende de roles ni de sesión.
 */
export default function AdminFloatingButton() {
  return (
    <div
      aria-label="Acceso Admin"
      className="fixed z-40 bottom-4 right-4"
      style={{ pointerEvents: "none" }}
    >
      <Link
        href="/admin"
        prefetch={false}
        className="rounded-full shadow-lg ring-1 ring-black/10 px-4 py-2 text-sm font-medium"
        style={{
          background: "#1E3A8A",
          color: "white",
          pointerEvents: "auto",
        }}
      >
        Admin
      </Link>
    </div>
  );
}
