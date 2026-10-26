import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";

// Tek bağlantı havuzu; globalThis'e bağlı ki dev server'da dosya değişince (HMR) yeni havuz açılmasın
export const db = (globalThis.__db ??= drizzle(process.env.DATABASE_URL));
