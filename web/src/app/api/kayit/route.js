import { db } from "@/db";
import { users } from "@/db/schema";
import { markAccountOpened, requests } from "@/lib/edevlet";
import { fail } from "@/lib/http";
import { hashPassword } from "@/lib/password";

// Hesabı oluşturur: E-Devlet'te onaylanmış isteğin kimliğini ve şifreyi alır.
// TCKN'nin işaretlenmesi ve hesabın kaydı aynı transaction'da: biri olmazsa ikisi de olmaz.
// Hesaba TCKN yazılmaz; kullanıcıya sadece veritabanının ürettiği UUID döner.
export async function POST(request) {
  const { requestId, password } = await request.json().catch(() => ({}));
  const req = requests.get(requestId);

  if (!req) return fail(404, "Doğrulama isteği bulunamadı.");
  if (req.status !== "onaylandi") return fail(409, "İstek E-Devlet'te onaylanmamış.");
  if (typeof password !== "string" || !password) return fail(400, "Şifre gerekli.");

  // TODO: commitment (gizli metnin hash'i) burada kaydedilecek; hash fonksiyonu kararı bekleniyor
  const passwordHash = await hashPassword(password);
  const id = await db.transaction(async (tx) => {
    if (!(await markAccountOpened(tx, req.tckn))) return null;
    const [user] = await tx.insert(users).values({ passwordHash }).returning({ id: users.id });
    return user.id;
  });

  requests.delete(requestId);
  if (!id) return fail(409, "Bu TCKN ile zaten hesap açılmış.");
  return Response.json({ id });
}
