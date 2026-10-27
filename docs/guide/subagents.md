---
title: Bagaimana Subagent membagi tugas
description: Pahami kolaborasi Subagent dari empat sisi, yaitu peran, input, hasil, dan verifikasi.
prev:
  text: Kebutuhan dan verifikasi Extension
  link: /guide/first-extension
next:
  text: 'Cara kerja Pi: Dari satu Prompt hingga satu Agent Loop utuh'
  link: /guide/how-pi-works
---

<span class="library-status">MODULE 04 · STEP 12 · bisa dilatih</span>

# Bagaimana Subagent membagi tugas

Satu Agent dapat menyelesaikan banyak hal sendiri. Ketika sebuah tugas sekaligus membutuhkan pemeriksaan teknis, penyuntingan teks, dan pengecekan oleh pengguna nyata, membagi pekerjaan kepada beberapa Subagent barulah mungkin menghemat waktu.

Hingga 2026-09-09, pihak resmi secara jelas menyatakan bahwa inti Pi tidak memiliki Subagent bawaan; yang disediakan repositori kode resminya adalah contoh Extension. Tidak terlihatnya tombol pembagian kerja di antarmuka bukan berarti pemasangan gagal. Pelajaran ini mula-mula menyelesaikan struktur pembagian kerja yang sama dengan dua sesi terpisah, tidak mewajibkan pemasangan Package komunitas, dan tidak menuliskan latihan manual sebagai kemampuan bawaan.

## Tugas seperti apa yang cocok dibagi

Subtugas yang cocok dijalankan secara paralel memiliki dua ciri: batasnya jelas dan dapat diserahkan secara mandiri. Misalnya, satu pembaruan konten Buku Pi ini dapat dibagi menjadi:

| Peran | Input | Hasil |
| --- | --- | --- |
| Pembaca pemula | Bab instalasi | Menemukan bagian yang membuat pembaca bingung harus mengetik di mana dan melihat hasil apa |
| Pemeriksa teknis | Dokumentasi resmi dan bab teknis | Mendaftar pernyataan yang sudah usang, tidak akurat, atau kurang batasnya |
| Pemimpin redaksi | Bab lengkap dan jalur belajar | Memeriksa pengulangan, langkah yang terlewat, dan keterputusan sebelum-sesudah |

Situasi yang tidak cocok untuk paralel adalah ketika beberapa Agent mengubah file yang sama pada saat yang sama, tetapi tidak ada pemilik yang jelas. Ini sangat mudah menimbulkan penimpaan, konflik, dan standar yang tidak konsisten.

## Cara menulis pembagian kerja yang dapat diverifikasi

Penjelasan yang diberikan kepada Subagent setidaknya memuat:

- Hanya menangani file atau masalah tertentu.
- Boleh mengubah atau hanya memeriksa secara read-only.
- Bukti apa yang harus dikembalikan saat selesai.
- Penilaian mana yang harus dikembalikan kepada Agent utama dan tidak boleh memperluas cakupan sendiri.

Tanggung jawab Agent utama bukan sekadar mengirim tugas lalu selesai. Ia harus menggabungkan hasil, menangani konflik, menjalankan pemeriksaan menyeluruh, dan bertanggung jawab atas hasil akhir.

## Jangan memperbesar tim terlalu dini

Jika Anda belum dapat menuliskan tugas yang bisa diverifikasi untuk satu Agent, menambah Subagent biasanya hanya akan membuat masalah semakin sulit dipahami. Selesaikan dulu tiga sampai lima tugas nyata dengan satu Agent, baru kemudian bagikan bagian yang sudah stabil, mandiri, dan berulang.

<a id="choose-subagents"></a>

## Cara memilih Ekstensi Subagent

Selesaikan dulu studi kasus pembagian kerja manual di bawah ini, baru putuskan apakah memasang. Berikut adalah pengecekan materi per **2026-10-12**; keempatnya adalah proyek tidak resmi. Versi, status pemeliharaan, dan izin mengacu pada masing-masing repositori, bukan peringkat jumlah unduhan.

| Proyek | Versi, pemasangan, dan pemeliharaan | Skenario yang cocok dan batasnya |
| --- | --- | --- |
| [badlogic/pi-subagent](https://github.com/badlogic/pi-subagent) | Daftar internalnya `0.1.0`, paket privat, tanpa versi npm publik atau Release; README memakai pemasangan clone kode sumber dan symlink CLI, serta memerlukan Node.js 22.19 dan tmux. Commit terakhir 30 September, tidak diarsipkan, tanpa pintu masuk Issues; tidak ditemukan lisensi. | Cocok bagi yang terbiasa tmux dan ingin melihat sub-sesi secara langsung; tidak mendukung nesting. Kode sumber publik tidak berarti sudah punya lisensi open source, periksa izinnya sebelum dipakai; jalur pemasangan dan prasyarat SSH dikonfirmasi lewat README. |
| [nicobailon/pi-subagents](https://github.com/nicobailon/pi-subagents) | `0.77.0`, MIT; `pi install npm:pi-subagents@0.77.0`. Dirilis 10 Oktober, masih ada commit pada tanggal 11, tidak diarsipkan. | Cocok bagi yang membutuhkan peran bawaan seperti reviewer, scout, dan oracle serta delegasi latar depan dan belakang; konfirmasi dulu model, tool, dan perilaku latar belakang yang benar-benar dipilih setiap peran. |
| [tintinweb/pi-subagents](https://github.com/tintinweb/pi-subagents) | `0.20.0`, MIT; `pi install npm:@tintinweb/pi-subagents@0.20.0`, memerlukan Pi 1.1.0. Dirilis 9 Oktober, masih ada commit pada tanggal 11, tidak diarsipkan. | Cocok bagi yang ingin memindahkan kebiasaan Agent dan alur kerja ala Claude Code; nesting dimatikan secara default, pembatasan tool sub-item tidak otomatis mewarisi induknya dan perlu dikonfigurasi satu per satu. |
| [pi-subagent-manager](https://github.com/championswimmer/pi-subagent-manager) | `0.25.0`, MIT; `pi install npm:pi-subagent-manager@0.25.0`, memerlukan Pi 0.99.2 dan Node.js 22.19. Dirilis dan di-commit pada 11 Oktober, tidak diarsipkan. | Cocok bagi yang membutuhkan pohon path, nesting, serta jeda dan lanjut; direktori kerja dan izin sistemnya dipakai bersama, dan kebijakan tool-nya bukan sandbox. |

Hanya item pertama yang alur pemasangannya dari kode sumber; langkah pemasangannya lihat [README proyek](https://github.com/badlogic/pi-subagent#install), dan pelajaran ini tidak memelihara salinan skrip symlink sendiri. Alamat `earendil-works/pi-subagent` yang dipakai README-nya saat ini dialihkan ke repositori penulisnya, jadi jangan menganggapnya produk resmi karena itu.

Batasan ini sejalan dengan [halaman rekomendasi plugin](/plugins/#subagents): sebelum memasang, baca dulu kode sumber, dependensi, dan isi pemasangannya, lalu pakai direktori latihan terisolasi tanpa materi nyata; pemanggilan model tambahan bisa menambah biaya. Pasang satu dalam satu waktu, karena beberapa Ekstensi bisa berebut perintah seperti `/agents`. Prompt dan daftar tool tidak dapat menggantikan isolasi sistem.

Perintah di tabel dipakai untuk memeriksa asal pemasangan, dan pelajaran ini tidak mewajibkan menjalankannya satu per satu. Jika setelah mencoba satu item npm Anda beralih ke item lain, hapus dulu yang lama dengan `pi remove` dan sumber yang sama, lalu pastikan ia hilang lewat `pi list`; pemasangan kode sumber ditangani sesuai README proyeknya.

### Reproduksi minimal pengelola

Pada 2026-10-12, `pi-subagents@0.77.0` dipasang pada konfigurasi dan direktori latihan terpisah, lalu dengan Pi 1.1.0 didelegasikan satu `delegate` latar depan yang dipatok ke `deepseek/deepseek-flash:off` dengan permintaan hanya membalas `BLUEBOOK_CHILD_OK`. Tes tanpa perubahan file ini secara eksplisit memakai `acceptance.level: "none"` yang didukung dokumentasinya, dan penanda balasannya diperiksa sendiri oleh pengelola; catatan event tool mencatat satu subtugas, kode keluar `0`, hitungan tool `0`, dan sesi utama menerima penanda yang sama. Setelah itu ia dihapus dengan sumber yang sama, dan `pi list` menampilkan tidak ada Package.

Yang terverifikasi hanya satu delegasi latar depan ini; konkurensi, latar belakang, nesting, pemulihan setelah restart, dan tiga Ekstensi lainnya tidak diuji, jadi jangan menuliskannya sebagai “keempatnya terverifikasi bisa dipakai”.

## Praktik pendamping: CASE 05 · Dua jalur review independen

Pelajaran ini tidak lagi memelihara langkah operasional kedua. Masuk ke [CASE 05 · Dua jalur review independen](/cases/independent-review), dan berlatih sekali secara lengkap sesuai materi tetap, tiga sesi, teks tugas asli, verifikasi independen, dan pemulihan kegagalan di dalamnya.

Studi kasus ini sengaja memisahkan dua jalur review, lalu sesi utama menggabungkan buktinya. Yang dilatih adalah batas subtugas dan tanggung jawab penggabungan, bukan menuliskan sesi manual sebagai fitur Subagent bawaan inti Pi.

## Verifikasi pelajaran ini

- Bisa menjelaskan tugas mana yang cocok dipisah, dan file mana yang harus punya hanya satu pemilik akhir.
- Bisa menuliskan untuk setiap jalur: input, izin baca-saja atau ubah, bukti penyerahan, dan hal yang belum diketahui.
- Sudah memeriksa dua hasil independen dan catatan penggabungan sesi utama sesuai CASE 05, atau dapat menjelaskan dengan tepat hubungan verifikasinya.
- Bisa menjelaskan: ini adalah latihan manual atas metode pembagian kerja, dan bukan berarti inti Pi memiliki Subagent bawaan.

### Dasar bab ini

- [Prinsip desain dalam Panduan penggunaan Pi](https://pi.dev/docs/latest/usage#design-principles)
- [Indeks contoh Extension resmi Pi](https://pi.dev/docs/latest/extensions#examples-reference)

Tanggal verifikasi asli batas kemampuan inti adalah 2026-09-09; materi Ekstensi dan reproduksi minimal di atas dicatat terpisah pada 2026-10-12.

- [pi-subagents v0.77.0](https://github.com/nicobailon/pi-subagents/releases/tag/v0.77.0)
- [tintinweb v0.20.0](https://github.com/tintinweb/pi-subagents/releases/tag/v0.20.0)
- [Versi dan lisensi pi-subagent-manager](https://github.com/championswimmer/pi-subagent-manager/blob/main/package.json)
