"use client";

import { useRouter } from "next/navigation";

// Çıkış: sunucu oturum cookie'sini siler, sayfa yeniden çizilince giriş formu gelir
export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/cikis", { method: "POST" });
    router.refresh();
  }

  return (
    <button onClick={logout} className="rounded bg-foreground px-4 py-2 text-background">
      Çıkış Yap
    </button>
  );
}
