import { useSyncExternalStore } from "react";

// localStorage anahtarları: tüm kayıtlı kullanıcılar ve şu an giriş yapmış olan
export const USERS_KEY = "users";
export const CURRENT_KEY = "currentUser";

// Kayıtlı kullanıcıların listesini döndürür (kayıt yoksa boş liste)
export function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) ?? [];
  } catch {
    return [];
  }
}

// Sitenin kayıtta verdiği giriş kimliği, "K7QM-3XRP" biçiminde. Karışan karakterler (0/O, 1/I) yok.
// TCKN'den bağımsızdır: TCKN sadece kayıtta E-Devlet'e gider, girişte kullanılmaz.
const ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateSiteId() {
  const taken = new Set(loadUsers().map((u) => u.id));
  let id;
  do {
    // 32 karakter 256'yı tam böldüğü için % ile seçmek dağılımı bozmaz
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    const chars = Array.from(bytes, (b) => ID_CHARS[b % ID_CHARS.length]).join("");
    id = `${chars.slice(0, 4)}-${chars.slice(4)}`;
  } while (taken.has(id));
  return id;
}

// Girişte yazılan ID'yi karşılaştırmadan önce: boşluk/tireleri at, büyük harfe çevir, tireyi geri koy
export function normalizeSiteId(text) {
  const s = text.replace(/[^a-z0-9]/gi, "").toUpperCase();
  return s.length === 8 ? `${s.slice(0, 4)}-${s.slice(4)}` : s;
}

// useCurrentUser kullanan bileşenler burada kayıtlı; giriş/çıkış olunca hepsine haber verilir
const listeners = new Set();

function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notify() {
  listeners.forEach((callback) => callback());
}

// Giriş yapar (user verilirse) ya da çıkış yapar (null verilirse)
export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_KEY);
  }
  notify();
}

// Giriş yapmış kullanıcıyı döndüren hook; giriş/çıkışta bileşen yeniden çizilir.
// Ham string döndürülür ki snapshot kararlı kalsın (aynı değer = aynı referans).
// Üçüncü parametre sunucuda (SSR) kullanılır: orada localStorage yok, null döner.
export function useCurrentUser() {
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(CURRENT_KEY),
    () => null,
  );
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
