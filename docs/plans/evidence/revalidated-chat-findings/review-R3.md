# Change Review Report

Review ID: **RCF-R3-20261103**

Task ID: **RCF**. Verdict: **APPROVE**.

Base/HEAD: `887c5898d0712cf4053e845bbf286e8dadd3cf80`.
Branch: `codex/revalidated-chat-findings-plan`.
Independent reviewer: `change_reviewer`, GPT-6 Astra high, read-only.
No tests, builds or formatters were executed by the reviewer.

## Bound identities

Closed 58-path manifest under `tmp/evidence/revalidated-chat-findings/20261103-01/`:

| Artifact | SHA-256 |
| --- | --- |
| R3-envelope.json | 3323A3B1D880825B12018AFC295471A3235E5DAAF1F45D74ACBA2946AA3A2629 |
| R3-reviewed-identities.json | FF695829D310607B1ADBD7083F25DB43C82FA8C5535FC3988024070E1BA81E4D |
| R3-all-source-identities.json | 1C0876FBCEA7B9610E6D9DDB7A09AAC90DB160E6696BD005BCFC7BE012224B50 |
| R3-tracked.patch | 7B0A0682602CF1102301F26BE4769FBAFDB38EA52607C64D369D5381B5A32F57 |
| R3-new-files.json | 60CA5F1CC411B7A8E3BF83A15EAF7DEF6E399E525C8367270D84C55C05A4CAC4 |
| R3-evidence-equivalence.json | 9083590520D7E9F68EA94778DEB9BF6C2DB36F5FA2B31EC5A0B815A96C763C9E |

Only this report is excluded from its reviewed manifest. Identity recheck:
**PASS**. Initial/final checks matched HEAD, all 58 changed-file hashes and
filter-aware blobs, complete porcelain path/status set and empty index.
All 1,531 source entries matched twice. Final check:
`2026-11-03T18:48:15.8984629Z`. Independent comparison of eight runtime-gate
receipts, input-manifest hashes and source closures found no drift.

## Acceptance

Complete for the reviewed implementation scope, RCF-01–22 and all registered
variants, approved delegated decisions and ADR-0070. Full-scope inspection and
actual subsequent deltas cover production, callers, regression assertions,
persistence, cancellation, bounded ownership and local EPUB/TTS boundaries.

- R1-F1 resolved: shared slower selections fall back once to 100%, preserving
  audio, paused intent, next-unit rate, one completion/release and independent
  preference-save outcomes.
- R2-F2 resolved: real backend distinguishes pending owner and current token;
  replacement joins retired creation, ignores its obsolete outcome and checks
  ownership/close before starting. Same-owner sharing remains. Real-backend
  coverage includes rejection, late success, alternations, disposal, healthy
  direct audio and close preventing queued replacement.
- Other reviewed behaviors remain: layout-only fallback, source/locator mapping,
  placement barriers, containment, predecessor continuity, manual inspection,
  optional cleanup, bounded manifests, package/benchmark ownership and buffer
  precision. No production dependency, EPUB transfer, persisted generated audio,
  model authority or architectural owner is added.

## Host evidence accepted

All results are implementer-attributed local PowerShell outside sandbox, with
exact commands/intervals in the [register](validation-commands.md) and receipts.

| Gate | Accepted result |
| --- | --- |
| G1 | Applicable exports, formats, lint and types pass; R3 renews affected TS/backend checks. |
| G2 | 516 EPUB tests; unchanged 200-path closure independently matched. |
| G3 | R3 632 tests / 18 suites, including final alternation coverage. |
| G4 | 165/164 native tests, eight ignored each; unchanged 231-path closure matched. |
| G5 | 126 Python tests; unchanged 262-path closure matched; existing cache warning disclosed. |
| G6 | R3 ten Chromium journeys together, no earlier browser result substitution. |
| G7 | Inapplicable: production native smoke harness unchanged; original inference entry preserved. |
| G8 | R3 build/six-rate Piper on binary fad859144f391967886da3acf44657b2d2ef63087aed45a4cfce9df3d6ea121e. |
| G9 | Exact local admission, 712.87 seconds, no inference; unchanged 232-path closure matched. Sources/environment/cleanup recorded. |
| G10 | Evidence/diff checks, 167 links, cleanup; index and identities independently verified. |

R3 host reports zero external requests/audio files and zero retained/discarded
units at cleanup; five contexts created/closed. Resources restored byte-for-byte,
no new owned roots/processes. Full WebView comparison covers 918 files.
Reuse of G2/G4/G5/G9 is accepted for exact R3 based on complete closures and
environment/artifact equivalence. Installed comparison: 24,007 equal entries,
two explained diagnostic/derived exclusions. Failed first R3 lookup is retained;
correcting its historical reference changes tooling evidence, not source/tests.
Earlier playback outcomes do not substitute for R3.

Unchanged supporting sources and filter-aware HEAD blobs remain as independently
verified in R1/R2 and the bound R3 full-source manifest: project/review policies,
architecture/diagram, roadmap/M005, applicable ADRs, App, persistence owners,
incremental WSOLA factory, narration source projector, locator index and native main.

Findings: **None remaining**. No unresolved acceptance blocker.
Automated host checks do not establish listening quality or general hardware performance.
No next action for implementation review. Later archival/documentation changes
require fresh assessment/identities; approval hashes must not be refreshed.
This report grants no commit, push, PR, merge or publication permission.
