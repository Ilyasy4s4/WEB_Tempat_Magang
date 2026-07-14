# Perbaikan Dashboard Admin — cara pasang

Semua file di sini tinggal **timpa (replace)** file yang sama di project
`my-web-app/src/...` kamu (struktur foldernya sama persis, tinggal copy-paste).

## Apa yang diperbaiki

1. **Dashboard Admin belum tersambung ke backend sama sekali.**
   `BidangStore`, `KriteriaStore`, `PerusahaanAdminStore` sebelumnya cuma data
   dummy hardcoded (disimpan ke localStorage). Sekarang ketiganya manggil
   `lib/api.ts` yang beneran (GET/POST/PUT/DELETE ke `/bidang`, `/criteria`,
   `/companies`), dan semua halaman Index/Create/Edit di
   `dashboard/Admin/Bidang`, `Kriteria`, `Perusahaan` sudah disesuaikan
   (fetch on load, loading state, error banner, field disesuaikan dengan
   skema Prisma di backend).

2. **Bug di `Layout/DashboardLayout.tsx`:** sidebar sebelumnya membandingkan
   *function* `state.role` (bukan `state.role()`/`state.user?.role`) dengan
   string `"superadmin"` — padahal role asli dari backend adalah
   `"super_admin"`. Akibatnya perbandingan itu **selalu salah**, jadi:
   - Super Admin ikut ke-render pakai menu sidebar punya Admin.
   - Menu "Universitas" nongol di sidebar Admin padahal backend membatasi
     endpoint itu hanya untuk `super_admin` (bakal 403 kalau diklik admin).
   - Nama profil di header hardcoded ("Hanif Sang Fajar"/"Gusti Rizqi"),
     sekarang pakai nama user yang beneran login.

   Sudah diperbaiki + menu "Universitas" di sidebar Admin diganti dengan
   link ke "Sistem Pendukung Keputusan" (`/dashboard/spk`, halaman yang
   sudah ada tapi sebelumnya tidak ada link-nya di sidebar).

3. **Kelola Bidang dibuat read-only untuk role Admin** (sesuai pilihan kamu).
   Backend memang sengaja membatasi create/update/delete bidang hanya untuk
   `super_admin` (bidang bersifat global lintas kampus). Sekarang:
   - Admin cuma bisa lihat daftar bidang, tombol tambah/edit/hapus disembunyikan.
   - Halaman Create/Edit bidang otomatis redirect balik kalau diakses
     bukan oleh `super_admin` (jaga-jaga kalau ada yang coba akses langsung
     lewat URL).

## Yang perlu kamu cek sendiri

- Field **website & email perusahaan** dihapus dari form, karena tabel
  `companies` di database kamu memang tidak punya kolom itu. Kalau memang
  butuh, tambahkan dulu kolomnya di `schema.prisma` + migrate, baru saya bisa
  sambungkan ke form.
- Field **deskripsi & jumlah perusahaan** di tabel Bidang juga saya hapus dari
  form karena tabel `bidang` cuma punya `id, name, slug`. "Jumlah Perusahaan"
  sekarang dihitung otomatis di frontend dari data Perusahaan yang match
  `bidang_id`-nya.
- Pastikan `.env` frontend (`VITE_API_URL`) mengarah ke backend yang jalan,
  default-nya `http://localhost:3000`.
- Coba jalanin backend (`npm run dev` di folder BE) baru buka Dashboard Admin
  di FE — data Bidang/Kriteria/Perusahaan sekarang harusnya kebaca langsung
  dari database, bukan dummy lagi.
