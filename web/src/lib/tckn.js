// TC Kimlik No kuralları: 11 hane, ilk hane 0 olamaz,
// 10. hane = (1, 3, 5, 7, 9. hanelerin toplamı × 7 − 2, 4, 6, 8. hanelerin toplamı) mod 10,
// 11. hane = ilk 10 hanenin toplamı mod 10.
// Hem tarayıcıda (formlar) hem sunucuda (sahte E-Devlet) kullanılır.
export function isValidTckn(tckn) {
  if (typeof tckn !== "string" || !/^[1-9]\d{10}$/.test(tckn)) return false;

  const d = Array.from(tckn, Number);
  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  // JS'te % negatif sonuç verebilir, +10 ile pozitife çekiyoruz
  const tenth = (((odd * 7 - even) % 10) + 10) % 10;
  const eleventh = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10;

  return d[9] === tenth && d[10] === eleventh;
}
