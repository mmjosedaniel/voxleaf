# Validation Report

Report ID: TFR-BATCH-BASELINE-20261019-03.
Target ID: TFR-BATCH; shared pre-edit baseline for TFR-01, TFR-02 and TFR-05; independent unchanged SKIP review for TFR-03 and TFR-04.
Mode: BASELINE.
Verdict: PASS.
Environment: normal local PowerShell outside managed sandbox; every command used require_escalated. Browser retry and native/model executions used WMI-created ordinary PowerShell with final-path containment evidence. No source edits or Git mutations.
Starting HEAD SHA: 2648617f86fdfd7dddc8dc81fdeabd36942f3c3c.
Ending HEAD SHA: 2648617f86fdfd7dddc8dc81fdeabd36942f3c3c.
Acceptance boundary: BATCH (pre-edit baseline only). This authorizes a bounded implementation order, not acceptance of any future patch or campaign completion.

## Validated paths and identities

The closed twelve-path manifest below was captured before commands and independently rechecked after all runtime gates. `clean` means exact empty porcelain output; ABSENT paths were not hashed. Index remained empty. TFR-01 may consume the first two rows under this Report ID; any source/HEAD drift requires new independent review.

| Path | Porcelain | Worktree SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/src/tts/process-client.ts` | clean | `0C15B34E2035AAAFA6816C070D6BE36042C2D577373AD4986FD6D8F8380CC493` | `8918e5e0ba238b814c1bdd254ed1af2947f3614e` |
| `apps/desktop/src/tts/process-client.test.ts` | clean | `E9C78E4038BECBE99706E8C7B42F919984C7D61474E2C2F43F4A19EA109E02D2` | `b1676bfc32aa80eb372bbe6d6b08805bffbc0fc9` |
| `apps/desktop/src/tts/hardware-profile-compatibility.ts` | clean | `005FE43F0D347524C4B97D1C8FA3D21EB6E742115160F0E77D4316637233E5A9` | `7caf34d725f9bbfe2f0a2fe0a12d198e10f3af6c` |
| `apps/desktop/src/tts/hardware-profile-compatibility.test.ts` | clean | `7360D94C4526A9B5B76EFC0E9BF5C8ADB2E26316453A405F880B1531B8887BA8` | `774f4bb3144be1940393786e458da7f16b56ba60` |
| `apps/desktop/src/reader/ReaderPublication.tsx` | clean | `25B15E04479662CA491AC5DC67CD378E354B775153E298640CE9239F3EB68C86` | `d7f4ea3b06815e93677afb5710b5d497bee07cfd` |
| `apps/desktop/src/reader/ReaderPublication.test.tsx` | clean | `DC0FA3C43803B6694A72F813E64E595B284195ED0B616D88E8D3549B311C0E7D` | `57bd519293dff2bff71fb37f2567aa1fec774d0b` |
| `apps/desktop/src/reader/narration-bindings.ts` | clean | `ABSENT` | `ABSENT` |
| `apps/desktop/src/reader/narration-bindings.test.ts` | clean | `ABSENT` | `ABSENT` |
| `apps/desktop/src/tts/product-narration-coordinator.ts` | clean | `1063D715A7DB4D96A94638CE1F00B3ABB38D2A02461F58F6B942D687ACF45E0B` | `60cab7f948a54a5a91edac6418ffc4fb6a0db66b` |
| `apps/desktop/src/tts/product-narration-coordinator.test.ts` | clean | `CAA6DCB3E96482F288F1972F6661B453657E95E95DE3BEDAB1097829694EB262` | `bf5b0a8c5dfdddceb8414e1f58d92c60cdaae0d8` |
| `packages/epub/src/package/package-document.ts` | clean | `5CFEB59C2E00C1CFCD9EB3E73C7756D6AA3452CE3B2D7AFC97FFF6889CD5C51D` | `025fb68f75128afecd0d74ef673c1b73e6380bfa` |
| `packages/epub/src/package/package-document.test.ts` | clean | `207341F8CCC743665CBE895309DE08641C68B1E56A14922875B29404952DC141` | `1d558d4fffab0167cdc919d0a44f52d7f03d77cb` |

Identity recheck: PASS. `identity-before.json`, `identity-checkpoint-before-native.json`, `identity-after.json` bind the same HEAD and all twelve identities. Full tracked membership stayed 1,276 files. Only the carried active ExecPlan Markdown changed during this baseline; other carried documentation/new evidence is outside production allowlists. No non-document untracked paths entered the diff.

## Commands and outcomes

All commands ran from repository root on 2026-10-19. Times below are UTC; each gate has an exact `.json` receipt and `.log` under `tmp/evidence/typescript-function-readability/TFR-BATCH-BASELINE-20261019-03/`. `gate-receipt-index.json` binds their hashes. Node 24.18.0, pnpm 11.15.1 through the pinned per-command PATH, PowerShell 7.6.5 and Rust 1.97.1 were recorded. EdgeDriver 155.0.4283.45 had a valid signature; WebView2 was 155.0.4283.62. Model runs used RTX 5060 Laptop / NVIDIA driver 32.0.15.7705, exact configured offline paths, verified packaged Piper and installed Chatterbox, and matching outbound blocks.

| Receipt / gate | Exact command | Start–end UTC | Seconds | Exit |
| --- | --- | --- | ---: | ---: |
| `G-FAST-format` | `pnpm.cmd format:check:typescript` | 14:56:44.546–14:56:51.234 | 6.688 | 0 |
| `G-FAST-lint` | `pnpm.cmd lint:typescript` | 14:56:51.249–14:57:12.823 | 21.574 | 0 |
| `G-BUILD` | `pnpm.cmd build:packages` | 14:57:12.826–14:57:13.867 | 1.042 | 0 |
| `G-DESKTOP-types` | `pnpm.cmd --filter @voxleaf/desktop typecheck` | 14:57:14.945–14:57:18.217 | 3.272 | 0 |
| `G-DESKTOP-tests` | `pnpm.cmd --filter @voxleaf/desktop test` | 14:57:18.224–14:57:42.539 | 24.315 | 0 |
| `G-EPUB-types` | `pnpm.cmd --filter @voxleaf/epub typecheck` | 14:57:42.547–14:57:44.662 | 2.115 | 0 |
| `G-EPUB-tests` | `pnpm.cmd --filter @voxleaf/epub test` | 14:57:44.669–14:57:47.601 | 2.933 | 0 |
| `G-HOST-model-free-preflight` | `pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight` | 14:57:47.609–14:57:51.420 | 3.811 | 0 |
| `G-BROWSER` | `pnpm.cmd test:browser` | 14:59:40.961–14:59:56.433 | 15.472 | 1 |
| `G-HOST-config-piper-es` | `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es --preflight-only` | 15:00:22.194–15:00:23.767 | 1.573 | 0 |
| `G-HOST-config-piper-en` | `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en --preflight-only` | 15:00:23.777–15:00:25.189 | 1.412 | 0 |
| `G-HOST-config-chatterbox` | `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4 --preflight-only` | 15:00:25.192–15:00:26.581 | 1.39 | 0 |
| `G-BROWSER-retry-01` | `pnpm.cmd test:browser` | 15:01:42.353–15:01:54.936 | 12.583 | 0 |
| `G-NATIVE` | `pnpm.cmd test:native-startup` | 15:06:11.349–15:07:11.681 | 60.332 | 0 |
| `G-HOST-lifecycle` | `node apps/desktop/scripts/bilingual-portfolio-host.mjs --lifecycle-only` | 15:09:16.963–15:09:29.707 | 12.743 | 0 |
| `G-HOST-piper-es` | `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es` | 15:09:29.808–15:12:31.834 | 182.026 | 1 |
| `G-NATIVE-after-prep04` | `pnpm.cmd test:native-startup` | 15:27:52.075–15:28:29.773 | 37.697 | 0 |
| `G-HOST-lifecycle-after-prep04` | `node apps/desktop/scripts/bilingual-portfolio-host.mjs --lifecycle-only` | 15:29:23.109–15:29:37.578 | 14.469 | 0 |
| `G-HOST-piper-es-retry-01` | `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es` | 15:29:37.678–15:32:34.074 | 176.396 | 0 |
| `G-HOST-piper-en` | `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en` | 15:32:34.173–15:35:28.580 | 174.407 | 0 |
| `G-HOST-chatterbox` | `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4` | 15:35:28.688–15:45:55.883 | 627.195 | 0 |

Current outcomes: format/lint, package build, desktop types/tests (59 Vitest files/727 tests plus 76 Node tests), EPUB types/651 tests, configured model-free and three filtered preflights, browser 7/7, current native startup, current lifecycle, Piper ES/EN and Chatterbox ES/EN all passed. Native proves bounded protocol/fake-service cancellation and recovery, local ingress limits, keyboard reader/synchronization, preferences/replacement and no external requests. Both Piper arms exercise all six playback rates; all four real-model arms cover quick/prepared narration, cancellation, synchronization, reader behavior and resource cleanup under their existing assertions. Each reported zero external requests. The original native/lifecycle passes were superseded after runtime artifact preparation, not treated as current runtime evidence. No Qwen arm was run or claimed.

Preparation phase receipts: PREP-03 locked dependency restoration and exact orphan-shim archive/removal preceded this baseline; earlier missing-Vitest failure/ineffective installations remain in baseline report02. PREP-04 `pnpm.cmd package:piper-core` failed after 27.971 s with `piper-core-runtime-manifest-stale`; no frozen authority was changed. Current retained canonical ZIP was independently compared with current authority: all 2,024 entries/306,740,365 bytes exact, archive SHA-256 `C6204D11D99CE395AFECE203BDC3F6FB804F394359A332F847B6AD3A48A65EBA`. Director preserved stale trees, restored verified artifacts, ran `pnpm.cmd package:piper-core:check` (exit 0, 16.972 s) and `pnpm.cmd --filter @voxleaf/desktop tauri build --config src-tauri/tauri.release.conf.json --no-bundle` (exit 0, 31.917 s). Independent adjacent-tree proof verifies every member, no reparse points, and current manifest SHA-256 `0DA4A9C3FE15ABAE39C260DE79F3B75C08AFBCA5B1AB9CAC9B868BDF77B87B77`. The subsequent default native command restored the normal test build mode. Its reported Rust compilation phase was 22.09 s within 37.697 s overall; original native compilation was 42.44 s within 60.332 s overall. No unmeasured speedup is claimed.

## Retained gates and input proof

Reused gates: no historical or other-campaign runtime/test receipt. Earlier passing deterministic/browser/readiness executions within this continuous baseline are retained under `input-comparison-after.json`: complete tracked source/config/lock/runner membership and hashes unchanged except nonconsumed Markdown; installed JS package manifests, captured tool/shim/lock hashes, shared/EPUB outputs and browser-tested output bytes unchanged. The only new untracked files are declared evidence Markdown. PREP-04 affected ignored Python runtime/dist/adjacent native resources, excluded by formatter/linter configuration and not consumed by the selected JS type/test/browser paths. It did not mutate node_modules. Filtered configuration preflights inspect the same environment values, path existence and firewall matches; they are readiness only. Native/lifecycle/model gates consuming changed native/runtime artifacts ran fresh. No blanket permission for future reuse is granted: later units require current focused baselines and the policy's dependency/environment comparison, or fresh execution when uncertain.

The retained canonical package is artifact reuse, not measurement reuse. `retained-piper-archive-independent.json`, `prep04-independent-adjacent-proof.json`, `native-artifacts-before-host-after-prep04.json`, before/after tracked manifests and PREP-04 journals/checker receipts bind this preparation. Native final-path receipts prove actual installed manifest/interpreter/model paths remained inside the ordinary package root, without inherited MSIX LocalCache redirection. Installed Chatterbox Python SHA-256 is `4D6F5F81A4BCA11191C4C7C6B43632694D0A4CE74E068619D8FDC161D469859A`; its manifest SHA-256 is `470EC7E8A6FA1E91F9831E42DE7988249220B51D4ECD4352452F3C70B2B6084A`.

## Preparation, cleanup and retries

Preparation/cleanup: per-run PASS. Current native and every host arm report no new disposable profiles or remaining native/driver/Python processes. Final browser port 4173 is clear and wrapper PID 16608 exited. The pre-existing `voxleaf-native-startup-v5gaPr` profile was preserved. Process observations record PID, creation time and executable; no unrelated process was terminated. Bounded outputs are declared package/frontend/native build outputs, test results/caches, unique ignored receipts and runner-owned disposable profiles; PREP-04 additionally declares runtime/dist restoration and archived stale payloads.

One separately journaled resource remains intentionally retained for this bounded campaign: `VoxLeaf-TFR-20261019-installed-chatterbox`, exact installed interpreter, enabled outbound Block/Profile Any. ActiveStore properties and all eight pre-existing rules were independently verified after the run. This is not a claim of completed host restoration. Director must remove only that owned rule and obtain independent absence/preservation verification before final campaign acceptance or blocking interruption. No current model process remains attached to it.

Retries:

- Browser first attempt: 6 passed/1 failed at navigation before app/fixture assertions, `net::ERR_NO_BUFFER_SPACE`. Trace preserved. One unchanged retry after switching to verified ordinary WMI context passed 7/7. The causal link to inherited context remains an inference; browser retry budget consumed.
- First host receipt wrapper failed PowerShell parsing before any gate ran. Immutable script01/launch/diagnostic retained; one syntax-only corrected wrapper parsed successfully. No test attempt was consumed. A later read-only ZIP inspection corrected a prefix-length slicing error before payload verification; disclosed in its receipt.
- Piper ES first attempt: availability timeout before inference, exit 1. Existing adjacent packaged Piper had stale manifest/onnxruntime 1.30 payload, which shadows developer configuration and fails closed against current 1.31 authority. Original log and empty cleanup retained. After complete verified artifact preparation and fresh native/lifecycle, the single unchanged infrastructure retry passed; retry budget consumed. EN/Chatterbox passed their first attempts.
- Initial UAC creation opportunity was cancelled before the script ran. User explicitly authorized a new opportunity; exact rule creation then succeeded. This was not an automatic approval rejection. No denied action was bypassed.

## Independent review and handoff

Diff scope: PASS. No production/test/config/generated tracked files changed; index empty, HEAD unchanged. Carried plan/evidence updates are separately owned and require later documentary validation. No existing report was overwritten.

Invariant review: PASS for the current baseline, without accepting proposed edits. Existing assertions cover response identity, cancellation/containment, runtime/profile admission, narration ordering and bounded resources, and secure EPUB package behavior. TFR-01's proposed foreign-service characterization gaps and TFR-05's multi-invalid precedence cases remain work-order obligations before candidate acceptance. This baseline does not prove a future extraction's equivalence.

TFR-03 SKIP independently accepted: existing short effects retain local lifecycle ownership; its two proposed additions remain ABSENT. TFR-04 revised SKIP independently accepted under `TFR-04-AUDIT-20261019-02` (audit SHA-256 `187647941B3CBBDB2B9F5CE3FDEE74DF3848E5AA4782D4D5873ED5719E4EF46F`). Current startup/preparation marks and outer publication occur in the same Promise continuation; full async extraction would insert an observable reaction before publication/shared catch. Synchronous fragments add indirection without resolving the original concern. This is source-derived reasoning, not an executed regression or existing defect. Both source/test hashes remain those in the manifest; no tests were added for either skipped unit.

Test-integrity review: PASS. Existing tests/assertions unchanged; no snapshot update, relaxation, substituted command, authority rewrite or alternate runtime-selection override. Preparation failures were separated from code regressions; mandatory native/four-arm host execution was not waived.

Privacy/artifact review: PASS. Versioned diff contains only authorized documentation. Raw logs, synthetic fixtures/traces and package/runtime archives remain ignored. No copyrighted EPUB, audio, model weight, secret or private data entered the versioned diff. Runtime receipts report zero external requests, and disposable per-run fixture/profile cleanup passed.

Pending batch gates: candidate post-change gates for each implemented unit; current focused baselines for subsequent units; combined G-BROWSER/G-CROSS/G-FINAL/G-DOCS under the approved ledger, including applicable check:portable/check leaves and final firewall restoration. Individual baseline PASS does not close the active plan. No commit, push or PR is authorized by this report.

Action required: director may issue the frozen TFR-01 work order bound to this Report ID, HEAD and first two path identities. Preserve remaining gate/cleanup obligations and both consumed infrastructure retry budgets. Any changed identity or unknown dependency requires new independent validation rather than rebinding this report.