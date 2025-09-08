import path from "node:path";
import { config } from "dotenv";

const envPath = path.resolve(process.cwd(), ".env.local");
const loaded = config({ path: envPath });
if (loaded.error) {
  console.warn("Aviso: no se pudo cargar .env.local:", loaded.error.message);
}

const required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_DB_PASSWORD"];
const missing = required.filter((k) => !process.env[k] || process.env[k] === "");
if (missing.length) {
  console.error("ERROR: faltan variables en .env.local -> " + missing.join(", "));
  process.exit(1);
}
