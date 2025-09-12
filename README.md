# OreTec Web

**Estado:** **estable** (flujo empresas + panel admin + navbar con refresco de sesión).

## ¿Qué puede hacer la página hoy?

- **Registro / Login** con Supabase.
- **Dashboard** del usuario con datos de perfil.
- **Empresas:** botón **“Agregar estudiantes”** visible solo para cuentas *company* en `/dashboard` que lleva a:
  - `/dashboard/company/participants`: formulario para cargar participantes (nombre, email, RUT, teléfono), validación, borrador en `localStorage`.
  - Continuación a compra: pasa los participantes codificados en **Base64** por querystring hacia la página del curso (slug/código/id).
- **Navbar** reactivo a login/logout:
  - Escucha `supabase.auth.onAuthStateChange`.
  - Llama a `router.refresh()` para que **no sea necesario F5**.
  - Muestra nombre/avatar y menú según rol (admin, instructor, company, student).
- **Admin / Usuarios** (`/admin/users`):
  - Listado paginado + búsqueda (nombre, RUT, email, empresa).
  - Cambio de **rol** con llamada a `/api/admin/users/set-role`.
  - Peticiones con `credentials: 'include'` y Bearer cuando existe.

## Ramas importantes

- `main`: rama de producción.
- `preview/*`: ramas de preview para revisar cambios antes de merge.

## Puntos clave de implementación

- `components/Navbar.tsx`: escucha de auth + `router.refresh()` en login/logout.
- `app/dashboard/page.tsx`: muestra botón “Agregar estudiantes” **solo si** `profile.account_type === 'company'`.
- `app/dashboard/company/participants/page.tsx`: captura y valida participantes, guarda borrador y continúa al flujo de compra.
- `app/admin/users/page.tsx`: listado y cambio de roles en caliente.

## Notas operativas

- Evitar mezclar scripts o texto ajeno en archivos `.tsx` (especialmente en `app/admin/users/page.tsx`).
- Para cambios visibles, crear **siempre** rama `preview/*`, validar en Vercel y luego hacer merge a `main`.
- Si el navbar no reflejara el estado tras login/logout, verificar que:
  - `onAuthStateChange` está montado una sola vez.
  - Se llama a `router.refresh()` dentro de ese listener.
  - No hay caché en el fetch del perfil (`cache: 'no-store'`).

## Créditos

- Next.js 14
- Tailwind CSS
- Supabase Auth/Storage
- Vercel (deploys/preview)

