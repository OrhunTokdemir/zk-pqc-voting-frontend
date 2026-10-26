// Nullifier için tek seferlik gizli metin: 32 rastgele byte, hex olarak (64 karakter).
// Sadece tarayıcıda üretilir; sunucuya da localStorage'a da gönderilmez.
export function generateSecret() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Okunabilirlik için 4'erli gruplar: "a1b2 c3d4 ..."
export function formatSecret(secret) {
  return secret.match(/.{4}/g).join(" ");
}

// Kullanıcının yazdığını karşılaştırmadan önce boşluk ve tireleri at, küçük harfe çevir
export function normalizeSecret(text) {
  return text.replace(/[\s-]/g, "").toLowerCase();
}
