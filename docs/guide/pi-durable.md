---
title: 'Pi Durable: Agent yang terus bekerja setelah interupsi'
description: 'Memahami tugas persisten, pemulihan setelah crash, dan percakapan bersamaan pada Pi Durable lewat demo perencana perjalanan resmi, serta bedanya dengan Pi, tmux, dan file progres.'
prev:
  text: Tugas berdurasi panjang dan VPS
  link: /guide/vps-and-long-running
next:
  text: Pi Durable
  link: /translations/pi-durable
---

<span class="library-status">BAGIAN PILIHAN · PI DURABLE</span>

# Pi Durable: Agent yang terus bekerja setelah interupsi

Bayangkan sebuah Agent sedang mengatur perjalanan: cuaca sudah dicek, museum sudah dicek, jadwal kereta masih dicari, tetapi prosesnya tiba-tiba berhenti. Setelah dibuka kembali, apakah ia dapat mempertahankan dua hasil pertama dan hanya melanjutkan sisa pekerjaannya?

Pada 1 Oktober 2026, Earendil merilis Pi Durable bersama Pi 1.0, dan hal semacam inilah yang ingin dipecahkannya. **Ia adalah kerangka kerja eksperimental bagi pengembang untuk membangun aplikasi Agent yang berjalan lama.** Asisten pemrograman Pi yang biasa Anda pakai di terminal tetap ada; meningkatkan versi Pi tidak otomatis mengubah sesi yang sudah ada menjadi aplikasi Durable.

Setelah membaca bagian ini, Anda seharusnya dapat membedakan berbagai cara pemulihan, memahami apa yang terjadi saat sebuah tugas dipulihkan, dan tahu bagaimana melanjutkan penelusuran lewat contoh perencana perjalanan resmi.

::: info Cakupan verifikasi · 2026-10-02
Bagian ini disusun dari artikel rilis serta README dan kode contoh Pi `v1.0.0`. Langkah di bawah adalah jalur reproduksi contoh resmi, dan bagian ini tidak menandainya sebagai studi kasus yang sudah diuji Buku Pi. API Pi Durable masih mungkin berubah; untuk memahami konsepnya, Anda tidak perlu memasangnya.
:::

## Menyimpan sesi, mempertahankan proses, dan memulihkan tugas: apa bedanya?

Buku Pi sudah pernah membahas [tmux dan VPS](/guide/vps-and-long-running), dan juga menyediakan latihan [memulihkan tugas lewat file progres](/cases/checkpoint-recovery). Ketiganya punya kegunaannya masing-masing:

| Cara | Apa yang ditinggalkan | Bagaimana melanjutkan setelah interupsi |
| --- | --- | --- |
| Catatan sesi Pi dan `progress.md` | Percakapan, serta progres pekerjaan yang dituliskan secara eksplisit oleh tugas | Manusia atau sesi baru membaca catatan, memeriksa file, lalu memutuskan langkah berikutnya |
| tmux | Sesi terminal yang masih berjalan beserta proses di dalamnya | Sambungkan kembali setelah SSH terputus; jika prosesnya sendiri sudah berhenti, perlu penanganan terpisah |
| Pi Durable | Percakapan, checkpoint tugas, pesan yang mengantre, dan status aplikasi | Proses baru membuka penyimpanan persisten yang sama, lalu melanjutkan tugas yang belum selesai |

Durable menangani logika pemulihan di dalam tugas itu sendiri. Membuat layanan yang sudah berhenti hidup kembali tetap menjadi tanggung jawab aplikasi atau process manager. Ia juga tidak menggantikan tugas Anda untuk memeriksa apakah file akhirnya sudah benar.

## Kenali dulu empat komponennya

<strong>Percakapan (Conversation)</strong> menyimpan catatan interaksi antara manusia dan Agent, beserta model, tool, dan instruksi yang dipakai percakapan itu. Aplikasi dapat menjalankan beberapa percakapan sekaligus, atau bercabang dari riwayat yang sudah ada.

<strong>Tugas (Task)</strong> adalah unit pekerjaan yang sedang berjalan. Satu permintaan model, satu pemanggilan tool, satu pemadatan, semuanya bisa menjadi tugas. Tugas menyimpan checkpoint saat maju, sehingga proses baru tahu apa yang sudah selesai dan apa yang masih menunggu.

<strong>Penyimpanan (Storage)</strong> menampung semua status itu. Kerangka kerja ini menyediakan backend in-memory, SQLite, dan JSONL. Untuk pulih antarproses, diperlukan SQLite, JSONL, atau backend persisten lain yang dipertahankan; backend in-memory akan hilang bersama prosesnya. Penyimpanan yang sama pada satu waktu dipegang oleh satu proses, dan beberapa klien terhubung ke proses tersebut.

<strong>Lingkungan eksekusi (Execution Environment)</strong> menentukan di mana tool sebenarnya bekerja. Harness dan tool dapat berada di mesin yang berbeda. Lingkungan eksekusi Node bawaan dapat mengakses file lokal, tetapi ia sendiri bukan sandbox yang terisolasi.

Konsep-konsep ini berputar pada satu pertanyaan yang sama: selain isi obrolan, status apa lagi yang perlu disimpan agar pekerjaan benar-benar dapat dilanjutkan?

## “Melanjutkan” tidak selalu mulai dari baris yang sama

Yang dipulihkan kerangka kerja ini adalah status tugas, bukan proses sistem operasi yang dibekukan lalu dihidupkan kembali.

| Pekerjaan yang terputus | Penanganan Pi Durable |
| --- | --- |
| Balasan model yang sedang dihasilkan | Permintaan dikirim ulang; jawaban sebagian yang lama tetap di catatan dan ditandai sebagai dibatalkan |
| Tool yang menyatakan `replay: "safe"` | Dapat dijalankan ulang, misalnya kueri yang hanya membaca |
| Tool yang tidak menyatakan aman dijalankan ulang | Keadaan terputus beserta output yang sudah tersimpan diberitahukan ke model, dan model memutuskan langkah berikutnya |
| Klien mencoba lagi input yang sama | Mencari kembali pengiriman asal lewat `requestId` yang sama, agar tidak terkirim dua kali |

Di sini penting membedakan “input tidak terkirim dua kali” dari “setiap operasi eksternal hanya dijalankan sekali”. Tindakan seperti pembayaran, pengiriman pesan, dan deploy di luar basis data tetap memerlukan perancangan idempotensi atau logika kompensasi di sisi aplikasi. Kode pembayaran pada teks asli pun secara eksplisit memakai idempotency key dan penanganan pengembalian dana.

Percakapan panjang juga punya batas: pesan lama boleh tetap tersimpan, tetapi permintaan saat ini tetap dibatasi jendela konteks model. Durable memakai pemadatan latar belakang untuk melanjutkan percakapan; ini tidak berarti model dapat melihat seluruh riwayat setiap saat.

## Lihat dulu demo perencana perjalanan

[Rekaman asli pada terjemahan lengkap](/translations/pi-durable#coba-sendiri) menampilkan sebuah Agent perencana perjalanan. Agent utama menyerahkan riset kepada sub-Agent, dan sub-Agent menjalankan tiga pencarian—cuaca, museum, dan kereta—secara bersamaan; sementara itu, Agent utama tetap dapat mengobrol dengan pengguna.

Pada contoh resminya, ketiga pencarian masing-masing menunggu sekitar 6 detik, 10 detik, dan 30 detik, lalu mengembalikan data yang sudah disiapkan. **Yang didemonstrasikan adalah tugas paralel dan pemulihannya, bukan kueri cuaca atau tiket secara waktu nyata.** Pemanggilan model tetap memerlukan kredensial model yang tersedia, dan dapat menimbulkan biaya pemakaian.

Pada rekaman itu, hasil cuaca dan museum sudah kembali, pencarian kereta belum selesai, lalu prosesnya berhenti. Setelah sesi asli dibuka kembali, hasil yang sudah selesai masih ada, dan pencarian kereta yang boleh dijalankan ulang dijalankan lagi. Setelah laporannya selesai, laporan itu diserahkan ke Agent utama sebagai pesan, dan Agent utama merapikannya menjadi rencana perjalanan.

Sub-Agent di sini dibangun oleh aplikasi memakai tool dan percakapan terpisah. Durable menyediakan mekanismenya, dan tidak menetapkan satu bentuk produk sub-Agent untuk semua aplikasi.

## Kalau ingin mencoba, mulai dari contoh resmi

Perintah berikut dikunci pada **Pi `v1.0.0`**, agar langkahnya tidak kehilangan kaitan ketika `main` berubah. Anda memerlukan Git, Node.js **22.19.0 atau lebih baru**, npm, serta model yang sudah dapat dipakai dengan normal di dalam Pi.

Periksa dulu Node di terminal biasa:

```bash
node --version
```

Lalu buka Pi yang biasa Anda pakai, selesaikan autentikasi dengan `/login` di kotak input Pi, dan pilih satu model bawaan yang tersedia. Setelah memastikan percakapan biasa bisa menjawab, keluarlah. Demo perjalanan ini memakai ulang kredensial dan pengaturan Pi, dan tidak punya `/login` sendiri.

### 1. Ambil kode sumber di direktori terpisah

Di direktori tempat Anda menyimpan proyek eksperimen, jalankan perintah berikut di terminal biasa. `pi-durable-demo` adalah direktori kode sumber yang baru dibuat; jika direktori dengan nama itu sudah ada, ganti dengan nama lain.

```bash
git clone --branch v1.0.0 --depth 1 https://github.com/earendil-works/pi.git pi-durable-demo
cd pi-durable-demo
npm install
npm run build
```

Hasil yang diharapkan adalah instalasi dependensi dan build selesai dengan sukses. Jika build gagal, periksa dulu versi Node dan pesan kesalahannya; jangan melewati build lalu langsung menjalankannya.

### 2. Jalankan perencana perjalanan

Masih di **akar repositori kode sumber Pi** yang tadi, jalankan:

```bash
node packages/coding-agent/src/experimental/vacation/main.ts
```

Setelah antarmuka terminal demo muncul, kirim:

> Susun akhir pekan di Wina untuk dua orang, dan serahkan riset cuaca, museum, dan kereta kepada sub-Agent.

Jalankan sekali sampai selesai dulu, agar Anda terbiasa dengan pintu masuk `/agents` untuk berpindah antara sesi utama dan sub-Agent, serta `/tasks` untuk melihat peta tugas. Setelah melihat laporannya benar-benar sampai ke sesi utama, barulah coba langkah berikutnya.

### 3. Amati pemulihan setelah interupsi

Mulai sesi demo baru dan ajukan permintaan yang sama. Amati daftar tugas, dan ketika cuaca serta museum sudah selesai sementara kereta masih berjalan, keluar dengan `Ctrl+C` seperti dijelaskan pada panduan demo resmi. Kecepatan balasan model berbeda-beda, jadi waktu mulai ketiga tugas pun bisa berbeda; gunakan status tugas yang sebenarnya sebagai acuan.

Setelah itu, di **direktori kerja yang sama**, jalankan:

```bash
node packages/coding-agent/src/experimental/vacation/main.ts --continue
```

`--continue` memilih sesi demo terbaru di direktori saat itu. Datanya disimpan di:

```text
~/.pi/agent/experimental/vacation-sessions/<cwd-hash>/<session>/session.sqlite
```

Tanda kurung siku di atas menandakan direktori yang dibuat oleh program, dan tidak perlu Anda buat sendiri. Sebelum memulihkan, jangan menghapus file datanya dan jangan berpindah direktori kerja, karena bisa jadi sesi lain yang terbuka.

### 4. Verifikasi lewat status dan hasil

Pengamatan kali ini seharusnya dapat menjawab pertanyaan berikut:

- Setelah dipulihkan, apakah sesi asli dan hasil pencarian yang sudah selesai masih ada?
- Apakah dua tugas yang sudah selesai, cuaca dan museum, tidak dijalankan ulang?
- Apakah pencarian kereta yang belum selesai dan aman dijalankan ulang benar-benar berjalan lagi sampai selesai?
- Apakah laporan akhirnya sampai ke sesi utama, dan apakah rencana perjalanannya mengutip hasil-hasil itu?

Klaim Agent bahwa “pemulihan berhasil” saja belum cukup; bandingkan status tugas dengan laporan yang sebenarnya. Jika setelah dimulai ulang Anda mendapat sesi kosong, periksa dulu apakah `--continue` sudah dipakai, apakah Anda masih di direktori kerja yang sama, dan apakah file SQLite aslinya masih ada. Jika muncul kesalahan autentikasi, kembalilah ke Pi biasa untuk memeriksa login dan konfigurasi model bawaannya.

## Kapan layak mempelajarinya lebih jauh?

Jika Anda terutama menulis kode, menyunting artikel, atau menyelesaikan tugas sekali jalan di terminal, teruskan saja memakai Pi beserta sesi dan file progres yang sudah ada.

Pi Durable baru mulai terasa berguna ketika Anda hendak membangun bot yang aktif terus-menerus, alur kerja yang diikuti banyak pengguna, atau aplikasi yang perlu melanjutkan beberapa percakapan dan tugas latar belakang setelah restart. Ia juga mendukung dokumen status aplikasi, penggantian Ekstensi secara panas, dan langganan banyak orang pada percakapan yang sama; kemampuan itu perlu dirangkai sendiri oleh pengembang, dan bukan layanan Slack atau situs obrolan banyak pengguna yang siap pakai.

Langkah berikutnya adalah membaca [terjemahan lengkap resminya](/translations/pi-durable), lalu membandingkannya dengan bahan versi terkunci berikut. Potongan kode pembayaran, persetujuan, dan deploy pada teks asli dipakai untuk menjelaskan mekanismenya; layanan eksternalnya perlu Anda implementasikan sendiri, dan bukan aplikasi lengkap yang bisa langsung disalin dan dijalankan.

## Sumber dan bacaan lanjutan

- [Earendil: artikel rilis Pi Durable](https://earendil.com/posts/pi-durable/)
- [Pi v1.0.0: README Durable](https://github.com/earendil-works/pi/blob/v1.0.0/packages/durable/README.md)
- [README perencana perjalanan: menjalankan, memulihkan, dan direktori sesi](https://github.com/earendil-works/pi/blob/v1.0.0/packages/coding-agent/src/experimental/vacation/README.md)
- [Kode sumber perencana perjalanan: pencarian tiruan dan waktu tunggu](https://github.com/earendil-works/pi/blob/v1.0.0/packages/coding-agent/src/experimental/vacation/vacation.ts)
- [Persyaratan lingkungan paket Durable](https://github.com/earendil-works/pi/blob/v1.0.0/packages/durable/package.json)
- [Lebih dari tiga puluh contoh resmi](https://github.com/earendil-works/pi/tree/v1.0.0/packages/durable/test/examples) · [Contoh asisten pemrograman kecil](https://github.com/earendil-works/pi/tree/v1.0.0/packages/coding-agent/src/experimental/durable)
