"use client";

import Link from "next/link";
import { useState } from "react";
import { loadUsers, normalizeSiteId, setCurrentUser, useCurrentUser } from "../../lib/users";

// Giriş sayfası ("/login"): sitenin verdiği kullanıcı ID + şifreyi kayıtlı kullanıcılarla karşılaştırır.
// E-Devlet ve TCKN sadece kayıtta kullanılır, burada kullanılmaz.
export default function Login() {
  // Form alanlarının anlık değerleri
  const [form, setForm] = useState({ id: "", password: "" });
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

    // ID ve şifrenin ikisi birden eşleşen kullanıcıyı ara
    const id = normalizeSiteId(form.id);
    const found = loadUsers().find(
      (u) => u.id === id && u.password === form.password,
    );

    if (!found) {
      setError("Kullanıcı ID veya şifre hatalı.");
      return;
    }

    // Girişi kaydet; useCurrentUser() sayesinde ekran otomatik güncellenir
    setCurrentUser(found);
    setError(null);
    setForm({ id: "", password: "" });
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
          <p>Kullanıcı ID: {user.id}</p>
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
          Kullanıcı ID
          <input
            className={input}
            name="id"
            value={form.id}
            onChange={onChange}
            placeholder="ABCD-1234"
            autoCapitalize="characters"
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
