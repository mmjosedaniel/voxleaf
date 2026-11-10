# Change Review Report

**Review ID:** DCR-G12-R1-ASTRA-20261110-01  
**Task ID:** Deep chat audit / final integrated G12 / revision 1  
**Verdict:** **CHANGES_REQUESTED**

**Base commit and reviewed HEAD:** `d375ecc84261c404e855c055e0ecc8949a97caaf`  
**Branch:** `codex/deep-chat-audit-execplan`  
**Index:** Empty.

The integrated implementation and supplied execution evidence are satisfactory. One bounded documentation acceptance gap remains: ADR-0063 does not preserve and date the CUDA policy amendment as expressly required by the approved plan.

## Reviewed paths and identities

The complete 120-row manifest at `tmp/evidence/deep-chat-audit/M2/G12-candidate/closed-worktree-manifest.json` is incorporated by reference, including every status, SHA-256 and filter-aware Git blob. It contains 68 tracked modifications and 52 untracked files. Preserve these exact artifacts:

| Artifact, relative to `G12-candidate/` | SHA-256 |
|---|---|
| `closed-worktree-manifest.json` | `69f6d0f7c8fd6a90e9df38f0e47012e9bb52c81baed5eb2985acef94872b5d94` |
| `tracked.patch` | `5a812fa2e6256a8df73e72cb93ab5c53581ee545414fe973a612cad09b6d1750` |
| `untracked.patch` | `2564011c38b8fb083d6b25aee7053f7e2b53a50fa49bc165d1a73b777fe9312e` |
| `final-command-ledger.json` | `fc98b4c9afc96384cf22fe055fb4c83c9d3e251920f2a17f9becc5087829cb00` |

All 52 files beneath `untracked-exact/` match their corresponding manifest identities.

Supporting identities additionally incorporate the **83 unique path/SHA-256/blob rows outside the 120-path candidate** contained in the frozen `*execution*.md` tables in `docs/plans/evidence/deep-chat-audit/`. The candidate manifest itself binds those receipt documents. These supporting rows have no conflicting identities; their current contents and filter-aware blobs match, and their statuses are clean. For U5, use the explicit immutable status correction in `review-U5-R1.md`, rather than its receipt’s literal `$s` cells. The unchanged `package.json` and `.gitignore` identities are additionally incorporated from `review-U11-R1.md`, also bound by the candidate manifest.

Additional unchanged supporting identities inspected are:

| Path | SHA-256 | Filter-aware blob |
|---|---|---|
| `AGENTS.md` | `b2c6b7baca13b2345265410fe3947b4c20f2fc3064ba00e83e10c64895b0b424` | `c06bfb24454caf9e9a7af6820425f627d9ff3b4e` |
| `docs/development/agentic-change-review.md` | `de4c430a5de120d9c900d6bad0bebbfeec81673614b30f242f3154efbedcfc39` | `373443e17547185e2294d906bdc9cb489daca67c` |
| `.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md` | `a5f2d805063ba8536cc046b361ea5bda732f55d9166afe137b08bc01175f49ae` | `16ba1a7002366ad9312223d51dace7902d6ae751` |
| `docs/README.md` | `839cc5044d0aedbdede7e4e2ba7f601e690213c188b7b2449f5cf7fbc8617547` | `82a2aa2ec74eec5c8343db26ab7e4fca374ffc6d` |
| `docs/architecture/overview.md` | `df4b93a41d52bf187db3d864bae7cf20a494eed77c8fae3604a8d6165519a729` | `2fc06d03291c510d46071e4f9f535103c73fcfd2` |
| `docs/plans/completed/M005-narration-text-preparation.md` | `a20136c18ee476bfad5a7a8d6e12c40beae7db3180bbbe38f62e4019e69ed7d6` | `219ae4fe16b4c740b1fbbbafb867f4071c0be7f8` |
| `tsconfig.base.json` | `c902ceb7b40622ecef37bd4796b9de6736d51536a00b8ad61f16579cd08b91cd` | `ec9cf987827df2fd8ff29c161dd3373814d66463` |
| `tsconfig.json` | `2a6fc68fc5f2eb8eeef1276ff57de5fe8865899884f31c2b15768f0fd87ab393` | `5ee59156d27d436003697d4c18257a3eb705a402` |
| `apps/desktop/tsconfig.json` | `702eb9006e274d8de00e854dfe7ea189a7da2a08bfcfec453770e01a5c460f9b` | `816ff71d00c4d666e2d444e4a570938f6e86a77d` |
| `apps/desktop/src-tauri/build.rs` | `6aeeab41bc35efde4e3c2b644a6248f7fc06d24ae30b75c0d33491cbb0c1fa31` | `261851f6b60e0ae6f244b5469289870facc8c997` |
| `apps/desktop/src-tauri/tauri.conf.json` | `b76a7342c6ce9918bb499ddd50f4910667d50cf5dda564e3103ab8d56a99191a` | `086ffec207c95af2fef00c7726a3728d94279bbf` |
| `apps/desktop/src-tauri/tauri.release.conf.json` | `6e9694a63e5a1d9c06379803fd5da573bb474b6beee24e48990937edb0da451d` | `59361d1e47c6204fb922b68ffdcf36de8fb0d878` |
| `apps/desktop/src-tauri/release/windows-package-evidence-v3.json` | `7fd9db70e4964bd3ecbded94e2861f48c02bc49ec1949cf49d787077f91ac30c` | `33ce2c41b5209fbe3cf9ebac7ddba52dc0cde010` |

These additional paths are clean. The earlier local reports remain immutable historical reviews of their own snapshots. This report independently assesses the combined current files, including later edits to shared owners; it does not renew old approvals by replacing their hashes.

## Identity recheck

**PASS.** Initial and final inspections found the same HEAD, branch and empty index. Final comparison at **2026-11-10T03:57:17Z** found:

- All 120 statuses, SHA-256 values and filter-aware blobs matched.
- No additional changed or untracked path existed outside the closed candidate.
- All 52 untracked exact copies matched.
- All four candidate artifact hashes matched.
- All 44 command-receipt hashes matched the frozen command ledger.
- Supporting identities and frozen historical authorities remained unchanged.

The reviewer performed read-only source, diff, caller, identity and evidence inspection. No tests, builds, formatters, edits, delegation or Git mutations were performed.

## Acceptance review

| Case | Integrated conclusion |
|---|---|
| DCR-01 | Satisfactory. Recoverable owned startup exposes cancellation without introducing another automatic recovery attempt. |
| DCR-02 | Withdrawal preserved. Actual visual fallback does not overwrite the precise persisted checkpoint; existing controls remain. |
| DCR-03 | Satisfactory. StrictMode ref cancellation rearms only pending initial placement; stale navigation/unmount cannot revive it. |
| DCR-04 | Runtime and tests satisfactory. Only visible CUDA ordinal 0 is queried after bounded initialization/count checks; invalid default facts remain fail-closed. Documentation acceptance is withheld under G12-F1. |
| DCR-05 | Satisfactory. Lifecycle success requires a complete exact-installer receipt; the old literal PASS alias cannot grant acceptance. Separate journey/signature requirements remain. |
| DCR-06 | Satisfactory. Positive current-unit paused output confirms start once without advancing the paused clock or accepting stale activation evidence. |
| DCR-07 | Satisfactory. Only retained normalized attribute-derived TOC bytes consume the shared budget, including correctly attributed collapsed whitespace. XML text, hidden/eclipsed attributes, NCX and independent label limits retain their rules. |
| DCR-08 | Satisfactory. Batch receive/cancel owns a concrete attempt; blocking receive is outside the ownership lock, and stale finalization cannot consume or terminate a successor. |
| DCR-09 | Satisfactory. Signed/decimal Celsius ranges remain unchanged through bounded same-prose recognition; source mappings, standalone forms and frozen normalizers are preserved. |
| DCR-10 | Satisfactory. Typed sink-allocation failures enter playback containment without settling a nonexistent synthesis action or escaping through a derived rejection. |
| DCR-11 | Satisfactory across all three callers. Effective unrestricted outbound blocking is checked through the actual PowerShell policy boundary; the Python handoff reuses the existing predicate. |
| DCR-12 | Satisfactory. Shutdown success requires stopped, clean child close and clean framed EOF; malformed, partial and extra tails reject, while queued protocol rejection remains readable. |
| DCR-13 | Satisfactory. Controller finalization covers acquisition and initial measurements, preserves the primary error and leaves unrelated identity ownership intact. |
| DCR-14 | Satisfactory. Both asynchronous reservation errors reach existing cleanup; listeners precede listen, both reservations settle, and uncertain uninstall retains recovery material. |
| DCR-15 | Satisfactory. Earlier WebP animation evidence remains monotonic and is rejected before URL creation/decoding; static and malformed controls remain. |
| DCR-16 | Satisfactory as mutable-only defensive hardening. Invalid tensor dimensions/size reject before transfer/flattening. Installed v7 resolves frozen historical sources and is unchanged. |
| DCR-17 | Satisfactory. Typed close failures invalidate cleanup and dependent conclusions, stop subsequent trials and remain isolated under new v13 authority. Complete schema validation protects CPU admission. |
| DCR-18 | Satisfactory. Monitor ownership covers partial acquisition and failure; bounded shutdown retains an unjoined owner, preserves recognized primary diagnostics and keeps candidate-before-monitor ordering. |
| DCR-19 | Satisfactory. Every managed path’s ancestor chain is verified before the first deletion; intermediate junction rejection preserves earlier and unrelated data. |
| DCR-20 | Satisfactory. Replacement depends on explicit verified close, joins in-flight containment and preserves a failed ownership barrier; empty counts alone cannot authorize replacement. |
| DCR-21 | Satisfactory. One absolute deadline, bounded records/queue/count and bounded cleanup prevent silent/trickling/flooding children or retained readers from becoming successful unbounded runs. |
| DCR-22 | Satisfactory. Four versioned native cleanup exchanges require fresh zero observations and exact acknowledgements before successor activity. Recorded execution authority rejects relabeled historical v1 results. |
| DCR-23 | Satisfactory. Language changes await a fresh compatibility check before refreshing profile/start state; explicit choices, failed detection and stale probe reconciliation remain covered. |
| DCR-24 | Satisfactory. Integer frame accounting preserves exact target and neighboring-frame decisions for the supported rates and bounds. |
| DCR-25 | Satisfactory. Historical local-deletion exemption checks staged blob and mode against HEAD; staged changes cannot be hidden by deleting the worktree copy. |

Cross-unit inspection found no remaining actionable runtime defect. Shared App/coordinator/player/scheduler ownership, restoration/progress persistence, language/profile reconciliation, EPUB budget/source mapping, optional removal/supervision, benchmark cancellation/cleanup and maintainer evidence boundaries compose consistently. Tests retain the relevant earlier controls.

EPUB text remains local, generated audio is not persisted by default, and new diagnostics are content-free. Queue, memory, cancellation and stable-locator boundaries remain bounded. The system diagram and M005 boundary do not acquire unsupported implementation claims.

The supplemental G8 correction remains satisfactory: root stop is attempted independently after tree-termination errors, verified owners are attempted before shared bounded waits, identity uncertainty still fails, primary diagnostics and recovery material survive, and unrelated-process controls remain. It does not establish the initiating cause of the earlier failed Piper cleanup.

## Test evidence reviewed

All executions below are attributed to the worker’s **normal local PowerShell** receipts. Exact ordered commands, timestamps, exits and input identities are preserved in the frozen 44-receipt ledger.

Recorded environment includes Windows NT 10.0.26200.0, PowerShell 7.6.9, Node 24.20.0, offline Corepack/pnpm 11.15.1, uv 0.11.29, Python 3.12.10 and cargo/rustc 1.97.1.

| Gate | Evidence assessment |
|---|---|
| G0/G1 | Current `pnpm.cmd build:packages` passed; source/compiler/export identities match. Unit RED/GREEN evidence and correction revisions remain retained. DCR-02 is withdrawn and DCR-16 preventive; neither is relabeled as a reproduced installed-product defect. |
| G2 | Selected six EPUB suites: exit 0, **406 passed**. |
| G3 | Selected fourteen desktop suites: exit 0, **648 passed**. |
| G4 | Python owner suites: exit 0, **171 passed**. Node owners: exit 0, **148 passed**. Supplemental cleanup: **53 harness tests** and **125 caller tests**, all passed. |
| G5 | Current Rust R2: default **187 passed/9 ignored**, release-locked **186 passed/9 ignored**. Earlier input result retained. |
| G6 | Configured Chromium selection: exit 0, **9 journeys passed**. This includes current rendering/cancellation, restoration, language, replacement and WebP controls. |
| G7 | Applicable formatting, lint and type checks passed. Initial Clippy failure remains failed; the test-module relocation has current Rust checks. Supplemental harness formatting/lint passed. |
| G8 | Current core check/build prerequisite and renewed startup/Piper R3 passed. Piper exercised all six rates, observed **470 ms cancellation**, and completed aggregate exit 0 with verified restoration. |
| G9 | Exact local native admission: configured command exit 0, **one test passed in 684.57 seconds**. Nine artifacts matched before/after; admission, rediscovery, integrity, owned removal and unrelated sentinel preservation passed without inference. |
| G10 | Verified-core build retry passed. Exact-installer canonical lifecycle: exit 0, **six ordered option cases** plus install/start/repair/default-uninstall/cleanup checks passed. Separate exact profile recovery is verified. |
| G11 | Current evidence guard and whitespace commands exited 0; **338 links, zero missing**. The **34 evidence tests** remain on unchanged consumed inputs. |

**Reuse assessment.** Current comparisons found matching before/after snapshots and no current consumed-input drift. Earlier broad inventories differ only where separately reviewed harness files changed outside the build/typecheck graphs, or subsequent Markdown status records changed outside TypeScript formatter/linter inputs. Refreshed harness/caller checks and R3 native execution cover the actual affected paths. Build prerequisites, exported workspace files, native feature variants, runtime payloads and retained authorities remain distinct.

The retained default executable’s bytes match the prepared build. Its isolated directory contains only that executable; the closeout wrapper checks path containment/reparse safety and absence of adjacent resources before use. Matching signed EdgeDriver/WebView2 identities and the effective firewall predicate were rechecked. R3 execution consequently supplies new evidence for the relocated artifact and corrected runner, rather than assuming relocation is behaviorally irrelevant.

**G9 restoration.** The outer wrapper’s exit 1 remains a failure caused by its residual Node compile cache. The native test passed and removed its own root. Separate recovery retained the sole owned cache privately and established owned-temp absence, identical host inventory and unchanged nine-artifact identities. This satisfies the configured admission and restoration requirements without claiming wrapper PASS.

**G10 restoration.** The outer wrapper’s exit 1 remains a failure. It refused to overwrite a generated registration leaf; shortcut creation time also differed. Separate bounded recovery verified ownership, exported/held the generated leaf, restored the original leaf, removed only the unchanged childless generated leaf and restored the shortcut’s original creation time. The complete recovered profile snapshot equals the original: key values/types/security, parent inventories, unrelated sibling, shortcut bytes/metadata/streams and host inventory. Historical v3 remains byte-identical and clean.

The lifecycle receipt SHA-256 is `b07c0625133c112e16c97ec59bbc7b5f1048546212499f771ba45c20b7dd4013`, binding installer SHA-256 `abc4d8248b971b5733e5c61745d63a1a3d783f331532dd50564c150318b22918`. User-authorized possible shell unpinning is accounted for; Start/taskbar pin or jump-list restoration is not claimed. These successful canonical commands and separately verified recovery satisfy G10’s required boundary without accepting the failed wrapper.

## Findings

**G12-F1 — P3: CUDA amendment overwrites the historical decision instead of recording the required dated amendment.**

- **Location:** `docs/architecture/decisions/ADR-0063-default-cuda-and-celsius-boundaries.md`, “Context and decision” CUDA paragraph; approved plan section 6, lines 233–234.
- **Trigger:** Read the final ADR under its unchanged “Accepted for implementation on 2026-10-26” status and completed narration-logic-plan reference.
- **Consequence:** The new ordinal-0-only probing policy appears to belong to the older decision/validation record. The prior enumeration rule is replaced, and no dated CUDA amendment distinguishes this campaign’s correction. This misses the explicit requirement to retain the earlier decision/history and add a dated amendment.
- **Evidence:** The actual diff replaces “enumerates `cuDeviceGet` ordinals in order without filtering” with the ordinal-0-only policy in the original paragraph. The newly appended dated section concerns only signed/decimal Celsius endpoints.
- **Bounded correction criterion:** Preserve or explicitly identify the prior CUDA enumeration decision as historical, then add a dated amendment describing ordinal-0-only probing and its current validation provenance. Keep the earlier NLC record distinct. No runtime, test or completed-plan change is requested.

This is a confirmed documentation acceptance gap, not a runtime defect or stylistic preference.

## Remaining uncertainty

Qwen v13 and service-handoff v2 remain **unmeasured on real hardware**. Synthetic/native protocol and authority tests do not establish new model performance. Installed Chatterbox v7 was not changed by DCR-16, and G9 did not perform inference. Synthetic CUDA seam tests do not prove physical multi-GPU compatibility.

The installer remains unsigned-local; signing, antivirus, release publication and interactive shell-history restoration are not established. The initiating cause of the earlier Piper cleanup failure remains unproven.

## Required next action

Correct G12-F1 within the ADR and necessary execution-status documentation. Preserve this report and all failed receipts unchanged. Refresh affected documentary checks, freeze a new exact manifest and request a new immutable review. Unchanged execution gates may be reused after their complete input identities are rechecked; this finding requires no runtime rerun by itself.

Keep the plan active until acceptance and subsequent documentary closeout. This report is not a Validation Report and authorizes no staging, commit, push, PR or publication.

The original report is retained privately. This public copy omits the local-memory citation footer.
