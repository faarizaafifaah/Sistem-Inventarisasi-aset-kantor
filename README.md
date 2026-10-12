# 🏢 Sistem Inventaris Aset PT. Zeea

Sistem Inventaris Aset PT. Zeea adalah aplikasi web sederhana yang dirancang untuk membantu perusahaan mengelola data inventaris aset kantor, memantau kondisi aset, mencatat pelepasan aset (*disposal*), serta mengawasi masa manfaat aset.

Aplikasi ini menggunakan **HTML, CSS, JavaScript, dan Supabase PostgreSQL** sebagai database.

Demo web: https://faarizaafifaah.github.io/Sistem-inventarisasi-/

## ✨ Fitur Utama

- **Dashboard** — Menampilkan ringkasan jumlah aset, aset dalam kondisi baik, aset rusak, dan aset yang telah di-disposal.
- **Data Aset** — Menambah dan mengelola informasi aset kantor, termasuk kode aset, nama aset, kategori, lokasi, tanggal perolehan, harga, kondisi, dan masa manfaat.
- **Disposal Aset** — Mencatat pelepasan aset beserta tanggal, alasan, dan nilai disposal.
- **Aset Rusak** — Mencatat aset yang mengalami kerusakan dan keterangan kondisinya.
- **Kategori Aset** — Mengelompokkan aset berdasarkan jenis, seperti elektronik, furniture, kendaraan, dan peralatan kantor.
- **Pengingat Masa Manfaat** — Menampilkan aset yang mendekati atau telah melewati akhir masa manfaat berdasarkan tanggal perolehan dan estimasi masa manfaat.

## 🛠️ Teknologi yang Digunakan

| Teknologi | Kegunaan |
|---|---|
| HTML5 | Struktur halaman web |
| CSS3 | Desain dan tampilan responsif |
| JavaScript | Logika aplikasi dan interaksi pengguna |
| Supabase | Koneksi API dan layanan database |
| PostgreSQL | Penyimpanan data inventaris aset |
| GitHub | Penyimpanan dan pengelolaan kode sumber |

## 📁 Struktur Folder

```text
SISTEM-INVENTARIS-ASET/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── backend/
    ├── app.js
    └── database.sql
```

### Penjelasan File

- `frontend/index.html` — Halaman utama aplikasi.
- `frontend/style.css` — Pengaturan desain, warna, tata letak, dan responsivitas.
- `frontend/script.js` — Logika aplikasi dan koneksi ke Supabase.
- `backend/app.js` — Dokumentasi konfigurasi backend Supabase untuk versi sederhana ini.
- `backend/database.sql` — Pembuatan tabel, relasi, indeks, kategori awal, dan kebijakan akses database.

## 🗄️ Struktur Database

Database terdiri dari empat tabel utama:

1. **kategori** — Menyimpan daftar kategori aset.
2. **aset** — Menyimpan informasi aset kantor.
3. **disposal** — Menyimpan catatan pelepasan aset.
4. **riwayat_kondisi** — Menyimpan riwayat perubahan kondisi aset.

Relasi utama:

- Satu kategori dapat memiliki banyak aset.
- Satu aset dapat memiliki beberapa catatan riwayat kondisi.
- Satu aset dapat memiliki catatan disposal.

## ⚙️ Persiapan

Sebelum menjalankan aplikasi, siapkan:

- Browser modern, seperti Google Chrome.
- Editor kode, seperti Notepad++.
- Akun Supabase.
- Koneksi internet.

## 🚀 Cara Instalasi dan Menjalankan

### 1. Clone atau Download Repository

Clone repository menggunakan Git:

```bash
git clone https://github.com/USERNAME/SISTEM-INVENTARIS-ASET.git
```

Ganti `USERNAME` dengan nama akun GitHub pemilik repository.

Alternatifnya, klik **Code → Download ZIP** pada halaman repository, lalu ekstrak file ZIP tersebut.

### 2. Buat Proyek Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard).
2. Buat proyek baru.
3. Buka menu **SQL Editor**.
4. Buat query baru.
5. Salin isi file `backend/database.sql`.
6. Jalankan query untuk membuat tabel database.

Jalankan skrip awal tersebut satu kali pada database baru.

### 3. Konfigurasi Koneksi Supabase

Buka file `frontend/script.js`, lalu cari konfigurasi berikut:

```javascript
const SUPABASE_URL = "ISI_PROJECT_URL";
const SUPABASE_KEY = "ISI_ANON_KEY";
```

Ganti nilai tersebut dengan Project URL dan publishable key atau anon key dari proyek Supabase milikmu.

**Penting:** Jangan pernah memasukkan `service_role` key atau kredensial rahasia database ke dalam file frontend maupun repository GitHub.

### 4. Jalankan Aplikasi

Buka folder proyek, kemudian klik dua kali:

```text
frontend/index.html
```

Aplikasi akan dibuka di browser. Jika koneksi Supabase gagal saat dijalankan melalui `file://`, gunakan server lokal sederhana atau hosting statis.

### 5. Uji Fitur Aplikasi

- Tambahkan kategori aset.
- Tambahkan aset baru.
- Periksa ringkasan pada dashboard.
- Coba catat aset rusak.
- Coba catat disposal.
- Periksa pengingat masa manfaat aset.

## ⏳ Perhitungan Masa Manfaat

Sistem memperkirakan akhir masa manfaat dengan menambahkan jumlah tahun masa manfaat ke tanggal perolehan aset.

Contoh:

| Informasi | Nilai |
|---|---|
| Nama aset | Komputer |
| Tanggal perolehan | 1 Januari 2021 |
| Masa manfaat | 5 tahun |
| Perkiraan akhir masa manfaat | 1 Januari 2026 |

Perhitungan ini merupakan estimasi operasional, bukan pengganti perhitungan penyusutan akuntansi atau penilaian kondisi fisik aset.

## 🔐 Catatan Keamanan

Versi awal menggunakan kebijakan akses database yang terbuka untuk keperluan prototipe. Sebelum digunakan untuk data perusahaan yang sebenarnya:

- Terapkan autentikasi pengguna.
- Batasi akses menggunakan Row Level Security (RLS).
- Buat kebijakan akses sesuai peran pengguna.
- Jangan publikasikan data aset yang bersifat rahasia.
- Gunakan kredensial yang sesuai dan jangan unggah secret key.

## 📌 Batasan Versi Saat Ini

Versi awal berfokus pada pencatatan dan pemantauan inventaris. Fitur login, hak akses berdasarkan peran, pengeditan dan penghapusan data, serta laporan yang dapat diekspor belum tersedia dalam implementasi ini.

File `backend/app.js` bukan server Node.js aktif. Aplikasi berkomunikasi langsung dengan Supabase melalui JavaScript frontend.

## 🎯 Tujuan Pengembangan

Aplikasi ini dikembangkan untuk mempermudah pengelolaan inventaris aset kantor PT. Zeea, meningkatkan keteraturan pencatatan, dan membantu pemantauan kondisi serta masa manfaat aset.

## 👩‍💻 Pengembang

**Proyek:** Sistem Inventaris Aset PT. Zeea  
**Kategori:** Aplikasi Web Inventarisasi Aset  
**Database:** Supabase PostgreSQL  
**Status:** Versi awal / prototipe

---

© 2026 PT. Zeea. Sistem Inventarisasi Aset Kantor.
