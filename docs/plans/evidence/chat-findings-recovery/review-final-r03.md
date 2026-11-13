# Change Review Report

Review ID: **CFR-CR-FINAL-R03-20261113**  
Task ID: **chat-findings-recovery — M0–M6**  
Verdict: **APPROVE**  
Base commit and reviewed HEAD: **95eb4887121f2696beabade407d04afa6441e881**  
Branch: **codex/chat-findings-20261112-plan**

This approval applies to the exact frozen patch and acceptance scope below. It is an independent correctness review, not a Validation Report or authorization for Git mutations.

**Reviewed paths and identities**

The closed review set comprises:

1. All 79 paths in `tmp/evidence/chat-findings-recovery/cfr-final-r03-frozen/manifest.json`.
2. The 13 supplemental paths and exact identities recorded in the immutable `docs/plans/evidence/chat-findings-recovery/review-preliminary-r01.md`, SHA-256 `fef2163db1d440e081cce20b13d568fe25cc25453958e2d8b2d5029d727bfa32`.
3. The seven additional unchanged supporting paths listed at the end of this report.

The package reviewed was **cfr-final-r03-frozen**, exclusively. Its identities are:

| Artifact | SHA-256 |
|---|---|
| `manifest.json` | `49cab04296d42398c06e56489976e339c52193d82da5f72ab32364de21d58d3b` |
| `patch.diff` | `b1a8171965c63304ef00fb0a3d84fa83862892346122281576b8245099b6969d` |
| `evidence-hashes.json` | `58829c2ce16a0eeecd1eec56c0fd455c485cf8a3d498999efdbe4be6e68a9d07` |
| `input-projections.json` | `8764baf158186254362576a89f8d6978fbef1fdc08e3838fa67f5b4aef2e2059` |
| `review-request.md` | `b614b5fe4fffab1543c890158efa99743d9f21b3cc3a425f36062b1a347d4670` |

**Identity recheck: PASS**

Entry and exit inspection established matching HEAD, empty index, and matching status, raw SHA-256 and filter-aware Git blob identities for the manifest paths. Exit inspection also established:

- No changed or untracked paths outside the manifest.
- All seven new-file copies match their working-tree files byte for byte.
- Current `git diff --binary --no-ext-diff HEAD --` exactly matches the supplied patch.
- All 377 indexed evidence files match their recorded SHA-256.
- All 13 prior supplemental identities still match; the seven additional supporting paths remain unchanged and match HEAD.
- All six input-projection difference sets independently recompute to the supplied sets.

No approval hashes were refreshed or historical receipts replaced.

**Acceptance review**

All 24 dispositions were considered. Case 1 remains deliberately excluded under the approved recovery policy, `latestHeard ?? attemptedStart`; this review does not reopen that decision.

| Unit / cases | Acceptance conclusion |
|---|---|
| U1 — 2, 3, 12, 17 | Stopped placement outcomes, genuine manual recovery, deferred preferences and manual/follow arbitration are implemented. Current browser evidence closes the original full-chain failures and race gaps. |
| U2 — 8 | Selecting the already healthy saved Piper profile preserves the ready state without unnecessary reinitialization; English and Spanish controls are covered. |
| U3 — 5, 16, 22 | Startup staging reconciliation has explicit ownership and retry; polling remains read-only. Native-denied confirmation and installed-storage reporting retain truthful states. Active worker and postcommit boundaries remain protected. |
| U4 — 4, 13 | Inert external/no-href anchors retain projected block structure without enabling external navigation. TOC line breaks retain readable spacing. |
| U5 — 9, 10, 18 | Spanish article/NBSP time handling, numeric en-dash exclusions and terminal masculine ordinals have bounded processing and neighboring controls. Multi-digit editorial labels now remain eligible for standalone time expansion. |
| U6 — 20 | Leading/interior whitespace and bounded source-window advancement preserve progress and stable source mapping without unbounded scanning. |
| U7 — 6, 14 | Quality admission occurs before destructive cleanup, and stale aggregate inputs are rejected. Failure paths preserve protected inputs. |
| U8 — 7 | Preflight exit behavior follows the requested purpose while official eligibility retains its stronger conditions. |
| U9 — 11 | Versioned v3 exact rational comparisons, threshold controls and later tie breakers are covered. Frozen v2 authority and its public behavior remain isolated. |
| U10 — 21, 24 | Staged quality publication and resumable derivation cleanup preserve ownership. Current controls cover substituted identities, existing quality, publication conflict and successful retry after restoration. |
| U11 — 15, 19, 23 | Strict ordinary-receipt objects accept equivalent key order while retaining exact fields and ordered steps. Signature/scan observations remain bound to exact artifacts. Closed binary fields reject nonprimitive and invalid values. |

The affected production paths, tests and direct callers were reviewed, including placement and persistence boundaries, cancellation/session ownership, bounded processing, EPUB privacy and package provenance. No unrelated production changes or additional actionable defects were identified. The architecture remains consistent with the documented component boundaries.

**Disposition of preliminary findings**

- **F1 resolved.** The diagnostic trace establishes that the old wheel handler recorded intent after compositor displacement: the recorded baseline already equaled the new scroll position. The native nonpassive wheel listener now records intent before displacement. The current Chromium test uses a real wheel gesture, observes scroll movement, requires Play to become enabled and starts from the recovered visible passage. The old direct coordinator test is no longer relied upon as browser propagation evidence.
- **F2 resolved.** Keyboard provenance now accepts eligible focused descendants while excluding interactive/editable targets and selection/modifier cases. The browser test follows Skip to reader content, verifies article focus, sends PageDown, observes movement and requires recovery.
- **F3 resolved.** `staging_reconciliation_failed` identifies the owned failure. Proven absence clears that failure without clearing unrelated operation failures. The new retry test preserves active/backup sentinels.
- **F4 resolved.** Backward inspection traverses the bounded numeric run rather than inspecting one preceding digit. Multi-digit editorial-label controls distinguish `R18 – 14:30` from genuine numeric ranges.
- **F5 resolved.** New tests hold initial placement while changing both preferences in both orders, then verify application and persistence after reopen. Follow tests introduce real wheel movement before the held correction and verify cancellation; a synthetic-scroll control does not obtain that authority.

The additional U9 and U10 coverage gaps are also closed. The stale G2 and v3 evidence identified in R01 was renewed on the corrected inputs.

**Test evidence reviewed**

These results are attributed to the supplied normal-host PowerShell executions. I did not run tests, formatters or builds. Exact commands, arguments, environment captures, timestamps, exits and input identities remain in the indexed receipts.

| Gate | Accepted evidence |
|---|---|
| G1 | `g1-r02-final`: 585 tests across 14 files passed. |
| G2 | `g2-r02`: 563 tests across 10 files passed on current EPUB sources after package build. |
| G3 | `r02-python`: 40 current v12 and CustomVoice screen/authority tests passed. Unaffected selections reuse matching inputs from `m1-final-02`, whose complete run passed 122 tests. The recorded pytest cache warning did not fail execution. |
| G4 | `g4-final`: 48 Windows release Node tests passed, including controlled ordinary-receipt, signature and scan attachment combinations. |
| G5 | `g5-default-final-05` and `g5-locked-final-05`: each passed 80 tests with three pre-existing ignored cases. |
| G6 | `g6-r02-final`: 20 Chromium tests passed; the focused `g6-r02-races` selection passed five cases. The sole captured browser-runtime delta is generated `debug.log`, not executable/library/source input. |
| G7 | `native-final-chat-g7-a01`: native startup plus Piper ES and EN preflight/runtime arms passed. Measured cancellation was 328 ms and 190 ms; both reports recorded zero external requests and generated audio files. Restoration was verified. |
| G8 | `native-final-chat-g8-a01`: canonical local admission exited 0; the selected Rust test passed in 770.83 seconds and explicitly reported `inference=false`. The outer wrapper’s compile-cache cleanup failure remains recorded separately. Guarded recovery verified the 11-row residue inventory, retained it in private evidence, removed the original scratch location and matched the preflight host state. |
| G9 | Current unsigned build, six lifecycle cases, exact-pair lifecycle attachment and package check passed. Historical evidence and original adjacent resources were restored with recorded identity checks. |
| G10 | Retained WebDriver/portfolio and adaptive-control leaves from `g10-native-harness` remain applicable. The EPUB-consuming native-smoke leaf was renewed by `g10-native-smoke-r03`: 59 tests passed. |
| G11 | Current TypeScript formatting, lint and workspace types passed. Python formatting, Ruff and mypy passed. Rust formatting and both configured Clippy modes passed. |
| G12 | `g12-final-docs`: `pnpm.cmd check:evidence` and `git diff --check` passed on the final documentation capture. |

Reuse was assessed by dependency scope rather than filename similarity or formatting assumptions. The recomputed G3/G4/G10 projections account for all captured differences. Current G1/G2/G6 production inputs, Python inputs and Rust inputs match the reviewed source. The G7/G9 native source captures match all 56 intersecting manifest paths. Later plan/ledger edits do not enter those runtime closures and are covered by the final documentation gate.

The current G9 artifact hashes were independently rechecked from disk:

- Installer: `6c05de4f0930af420d6801033e329c36d1017e808c52b22ecbb58a8e32e0a1dc`
- Application executable: `c2d5856fdefa0d05a8308359d2cb59cdf3f696b1bbd43a5d9328fbaf0adb88d6`

The bound evidence truthfully reports unsigned-local, antivirus not run, ordinary compatible-host journey not run and local release gates not fully passed. Lifecycle success is not promoted into those absent claims.

**Findings: none outstanding.**

**Remaining uncertainty**

No unresolved uncertainty blocks the approved patch scope. The supplied runs do not establish physical audibility, new ordinary Chatterbox acquisition, Chatterbox inference or quality, Authenticode signing, actual Defender scanning, or universal SmartScreen reputation. Those claims remain outside this acceptance and are accurately excluded from the final evidence.

**Required next action**

No code correction or additional behavioral gate is required for this frozen patch. Complete the authorized documentation closeout, recording this report and archiving the plan. This approval must not be represented as covering subsequent changed bytes: record and assess the closeout delta under the repository review rules, and recheck identities before any separately authorized Git action.

**Additional supplemental identities**

All seven paths were clean and unchanged between inspection and recheck. Rows are `path | SHA-256 | filtered Git blob`.

```text
apps/desktop/scripts/native-smoke.node-test.mjs | 3c8764b0520318ae6a4b3e3725ff2f9a8ac44a300a413b1d1acf9a91e0c72fa9 | aaf395c358930054d022382478c4a4e932490aab
apps/desktop/scripts/native-webdriver-client.node-test.mjs | b6f8d3b0174e780e4aa23702c09a567f46a62f1e548f378749096731d6a55964 | 167120f5828bb4a9e240083d5ab011e2311f02d7
apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs | 5614566e0f90129d722d1c354c8e587641b6b46f56c84ba8da3ba40ff0bd28e7 | 02fcc51b01e151a023b5625705e2e5fb15bb9102
apps/desktop/scripts/bilingual-portfolio-host.mjs | 376ac526505d333a32b2ac39305acfc5bdb69243347d93428c2ef30bc45143a2 | 0447287a407402650631e325fa0be8ee41e9998e
apps/desktop/scripts/native-smoke-invariants.mjs | 542a4629152d631ae4d7d2828019f71fbdc5fa94b4558e1f1417d0f9c809a311 | 83e989677f43fcaee682d8345b9f8014b350d7bd
apps/desktop/scripts/native-webdriver-client.mjs | d67db54441f6ae985e9db0c8484e9da1dab973710b51a3c1189f430087a0dce4 | 7f1e0fb7f1735fc98203898064d879738243c71f
apps/desktop/scripts/adaptive-tts-profile-selection.mjs | 748263cc88876ffe307a733955f5ae186a7e1384b6de3cb0856c02e318e68ed8 | 084ced445f46beb814e0c1a4aa80601ac77b5adc
```
