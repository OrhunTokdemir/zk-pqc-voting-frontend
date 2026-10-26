import { fail, store } from "@/lib/edevlet";

// Simülasyon: kullanıcının E-Devlet'e girip doğrulama isteğini onaylaması
export async function POST(request, { params }) {
  const { id } = await params;
  const req = store.requests.get(id);

  if (!req) return fail(404, "Doğrulama isteği bulunamadı.");

  req.status = "onaylandi";
  return Response.json({ ok: true });
}
