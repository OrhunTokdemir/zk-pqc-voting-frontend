"use client";

import Link from "next/link";
import { useState } from "react";
import { formatSecret, generateSecret, normalizeSecret } from "../lib/secret";
import { isValidTckn } from "../lib/tckn";

// JSON POST isteği atar; sunucu hata dönerse onun mesajını fırlatır
async function post(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Sunucu hatası.");
  return data;
}

const emptyForm = { tckn: "", ad: "", soyad: "", password: "" };

// Kayıt sayfası ("/"): E-Devlet doğrulaması → gizli metin → kaydedildiğinin kontrolü → hesap kaydı.
// TCKN, ad ve soyad sadece E-Devlet'e gider; uygulama hesabında sadece şifre (hash'i) tutulur.
export default function Home() {
  // Akışın adımı: "form" → "onay" → "gizli" → "dogrula" → "tamam"
  const [step, setStep] = useState("form");
  // Form alanlarının anlık değerleri
  const [form, setForm] = useState(emptyForm);
  // E-Devlet'teki bekleyen doğrulama isteğinin kimliği
  const [requestId, setRequestId] = useState(null);
  // Nullifier için üretilen gizli metin; sadece bu ekranın belleğinde durur
  const [secret, setSecret] = useState(null);
  // "Kaydettim" kutusu işaretli mi
  const [saved, setSaved] = useState(false);
  // Doğrulama adımında kullanıcının yapıştırdığı/yazdığı metin
  const [check, setCheck] = useState("");
  // Kayıt bitince veritabanının verdiği giriş ID'si (UUID)
  const [siteId, setSiteId] = useState(null);
  // Kullanıcıya gösterilen sonuç mesajı: { ok: true/false, text: "..." }
  const [message, setMessage] = useState(null);

  // Her tuş vuruşunda, değişen alanı (input'un name'ine göre) form state'ine yazar
  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Adım değiştirirken eski mesajı temizle
  function goTo(next) {
    setMessage(null);
    setStep(next);
  }

  // Vazgeç: her şeyi sıfırla, forma dön
  function reset() {
    setRequestId(null);
    setSecret(null);
    setSaved(false);
    setCheck("");
    goTo("form");
  }

  // "E-Devlet ile doğrula": E-Devlet'e kimlik bilgileriyle doğrulama isteği gönderir (şifre gitmez)
  async function onSubmit(e) {
    e.preventDefault(); // sayfanın yeniden yüklenmesini engelle

    if (!isValidTckn(form.tckn)) {
      setMessage({ ok: false, text: "Geçersiz TCKN." });
      return;
    }

    // Aynı TCKN ile ikinci kaydı E-Devlet'in "hesap açıldı" işareti engeller; uygulama TCKN tutmaz
    try {
      const { requestId } = await post("/api/edevlet/dogrulama", {
        tckn: form.tckn,
        ad: form.ad,
        soyad: form.soyad,
      });
      setRequestId(requestId);
      goTo("onay");
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    }
  }

  // Simülasyon: gerçekte kullanıcı bu onayı E-Devlet'e girip verir
  async function approve() {
    try {
      await post(`/api/edevlet/dogrulama/${requestId}/onay`);
      setSecret(generateSecret()); // onay gelince gizli metin client'ta üretilir
      goTo("gizli");
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    }
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ ok: true, text: "Kopyalandı." });
    } catch {
      setMessage({ ok: false, text: "Kopyalanamadı, metni elle seçip kopyala." });
    }
  }

  // Gizli metni .txt dosyası olarak indirir
  function downloadSecret() {
    const url = URL.createObjectURL(new Blob([secret + "\n"], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "oylama-gizli-metin.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Kullanıcı gizli metni geri verebiliyorsa hesabı oluştur (sunucu E-Devlet işaretini de koyar)
  async function onVerify(e) {
    e.preventDefault();

    if (normalizeSecret(check) !== secret) {
      setMessage({ ok: false, text: "Gizli metin eşleşmedi. Kaydettiğin metni kontrol et." });
      return;
    }

    try {
      // TODO: commitment (gizli metnin hash'i) burada gönderilecek; hash fonksiyonu kararı bekleniyor
      const { id } = await post("/api/kayit", { requestId, password: form.password });

      setSiteId(id);
      setForm(emptyForm);
      setSecret(null); // gizli metin artık hiçbir yerde tutulmuyor
      setCheck("");
      goTo("tamam");
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    }
  }

  // Input'larda ve butonlarda ortak kullanılan Tailwind sınıfları
  const input =
    "w-full rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700";
  const button = "rounded bg-foreground px-4 py-2 text-background disabled:opacity-50";
  const secondary = "rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700";

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-4">
        {step === "form" && (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <h1 className="text-2xl font-semibold">Kayıt Ol</h1>

            <label className="flex flex-col gap-1">
              TCKN
              <input
                className={input}
                name="tckn"
                value={form.tckn}
                onChange={onChange}
                inputMode="numeric"
                maxLength={11}
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              Ad
              <input
                className={input}
                name="ad"
                value={form.ad}
                onChange={onChange}
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              Soyad
              <input
                className={input}
                name="soyad"
                value={form.soyad}
                onChange={onChange}
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              Şifre
              <input
                className={input}
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                required
              />
            </label>

            <button type="submit" className={button}>
              E-Devlet ile doğrula
            </button>

            <p>
              Zaten hesabın var mı?{" "}
              <Link href="/login" className="underline">
                Giriş yap
              </Link>
            </p>
          </form>
        )}

        {step === "onay" && (
          <>
            <h1 className="text-2xl font-semibold">E-Devlet Onayı</h1>
            <p>
              {form.tckn} için E-Devlet&apos;e hesap açma doğrulaması gönderildi. Şifren
              E-Devlet&apos;e gönderilmedi.
            </p>
            <p className="text-sm text-zinc-500">
              Simülasyon: gerçek sistemde bu onay E-Devlet üzerinden verilir.
            </p>
            <button onClick={approve} className={button}>
              E-Devlet&apos;te onayla
            </button>
            <button onClick={reset} className="underline">
              Vazgeç
            </button>
          </>
        )}

        {step === "gizli" && (
          <>
            <h1 className="text-2xl font-semibold">Gizli Metnin</h1>
            <p>
              Oy verirken kimliğini açık etmeden oyunu kanıtlamak için bu metin
              kullanılacak. <strong>Bir daha gösterilmeyecek</strong>; kaybedersen oy
              kullanamazsın.
            </p>
            <code className="select-all break-all rounded border border-zinc-300 p-3 font-mono dark:border-zinc-700">
              {formatSecret(secret)}
            </code>
            <div className="flex gap-2">
              <button onClick={() => copy(secret)} className={secondary}>
                Kopyala
              </button>
              <button onClick={downloadSecret} className={secondary}>
                Dosya olarak indir
              </button>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={saved}
                onChange={(e) => setSaved(e.target.checked)}
              />
              Gizli metni güvenli bir yere kaydettim
            </label>
            <button onClick={() => goTo("dogrula")} disabled={!saved} className={button}>
              Devam
            </button>
          </>
        )}

        {step === "dogrula" && (
          <form onSubmit={onVerify} className="flex flex-col gap-4">
            <h1 className="text-2xl font-semibold">Kaydettiğini Doğrula</h1>
            <p>Kaydettiğin gizli metni buraya yapıştır. Boşluklar önemli değil.</p>
            <textarea
              className={`${input} font-mono`}
              rows={3}
              value={check}
              onChange={(e) => setCheck(e.target.value)}
              required
            />
            <button type="submit" className={button}>
              Hesabı oluştur
            </button>
            <button type="button" onClick={() => goTo("gizli")} className="underline">
              Geri dön, metni tekrar göster
            </button>
          </form>
        )}

        {step === "tamam" && (
          <>
            <h1 className="text-2xl font-semibold">Hesap oluşturuldu</h1>
            <p>E-Devlet bu TCKN&apos;yi hesap açmış olarak işaretledi.</p>
            <p>
              Girişte TCKN kullanılmaz. Bundan sonra bu <strong>kullanıcı ID</strong> ve
              şifrenle giriş yapacaksın, not al:
            </p>
            <code className="select-all break-all rounded border border-zinc-300 p-3 text-center font-mono dark:border-zinc-700">
              {siteId}
            </code>
            <button onClick={() => copy(siteId)} className={secondary}>
              Kopyala
            </button>
            <Link href="/login" className="underline">
              Giriş yap
            </Link>
          </>
        )}

        {message && (
          <p className={message.ok ? "text-green-600" : "text-red-600"}>{message.text}</p>
        )}
      </div>
    </main>
  );
}
