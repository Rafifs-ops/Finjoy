# DOKUMENTASI WEBSITE FINJOY

Aplikasi Android dan IOS akan menggunakan `Capacitor.js` yang akan konversi Nuxt Js menjadi aplikasi android dan ios

## Fitur Utama Aplikasi Kelola
Aplikasi Kelola dirancang untuk membantu pengelolaan keuangan pribadi dengan fitur modern dan cerdas:

- **Dashboard Finansial**: Visualisasi ringkasan saldo cash, total nilai aset investasi (saham & kripto), serta grafik distribusi pengeluaran bulanan yang interaktif.
- **Manajemen Transaksi**: Pencatatan pemasukan dan pengeluaran secara manual dengan sistem kategori yang fleksibel.
- **AI Receipt Scanner (OCR)**: Fitur premium yang memungkinkan pencatatan transaksi otomatis hanya dengan mengunggah foto struk/nota belanja.
- **AI Chat Assistant (Kelola AI)**: Konsultan keuangan pribadi berbasis AI yang dapat diajak berdiskusi tentang strategi keuangan, hemat, hingga analisis kemampuan belanja berdasarkan data riwayat transaksi asli pengguna.
- **AI Daily Insights**: Nasihat keuangan harian yang dipersonalisasi sesuai dengan kebiasaan belanja pengguna.
- **Portfolio Tracker**: Pelacakan aset investasi (Saham & Crypto) dengan integrasi harga pasar *real-time* (Coingecko & API Saham).
- **Budgeting & Debt Management**: Pengaturan batas anggaran per kategori dan pelacakan hutang/piutang agar kondisi finansial tetap terkendali.
- **Multi-Platform Ready**: Dapat diakses melalui browser dan siap dikonversi menjadi aplikasi mobile (Android/iOS) menggunakan Capacitor.js.

## Model AI yang Digunakan
Fitur kecerdasan buatan dalam aplikasi Kelola ditenagai oleh model Large Language Model (LLM) terbaru dari Google:

- **Model**: `Gemini 2.5 Flash`
- **Penyedia**: Google Generative AI
- **Implementasi Fitur AI**:
    - **OCR & Data Extraction**: Digunakan pada fitur Scan Struk untuk mengekstrak nominal, tanggal, deskripsi, dan kategori dari gambar secara presisi.
    - **Natural Language Processing (NLP)**: Digunakan pada Kelola AI untuk memahami konteks pertanyaan keuangan pengguna dan memberikan jawaban yang relevan serta empatik.
    - **Data Analysis**: Digunakan untuk menghasilkan insight harian berdasarkan data transaksi yang tercatat di database.

## Alur Verifikasi Email
### User Meminta OTP:
1. Frontend mengirim email ke `server/api/send-otp.post.ts`.
2. Server menghasilkan 6 digit angka.
3. Server menyimpan email + OTP (dan waktu kedaluwarsa) ke database.
4. Server mengirim email menggunakan Nodemailer. 

### User Memverifikasi OTP:
1. User memasukkan OTP di Frontend.
2. Frontend mengirim email + OTP ke `server/api/verify-otp.post.ts`.
3. Server mencocokkan OTP dari database dan memeriksa apakah sudah kedaluwarsa.
4. Jika cocok, berhasil daftar dan buat sesi login yang udh dibuat.

## Alur Authentikasi:
1. User input credentials dan akan request ke `server/api/auth/login.post.ts`
2. Di server, akan di compare menggunakan bycrypt
3. Jika benar, maka otomatis akan dibuatkan token dengan data id user dengan kadaluwarsa 7 minggu
4. Token akan disimpan di Cookie dengan waktu kadaluwarsa yang telah ditentukan
5. Session akan mengambil token dari cookie di `server/utils/auth.ts`
6. Token tersebut akan diverify lalu didecode untuk mendapatkan id user yang telah diinput di langkah 3
7. Session akan mencari data dengan id tersebut ke database lalu data-data user akan direturn/dimasukan ke session

## Proses Scan Struk:
1. User kirim foto struk ke `server/api/ai/ocr.post.ts`
2. Gemini analisis dan scan struk lalu mereturn data hasil analisis nya sesuai format (field table transactions di db) yang telah ditentukan
3. Data hasil analisis nya akan langsung diterima di frontend untuk menunggu konfirmasi user di `transactions.vue`
4. Jika User sudah approve, maka gunakan data hasil analisis tersebut untuk diinsert ke table transactions di database 

## Alur Kerja Simpan Asset (Saham & Kripto)
### Proses Menyimpan Asset:
1. User memilih tipe asset (Stock/Crypto), memasukkan simbol, dan jumlah asset pada modal di file `app/pages/portfolios/index.vue`.
2. Frontend melakukan request POST ke endpoint `server/api/portfolios/index.ts` dengan membawa data asset tersebut.
3. Server memvalidasi sesi user menggunakan `server/utils/auth.ts` dan menyimpan data asset ke database pada table `portfolio` menggunakan Prisma.
4. Setelah berhasil disimpan, frontend akan memicu fungsi `refreshPortfolios` untuk memperbarui list asset yang ditampilkan.

## Alur Mendapatkan Harga Live
### Proses Fetching Harga:
1. Frontend di `app/pages/portfolios/index.vue` mengidentifikasi daftar simbol asset (saham & kripto) yang dimiliki user maupun daftar default.
2. Untuk Kripto: Frontend memanggil `server/api/crypto.ts` yang akan mengambil harga terbaru dari API Coingecko (Cached 10 menit).
3. Untuk Saham: Frontend memanggil `server/api/saham.ts` yang akan mengambil harga penutupan terbaru dari API Saham yang dikonfigurasi (Cached 10 menit).
4. Hasil harga live tersebut akan dikalkulasi di frontend menggunakan fungsi `getLiveTargetValue` pada file `app/pages/portfolios/index.vue`:
   - **Kripto**: `Jumlah Koin * Harga IDR`.
   - **Saham**: `Jumlah Lot * 100 * Harga Close` (karena 1 Lot = 100 lembar).
5. Nilai estimasi total portofolio ditampilkan secara real-time pada dashboard portofolio user.
