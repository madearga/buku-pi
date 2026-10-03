---
title: “Anda Dulu Bilang Tidak Butuh MCP!”
description: 'Terjemahan bahasa Indonesia lengkap dari artikel resmi Earendil Engineering “You Said No MCP!”: mengapa Pi akhirnya mendukung MCP, dan apa itu Codemode.'
prev:
  text: 'Jika pemrograman sudah terpecahkan, lalu apa? — Mengukur kekasaran kode'
  link: /translations/measuring-code-sloppiness
next:
  text: Pi 1.0
  link: /translations/pi-1-0
---

<span class="library-status">Terjemahan berlisensi resmi Earendil · 12</span>

# “Anda Dulu Bilang Tidak Butuh MCP!”

> - **Judul asli**　*“You Said No MCP!”*
> - **Penulis**　Earendil Engineering `<rfc@earendil.com>`
> - **Tanggal terbit**　2026-09-29
> - **Alamat asli**　[earendil.com/posts/you-said-no-mcp](https://earendil.com/posts/you-said-no-mcp/)
> - **Pernyataan lisensi**　Diadaptasi dan diterjemahkan dengan izin dari Earendil (*Adapted and translated with permission from Earendil.*)
> - **Lisensi terjemahan**　[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans)

Jika Anda pernah mengunjungi pi.dev, Anda akan melihat sebuah pernyataan yang cukup bangga: Pi tidak mendukung [MCP](https://en.wikipedia.org/wiki/Model_Context_Protocol). Jika Anda pernah mendengar podcast kami yang membahas Pi, Anda juga lebih dari sekali mendengar penilaian kami yang meremehkan MCP. Mario bahkan [pernah menulis artikel khusus](https://mariozechner.at/posts/2025-11-02-what-if-you-dont-need-mcp/) tentang itu. Namun, jika Anda memperbarui Pi sekarang, Anda akan menemukan bahwa Pi sudah mendukung MCP. Ada apa ini?

## Keadaan sudah berubah

Pertama, ingatlah bahwa [dunia tidak berhenti seperti itu](https://lucumr.pocoo.org/2016/11/5/be-careful-about-what-you-dislike/). Selama setahun terakhir kami terus mengamati MCP, dan MCP hari ini sudah tidak sama dengan dulu. Meski begitu, hal itu saja belum cukup menjadi alasan untuk memasukkannya ke inti. Anda juga tahu bahwa Pi punya ekosistem Ekstensi yang bagus; MCP sepenuhnya bisa dibuat sebagai Ekstensi, bukan? Bahkan bisa sebagai Ekstensi yang diakui resmi oleh Earendil. Ya, Anda benar: MCP memang dapat disediakan sebagai Ekstensi, dan [dulu memang begitu](https://github.com/nicobailon/pi-mcp-adapter).

Kini MCP menjadi bagian dari inti Pi, dan itu keputusan yang kami ambil setelah berdiskusi dan berpikir ulang bersama-sama.

## Sebenarnya apa yang berubah?

Kami memasukkan MCP ke inti bukan hanya karena MCP sendiri berubah, tetapi juga karena kami menemukan bahwa perubahan yang diperlukan untuk mendukungnya ternyata berguna secara umum. Misalnya, perubahan yang kami lakukan untuk MCP juga memudahkan penggunaan Jev di dalam Pi. Pada akhirnya, yang dibutuhkan Pi mirip dengan yang dibutuhkan MCP: sebuah sandbox yang disediakan dalam bentuk interpreter, tempat kita bisa berkarya.

Meskipun MCP sudah membaik dalam banyak hal, masih banyak masalah yang belum terselesaikan. Masalah terbesarnya tetap sama, yaitu sulit dirangkai menjadi satu kesatuan. Bahkan dengan Codemode—sebuah sandbox kecil yang memudahkan penggabungan pemanggilan tool—MCP masih belum memuaskan dalam hal ini. Namun, pada titik ini, itu lebih merupakan masalah server MCP yang ada dan cara berbagai Harness memakainya, bukan masalah MCP itu sendiri.

Banyak server MCP masih dibangun untuk Harness yang langsung menuangkan seluruh daftar tool ke dalam konteks, dan berusaha menghemat token di sisi server dengan mengembalikan teks. Kami sekarang lebih suka memandang MCP sebagai sesuatu yang mendekati OpenAPI, sekaligus memiliki kemampuan penemuan tool yang cerdas. Artinya, tool seharusnya mengembalikan data terstruktur, dan seharusnya dapat ditemukan berdasarkan dokumentasi serta deskripsinya.

Tool command-line (CLI) begitu nyaman dipakai karena Agent dan model dapat merangkai berbagai hal dengan trik Bash yang efisien. Namun pada dasarnya, MCP tidak punya alasan untuk tidak bisa melakukan hal yang sama. MCP di dalam Pi berarti mengekspos tool-tool tersebut ke sebuah sandbox JavaScript; Harness lain seperti Codex juga memakai pendekatan serupa.

## MCP pada LLM modern

Ini membawa kita pada sebuah pertanyaan: mengapa kami tidak hanya membuat Codemode saja, tanpa memasukkan MCP? Sebagian jawabannya terletak pada cara Pi saat ini mengungkapkan dan mendeskripsikan tool. Beberapa bulan terakhir ini kami banyak bekerja agar Pi dapat menyesuaikan diri dengan kemampuan model baru, misalnya memuat tool secara bertahap, menyisipkan pesan sistem di tengah percakapan, dan menyesuaikan tingkat penalaran. Namun kami belum memperbarui sistem konfigurasi tool, agar dapat lebih memanfaatkan kemampuan baru itu dan mendukung jumlah tool yang lebih besar.

Di lingkungan yang memakai Codemode, perlu diputuskan apakah sebuah tool diberikan langsung kepada LLM, atau hanya kepada bagian Codemode milik LLM. Ekstensi MCP biasa tidak dapat memperoleh cukup metadata dari sistem konfigurasi tool Pi, sehingga pengalaman seperti itu sulit diwujudkan dengan baik. Karena itu, kami perlu memastikan tool dapat dikonfigurasi untuk dimuat secara bertahap, maupun dikonfigurasi agar hanya tersedia bagi Codemode.

Tentu saja, kami juga bisa sekadar membenahi metadata itu agar Ekstensi MCP dapat bekerja lebih baik. Tetapi kami juga berpendapat bahwa MCP yang digabungkan dengan Codemode sudah menyelesaikan banyak masalah MCP di masa lalu. Kami yakin cara terbaik untuk memberi pengaruh positif pada sesuatu adalah dengan merangkulnya. Meskipun kami menilai MCP sekarang jauh lebih baik daripada sebelumnya, server dan pola pemakaiannya masih punya ruang untuk diperbaiki.

Karena itu, kami ingin ikut ambil bagian dalam diskusi dan membantunya berkembang menjadi bentuk yang cocok untuk Harness kecil, bukan berdiri di pinggir lapangan menonton.

## Apa itu Codemode?

Setelah berbicara sekian lama tentang Codemode, sudah waktunya menjelaskan apa sebenarnya itu. Ketika Harness menjalankan tool, secara garis besar ada dua sisi: satu sisi tempat Bash berjalan, dan sisi lain tempat Agent loop milik Harness berjalan. Tingkat kepercayaan kedua sisi itu sangat berbeda. Agent loop Harness sering berjalan di lingkungan yang tepercaya, sedangkan tool yang dijalankannya sering berjalan di sandbox yang tingkat kepercayaannya lebih rendah.

Yang istimewa dari Codemode adalah ia berjalan di sisi tempat Harness berada. Ia dapat dipahami sebagai mekanisme untuk menata dan mengoordinasikan pemanggilan tool. Ia adalah sandbox yang memungkinkan Agent menentukan urutan pemanggilan tool dengan lebih luwes, dan merangkai pemanggilan tersebut memakai JavaScript. Karena Codemode juga berjalan di sisi Harness, statusnya disimpan sebagai bagian dari catatan sesi, bukan di filesystem.

Secara teori bahasa apa pun bisa dipakai, tetapi JavaScript sangat menarik: implementasi JavaScript berukuran kecil dapat dikemas menjadi binary WASM untuk didistribusikan, sekaligus menyediakan perlindungan yang wajar.

Di dalam Pi, Codemode dimuat otomatis ketika Anda mengonfigurasi MCP, dan ia juga dapat ditambahkan ke konfigurasi sebagai tool bawaan. Cukup minta Pi mengubah konfigurasinya sendiri untuk mengaktifkan Codemode! Setelah itu Anda bisa melakukan banyak hal menarik dengannya, dan tidak terbatas pada MCP. Misalnya, ketika provider yang Anda masuki menyediakan “Jev”, Anda dapat mengajukan permintaan seperti ini:

> Pakai typesafe/jev lewat Codemode untuk menemukan 20 komentator paling tidak puas di sistem pelacakan issue kami.

Pi akan dengan cerdik menggabungkan Linear MCP dan kemampuan seperti Jev di dalam Pi untuk menyelesaikan analisis itu, sama sekali tanpa membuang konteks.

Berikut pemutaran ulang ringkas dari salah satu sesi Pi semacam itu.

<PiCodemodeReplay />

::: details Buka versi teks bahasa Indonesia dan kode lengkapnya

> Pakai typesafe/jev lewat Codemode untuk menemukan orang paling tidak puas di sistem pelacakan issue kami.

Saya akan mengambil issue yang belum ditutup dari Linear, lalu meminta Jev menilai nada setiap utas, empat sekaligus secara paralel.

**codemode**

```javascript
const { issues } = await tools.mcp__linear__list_issues({
  team: "Pi", state: "open", limit: 250,
});
const jev = await models.getModelOfType(
  "classifier", "cloudflare-workers-ai", "typesafe/jev",
);
const questions = {
  frustration: {
    type: "choice",
    instructions: "Judge ONLY the emotional tone of the people writing. " +
      "Ignore how severe the bug is.",
    criteria: {
      none: "Neutral, factual, or friendly, even about a serious bug",
      mild: "Explicit annoyance, impatience, or disappointment",
      high: "Clearly angry, exasperated, sarcastic, or fed up",
    },
  },
};

const results = [];
let next = 0;
async function worker() {
  while (next < issues.length) {
    const issue = issues[next++];
    const { comments } = await tools.mcp__linear__list_comments({
      issueId: issue.identifier,
    });
    const c = await models.classify(jev, { state: { ...issue, comments }, questions });
    results.push({ id: issue.identifier, title: issue.title, ...c.answers.frustration });
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);
store("frustration", results);

const score = (r) => r.probabilities.mild * 0.5 + r.probabilities.high;
const counts = {};
for (const r of results) counts[r.choice] = (counts[r.choice] ?? 0) + 1;
const flagged = results.filter((r) => r.choice !== "none");
flagged.sort((a, b) => score(b) - score(a));
return {
  total: results.length,
  counts,
  flagged: flagged.map((r) => `${r.id} ${r.title}`),
};
```

```text
... (331 earlier calls)
✓ mcp__linear__list_comments {"issueId":"PI-4714"} 255ms
✓ mcp__linear__list_comments {"issueId":"PI-3200"} 354ms
✓ models.classify cloudflare-workers-ai/typesafe/jev 756ms
✓ models.classify cloudflare-workers-ai/typesafe/jev 750ms

{
  "total": 167,
  "counts": {
    "none": 156,
    "mild": 11
  },
  "flagged": [
    "PI-7740 TUI after /reload does not follows custom tool's re…",
    "PI-9566 context size defaults to 128k despite the real size…",
    "PI-10031 Pi sporadically stuck in \"Working...\" when thinking…",
    "PI-4714 [feature] /update TUI command instead of pi update",
    "PI-5916 Support provider extensions with model aliases and…",
    "PI-7547 [Windows] [sink-thread] How do you use Pi on window…",
    "PI-6907 Add an Installation section to the README",
    "PI-6212 Proposal: Bedrock path should honor `compat.forceAd…",
    "PI-9932 before_agent_start: forced system prompt keeps tool…",
    "PI-7730 High CPU usage on Mac OS with long session",
    "PI-6600 pi update --extensions and npm scripts: npm 11.16.0…"
  ]
}
```

Sebagian besar diskusi di sistem pelacakan issue itu berjalan tenang. Jev menilai 156 dari 167 issue yang belum ditutup sebagai netral, 11 sebagai ketidakpuasan ringan, dan tidak ada satu pun yang dinilai sangat tidak puas.

Beberapa contoh yang paling mencolok adalah:

- PI-6907: README tidak memuat petunjuk instalasi (“ini cukup menjengkelkan”).
- PI-10031: Pi tersangkut di status “Working...” setelah Esc ditekan saat proses berpikir.
- PI-4714: mengharapkan adanya perintah `/update` (“benar-benar menyebalkan”).
- PI-7730: pemakaian CPU terlalu tinggi pada sesi panjang di macOS.

Hasil penilaian setiap issue sudah disimpan sebagai `frustration` di dalam Codemode, sehingga saya dapat menelusuri salah satunya lebih dalam tanpa perlu mengambil ulang issue-issue tersebut.

:::

——

Mengenai Jev, Codemode, dan lain-lain, kami akan terus membahasnya nanti. Kami berharap artikel ini dapat menunjukkan bahwa seiring dunia terus berubah, kami pun akan terus menyesuaikan dan memperbarui Pi dengan hati-hati.

::: info Catatan penerjemah
Artikel ini adalah terjemahan bahasa Indonesia lengkap dari teks asli Earendil Engineering. Pemutaran ulang dinamis memakai data demo dari teks asli dan mempertahankan antarmuka berbahasa Inggris; kode dan hasil keluaran pada versi teks dipertahankan seperti aslinya, sedangkan penjelasan percakapannya diterjemahkan ke bahasa Indonesia. Terjemahan bahasa Indonesia beserta bagian adaptasinya diterbitkan di bawah [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans) berdasarkan lisensi; hak cipta teks asli bahasa Inggris dimiliki Earendil. Jika ada ambiguitas antara bahasa Indonesia dan teks asli, [teks asli bahasa Inggris](https://earendil.com/posts/you-said-no-mcp/) yang menjadi acuan.
:::

## Baca selanjutnya

- [Teks asli bahasa Inggris: “You Said No MCP!”](https://earendil.com/posts/you-said-no-mcp/)
- [Sebelumnya: Mengukur tingkat kekasaran kode](/translations/measuring-code-sloppiness)
- [Kembali: Daftar terjemahan berlisensi resmi](/translations/)
