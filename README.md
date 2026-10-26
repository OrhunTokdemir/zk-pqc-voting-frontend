# zk-pqc-voting-frontend
Frontend for post quantum zero knowledge blockchain e voting system

## Çalıştırma

Gerekenler: Node.js, Docker veya Podman.

```bash
cd web
cp .env.example .env.local   # geliştirme ayarları (gerçek sunucuda değerleri değiştir)
npm install
npm run db:up                # Postgres'i başlatır; Podman kullanıyorsan: podman compose up -d
npm run db:migrate           # tabloları oluşturur
npm run db:seed              # sahte E-Devlet'e test vatandaşlarını ekler
npm run dev                  # http://localhost:3000
```

Test vatandaşları (TCKN / Ad / Soyad):

| TCKN | Ad | Soyad |
|---|---|---|
| 12345678950 | Ayşe | Yılmaz |
| 23456789138 | Mehmet | Kaya |
| 34567891238 | Zeynep | Demir |
| 45678912316 | Ali | Çelik |
| 56789123416 | Elif | Şahin |

Kayıt olduktan sonra verilen kullanıcı ID'si (UUID) ve şifreyle `/login` sayfasından giriş yapılır.
Kapatmak için: `Ctrl+C` ile dev server'ı durdur, Postgres için `docker compose down` (veya `podman compose down`). Veriler silinmez.
Ayrıntılar: [web/README.md](web/README.md)
