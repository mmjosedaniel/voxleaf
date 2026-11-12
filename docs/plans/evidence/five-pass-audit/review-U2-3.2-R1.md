# Change Review Report

Review ID: FPA-U2-3.2-CR-R1-20261111  
Task ID: five-pass-audit / U2 case 3.2 and dependent U1 reassessment  
Verdict: APPROVE  
Per-case verdicts: **3.2 APPROVE; 1.1 APPROVE; 3.1 APPROVE; 4.1 APPROVE**  
Acceptance boundary: reviewed unit scope; campaign integration remains pending.

Base commit and reviewed HEAD: both `a3241571944530d468e2f4f2d37a0a2394a8df84`.

Reviewed paths and identities: incorporated from the closed fourteen-path manifest `tmp/evidence/five-pass-audit/u2-3.2-review-inputs.txt`, SHA-256 `FEF4C86FA7D2F326510DC1DF042C525ECB68515F72192E6ED981F1FFD12FAD3B`. This binds all five changed production/test paths and nine unchanged supporting paths to their recorded porcelain statuses, SHA-256 values and filter-aware blob IDs.

Combined patch: `tmp/evidence/five-pass-audit/u2-3.2-review.diff`, SHA-256 `34F131D74977060C568BF2EF85A69E7BC3AED9726A65D443A9CE145E94A96713`.

Identity recheck: PASS. Independent before/after inspection matched all fourteen path identities and statuses. Base/HEAD remained unchanged, the index remained empty, and the actual five-file runtime/test diff matches the supplied artifact. Active-plan and campaign-evidence documentation remain separately identified outside this runtime manifest.

Acceptance review:

- **3.2:** Provisional readiness no longer commits startup. Before first allocation, rate selection recomputes effective lead; Prepared-60 with 45 source seconds correctly returns to preparing when changed from 75% to 100%.
- PCM calls rate activation at its synchronous allocation boundary. Commitment therefore occurs before later rendering confirmation, preserving the approved distinction between allocation and audible receipts. Positive direct consumption and explicit Play available also retain commitment.
- Pause before allocation preserves intent; Resume reevaluates initial lead. New PCM regressions prove no premature allocation both directly and through Pause/Resume.
- Existing assertions preserve Quick-mode production toward the refill target, shorter completed tails, source-frame resource bounds, explicit capacity escape, refill/underrun behavior and immutable active-unit rates. The added override assertions ensure a later rate selection does not revoke explicit Play available.
- **U1 reassessment:** Coordinator production/tests remain byte-identical to the previously reviewed U1 patch. Current inspection and fresh combined execution support all three cases: delayed navigation suppression, attempted-start recovery fallback with heard-checkpoint precedence, and canceled-recovery preservation of visible position. Scheduler changes do not alter their identity or locator authority.
- Tests were added without removing or weakening existing assertions. No fixed wall-clock startup wait, additional queue, audio persistence, public schema or cancellation boundary was introduced.

Test evidence reviewed: supplied normal-host PowerShell receipts attributed to the implementer/coordinator; the reviewer ran no tests, formatters or builds.

| Receipt | Exact command | Recorded result |
| --- | --- | --- |
| `u2-3.2-red-01.log` | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/adaptive-buffer-scheduler.test.ts src/tts/pcm-playback.test.ts -t 'five-pass 3.2'` | Exit 1; three matching failures: retained playing state and premature PCM allocation with/without Pause |
| `u2-3.2-green-01.log` | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/adaptive-buffer-scheduler.test.ts src/tts/pcm-playback.test.ts src/tts/product-narration-coordinator.test.ts src/reader/ReaderPublication.test.tsx src/App.test.tsx` | Exit 0; 453/453 tests |
| `u2-3.2-static-01.log` | `pnpm.cmd exec prettier --check apps/desktop/src/tts/adaptive-buffer-scheduler.ts apps/desktop/src/tts/adaptive-buffer-scheduler.test.ts apps/desktop/src/tts/pcm-playback.test.ts` | Exit 0 |
| Same static receipt | `pnpm.cmd exec eslint apps/desktop/src/tts/adaptive-buffer-scheduler.ts apps/desktop/src/tts/adaptive-buffer-scheduler.test.ts apps/desktop/src/tts/pcm-playback.test.ts` | Exit 0 |
| Same static receipt | `pnpm.cmd --filter @voxleaf/desktop run typecheck` | Exit 0 |

Recorded environment: root invocation, Node `24.18.0`, pnpm `11.15.1`, Vitest `5.0.5`. RED ran 20:23:27–20:23:29 UTC; GREEN 20:24:34–20:24:39 UTC; static checks 20:25:04–20:25:10 UTC on 2026-11-11.

RED paired input manifest SHA-256: `3BD97A53257666E19380D7A60E915CC450A51B43A9AC3B978DBF58666EBF1861`. GREEN/static paired manifest SHA-256: `634AC711DADBD431542E8B3EC91471962BAA060B2EA53DBCCDCC9AC2AF0A851C`. Current inspection matched all 611 recorded existing inputs and both recorded absent paths. No historical test outcome was reused.

Findings: none.

Remaining uncertainty: the controlled real-worklet/browser scenario required by G6, G7 native evidence, final G11/G12 and integrated review remain pending. These model-free results do not replace those gates.

Required next action: none for the reviewed cases at these exact identities. Complete the pending integration gates before campaign closure; later identity drift requires a new assessment.

This immutable approval is neither a Validation Report nor authorization for Git mutations.
