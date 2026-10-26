// Sahte E-Devlet'e test vatandaşları ekler. Çalıştırma: npm run db:seed
// Tekrar çalıştırmak güvenli: zaten olan TCKN'ler atlanır, hesap_acildi durumlarına dokunulmaz.
import pg from "pg";

// TCKN'ler checksum kuralına uygun ama uydurma
const vatandaslar = [
  ["12345678950", "Ayşe", "Yılmaz"],
  ["23456789138", "Mehmet", "Kaya"],
  ["34567891238", "Zeynep", "Demir"],
  ["45678912316", "Ali", "Çelik"],
  ["56789123416", "Elif", "Şahin"],
];

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

for (const [tckn, ad, soyad] of vatandaslar) {
  await client.query(
    "INSERT INTO edevlet.vatandaslar (tckn, ad, soyad) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
    [tckn, ad, soyad],
  );
}

const { rows } = await client.query("SELECT * FROM edevlet.vatandaslar ORDER BY tckn");
console.table(rows);
await client.end();
