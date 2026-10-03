---
title: 'Pi Durable: keeping an Agent working after an interruption'
description: 'Understand persistent tasks, crash recovery, and concurrent conversations in Pi Durable through the official trip-planner demo, and how it differs from Pi, tmux, and progress files.'
prev:
  text: Long-running tasks and VPS
  link: /en/guide/vps-and-long-running
next:
  text: Pi Durable
  link: /en/translations/pi-durable
---

<span class="library-status">OPTIONAL SECTION · PI DURABLE</span>

# Pi Durable: keeping an Agent working after an interruption

Imagine an Agent arranging a trip: the weather is checked, the museums are checked, the train timetable is still being looked up—and then the process exits. Once it is opened again, can it keep the first two results and resume only the remaining work?

On 1 October 2026, Earendil released Pi Durable alongside Pi 1.0, and that is the kind of problem it sets out to solve. **It is an experimental framework for developers building long-running Agent applications.** The Pi coding assistant you use in the terminal continues to exist; upgrading Pi does not automatically turn existing sessions into Durable applications.

After this section you should be able to tell the different recovery approaches apart, understand what happens when a task is recovered, and know how to explore further with the official trip-planner example.

::: info Verification scope · 2026-10-02
This section is compiled from the release article and from the README and example source of Pi `v1.0.0`. The steps below are the reproduction path of the official example, and this section does not mark it as a case study verified by Buku Pi. The Pi Durable API may still change; you do not need to install it to understand the concepts.
:::

## Saving a session, keeping a process alive, recovering a task: what is the difference?

Buku Pi has already covered [tmux and VPS](/en/guide/vps-and-long-running), and it also provides the exercise of [recovering a task through a progress file](/en/cases/checkpoint-recovery). Each of the three has its own use:

| Approach | What it leaves behind | How to continue after an interruption |
| --- | --- | --- |
| Pi session records and `progress.md` | The conversation, plus the business progress a task wrote down explicitly | A person or a new session reads the records, checks the files, then decides the next step |
| tmux | A terminal session that is still running, and the processes inside it | Reconnect after SSH drops; if the process itself has already exited, that needs separate handling |
| Pi Durable | The conversation, task checkpoints, queued messages, and application state | A new process opens the same persistent storage and resumes the unfinished tasks |

Durable handles the recovery logic inside the task itself. Bringing a stopped service back to life remains the job of the application or the process manager. Nor does it replace your own job of checking whether the final files are correct.

## Meet the four parts first

<strong>A conversation</strong> holds the record of the interaction between the person and the Agent, together with the model, tools, and instructions that conversation uses. An application can run several conversations at once, or fork from an existing history.

<strong>A task</strong> is a unit of work in progress. One model request, one tool call, one compaction—each can be a task. A task saves a checkpoint as it moves forward, so a new process knows what is done and what is still waiting.

<strong>Storage</strong> carries all of that state. The framework provides in-memory, SQLite, and JSONL backends. To recover across processes you need SQLite, JSONL, or another persistent backend that is kept; an in-memory backend disappears with its process. At any one time a single storage is held by a single process, and several clients connect to that process.

<strong>The execution environment</strong> decides where tools actually work. The Harness and the tools can sit on different machines. The bundled Node execution environment can reach local files, but it is not itself an isolated sandbox.

All of these concepts circle around one question: besides the chat content, what other state has to be saved for the work to truly continue?

## “Continuing” does not always start from the same line

What the framework recovers is task state, not an operating-system process frozen and brought back to life.

| Interrupted work | How Pi Durable handles it |
| --- | --- |
| A model reply that was being produced | The request is sent again; the earlier partial answer stays in the record, marked as aborted |
| A tool that declares `replay: "safe"` | It can be rerun, for example a read-only query |
| A tool that does not declare it is safe to rerun | The interrupted situation and the saved output are reported to the model, and the model decides the next step |
| A client retrying the same input | The original submission is found again through the same `requestId`, so it is not submitted twice |

Here it matters to tell “input is not submitted twice” apart from “every external operation runs exactly once”. Actions such as payments, sending messages, and deploys outside a database still require idempotency or compensation logic in the application. The payment code in the original text explicitly uses an idempotency key and a refund path.

Long conversations have a boundary too: older messages may stay in storage, but the current request is still bounded by the model's context window. Durable uses background compaction to keep a conversation going; that does not mean the model can see the entire history every time.

## Look at the trip-planner demo first

[The original recording in the full translation](/en/translations/pi-durable#try-it) shows a trip-planning Agent. The main Agent hands the research to a subagent, and the subagent runs three searches—weather, museums, and trains—at the same time; meanwhile the main Agent can still chat with the user.

In the official example the three searches wait about 6 seconds, 10 seconds, and 30 seconds respectively, then return prepared data. **What it demonstrates is parallel tasks and their recovery, not live weather or ticketing lookups.** Model calls still need available model credentials and may incur usage costs.

In the recording, the weather and museum results have already returned, the train search has not finished, and then the process exits. After the original session is opened again, the finished results are still there, and the train search, which is safe to rerun, runs again. Once the report is done it is handed to the main Agent as a message, and the main Agent turns it into a trip plan.

The subagent here is built by the application out of tools and a separate conversation. Durable provides the machinery; it does not prescribe one subagent product shape for every application.

## If you want to try it, start from the official example

The commands below are pinned to **Pi `v1.0.0`**, so the steps do not lose their correspondence when `main` moves on. You need Git, Node.js **22.19.0 or later**, npm, and a model that already works normally inside Pi.

Check Node in a normal terminal first:

```bash
node --version
```

Then open the Pi you normally use, complete authentication with `/login` in the Pi input box, and choose an available default model. Once an ordinary conversation can answer, exit. This travel demo reuses Pi's credentials and settings and has no `/login` of its own.

### 1. Get the source in a separate directory

In the directory where you keep experimental projects, run the following in a normal terminal. `pi-durable-demo` is the source directory created this time; if a directory with that name already exists, pick a new name.

```bash
git clone --branch v1.0.0 --depth 1 https://github.com/earendil-works/pi.git pi-durable-demo
cd pi-durable-demo
npm install
npm run build
```

The expected result is that dependency installation and the build both finish successfully. If the build fails, check the Node version and the error message first; do not skip the build and start it anyway.

### 2. Start the trip planner

Still in the **root of the Pi source repository** from before, run:

```bash
node packages/coding-agent/src/experimental/vacation/main.ts
```

Once the demo terminal interface appears, send:

> Arrange a weekend in Vienna for two people, and hand the weather, museum, and train research to a subagent.

Let it run through once first, so you get used to `/agents` for switching between the main session and the subagent, and `/tasks` for the task graph. Only once you have seen the report actually reach the main session should you try the next step.

### 3. Watch the recovery after an interruption

Start a new demo session and make the same request. Watch the task list, and when the weather and museums are done while the train is still running, exit with `Ctrl+C` as described in the official demo notes. Model response speeds differ, so the three tasks may not start at the same time; go by the actual task state.

Then, in the **same working directory**, run:

```bash
node packages/coding-agent/src/experimental/vacation/main.ts --continue
```

`--continue` picks the most recent demo session in the current directory. Its data is stored at:

```text
~/.pi/agent/experimental/vacation-sessions/<cwd-hash>/<session>/session.sqlite
```

The angle brackets above stand for directories the program generates, and you do not need to create them yourself. Before recovering, do not delete the data file and do not change the working directory, or you may open a different session.

### 4. Verify through state and results

This run should be able to answer the following questions:

- After recovery, are the original session and the finished search results still there?
- Are the two finished tasks, weather and museums, not run again?
- Does the train search, unfinished and safe to rerun, really run again and complete?
- Does the final report reach the main session, and does the trip plan cite those results?

An Agent saying “recovery succeeded” is not enough on its own; compare the task state with the actual report. If you get an empty session after restarting, first check whether you used `--continue`, whether you are still in the same working directory, and whether the original SQLite file is still there. If you hit an authentication error, go back to ordinary Pi and check the login and default model configuration.

## When is it worth learning further?

If you mainly write code, edit articles, or finish one-off tasks in the terminal, keep using Pi with the sessions and progress files you already have.

Pi Durable only starts to feel valuable when you are building a bot that stays online, a workflow several users take part in, or an application that has to keep several conversations and background tasks running after a restart. It also supports application state documents, hot-swapping Extensions, and several people subscribing to the same conversation; those capabilities have to be assembled by the developer, and are not a ready-made Slack service or multi-user chat site.

The next step is to read the [full official translation](/en/translations/pi-durable), then compare it with the pinned-version material below. The payment, approval, and deploy snippets in the original text are there to explain the mechanics; their external services are yours to implement, and they are not a complete application you can copy and run.

## Sources and further reading

- [Earendil: the Pi Durable release article](https://earendil.com/posts/pi-durable/)
- [Pi v1.0.0: the Durable README](https://github.com/earendil-works/pi/blob/v1.0.0/packages/durable/README.md)
- [Trip-planner README: running, recovery, and the session directory](https://github.com/earendil-works/pi/blob/v1.0.0/packages/coding-agent/src/experimental/vacation/README.md)
- [Trip-planner source: simulated searches and wait times](https://github.com/earendil-works/pi/blob/v1.0.0/packages/coding-agent/src/experimental/vacation/vacation.ts)
- [Runtime requirements of the Durable package](https://github.com/earendil-works/pi/blob/v1.0.0/packages/durable/package.json)
- [Thirty-plus official examples](https://github.com/earendil-works/pi/tree/v1.0.0/packages/durable/test/examples) · [The small coding assistant example](https://github.com/earendil-works/pi/tree/v1.0.0/packages/coding-agent/src/experimental/durable)
