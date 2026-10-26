import "server-only";
import { and, eq } from "drizzle-orm";
import { vatandaslar } from "@/db/schema";

// Sahte E-Devlet. Vatandaş kayıtları ve "hesap açıldı" işareti veritabanında (edevlet şeması).
// Bekleyen doğrulama istekleri kısa ömürlü olduğu için sunucu belleğinde duruyor: requestId -> { tckn, status }
// globalThis'e bağlı ki HMR'da sıfırlanmasın; sunucu yeniden başlarsa yarım kalan kayıtlar baştan başlar.
export const requests = (globalThis.__edevletRequests ??= new Map());

// İsim karşılaştırması için: boşlukları düzelt, Türkçe kurallarıyla büyük harfe çevir (i → İ)
export function normalizeName(text) {
  return text.trim().replace(/\s+/g, " ").toLocaleUpperCase("tr-TR");
}

// Hesap açılırken uygulamanın transaction'ı içinden çağrılır: TCKN'ye "hesap açıldı" işaretini koyar.
// Zaten işaretliyse false döner; WHERE'deki koşul sayesinde aynı anda gelen iki istekten sadece biri kazanır.
export async function markAccountOpened(tx, tckn) {
  const rows = await tx
    .update(vatandaslar)
    .set({ hesapAcildi: true })
    .where(and(eq(vatandaslar.tckn, tckn), eq(vatandaslar.hesapAcildi, false)))
    .returning({ tckn: vatandaslar.tckn });
  return rows.length === 1;
}
