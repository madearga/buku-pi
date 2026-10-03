# Panduan Pemeliharaan

Dokumen ini adalah **sumber tunggal** untuk pekerjaan teknis di repositori ini: pintu masuk
perubahan, perintah, pemeriksaan sebelum rilis, dan batas perubahan. Panduan repositori
(`AGENT.md`) hanya mengarahkan ke sini.

## Satu pintu masuk

- `.translation/BRIEF.md` + `.translation/GLOSSARY.md` — aturan terjemahan dan istilah.
- `docs/.vitepress/config/navigation.mts` — nav + sidebar edisi Indonesia; urutan belajar diatur di sini.
- `docs/.vitepress/config/navigation.en.mts` — pasangan English-nya; struktur harus sepadan.
- `docs/.vitepress/config.mts` — bahasa, tema, SEO, hreflang, footer, URL kanonik.
- `package.json` → `npm run check` — pemeriksaan menyeluruh sebelum deploy.

## Struktur direktori

```
docs/                      # akar VitePress — locale Indonesia
docs/en/                   # locale English (path relatif sama dengan edisi Indonesia)
  .vitepress/config.mts    # bahasa, tema, navigasi, SEO, hreflang
  .vitepress/config/       # navigasi & opsi pencarian
  .vitepress/theme/        # tema kustom + komponen
  .vitepress/data/         # data arsip versi (tetap dalam bahasa Inggris resmi)
  guide/ cases/ reference/ plugins/ translations/ journey/ tweets/ releases/
  public/                  # gambar, contoh berkas, favicon (bersama)
  public/en/               # aset khusus English: examples/ + images/diagrams/
  mulai.md lisensi.md 404.md  # peta belajar, lisensi, dan halaman 404 (berpasangan dengan docs/en/)
.translation/              # aturan & glosarium yang dipakai saat menerjemahkan
scripts/                   # pemeriksa konten, konsistensi, i18n, SEO, dan tautan
docs/diagrams/*.html       # sumber diagram dari proyek asal; tidak ikut dibangun/di-deploy
```

## Perintah

```bash
npm install
npm run docs:dev            # server pengembangan
npm run docs:build          # build produksi (docs/.vitepress/dist)
npm run check:content       # semua rujukan lokal bisa diselesaikan
npm run check:consistency   # label nav & prev/next cocok dengan judul halaman
npm run check:i18n          # paritas halaman & struktur edisi ID ↔ EN
npm run check:releases      # konsistensi data arsip versi Pi
npm run check:seo           # canonical, OG, sitemap pada hasil build
npm run check:pages         # anchor/ID di HTML hasil build benar-benar ada
npm run check               # konten + konsistensi + build + SEO + anchor + i18n
npm run sync:pi-releases    # memperbarui data changelog dari sumber resmi
npm run serve:dist          # menyajikan hasil build secara lokal
```

## Pekerjaan rutin

| Pekerjaan | Perintah / langkah |
| --- | --- |
| Memperbarui arsip versi Pi | `npm run sync:pi-releases`, lalu `npm run check:releases` |
| Memeriksa tautan & aset | `npm run check:content` |
| Menyelaraskan label navigasi | `npm run check:consistency -- --fix` |
| Memeriksa anchor hasil build | `npm run docs:build && npm run check:pages` |
| Memeriksa paritas dua edisi | `npm run check:i18n` |
| Merilis | `npm run deploy` (Vercel, lihat README §Deploy) |

## Aturan penulisan

- Bahasa Indonesia, "Anda" untuk pembaca, istilah teknis mengikuti `.translation/GLOSSARY.md`.
- Gunakan **"file"**, bukan "berkas", agar seragam.
- Judul halaman (`frontmatter.title`) adalah sumber kebenaran untuk label navigasi; label sidebar
  boleh lebih pendek, tetapi label `prev.text`/`next.text` harus sama dengan judul halaman tujuan
  (jalankan `npm run check:consistency -- --fix`).
- Di dalam blok kode: perintah, flag, path, dan identifier tidak diubah; teks yang dibaca manusia
  (prompt contoh, materi, keluaran yang diharapkan, komentar) ditulis dalam Bahasa Indonesia.
- Halaman baru di `docs/` dan `docs/en/` harus sepadan strukturnya: jumlah heading, blok kode, item
  daftar, dan baris tabel yang sama. Tautan internal di edisi English selalu berawalan `/en/`.
- Frontmatter: nilai yang mengandung `:` diikuti spasi **harus** dibungkus tanda kutip tunggal.

## Batas perubahan

- Jangan menambahkan locale kedua tanpa menyesuaikan navigasi, pencarian, dan `transformPageData`.
- Jangan menaruh terjemahan ke dalam `docs/.vitepress/data/pi-releases.json`; isinya mengikuti
  changelog resmi berbahasa Inggris.
- Perubahan judul halaman berdampak pada label `prev`/`next` halaman lain dan pada sidebar —
  jalankan `check:consistency` setelahnya.
- Perubahan heading berdampak pada anchor; `check:pages` memverifikasi ID yang benar-benar dirender.
- Aset di `docs/public/` disalin apa adanya; letakkan gambar dan berkas contoh di sana.
- Perubahan pada `.vitepress/config.mts` memengaruhi SEO dan URL kanonik; uji dengan `PI_SITE_URL`
  yang sesuai sebelum deploy.

## Atribusi

Proyek sumber: <https://github.com/xiaomoBoy/pi-bluebook> (MIT) karya penulis aslinya.
Jangan menghapus kredit pada footer, `README.md`, dan `about`. Status lisensi tiap jenis materi
dirinci di `LICENSE-CONTENT.md` dan halaman `/lisensi`.
