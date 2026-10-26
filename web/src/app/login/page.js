import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/session";
import LoginForm from "./LoginForm";
import LogoutButton from "./LogoutButton";

// Giriş sayfası ("/login"): sunucuda oturum cookie'sine bakar.
// Giriş yapılmışsa karşılama ekranı, yapılmamışsa giriş formu gösterilir.
export default async function Login() {
  const session = await getSession();
  // Cookie geçerli olsa bile hesap silinmiş olabilir (ör. veritabanı sıfırlandı), o yüzden kontrol et
  const [user] = session
    ? await db.select({ id: users.id }).from(users).where(eq(users.id, session.userId))
    : [];

  if (!user) return <LoginForm />;

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-2xl font-semibold">Hoş geldin</h1>
        <p className="break-all">Kullanıcı ID: {user.id}</p>
        <LogoutButton />
      </div>
    </main>
  );
}
