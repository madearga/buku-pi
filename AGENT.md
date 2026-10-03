# Panduan Repositori — Buku Pi (Edisi Bahasa Indonesia)

## Posisi proyek

Ini adalah edisi Bahasa Indonesia dari **Buku Pi**: panduan tidak resmi Pi Coding Agent untuk
pemula, dibangun dengan VitePress. Alur belajar tetap sama dengan sumbernya: instalasi, login, dan
tugas pertama yang bisa diverifikasi, lalu file & sesi, konteks, Skill, Extension, subagent, tugas
panjang, dan verifikasi keamanan.

Proyek sumber: <https://github.com/xiaomoBoy/pi-bluebook> (MIT License).
Edisi ini adalah karya turunan; atribusi tidak boleh dihapus.

## File mana yang dibaca lebih dulu

| Tugas | Acuan |
| --- | --- |
| Mengubah navigasi, konfigurasi, gaya, komponen, skrip, atau build & deploy | [`MAINTENANCE.md`](MAINTENANCE.md): pintu masuk perubahan, perintah umum, pemeriksaan, dan alur deploy |
| Menulis atau mengubah materi pelajaran, studi kasus, gambar, dan materi pendukung | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| Merapikan tulisan panjang menjadi bab lalu menerbitkannya | [`EDITORIAL_WORKFLOW.md`](EDITORIAL_WORKFLOW.md) |

Lingkungan: Node.js 22 (lihat `.nvmrc`), npm, VitePress 1.6.4.

Aturan terjemahan dan daftar istilah ada di `.translation/BRIEF.md` dan `.translation/GLOSSARY.md`.
Struktur direktori lihat [`README.md`](README.md)「Struktur proyek」.

## Yang harus dipatuhi

- Situs ini dua bahasa: edisi Indonesia di akar `docs/` dan edisi English di `docs/en/`. Setiap
  halaman baru di satu edisi wajib punya pasangannya di edisi lain dengan struktur yang sepadan
  (judul, blok kode, daftar, tabel); `npm run check:i18n` memverifikasi hal ini.
- Perubahan pada jalur belajar, navigasi, atau berkas halaman harus diikuti pemeriksaan pintu masuk
  dan sidebar di `docs/.vitepress/config/navigation.mts` dan `navigation.en.mts`.
- Jangan menulis dugaan, pernyataan model, atau informasi di luar tangkapan layar sebagai fakta yang
  sudah diverifikasi; konten yang mudah berubah seperti versi, autentikasi, dan dukungan model harus
  mencantumkan tanggal verifikasi.
- Jangan menimpa data `docs/.vitepress/data/pi-releases.json` dengan terjemahan; isinya mengikuti
  changelog resmi berbahasa Inggris.
- Pertahankan konten yang tidak berkaitan dengan tugas saat ini; jangan mengubah materi asli untuk
  menggantikan naskah yang sudah dirapikan.
- Jangan meng-commit `node_modules/`, cache VitePress, hasil build, log, atau kredensial.

## Verifikasi

- Bila hanya mengubah penjelasan repositori, periksa teks, perintah, dan tautan.
- Setelah mengubah pelajaran, navigasi, tema, atau gaya, jalankan `npm run check`.
- Periksa bahwa halaman baru dapat dicapai dari navigasi atau bagian terkait, dan path gambar serta
  materi unduhan valid.
