# ⚡ SuDownloader - Suno AI Song & Lyrics Downloader

Website modern, responsif, dan elegan untuk mengunduh lagu dari link **Suno AI** secara instan.
Dirancang 100% *Client-Side Friendly* sehingga siap langsung di-deploy ke **GitHub Pages** maupun dijalankan di server lokal (XAMPP / Apache).

---

## ✨ Fitur Utama

- **🚀 Instant Auto-Fetch**: Cukup tempel (*paste*) atau ketik link lagu Suno AI (atau ID UUID lagu), sistem otomatis mendeteksi dan mengambil seluruh aset lagu tanpa perlu reload.
- **🖼️ Pratinjau Cover HD**: Menampilkan artwork lagu dalam resolusi tinggi dengan efek *glassmorphism*, fitur *lightbox zoom* modal, serta tombol unduh Cover HD (PNG/JPEG).
- **🎵 Player Audio Interaktif**: Dilengkapi pemutar audio terintegrasi dengan animasi gelombang suara (*waveform canvas*), penunjuk durasi, kontrol volume, dan navigasi waktu instan (*seek bar*).
- **🎼 Multi-Format Audio Downloads**:
  - **MP3**: Audio kualitas tinggi (320 kbps) dengan konversi presisi via *LameJS*.
  - **WAV (Master Lossless)**: Format WAV 16-bit PCM tanpa kompresi yang di-*render* langsung di browser via *Web Audio API*.
  - **M4A / AAC**: Format stream studio asli.
  - **MP4**: Video visual klip resmi dari Suno AI.
  - **📦 Download Paket Lengkap (.ZIP)**: Mengemas lagu (audio), artwork cover HD, dan file lirik (.txt) dalam satu file ZIP dengan *JSZip*.
- **📝 Lirik Terkait & Manajemen**:
  - Menampilkan lirik dengan format bait estetik (penanda otomatis untuk `[Verse]`, `[Chorus]`, `[Bridge]`, dll).
  - Tombol **Salin Lirik (1-Click Copy)** ke clipboard.
  - Tombol **Download Lirik (.TXT)**.
  - Tombol **Download Lirik Sinkron (.LRC)**.
- **🕒 Riwayat Download**: Menyimpan histori lagu yang pernah dibuka ke *LocalStorage* peramban.

---

## 🌐 Cara Deploy ke GitHub Pages (Gratis)

Website ini 100% menggunakan file statis (`HTML`, `CSS`, `JS`), sehingga sangat cocok di-host di **GitHub Pages**:

1. Buat repositori baru di GitHub (misal: `sudownloader`).
2. Masukkan semua isi folder `e:/Xampp/htdocs/sudownloader` ke repositori Anda:
   ```bash
   git init
   git add .
   git commit -m "Initial commit SuDownloader"
   git branch -M main
   git remote add origin https://github.com/USERNAME/sudownloader.git
   git push -u origin main
   ```
3. Buka tab **Settings** di repositori GitHub Anda.
4. Klik menu **Pages** di sebelah kiri.
5. Pada bagian **Build and deployment > Branch**, pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
6. Website Anda aktif dalam hitungan detik di `https://USERNAME.github.io/sudownloader/`!

---

## 💻 Cara Menjalankan di XAMPP Lokal

1. Pastikan Apache di XAMPP Control Panel sedang berjalan (*Running*).
2. Folder sudah berada di `e:/Xampp/htdocs/sudownloader`.
3. Buka peramban (Chrome / Edge / Firefox) dan akses:
   ```
   http://localhost/sudownloader
   ```
4. Sistem otomatis mendeteksi `proxy.php` bawaan lokal untuk bypass CORS berkecepatan maksimal.

---

## 📂 Struktur File

```
sudownloader/
├── index.html       # Tampilan antarmuka utama (Glassmorphism Dark UI)
├── style.css        # Desain gaya CSS modern dengan variabel & animasi neon
├── app.js           # Mesin pengambil data, audio player & multi-format converter
├── proxy.php        # Proxy lokal opsional untuk server XAMPP / Apache
├── libs/
│   ├── jszip.min.js # Library pengemas file ZIP
│   └── lame.min.js  # Library encoder MP3 320kbps di browser
└── README.md        # Panduan penggunaan & instalasi
```
