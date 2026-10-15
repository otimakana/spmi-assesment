# Website Asesmen Reflektif SPMI

Website siap dihubungkan ke GitHub + Cloudflare Pages + Supabase. Paket berisi formulir publik pretest/posttest (masing-masing 5 soal), refleksi (3 pertanyaan), QR otomatis, API Cloudflare Pages Functions, dan dashboard admin yang meniru struktur PDF Dashboard Refleksi Redoks V3.

## Fitur

- `index.html`: halaman awal berisi tautan dan QR Pretest, Posttest, dan Refleksi.
- `pretest.html`: nama, instansi, 5 soal; skor dihitung di backend.
- `posttest.html`: 5 soal yang sama agar hasil dapat dibandingkan.
- `refleksi.html`: nama, instansi, dan 3 jawaban terbuka sesuai permintaan.
- `dashboard.html`: login admin, ringkasan, distribusi kategori refleksi, topik yang sering disebut, skor pre/post berpasangan, pencarian jawaban, filter, dan ekspor CSV.
- `functions/`: API server-side. Kunci database tidak ditaruh di browser.
- `supabase/schema.sql`: skema database.

## 1. Siapkan Supabase

1. Buat proyek Supabase baru.
2. Buka **SQL Editor**.
3. Jalankan semua isi `supabase/schema.sql`.
4. Di pengaturan API proyek, salin **Project URL**.
5. Buat/salin key server-side yang bersifat rahasia. Gunakan `SUPABASE_SECRET_KEY` jika proyek Anda menyediakan key `sb_secret_...`. Key legacy `service_role` juga didukung melalui `SUPABASE_SERVICE_ROLE_KEY`.
6. Jangan pernah menuliskan key rahasia ke file HTML, JavaScript frontend, atau repositori GitHub.

## 2. Unggah ke GitHub

1. Buat repositori baru, misalnya `asesmen-reflektif-spmi`.
2. Unggah isi folder ini ke **root repositori**, sehingga folder `functions/`, `assets/`, `supabase/`, dan `index.html` berada langsung di root.
3. Pastikan file `.dev.vars` atau file secrets lokal tidak ikut diunggah. File rahasia tidak disertakan dalam paket ini.

## 3. Hubungkan ke Cloudflare Pages

1. Buka Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → hubungkan repositori GitHub tersebut.
2. Untuk proyek HTML statis ini, tidak diperlukan build command; gunakan root repositori sebagai build output directory (`.`). Jangan menaruh `functions/` di dalam folder output lain karena Pages Functions harus berada di root proyek.
3. Selesaikan deployment. Setelah deployment, buka URL `https://nama-proyek.pages.dev`.
4. Pada **Settings → Variables and Secrets**, tambahkan environment variable/secret berikut pada Production (dan Preview jika diperlukan):

| Nama | Isi |
|---|---|
| `SUPABASE_URL` | Project URL Supabase, misalnya `https://xxxx.supabase.co` |
| `SUPABASE_SECRET_KEY` | Key server-side rahasia `sb_secret_...`; atau gunakan variabel `SUPABASE_SERVICE_ROLE_KEY` untuk key legacy |
| `ADMIN_PASSWORD` | Password kuat yang akan digunakan fasilitator untuk dashboard |
| `ADMIN_SESSION_SECRET` | Rahasia acak minimal 32 karakter untuk menandatangani sesi dashboard |

Gunakan **Secret / Encrypt** untuk key rahasia, password admin, dan session secret. Simpan nilai rahasia di password manager pribadi. Jangan masukkan nilainya ke kode.

5. Setelah menambah atau mengubah secrets, jalankan deployment ulang bila diperlukan. Periksa `https://nama-proyek.pages.dev/api/health`. Respons seharusnya menunjukkan `databaseConfigured: true` dan `adminConfigured: true`.

## 4. Cara menggunakan saat acara

- Bagikan/ tampilkan QR dari halaman beranda. QR dibuat otomatis sesuai alamat website yang sedang dibuka; karena itu tidak perlu mengganti URL secara manual setelah deployment.
- Sebelum sesi: peserta memindai QR Pretest.
- Setelah materi: peserta memindai QR Posttest.
- Penutup: peserta mengisi QR Refleksi.
- Fasilitator membuka `/dashboard.html` dan masuk menggunakan `ADMIN_PASSWORD`.
- Tombol **Perbarui data** mengambil data terkini. Tombol ekspor menghasilkan CSV yang dapat dibuka di Excel/Google Sheets.

## 5. Memasangkan pretest dan posttest

Website membuat ID acak otomatis di browser dan menyimpannya di `localStorage`. Nama dan instansi diminta di setiap formulir, sementara ID otomatis digunakan untuk memasangkan hasil pretest/posttest/refleksi. Karena itu peserta sebaiknya memakai perangkat dan browser yang sama pada ketiga tahap. Jika perangkat berganti atau penyimpanan browser dibersihkan, hasil mungkin tidak terpasang sebagai pasangan meskipun nama sama; hal ini disengaja agar dua peserta bernama sama tidak digabung otomatis.

Pengiriman ulang dari ID perangkat yang sama memperbarui jawaban pada tahap yang sama. Ini memudahkan koreksi kiriman, tetapi bukan sistem pencatatan percobaan berulang.

## 6. Catatan dashboard

- Kategori **Sudah memahami / Perlu penguatan / Masih bingung** adalah indikasi otomatis berbasis kata pada jawaban refleksi, bukan penilaian final. Baca jawaban asli sebelum mengambil keputusan.
- Analisis topik memakai pencocokan kata kunci sederhana, sehingga istilah baru atau frasa berbeda mungkin tidak terkelompokkan.
- Dashboard bersifat privat melalui login admin. Supabase tidak memberikan akses langsung dari browser; seluruh data dibaca melalui Cloudflare Pages Functions setelah sesi admin diverifikasi.
- Formulir meminta persetujuan untuk penggunaan jawaban dan identitas dalam evaluasi sesi. Batasi akses dashboard kepada fasilitator yang berwenang dan hapus data sesuai kebutuhan/kebijakan penyelenggara.
- QR dibuat melalui layanan QR eksternal `api.qrserver.com`; yang dikirim ke layanan tersebut hanyalah URL halaman formulir, bukan nama maupun jawaban peserta.

## Struktur folder

```text
SPMI_Asesmen_Web/
├── index.html
├── pretest.html
├── posttest.html
├── refleksi.html
├── dashboard.html
├── assets/
│   ├── styles.css
│   ├── shared.js
│   ├── assessment.js
│   ├── reflection.js
│   └── dashboard.js
├── functions/
│   ├── api/
│   └── _lib/
└── supabase/schema.sql
```

## Troubleshooting

- **API health menyatakan database belum dikonfigurasi:** cek nama environment variable di Cloudflare dan jalankan deployment ulang.
- **Pengiriman gagal:** cek Logs di Cloudflare Pages Functions. Pastikan skema SQL sudah dijalankan dan key server-side benar.
- **Dashboard tidak dapat login:** cek `ADMIN_PASSWORD` dan `ADMIN_SESSION_SECRET`; session secret harus minimal 32 karakter.
- **QR tidak tampil:** tautan biasa tetap tersedia. QR menggunakan layanan eksternal; pastikan jaringan mengizinkan akses ke `api.qrserver.com`.
