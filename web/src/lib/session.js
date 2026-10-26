import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Oturum, imzalı bir JWT olarak httpOnly cookie'de durur; veritabanında oturum tablosu yok.
// İçinde sadece kullanıcı ID'si var. SESSION_SECRET .env.local'da.
const key = new TextEncoder().encode(process.env.SESSION_SECRET);
const COOKIE = "session";
const WEEK = 7 * 24 * 60 * 60 * 1000;

export async function createSession(userId) {
  const expires = new Date(Date.now() + WEEK);
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true, // tarayıcıdaki JS okuyamaz
    secure: process.env.NODE_ENV === "production", // geliştirmede http://localhost
    sameSite: "lax",
    expires,
    path: "/",
  });
}

// Geçerli oturum varsa { userId }, yoksa ya da imza/süre tutmuyorsa null
export async function getSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export async function deleteSession() {
  (await cookies()).delete(COOKIE);
}
