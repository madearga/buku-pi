---
title: How Subagents divide work
description: 'Understand Subagent collaboration from four sides: role, input, result, and verification.'
prev:
  text: Extension requirements and verification
  link: /en/guide/first-extension
next:
  text: 'How Pi works: from a single Prompt to a complete Agent Loop'
  link: /en/guide/how-pi-works
---

<span class="library-status">MODULE 04 · STEP 12 · trainable</span>

# How Subagents divide work

A single Agent can get a lot done on its own. When a task at the same time needs technical review, text editing, and checking by a real user, splitting the work among several Subagents is where you might save time.

As of 2026-09-09, the official documentation clearly states that Pi's core has no built-in Subagent; what the official code repository provides is an example Extension. The absence of a task-division button in the interface does not mean the installation failed. This lesson first completes the same task-division structure with two separate sessions, does not require installing a community Package, and does not write manual exercises as a built-in capability.

## What kind of task is suitable to divide

Subtasks that are suitable to run in parallel have two traits: clear boundaries and the ability to be handed off independently. For example, one update to this Buku Pi's content can be divided into:

| Role | Input | Result |
| --- | --- | --- |
| Beginner reader | The installation chapter | Finds the sections that leave a reader confused about where to type and what result to look at |
| Technical reviewer | Official documentation and technical chapters | Lists statements that are outdated, inaccurate, or lack boundaries |
| Managing editor | Full chapters and the learning path | Checks repetition, missing steps, and before-and-after disconnections |

The situation that does not suit parallelism is when several Agents modify the same file at the same time with no clear owner. That very easily causes overwrites, conflicts, and inconsistent standards.

## How to write a division of work that can be verified

The description given to a Subagent contains at least:

- Only handle certain files or a certain problem.
- Whether it may modify, or may only check read-only.
- What evidence to return when done.
- Which judgments must be returned to the main Agent and must not expand the scope on their own.

The main Agent's responsibility is not just to send tasks and then be done. It has to merge results, handle conflicts, run an overall check, and be responsible for the final result.

## Do not grow the team too early

If you cannot yet write a verifiable task for one Agent, adding Subagents will usually only make the problem harder to understand. First finish three to five real tasks with one Agent, then divide up the parts that are already stable, independent, and repetitive.

<a id="choose-subagents"></a>

## How to choose a Subagent extension

Complete the manual task-division case below before deciding whether to install anything. What follows is a source check from **2026-10-12**; all four are unofficial projects, and versions, maintenance status, and permissions are governed by each repository, not ranked by download counts.

| Project | Version, installation, and maintenance | Fit and boundaries |
| --- | --- | --- |
| [badlogic/pi-subagent](https://github.com/badlogic/pi-subagent) | The internal manifest says `0.1.0`; a private package with no public npm version or Release. The README installs through a source clone and a CLI symlink, and needs Node.js 22.19 and tmux. The latest commit is from 30 September; not archived, no Issues entry, and no license was found. | Suits people who are used to tmux and want to look at sub-sessions directly; nesting is not supported. Public source does not mean an open-source license already exists, so check the licensing before use; confirm the install path and SSH prerequisites against the README. |
| [nicobailon/pi-subagents](https://github.com/nicobailon/pi-subagents) | `0.77.0`, MIT; `pi install npm:pi-subagents@0.77.0`. Released on 10 October, still had commits on the 11th, not archived. | Suits people who need preset roles such as reviewer, scout, and oracle, with foreground and background delegation; first confirm which model, tools, and background behavior each role actually chooses. |
| [tintinweb/pi-subagents](https://github.com/tintinweb/pi-subagents) | `0.20.0`, MIT; `pi install npm:@tintinweb/pi-subagents@0.20.0`, requires Pi 1.1.0. Released on 9 October, still had commits on the 11th, not archived. | Suits people migrating Claude Code-style Agents and workflow habits; nesting is off by default, and a child's tool restrictions are not inherited from the parent automatically, so configure them one by one. |
| [pi-subagent-manager](https://github.com/championswimmer/pi-subagent-manager) | `0.25.0`, MIT; `pi install npm:pi-subagent-manager@0.25.0`, requires Pi 0.99.2 and Node.js 22.19. Released and committed on 11 October, not archived. | Suits people who need path trees, nesting, and pause-and-resume; it shares the working directory and system permissions, and its tool policy is not a sandbox. |

Only the first item has a source-installation flow; its install steps are in the [project README](https://github.com/badlogic/pi-subagent#install), and this lesson does not maintain its own symlink script. The `earendil-works/pi-subagent` address used in that README currently redirects to the author's repository, which is not grounds to treat it as an official product.

Keep the same boundary as the [plugin picking page](/en/plugins/#subagents): before installing, read the source, the dependencies, and what gets installed, then use an isolated practice directory that holds no real data; extra model calls can add cost. Install one at a time, because several extensions can compete for commands such as `/agents`. Prompts and tool lists are no substitute for system isolation.

The commands in the table are for checking installation sources; this lesson does not ask you to run each one. If you try one npm item and then switch to another, first remove it with `pi remove` and the same source, then confirm with `pi list` that it is gone; handle source installations according to that project's README.

### The maintainer's minimal reproduction

On 2026-10-12, in an independent configuration and practice directory, I installed `pi-subagents@0.77.0` and, with Pi 1.1.0, delegated one foreground `delegate` pinned to `deepseek/deepseek-flash:off`, asking it to reply only with `BLUEBOOK_CHILD_OK`. This file-change-free test explicitly used the documented `acceptance.level: "none"`, and the maintainer checked the returned marker independently; the tool events recorded one subtask, an exit code of `0`, and a tool count of `0`, and the main session received the same marker. It was then removed with the same source, and `pi list` showed no Package.

This verifies one foreground delegation only. Concurrency, background delegation, nesting, restart recovery, and the other three extensions were not tested, so this must not be written up as all four being “verified to work”.

## Companion practice: CASE 05 · Two independent review tracks

This lesson no longer maintains a second set of operational steps. Go to [CASE 05 · Two independent review tracks](/en/cases/independent-review) and practice once all the way through following the fixed material inside: three sessions, the original task text, independent verification, and failure recovery.

This case study deliberately separates two review tracks, and then the main session merges the evidence. What is practiced is the boundary of subtasks and the responsibility to merge, not writing manual sessions as a built-in core Pi Subagent feature.

## Verifying this lesson

- Can explain which tasks are suitable to separate, and which files must have only one final owner.
- Can write down for each track: input, read-only or modify permission, handover evidence, and what is not yet known.
- Has checked the two independent results and the main session's merge notes following CASE 05, or can explain the verification relationship accurately.
- Can explain: this is a manual exercise of the task-division method, and does not mean Pi's core has built-in Subagents.

### Basis for this chapter

- [Design principles in the Pi usage guide](https://pi.dev/docs/latest/usage#design-principles)
- [The index of official Pi Extension examples](https://pi.dev/docs/latest/extensions#examples-reference)

The core capability boundary keeps its original verification date of 2026-09-09; the extension research and the minimal reproduction above were recorded separately on 2026-10-12.

- [pi-subagents v0.77.0](https://github.com/nicobailon/pi-subagents/releases/tag/v0.77.0)
- [tintinweb v0.20.0](https://github.com/tintinweb/pi-subagents/releases/tag/v0.20.0)
- [pi-subagent-manager version and license](https://github.com/championswimmer/pi-subagent-manager/blob/main/package.json)
