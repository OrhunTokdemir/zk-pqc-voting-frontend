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
