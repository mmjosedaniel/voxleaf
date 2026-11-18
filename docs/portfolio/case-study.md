# VoxLeaf: local AI through agentic development

<!-- Privacy redaction. Repository account links are recorded as their original reference IDs. -->

VoxLeaf turns a local EPUB into an interactive reading and listening experience.
The project combines a React frontend, a Rust desktop host and a Python inference
service. Here, full stack means these cooperating local layers; the application
does not depend on a hosted backend to process books or generate speech.

[Watch the existing demo](https://www.youtube.com/watch?v=2CU36tmh7Fc) ·
[Try the original sample](try-voxleaf.md) ·
[See the compact architecture](../architecture/system-diagram-compact.md)

## Contribution and development model

The maintainer contributed the product idea, selected some of the tools and
decided to use agentic development workflows. Coding agents carried out the
development. This portfolio therefore demonstrates an approach to directing
agentic delivery and integrating local AI, with explicit attribution of who
performed implementation. It does not claim that the maintainer manually wrote
the code, independently designed every subsystem, trained the speech models or
personally performed every recorded test.

The maintained workflow separates planning, implementation, checking and review:

1. Product constraints and architecture define what the application may do.
2. An ExecPlan records scoped work, acceptance, discoveries and unresolved limits.
3. Implementation agents inspect existing owners and change bounded areas.
4. Tests run in local PowerShell outside the automation sandbox; hosted CI
   provides a separate environment check.
5. An independent Astra reviewer evaluates behavioral changes and their evidence.
   Refactor campaigns instead use distinct audit, implementation and validation roles.
6. Findings, corrections and acceptance remain traceable to the reviewed source.

These are engineering controls, not proof that agents cannot make mistakes.
The [review workflow](../development/agentic-change-review.md),
[refactor workflow](../development/agentic-refactoring.md) and
[findings registry](../development/findings/README.md) describe the actual rules.
Human intent and authorization remain distinct from agent execution and review.

## Decision 1: local inference with an accessible CPU path

Uploading books would undermine the privacy goal. Bundling every model would
make installation and hardware requirements harder to satisfy. The selected
design bundles bilingual Piper voices and offers Chatterbox as a separately
verified, consented download for compatible hardware.

The tradeoff is visible: local speech consumes the user's CPU/GPU and memory;
higher-quality optional narration has substantial download and startup costs.
The application reports compatibility and loading phases rather than promising
instant playback. See the [support matrix](../architecture/tts-support-matrix-v2.md)
and [release guide](../user/windows-release.md).

## Decision 2: progressive audio with explicit ownership

Generating an entire audiobook before listening would increase waiting and
storage. VoxLeaf prepares bounded segments, generates local speech progressively
and retains playable audio in memory. The native host owns the service process;
session/generation identities distinguish current work from stale results.

Seeking, changing a book or replacing the selected profile must contain obsolete
work before it can affect the new session. Quick start is based on playable
audio depth, not a fixed timer. This makes buffering and cancellation explicit
engineering responsibilities. See [system invariants](../architecture/system-diagram.md#privacy-persistence-cancellation-and-bounds)
and [performance definitions](../architecture/performance-budget.md).

## Decision 3: stable locations across reading and listening

A rendered page changes with font size, viewport and content width. VoxLeaf uses
logical EPUB locations so navigation, narration start, highlighting and saved
progress can share an identity even when layout changes.

The difficult part is event ordering: a newer navigation or Stop must invalidate
an earlier pending placement, and approximate recovery must not masquerade as
exact restoration. The [passage-navigation correction](../plans/completed/passage-navigation-minimal-corrections.md)
records concrete cases, regression coverage and acceptance rather than claiming
that one successful demonstration proves every ordering.

## Evidence and its limits

| Evidence | What it establishes | What it does not establish |
| --- | --- | --- |
| TypeScript, Rust and Python regression suites | Specified parser, state, protocol and failure cases | Complete absence of defects |
| Chromium and packaged WebView2 checks | Selected real rendering and desktop journeys | Every device, publication or assistive technology |
| Exact-host model journeys | Recorded model/artifact behavior on the tested host | Universal latency or audio quality |
| Independent agent review | Separate inspection of the exact patch and attributed evidence | External certification or human authorship |

Historical measurements illustrate the tradeoff. The historical Chatterbox v2
exact-artifact journey recorded Quick command-to-audible at **49.269 s Spanish /
37.773 s English**. These observations come from representative Windows host
runs in the [M011 plan](../plans/completed/M011-package-validate-and-release-mvp.md)
and [release guide](../user/windows-release.md); they are not a comparison with
Piper, universal promises or fresh v7 measurements.

For a compact example of the review process, the
[CLI implementation report](../plans/evidence/development-guidance-and-command-clarity/review-r1.md)
ties selected-version diagnostics to regression assertions and a documented
1,114-test Python run. That count describes its historical patch, not a new run
or a code-coverage percentage. Current workflow results are on
GitHub Actions.

## Current product boundary

The Windows application remains a pre-alpha portfolio MVP with an unsigned local
installer. Public distribution awaits signing and release approval. Supported
EPUB profiles are intentionally bounded. The browser route demonstrates reading,
not native speech. CCF-C05 Unicode identifier parity remains pending for the next
separately versioned Chatterbox runtime; current checkout tests do not close it.

The next useful evidence is reliable evaluation by people outside the development
workflow and documented observations from their first reading/listening journey.
This case study makes no claim of broad user adoption or independent usability validation.
