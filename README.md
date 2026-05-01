# JualinAja Bandung

JualinAja Bandung adalah platform iklan baris C2C (Consumer-to-Consumer) yang dirancang khusus untuk warga Bandung. Platform ini memiliki desain "Quiet Luxury" yang ultra-minimalis, memudahkan transaksi jual beli tanpa sistem checkout internal. Pembeli dan penjual akan terhubung secara langsung via WhatsApp untuk Cash on Delivery (COD).

## Fitur Utama

- **Ultra-Minimalist UI**: Desain Quiet Luxury yang difokuskan pada produk.
- **Autentikasi (NextAuth)**: Sistem login dan pendaftaran pengguna yang aman (JWT).
- **Postingan Iklan**: Pengguna dapat memposting iklan lengkap dengan gambar (dioptimasi menggunakan `sharp`).
- **Wishlist**: Simpan iklan untuk dilihat nanti.
- **Manajemen Dashboard**: Lihat, edit, tandai terjual, dan hapus iklan Anda sendiri.
- **Admin Panel**: Sistem moderasi iklan, manajemen user (Banned/Suspend), dan statistik platform.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Styling**: Tailwind CSS v4 & shadcn/ui
- **Autentikasi**: Auth.js / NextAuth v5
- **Gambar**: sharp & react-dropzone

## Persiapan Lokal (Development)

1. **Clone repository ini**
   ```bash
   git clone <repo-url>
   cd jualinaja_bandung
   ```

2. **Jalankan Database via Docker Compose**
   ```bash
   docker-compose up -d
   ```
   *Ini akan menjalankan instance PostgreSQL lokal di port `5432`.*

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Konfigurasi Environment Variables**
   Salin `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```
   Pastikan nilai `DATABASE_URL` Anda sudah benar sesuai yang ada di dalam docker-compose.

5. **Generate & Migrate Database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

6. **Jalankan Seed (Data Awal Admin & Kategori)**
   ```bash
   npm run seed
   ```

7. **Jalankan Server Development**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser.

## Panduan Deploy ke VPS (Production)

Untuk melakukan deploy platform ke VPS (misalnya Ubuntu Server):

1. **Pastikan Docker, Node.js, dan Git sudah terinstall di VPS.**
2. **Setup PostgreSQL menggunakan `docker-compose.yml` di server Anda.**
3. **Konfigurasi `.env` untuk production:**
   - Ubah `AUTH_URL` menjadi domain asli Anda (misal `https://jualinaja.com`).
   - Ubah `AUTH_SECRET` dengan string acak (gunakan `npx auth secret`).
   - Ubah `DATABASE_URL` mengarah ke PostgreSQL produksi.
4. **Build Aplikasi**
   ```bash
   npm run build
   ```
5. **Jalankan Aplikasi dengan PM2 (atau proses manager lain)**
   ```bash
   npm install -g pm2
   pm2 start npm --name "jualinaja" -- start
   ```

## Akun Demo
- **Admin**: `admin@jualinaja.local` / Password: `password123`
