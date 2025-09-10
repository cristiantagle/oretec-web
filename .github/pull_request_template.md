## Objetivo del PR

Describe brevemente el cambio.

## Checklist anti-regresiones

- [ ] **No** toca `components/BannerStrip.tsx` ni `public/img/hero/*` (a menos que el PR sea explícitamente para eso)
- [ ] Probado **signup + login** en Preview (Vercel)
- [ ] `emailRedirectTo` usa `NEXT_PUBLIC_SITE_URL` y apunta a `/dashboard`
- [ ] `/api/profile/ensure` devuelve `{ ok: true }`
- [ ] **No** modifica secrets ni workflows sin indicarlo en la descripción
- [ ] (Opcional) Capturas/Logs del flujo verificadas

## Notas
- Si el Preview falla por variables de entorno, confirma que están definidas en Vercel (Project → Settings → Environment Variables).
