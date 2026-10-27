---
title: Studi kasus pilihan · Mengamati pemulihan checkpoint dengan Pi Durable Assistant
description: Tanpa mengisi API Key, jalankan personal Agent berbasis Pi Durable di komputer Anda, simulasikan crash proses di tengah tugas panjang, lalu periksa sendiri apakah tugasnya berlanjut sampai selesai dan apakah ada eksekusi berulang.
prev: { text: CASE 08 · Proyek akhir, link: /cases/graduation-project }
next: { text: 'Pi Durable: Agent yang terus bekerja setelah interupsi', link: /guide/pi-durable }
---

<span class="library-status">Studi kasus pilihan · Dapat dilatih</span>

# Mengamati pemulihan checkpoint dengan Pi Durable Assistant

## Hasil

Anda menjalankan sebuah personal Agent berbasis web yang dibangun di atas Pi Durable di komputer sendiri, lalu memberinya tugas yang memerlukan menunggu 10 detik; di tengah waktu tunggu itu, prosesnya dipaksa berhenti. Setelah proses dijalankan kembali, tugas menyelesaikan sisa pekerjaannya dari titik terputus: tiga todo masing-masing hanya ditambahkan sekali, waktu tunggu berlanjut dari tenggat waktu aslinya, dan jawaban akhir muncul seperti biasa.

::: info Apa bedanya studi kasus ini dengan CASE 06
[CASE 06](/cases/checkpoint-recovery) menyimpan checkpoint secara manual lewat file progres, dan pemulihannya mengandalkan sesi baru yang membaca file itu. Pada studi kasus ini, checkpoint disimpan otomatis oleh kerangka kerja Pi Durable: setiap pemanggilan model dan setiap eksekusi tool langsung diarsipkan, dan pemulihan tidak memerlukan Anda menulis file progres. Kedua cara menyelesaikan kelas masalah yang sama dengan skenario penerapan yang berbeda: untuk tugas panjang sehari-hari dengan Pi, cara CASE 06 sudah cukup; baru saat mengembangkan aplikasi Agent yang harus tetap online lama, pendekatan kerangka kerja pada studi kasus ini layak dipelajari.
:::

## Materi tetap

- Proyek demo: [Pi Durable Assistant v0.1.0](https://github.com/xiaomoBoy/pi-durable-assistant/releases/tag/v0.1.0), dibangun di atas `@earendil-works/pi-durable@1.1.0`, berlisensi MIT.
- Lingkungan eksekusi: Node.js 22.13 atau lebih baru, npm, dan Git. **Tidak memerlukan API Key, Docker, atau server.**

::: warning Proyek tidak resmi
Pi Durable Assistant adalah proyek open source pribadi penulis asli Buku Pi, dan bukan produk resmi Earendil. Pi Durable sendiri masih berstatus eksperimental dan API-nya bisa berubah; studi kasus ini direproduksi dengan mematok versi di atas.
:::

## 1. Mengambil versi terkunci

Jalankan di direktori latihan:

```bash
mkdir -p ~/Downloads/pi-practice
cd ~/Downloads/pi-practice
git clone --branch v0.1.0 https://github.com/xiaomoBoy/pi-durable-assistant.git
cd pi-durable-assistant
node --version
npm ci
npm run check
```

`node --version` seharusnya menampilkan `v22.13` atau versi lebih tinggi; lanjutkan hanya setelah `npm run check` selesai, prompt terminal muncul kembali, dan tanpa pesan galat.

## 2. Menjalankan dengan model demo

```bash
LLM_API=faux npm run dev
```

Setelah terminal menampilkan “已启动：端口 3000” (“sudah dijalankan: port 3000”), buka `http://127.0.0.1:3000` di browser. Jika port 3000 sudah dipakai, jalankan `PORT=3001 LLM_API=faux npm run dev` sebagai gantinya dan buka port yang sesuai.

Terminal yang menjalankan layanan harus tetap berjalan; perintah terminal berikutnya diketik di jendela lain. Saat latihan selesai, kembali ke terminal layanan dan tekan `Ctrl+C` untuk menghentikannya.

`faux` adalah skrip demo bawaan proyek: tanpa mengakses model sungguhan apa pun, apa pun input Anda, ia menjalankan urutan tetap “buat tiga todo → tunggu 10 detik → centang tiga todo → jawab”. Ia cocok untuk mengamati mekanisme pemulihan, dan **tidak membuktikan kemampuan model sungguhan**.

Yang sebenarnya dijalankan `npm run dev` adalah skrip kecil: proses yang keluar dijalankan ulang otomatis 1 detik kemudian, meniru restart otomatis Docker di server. **Pi Durable tidak menghidupkan kembali proses dengan sendirinya**; yang ditanganinya adalah melanjutkan pekerjaan dari arsip setelah proses dijalankan ulang.

![Antarmuka web Pi Durable Assistant: daftar sesi di kiri, percakapan di tengah, notepad, pengingat terjadwal, tugas persisten, dan status berjalan di kanan](/images/cases/durable-assistant/interface.webp)

Catat dulu **jumlah start** di bagian “status berjalan” kanan bawah; angka itu nanti dipakai untuk membuktikan bahwa proses benar-benar dijalankan ulang.

## 3. Mengirim tugas dan menunggu sampai masuk fase tunggu

Temukan dulu tombol “simulasikan crash proses” di kanan bawah, lalu klik “percakapan baru” dan kirim:

```text
Demonstrasikan tugas persisten
```

Dalam beberapa detik, seharusnya Anda melihat berurutan:

- tiga pemanggilan tool `todo` muncul di percakapan, dan tiga todo muncul di “notepad” kanan;
- kemudian muncul tool `wait_seconds` dengan hitung mundur “tersisa N detik”;
- di “tugas persisten” kanan, “pemanggilan model” berada dalam status menunggu, dan “eksekusi tool” di bawahnya sedang berjalan.

![Tugas yang sedang menunggu: tool tunggu di percakapan sedang menghitung mundur, dan tugas persisten di kanan menampilkan pemanggilan model dalam status menunggu serta eksekusi tool yang sedang berjalan](/images/cases/durable-assistant/waiting.webp)

Tangkapan layar berasal dari run penulis asli di situs demo dengan model sungguhan, sehingga isi tugasnya berbeda dari skrip `faux`; arti area antarmuka dan statusnya sama.

## 4. Menyimulasikan crash di tengah waktu tunggu

Saat hitung mundur tersisa beberapa detik, klik “simulasikan crash proses” di kanan bawah dan konfirmasi pada dialog yang muncul. Server langsung menghentikan prosesnya tanpa proses penutup apa pun. Jika hitung mundurnya sudah terlewat, buat percakapan baru dan kirim tugasnya sekali lagi.

Di bagian atas halaman seharusnya muncul “terputus dari server, menyambung ulang”. Sekitar 1 sampai 2 detik kemudian halaman menyambung ulang secara otomatis.

![Sambung ulang setelah terputus: bagian atas halaman menampilkan pemberitahuan terputus dari server dan sedang menyambung ulang](/images/cases/durable-assistant/reconnect.webp)

## Gejala kunci

| Lokasi pengamatan | Sebelum crash | Yang seharusnya terlihat setelah restart |
| --- | --- | --- |
| Status berjalan · jumlah start | angka yang dicatat tadi | bertambah 1, dan waktu startnya juga berubah |
| Notepad · todo | tiga belum selesai | tetap tiga yang sama, tanpa todo duplikat; setelah waktu tunggu berakhir semuanya tercentang |
| Tool tunggu | hitung mundur sedang berjalan | hitung mundur berlanjut dari tenggat waktu asli, **bukan dimulai lagi dari 10 detik** |
| Akhir percakapan | belum ada jawaban | muncul “tugas demo selesai.” |

Waktu tunggu bisa tersambung karena saat dieksekusi pertama kali, tool tunggu mencatat “pukul berapa berakhirnya” ke memo tugas tersebut (Pi Durable menyebutnya memo). Setelah restart, yang dibaca tetap titik waktu yang sama, sehingga rentang waktu saat proses berhenti ikut diperhitungkan.

## Verifikasi independen

Jangan berhenti pada pernyataan Agent bahwa “sudah selesai”. Periksa item demi item:

1. **Proses benar-benar dijalankan ulang**: jumlah start bertambah 1 dari sebelum crash. Melihat halaman menyegarkan atau tidak saja tidak cukup; di dalam container, nomor proses bisa saja tetap angka yang sama sepanjang waktu.
2. **Langkah yang sudah selesai tidak dikerjakan ulang**: tiga todo yang “ditambahkan” di percakapan masing-masing hanya muncul sekali.
3. **Langkah yang belum selesai dikerjakan sampai tuntas**: catatan penyelesaian waktu tunggu hanya memunculkan “sudah menunggu 10 detik” sekali, hitung mundurnya tidak direset menjadi 10 detik, lalu muncul tiga “selesai” dan jawaban akhirnya.
4. **Status dan catatan konsisten**: status centang di notepad cocok satu per satu dengan catatan “selesai” di percakapan.

Pengelola proyek mereproduksi langkah-langkah di halaman ini secara nyata pada 2026-10-11: crash dipicu sekitar 3 detik setelah waktu tunggu dimulai, dan jumlah start berubah dari 1 menjadi 2 setelah restart; tiga todo masing-masing ditambahkan sekali, catatan penyelesaian waktu tunggu muncul sekali, jarak dari awal tunggu ke langkah berikutnya sekitar 10 detik, dan jawaban akhir muncul seperti biasa.

## Pilihan: dua pengamatan lanjutan

**Satu pengiriman yang sama tidak diterima dua kali.** Saat jaringan tersendat, frontend bisa mengirim kalimat yang sama dua kali. Pi Durable mengizinkan setiap pengiriman membawa satu nomor, dan nomor yang sama hanya diterima sekali. Anda dapat memverifikasinya dengan `curl` di terminal lain (ganti `8` dengan nomor sesi Anda, yaitu angka setelah `#` di address bar browser):

```bash
curl -s -X POST http://127.0.0.1:3000/api/conversations/8/messages \
  -H 'content-type: application/json' \
  -d '{"text":"Demonstrasikan tugas persisten","requestId":"demo-1"}'
```

Jalankan dua kali; `submissionId` yang dikembalikan keduanya harus persis sama, dan di percakapan hanya bertambah satu pesan pengguna.

**Rencana terjadwal melewati crash.** Buka “pusat tugas” di kanan bawah dan buat satu rencana sekali jalan: isikan `periksa status tugas` pada isian konten, `0.25` pada isian penundaan pertama (artinya 15 detik), dan `0` pada isian interval pengulangan. Segera simulasikan crash setelah membuatnya. Setelah restart, rencananya masih ada, dijalankan sekali saat waktunya tiba, dan statusnya berubah menjadi selesai. Saat pengelola mereproduksinya, crash dipicu 4 detik setelah rencana dibuat, dan hasilnya sesuai.

## Pemulihan kegagalan

| Gejala | Penanganan |
| --- | --- |
| `npm ci` menampilkan galat versi Node | Tingkatkan ke Node.js 22.13 atau lebih baru, hapus `node_modules`, lalu jalankan ulang |
| Port sudah dipakai | Jalankan dengan `PORT=3001` untuk mengganti port, lalu buka alamat yang sesuai |
| Setelah klik crash, halaman tidak pernah menyambung ulang | Pastikan Anda menjalankannya dengan `npm run dev`; bila `node server.mjs` dijalankan langsung, tidak ada skrip yang menghidupkan kembali prosesnya |
| “Simulasikan crash proses” mengembalikan 403 | Tombol ini dinonaktifkan secara default di lingkungan produksi; studi kasus ini hanya dilatih dalam mode pengembangan di komputer sendiri |
| Saat clone muncul pemberitahuan direktori sudah ada | Pakai direktori latihan baru, atau pertahankan direktori lama dan ganti namanya; jangan menimpa data lama |
| Ingin mulai dari awal | Tekan `Ctrl+C` untuk berhenti, ganti nama `data/` di direktori proyek sebagai cadangan, lalu jalankan ulang; layanan baru tidak menampilkan sesi dan rencana lama, dan cadangannya masih bisa dipulihkan |

## Mekanisme Pi Durable apa yang sesuai dengan gejala-gejala ini

| Yang Anda lihat di studi kasus ini | Mekanisme Pi Durable | Bacaan lanjutan |
| --- | --- | --- |
| Setelah restart melanjutkan dari titik terputus | Setiap langkah diarsipkan otomatis, dan setelah restart tugas yang belum selesai dicari kembali | [Panduan pengantar Pi Durable](/guide/pi-durable) |
| Waktu tunggu berlanjut dari tenggat asli | Memo tugas, yang saat replay membaca nilai yang sama | [Terjemahan artikel resmi](/translations/pi-durable) |
| Todo tidak ditambahkan dua kali | Tool menyatakan aman dijalankan ulang, dan perubahan serta pencatatannya selesai dalam satu pengiriman yang sama | Sama seperti di atas |
| Notepad dan catatan percakapan konsisten | Document: status aplikasi disimpan bersama catatan yang membuatkannya | Sama seperti di atas |
| Nomor yang sama hanya diterima sekali | Pengiriman ber-idempotensi dengan nomor | Sama seperti di atas |
| Rencana hanya dijalankan sekali saat waktunya tiba | Tugas latar belakang dan pemanggilan terjadwal yang persisten | Sama seperti di atas |

Demo perencana perjalanan resmi menunjukkan hal yang sama dari sudut lain: dari tiga pencarian paralel, yang sudah selesai langsung memakai ulang hasilnya, dan hanya item yang terputus yang dijalankan lagi.

![Diagram prinsip: dari tiga pencarian paralel, cuaca dan museum sudah selesai dan hasilnya tersimpan sebelum proses keluar, dan setelah restart hanya pencarian kereta yang dijalankan lagi](/images/cases/durable-assistant/recovery-diagram.webp)

## Batas kemampuan

- Proyek demo ini adalah proyek pribadi satu pengguna, tanpa akun multi-pengguna dan izin berbutir halus. Sebelum ditaruh di internet publik, minimal diperlukan HTTPS dan kata sandi akses.
- Hanya tool yang menyatakan “aman dijalankan ulang” yang dieksekusi lagi saat pemulihan; tool yang tidak menyatakannya akan membuat model menerima keterangan “pemanggilan ini terputus”, dan model yang memutuskan langkah berikutnya. Tool yang menulis data ke luar harus menjamin sendiri bahwa dijalankan dua kali pun hanya berlaku sekali.
- Halaman web yang sudah diambil, permintaan yang sudah dikirim, dan file yang sudah ditulis ke luar tidak dibatalkan karena pemulihan atau percabangan.

Jika tidak ingin menyiapkan server sendiri, kenali versi Cloudflare-nya, [Pi Durable Edge](https://github.com/xiaomoBoy/pi-durable-edge). Ia berjalan di atas Workers dan Durable Objects dengan tombol deploy sekali klik; saat ini masih versi eksperimental, deploy online dan pemulihan crash-nya masih menunggu pengujian nyata, dan fiturnya juga lebih sedikit daripada proyek di studi kasus ini.

## Dasar

- [Pi Durable Assistant v0.1.0](https://github.com/xiaomoBoy/pi-durable-assistant/releases/tag/v0.1.0) beserta [dokumen memulai cepatnya](https://github.com/xiaomoBoy/pi-durable-assistant/blob/v0.1.0/docs/GETTING_STARTED.md)
- [Pi Durable v1.1.0 README](https://github.com/earendil-works/pi/blob/v1.1.0/packages/durable/README.md)
- [Artikel rilis Pi Durable dari Earendil](https://earendil.com/posts/pi-durable/) beserta [terjemahan berlisensinya](/translations/pi-durable) di buku ini
