# Change Review Report

Review ID: FPA-U1-3.1-CR-R1-20261111  
Task ID: five-pass-audit / U1 / case 3.1 and current-patch reassessment of case 1.1  
Verdict: APPROVE  
Per-case verdicts: **3.1 APPROVE; 1.1 APPROVE**  
Acceptance boundary: these two cases only; combined campaign acceptance remains pending.

Base commit and reviewed HEAD: both `a3241571944530d468e2f4f2d37a0a2394a8df84`.

Reviewed paths and identities: the complete closed eleven-path manifest is `tmp/evidence/five-pass-audit/u1-3.1-review-inputs.txt`, SHA-256 `9F5CF0BB86C9162297A6355D07D7736D31DEEEA3D517C93E27934C129396832B`. Its exact statuses, SHA-256 values, and filter-aware blob IDs are incorporated into this report.

Changed identities:

```text
 M apps/desktop/src/tts/product-narration-coordinator.ts
SHA-256: 172ACBEDA038F7439426A89990593E4E9DFB822B94BFCD201A59295278F1C1A1
Git blob: 15eb0febf4ef20d1a33d456d1fe38021b63d2cf1

 M apps/desktop/src/tts/product-narration-coordinator.test.ts
SHA-256: 6246934A22D3482C209C2ACE9FA71CE050CAD7CC0F2CC12546EBF4A56B86351E
Git blob: f589dab82bec62c7c099ae6b0df72a162a63b31a
```

The remaining nine unchanged paths are:

- `apps/desktop/src/tts/adaptive-buffer-scheduler.ts`
- `apps/desktop/src/tts/pcm-playback.ts`
- `apps/desktop/src/tts/operational-recovery.ts`
- `apps/desktop/src/persistence/narration-position-save-bridge.ts`
- `apps/desktop/src/reader/ReaderPublication.tsx`
- `apps/desktop/src/reader/ReaderPublication.test.tsx`
- `apps/desktop/src/reader/reader-navigation.ts`
- `apps/desktop/src/App.tsx`
- `apps/desktop/src/App.test.tsx`

Identity recheck: PASS. Before/after inspection matched every recorded SHA-256, blob ID and porcelain state. Base/HEAD remained unchanged and the index stayed empty. The actual combined two-file diff matches `tmp/evidence/five-pass-audit/u1-3.1-review.diff`, SHA-256 `70A3FC29129024739BBAB81A736BEA78EEF3A2CBAC8C25A39CC0E3F79564E54A`.

Campaign changes in the active ExecPlan and `docs/plans/evidence/five-pass-audit/` remain identified documentary work outside this runtime manifest.

Acceptance review:

- **Case 3.1:** `#startRun` captures the attempted locator synchronously, before service preparation, narration preparation, or playback. Subsequent passive inspection cannot replace that fallback. Recovery selects the actual heard checkpoint when present and otherwise selects the attempted start.
- The constructor no longer represents the opening locator as heard progress. Only identity-matched `segment-started` and `segment-completed` observations populate the heard checkpoint. PCM confirmation and the persistence bridge retain their existing authority; an attempted start creates no fabricated audible event or persisted heard checkpoint.
- The new regression proves opening A, first preparation at B, no confirmed rendering, failure containment, later inspection at C, and recovery preparation at B. Existing RIA-03 independently preserves actual heard A precedence over a later failed attempt at B.
- **Case 1.1:** Reassessed against the current source and fresh test evidence. Superseding chapter requests retain shared containment and prior play/pause intent while replacing navigation identity. Delayed boundary/paragraph emissions remain suppressed; close invalidates pending ownership. The five regression variants remain unchanged and pass in the current combined suite.
- No existing assertions were removed or weakened. The additional retained locator is bounded state; there is no new queue, public schema, dependency, persistence flow, or process boundary.

Test evidence reviewed: supplied normal-host PowerShell receipts, attributed to the implementer/coordinator. The reviewer executed no tests, formatters, or builds.

| Receipt | Exact command | Recorded outcome |
| --- | --- | --- |
| `u1-3.1-red-01.log` | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t 'five-pass 3.1'` | Exit 1; expected B offset 20, received opening A offset 0 after prerequisite assertions |
| `u1-3.1-green-01.log` | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/reader/ReaderPublication.test.tsx src/App.test.tsx` | Exit 0; 345/345 tests, including case 1.1 and RIA-03 |
| `u1-3.1-static-01.log` | `pnpm.cmd exec prettier --check apps/desktop/src/tts/product-narration-coordinator.ts apps/desktop/src/tts/product-narration-coordinator.test.ts` | Exit 0 |
| Same static receipt | `pnpm.cmd exec eslint apps/desktop/src/tts/product-narration-coordinator.ts apps/desktop/src/tts/product-narration-coordinator.test.ts` | Exit 0 |
| Same static receipt | `pnpm.cmd --filter @voxleaf/desktop run typecheck` | Exit 0 |

Recorded environment: repository-root invocation, Node `24.18.0`, pnpm `11.15.1`, Vitest `5.0.5`. RED: 20:10:44–20:10:46 UTC; GREEN: 20:11:17–20:11:22 UTC; static checks: 20:11:39–20:11:45 UTC on 2026-11-11.

RED before/after manifest SHA-256: `1D181AFE9FEB05E00756EB66295D2D67AF8397EFD4241A6B312D185F134ED7C5`. GREEN/static before/after manifest SHA-256: `103A42946015676700513513831F33BCEFFE94D5C0607931785C902E65980793`. Current inspection matched all 611 recorded existing inputs and both recorded absent paths. No historical PASS was reused.

Findings: none within the reviewed case scope.

Remaining uncertainty: case 4.1’s eager visible-location assignment remains explicitly pending and is not accepted by this report. Controlled model-free evidence does not establish browser/native timing; G6, G7, final G11/G12, and integrated review remain pending.

Required next action: none for cases 3.1 and 1.1 at these exact identities. Continue the separately scoped case 4.1 work and complete the required combined gates before campaign closure. Any subsequent reviewed-path or HEAD drift requires a new assessment.

This report is immutable. It is neither a Validation Report nor authorization for Git mutations.
