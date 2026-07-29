# ADR-0025: Supersede v7 with local Qwen bilingual v8 authority

## Status

Accepted for M010.1 before any v7 or v8 result. This decision changes
evaluation authority only; product narration remains Spanish-only.

## Context

M010.1 Milestone 1 froze v7 with a Piper English baseline and bounded
Chatterbox/MOSS screens. After that pull request merged, review of the official
Qwen documentation established that the exact already integrated
`Qwen3-TTS-12Hz-1.7B-CustomVoice` checkpoint supports both product languages
and has native English built-in voices. V7 contained no result-bearing file,
so candidate coverage could still be corrected without result-informed
selection.

Editing v7 would destroy historical authority. Treating the old Qwen
0.6B/Aiden rejection or Qwen 1.7B/Serena Spanish evidence as English evidence
would conflate different model, voice, and language identities. Alibaba
Cloud's real-time API is remote and cannot satisfy VoxLeaf's local-only
product boundary.

## Decision

Keep every v7 byte immutable and adopt
[`tts-bilingual-profile-v8`](../tts-feasibility-profile-v8.md) as a layered,
result-blind superseding authority.

V8:

- reuses v7 product behavior, bilingual normalization corpus, evaluation
  corpus, gates, evaluator policy, stop conditions, and the three original
  admitted candidates;
- adds exact local Qwen 1.7B CustomVoice / Serena / Spanish and Qwen 1.7B
  CustomVoice / Aiden / English profiles using the existing isolated lock;
- evaluates the two Qwen language/voice identities independently;
- keeps Aiden as the only bounded native-English Qwen voice and defers Ryan;
- excludes cloud APIs, voice cloning, and voice design;
- keeps at most one new-engine full-matrix survivor; and
- requires every result to strictly descend from a commit containing both the
  exact v7 base and v8 amendment.

The Qwen controls do not count as new-engine survivors because the engine is
already integrated for development. This classification does not grant them a
support advantage: each exact profile must pass every applicable gate and its
own fluent-language evaluation.

## Consequences

- V7 remains auditable history but no v7 execution should begin.
- M010.1 result-bearing work must use v8.
- No threshold, corpus, or normalization implementation is reopened.
- Current Piper Spanish support and Qwen/Serena development status do not
  change.
- Aiden is not selectable until later implementation and accepted evidence.
- The existing Qwen environment and artifacts can be reused for both profiles,
  but only one resident model/session is allowed.
- M011 retains final packaging, notice, artifact-delivery, and license
  fulfillment responsibility.

## Alternatives considered

### Edit v7 in place

Rejected because a frozen authority must remain historical and reviewable.

### Add both Aiden and Ryan

Rejected to keep the pre-M011 screen bounded. A later result-blind authority
may add Ryan only if Aiden is rejected and the comparison remains worthwhile.

### Use Alibaba Cloud real-time TTS

Rejected because it requires remote inference and credentials and would send
text outside the device.

### Reuse the old Qwen 0.6B/Aiden result

Rejected because it is a different model size/revision and cannot establish
the exact 1.7B/Aiden profile.
