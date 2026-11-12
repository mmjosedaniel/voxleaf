# U1 case 4.1: canceled recovery preserves visible authority

Status: unit APPROVE, renewed by FPA-U3-5.2-CR-R1-20261111; integration pending.
Base/HEAD `a3241571944530d468e2f4f2d37a0a2394a8df84`. Same coordinator/test
allowlist as earlier U1 cases. No unrelated source changes.

The controlled regression confirms audible A, inspects B, fails the active
backend, contains failure, starts recovery with a held warm operation, then Stops
before recovery prepares narration. After verified containment, the real ordinary
Play entry (`startAtVisibleLocator`) must start B. A second variant moves to C
during the Stop wait and must preserve C. The old recovery eagerly assigned A
to the visible locator: B failed, C already passed. The minimal fix removes that
single speculative assignment. Actual audible and reader-settled updates remain;
there is no old visible snapshot to overwrite a newer manual move.

## Host evidence

Local PowerShell outside the sandbox, root cwd, pinned Node 24.18.0,
pnpm 11.15.1 and Vitest 5.0.5. Raw receipts in ignored
`tmp/evidence/five-pass-audit/`:

| Receipt | Command | UTC interval | Result |
| --- | --- | --- | --- |
| `u1-4.1-red-01.log` | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t 'five-pass 4.1'` | 20:17:01.296–20:17:03.742 | Exit 1; B expected offset20 received A offset0; C control passed |
| `u1-4.1-green-01.log` | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/reader/ReaderPublication.test.tsx src/App.test.tsx` | 20:17:34.504–20:17:39.668 | Exit 0; 347/347 including 1.1/3.1 |
| `u1-4.1-static-01.log` | `pnpm.cmd exec prettier --check apps/desktop/src/tts/product-narration-coordinator.ts apps/desktop/src/tts/product-narration-coordinator.test.ts` | 20:17:51.804–20:17:52.667 | Exit 0 |
| Same | `pnpm.cmd exec eslint apps/desktop/src/tts/product-narration-coordinator.ts apps/desktop/src/tts/product-narration-coordinator.test.ts` | 20:17:52.668–20:17:54.261 | Exit 0 |
| Same | `pnpm.cmd --filter @voxleaf/desktop run typecheck` | 20:17:54.262–20:17:56.139 | Exit 0 |

RED production matches approved 3.1. Test SHA-256 is identical RED/GREEN:
`404667657325FFA940BB2AF7A6A7FB1D59C6330098CAEF57708B6235BFE4D79F`;
current blob `3bcc2660c8f5b9c626149f6fceeaa699f7a486bc`.
RED paired input manifest SHA-256:
`CD65AB7F1F49A0486B164DCFD461FCF6868DA0F112D264B79C1BD3DCDBEC6481`.
GREEN/static paired input manifest SHA-256:
`9CA22C8EDF595DA6DBE863473524532CC8E3078A6E5869D99061C2626BC5A33D`.

Combined closed 12-path review manifest `u1-4.1-review-inputs.txt` SHA-256:
`B9D59961277AA7C46BD0673D3314088CD64BFB368FAAB4ED77E3A3B2964B2D02`.
Combined U1 diff `u1-4.1-review.diff` SHA-256:
`2A5EAC443A65F840A326BBEC18D5E317DF65DCFF4593228C451BFB7275A53F47`.
Current coordinator SHA-256:
`F23A94B15B7E78ABB58474E5DBA34F23620A715CC2521360D6BE9D8992360E19`;
blob `5b231c706f624597caf852038842bb6c4fb2ebbb`.

Independent review must cover all three U1 cases on these current bytes.
No historical test outcome reused. Controlled model-free evidence does not
replace pending G6/G7/final G11/G12 or integrated review. No host restoration
operation has been needed.
