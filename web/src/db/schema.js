import { boolean, char, pgSchema, pgTable, text, uuid } from "drizzle-orm/pg-core";

// Sahte E-Devlet'in kendi şeması. Gerçekte bizim dışımızda bir sistem olduğu için
// uygulama tablolarıyla JOIN yapılmaz; sadece src/lib/edevlet.js ve E-Devlet route'ları kullanır.
export const edevlet = pgSchema("edevlet");

// E-Devlet'in vatandaş kaydı: kimlik bilgileri ve bu TCKN ile hesap açılıp açılmadığı
export const vatandaslar = edevlet.table("vatandaslar", {
  tckn: char("tckn", { length: 11 }).primaryKey(),
  ad: text("ad").notNull(),
  soyad: text("soyad").notNull(),
  hesapAcildi: boolean("hesap_acildi").notNull().default(false),
});

// Bizim uygulamamızın hesapları: kişiyi tanıtan hiçbir bilgi yok, sadece giriş ID'si ve şifre hash'i
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  passwordHash: text("password_hash").notNull(),
});
