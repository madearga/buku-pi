#!/usr/bin/env node
/**
 * Membuat "katalog WebMCP" untuk Buku Pi.
 *
 *   docs/public/webmcp.json          indeks buku (kecil): daftar bab + ringkasan + kata kunci
 *   docs/public/bab/<jalan>.json     isi satu bab (diambil agen hanya bila perlu)
 *
 * Tujuannya: agen tidak perlu mengunduh halaman HTML penuh (~78 KB) untuk menjawab
 * satu pertanyaan; cukup indeks kecil lalu satu bab kecil. Menghemat token & waktu.
 *
 * Ditulis dengan pustaka bawaan Node saja. Jalankan: node scripts/buat-webmcp.mjs
 */

import fs from "node:fs";
import path from "node:path";

const AKAR = path.resolve(process.cwd(), "docs");
const KELUARAN = path.join(AKAR, "public");
const KELUARAN_BAB = path.join(KELUARAN, "bab");
const ABAIKAN = new Set(["public", ".vitepress", "node_modules"]);
const BATAS_RINGKAS = 120;
const BATAS_TEKS = 12000;

const rapikan = (s) =>
  s
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "") // frontmatter
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const judulDari = (teks, jalan) => {
  const h = teks.match(/^#\s+(.+)$/m);
  if (h) return h[1].trim();
  return jalan.split("/").pop().replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const JALAN = [];const jelajahi = (dir) => {
  for (const nama of fs.readdirSync(dir).sort()) {
    if (ABAIKAN.has(nama)) continue;
    const penuh = path.join(dir, nama);
    const st = fs.statSync(penuh);
    if (st.isDirectory()) jelajahi(penuh);
    else if (nama.endsWith(".md") && nama !== "404.md") JALAN.push(penuh);
  }
};
jelajahi(AKAR);

fs.mkdirSync(KELUARAN_BAB, { recursive: true });

const bab = [];
for (const berkas of JALAN) {
  const jalan = path.relative(AKAR, berkas).replace(/\\/g, "/").replace(/\.md$/, "");
  const jalanBersih = jalan === "index" ? "" : jalan.replace(/\/index$/, "");
  const mentah = fs.readFileSync(berkas, "utf8");
  const isi = rapikan(mentah);
  const judul = judulDari(mentah, jalan);
  const paragraf = isi
    .split("\n\n")
    .map((p) => p.replace(/^#.*$/m, "").trim())
    .filter((p) => p.length > 40 && !p.startsWith("|") && !p.startsWith("-"));
  const ringkas = (paragraf[0] || isi.slice(0, BATAS_RINGKAS)).slice(0, BATAS_RINGKAS);

  const bagian = jalanBersih.split("/").filter(Boolean);
  // Repo ini: bahasa Indonesia di akar, Inggris di /en/, Mandarin di /zh-TW/.
  const adaCJK = /[\u3400-\u9fff]/.test(isi.slice(0, 800));
  const bahasa =
    bagian[0] === "en" ? "en" : bagian[0] === "zh-TW" || bagian[0] === "zh" || adaCJK ? "zh" : "id";
  const kataKunci = []; // sengaja kosong: kata kunci memakan ~14 KB dan tidak sepadan
  // (pencarian tetap jalan dari judul + ringkasan + jalur)

  const namaBerkas = (jalanBersih || "beranda").replace(/\//g, "-") + ".json";
  fs.writeFileSync(
    path.join(KELUARAN_BAB, namaBerkas),
    JSON.stringify({ judul, jalan: "/" + (jalanBersih ? jalanBersih + "/" : ""), teks: isi.slice(0, BATAS_TEKS) })
  );

  bab.push({
    jalan: "/" + (jalanBersih ? jalanBersih + "/" : ""),
    judul,
    ringkas,
    bahasa,
    kata_kunci: kataKunci,
    berkas_bab: "/bab/" + namaBerkas,
  });
}

const katalog = {
  buku: {
    nama: "Buku Pi",
    rumah: "https://pi.argakuka.com",
    ringkas:
      "Panduan praktik Pi Coding Agent untuk pemula: instalasi, tugas pertama, model, konteks, ekstensi, hingga rilis.",
    bahasa: ["en", "id"],
  },
  cara_pakai: {
    cari: "unduh /webmcp.json sekali, cari di kata_kunci/judul/ringkas, lalu ambil satu bab lewat berkas_bab.",
    hemat_token: "jangan unduh halaman HTML penuh; ambil satu berkas bab saja.",
  },
  jumlah_bab: bab.length,
  bab,
};

fs.writeFileSync(path.join(KELUARAN, "webmcp.json"), JSON.stringify(katalog));
const ukuran = (p) => (fs.statSync(p).size / 1024).toFixed(1) + " KB";
console.log(`  katalog : ${ukuran(path.join(KELUARAN, "webmcp.json"))} (${bab.length} bab)`);
console.log(`  per bab : rata-rata ${ukuran(path.join(KELUARAN_BAB, fs.readdirSync(KELUARAN_BAB)[0]))}`);
console.log(`  total   : ${(fs.readdirSync(KELUARAN_BAB).length)} berkas bab di docs/public/bab/`);
