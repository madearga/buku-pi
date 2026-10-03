---
title: “You Said No MCP!”
description: 'The complete English edition of the official Earendil Engineering article “You Said No MCP!”: why Pi ended up supporting MCP, and what Codemode is.'
prev:
  text: 'If Coding Is Solved, What Now? — Measuring Code Sloppiness'
  link: /en/translations/measuring-code-sloppiness
next:
  text: Pi 1.0
  link: /en/translations/pi-1-0
---

<span class="library-status">Officially licensed Earendil translation · 12</span>

# “You Said No MCP!”

> - **Original title**　*“You Said No MCP!”*
> - **Author**　Earendil Engineering `<rfc@earendil.com>`
> - **Publication date**　2026-09-29
> - **Original address**　[earendil.com/posts/you-said-no-mcp](https://earendil.com/posts/you-said-no-mcp/)
> - **License note**　Adapted and translated with permission from Earendil (*Adapted and translated with permission from Earendil.*)
> - **Translation license**　[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans)

If you have visited pi.dev before, you will have seen a rather proud statement: Pi does not support [MCP](https://en.wikipedia.org/wiki/Model_Context_Protocol). If you have listened to our podcast about Pi, you will also have heard more than once how dismissive we were of MCP. Mario even [wrote a dedicated article](https://mariozechner.at/posts/2025-11-02-what-if-you-dont-need-mcp/) about it. And yet, if you upgrade Pi now, you will find that it supports MCP. What is going on?

## The situation changed

First, remember that [the world does not hold still](https://lucumr.pocoo.org/2016/11/5/be-careful-about-what-you-dislike/). For the past year we have been watching MCP, and today's MCP is no longer what it used to be. That alone, though, is not enough reason to fold it into the core. You also know that Pi has a good Extension ecosystem—MCP could perfectly well be an Extension, could it not? Even an Extension officially endorsed by Earendil. Yes, you are right: MCP really can be provided as an Extension, and [indeed it used to be](https://github.com/nicobailon/pi-mcp-adapter).

MCP is now part of the core, and that is a decision we reached after discussing and rethinking it together.

## So what actually changed?

We brought MCP into the core not only because MCP itself changed, but also because we found that the changes needed to support it are useful in general. For example, the changes we made for MCP also made it easier to use Jev inside Pi. In the end, what Pi needs is much like what MCP needs: a sandbox provided in the form of an interpreter, somewhere to work.

Although MCP has improved in many ways, plenty of problems remain unsolved. Its biggest problem is still that it is hard to compose. Even with Codemode—a small sandbox that makes tool calls easy to combine—MCP still leaves something to be desired here. At this point, though, that is less a problem with MCP itself than a problem with the existing MCP servers and the way different Harnesses use them.

Many MCP servers are still built for Harnesses that simply dump the whole tool list into the context, and try to save tokens on the server side by returning text. We now prefer to think of MCP as something close to OpenAPI but with intelligent tool discovery. That means tools should return structured data, and should be discoverable from their documentation and descriptions.

Command-line tools (CLIs) are so pleasant to use because Agents and models can chain things together with efficient Bash tricks. Yet fundamentally MCP has no reason why it could not do the same. MCP in Pi means exposing those tools to a JavaScript sandbox; other Harnesses such as Codex take a similar approach.

## MCP in modern LLMs

This raises a question: why not just do Codemode, without bringing in MCP? Part of the answer lies in how Pi currently expresses and describes tools. Over the past few months we have done a lot of work to let Pi adapt to the capabilities new models offer, such as deferred tool loading, inserting system messages mid-conversation, and adjusting the reasoning level. But we have not yet upgraded the tool configuration system so that it makes better use of those new capabilities and supports a larger number of tools.

In a Codemode environment, you have to decide whether a tool is given directly to the LLM or only to the LLM's Codemode part. An ordinary MCP extension cannot obtain enough metadata from Pi's tool configuration system, so it is hard to build that experience well. So we need to make sure a tool can be configured both for deferred loading and for Codemode-only use.

Of course, we could also just fix up that metadata so MCP extensions can do better. But we also believe that MCP combined with Codemode has already solved many of MCP's past problems. We believe the best way to have a positive influence on something is to embrace it. Although we think MCP today is far better than before, its servers and usage patterns still have room to improve.

So we want to take part in the discussion and help it develop into a shape that suits small Harnesses, rather than standing on the sidelines watching.

## What is Codemode?

Having talked about Codemode for so long, it is time to explain what it actually is. When a Harness executes a tool, there are broadly two sides: one side where Bash runs, and the other side where the Harness's Agent loop runs. The two sides have very different levels of trust. The Harness loop often runs in a trusted environment, while the tools it executes often run in a sandbox with less trust.

What is special about Codemode is that it runs on the side where the Harness lives. It can be understood as a mechanism for orchestrating and coordinating tool calls. It is a sandbox that lets the Agent decide the order of tool calls more freely and combine those calls using JavaScript. Because Codemode also runs on the Harness side, its state is stored as part of the session record, rather than in the filesystem.

In theory any language would do, but JavaScript is very appealing: a small JavaScript implementation can be packaged into a WASM binary for distribution, while providing a reasonable degree of protection.

Inside Pi, Codemode loads automatically when you configure MCP, and it can also be added to the configuration as a default tool. Just ask Pi to change its own configuration and enable Codemode! After that you can do a lot of interesting things with it, and not only with MCP. For example, when the provider you have signed into offers “Jev”, you can make a request like this:

> Use typesafe/jev via Codemode to find the 20 most dissatisfied commenters on our issue tracker.

Pi will cleverly combine Linear MCP and capabilities such as Jev inside Pi to complete that analysis, without wasting any context at all.

Here is a condensed replay of one such Pi session.

<PiCodemodeReplay />

::: details Open the English text version and the full code

> Use typesafe/jev via Codemode to find the most dissatisfied people on our issue tracker.

I will pull the open issues from Linear and let Jev rate the tone of each thread, four at a time.

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

Most of the discussions on that issue tracker are calm. Jev rated 156 of the 167 open issues as neutral, 11 as mildly dissatisfied, and none as highly dissatisfied.

The clearest few are:

- PI-6907: the README has no installation instructions (“that is quite annoying”).
- PI-10031: Pi gets stuck on “Working...” after Esc is pressed while it is thinking.
- PI-4714: a `/update` command is wanted (“truly infuriating”).
- PI-7730: CPU usage is too high in long sessions on macOS.

The verdict on every issue was already stored as `frustration` inside Codemode, so I can dig into any one of them without fetching those issues again.

:::

——

About Jev, Codemode, and so on, we will keep writing in the future. We hope this article shows that as the world keeps changing, we will keep adjusting and updating Pi carefully.

::: info A note on this edition
This document is the complete English edition of the original Earendil Engineering text. The dynamic replay uses the demonstration data from the original and keeps the English interface; the code and output in the text version are kept as they were, while the conversational commentary is rendered in English. The English edition and its adaptations are published under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans) under license; copyright in the original English text belongs to Earendil. Where anything is ambiguous, the [original English text](https://earendil.com/posts/you-said-no-mcp/) is the reference.
:::

## Read next

- [Original English text: “You Said No MCP!”](https://earendil.com/posts/you-said-no-mcp/)
- [Previous: Measuring code sloppiness](/en/translations/measuring-code-sloppiness)
- [Back: The list of officially licensed translations](/en/translations/)
