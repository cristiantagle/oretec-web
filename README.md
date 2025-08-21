# OreTec Web Starter — Next.js + Supabase + Mercado Pago (Links)

## Requisitos
- Node 18+
- Cuenta Supabase (URL + anon key)
- Links de pago de Mercado Pago (uno por curso)
- BD con tablas: courses, orders, enrollments, profiles y vista v_admin_orders (te pasé el SQL)

## Pasos rápidos
1) Copia `.env.example` a `.env.local` y revisa que la URL/anon de Supabase sean correctas.
2) `npm install`
3) `npm run dev` → http://localhost:3000
4) En producción, agrega las mismas variables en Vercel.

## Rutas incluidas
- `/` — portada
- `/courses` — catálogo (botón Comprar → abre `mp_link` de cada curso)
- `/dashboard/proof` — formulario para enviar comprobante (crea orden `pending_review`)
- `/admin` — lista órdenes y permite aprobar (matricula) o rechazar

> Para que `/admin` pueda escribir, define `SUPABASE_SERVICE_ROLE_KEY` en Vercel (server-side).
> Agrega `role='admin'` a tu usuario en la tabla `profiles` para ver la vista admin.
