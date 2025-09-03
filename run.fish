#!/usr/bin/env fish
# Actualiza SOLO .env.local con credenciales de prueba de Mercado Pago (Checkout Pro)
# Encapsulado en bash para que no falle en fish.

bash -lc '
set -euo pipefail

ENV_FILE=".env.local"
PUB_KEY_LINE="MP_PUBLIC_KEY=APP_USR-506ca0c0-138f-49ef-9241-5866a125a6af"
ACCESS_TOKEN_LINE="MP_ACCESS_TOKEN=APP_USR-6692014897318505-090311-804039041072dd1ef90418222ef71df0-2664077917"

# Crea el archivo si no existe
[ -f "$ENV_FILE" ] || touch "$ENV_FILE"

# Elimina líneas previas de estas keys si existían
tmp="$(mktemp)"
grep -vE "^(MP_PUBLIC_KEY|MP_ACCESS_TOKEN)=" "$ENV_FILE" > "$tmp" || true
mv "$tmp" "$ENV_FILE"

# Añade las líneas nuevas al final
{
  echo "$PUB_KEY_LINE"
  echo "$ACCESS_TOKEN_LINE"
} >> "$ENV_FILE"

echo "✓ .env.local actualizado con credenciales de PRUEBA de Mercado Pago"
echo "   Archivo: $ENV_FILE"
'
