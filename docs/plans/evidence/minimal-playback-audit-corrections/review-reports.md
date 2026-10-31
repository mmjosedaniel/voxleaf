# Independent change reviews

These immutable reports are outside their own reviewed manifests. The reviewer
used the configured `change_reviewer` role (GPT-6 Astra high), read code and
host receipts, and did not edit files or execute tests.

## Change Review Report

Review ID: **MPA-R1-20261030**

Task ID: **MPA-20261030**

Verdict: **APPROVE**

Base commit and reviewed HEAD: `f2936b76b181ad748c7096ef1184961e242b6487`

Reviewed paths and identities: Closed 38-path manifest at `tmp/evidence/minimal-playback-audit-corrections/MPA-R1-20261030-manifest.json`, SHA-256 `a76a37c6c3e292b927a006c11f63fa78e16583cdd5c229c02271a34235916b6b`. Reviewed the actual tracked diff, full new execution ledger, affected production owners, tests, direct consumers, applicable requirements and architecture.

Identity recheck: **PASS**. Before/after SHA-256 and filter-aware blob identities match all 38 entries. HEAD and branch remain unchanged; index remains empty. All 1,483 entries in the final captured input manifest match current files. No review-time drift found.

Acceptance review:

- **MPA-01:** Terminal disposal releases the unit and permanently makes the processor return `false`, including without an output buffer. Later commands cannot revive it. Ordinary Stop/end remains reusable. Factory disposal precedes disconnect/port close; real registered-processor and paired-port tests cover delivery, idempotence and cancelled preparation.
- **MPA-02:** Native errors invalidate the owning node. Active-unit failure reaches the existing player/coordinator containment and explicit recovery flow; errors before/between units prevent subsequent non-default preparation/start. Retired error and message callbacks cannot fail a replacement owner. No automatic retry or new recovery policy is introduced.
- **MPA-03:** Selected-rate fields update retained paused snapshots during and after navigation cleanup, including successful reset and unsuccessful preference write. The retired player is bypassed during paused navigation. Resume remains explicit, and active/pending rate authority remains with the existing player.
- DSP arithmetic, clocks, queue bounds, local inference, EPUB privacy, stable locators and persistence ownership remain unchanged. Documentation accurately limits the resulting claims.

Test evidence reviewed: Supplied original receipts and logs attribute execution to normal local PowerShell outside the managed sandbox. I did not execute tests, formatters or builds.

| Evidence | Command/result |
|---|---|
| G1-red | Directed three-file Vitest invocation with `-t "MPA-"`: 14 expected assertion failures, two passing reuse controls, no setup failures. |
| G2 renewed | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd --filter @voxleaf/desktop typecheck`: exit 0 each. |
| G3-combined | Exact four-file Vitest command recorded in the ledger: **214/214 passed**, exit 0. |
| G4-browser | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep "MPA-\|NLC real worklet\|CHAT-AUDIT real bundled worklet"`: three passing cases retained; original MPA-02 fixture failure preserved. |
| G4-error-platform | Same browser command with `--grep "MPA-02"`: **1/1 passed**, exit 0, after correcting the injected event route. |
| G5 | `pnpm.cmd package:piper-core:check` and `pnpm.cmd build:desktop`: exit 0. |
| G6-piper-en | Exact selected native command recorded in the ledger: exit 0; six rates, lifecycle, cancellation, synchronization and cleanup exercised. |
| G7 final | `pnpm.cmd check:evidence` and `git diff --check`: exit 0. Relative-link record reports 78 targets, none missing. |

Evidence equivalence: **Accepted for the identified individual results.** G3's consumed source/tests/configuration, installed metadata and generated exports remain unchanged. Vitest excludes the modified browser spec. The original G4 spec matches its execution-time SHA-256; independently comparing original/final text confirms identical shared helpers and other cases outside MPA-02. Its corrected case retains recovery assertions and adds handler/disposal assertions. Documentation additions do not affect these runtime gates. Failed browser attempts remain failures; no aggregate G4 PASS or historical runtime PASS is inferred.

G6 identifies executable SHA-256 `1c6adae31c5743ba880cb5cef3e0b2b3be9726ed025bd3037845422860e8ba06`. Supplied records show five contexts created/closed, zero final retained/discarded units, generated audio files or external requests, no new owned process/scratch leftovers, and identical complete resource inventories before/after temporary staging.

Findings: **None.**

Remaining uncertainty: No blocking uncertainty within approved scope. Error injection does not reproduce a naturally occurring processor crash. No heap/CPU retention measurement, expanded platform support or new listening-quality claim is established.

Required next action: None for this frozen implementation patch. Archival/index/documentation changes require the planned new exact-patch assessment. This approval is not a Validation Report and grants no commit, push, PR or merge permission.

## Change Review Report

Review ID: **MPA-R2-20261030**

Task ID: **MPA-20261030**

Verdict: **APPROVE**

Base commit and reviewed HEAD: `f2936b76b181ad748c7096ef1184961e242b6487`

Reviewed paths and identities: Closed 41-entry manifest at `tmp/evidence/minimal-playback-audit-corrections/MPA-R2-20261030-manifest.json`, SHA-256 `7316fc7ce0499e039d2c8abdd54719b42fb00b83c631d18d9a67f5c1d4b6d6e7`. Includes both deleted active-plan and added completed-plan paths. Inspected the complete archived plan, execution ledger, index/link changes and preserved R1 report. Review reports remain outside their own manifests.

Identity recheck: **PASS**. All 41 entries match before and after inspection, including deletion, SHA-256 and filter-aware blob identities. HEAD and branch remain unchanged; index remains empty. All 1,484 captured archival-gate input entries match current files. Supplied receipt digests match their originals.

Acceptance review:

- The accepted plan is correctly archived under `docs/plans/completed/`; active, completed and documentation indexes agree.
- The testing link points to the completed plan. No remaining Markdown reference to its deleted active path was found.
- The archived plan and ledger preserve failed diagnostics, original evidence identities, scope exclusions, restoration caveats and authorization limits.
- Every runtime, test and supporting configuration identity from R1 remains unchanged. Generated-export manifests are identical. The executable still has SHA-256 `1c6adae31c5743ba880cb5cef3e0b2b3be9726ed025bd3037845422860e8ba06`.
- This is a new assessment of the archived patch; R1’s immutable approval has not been rebound or refreshed.

Test evidence reviewed: Supplied host receipts attribute execution to normal local PowerShell outside the managed sandbox:

- **G7-archive-evidence:** `pnpm.cmd check:evidence` — exit 0.
- **G7-archive-diff:** `git diff --check` — exit 0.
- **G7-archive-links:** 360 relative destinations checked; none missing.

Individual evidence retention: **Accepted.** Retain R1’s assessed G2 renewed static checks, G3’s 214 passing tests, G4’s three unchanged passing cases plus corrected MPA-02 pass, G5 integrity/build results and G6 native result. The R1-to-R2 changes comprise Markdown archival, indexes, links and evidence reporting; these do not change the consumed runtime/test inputs or tested executable. No runtime gate was rerun or newly claimed. The failed original G4 invocation remains recorded as failed.

Findings: **None.**

Remaining uncertainty: No blocking uncertainty within the approved scope. R1’s limits remain: injected processor-error handling, no natural-crash reproduction, no heap/CPU retention measurement or expanded support/listening claim. Restored old adjacent resources are not represented as permanently updated.

Required next action: None for the reviewed patch. Preserve this report outside its own manifest and recheck identities before completion or any separately authorized Git action. Approval is not a Validation Report and grants no commit, push, PR or merge permission.
