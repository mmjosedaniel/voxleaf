# ADR-0070: Explicit placement and recovery boundaries

## Status

Policy accepted under the user's delegated decisions on 2026-11-03.
Implementation acceptance is recorded in the
[RCF execution ledger](../../plans/evidence/revalidated-chat-findings/execution-ledger.md).

## Context

Reader placement, heard progress and asynchronous preparation have distinct
owners. A known location is not proof that it is placed or immediately precedes
another prepared segment. A committed package can be valid while owned cleanup
still fails. These distinctions must remain visible and bounded.

## Decision

- Validate an EPUB rendition's complete package, navigation and supported content
  before layout-only fallback to the next rootfile. Structural, security,
  cancellation and shared-budget failures remain fatal to the open operation.
- Preserve signed 32-bit ordered-list starts and explicit item values in the
  semantic model and DOM. Omitted empty visible items still affect numbering;
  hidden items do not. Coalesce text within raw leaves without crossing semantic
  context or source-location boundaries. Hidden navigation descendants contribute
  neither text nor alt text; aria-hidden alone is not visual hiding.
- Apply the code-to-prose numeric admission boundary to all profiles, including
  legacy v1. The normalized output and frozen evaluation corpus are unchanged.
- Gate every Play entry point until reader placement settles, including initial
  restoration and inactive navigation. Configuration changes require verified
  containment before persistence or profile mutation.
- Enable Previous only with a known immediate predecessor from contiguous
  preparation or the current audio FIFO. Do not add reverse preparation.
- Manual inspection supersedes terminal visible settlement and paused typography
  following. Keep heard-checkpoint persistence separate; Resume and the next
  audible segment restore following. A saved paragraph action starts that paragraph
  and says so. Natural completion releases its ticker before publication.
- A failed future speed preparation falls back to 100% with visible explanation.
  Preserve healthy current audio. Repeated/slower choices sharing the failed
  attempt still require fallback; a released or independently replaced attempt
  cannot override the later choice. Join a retired creation before admitting its
  replacement, retaining one in-flight creation and close ownership. Persist through the existing preference
  owner and report a save failure separately. Active-unit playback
  faults retain fatal containment. Sum precise effective durations before flooring
  once; suppress low-buffer only for an exhausted positive-frame tail.
- Keep optional Cancel available during unrelated settings operations. Each
  pending operation may settle only its own presentation state.
- Retain bounded post-commit cleanup provenance. The explicit Check action uses
  the additive optional `retryCleanup` argument on the existing snapshot command.
  An idle retry holds admission ownership, verifies the committed runtime, cleans
  its exact owned backup/staging paths and verifies again before Installed.
  Ordinary polling is read-only, including after restart. An incomplete older
  staging tree is cleaned by explicit removal or the next admitted acquisition.
- Bound core manifest reads by the embedded authority length and optional reads
  by the largest exact admitted current/cleanup manifest (2,662,009 bytes), with
  cap-plus-one rejection. Preserve hash, path and cancellation checks.
- Before restoring backup-only release parts, validate the complete visible and
  virtual archive sequence and corresponding package tree when present. Ambiguity
  preserves bytes for explicit recovery. Retired benchmark iterators and cancellation
  cannot acquire a replacement channel or worker.

## Consequences and alternatives

Unknown backward continuity leaves Previous disabled. Failed containment leaves
settings unchanged. A cleanup failure remains truthful until explicit recovery;
polling does not perform background deletion. A future speed fault does not
require restarting healthy current audio. These choices avoid guessing from sorted
locations, silently skipping malformed renditions or treating a stored preference
as evidence that preparation succeeded.

There is no new process, dependency, audio persistence, model authority or
architectural owner. M005 remains the safe-document-to-narration boundary; its
historical acceptance is not extended to playback. The canonical system topology
is unchanged.

## Verification

The RCF plan requires grouped EPUB, desktop, native and Python suites, Chromium,
one packaged six-speed Piper run, exact optional local admission and independent
change review. `test:chatterbox:v7:local-admission` now selects admission-only replay;
the existing ignored `optional_v7_exact_local_acquisition_replay` retains its
additional ES/EN inference path. This separation avoids accidental GPU evaluation
when only verifier/admission behavior changed.
