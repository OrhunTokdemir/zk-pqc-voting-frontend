import { fail, store } from "@/lib/edevlet";
import { isValidTckn } from "@/lib/tckn";

// Hesap açma doğrulaması başlatır. Sadece TCKN alır; ad, şifre gibi hesap bilgileri E-Devlet'e gönderilmez.
export async function POST(request) {
  const { tckn } = await request.json().catch(() => ({}));

  if (!isValidTckn(tckn)) return fail(400, "Geçersiz TCKN.");
  if (store.marked.has(tckn)) return fail(409, "Bu TCKN ile zaten hesap açılmış.");

  const requestId = crypto.randomUUID();
  store.requests.set(requestId, { tckn, status: "bekliyor" });
  return Response.json({ requestId });
}
