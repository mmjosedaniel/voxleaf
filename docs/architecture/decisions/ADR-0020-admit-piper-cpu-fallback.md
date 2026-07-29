# ADR-0020: Admit Piper as a selectable CPU fallback

## Status

Accepted. M010 Milestone 5 selects the exact Piper 1.4.2 /
`es_ES-davefx-medium` profile as a supported CPU fallback after every frozen
v6 gate passed. Runtime and settings integration remain M010 Milestone 6 work;
installer and license fulfillment remain M011 work.

## Context

ADR-0013 rejected the original balanced and compatibility candidates.
ADR-0015 retained exact Qwen/Serena only for a constrained GPU development
demo. ADR-0019 then required a new result-blind, complete evaluation before a
CPU profile could be recommended or selected.

The v6 cycle evaluated a new Piper ONNX Runtime CPU identity with verified
local artifacts, normalized Spanish input, zero retries, offline isolation,
bounded publication, termination-backed cancellation, memory accounting, and
one fluent-Spanish MVP quality review. The content-safe result passed all
machine, quality, privacy, cleanup, licensing, and packaging-eligibility
gates.

## Decision

VoxLeaf admits
`piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1` with role `cpu-fallback` and
support state `supported`.

Piper is the speed-focused CPU option. Exact Qwen3-TTS/Serena remains a
higher-quality GPU-dependent development-only option. Neither engine silently
replaces the other. After Milestone 6 integrates the admitted runtime,
compatible users may choose between available admitted profiles, while the
matcher may recommend only a compatible `supported` profile.

The Piper identity, configuration, result, and fixed safety margins remain
immutable. Selection does not authorize a second simultaneous TTS worker,
automatic synthesis retry, persisted generated audio, remote inference, or
bypassing hard compatibility checks.

Piper remains a separately identified local process. Distribution must
include GPL-3.0-or-later obligations for the engine and bundled phonemizer and
CC0 model provenance. Until M011 fulfills and validates those requirements,
the profile is admitted technically but not release-packaged.

## Consequences

- VoxLeaf now has one evidence-backed CPU fallback candidate.
- Its measured total sustained RTF of about 0.025 provides substantial
  real-time headroom on the declared host.
- The one-maintainer quality score supports an MVP choice, not a universal
  dialect or accessibility claim.
- M010 Milestone 6 must add the exact service adapter/profile selection and
  resilience matrix before the option is user-visible.
- Qwen/Serena remains available only through its existing development gate.
- M011 must resolve packaging, notices, source offer, model provenance,
  installer size, signing, and update behavior before release.

## Alternatives considered

### Replace Qwen immediately

Rejected. The two profiles optimize different constraints, and Piper has not
yet been wired into the product service. User choice plus evidence-backed host
matching is more truthful.

### Keep Piper as unselected research evidence

Rejected. It passed every frozen gate with strong throughput, low memory, good
Spanish quality, offline execution, and bounded cancellation.

### Run Piper and Qwen simultaneously

Rejected. Current process, queue, cancellation, and recovery authority permits
one active service tree. A second worker would add unmeasured memory and
identity risk without being necessary for real-time Piper output.
