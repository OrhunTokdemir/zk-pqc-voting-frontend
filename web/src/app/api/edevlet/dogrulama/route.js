import { eq } from "drizzle-orm";
import { db } from "@/db";
import { vatandaslar } from "@/db/schema";
import { normalizeName, requests } from "@/lib/edevlet";
import { fail } from "@/lib/http";
import { isValidTckn } from "@/lib/tckn";

// Hesap açma doğrulaması başlatır: TCKN, ad ve soyadı E-Devlet kaydıyla karşılaştırır.
// Şifre gibi uygulama hesabı bilgileri E-Devlet'e gönderilmez.
export async function POST(request) {
  const { tckn, ad, soyad } = await request.json().catch(() => ({}));

  if (!isValidTckn(tckn)) return fail(400, "Geçersiz TCKN.");
  if (typeof ad !== "string" || typeof soyad !== "string") {
    return fail(400, "Ad ve soyad gerekli.");
  }

  const [kayit] = await db.select().from(vatandaslar).where(eq(vatandaslar.tckn, tckn));

  // Hangi alanın tutmadığını söylemiyoruz ki TCKN'lerin kime ait olduğu tek tek denenemesin
  if (
    !kayit ||
    normalizeName(kayit.ad) !== normalizeName(ad) ||
    normalizeName(kayit.soyad) !== normalizeName(soyad)
  ) {
    return fail(404, "Kimlik bilgileri E-Devlet kayıtlarıyla eşleşmedi.");
  }
  if (kayit.hesapAcildi) return fail(409, "Bu TCKN ile zaten hesap açılmış.");

  const requestId = crypto.randomUUID();
  requests.set(requestId, { tckn, status: "bekliyor" });
  return Response.json({ requestId });
}
