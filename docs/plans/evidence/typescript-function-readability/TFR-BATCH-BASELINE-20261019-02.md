# Validation Report

Report ID: TFR-BATCH-BASELINE-20261019-02
Target ID: TFR-01 / TFR-BATCH
Mode: BASELINE
Verdict: BLOCKED
Environment: local PowerShell outside sandbox; every executed gate/preparation used exec_command require_escalated, repository-root cwd. PowerShell 7.6.5, Node v24.18.0, Corepack pnpm 11.15.1, COREPACK_ENABLE_NETWORK=0. Read-only host inspection confirmed unpackaged process identity 15700. Rust/cargo 1.97.1 and uv 0.11.29 were inspected but not used for builds/tests.
Starting HEAD SHA: 2648617f86fdfd7dddc8dc81fdeabd36942f3c3c
Ending HEAD SHA: 2648617f86fdfd7dddc8dc81fdeabd36942f3c3c
Validated paths: the closed 12-path pre-edit batch manifest below, per TFR-01-AUDIT-DRAFT-20261019-01 and the active ExecPlan. TFR-01 itself owns only the first two paths. This incomplete shared baseline authorizes no implementation; later-unit focused baselines remain mandatory. Director subsequently accepted a static TFR-03 SKIP; its proposed additions remain ABSENT.
Validated path identities: captured before commands; all existing paths had exact porcelain status empty. SHA-256 binds worktree bytes; blob is filter-aware git hash-object --path identity. ABSENT paths were not hashed.

| Path | Exact porcelain | Worktree SHA-256 | Expected index blob / state |
| --- | --- | --- | --- |
| `apps/desktop/src/tts/process-client.ts` | empty | `0C15B34E2035AAAFA6816C070D6BE36042C2D577373AD4986FD6D8F8380CC493` | `8918e5e0ba238b814c1bdd254ed1af2947f3614e` |
| `apps/desktop/src/tts/process-client.test.ts` | empty | `E9C78E4038BECBE99706E8C7B42F919984C7D61474E2C2F43F4A19EA109E02D2` | `b1676bfc32aa80eb372bbe6d6b08805bffbc0fc9` |
| `apps/desktop/src/tts/hardware-profile-compatibility.ts` | empty | `005FE43F0D347524C4B97D1C8FA3D21EB6E742115160F0E77D4316637233E5A9` | `7caf34d725f9bbfe2f0a2fe0a12d198e10f3af6c` |
| `apps/desktop/src/tts/hardware-profile-compatibility.test.ts` | empty | `7360D94C4526A9B5B76EFC0E9BF5C8ADB2E26316453A405F880B1531B8887BA8` | `774f4bb3144be1940393786e458da7f16b56ba60` |
| `apps/desktop/src/reader/ReaderPublication.tsx` | empty | `25B15E04479662CA491AC5DC67CD378E354B775153E298640CE9239F3EB68C86` | `d7f4ea3b06815e93677afb5710b5d497bee07cfd` |
| `apps/desktop/src/reader/ReaderPublication.test.tsx` | empty | `DC0FA3C43803B6694A72F813E64E595B284195ED0B616D88E8D3549B311C0E7D` | `57bd519293dff2bff71fb37f2567aa1fec774d0b` |
| `apps/desktop/src/reader/narration-bindings.ts` | empty | `ABSENT` | `ABSENT` |
| `apps/desktop/src/reader/narration-bindings.test.ts` | empty | `ABSENT` | `ABSENT` |
| `apps/desktop/src/tts/product-narration-coordinator.ts` | empty | `1063D715A7DB4D96A94638CE1F00B3ABB38D2A02461F58F6B942D687ACF45E0B` | `60cab7f948a54a5a91edac6418ffc4fb6a0db66b` |
| `apps/desktop/src/tts/product-narration-coordinator.test.ts` | empty | `CAA6DCB3E96482F288F1972F6661B453657E95E95DE3BEDAB1097829694EB262` | `bf5b0a8c5dfdddceb8414e1f58d92c60cdaae0d8` |
| `packages/epub/src/package/package-document.ts` | empty | `5CFEB59C2E00C1CFCD9EB3E73C7756D6AA3452CE3B2D7AFC97FFF6889CD5C51D` | `025fb68f75128afecd0d74ef673c1b73e6380bfa` |
| `packages/epub/src/package/package-document.test.ts` | empty | `207341F8CCC743665CBE895309DE08641C68B1E56A14922875B29404952DC141` | `1d558d4fffab0167cdc919d0a44f52d7f03d77cb` |

Identity recheck: PASS. identity-final.json confirms identical full HEAD, all 12 path identities, and empty index (exit 0). All tracked input hashes also remained identical to the pre-command capture. Earlier identity-after.json predates the two dependency-preparation attempts and is retained separately; identity-final.json is the closing comparison.

Commands and outcomes:
All commands below ran from the repository root in normal local PowerShell outside the sandbox. Inputs: identity-before.json, tracked-inputs-before.json (complete tracked membership and hashes), environment.json; G-BUILD additionally produced package-artifacts-after-build.json. The stale installed dependency state prevents treating this partial run as complete reusable gate evidence. No acceptance command was substituted.

| Gate / exact command | UTC start -> end | Seconds | Exit / outcome |
| --- | --- | --- | --- |
| G-FAST-format / `pnpm.cmd format:check:typescript` | 10/19/2026 14:23:10 -> 10/19/2026 14:23:18 | 8.484 | 0; format matched files passed |
| G-FAST-lint / `pnpm.cmd lint:typescript` | 10/19/2026 14:23:38 -> 10/19/2026 14:23:58 | 19.554 | 0; ESLint passed |
| G-BUILD / `pnpm.cmd build:packages` | 10/19/2026 14:23:58 -> 10/19/2026 14:23:59 | 1.098 | 0; shared and EPUB TypeScript builds passed; output hashes captured |
| G-DESKTOP-types / `pnpm.cmd --filter @voxleaf/desktop typecheck` | 10/19/2026 14:24:01 -> 10/19/2026 14:24:06 | 5.666 | 0; desktop TypeScript noEmit passed |
| G-DESKTOP-tests / `pnpm.cmd --filter @voxleaf/desktop test` | 10/19/2026 14:24:06 -> 10/19/2026 14:24:07 | 0.497 | 1; MODULE_NOT_FOUND before Vitest test discovery; zero assertions executed |
| G-HOST-config-piper-es / `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es --preflight-only` | 10/19/2026 14:24:36 -> 10/19/2026 14:24:38 | 2.118 | 0; configuration preflight only; developer interpreter checks passed |
| G-HOST-config-piper-en / `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en --preflight-only` | 10/19/2026 14:24:38 -> 10/19/2026 14:24:39 | 1.424 | 0; configuration preflight only; developer interpreter checks passed |
| G-HOST-config-chatterbox / `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4 --preflight-only` | 10/19/2026 14:24:39 -> 10/19/2026 14:24:41 | 1.449 | 0; configuration preflight only; developer interpreter checks passed |
| PREP-locked-install / `pnpm.cmd install --frozen-lockfile --ignore-scripts` | 10/19/2026 14:26:32 -> 10/19/2026 14:26:33 | 0.349 | 0; Already up to date; stale launcher unchanged, repair ineffective |
| G-DIFF-check / `git diff --check` | 10/19/2026 14:27:24 -> 10/19/2026 14:27:24 | 0.034 | 0; whitespace check passed |
| PREP-locked-install-force / `pnpm.cmd install --frozen-lockfile --ignore-scripts --force` | 10/19/2026 14:27:51 -> 10/19/2026 14:27:51 | 0.346 | 0; Already up to date; stale launcher unchanged, repair ineffective |

The failing desktop command references nonexistent
`node_modules/.pnpm/vitest@5.0.3_@types+node@26_bdc92d328f3fb054631aeb104423db8c/node_modules/vitest/vitest.mjs`.
Its workspace launcher is stale. The available root Vitest 5.0.3 store directory and root junction instead use suffix `3eb39084323ebc9c34e633e5c55e17f4`. Before/after preparation identities confirm that neither supported install command changed the root/workspace launcher, .modules.yaml or installed lock metadata; the missing target stayed absent. This is an environment failure before assertions, not an observed product regression or behavioral baseline failure.

Reused gates: none. Historical campaign receipts were context only. Passing format/lint/build/types are actual executions in this partial attempt; this report grants no reuse authorization after dependency repair.
Acceptance boundary: BATCH
Pending batch gates: G-DESKTOP behavior and configured model-free portfolio preflight; shared G-EPUB and G-BROWSER; G-NATIVE; G-HOST lifecycle and all four supported language/model arms; all later unit focused baselines/posts; G-CROSS; G-FINAL portable/native aggregates; G-DOCS after documentary freeze. No native/model/runtime acceptance is claimed.
Preparation/cleanup: bounded package builds completed with hashes under package-artifacts-after-build.json. Director approved root/workspace node_modules and standard pnpm store/v11 outputs for the two install preparations; no tracked inputs changed. No native application, model interpreter, installer or new firewall rule was launched/created. Existing installed package, rules and user resources were left untouched. No host restoration action is required. The existing portfolio runner has no supported alternate native installed-root mode: native app_local_data_dir()/tts remains authority, while the validation-package-root environment name is stripped by supervision.
Retries: no test retry and no command substitution. The initial desktop test failed before discovery. One ordinary locked install and one explicitly approved forced preparation were attempted with the hypothesis that pnpm up-to-date optimization skipped stale bin relinking. Installed help confirmed --force support; both preparations exited 0 without repairing the condition. The bounded dependency repair is exhausted; no unchanged test retry was spent.
Diff scope: PASS. No production/test/config/dependency-version/tracked-generated file changed. The active-plan progress edit and new evidence files were explicitly carried documentary work outside these validated paths. The Git index remained empty. TFR-03 static SKIP does not establish runtime acceptance.
Invariant review: PASS for the unchanged TFR-01 source and proposed boundary only. Independent inspection confirms five guarded strict foreign-service comparisons in start/prepare/health/cancel/shutdown, operation-specific state/kind checks, health first-state identity, invalidation before cancel await, one-active/one-retained-unit ownership, and validated-shutdown-only race recovery. No new implementation exists. Foreign prepare/health capability and ordinary cancel acknowledgement characterization remain the draft coverage gaps; cancellation, native lifecycle, model switching/synchronization and cleanup invariants were not executed in this attempt.
Test-integrity review: PASS for unchanged existing assertions. Current tests cover reordered/foreign startup, binary rejection, one-active/one-retained unit, cancellation/late-byte zeroing, completion-cancel shutdown containment, refusal after rejected/malformed/foreign shutdown, and no fallback for other errors/invalid scope. No test or snapshot was weakened. No assertion execution claim follows from this static review.
Privacy/artifact review: PASS. Only bounded ignored receipts/build/dependency outputs were created or permitted. No books, audio, model weights, secrets, private content, source logs or unrelated tracked files entered the diff. Host diagnostic summary uses environment-relative package identity; raw local captures remain ignored. No frozen authority or completed plan was edited.
Action required: restore the installed workspace Vitest launcher through a separately approved bounded dependency-preparation plan, verify its target exists with unchanged tracked lock/manifests, then issue a new independently reviewed baseline report and run the original required commands. Do not implement from this BLOCKED report. Separately resolve actual installed Chatterbox interpreter outbound isolation before model execution.

The independent host prerequisite remains unresolved even though all three filtered developer-configuration preflights exited 0. Current native supervision prefers the verified installed Chatterbox runtime. The current installed manifest matches frozen authority SHA-256 `470EC7E8A6FA1E91F9831E42DE7988249220B51D4ECD4352452F3C70B2B6084A`; interpreter `app-local-data/tts/cb/3/runtime/python.exe` exists with SHA-256 `4D6F5F81A4BCA11191C4C7C6B43632694D0A4CE74E068619D8FDC161D469859A`. Read-only host query found zero enabled outbound block rules under any name for that exact interpreter; the session is not Administrator. Developer interpreter rules do not prove installed-interpreter isolation. A separately provisioned exact-executable enabled outbound Block rule can satisfy that prerequisite with ownership/restoration evidence. UAC/rule creation was deliberately not attempted while the unrelated mandatory cheap gate remained blocked. Model-free native startup is independently runnable with model variables absent, but was deferred before costly preparation under the approved gate order.

Raw immutable receipt collection: `tmp/evidence/typescript-function-readability/TFR-BATCH-BASELINE-20261019-01/`. Every executed gate has its own JSON timing/result receipt and log. Readiness evidence: host-readiness.json. Dependency evidence: dependency-install-before.json, dependency-install-after.json, dependency-install-after-force.json. Source identity and discovery records: identity-before.json, tracked-inputs-before.json, identity-final.json, tracked-input-drift-final.json. The report is outside its validated paths and must never be rebound or overwritten.

Report correction provenance: TFR-BATCH-BASELINE-20261019-01 remains immutable. This new report removes empty table rows accidentally produced when non-command JSON arrays were enumerated as receipts; no command, outcome, evidence identity, acceptance scope or BLOCKED verdict changes. The original command JSON/log receipts remain authoritative and no additional passing gate is claimed. Current independent source/HEAD/status/blob reinspection before and after this report-only correction confirms the same 12 identities and empty index. No tests were rerun and no acceptance-gate reuse is authorized.
