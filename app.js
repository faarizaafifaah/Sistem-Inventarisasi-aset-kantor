
/*
============================================
BACKEND - SISTEM INVENTARIS ASET PT. ZEEA
============================================

Database:
    Supabase PostgreSQL

File database:
    database.sql

Tabel:
    1. kategori
    2. aset
    3. disposal
    4. riwayat_kondisi

Konfigurasi koneksi Supabase berada di:
    ../frontend/script.js

Cara kerja:
    Frontend -> Supabase API -> PostgreSQL

File ini tidak perlu dijalankan dengan Node.js.
Aplikasi menggunakan Supabase secara langsung,
sehingga tidak memerlukan package.json,
Express, atau file .env.

PENTING:
- Gunakan Project URL Supabase.
- Gunakan publishable key atau anon key.
- Jangan pernah menaruh service_role key di frontend.
- Untuk aplikasi produksi, gunakan autentikasi dan
  kebijakan Row Level Security yang sesuai.
============================================
*/
