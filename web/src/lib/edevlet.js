// Sahte E-Devlet: gerçek entegrasyon olana kadar sunucu belleğinde çalışır. Sadece sunucuda import edilir.
// Hesap bilgisi (ad, şifre) tutulmaz; sadece bekleyen doğrulama istekleri ve "hesap açtı" işaretli TCKN'ler.
// globalThis'e bağlı ki dev server'da dosya değişince (HMR) sıfırlanmasın; sunucu yeniden başlarsa sıfırlanır.
export const store = (globalThis.__edevlet ??= {
  requests: new Map(), // requestId -> { tckn, status: "bekliyor" | "onaylandi" }
  marked: new Set(), // hesap açmış TCKN'ler
});

// Route handler'larda ortak hata cevabı
export function fail(status, error) {
  return Response.json({ error }, { status });
}
