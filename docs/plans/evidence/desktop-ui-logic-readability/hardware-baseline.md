# Hardware handler execution audit and failed baseline

Target: `SRC-HARDWARE-CONTROLS-02`. Fresh audit: CHANGE, low source risk.
Three handlers repeat pending notification, awaited operation, success-only
recovery and finally cleanup. The independent recheck has different semantics.
Closed allowlist: `apps/desktop/src/tts/HardwareCompatibilityControls.tsx` and
`apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx`; ceiling 260 lines.
Draft terms retain explicit callback/fallback adapters and receiver/arguments,
pending-before-invocation order, rejection/notification-exception semantics,
recheck, all markup, permissions and domain ownership. Deferred true/false
characterization of all three handlers is required before production edits.
No Approved Work Order was issued because the baseline failed.

## Validation Report

Report ID: `SRC-HARDWARE-CONTROLS-02-BASELINE-20261013-01`.
Mode: BASELINE. Verdict: BASELINE-FAIL. Starting/ending HEAD:
`5be831c23135ca00f94b2b3374f0330de2b658ce`.
Environment: normal local PowerShell outside sandbox (`require_escalated`),
pnpm 11.15.1 through the existing process-local Corepack shim. Signed EdgeDriver
155.0.4283.45 matches WebView2. Documented process-local Piper ES/EN and
Chatterbox triples plus `HF_HUB_OFFLINE=1` and `TRANSFORMERS_OFFLINE=1` were
used after confirming existing interpreter-specific outbound blocks. No
installation, synchronization, firewall or machine configuration changes;
Qwen was not enabled. Missing process variables were resolved before any arm,
so no missing-configuration failed attempt is claimed.

| Validated path under `apps/desktop/src/tts/` | Exact porcelain | SHA-256 | Filtered blob |
| --- | --- | --- | --- |
| `HardwareCompatibilityControls.tsx` | empty | `A28EC3D1369A9AD21DFF24CAFB820605F8157018D53EE1862189E4F931482B92` | `1c17a85f3133dd0b1bfee1a0c58ebd99c6000864` |
| `HardwareCompatibilityControls.test.tsx` | empty | `147F5E7CD8D1A39A8788691181120CB6CF48103DFE763D26C533A3A79BD0343C` | `8576768643fd172a393062ee64b0ca3aade761a4` |

Identity recheck PASS: HEAD and paths unchanged; empty index before/after.

Commands and outcomes:

1. `pnpm.cmd build:packages` — exit 0.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck` — exit 0.
3. `pnpm.cmd --filter @voxleaf/desktop test` — exit 0; 719 Vitest / 70 Node.
4. `pnpm.cmd format:check:typescript` — exit 0.
5. `pnpm.cmd lint:typescript` — exit 0.
6. `pnpm.cmd --filter @voxleaf/desktop build` — exit 0; existing chunk warning.
7. `pnpm.cmd test:browser` — exit 0; seven cases.
8. `pnpm.cmd test:native-startup` — exit 0 after fresh Tauri release build;
   packaged WebView2 lifecycle, cancellation, ingress, accessibility,
   synchronization, restoration and cleanup passed without external requests.
9. `pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight`
   — exit 0; 39 Vitest, 17 driver and five portfolio Node tests.
10. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es`
    — exit 1; profile selection `webdriver-condition-timeout`.
11. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en`
    — exit 1; same profile-selection timeout.
12. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4`
    — exit 1; optional-profile state `failed`, profile selection
    `synchronized-narration-proof-failed`. Spanish did not finish; English
    was not reached, and is not a pass.
13. `git diff --check` and `git diff --cached --quiet` — exit 0.

Scope, source invariants, unchanged-test integrity and diff privacy checks
passed. Model-backed switching/playback/resource/cleanup acceptance did not.
The hardware source and tests remain untouched; the accepted narration patch
and documentation are disjoint and unstaged.

## Blocker and next step

Both Piper arms passed configuration/firewall admission and reported compatible,
selectable requested profiles. The runner switches to its only alternate,
Chatterbox, before switching back. Existing output does not identify which
wait timed out. The separate Chatterbox failure supports investigating optional
profile readiness, but does not establish its cause. No retry, weakened gate,
unrelated repair or successful inference claim was made.

This is a pre-change baseline failure. Keep handlers unimplemented, investigate
the optional-profile prerequisite under an appropriate separate scope, and run
a fresh complete baseline before authorizing the unit. Independent comparator
and Settings work may continue. Raw evidence remained in the tool transcript;
this content-safe receipt preserves the material results and code identities.
