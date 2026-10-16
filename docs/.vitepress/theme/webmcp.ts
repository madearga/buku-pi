/**
 * WebMCP untuk Buku Pi.
 *
 * Mendaftarkan kemampuan buku ini sebagai tool yang bisa dipanggil agen
 * (peramban yang mendukung WebMCP). Sengaja dimuat malas dan hanya berjalan
 * di peramban, supaya pengunjung biasa tidak menanggung bebannya.
 *
 * Sumber data: /webmcp.json (indeks kecil) dan /bab/<berkas>.json (satu bab).
 * Semua hanya membaca berkas statis situs ini; tidak mengirim apa pun.
 */

let katalog: Promise<any> | null = null;

function ambilKatalog() {
  if (!katalog) {
    katalog = fetch("/webmcp.json", { cache: "force-cache" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("katalog tidak terbaca"))))
      .catch(() => ({ buku: { nama: "Buku Pi", rumah: "https://pi.argakuka.com" }, bab: [] }));
  }
  return katalog;
}

const potong = (teks: string, batas = 2000) =>
  teks.length > batas ? teks.slice(0, batas) + `\n… (dipotong; lengkap: lihat tautan)` : teks;

export async function pasangWebMcp() {
  const mc = (globalThis as any)?.navigator?.modelContext;
  if (!mc || typeof mc.provideContext !== "function") return false;

  const daftar = await ambilKatalog();
  const bab = Array.isArray(daftar.bab) ? daftar.bab : [];
  const absolut = (jalan: string) => new URL(jalan, location.origin).href;

  const tools = [
    {
      name: "info_buku",
      description: "Keterangan singkat Buku Pi: apa isinya, untuk siapa, berapa bab.",
      inputSchema: { type: "object", properties: {} },
      execute: async () => ({
        nama: daftar.buku?.nama ?? "Buku Pi",
        ringkas: daftar.buku?.ringkas ?? "",
        jumlah_bab: bab.length,
        rumah: daftar.buku?.rumah ?? location.origin,
        hemat_token: daftar.cara_pakai?.hemat_token ?? "",
      }),
    },
    {
      name: "cari_buku",
      description:
        "Cari bab Buku Pi berdasarkan kata kunci (judul, ringkasan, atau jalur). " +
        "Kembalikan beberapa bab paling cocok beserta tautannya. Pakai ini dulu sebelum mengambil bab.",
      inputSchema: {
        type: "object",
        properties: {
          kata: { type: "string", description: "kata kunci, mis. 'instalasi', 'konteks', 'ekstensi'" },
          batas: { type: "number", description: "jumlah hasil maksimum (bawaan 5)" },
        },
        required: ["kata"],
      },
      execute: async ({ kata, batas }: { kata: string; batas?: number }) => {
        const k = String(kata ?? "").toLowerCase().trim();
        if (!k) return { hasil: [] };
        const cocok = bab
          .map((b: any) => {
            const teks = `${b.judul} ${b.ringkas} ${(b.kata_kunci ?? []).join(" ")} ${b.jalan}`.toLowerCase();
            let nilai = 0;
            for (const bagian of k.split(/\s+/)) if (bagian && teks.includes(bagian)) nilai += 1;
            if ((b.judul ?? "").toLowerCase().includes(k)) nilai += 3;
            return { b, nilai };
          })
          .filter((x: any) => x.nilai > 0)
          .sort((a: any, b: any) => b.nilai - a.nilai)
          .slice(0, Math.min(Number(batas) || 5, 10))
          .map((x: any) => ({
            judul: x.b.judul,
            ringkas: x.b.ringkas,
            bahasa: x.b.bahasa,
            tautan: absolut(x.b.jalan),
            berkas_bab: absolut(x.b.berkas_bab),
          }));
        return { kata, hasil: cocok, jumlah: cocok.length };
      },
    },
    {
      name: "daftar_bab",
      description: "Daftar seluruh bab Buku Pi (judul, ringkasan singkat, tautan).",
      inputSchema: {
        type: "object",
        properties: { bahasa: { type: "string", description: "saring bahasa: en, id, atau zh" } },
      },
      execute: async ({ bahasa }: { bahasa?: string }) => {
        const pilih = bahasa ? bab.filter((b: any) => b.bahasa === bahasa) : bab;
        return {
          jumlah: pilih.length,
          bab: pilih.map((b: any) => ({
            judul: b.judul,
            bahasa: b.bahasa,
            tautan: absolut(b.jalan),
          })),
        };
      },
    },
    {
      name: "ambil_bab",
      description:
        "Ambil isi satu bab Buku Pi (teks ringkas, dipotong agar hemat token) beserta tautan halamannya. " +
        "Gunakan berkas_bab atau jalur dari cari_buku/daftar_bab.",
      inputSchema: {
        type: "object",
        properties: {
          berkas_bab: { type: "string", description: "mis. /bab/guide-before-install.json" },
          jalan: { type: "string", description: "mis. /guide/before-install/ (alternatif berkas_bab)" },
        },
      },
      execute: async ({ berkas_bab, jalan }: { berkas_bab?: string; jalan?: string }) => {
        let target = berkas_bab;
        if (!target && jalan) {
          const ketemu = bab.find((b: any) => b.jalan === jalan || b.jalan === jalan.replace(/\/?$/, "/"));
          target = ketemu?.berkas_bab;
        }
        if (!target) return { galat: "sebutkan berkas_bab atau jalan yang sah" };
        const r = await fetch(target, { cache: "force-cache" });
        if (!r.ok) return { galat: `gagal mengambil ${target}` };
        const d = await r.json();
        return { judul: d.judul, tautan: absolut(d.jalan ?? jalan ?? ""), teks: potong(String(d.teks ?? "")) };
      },
    },
    {
      name: "buka_halaman",
      description: "Buka satu halaman Buku Pi di peramban pengguna (setelah agen yakin bab mana yang dituju).",
      inputSchema: {
        type: "object",
        properties: { jalan: { type: "string", description: "mis. /guide/before-install/" } },
        required: ["jalan"],
      },
      execute: async ({ jalan }: { jalan: string }) => {
        const tujuan = new URL(jalan, location.origin).href;
        location.assign(tujuan);
        return { dibuka: tujuan };
      },
    },
  ];

  mc.provideContext({ tools });
  return true;
}
