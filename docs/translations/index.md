---
title: Terjemahan Berlisensi Resmi Earendil
description: Terjemahan bahasa Indonesia lengkap dari empat belas artikel Earendil tentang Pi, Agent Harness, MCP, kualitas kode, dan visi perusahaan, yang diterbitkan dengan lisensi resmi Earendil.
prev:
  text: Buku panduan referensi
  link: /reference/
next:
  text: Sesi yang tidak bisa Anda bawa
  link: /translations/session-portability
---

<span class="library-status">Terjemahan berlisensi resmi · AUTHORIZED TRANSLATIONS</span>

# Terjemahan Berlisensi Resmi Earendil

Di sini tersedia terjemahan bahasa Indonesia dari empat belas artikel Earendil tentang Pi, Agent Harness, mekanisme sesi, MCP, kualitas kode, dan visi perusahaan. Keempat belas terjemahan itu telah mendapat lisensi resmi dari Earendil dan diterjemahkan secara utuh sesuai teks aslinya.

Setiap halaman mempertahankan judul asli, penulis, tanggal terbit, dan tautan ke teks asli, serta mencantumkan:

> Adapted and translated with permission from Earendil.

Terjemahan bahasa Indonesia beserta bagian adaptasinya diterbitkan di bawah [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans); hak cipta teks asli bahasa Inggris dimiliki oleh Earendil.

## Urutan bacaan yang disarankan

Enam artikel pertama paling dekat dengan pembelajaran Pi: pahami dulu sesi, pemadatan konteks, dan cache, lalu kenali Harness, dan pahami Pi dari dua sudut pandang, yaitu seorang non-insinyur dan studi kasus performa. Artikel ketujuh hingga kesepuluh merekam latar belakang bergabungnya Pi ke Earendil, serta visi jangka panjang Earendil tentang perangkat lunak yang tepercaya dan personal. Artikel kesebelas membahas lebih jauh penilaian kualitas kode AI. Artikel kedua belas menjelaskan mengapa Pi mengubah pendiriannya dan mendukung MCP, serta bagaimana Codemode membuat model dapat memanggil tool lewat skrip. Artikel ketiga belas dan keempat belas memperkenalkan Pi 1.0 dan Pi Durable yang eksperimental.

| Yang ingin Anda pahami sekarang | Sebaiknya baca dulu | Setelah selesai, kembali ke |
| --- | --- | --- |
| Mengapa Pi dirancang seperti ini | “Apa itu Agent Harness?” “Harness ini milik saya” | [Pengantar](/guide/introduction), [Cara kerja Pi](/guide/how-pi-works) |
| Mengapa percakapan panjang kehilangan detail | Tiga artikel: portabilitas sesi, pemadatan, dan prompt cache | [Modul tiga](/guide/context-and-compaction), [Eksperimen pemadatan](/cases/compaction-before-after) |
| Kalau Agent sudah bisa berjalan, apakah kodenya sudah memenuhi syarat | “Mengukur kekasaran kode” “Pi: Minimal tetapi Efisien” | [Perbaikan kode](/cases/code-repair), [Proyek akhir](/cases/graduation-project) |
| Ingin mengetahui latar belakang penulis dan perusahaan | Pengumuman, refleksi, posisi tertinggi, undangan korespondensi | Sebagai bacaan pilihan, bukan prasyarat instalasi |
| Apakah Pi sekarang bisa memakai MCP | “Anda Dulu Bilang Tidak Butuh MCP!” | [Cara memilih Skill atau MCP](/reference/faq#skill-vs-mcp), [arsip versi](/releases/) |
| Apa bedanya Pi 1.0 dan Durable | “Pi 1.0”, “Pi Durable” | [Poin penting pembaruan](/releases/pi-1-0), [bagian khusus Durable](/guide/pi-durable) |

Jika Anda ingin membaca empat tema—sesi, pemadatan, cache, dan Harness—secara berangkai, Anda bisa lanjut ke [artikel pembacaan berangkai: Mengapa Pi Menyerahkan Sesi dan Konteks ke Tangan Anda](/journey/why-pi-keeps-context-editable). Ini adalah analisis pribadi dan bukan bagian dari keempat belas terjemahan berlisensi di bawah ini.

### 01 Sesi yang tidak bisa Anda bawa

**Judul asli** *The Session You Cannot Take With You*

**Tanggal terbit** 2026-07-30

Membahas mengapa catatan transkrip lokal tidak lagi setara dengan sesi yang utuh ketika sesi bergantung pada ID yang disimpan provider, teks terenkripsi, pencarian terkelola, dan pesan Agent yang tersembunyi; serta syarat apa yang harus dipenuhi oleh API inferensi yang benar-benar portabel.

[Baca terjemahan bahasa Indonesia](/translations/session-portability) · [Lihat teks asli bahasa Inggris](https://earendil.com/posts/session-portability/)

### 02 Mekanisme pemadatan konteks di Pi

**Judul asli** *How Compaction Works in Pi*

**Tanggal terbit** 2026-08-13

Dimulai dari jendela konteks LLM, menjelaskan kapan Pi memicu pemadatan, bagaimana permintaan pemadatan menghasilkan ringkasan serah terima, dan mengapa pemadatan mengatur ulang prompt cache.

[Baca terjemahan bahasa Indonesia](/translations/compaction-in-pi) · [Lihat teks asli bahasa Inggris](https://earendil.com/posts/compaction-in-pi/)

### 03 Prompt cache pada Agent

**Judul asli** *Prompt Caching In Agents*

**Tanggal terbit** 2026-07-22

Menjelaskan cache KV, afinitas sesi, pencocokan prefiks, konfigurasi tool, dan TTL, serta bagaimana cache hit memengaruhi latensi, harga, dan desain Agent pemrograman.

[Baca terjemahan bahasa Indonesia](/translations/prompt-caching) · [Lihat teks asli bahasa Inggris](https://earendil.com/posts/prompt-caching/)

### 04 Apa itu Agent Harness?

**Judul asli** *What is a Harness?*

**Tanggal terbit** 2026-08-20

Dengan analogi harness panjat tebing, menjelaskan system prompt, tool, Agent loop, dan lapisan konversi model, serta mengapa pengguna dapat memiliki dan mengubah Harness-nya sendiri.

[Baca terjemahan bahasa Indonesia](/translations/what-is-a-harness) · [Lihat teks asli bahasa Inggris](https://earendil.com/posts/what-is-a-harness/)

### 05 Agent Harness ada banyak, tetapi yang ini milik saya

**Judul asli** *There are many agent harnesses, but this one is mine.*

**Tanggal terbit** 2026-09-01

Seorang non-insinyur bercerita bagaimana ia berkembang dari tidak berani menanyakan istilah teknis, hingga memakai Pi untuk merapikan kotak masuk dan membuat alat kecil, lalu benar-benar memiliki cara kerjanya sendiri.

[Baca terjemahan bahasa Indonesia](/translations/mine-agent-harness) · [Lihat teks asli bahasa Inggris](https://earendil.com/posts/there-are-many-agent-harnesses-but-this-one-is-mine/)

### 06 Pi: Minimal tetapi Efisien

**Judul asli** *Pi, Minimal and Performant*

**Tanggal terbit** 2026-08-04

Melalui studi kasus Databricks dan Shopify, membahas disiplin konteks Pi, biaya per tugas, dan mengapa “minimal tetapi dapat diperluas” bisa menghasilkan efisiensi yang lebih tinggi.

[Baca terjemahan bahasa Indonesia](/translations/pi-minimal-performant) · [Lihat teks asli bahasa Inggris](https://earendil.com/posts/pi-autoresearch-and-databricks/)

### 07 Pi dan Lefos resmi dirilis

**Judul asli** *Announcing Pi & Lefos*

**Tanggal terbit** 2026-04-08

Earendil mengumumkan akuisisi Pi, bergabungnya Mario Zechner ke tim, dan masuknya Lefos ke tahap Alpha publik.

[Baca terjemahan bahasa Indonesia](/translations/announcing-pi-and-lefos) · [Lihat teks asli bahasa Inggris](https://earendil.com/posts/announcing-pi-and-lefos/)

### 08 Beberapa pemikiran tentang pengumuman hari ini

**Judul asli** *A Reflection on our Announcement Today*

**Tanggal terbit** 2026-04-08

Armin dan Colin menengok kembali titik awal Earendil, dan menjelaskan prinsip jangka panjang serta kepercayaan yang sama di balik Pi, Lefos, dan para pendukung awal.

[Baca terjemahan bahasa Indonesia](/translations/announcement-reflection) · [Lihat teks asli bahasa Inggris](https://earendil.com/posts/announcement-reflection/)

### 09 Posisi Tertinggi

**Judul asli** *The High Ground*

**Tanggal terbit** 2026-02-12

Membahas perubahan perangkat lunak dan komputasi pada 2026 hingga 2031, dan mengajukan gagasan bahwa posisi tertinggi masa depan berada di persimpangan kemampuan, kustomisasi, personalisasi, kesenangan, kesederhanaan, dan kepercayaan.

[Baca terjemahan bahasa Indonesia](/translations/the-high-ground) · [Lihat teks asli bahasa Inggris](https://earendil.com/posts/the-high-ground/)

### 10 Undangan untuk memulai korespondensi

**Judul asli** *An Invitation to Begin a Correspondence*

**Tanggal terbit** 2026-01-18

Earendil mengundang pembaca untuk bergabung dalam korespondensi jangka panjang tentang perangkat lunak, otonomi manusia, dan pemahaman melalui tulisan terbuka dan surel.

[Baca terjemahan bahasa Indonesia](/translations/invitation) · [Lihat teks asli bahasa Inggris](https://earendil.com/posts/invitation/)

### 11 Jika pemrograman sudah terpecahkan, lalu apa?

**Judul asli** *If coding is solved, what now?: Measuring the sloppiness of code*

**Tanggal terbit** 2026-09-10

Berangkat dari metrik seperti jumlah baris kode, tingkat kepanjangan, dan tingkat erosi, membahas mengapa kode AI yang secara fungsi benar tetap dapat membuat basis kode perlahan memburuk; serta dengan bantuan evaluasi pemrograman multi-putaran, menjelaskan keterbatasan penilaian otomatis dan mengapa intuisi serta selera manusia tetap tak tergantikan.

[Baca terjemahan bahasa Indonesia](/translations/measuring-code-sloppiness) · [Lihat teks asli bahasa Inggris](https://earendil.com/posts/measuring-code-sloppiness/)

### 12 “Anda Dulu Bilang Tidak Butuh MCP!”

**Judul asli**　*“You Said No MCP!”*

**Tanggal terbit**　2026-09-29

Pi pernah menyatakan dengan jelas tidak menyertakan MCP, dan kini berubah menjadi mendukungnya. Artikel ini menjelaskan mengapa tim berubah pikiran, apa saja yang berubah pada MCP dan pada Pi, serta apa itu Codemode yang membuat model menulis skrip untuk memanggil tool.

[Baca terjemahan bahasa Indonesia](/translations/you-said-no-mcp) · [Lihat teks asli bahasa Inggris](https://earendil.com/posts/you-said-no-mcp/)



### 13 Pi 1.0

**Judul asli**　*Pi 1.0*

**Tanggal terbit**　2026-10-01

Memperkenalkan pertimbangan desain di balik versi resmi Pi, Codemode, model virtual, pemuatan tool secara bertahap, dan mode layar penuh sebagai bawaan, serta menjelaskan posisi Pi Durable yang berdiri sendiri.

[Baca terjemahan bahasa Indonesia](/translations/pi-1-0) · [Lihat teks asli bahasa Inggris](https://earendil.com/posts/pi-1-0/) · [Poin penting pembaruan 1.0.0](/releases/pi-1-0)

### 14 Pi Durable

**Judul asli**　*Pi Durable*

**Tanggal terbit**　2026-10-01

Memperkenalkan kerangka kerja eksperimental untuk aplikasi Agent yang berjalan lama, lengkap dengan kode dan demo pemulihan setelah crash, percakapan bersamaan, Ekstensi, tugas, pemadatan, status aplikasi, dan kolaborasi banyak pengguna.

[Baca terjemahan bahasa Indonesia](/translations/pi-durable) · [Lihat teks asli bahasa Inggris](https://earendil.com/posts/pi-durable/) · [Bagian pengantar untuk pemula](/guide/pi-durable)

::: info Catatan terjemahan dan lisensi
Hak cipta keempat belas teks asli bahasa Inggris dimiliki oleh Earendil. Terjemahan bahasa Indonesia beserta bagian adaptasinya diterbitkan di bawah [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans) dengan lisensi dari Earendil. Terjemahan ini berupaya setia mempertahankan struktur, pandangan, contoh, gambar, dan tautan teks asli; jika ada ambiguitas, teks asli bahasa Inggris yang bersangkutan yang berlaku. Gambar pendamping teks asli digunakan sesuai lisensi artikel, dan kredit fotografer, pembuat grafik, atau sumber proyek tetap dicantumkan dalam terjemahan.
:::
