# ADR-0029: Advance Chatterbox, retain Qwen, and defer MOSS

- **Status:** Accepted
- **Date:** 2026-07-30
- **Decision owners:** VoxLeaf maintainers
- **Related:** ADR-0015, ADR-0023, ADR-0026, ADR-0028, M010.1

## Context

Corrective v9 produced real bilingual MOSS inference after the historical v8
artifact mismatch. Experimental v11 produced real bilingual Chatterbox
inference on the exact RTX 5060 host after v10 established that upstream's
Torch 2.6 CUDA build lacks `sm_120` kernels. Both corrective screens completed
all ten generation cases and all eight cancellation trials.

The fluent bilingual maintainer preferred Chatterbox's overall voice quality.
MOSS was understandable and fast, but its dialogue case stopped after the
opening question in both languages and its accent was not preferred.
Chatterbox had cross-language accent limitations but no observed truncation,
meaning-changing defect, or wrong-language output.

Historical v8 measured Qwen/Serena Spanish and Qwen/Aiden English at
approximately 1.44 warm p95 RTF on this laptop. ADR-0026 already corrected the
mistake of treating the preferred `RTF <= 1.1` standard target as an automatic
rejection from VoxLeaf's approved constrained buffered path. The maintainer
also wants Qwen retained because a stronger compatible GPU may generate faster.

## Decision

- Advance the exact v11 Chatterbox profile as M010.1's sole new-engine
  full-matrix survivor. Advancement is evaluation authorization, not product
  admission.
- Defer the exact v9 MOSS profile without rejecting it. Future work may test
  deterministic dialogue/punctuation handling and other properly frozen
  non-personal voice options.
- Retain exact Qwen/Serena Spanish and Qwen/Aiden English as separate
  hardware-dependent existing-engine candidates.
- Treat Qwen's measured RTF, startup, memory, and complete-waveform
  cancellation behavior as inputs to bounded-buffer planning. Do not convert
  them into either a general-hardware support claim or an automatic rejection.
- Require new result-neutral, language-specific private quality decisions for
  both Qwen voices before M010.1 integration changes their availability.
- Keep the one-new-engine integration limit. Qwen does not consume it because
  VoxLeaf already has an exact Qwen engine and Serena development adapter.
- Keep current runtime support unchanged until the later full evaluation,
  decision, integration, and exact-host product milestones pass.

## Consequences

Milestone 5 may spend its new-engine full-matrix budget on Chatterbox while
continuing the two Qwen language-specific decisions. MOSS remains a credible
post-MVP or separately authorized CPU investigation rather than being lost as
a false rejection.

Better hardware may make Qwen more responsive, but each admitted hardware
profile needs measured compatibility and margins. VoxLeaf cannot promise that
all stronger GPUs pass based on this one laptop.

Chatterbox's experimental Torch 2.9.1+cu128 override, higher RAM use, bundled
conditioning, cross-language accents, lack of native speaking-rate control,
license obligations, and packaging cost remain explicit risks. M011 still
owns distributable runtimes, models, voices, notices, and license fulfillment.

The selection does not change the canonical EPUB preparation boundary,
protocol v1, buffering topology, runtime service tree, support matrix, or
system diagram.

## Alternatives considered

- **Remove Qwen because it is slower than real time on this host.** Rejected
  because constrained buffering is already an accepted product mode and the
  result does not predict every compatible GPU.
- **Reject MOSS now.** Rejected because it passed the machine and cancellation
  screen and produced understandable audio; the dialogue truncation and accent
  warrant targeted investigation rather than a family-wide rejection.
- **Advance both MOSS and Chatterbox to full matrices.** Rejected because the
  plan intentionally limits new-engine scope and Chatterbox was the stronger
  maintainer preference.
- **Admit Chatterbox immediately.** Rejected because a bounded screen is not
  the complete product, resilience, licensing, and integration matrix.
