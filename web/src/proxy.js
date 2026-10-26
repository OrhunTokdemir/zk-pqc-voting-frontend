import { NextResponse } from "next/server";
import { refreshSession } from "@/lib/session";

// Her sayfa isteğinden önce çalışır: kullanıcı siteyi kullandıkça oturumun 30 dk'lık süresini yeniler.
export async function proxy(request) {
  const response = NextResponse.next();
  await refreshSession(request, response);
  return response;
}

export const config = {
  matcher: [
    {
      // API'ler (giriş/çıkış cookie'yi kendisi yönetir) ve statik dosyalar hariç tüm sayfalar
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      // Link'lerin arka planda yaptığı prefetch istekleri kullanıcı hareketi sayılmaz
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
