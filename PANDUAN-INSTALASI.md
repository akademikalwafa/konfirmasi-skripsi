# Panduan Instalasi — Konfirmasi Skripsi

## A. Backend (Google Apps Script)
1. Buka https://script.google.com → **Proyek Baru**. Ganti nama `Code.gs` menjadi `Kode`, lalu tempel seluruh isi `Kode.gs`.
2. Pilih fungsi `setupAppEnvironment` → ▶ Run **(HANYA SEKALI)** → izinkan akses Drive & Sheets. Pastikan log menampilkan ✅.
3. **Deploy → New deployment → Web app**: Execute as **Me**, Who has access **Anyone** → Deploy → salin URL `/exec`.
4. Setiap mengubah `Kode.gs`, lakukan **Deploy → Manage deployments → Edit → New version**.

## B. Frontend
1. Ekstrak ZIP. Buka `js/config.js`, ganti `XXXX` dengan URL `/exec` tadi.
2. Folder yang di-`git init` adalah folder hasil ekstrak (`konfirmasi-skripsi`) — yang langsung berisi `index.html`, `css/`, `js/`. Jangan masuk lebih dalam atau naik satu level.
3. Lanjut deploy ke GitHub Pages (Public repo, branch `main`, folder `/ (root)`).

## C. Pengaturan awal (WAJIB)
- Kode mahasiswa awal: **1234**; admin awal: **admin / admin123** → ganti di menu *Pengaturan*.
- Hapus 3 data contoh sebelum impor data asli (hapus lewat detail mahasiswa, atau impor lalu hapus manual di Sheet).
- Uji alur unduh Excel dan pembatalan konfirmasi sebelum link dibagikan.
