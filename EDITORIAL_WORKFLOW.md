# Alur Kerja Artikel Buku Pi

Alur ini dipakai untuk merapikan tweet, artikel panjang, dan praktik nyata menjadi bab yang bisa dipelajari, diverifikasi, dan diterbitkan. Semua model bekerja secara independen terlebih dahulu, lalu editor utama menggabungkan naskah; pendapat model tidak boleh langsung menimpa naskah asli.

## Pembagian Peran

| Peran | Model default | Tanggung jawab | Bukan tanggung jawab |
| --- | --- | --- | --- |
| Editor utama | `gpt-6-astra` | Tujuan pembelajaran, struktur bab, ritme narasi, pengambilan keputusan | Menerbitkan langsung, mengonfirmasi fakta teknis sendirian |
| Verifikasi teknis | `gpt-5.6-sol` | Materi resmi, istilah, perintah, risiko versi, batas keamanan | Menulis ulang pengalaman penulis, menentukan nada artikel |
| Review pemula | `gpt-5.6-terra` | Prasyarat, titik macet operasi, sinyal keberhasilan, pemulihan kegagalan | Memperluas cakupan teknis, menambah fitur lanjutan |
| Editor utama | Tugas utama Codex saat ini | Menggabungkan pendapat, mempertahankan nada penulis, mengubah repositori, build dan verifikasi di browser | Mengganti pemeriksaan nyata dengan ringkasan model |

Model dapat diganti sesuai versi yang tersedia saat itu, tetapi keempat tanggung jawab harus tetap terpisah.

## Urutan Pemrosesan Tiap Artikel

1. **Masukkan materi**: Simpan tweet, artikel panjang, gambar, dan sumber aslinya; jangan langsung menulis ulang di file asli.
2. **Definisikan hasil bab**: Tulis dengan satu kalimat apa yang bisa diselesaikan pembaca setelah belajar, dan daftarkan hasil verifikasi yang bisa diamati.
3. **Review independen tiga jalur**: Editor utama, verifikasi teknis, dan review pemula masing-masing mengembalikan daftar masalah, tanpa saling membaca kesimpulan.
4. **Penggabungan oleh editor utama**: Tulis ulang menurut “skenario → konsep → praktik → verifikasi → langkah berikutnya”, dan hanya masukkan fakta yang didukung naskah asli atau acuan resmi.
5. **Pemeriksaan konten**: Periksa tautan, gambar, perintah, istilah, informasi versi dinamis, dan klaim non-resmi.
6. **Verifikasi situs**: Selesaikan build resmi, lalu periksa judul, teks, tabel, blok kode, navigasi, dan overflow horizontal di desktop dan mobile 390px.
7. **Jejak publikasi**: Commit ke `main`, pastikan deployment Vercel memakai commit terbaru, lalu periksa sampel halaman lewat domain resmi.

## Ambang Publikasi

Penuhi dulu seluruh persyaratan di [`CONTRIBUTING.md`](CONTRIBUTING.md) dan `.translation/BRIEF.md`, lalu pastikan:

- Pembaca tidak perlu menebak di mana materi latihan berada atau dari langkah mana memulai.
- Fakta dinamis yang belum bisa dipastikan ditandai sebagai draf atau menunggu verifikasi, dan tidak ditulis sebagai kesimpulan resmi.
- Kata “selesai” dalam artikel harus bersesuaian dengan file, halaman, hasil perintah, atau diff yang bisa diperiksa secara independen.
