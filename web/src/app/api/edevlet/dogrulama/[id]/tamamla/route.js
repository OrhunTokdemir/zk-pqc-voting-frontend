import { fail, store } from "@/lib/edevlet";

// Hesap sisteme kaydedilirken çağrılır: E-Devlet bu TCKN'ye "hesap açtı" işaretini koyar.
// Onaydan hemen sonra değil burada işaretlenir ki kullanıcı gizli metni kaydetmeden yarıda bırakırsa kilitlenmesin.
export async function POST(request, { params }) {
  const { id } = await params;
  const req = store.requests.get(id);

  if (!req) return fail(404, "Doğrulama isteği bulunamadı.");
  if (req.status !== "onaylandi") return fail(409, "İstek E-Devlet'te onaylanmamış.");
  if (store.marked.has(req.tckn)) return fail(409, "Bu TCKN ile zaten hesap açılmış.");

  store.marked.add(req.tckn);
  store.requests.delete(id);
  return Response.json({ ok: true });
}
