"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Giriş formu: kullanıcı ID (UUID) + şifreyi sunucuya gönderir; E-Devlet ve TCKN burada kullanılmaz.
export default function LoginForm() {
  const router = useRouter();
  // Form alanlarının anlık değerleri
  const [form, setForm] = useState({ id: "", password: "" });
  const [error, setError] = useState(null);

  // Değişen alanı (input'un name'ine göre) form state'ine yazar
  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // "Giriş Yap" butonuna basılınca çalışır
  async function onSubmit(e) {
    e.preventDefault(); // sayfanın yeniden yüklenmesini engelle

    const res = await fetch("/api/giris", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Sunucu hatası.");
      return;
    }

    // Sunucu oturum cookie'sini koydu; sayfayı sunucudan yeniden çizdir ki karşılama ekranı gelsin
    router.refresh();
  }

  // İki input'ta ortak kullanılan Tailwind sınıfları
  const input =
    "w-full rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700";

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-2xl font-semibold">Giriş Yap</h1>

        <label className="flex flex-col gap-1">
          Kullanıcı ID
          <input
            className={`${input} font-mono`}
            name="id"
            value={form.id}
            onChange={onChange}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            autoComplete="username"
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
            autoComplete="current-password"
            required
          />
        </label>

        <button
          type="submit"
          className="rounded bg-foreground px-4 py-2 text-background"
        >
          Giriş Yap
        </button>

        {error && <p className="text-red-600">{error}</p>}

        <p>
          Hesabın yok mu?{" "}
          <Link href="/" className="underline">
            Kayıt ol
          </Link>
        </p>
      </form>
    </main>
  );
}
