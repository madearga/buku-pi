---
title: Mengapa Pi akhirnya menerima MCP
description: 'Pengantar artikel Earendil “You Said No MCP!”: Pi pernah secara terbuka menolak MCP, mengapa pada 0.99.0 ia berubah menjadi dukungan bawaan, apa itu Codemode, dan apa artinya bagi pemula.'
prev:
  text: Mengapa Pi Menyerahkan Sesi dan Konteks ke Tangan Anda
  link: /journey/why-pi-keeps-context-editable
next:
  text: Ditulis di Luar Buku Pi
  link: /journey/
---

<span class="library-status">Catatan belajar · Pengantar artikel</span>

# Mengapa Pi akhirnya menerima MCP

Jika Anda mengenal Pi lebih awal, Anda mungkin ingat situs resminya pernah menulis dengan jelas “tidak mendukung MCP”, dan penulisnya lebih dari sekali menyatakan keraguannya terhadap MCP di podcast maupun artikel. Namun setelah memperbarui ke 0.99.0, Anda akan menemukan bahwa MCP sudah menjadi fitur bawaan Pi. Pada 29 September 2026, Earendil menerbitkan “You Said No MCP!”, yang khusus menjawab perubahan itu.

Pengantar ini merangkum empat pokok artikel itu dengan kata-kata saya sendiri. Jika ingin melihat argumen aslinya, bacalah [teks asli bahasa Inggris](https://earendil.com/posts/you-said-no-mcp/).

## Satu: bukan berubah pendirian secara tiba-tiba, tetapi MCP dan Pi sama-sama berubah

Titik tolak artikel itu sederhana: dunia tidak berhenti. Tim ini sudah mengamati MCP selama setahun terakhir, dan MCP hari ini bukan lagi MCP yang dulu.

Namun “MCP membaik” saja tidak cukup untuk memasukkannya ke inti. Pi sudah punya ekosistem Ekstensi yang matang, dan MCP sejak awal bisa—dan memang pernah—hadir sebagai Ekstensi. Yang benar-benar membuat tim memutuskan memasukkannya ke inti adalah temuan setelah berpikir ulang: **perubahan yang diperlukan untuk mendukung MCP ternyata berguna secara umum bagi Pi.**

## Dua: sebenarnya apa yang berubah

Saya merangkum penilaian dalam artikel itu menjadi tiga lapis:

| Lapis | Penilaian artikel |
| --- | --- |
| Yang dibutuhkan Pi sendiri | Sebuah sandbox yang bisa “dipakai bermain”, yaitu sebuah interpreter. Itu juga yang dibutuhkan MCP. Rangkaian perubahan yang sama juga memudahkan Pi memanggil model klasifikasi seperti Jev. |
| Yang belum diselesaikan MCP | Masalah terbesarnya tetap **sulit dirangkai**. Namun penulisnya berpendapat ini lebih merupakan masalah server MCP yang ada dan cara berbagai Harness memakainya, bukan masalah protokolnya sendiri. |
| MCP yang ideal | Lebih dekat ke “OpenAPI dengan kemampuan penemuan cerdas”: tool mengembalikan data terstruktur, dan dapat ditemukan lewat dokumentasi serta deskripsinya, bukan sekadar dituangkan ke konteks lalu menghemat token dengan mengembalikan teks biasa. |

Artikel itu juga memberi perbandingan: CLI begitu nyaman dipakai karena model dapat merangkai perintah dengan gaya Shell yang ringkas. MCP tidak punya alasan untuk tidak bisa melakukan hal yang sama. Pendekatan Pi adalah mengekspos tool MCP ke sebuah sandbox JavaScript, agar model dapat merangkainya layaknya menulis skrip.

## Tiga: mengapa tidak hanya membuat Codemode, tanpa MCP

Inilah pertanyaan lanjutan yang sudah diantisipasi artikel itu. Jawabannya terbagi dua:

1. **Konfigurasi tool Pi perlu ditingkatkan.** Generasi model terbaru mendukung pemuatan tool secara bertahap, penyisipan pesan sistem di tengah percakapan, dan pengalihan tingkat penalaran; Pi sudah melakukan banyak penyesuaian untuk kemampuan itu beberapa bulan terakhir, tetapi “cara merakit” tool-nya belum menyusul. Di dalam Codemode, setiap tool harus diputuskan: diberikan langsung kepada model, atau hanya terlihat di dalam skrip Codemode. Ekstensi MCP biasa tidak memperoleh metadata yang cukup untuk melakukan hal itu dengan baik.
2. **Ikut ambil bagian lebih berpengaruh daripada menonton dari pinggir.** Tim menilai MCP yang digabungkan dengan Codemode dapat menyelesaikan banyak kelemahan MCP di masa lalu, sedangkan server dan pola pemakaian yang ada masih punya ruang perbaikan. Daripada berdiri di luar lapangan, lebih baik ikut masuk dan mendorong MCP agar enak dipakai bahkan di dalam Harness kecil.

Hal ini sejalan dengan cara tool diungkapkan pada changelog 0.99.0 (langsung, hanya model, Codemode, bertahap, tersembunyi), yang dapat Anda bandingkan di [arsip versi](/releases/#release-v0-99-0).

## Empat: apa itu Codemode

Artikel itu menjelaskannya lewat “batas kepercayaan”. Harness menjalankan tool kira-kira di dua tempat:

- **Tempat Shell berjalan**: biasanya di dalam sandbox yang kurang tepercaya.
- **Tempat Agent loop milik Harness sendiri berjalan**: biasanya lingkungan yang tepercaya.

Yang istimewa dari Codemode adalah ia berjalan di sisi Harness. Paling tepat memahaminya sebagai **mekanisme untuk menata pemanggilan tool**: model dapat memakai JavaScript untuk menentukan urutan pemanggilan, memanggil secara paralel, dan menggabungkan hasil beberapa tool. Karena berjalan di sisi Harness, statusnya disimpan dalam catatan sesi, bukan di filesystem.

Mengapa JavaScript? Penjelasan artikel itu: runtime JavaScript berukuran kecil dapat dikemas menjadi WASM, ukurannya kecil, dan dapat menyediakan isolasi yang wajar. Menurut changelog 0.99.0, Pi memakai sandbox QuickJS.

Di akhir, artikel itu mendemonstrasikan sebuah contoh: di dalam Pi, dengan satu kalimat, minta Codemode menarik issue lewat MCP milik Linear, lalu menyerahkannya ke model klasifikasi Jev untuk menilai nada setiap komentar satu per satu, dan akhirnya merangkum komentar yang paling emosional. Sepanjang proses itu, sebagian besar data perantara diproses di dalam skrip Codemode, bukan dituangkan ke konteks percakapan.

## Apa artinya bagi pembaca Buku Pi

- **Pemula tidak perlu mengubah urutan belajarnya.** Proses tetap dan standar pemeriksaan tetap sebaiknya ditulis sebagai Skill; pekerjaan yang sudah bisa dilakukan CLI tetap dikerjakan dengan CLI dulu. [Cara memilih antara Skill dan MCP](/reference/faq#skill-vs-mcp) di buku panduan referensi sudah diperbarui mengikuti 0.99.0.
- **Jika MCP sudah dikonfigurasi, Codemode dimuat otomatis**; tanpa MCP pun Codemode bisa ditambahkan sebagai tool bawaan. Teks aslinya menyarankan langsung meminta Pi mengubah konfigurasinya sendiri untuk mengaktifkannya.
- **MCP masuk ke inti tidak berarti “makin banyak makin baik”.** Setiap server yang disambungkan menambah biaya penjelasan tool, autentikasi, dan pemeliharaan; pastikan dulu masalah konkret apa yang dipecahkannya, baru sambungkan.

::: info Keterangan
Tulisan ini adalah pengantar pribadi penulis Buku Pi atas artikel Earendil “You Said No MCP!”, bukan terjemahan; rangkuman pendapatnya mengacu pada [teks asli bahasa Inggris](https://earendil.com/posts/you-said-no-mcp/), dan rincian versinya mengacu pada [changelog resmi Pi](/releases/).
:::
