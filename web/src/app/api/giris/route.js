import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { fail } from "@/lib/http";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Giriş: kullanıcı ID (UUID) + şifre. E-Devlet ve TCKN burada kullanılmaz.
export async function POST(request) {
  const { id, password } = await request.json().catch(() => ({}));
  const userId = typeof id === "string" ? id.trim().toLowerCase() : "";

  // UUID biçiminde değilse veritabanına hiç sormuyoruz (Postgres geçersiz uuid'de hata verir)
  if (!UUID.test(userId) || typeof password !== "string") {
    return fail(401, "Kullanıcı ID veya şifre hatalı.");
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return fail(401, "Kullanıcı ID veya şifre hatalı.");
  }

  await createSession(user.id);
  return Response.json({ ok: true });
}
