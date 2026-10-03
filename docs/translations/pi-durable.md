---
title: Pi Durable
description: 'Terjemahan bahasa Indonesia lengkap dari artikel Earendil “Pi Durable”: berjalan lama, pemulihan setelah crash, percakapan bersamaan, Ekstensi yang dapat dipersistenkan, pemadatan di latar belakang, dan kolaborasi banyak orang.'
prev:
  text: Pi 1.0
  link: /translations/pi-1-0
next:
  text: Terjemahan Berlisensi Resmi Earendil
  link: /translations/
---

<span class="library-status">Terjemahan berlisensi resmi Earendil · 14</span>

# Pi Durable

> - **Judul asli**　*Pi Durable*
> - **Penulis**　Earendil Engineering `<rfc@earendil.com>`
> - **Tanggal terbit**　2026-10-01
> - **Alamat asli**　[earendil.com/posts/pi-durable](https://earendil.com/posts/pi-durable/)
> - **Pernyataan lisensi**　Diadaptasi dan diterjemahkan dengan izin dari Earendil (*Adapted and translated with permission from Earendil.*)
> - **Lisensi terjemahan**　[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans)

::: tip Catatan penerjemah
Artikel ini diterjemahkan lengkap menurut urutan aslinya, mempertahankan semua contoh kode beserta komentar berbahasa Inggris di dalamnya, dan menyertakan langkah-langkah rekaman terminal asli. Model, path, dan layanan eksternal pada contoh mengikuti teks asli dan bukan berarti sudah diuji di lingkungan Buku Pi ini. Pi Durable adalah kerangka kerja eksperimental dan API-nya masih bisa berubah; pengantar singkatnya ada di [Pi Durable: Agent yang terus bekerja setelah interupsi](/guide/pi-durable).
:::

Hari ini, Earendil bersama komunitas Pi [merilis Pi 1.0](/translations/pi-1-0). Ini mencerminkan keyakinan kami: setelah berjam-jam pemolesan, pemeliharaan, dan pengembangan berkelanjutan, Pi kini menjadi fondasi yang kokoh untuk dibangun. Pada saat yang sama, Pi terus berkembang. Bersamaan dengan Pi 1.0, kami merilis paket eksperimental baru bernama Pi Durable. Paket ini dibangun untuk Agent yang dapat berjalan di mana saja, terus bekerja, pulih dengan andal, dan mudah diubah. Kami mengundang Anda bergabung untuk menjadikannya Harness persisten terbaik.

## Mengapa Pi Durable diperlukan?

Pi Coding Agent dirancang untuk dijalankan oleh satu orang di terminal, di komputer lokal atau mesin jarak jauh. Jika prosesnya berhenti, Anda memeriksa apa yang terjadi, lalu menyuruhnya melanjutkan. Inilah yang menjadi fokus dan keahlian Pi 1.0, dan hal itu tidak akan berubah.

Di Earendil, kami ingin membawa teknologi ini kepada semua orang dalam bentuk yang paling sesuai dengan kebutuhan masing-masing. Untuk itu, kami memerlukan Harness yang dapat berjalan di mana saja, diakses dari berbagai antarmuka, mendukung percakapan yang berlanjut tanpa batas, bertahan menghadapi kegagalan internal dan eksternal yang serius, dan memungkinkan beberapa orang mengarahkan Agent yang sama secara bersamaan.

Pi Durable adalah Harness semacam itu. Ia tidak menggantikan Pi Coding Agent, melainkan kerangka kerja untuk membangun berbagai aplikasi Agent, termasuk asisten pemrograman. Ia tidak hanya berbagi kode seperti pi-ai dengan Pi Coding Agent, tetapi juga prinsip minimalis dan mudah dibentuk.

Ia juga memungkinkan kami mengeksplorasi desain bidang ini tanpa mengganggu Pi Coding Agent. Pengalaman yang kami peroleh saat membangun aplikasi Agent dengan Pi Durable, selama terbukti bermanfaat, akan mengalir kembali ke Pi Coding Agent.

## Apa itu Harness?

Setiap orang punya definisinya sendiri tentang Harness. Kami [pernah menulis tentang topik ini](/translations/what-is-a-harness), dan di sini kami memperkenalkannya kembali dalam kaitannya dengan Pi Durable.

Harness adalah penyimpanan, ditambah mekanisme yang diperlukan agar satu atau beberapa percakapan model bahasa besar dapat berjalan secara paralel. Ia menyediakan tool yang dapat dipanggil model, serta lingkungan eksekusi tempat tool tersebut berjalan.

Percakapan adalah interaksi Anda dengan Agent, yang disimpan sebagai catatan transkrip. Agent adalah model bahasa besar, ditambah pengaturan seperti tingkat penalaran, serta tool yang dapat dipanggilnya.

Tool menyelesaikan pekerjaan melalui lingkungan eksekusi. Lingkungan eksekusi bisa berupa laptop Anda, mesin virtual jarak jauh, atau sandbox di memori. Setiap percakapan dapat menentukan sendiri tool dan lingkungan eksekusi mana yang dipakainya.

Semua yang dijalankan Harness, dari pemanggilan model hingga eksekusi tool, adalah tugas.

Seperti bagian lain Pi, Pi Durable dirancang agar Agent Anda dapat memahaminya. Total kode sumbernya, tanpa pengujian, sekitar 15.000 baris, atau kira-kira 150.000 token menurut hitungan GPT dan 250.000 token menurut Claude. Itu pun skenario terburuk. Saat mengembangkan di atas Pi Durable, Agent Anda jarang perlu membaca seluruh kodenya; backend penyimpanan saja menyumbang sekitar 3.000 baris, dan biasanya bisa dilewati.

Berikut ini gambaran singkat Pi Durable: apa yang kami bangun, dan mengapa kami membangunnya begitu.

## Berjalan lama di mana saja

Kami ingin Agent dapat berjalan lama, dan dapat berjalan di mana saja. Saat ini, “di mana saja” berarti di mana pun ada runtime JavaScript.

Di Pi Durable, Harness dibuka di atas sebuah backend penyimpanan. Ia menyertakan penyimpanan in-memory, SQLite, dan JSONL, serta menyediakan rangkaian uji konsistensi dan benchmark agar Anda dapat mengimplementasikan backend sendiri. Kode penyimpanan SQLite dan JSONL tidak memakai API Node, sehingga dengan adaptor kecil ia dapat berjalan di Bun atau Cloudflare Durable Object. Antarmuka penyimpanan sangat kecil dan mudah diimplementasikan di atas sistem yang sudah Anda miliki, misalnya penyimpanan key-value atau Postgres. Pada satu waktu, satu penyimpanan dipegang oleh satu proses, dan klien lain terhubung ke proses tersebut.

Saat memakai SQLite, Harness hanya menyimpan working set di memori: transkrip yang aktif, tugas yang sedang berjalan, dan pengiriman yang menunggu diproses. Sisanya tetap di disk sampai diperlukan. Ukuran transkrip aktif secara alami dibatasi jendela konteks model, karena pemadatan meringkas pesan lama sebelum melampaui jendela. Jadi, meskipun satu percakapan berisi puluhan ribu pesan, ia tetap dapat berjalan dengan pemakaian memori yang wajar.

Tool yang membutuhkan file atau Shell mendapatkannya melalui lingkungan eksekusi. Pi Durable menyertakan lingkungan eksekusi Node yang memberi tool akses ke file lokal. Seperti penyimpanan, antarmuka lingkungan eksekusi juga kecil dan mudah diimplementasikan, sehingga Anda pun dapat memberi tool lingkungan eksekusi jarak jauh. Dengan begitu, Harness dapat berjalan di satu mesin dan tool di mesin lain. Fungsi `env` Anda membangun lingkungan untuk setiap pemanggilan tool berdasarkan direktori kerja percakapan, sehingga tiap percakapan bisa berjalan di tempat berbeda.

``` typescript
import { BACKGROUND_CONTEXT } from "@earendil-works/chord/context";
import { createModels } from "@earendil-works/pi-ai/models";
import { openaiProvider } from "@earendil-works/pi-ai/providers/openai";
import { createRegistry, Harness } from "@earendil-works/pi-durable";
import { NodeExecutionEnv } from "@earendil-works/pi-durable/env/node";
import {
    openNodeSqliteStorage,
} from "@earendil-works/pi-durable/storage/sqlite/node";
import { CodingTools } from "@earendil-works/pi-durable/tools";

const context = BACKGROUND_CONTEXT; // every call takes a context for cancellation
const models = createModels();
models.setProvider(openaiProvider());

const registry = createRegistry();
registry.install(CodingTools); // read, write, edit, bash

const env = ({ cwd }: { cwd?: string }) =>
    new NodeExecutionEnv({ cwd: cwd ?? process.cwd() });
const harness = await Harness.open(
    await openNodeSqliteStorage("./agent.sqlite"),
    { models, registry, env },
    context,
);
// The root conversation: created on first use, and the same one after every
// restart.
const root = await harness.root(context, {
    agent: {
        model: { provider: "openai", modelId: "gpt-6.1-sol" },
        cwd: "/work/repo",
    },
});
```

## Bertahan menghadapi crash

Kami ingin Agent tetap dapat pulih setelah prosesnya berhenti, apa pun penyebabnya—laptop tertidur, kontainer di-deploy ulang, atau mesin kehabisan memori—dan melanjutkan dari titik terakhir.

Di Pi Durable, setiap langkah dalam satu kali jalan adalah tugas, dan checkpoint disimpan sebelum maju. Jika proses berhenti, proses baru membuka penyimpanan yang sama, menemukan tugas yang belum selesai, lalu melanjutkan dari checkpoint terakhir masing-masing. Permintaan model yang terputus akan dikirim ulang; sebagian jawaban yang sudah dihasilkan tetap tersimpan di transkrip dan ditandai sebagai dibatalkan. Pemanggilan tool yang terputus akan dijalankan ulang jika aman diulang; jika tidak, model menerima pemberitahuan bahwa pemanggilan itu terputus.

Pi Durable tidak menyertakan sub-Agent bawaan, tetapi sub-Agent dapat dibangun hanya dengan beberapa baris kode; tool triage di bawah ini menunjukkannya. Sub-Agent berjalan di percakapannya sendiri, sehingga ia juga dapat melanjutkan dari titik terputus. Tool sub-Agent yang aman dijalankan ulang akan menemukan kembali sub-Agent yang sama, lalu menunggu jawabannya. Pesan yang sudah masuk antrean tetap berada di antrean. `requestId` membuat satu pengiriman hanya diterima sekali (exactly-once), sehingga ketika klien mencoba lagi setelah crash, ia menerima pengiriman yang sama, bukan mengajukan pertanyaan dua kali.

``` typescript
const job = {
    type: "input",
    content: "Fix the flaky login test",
    requestId: "job-42",
} as const;
await root.submit(job, context);
// The process dies here, in the middle of a tool call.

// A new process opens the same storage.
const harness = await Harness.open(
    await openNodeSqliteStorage("./agent.sqlite"),
    { models, registry, env },
    context,
);
harness.resume(); // continue the interrupted run
const root = await harness.root(context);
// the same submission, answered
const settled = await (await root.submit(job, context)).wait(context);
```

## Beberapa percakapan sekaligus

Kami ingin satu Harness dapat menjalankan beberapa percakapan sekaligus tanpa saling menghambat.

Di Pi Durable, satu Harness dapat menjalankan percakapan sebanyak yang diperlukan secara bersamaan, dengan jaminan yang sama untuk semuanya. Percakapan bisa dimulai dari nol, atau bercabang dari titik mana pun di transkrip percakapan lain; hasil percabangan melihat riwayat percakapan induknya sampai titik itu, tanpa perlu menyalin catatan tersebut.

Bayangkan sebuah kanal Slack tempat Agent Anda menanggapi setiap penyebutan. Lalu seseorang membuka sebuah thread. Kanal bisa menjadi satu percakapan, dan thread adalah percakapan lain yang bercabang dari pesan yang dibalasnya. Keduanya berjalan bersamaan tanpa saling menghambat.

``` typescript
const channel = await harness.root(context);
const question = await channel.submit(
    { type: "input", content: "@agent why did the deploy fail?" },
    context,
);
const answered = await question.wait(context);

// Someone replies to the agent's answer in a thread. Every conversation names
// its owner, which decides what an abort reaches (more on that under Tasks).
// The thread has none.
const thread = await channel.fork(
    answered.answer!,
    { ownership: { kind: "ownerless" } },
    context,
);

// Both conversations work at the same time.
const inThread = await thread.submit(
    { type: "input", content: "@agent can we roll it back?" },
    context,
);
const inChannel = await channel.submit(
    { type: "input", content: "@agent who is on call today?" },
    context,
);
await Promise.all([inThread.wait(context), inChannel.wait(context)]);
```

Setiap percakapan juga menyimpan konfigurasi Agent-nya sendiri: model, tingkat penalaran, Ekstensi yang dipilih beserta tool yang diaktifkan di dalamnya, instruksi tambahan, dan direktori kerja pada lingkungan eksekusi. Agent peninjau di samping Agent utama dapat memakai model yang lebih murah, tool hanya-baca, dan direktori checkout kodenya sendiri.

## Ekstensi

Kami ingin semua kemampuan Agent dapat dipasang dan dilepas, dan setiap bagian yang dipasang ikut ambil bagian dalam persistensi serta pemulihan.

Di Pi Durable, Ekstensi adalah sekumpulan fragmen system prompt, tool, hook, dan tugas yang memiliki nama. Aplikasi memasang Ekstensi ke registry. Setiap percakapan memilih Ekstensi dan tool yang dipakainya, dan yang disimpan hanyalah nama-namanya.

### Fragmen system prompt

Sebelum setiap permintaan, system prompt dibangun ulang dari fragmen Ekstensi yang dipilih percakapan itu, sehingga ketika sebuah fragmen berubah, permintaan berikutnya sudah memakainya. Pi Durable mencatat perubahan itu pada posisi di transkrip tempat perubahan sebenarnya terjadi, memastikan bahwa setelah restart atau percabangan, yang terlihat tetap sama dengan yang dilihat model saat itu. Untuk model yang mendukung perubahan system prompt dan tool di tengah percakapan, hanya bagian yang berubah yang dikirim, sehingga prompt cache tetap berlaku.

``` typescript
import { defineExtension, section } from "@earendil-works/pi-durable";

const ProjectContext = defineExtension({
    name: "project-context",
    sections: [
        // Read from the conversation's execution environment. The files can be
        // loaded and watched in the background; every request renders the
        // latest state.
        section("agents_md", (input) => agentsMd.latest(input.env)),
        section("skills", (input) => skills.latest(input.env)),
    ],
});
```

### Tool

Setiap pemanggilan tool berjalan sebagai tugas persisten tersendiri, dan niat pemanggilannya disimpan sebelum dieksekusi. Setelah crash, tool hanya dijalankan lagi jika ia secara eksplisit menyatakan aman diulang. Jika tidak, model menerima pemberitahuan bahwa pemanggilan terputus beserta output yang sudah tersimpan, lalu memutuskan langkah berikutnya. Setiap percakapan juga dapat memperoleh rangkaian tool-nya sendiri, misalnya thread Slack tadi boleh mencari, tetapi tidak boleh men-deploy.

``` typescript
import { Type } from "@earendil-works/pi-ai";
import { defineTool } from "@earendil-works/pi-durable";

const searchIssues = defineTool({
    name: "search_issues",
    description: "Search the issue tracker",
    parameters: Type.Object({ query: Type.String() }),
    replay: "safe", // only reads, so a rerun after a crash is fine
    execute: async (args, api) => {
        // streamed to every client watching
        api.output(`searching for ${args.query}\n`);
        return {
            content: [{ type: "text", text: await tracker.search(args.query) }],
        };
    },
});

const deploy = defineTool({
    name: "deploy",
    description: "Deploy a version to production",
    parameters: Type.Object({ version: Type.String() }),
    // No replay: a deploy interrupted by a crash is reported to the model,
    // never repeated.
    execute: async (args) => ({
        content: [{ type: "text", text: await ci.deploy(args.version) }],
    }),
});

registry.install(defineExtension({ name: "ops", tools: [searchIssues, deploy] }));

// The thread may search, but not deploy.
await thread.configure({ tools: { remove: [deploy] } }, context);
```

Tool menerima Harness API untuk pemanggilan tersebut: ia dapat mengirim catatan dan dokumen, memulai tugas dan percakapan, serta berkomunikasi dengan percakapan lain. Karena itu, sub-Agent dapat diwujudkan dengan beberapa baris kode. Tool membuat percakapan miliknya sendiri, memberinya model yang lebih kecil dan instruksi khusus, lalu menunggu jawabannya. Sub-Agent tidak berbeda dari percakapan lain, jadi ia juga dapat pulih setelah crash, biayanya dihitung terpisah, dan antarmuka dapat menampilkannya di bawah pemanggilan tool yang bersangkutan.

``` typescript
import type { AssistantMessage } from "@earendil-works/pi-ai";
import { AssistantEntry, configure } from "@earendil-works/pi-durable";

const triage = defineTool({
    name: "triage",
    description: "Label an incoming issue as bug, feature, or question",
    parameters: Type.Object({ issue: Type.String() }),
    // a rerun after a crash finds the same subagent and the same submission
    replay: "safe",
    execute: async (args, api, context) => {
        const child = await api.commit(async (tx) => {
            const existing = (
                await tx.scanConversations({ ownerTaskId: api.taskId }, 1)
            ).items[0];
            if (existing !== undefined) return existing.id;
            // Owned by this call, so aborting the call aborts the subagent.
            const created = await tx.createConversation({
                ownership: { kind: "task", taskId: api.taskId },
            });
            // It starts as a copy of this conversation's agent. Make it a small
            // model without tools.
            await configure(tx, created.id, {
                model: { provider: "openai", modelId: "gpt-6-luna" },
                tools: [],
                instructions: "Answer with one word: bug, feature, or question.",
            });
            return created.id;
        }, context);
        // lets a UI show the subagent under the call
        await api.details({ conversationId: child }, context);
        const subagent = await api.conversation(child, context);
        const request = {
            type: "input",
            content: args.issue,
            requestId: `triage:${api.taskId}`,
        } as const;
        const settled = await (
            await subagent!.submit(request, context)
        ).wait(context);
        // The answer is an entry in the subagent's transcript. Read it and take
        // its text.
        const entry = await api.commit(
            (tx) => tx.entry(AssistantEntry, settled.answer!),
            context,
        );
        const message = entry?.model?.[0] as AssistantMessage;
        const text = message.content
            .flatMap((content) => (content.type === "text" ? [content.text] : []))
            .join("");
        return { content: [{ type: "text", text }] };
    },
});
```

Ekstensi juga dapat mengubah tool milik Ekstensi lain. Ekstensi yang dipasang belakangan dan menyediakan tool dengan nama sama akan menggantikan tool sebelumnya, misalnya mengganti bash dengan versi yang berjalan di virtual environment Python. Wrapper mendekorasi tool yang akhirnya berlaku; pembungkusan itu berlaku selama percakapan memilih Ekstensi yang menyediakan wrapper tersebut.

``` typescript
import { wrapTool } from "@earendil-works/pi-durable";
import { createBashTool } from "@earendil-works/pi-durable/tools";

// Times every bash call, whichever bash the conversation ends up with.
const Timing = defineExtension({
    name: "timing",
    wraps: [
        wrapTool(createBashTool(), (bash) => ({
            ...bash,
            execute: async (args, api, context) => {
                const start = Date.now();
                try {
                    return await bash.execute(args, api, context);
                } finally {
                    metrics.record("bash", Date.now() - start);
                }
            },
        })),
    ],
});
```

### Hook

Hook memungkinkan Ekstensi menyela tugas, termasuk tugas bawaan seperti menghasilkan balasan model, memanggil tool, dan menjalankan pemadatan. Hook dapat mengubah permintaan sebelum dikirim ke model, menghalangi atau mengubah pemanggilan tool, mengganti hasil, melanjutkan satu kali jalan, atau menulis ringkasannya sendiri. Setelah crash, hook dapat berjalan lagi, sehingga hook yang perlu mengambil keputusan menyimpannya ke memo: nilai kecil yang disimpan bersama tugas, dan yang berlaku adalah penulisan pertama.

``` typescript
import { hook, ToolTask } from "@earendil-works/pi-durable";

const Approval = defineExtension({
    name: "approval",
    hooks: [
        hook(ToolTask, {
            beforeTool: async (call, api, context) => {
                if (call.name !== "deploy") return undefined;
                // After a restart, the hook finds the stored answer instead of
                // asking again.
                let approved = await api.memo<boolean>(
                    "approval:deploy",
                    context,
                );
                approved ??= await api.memo(
                    "approval:deploy",
                    await askInSlack(call),
                    context,
                );
                return approved
                    ? undefined
                    : { block: "Nobody approved the deploy." };
            },
        }),
    ],
});
```

Beberapa Ekstensi dapat memasang hook untuk hal yang sama. Hook disusun menjadi rantai sesuai urutan Ekstensi yang dipilih percakapan, dan setiap jenis hook mendefinisikan sendiri cara berjalannya di rantai itu. `beforeTool` meneruskan argumen yang sudah diubah ke belakang dan berhenti pada keputusan penghalangan pertama. `afterTool` meneruskan hasil sepanjang rantai. `onYield` berhenti pada hook pertama yang meminta jalan terus. Hook pengamat seperti `afterResponse` selalu dijalankan seluruhnya. Jika sebuah hook melempar pengecualian, sistem melaporkannya dan melanjutkan ke hook berikutnya; `beforeTool` menjadi pengecualian, karena pengecualian di sana menghalangi pemanggilan tool tersebut.

### Tugas

Harness memakai tugas bawaan untuk menjalankan percakapan: setiap permintaan model, setiap pemanggilan tool, dan setiap pemadatan punya tugasnya sendiri. Ekstensi juga dapat membawa tugasnya sendiri dan memperoleh mekanisme yang sama: checkpoint setelah setiap langkah, timer yang tetap berlaku setelah restart, serta kemampuan menunggu tugas lain.

Sebuah alur pembayaran yang membagi tagihan ke beberapa kartu akan menagih semua kartu sekaligus. Jika salah satu kartu ditolak, tugas pembayaran lainnya dibatalkan dan mengembalikan dananya sendiri:

``` typescript
import { defineTask, type TaskId } from "@earendil-works/pi-durable";

const Payment = defineTask<{ card: string }, { phase: "charge" }, string>({
    name: "shop.payment",
    version: 1,
    initial: () => ({ phase: "charge" }),
    phases: {
        charge: async (task, runtime, context) => {
            // The key makes the charge idempotent: if a crash reruns this
            // phase, the card is only charged once.
            const charge = await bank.charge(
                task.input.card,
                `payment-${task.id}`,
            );
            await runtime.commit(
                () => ({
                    status: "terminal",
                    outcome: charge.ok
                        ? { status: "completed", result: charge.receipt }
                        : { status: "failed", error: { message: charge.error } },
                }),
                context,
            );
        },
    },
    // Another payment failed, or the checkout was cancelled: undo this one.
    abort: async (task, runtime, context) => {
        await bank.refund(`payment-${task.id}`);
        await runtime.commit(
            () => ({ status: "terminal", outcome: { status: "aborted" } }),
            context,
        );
    },
});

type CheckoutState =
    | { phase: "pay" }
    | { phase: "decide"; payments: TaskId<string>[] };
const Checkout = defineTask<{ cards: string[] }, CheckoutState, string>({
    name: "shop.checkout",
    version: 1,
    initial: () => ({ phase: "pay" }),
    phases: {
        pay: async (task, runtime, context) => {
            await runtime.commit(async (tx) => {
                const payments: TaskId<string>[] = [];
                for (const card of task.input.cards) {
                    payments.push(
                        await tx.createTask(Payment, { card }, {
                            ownership: { kind: "task", taskId: task.id },
                        }),
                    );
                }
                // Run no code until every payment is done. The first failed
                // payment aborts the others.
                return {
                    status: "waiting",
                    checkpoint: { phase: "decide", payments },
                    on: payments,
                    policy: "failFast",
                };
            }, context);
        },
        decide: async (task, runtime, context) => {
            const outcomes = await runtime.outcomes(
                task.state.checkpoint.payments,
                context,
            );
            const paid = outcomes.every(
                (outcome) => outcome.status === "completed",
            );
            await runtime.commit(
                () => ({
                    status: "terminal",
                    outcome: paid
                        ? { status: "completed", result: "Order placed." }
                        : {
                            status: "failed",
                            error: { message: "A payment failed." },
                        },
                }),
                context,
            );
        },
    },
    abort: (_task, runtime, context) =>
        runtime.commit(
            () => ({ status: "terminal", outcome: { status: "aborted" } }),
            context,
        ),
});

// The agent starts a checkout with a tool.
const checkout = defineTool({
    name: "checkout",
    description: "Pay for the cart, split across several cards",
    parameters: Type.Object({ cards: Type.Array(Type.String()) }),
    execute: async (args, api, context) => {
        // Owned by this call: aborting the call aborts the checkout and refunds
        // its payments.
        const owner = {
            ownership: { kind: "task", taskId: api.taskId },
        } as const;
        const id = await api.createTask(
            Checkout,
            { cards: args.cards },
            owner,
            context,
        );
        const { outcome } = (await api.waitForTask(id, context)).state;
        const text =
            outcome.status === "completed" ? outcome.result : outcome.status;
        return { content: [{ type: "text", text }] };
    },
});

registry.install(defineExtension({
    name: "shop",
    tools: [checkout],
    tasks: [Payment, Checkout],
}));
```

Tugas dan percakapan bersama-sama membentuk pohon kepemilikan. Membatalkan sebuah tugas akan membatalkan, dari bawah ke atas, pekerjaan yang dimilikinya, sehingga setiap tugas membersihkan dampak yang ditimbulkannya lebih dulu; sebuah tugas baru dianggap selesai setelah seluruh pekerjaan miliknya berakhir. Sub-Agent mengikuti pola yang sama: sebuah percakapan yang dimiliki oleh pemanggilan tool yang memulainya.

Secara bawaan, tugas berjalan di depan dan termasuk pekerjaan yang sedang ditangani percakapan. Percakapan baru menganggur setelah tugas-tugas itu selesai; membatalkan percakapan, misalnya ketika pengguna menekan Esc, juga membatalkan tugas-tugas tersebut beserta seluruh pekerjaan miliknya. Tugas latar belakang dimiliki percakapan, tetapi bukan bagian dari pekerjaan yang sedang ditanganinya. Selama tugas itu berjalan, percakapan tetap dapat menganggur; pembatalan biasa tidak memengaruhinya beserta pekerjaan miliknya.

Ini cocok untuk sub-Agent yang perlu terus berjalan setelah giliran yang memulainya berakhir, atau untuk pengingat yang baru terpicu besok. Membatalkan tugasnya secara langsung, atau membatalkan percakapan dengan `{ background: true }`, tetap akan menghentikannya.

``` typescript
// Part of the current work: Esc aborts it, and the conversation waits for it.
await api.createTask(
    Checkout,
    input,
    { ownership: { kind: "task", taskId: api.taskId } },
    context,
);

// Side work: the conversation goes idle while it runs, and Esc leaves it alone.
await api.createTask(
    Reminder,
    input,
    { ownership: { kind: "conversation" }, background: true },
    context,
);
```

## Pemadatan

Kami ingin percakapan panjang dapat terus berjalan, tanpa membuat Agent berhenti menunggu ringkasan.

Di Pi Durable, pemadatan sama seperti pekerjaan lain: sebuah tugas yang dapat berjalan sementara percakapan terus berlanjut. Ketika konteks mendekati batas model, pemadatan latar belakang membuat ringkasan untuk pesan yang lebih lama dan menempatkan ringkasan itu pada batas giliran berikutnya. Percakapan baru menunggu ringkasan selesai jika permintaan berikutnya tidak akan muat di jendela konteks tanpanya. Jika provider tetap menolak dengan alasan permintaan terlalu panjang, Harness memadatkan dan mencoba sekali lagi. Anda juga dapat memadatkan secara manual kapan saja dan memberikan instruksi Anda sendiri.

Pesan yang lebih lama selalu tetap tersimpan di penyimpanan.

``` typescript
const harness = await Harness.open(storage, {
    models,
    registry,
    settings: {
        compaction: {
            // past contextWindow - reserveTokens, the next request waits for a
            // summary
            reserveTokens: 16384,
            // this far before that, a summary starts in the background
            backgroundTokens: 32768,
        },
    },
}, context);

// Manual, also while the agent is working.
await root.compact("Keep the names of the failing tests", context);
```

`reset()` melangkah lebih jauh: ia membuka konteks baru, dan dapat pula memakai catatan serah terima sebagai titik awalnya. Tool juga dapat mengajukan permintaan yang sama dengan mengembalikan `control: { handoff }`. Karena tidak ada yang dihapus, tool lain tetap dapat menelusuri seluruh isi sebelum serah terima. Dengan begitu, Anda dapat membangun Agent yang menyerahkan pekerjaannya kepada dirinya sendiri, lalu menelusuri kembali riwayatnya nanti.

```typescript
const handoff = defineTool({
    name: "handoff",
    description:
        "Start over from a handoff note. " +
        "Older messages stay searchable with search_history.",
    parameters: Type.Object({ note: Type.String() }),
    execute: async (args, api, context) => {
        // Queued behind the handoff, so it starts the next run in the new
        // context.
        const self = await api.conversation(api.conversationId, context);
        await self!.submit(
            {
                type: "input",
                content: "Continue.",
                requestId: `handoff:${api.taskId}`,
            },
            context,
        );
        // Ends this run and starts a new context from the note, like
        // reset(note).
        return {
            content: [{ type: "text", text: "Handing off." }],
            control: { handoff: args.note },
        };
    },
});

const searchHistory = defineTool({
    name: "search_history",
    description: "Search older messages, including those before a handoff",
    parameters: Type.Object({ text: Type.String() }),
    replay: "safe",
    execute: async (args, api, context) => {
        // Tools read records through a transaction too. One that writes
        // nothing stores nothing.
        const page = await api.commit(
            (tx) => tx.scanEntries({ conversationId: api.conversationId }, 200),
            context,
        );
        const hits = page.items.filter((entry) =>
            JSON.stringify(entry.model ?? []).includes(args.text),
        );
        const text = hits.map((entry) => JSON.stringify(entry.model)).join("\n");
        return { content: [{ type: "text", text }] };
    },
});
```

## Status aplikasi juga dapat dipersistenkan

Kami ingin status aplikasi yang dibangun di atas Agent dapat dipersistenkan seandala percakapan itu sendiri.

Di Pi Durable, status aplikasi seperti daftar tugas, rencana, tiket kerja, atau sandbox tempat percakapan berjalan disimpan dalam dokumen. Dokumen adalah JSON bertipe yang disimpan bersama transkrip dan diubah dalam commit atomik yang sama, sehingga statusnya tidak pernah bertentangan dengan transkrip yang menghasilkannya. Setiap jenis dokumen menyatakan dari status apa percabangan harus dimulai: nilai percakapan induk pada titik percabangan, nilai terkini, atau nilai yang sepenuhnya baru.

``` typescript
import { defineDoc } from "@earendil-works/pi-durable";

const Todos = defineDoc<{ items: string[] }>({
    kind: "app.todos",
    version: 1,
    scope: "conversation",
    history: "rewindable",
    fork: "asOf", // a fork starts with the todos its parent had at the fork entry
    initial: () => ({ items: [] }),
});

const Todo = defineExtension({
    name: "todo",
    tools: [
        defineTool({
            name: "todo",
            description: "Add an item to your todo list",
            parameters: Type.Object({ item: Type.String() }),
            execute: async (args, api, context) => {
                await api.commit(async (tx) => {
                    const todos = await tx.doc(Todos, api.conversationId);
                    todos.items.push(args.item);
                }, context);
                const text = `Added ${args.item}`;
                return { content: [{ type: "text", text }] };
            },
        }),
    ],
    // The model sees the list before every request.
    sections: [
        section("todos", async (input, context) => {
            const todos = await input.read.snapshot(
                Todos,
                input.conversationId,
                context,
            );
            return todos?.items.join("\n") || undefined;
        }),
    ],
});

// A UI subscribes to the committed value.
const todos = await harness.documentState(Todos, channel.id, context);
todos?.subscribe((value) => renderTodos(value?.items ?? []));
```

## Mudah dibentuk

Kami ingin dapat mengubah kode yang sedang dipakai Agent tanpa menghentikannya.

Di Pi Durable, registry masih dapat berubah saat percakapan berjalan. Memasang Ekstensi dengan nama yang sudah terpasang akan menggantikan Ekstensi sebelumnya sekaligus. Pemanggilan tool yang sudah dimulai tetap diselesaikan dengan kode saat pemanggilan itu mulai; pemanggilan berikutnya memakai kode baru. Percakapan hanya menyimpan nama Ekstensi dan tool, tidak pernah menyimpan kodenya, sehingga setelah restart mereka memakai implementasi yang dipasang proses baru.

``` typescript
// The extension's file changed on disk.
// same name "ops": replaces the installed one
registry.install(await loadExtension("./ops.ts"));
```

## Kolaborasi banyak orang

Kami ingin beberapa orang dan beberapa klien dapat ikut serta dalam percakapan yang sama secara bersamaan: menonton prosesnya, bergabung di tengah jalan, dan mengarahkannya.

Di Pi Durable, semua yang dibutuhkan antarmuka adalah status yang sudah di-commit, sehingga berapa pun jumlah klien dapat terhubung ke percakapan mana pun di dalam Harness. Klien mengambil dulu tampilan saat ini: transkrip, jawaban yang sedang dialirkan, tool yang berjalan beserta outputnya, pesan yang mengantre, konfigurasi Agent, dan pemakaian. Setelah itu ia hanya menerima bagian yang berubah. Klien yang bergabung di tengah jalan atau terhubung kembali mulai dari tampilan saat ini. Klien mana pun dapat mengarahkan percakapan yang sedang berjalan, atau menambahkan pesan berikutnya ke antrean.

``` typescript
// A second client joins the thread while the agent is working.
const view = await thread.viewState(context);
render(view.value);
view.subscribe((value) => render(value));

// And steers it. The message joins the running work after the current tool
// calls.
await thread.submit(
    { type: "input", content: "Check the staging logs first", whenBusy: "steer" },
    context,
);
```

Untuk klien jarak jauh, `thread.watch()` menyediakan operasi persis dari setiap commit, dengan data yang cukup kecil untuk dikirim melalui Socket. Jika Anda lebih menyukai event yang familier di asisten pemrograman, `watchEvents()` dapat mengubah commit menjadi event-event tersebut, dengan konsekuensi data yang dikirim lebih banyak.

## Coba sendiri

Anda dapat mencoba Pi Durable hari ini. Ia masih eksperimental dan API-nya masih mungkin berubah. Arahkan Agent Anda ke `packages/durable` di direktori checkout kode Pi, mintalah ia membaca [README](https://github.com/earendil-works/pi/blob/main/packages/durable/README.md), lebih dari tiga puluh [contoh](https://github.com/earendil-works/pi/tree/main/packages/durable/test/examples), [asisten pemrograman kecil yang dibangun di atas Pi Durable](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/src/experimental/durable), atau [Agent perencana perjalanan](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/src/experimental/vacation) yang menarik ini, lalu mulailah membangun.

Perencana perjalanan itu sekitar 1.300 baris TypeScript, sebagian besarnya adalah antarmuka terminal. Kalau tampilannya mirip asisten pemrograman, itu hanya karena ia meminjam komponen antarmuka terminal Pi Coding Agent.

**Langkah pada rekaman terminal asli**

1. Perencana perjalanan berbasis Pi Durable dengan antarmuka terminal.
2. Sub-Agent menjalankan tiga pencarian secara paralel; setiap pencarian adalah tugas yang dipersistenkan.
3. Sementara itu, Agent utama tetap dapat diajak mengobrol.
4. Proses berhenti. Pencarian cuaca dan museum sudah selesai, pencarian kereta belum.
5. Dimulai ulang. `search` aman dijalankan ulang, sehingga hanya pencarian kereta yang berjalan lagi.
6. Beralih ke sub-Agent dan beri arahan baru.
7. Kembali ke Agent utama: ajukan pertanyaan saat ia bekerja, padatkan konteks, dan terus arahkan.
8. Laporan dikirim sebagai pesan; Agent utama merapikannya menjadi rencana perjalanan.

Rekaman terminal asli dapat diputar di [halaman Pi Durable milik Earendil](https://earendil.com/posts/pi-durable/).

Di direktori checkout kode Pi, jalankan kedua demo ini:

``` bash
npm install && npm run build
node packages/coding-agent/src/experimental/durable/main.ts
node packages/coding-agent/src/experimental/vacation/main.ts
```

Untuk mengembangkan di atas Pi Durable di proyek Anda sendiri:

``` bash
npm install @earendil-works/pi-durable @earendil-works/pi-ai @earendil-works/chord
```

Beberapa minggu ke depan, kami akan terus memperkenalkan Pi Durable dan menunjukkan tool Agent kecil yang kami bangun dengannya untuk membantu pekerjaan sehari-hari, misalnya bot Slack atau bot triase issue GitHub. Untuk sekarang kami belum mau membocorkan terlalu banyak. Seperti halnya kami sendiri memakai Pi, akan ada lebih banyak tulisan yang terbit seiring kami menggunakan Pi Durable sendiri.

## Pertanyaan umum

### Mengapa memilih TypeScript lagi?

Karena itu cara tercepat untuk membangunnya. Meski begitu, sekarang semua orang tahu bahwa memindahkan semuanya ke Rust atau assembly itu “mudah”. Kami tidak menutup kemungkinan melakukannya nanti, tetapi untuk saat ini kami akan fokus pada TypeScript.

---

Baca lanjutan: [Panduan pengantar Pi Durable](/guide/pi-durable) · [Terjemahan rilis Pi 1.0](/translations/pi-1-0) · [Arsip versi resmi](/releases/)
