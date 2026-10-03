---
title: Pi Durable
description: 'The complete English edition of the Earendil article “Pi Durable”: long-running operation, crash recovery, concurrent conversations, persistable Extensions, background compaction, and collaboration among many people.'
prev:
  text: Pi 1.0
  link: /en/translations/pi-1-0
next:
  text: Earendil's Officially Licensed Translations
  link: /en/translations/
---

<span class="library-status">Officially licensed Earendil translation · 14</span>

# Pi Durable

> - **Original title**　*Pi Durable*
> - **Author**　Earendil Engineering `<rfc@earendil.com>`
> - **Publication date**　2026-10-01
> - **Original address**　[earendil.com/posts/pi-durable](https://earendil.com/posts/pi-durable/)
> - **License note**　Adapted and translated with permission from Earendil (*Adapted and translated with permission from Earendil.*)
> - **Translation license**　[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans)

::: tip A note on this edition
This article is rendered in full in its original order, keeping every code sample and the English comments inside them, and including the steps of the original terminal recording. The models, paths, and external services in the samples follow the original text and are not a claim that they were tested in this Buku Pi environment. Pi Durable is an experimental framework and its API may still change; the short primer is at [Pi Durable: keeping an Agent working after an interruption](/en/guide/pi-durable).
:::

Today, Earendil and the Pi community [released Pi 1.0](/en/translations/pi-1-0). It reflects our belief that after countless hours of polish, maintenance, and continuous development, Pi is now a solid foundation to build on. At the same time, Pi keeps evolving. Alongside Pi 1.0, we are releasing a new experimental package called Pi Durable. It is built for Agents that can run anywhere, keep working, recover reliably, and be reshaped easily. We invite you to join us in making it the best persistent Harness.

## Why Pi Durable?

Pi Coding Agent is designed to be driven by one person, in a terminal, on your local or remote machine. If the process exits, you look at what happened and then tell it to continue. That is exactly what Pi 1.0 focuses on and does well, and that will not change.

At Earendil, we want to bring this technology to everyone in the form that suits each person best. For that we need a Harness that can run anywhere, be reached from different interfaces, support conversations that continue without limit, survive serious internal and external failures, and let several people steer the same Agent at the same time.

Pi Durable is that Harness. It does not replace Pi Coding Agent; it is a framework for building all kinds of Agent applications, including coding assistants. It shares with Pi Coding Agent not only code such as pi-ai, but also the principles of minimalism and malleability.

It also lets us explore the design of this area without disturbing Pi Coding Agent. Whatever we learn while building Agent applications with Pi Durable, once it proves valuable, flows back into Pi Coding Agent.

## What is a Harness?

Everyone has their own definition of a Harness. We [wrote about this topic before](/en/translations/what-is-a-harness), and here we introduce it again in relation to Pi Durable.

A Harness is storage, plus the machinery needed for one or more large language model conversations to run in parallel. It provides the tools the model can call, and the execution environment those tools run in.

A conversation is your interaction with the Agent, kept as a transcript. An Agent is a large language model, plus settings such as thinking level, plus the tools it can call.

Tools do their work through an execution environment. The execution environment can be your laptop, a remote virtual machine, or an in-memory sandbox. Each conversation can decide for itself which tools and which execution environment it uses.

Everything the Harness runs, from calling a model to executing a tool, is a task.

Like the rest of Pi, Pi Durable is designed so that your Agent can understand it. All the source code, excluding tests, is about 15,000 lines, roughly 150,000 tokens by GPT's count and 250,000 tokens by Claude's. And that is the worst case. When you build on Pi Durable, your Agent rarely needs to read all of the code; the storage backends alone account for about 3,000 lines, and can usually be skipped.

What follows is a brief tour of Pi Durable: what we built, and why we built it that way.

## Long-running, everywhere

We want Agents to run for a long time, and to run anywhere. Today, “anywhere” means anywhere there is a JavaScript runtime.

In Pi Durable, a Harness opens on top of a storage backend. It ships with in-memory, SQLite, and JSONL storage, and it provides a consistency test suite and benchmarks so you can implement your own backend. The SQLite and JSONL storage code uses no Node APIs, so with a small adapter it can run in Bun or a Cloudflare Durable Object. The storage interface is tiny and easy to implement on top of systems you already have, such as a key-value store or Postgres. At any one time a single storage is held by a single process, and other clients connect to that process.

With SQLite, the Harness keeps only the working set in memory: the active transcript, the tasks that are running, and the submissions waiting to be handled. Everything else stays on disk until it is needed. The size of the active transcript is naturally bounded by the model's context window, because compaction summarizes old messages before they overflow the window. So even a conversation with tens of thousands of messages runs with a modest memory footprint.

Tools that need files or a Shell get them through the execution environment. Pi Durable ships a Node execution environment that gives tools access to local files. Like storage, the execution environment interface is small and easy to implement, so you can also give tools a remote execution environment. That way the Harness can run on one machine and the tools on another. Your `env` function builds an environment for each tool call from the conversation's working directory, so different conversations can run in different places.

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

## Surviving crashes

We want an Agent to recover after its process exits, whatever the reason—a laptop going to sleep, a container being redeployed, or a machine running out of memory—and to continue from where it stopped.

In Pi Durable, every step of a run is a task, and a checkpoint is saved before moving on. If the process exits, a new process opens the same storage, finds the tasks that have not finished, and continues each from its last checkpoint. An interrupted model request is sent again; the partial answer that was already produced stays in the transcript, marked as aborted. An interrupted tool call is rerun if it is safe to rerun; otherwise the model is told that the call was interrupted.

Pi Durable has no built-in subagent, but one takes only a few lines of code—the triage tool below shows how. A subagent runs in its own conversation, so it can also continue from where it was interrupted. A subagent tool that is safe to rerun finds the same subagent again and waits for its answer. Messages that were already queued stay queued. `requestId` makes a submission accepted only once (exactly-once), so when a client retries after a crash it gets the original submission rather than asking twice.

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

## Many conversations at once

We want one Harness to run many conversations at once without blocking each other.

In Pi Durable, one Harness can run as many conversations concurrently as needed, with the same guarantees for all of them. A conversation can start fresh, or fork from any point in another conversation's transcript; a fork sees its parent's history up to that point, without copying those records.

Picture a Slack channel where your Agent answers any mention. Then someone opens a thread. The channel can be one conversation, and the thread is another conversation forked at the message it replies to. Both run at the same time without blocking each other.

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

Each conversation also keeps its own Agent configuration: the model, the thinking level, the Extensions it selected and the tools enabled inside them, extra instructions, and the working directory in the execution environment. A reviewer Agent next to the main Agent can use a cheaper model, read-only tools, and its own code checkout directory.

## Extensions

We want every capability of the Agent to be pluggable, and every plugged-in part to take part in persistence and recovery.

In Pi Durable, an Extension is a named set of system prompt sections, tools, hooks, and tasks. An application installs Extensions into the registry. Each conversation chooses the Extensions and tools it uses, and only their names are stored.

### System prompt sections

Before every request, the system prompt is rebuilt from the sections of the Extensions that conversation selected, so when a section changes, the next request already uses it. Pi Durable records the change at the position in the transcript where it actually happened, making sure that after a restart or a fork you still see what the model saw at the time. For models that support changing the system prompt and tools mid-conversation, only the changed part is sent, so the prompt cache still applies.

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

### Tools

Every tool call runs as its own persistent task, and the intent to call is saved before it executes. After a crash, a tool is run again only if it explicitly declares that it is safe to rerun. Otherwise the model is told that the call was interrupted, along with the output saved so far, and then decides what to do next. Each conversation can also get its own set of tools; the Slack thread above, for instance, may search but may not deploy.

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

A tool receives the Harness API for that call: it can commit records and documents, start tasks and conversations, and communicate with other conversations. That is why a subagent takes only a few lines of code. The tool creates a conversation of its own, gives it a smaller model and dedicated instructions, and then waits for its answer. A subagent is no different from any other conversation, so it too can recover after a crash, have its cost counted separately, and be shown by an interface underneath the tool call that created it.

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

Extensions can also modify another Extension's tools. An Extension installed later that provides a tool with the same name replaces the earlier one, for example swapping bash for a version that runs inside a Python virtual environment. Wrappers decorate the tool that ends up in effect; the wrapping applies as long as the conversation has selected the Extension that provides the wrapper.

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

### Hooks

Hooks let an Extension step into tasks, including built-in ones such as producing a model reply, calling a tool, and running compaction. They can rewrite a request before it goes to the model, block or rewrite a tool call, replace a result, keep a run going, or write their own summary. After a crash a hook may run again, so a hook that has to make a decision stores it in a memo: a small value saved with the task, where the first write wins.

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

Several Extensions can set hooks on the same thing. Hooks form a chain in the order the conversation selected the Extensions, and each kind of hook defines how it runs along that chain. `beforeTool` passes rewritten arguments further along and stops at the first blocking decision. `afterTool` passes the result along the chain. `onYield` stops at the first hook that asks for the run to continue. Observing hooks such as `afterResponse` always all run. If a hook throws, the system reports it and carries on with the following hooks; `beforeTool` is the exception, because an exception there blocks that tool call.

### Tasks

The Harness uses built-in tasks to run conversations: every model request, every tool call, and every compaction has its own task. Extensions can bring their own tasks too and get the same machinery: a checkpoint after every step, timers that still hold after a restart, and the ability to wait for other tasks.

A checkout flow that splits a bill across several cards charges every card at once. If one card is declined, the other payment tasks abort and refund themselves:

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

Tasks and conversations together form an ownership tree. Aborting a task aborts, from the bottom up, the work it owns, so every task cleans up the effects it produced first; a task is only finished once all the work it owns has ended. Subagents follow the same pattern: a conversation owned by the tool call that started it.

By default tasks run in the foreground and count as the work the conversation is currently handling. The conversation only goes idle once those tasks are done; aborting the conversation, for example when the user presses Esc, also aborts those tasks and all the work they own. Background tasks belong to the conversation but are not part of the work it is currently handling. While one runs, the conversation can still go idle; an ordinary abort does not affect it or the work it owns.

That suits subagents that need to keep running after the turn that started them has ended, or a reminder that only fires tomorrow. Aborting the task itself, or aborting the conversation with `{ background: true }`, still stops them.

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

## Compaction

We want long conversations to keep going, without making the Agent stop and wait for a summary.

In Pi Durable, compaction is a task like any other, and it can run while the conversation carries on. When the context approaches the model's limit, background compaction writes a summary of the older messages and places that summary at the next turn boundary. The conversation only waits for the summary if the next request will not fit into the context window without it. If the provider still refuses on the grounds that the request is too long, the Harness compacts and retries once. You can also compact manually at any time and supply your own instructions.

Older messages always stay in storage.

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

`reset()` goes further: it opens a new context, and it can also use a handoff note as its starting point. A tool can make the same request by returning `control: { handoff }`. Because nothing is deleted, another tool can still search everything from before the handoff. That way you can build an Agent that hands its work off to itself and later searches its own history again.

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

## Application state persists too

We want the state of an application built on top of the Agent to persist as reliably as the conversation itself.

In Pi Durable, application state such as a todo list, a plan, a work ticket, or the sandbox a conversation runs in is kept in documents. A document is typed JSON, stored alongside the transcript and changed in the same atomic commit, so the state never contradicts the transcript that produced it. Each kind of document declares what state a fork should start from: the parent conversation's value at the fork point, its current value, or an entirely fresh value.

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

## Malleability

We want to change code the Agent is using without stopping the Agent.

In Pi Durable, the registry can still change while conversations run. Installing an Extension under a name that is already installed replaces the previous Extension in one step. Tool calls that have already begun finish with the code they started with; the next call uses the new code. A conversation stores only the names of Extensions and tools, never the code, so after a restart they use whatever implementation the new process installed.

``` typescript
// The extension's file changed on disk.
// same name "ops": replaces the installed one
registry.install(await loadExtension("./ops.ts"));
```

## Collaboration among many people

We want several people and several clients to take part in the same conversation at the same time: watching the process, joining midway, and steering it.

In Pi Durable, everything an interface needs is committed state, so any number of clients can connect to any conversation in the Harness. A client first fetches the current view: the transcript, the answers currently streaming, the running tools and their output, the queued messages, the Agent configuration, and usage. After that it only receives the parts that change. A client that joins midway or reconnects starts from the current view. Any client can steer a running conversation or queue the next message.

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

For remote clients, `thread.watch()` provides the exact operations of every commit, with data small enough to send over a Socket. If you prefer the events you already know from a coding assistant, `watchEvents()` turns commits into those events, at the cost of sending more data.

## Try it

You can try Pi Durable today. It is still experimental and its API may keep changing. Point your Agent at `packages/durable` in the Pi code checkout, have it read the [README](https://github.com/earendil-works/pi/blob/main/packages/durable/README.md), the thirty-plus [examples](https://github.com/earendil-works/pi/tree/main/packages/durable/test/examples), the [small coding assistant built on Pi Durable](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/src/experimental/durable), or this handsome [trip-planning Agent](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/src/experimental/vacation), and start building.

The trip planner is about 1,300 lines of TypeScript, most of it the terminal interface. If it looks like a coding assistant, that is only because it borrows the terminal interface components of Pi Coding Agent.

**Steps in the original terminal recording**

1. A trip planner built on Pi Durable with a terminal interface.
2. The subagent runs three searches in parallel; each search is a persisted task.
3. Meanwhile, the main Agent can still chat.
4. The process exits. The weather and museum searches are done, the train search is not.
5. It restarts. `search` is safe to rerun, so only the train search runs again.
6. Switch to the subagent and give it new guidance.
7. Back to the main Agent: ask a question while it works, compact the context, and keep steering.
8. The report arrives as a message; the main Agent turns it into a trip plan.

The original terminal recording can be played at [Earendil's Pi Durable page](https://earendil.com/posts/pi-durable/).

In the Pi code checkout directory, run these two demos:

``` bash
npm install && npm run build
node packages/coding-agent/src/experimental/durable/main.ts
node packages/coding-agent/src/experimental/vacation/main.ts
```

To build on Pi Durable in your own project:

``` bash
npm install @earendil-works/pi-durable @earendil-works/pi-ai @earendil-works/chord
```

Over the coming weeks we will keep introducing Pi Durable and showing the small Agent tools we build with it to help with everyday work, such as a Slack bot or a GitHub issue triage bot. We will not give too much away just yet. Just as we use Pi ourselves, more writing will appear as we use Pi Durable ourselves.

## FAQ

### Why TypeScript again?

Because that was the fastest way to get it built. Even so, everyone now knows that porting everything to Rust or assembly is “easy”. We do not rule that out for the future, but for now we will focus on TypeScript.

---

Read next: [The Pi Durable primer](/en/guide/pi-durable) · [The Pi 1.0 release translation](/en/translations/pi-1-0) · [The official release archive](/en/releases/)
