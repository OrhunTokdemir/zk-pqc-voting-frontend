// Route handler'larda ortak hata cevabı
export function fail(status, error) {
  return Response.json({ error }, { status });
}
