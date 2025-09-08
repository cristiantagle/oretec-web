import "./env";
function mask(v?: string) {
  if (!v) return "(vacío)";
  if (v.length <= 8) return "***";
  return v.slice(0, 4) + "..." + v.slice(-4);
}
console.log("NEXT_PUBLIC_SUPABASE_URL =", process.env.NEXT_PUBLIC_SUPABASE_URL || "(vacío)");
console.log("SUPABASE_DB_PASSWORD    =", mask(process.env.SUPABASE_DB_PASSWORD));
