import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Google'dan Geist yazı tiplerini yükler; CSS değişkeni olarak sunulur
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Tarayıcı sekmesinde görünen başlık ve sayfa açıklaması
export const metadata = {
  title: "Kayıt Ol",
  description: "Basit kayıt uygulaması",
};

// Tüm sayfaları saran ana iskelet; "/" ve "/login" bunun içindeki {children} olarak çizilir
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
