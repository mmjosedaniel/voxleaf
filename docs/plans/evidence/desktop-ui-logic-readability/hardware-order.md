# Hardware handlers: refreshed baseline and frozen order

Target `SRC-HARDWARE-CONTROLS-02`. Fresh execution Audit Packet: CHANGE,
low source risk, issued by the reused `clean_code_auditor` on 2026-10-13.
Director accepted the packet after resolving the environmental prerequisite.

## Independent baseline

Report ID `SRC-HARDWARE-CONTROLS-02-BASELINE-20261013-02`, BASELINE, PASS.
Starting/ending HEAD `5be831c23135ca00f94b2b3374f0330de2b658ce`.
Both paths were clean; index empty before/after; identity recheck PASS.
Supplemental A/C/D identities also remained equal to their accepted reports.

| Validated path under `apps/desktop/src/tts/` | Porcelain | SHA-256 | Filtered blob |
| --- | --- | --- | --- |
| `HardwareCompatibilityControls.tsx` | empty | `A28EC3D1369A9AD21DFF24CAFB820605F8157018D53EE1862189E4F931482B92` | `1c17a85f3133dd0b1bfee1a0c58ebd99c6000864` |
| `HardwareCompatibilityControls.test.tsx` | empty | `147F5E7CD8D1A39A8788691181120CB6CF48103DFE763D26C533A3A79BD0343C` | `8576768643fd172a393062ee64b0ca3aade761a4` |

All twelve commands below passed. Desktop: 723 Vitest / 70 Node; browser:
seven cases. Preflight: 39 Vitest, 17 driver Node and five portfolio Node.
The initial generic native invocation failed because the wrapper enabled real
Piper while that test requires its fake service. The unchanged native command
then passed in a separate model-free process, after removing only the twelve
unique environment keys defined by `BILINGUAL_PORTFOLIO_ARMS` and
`modelFreeLifecycleEnvironment`. Both outcomes remain recorded. No source,
test assertion or threshold changed between these invocations.

| Model/language | Quick audible ms | Prepared audible ms | Warm prepared RTF | Cancellation ms |
| --- | ---: | ---: | ---: | ---: |
| Piper ES | 4308 | 6339 | 0.10 | 246 |
| Piper EN | 4630 | 5594 | 0.09 | 617 |
| Chatterbox ES | 36928 | 58474 | 0.88 | 284 |
| Chatterbox EN | 33263 | 56906 | 0.85 | 281 |

All four arms passed selection, synchronization, playback and cleanup, with
zero observed underruns, external requests, stale playback and final retained
units/discarded units/generated-audio files. Piper exercised six speeds.
These are bounded reference-host observations, not universal guarantees.

Environment: normal local PowerShell 7.6.5 outside sandbox, Node 24.20.0,
Corepack pnpm 11.15.1, signed EdgeDriver 155.0.4283.45. WMI launches used
`Invoke-CimMethod -ClassName Win32_Process -MethodName Create` with a literal
PowerShell executable and `-NoProfile -NonInteractive -WindowStyle Hidden -File`
pointing to an ignored local script. PIDs 22600 and 48276 were supervised to
completion through process inspection, logs and exit receipts. Actual final
paths for package root/model shared the ordinary AppData tree. See the
[environmental diagnosis](host-context-recovery.md).

## APPROVED WORK ORDER

Target ID: `SRC-HARDWARE-CONTROLS-02`.
Goal: one private local definition of the existing settings-operation sequence.
Risk: low. Allowed files: exactly the two paths in the manifest above.
Diff ceiling: two files, 260 added plus removed lines.
Baseline evidence: `SRC-HARDWARE-CONTROLS-02-BASELINE-20261013-02`, PASS.

Required edits:

1. Add deferred true/false characterization for profile, language and reset
   against the original production file. Assert pending order, retained disabled
   controls, success-only recovery, callback bypass, fallback args/receiver and
   the separate recheck path. Preserve existing tests and assertions.
2. Introduce local `runNarrationSettingsChange(operation: () => Promise<boolean>):
   Promise<void>` and retain the three explicit callback/fallback adapters.
3. Keep pending true outside try, invoke/await inside try, truthy-only recovery
   and pending false in finally. Preserve operation/recovery rejection and
   pending-notification exception semantics; review those exceptional paths by
   exact source equivalence, without test exports or unhandled-error suppression.

Forbidden: recheck consolidation, catches/retries/logging, domain/coordinator/
native/runner changes, JSX/copy/accessibility changes, other source paths,
dependencies, generated/frozen authority, thresholds, A/C/D edits and all Git
mutations. Keep effect cleanup, filters, permissions, focus and disabled rules.
Privacy, cancellation, bounded resources and synchronization remain unchanged.

Worker validation: run the desktop test command in the corrected host context
after adding characterization and before editing production; record the
unchanged production identity. Format only the allowlisted files when needed.
Completion output: Change Packet only; no staging, commit, push or PR.

Acceptance commands, unchanged from the baseline:

```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd --filter @voxleaf/desktop build
pnpm.cmd test:browser
pnpm.cmd test:native-startup
pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4
```

Raw evidence is ignored under `tmp/evidence/desktop-ui-logic-readability/`:
`hardware-baseline-02.*` and `hardware-baseline-02-native-corrected.*`.
This receipt is outside the validated source manifest and immutable once issued.
