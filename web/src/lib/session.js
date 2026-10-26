import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Oturum, imzalı bir JWT olarak httpOnly cookie'de durur; veritabanında oturum tablosu yok.
// İçinde kullanıcı ID'si ve giriş zamanı var. SESSION_SECRET .env.local'da.
const COOKIE = "session";
const IDLE = 30 * 60 * 1000; // 30 dk işlem yapılmazsa oturum biter
const MAX = 8 * 60 * 60 * 1000; // işlem yapılsa bile girişten 8 saat sonra biter

// Anahtar ilk kullanımda okunur ki .env.local olmadan da build alınabilsin
function key() {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET tanımlı değil: web/.env.example'ı .env.local olarak kopyala.");
  }
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}

// Yeni token ve cookie ayarları. Bitiş = şimdi + 30 dk, ama giriş + 8 saati geçemez.
// Bitiş zamanı imzanın içinde olduğu için tarayıcıda değiştirilemez.
async function sign(userId, loginAt) {
  const expires = new Date(Math.min(Date.now() + IDLE, loginAt + MAX));
  const token = await new SignJWT({ userId, loginAt })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(key());

  const options = {
    httpOnly: true, // tarayıcıdaki JS okuyamaz
    secure: process.env.NODE_ENV === "production", // geliştirmede http://localhost
    sameSite: "lax",
    expires,
    path: "/",
  };
  return [token, options];
}

// İmza ve süre tutuyorsa { userId, loginAt }, tutmuyorsa null
async function verify(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return { userId: payload.userId, loginAt: payload.loginAt };
  } catch {
    return null;
  }
}

export async function createSession(userId) {
  const [token, options] = await sign(userId, Date.now());
  (await cookies()).set(COOKIE, token, options);
}

export async function getSession() {
  return verify((await cookies()).get(COOKIE)?.value);
}

// src/proxy.js her sayfa isteğinde çağırır: oturum geçerliyse 30 dk'lık süreyi baştan başlatır.
// Sunucu bileşenleri cookie yazamadığı için bu iş proxy'de yapılıyor.
export async function refreshSession(request, response) {
  const session = await verify(request.cookies.get(COOKIE)?.value);
  if (!session) return;
  const [token, options] = await sign(session.userId, session.loginAt);
  response.cookies.set(COOKIE, token, options);
}

export async function deleteSession() {
  (await cookies()).delete(COOKIE);
}
