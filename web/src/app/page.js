"use client";

import Link from "next/link";
import { useState } from "react";
import { USERS_KEY, loadUsers } from "../lib/users";

// Kayıt sayfası ("/"): yeni kullanıcıyı localStorage'a kaydeder.
export default function Home() {
  // Form alanlarının anlık değerleri
  const [form, setForm] = useState({ tckn: "", adSoyad: "", password: "" });
  // Kullanıcıya gösterilen sonuç mesajı: { ok: true/false, text: "..." }
  const [message, setMessage] = useState(null);

  // Her tuş vuruşunda, değişen alanı (input'un name'ine göre) form state'ine yazar
  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // "Kayıt Ol" butonuna basılınca çalışır
  function onSubmit(e) {
    e.preventDefault(); // sayfanın yeniden yüklenmesini engelle
    const users = loadUsers();

    // Aynı TCKN ile ikinci kayda izin verme
    if (users.some((u) => u.tckn === form.tckn)) {
      setMessage({ ok: false, text: "Bu TCKN ile zaten kayıt var." });
      return;
    }

    // Güvenlik yok: şifre düz metin saklanıyor (bilerek, öğrenme adımı).
    users.push({ ...form, createdAt: new Date().toISOString() });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    setForm({ tckn: "", adSoyad: "", password: "" }); // formu temizle
    setMessage({ ok: true, text: "Kayıt oluşturuldu." });
  }

  // Üç input'ta ortak kullanılan Tailwind sınıfları
  const input =
    "w-full rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700";

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
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
          Ad Soyad
          <input
            className={input}
            name="adSoyad"
            value={form.adSoyad}
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

        <button
          type="submit"
          className="rounded bg-foreground px-4 py-2 text-background"
        >
          Kayıt Ol
        </button>

        {message && (
          <p className={message.ok ? "text-green-600" : "text-red-600"}>
            {message.text}
          </p>
        )}

        <p>
          Zaten hesabın var mı?{" "}
          <Link href="/login" className="underline">
            Giriş yap
          </Link>
        </p>
      </form>
    </main>
  );
}
