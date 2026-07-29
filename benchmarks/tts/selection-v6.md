# Local TTS CPU fallback selection v6

## Status

Accepted on 2026-07-28 as the content-safe M010 Milestone 5 decision.

The exact Piper 1.4.2 / `es_ES-davefx-medium` ONNX Runtime CPU profile passes
every frozen v6 gate and is selected as VoxLeaf's first admitted
`cpu-fallback` profile. This is a speed-focused selectable alternative, not a
silent replacement for the development-only Qwen/Serena profile and not a
population-wide Spanish quality claim.

## Authority and result

- Corrected frozen authority commit:
  `9a2f74845853e84635b419a4e65170c9a2c207ee`.
- [`profile-v6.json`](profile-v6.json) SHA-256:
  `ec0ef6aceedfc2ed4df199cc276b5c8365f979921311a7d2cd3d813546e1bd48`.
- Official execution commit:
  `d9f2929be40e40b2fa85078816ea854fad9a6c69`.
- [`cpu-fallback-result-v6.json`](cpu-fallback-result-v6.json) SHA-256:
  `8d8005f3909517276faecacda859db48714a497ccd3a2a92797a7cedb3eb38f8`.
- Candidate configuration identity:
  `9e9b1a93aed70cfdbdd8dd8141d2a7edb363530372387d7596bb4ef8d46bd918`.

The private performance journal, waveforms, scorecard, randomization key, and
correction record were deleted by successful derivation. Only the
schema-valid content-safe result remains.

## Evidence

| Gate                                 |                      Result |
| ------------------------------------ | --------------------------: |
| Cold-load p95                        |               1.521 seconds |
| Warm first-audio p95                 |               0.414 seconds |
| Warm RTF p95                         |                      0.0525 |
| Sustained RTF p95                    |                      0.0361 |
| Total sustained RTF                  |                      0.0252 |
| Sustained media                      |             198.356 seconds |
| Peak process-tree RAM                |           411,070,464 bytes |
| GPU allocations                      |                           0 |
| Cancellation                         | 5/5 pass; zero stale frames |
| Failed first attempts                |                           0 |
| Overall quality                      |                     4.621/5 |
| Intelligibility                      |                      4.75/5 |
| Spanish pronunciation                |                      4.50/5 |
| Lowest quality dimension             |                      4.25/5 |
| Meaning-changing defects             |                           0 |
| Offline, privacy, artifacts, cleanup |                        pass |

The fluent-Spanish evaluator initially marked one temperature sample as
meaning-changing, then clarified before decision derivation that it omitted a
vowel but remained understandable and preserved meaning. The original private
scorecard remained immutable. A separate content-free correction changed only
that Boolean classification; every numeric score remained unchanged.

## Decision

- Admit profile ID `piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1` as
  `role: cpu-fallback`, `supportState: supported`.
- Present Piper as the fast, efficient CPU choice after M010 Milestone 6
  integrates the admitted profile into the service and settings.
- Retain exact Qwen3-TTS/Serena as the optional higher-quality,
  GPU-dependent, development-only profile. Do not silently replace it or
  promote it to standard support.
- Recommend or reuse Piper only when the privacy-safe host matcher satisfies
  its immutable platform, processor, RAM, storage, CPU-provider, precision,
  evidence, and safety-margin requirements.
- Preserve one active service tree, zero automatic synthesis retries,
  identity-first cancellation, bounded in-memory audio, and no generated-audio
  persistence.
- Do not claim that Piper runtime integration, settings selection, installer
  distribution, or production packaging already exists. M010 Milestone 6
  owns runtime/profile integration; M011 owns packaging and release.

## License and packaging boundary

Piper and its bundled phonemizer are GPL-3.0-or-later; the evaluated voice data
is identified as CC0. Product distribution is conditional on keeping Piper a
separately identified local process, shipping the applicable notices and
model provenance, and providing corresponding source or a compliant written
offer. The passing technical result does not waive those M011 obligations.
