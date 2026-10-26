import { deleteSession } from "@/lib/session";

// Çıkış: oturum cookie'sini siler
export async function POST() {
  await deleteSession();
  return Response.json({ ok: true });
}
