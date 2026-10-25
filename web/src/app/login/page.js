"use client";

import Link from "next/link";
import { useState } from "react";
import { loadUsers, setCurrentUser, useCurrentUser } from "../../lib/users";

// Giriş sayfası ("/login"): TCKN + şifreyi kayıtlı kullanıcılarla karşılaştırır.
export default function Login() {
  // Form alanlarının anlık değerleri
  const [form, setForm] = useState({ tckn: "", password: "" });
  // Şu an giriş yapmış kullanıcı (yoksa null). localStorage'dan okunur.
  const user = useCurrentUser();
  const [error, setError] = useState(null);

  // Değişen alanı (input'un name'ine göre) form state'ine yazar
  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // "Giriş Yap" butonuna basılınca çalışır
  function onSubmit(e) {
    e.preventDefault(); // sayfanın yeniden yüklenmesini engelle

    // TCKN ve şifrenin ikisi birden eşleşen kullanıcıyı ara
    const found = loadUsers().find(
      (u) => u.tckn === form.tckn && u.password === form.password,
    );

    if (!found) {
      setError("TCKN veya şifre hatalı.");
      return;
    }

    // Girişi kaydet; useCurrentUser() sayesinde ekran otomatik güncellenir
    setCurrentUser(found);
    setError(null);
    setForm({ tckn: "", password: "" });
  }

  // Oturumu kapat (currentUser kaydını siler)
  function logout() {
    setCurrentUser(null);
  }

  // İki input'ta ortak kullanılan Tailwind sınıfları
  const input =
    "w-full rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700";

  // Giriş yapılmışsa form yerine karşılama ekranını göster
  if (user) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-sm flex-col gap-4">
          <h1 className="text-2xl font-semibold">Hoş geldin, {user.adSoyad}</h1>
          <p>TCKN: {user.tckn}</p>
          <button
            onClick={logout}
            className="rounded bg-foreground px-4 py-2 text-background"
          >
            Çıkış Yap
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-2xl font-semibold">Giriş Yap</h1>

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
