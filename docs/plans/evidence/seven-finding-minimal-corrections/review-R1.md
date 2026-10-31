# Change Review Report

Review ID: R7-R1-20261030
Task ID: seven-finding-minimal-corrections
Verdict: CHANGES_REQUESTED
Base commit and reviewed HEAD: `79bcb814d57c3b8016c1c1315684c1eb158e2a59`
Reviewer: independent `change_reviewer`, GPT-6 Astra high; read only, no tests.

## Identities

Closed 62-path manifest:
`tmp/evidence/seven-finding-minimal-corrections/R7-R1-20261030-manifest.json`.
SHA-256 `0daf208c418153efb1c2c28308206de21041739474a7c23a3af278dc9a409239`.
Complete supplied patch SHA-256
`9b2115159657bf39fe265ab7a3fa2d586f2e17b7a03a578c175c96092cd4dd02`.
Identity recheck: PASS before/after; HEAD, empty index, changed-path membership
and every manifest SHA-256/filter-aware blob matched. No reviewer edits/tests/Git
mutations. Additional unchanged supporting paths were independently checked:

| Path | SHA-256 | Filter-aware blob |
| --- | --- | --- |
| `.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md` | `a5f2d805063ba8536cc046b361ea5bda732f55d9166afe137b08bc01175f49ae` | `16ba1a7002366ad9312223d51dace7902d6ae751` |
| `.agents/skills/validate-safe-refactor/references/validation-policy.md` | `7686223dafc5a5095f5e3a5d0a1f28604fa9260a2ed62b5c8de5ed3288a6faba` | `f7a1f5fbf5a2473a121e675e245110fcf4025aa4` |
| `docs/architecture/decisions/ADR-0012-bounded-narration-preparation.md` | `4bde996094e134189abe98600b7b8af4fc002ad5645dafc71426403f79b7cf73` | `b7af31a9544520cf5dba8fa3f524fca660ee3a44` |
| `docs/architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md` | `30fef46e862af8b4f62f6ab3d72413482d468eb4ddea3606d9d6cf4861b58e94` | `1220b1b996ddfa60dfe444cd91b35adf9cb95a9d` |
| `docs/architecture/decisions/ADR-0056-bound-reader-narration-lifecycle-operations.md` | `b2e4a799618e3cc79ed5e9f9c8a284b039bc51dd2b544bb89d0aabd9e3bf7719` | `bda03631807ab4b9513862c35ebe29d8c4aa7fde` |
| `docs/plans/completed/M005-narration-text-preparation.md` | `a20136c18ee476bfad5a7a8d6e12c40beae7db3180bbbe38f62e4019e69ed7d6` | `219ae4fe16b4c740b1fbbbafb867f4071c0be7f8` |
| `docs/plans/roadmap.md` | `664a0323d2b20e055ac64b104479aa11e751ef45ce71ed8a607ab27584f34428` | `21f8bc4a2e4898f2ed6518b527e9e9c8cb50c6f5` |
| `services/tts/benchmarks/dual_worker_runtime.py` | `ecc8e79bd8472f34a088358b4f4c3551b19035f3d03fbea8a84d2a2cd7791b36` | `69b0b9ff81990e9b6ff75a33d66b7e07835a8ec0` |

## Acceptance and finding

R7-01/02/03/04/06/07 have no actionable findings from this review. Existing
cleanup, acquisition, reader, persistence and native-session owners are retained.
R7-05's state is fixed-size/content-free but differs from one normalizer.

**R7-R1-F1, P2/medium:** `summarizeQuotationContext` in
`packages/epub/src/narration/narration-quotation-context.ts` accepts all Unicode
letters/marks around `’`, while `narration-normalizer.ts` uses the closed Spanish
character set plus ASCII digits. A neutral/Spanish paragraph with an opening
single curly quote, a `’` between non-Spanish Unicode letters, and a later
closing quote can retain an opening in the checkpoint after the original
normalizer consumed it. Matched versus malformed final quotation changes the
scanner's sentence suffix and potentially prepared text/ranges across batching.
Current tests omit this single-curly Unicode disagreement.

Bounded correction: match the selected normalizer's existing policy without
broadening it. Add public complete-segment/range comparisons for 1/8/16 and cold
continuation, retaining bilingual Unicode-apostrophe behavior as a control.
Rerun affected checks on a new immutable revision.

## Evidence and limits at report issuance

Host receipts (not reviewer executions): G2 format/lint/types; G3 EPUB248;
G4 desktop217; G5 Python17; G6 optional64/two ignored per mode, supervisor33/32
with five ignored per mode; Chromium2 and native G7; Node runner45; G8 corrected
Piper matrix with unchanged binary `d2bf7fb40d50311f181d310812166239cbf33a8cb2724c39c23d42bf5592eff3`,
2,023 staged files checked and original resource restoration; G9 supervised
ES/EN and 13,091 runtime files checked. Zero reported external requests/audio
persistence and verified owned cleanup in G8/G9.

Current-task retention is supported for R1: later edits outside Python/Rust
inputs do not invalidate those gates; EPUB test expansion does not enter the
browser; saved-rate diagnostics are exercised by subsequent G8. G3 formats its
test before executing and final bytes were captured during G7-native and after
by G2-ts-expanded. These passes do not cover F1. No historical runtime result
is accepted.

Remaining uncertainty: static classification mismatch confirmed; the new public
fixture had not yet executed at issuance. Documentary archival remains pending.
Required next action: resolve F1 with discriminating host evidence and affected
final-byte checks, then request a new review ID. No Git/publication authority.
