import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

// OWASP'ın scrypt için önerdiği ayarlar (N=2^17, r=8, p=1); bu kadar bellek için maxmem'i yükseltiyoruz
const PARAMS = { N: 2 ** 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };

// Veritabanına "tuz:hash" (hex) olarak yazılır; düz şifre hiçbir yerde saklanmaz
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64, PARAMS);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":").map((h) => Buffer.from(h, "hex"));
  const candidate = await scryptAsync(password, salt, hash.length, PARAMS);
  // Sabit sürede karşılaştır ki cevap süresinden şifre hakkında bilgi sızmasın
  return timingSafeEqual(hash, candidate);
}
