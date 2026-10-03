---
title: Why Pi Embraced MCP After All
description: 'A guide to the Earendil article “You Said No MCP!”: Pi once publicly rejected MCP, why 0.99.0 turned it into built-in support, what Codemode is, and what it means for beginners.'
prev:
  text: Why Pi Puts Sessions and Context in Your Hands
  link: /en/journey/why-pi-keeps-context-editable
next:
  text: Written Outside Buku Pi
  link: /en/journey/
---

<span class="library-status">Learning notes · Article guide</span>

# Why Pi Embraced MCP After All

If you met Pi earlier on, you probably remember that its site once said plainly “MCP is not supported”, and that the author expressed his doubts about MCP more than once in podcasts and articles. Yet after upgrading to 0.99.0 you will find that MCP has become a built-in feature of Pi. On 29 September 2026, Earendil published “You Said No MCP!”, written specifically to answer that change.

This guide summarises the four main points of that article in my own words. To see the original argument, read the [original English text](https://earendil.com/posts/you-said-no-mcp/).

## One: not a sudden change of mind—both MCP and Pi changed

The article starts from something plain: the world does not stand still. The team has been watching MCP for the past year, and today's MCP is no longer what it was.

But “MCP got better” alone is not enough to bring it into the core. Pi already had a mature Extension ecosystem, and MCP could always have been—and indeed once was—an Extension. What really made the team put it in the core was the finding, after rethinking, that **the changes needed to support MCP are broadly useful to Pi as well.**

## Two: what actually changed

I have folded the article's assessment into three layers:

| Layer | The article's assessment |
| --- | --- |
| What Pi itself needed | A sandbox you can “play” in, that is, an interpreter. That is also what MCP needs. The same set of changes also made it easier for Pi to call classification models such as Jev. |
| What MCP still has not solved | Its biggest problem is still that it is **hard to compose**. The author argues, though, that this is more a problem of the existing MCP servers and of how different Harnesses use them, not of the protocol itself. |
| The ideal MCP | Closer to “OpenAPI with intelligent discovery”: tools return structured data and can be found through their documentation and descriptions, rather than being dumped into the context and saving tokens by returning plain text. |

The article also offers a comparison: CLIs are so pleasant to use because a model can chain commands together with terse Shell idioms. MCP has no reason it could not do the same. Pi's approach is to expose MCP tools to a JavaScript sandbox, so the model can compose them the way it writes a script.

## Three: why not just build Codemode, without MCP

This is the follow-up question the article anticipates. The answer has two parts:

1. **Pi's tool configuration needs an upgrade.** The newest model generation supports deferred tool loading, inserting system messages mid-conversation, and switching reasoning level; Pi has done a lot of work over the past few months for those capabilities, but the way tools are “assembled” has not caught up. Inside Codemode, every tool has to be decided on: given directly to the model, or visible only inside a Codemode script. An ordinary MCP Extension cannot get enough metadata to do that well.
2. **Taking part has more influence than watching.** The team judges that MCP combined with Codemode can solve many of MCP's past shortcomings, while existing servers and usage patterns still have room to improve. Rather than standing outside, it is better to step in and push MCP to be pleasant to use even in small Harnesses.

This lines up with how tools are exposed in the 0.99.0 changelog (direct, model-only, Codemode, deferred, hidden), which you can compare in the [release archive](/en/releases/#release-v0-99-0).

## Four: what Codemode is

The article explains it through a “trust boundary”. A Harness runs tools in roughly two places:

- **Where the Shell runs**: usually inside a less trusted sandbox.
- **Where the Harness's own Agent loop runs**: usually a trusted environment.

What is special about Codemode is that it runs on the Harness side. It is best understood as **a mechanism for orchestrating tool calls**: a model can use JavaScript to decide the order of calls, call in parallel, and combine the results of several tools. Because it runs on the Harness side, its state is stored in the session record, not in the filesystem.

Why JavaScript? The article's explanation: a small JavaScript runtime can be packaged as WASM, it is small, and it can provide reasonable isolation. According to the 0.99.0 changelog, Pi uses a QuickJS sandbox.

At the end the article demonstrates an example: inside Pi, in one sentence, have Codemode pull issues through Linear's MCP, hand them to the Jev classification model to judge the tone of every comment one by one, and finally summarise the most emotional comments. Throughout, most of the intermediate data is processed inside the Codemode script rather than poured into the conversation context.

## What this means for Buku Pi readers

- **Beginners do not need to change their learning order.** Fixed processes and inspection standards are still best written as Skills; work a CLI can already do is still done with the CLI first. [How to choose between a Skill and MCP](/en/reference/faq#skill-vs-mcp) in the reference guide has been updated for 0.99.0.
- **If MCP is configured, Codemode loads automatically**; even without MCP, Codemode can be added as a default tool. The original text suggests simply asking Pi to change its own configuration to enable it.
- **MCP in the core does not mean “the more the better”.** Every server you connect adds the cost of tool descriptions, authentication, and maintenance; confirm first what concrete problem it solves, then connect it.

::: info A note
This piece is the Buku Pi author's own guide to the Earendil article “You Said No MCP!”, not a translation; its summary of the argument follows the [original English text](https://earendil.com/posts/you-said-no-mcp/), and its version details follow the [official Pi changelog](/en/releases/).
:::
