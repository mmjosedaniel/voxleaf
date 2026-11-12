# Change Review Report

Review ID: FPA-U1-4.1-CR-R1-20261111  
Task ID: five-pass-audit / U1 / cases 4.1, 1.1 and 3.1  
Verdict: APPROVE  
Per-case verdicts: **4.1 APPROVE; 1.1 APPROVE; 3.1 APPROVE**  
Acceptance boundary: U1 unit scope; campaign integration remains pending.

Base commit and reviewed HEAD: both `a3241571944530d468e2f4f2d37a0a2394a8df84`.

Reviewed paths and identities: incorporated verbatim from the closed twelve-path manifest `tmp/evidence/five-pass-audit/u1-4.1-review-inputs.txt`, SHA-256 `B9D59961277AA7C46BD0673D3314088CD64BFB368FAAB4ED77E3A3B2964B2D02`.

Changed identities:

```text
 M apps/desktop/src/tts/product-narration-coordinator.ts
SHA-256: F23A94B15B7E78ABB58474E5DBA34F23620A715CC2521360D6BE9D8992360E19
Git blob: 5b231c706f624597caf852038842bb6c4fb2ebbb

 M apps/desktop/src/tts/product-narration-coordinator.test.ts
SHA-256: 404667657325FFA940BB2AF7A6A7FB1D59C6330098CAEF57708B6235BFE4D79F
Git blob: 3bcc2660c8f5b9c626149f6fceeaa699f7a486bc
```

The manifest’s ten unchanged supporting paths cover the scheduler, PCM player, recovery controller, narration controls, persistence bridge, ReaderPublication and its tests, reader navigation, and App and its tests.

Identity recheck: PASS. Independent before/after inspection matched all twelve file hashes, filter-aware blob IDs and porcelain states. Base/HEAD remained unchanged; the index remained empty. The actual combined runtime/test diff matches `tmp/evidence/five-pass-audit/u1-4.1-review.diff`, SHA-256 `2A5EAC443A65F840A326BBEC18D5E317DF65DCFF4593228C451BFB7275A53F47`.

Active-plan and campaign-evidence documentation changes were identified separately and are outside this closed runtime manifest.

Acceptance review:

- **4.1:** Removing the speculative visible-locator assignment preserves inspected B when recovery from heard A is canceled before confirmed audio. Ordinary Play calls `startAtVisibleLocator`, so its next preparation uses B. The second regression preserves newer manual C during Stop containment. No saved snapshot is restored, eliminating the risk of overwriting that newer movement.
- Recovery still selects its active target from actual heard progress or the attempted-start fallback. Confirmed audio and genuine Reader settlement retain their existing locator updates. Stop containment and the spent recovery-attempt budget remain intact; existing DCR-01 and VCA-01 controls are preserved.
- **3.1:** Reassessed on current bytes. Attempted-start capture still precedes asynchronous work; an opening locator is not fabricated as heard progress. The first-failure regression and RIA-03 retain attempted-start fallback and actual-heard precedence respectively.
- **1.1:** Reassessed on current bytes. New chapter identity still suppresses delayed boundary/paragraph emissions while sharing containment and preserving prior play/pause intent. Close prevents stale publication and restart.
- Existing assertions were neither removed nor weakened. The combined change preserves privacy, cancellation, stable locator contracts, persistence authority and bounded resource ownership. No new architectural boundary requires a system-diagram change.

Test evidence reviewed: supplied normal-host PowerShell receipts, attributed to the implementer/coordinator. The reviewer ran no tests, formatters or builds.

| Receipt | Exact command | Recorded outcome |
| --- | --- | --- |
| `u1-4.1-red-01.log` | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t 'five-pass 4.1'` | Exit 1; B expected offset 20, received A offset 0. Newer-C control passed |
| `u1-4.1-green-01.log` | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/reader/ReaderPublication.test.tsx src/App.test.tsx` | Exit 0; 347/347 tests, including all three U1 regressions |
| `u1-4.1-static-01.log` | `pnpm.cmd exec prettier --check apps/desktop/src/tts/product-narration-coordinator.ts apps/desktop/src/tts/product-narration-coordinator.test.ts` | Exit 0 |
| Same static receipt | `pnpm.cmd exec eslint apps/desktop/src/tts/product-narration-coordinator.ts apps/desktop/src/tts/product-narration-coordinator.test.ts` | Exit 0 |
| Same static receipt | `pnpm.cmd --filter @voxleaf/desktop run typecheck` | Exit 0 |

Recorded environment: repository-root invocation, Node `24.18.0`, pnpm `11.15.1`, Vitest `5.0.5`. RED ran 20:17:01–20:17:03 UTC; GREEN 20:17:34–20:17:39 UTC; static checks 20:17:51–20:17:56 UTC on 2026-11-11.

RED paired manifest SHA-256: `CD65AB7F1F49A0486B164DCFD461FCF6868DA0F112D264B79C1BD3DCDBEC6481`. GREEN/static paired manifest SHA-256: `9CA22C8EDF595DA6DBE863473524532CC8E3078A6E5869D99061C2626BC5A33D`. Current identity inspection matched all 611 recorded existing inputs and both recorded absent paths. No historical PASS was reused.

Findings: none.

Remaining uncertainty: controlled model-free evidence does not establish browser/native timing. G6, G7, final G11/G12 and integrated review remain pending.

Required next action: none for this exact U1 patch. Preserve this immutable report and complete the pending combined gates before campaign closure. Subsequent reviewed-path or HEAD drift requires a new assessment.

This approval is neither a Validation Report nor authorization for Git mutations.
