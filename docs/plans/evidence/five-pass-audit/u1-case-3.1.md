# U1 case 3.1: first failed start recovery

Status: unit APPROVE, renewed by FPA-U3-5.2-CR-R1-20261111; integration pending.
Base/HEAD: `a3241571944530d468e2f4f2d37a0a2394a8df84`.
Allowlist remains the coordinator and its existing test file.

The old constructor initialized the supposed heard checkpoint to book-opening
position A. A first attempt at B that failed before confirmed audio therefore
recovered A. The new regression verifies preparation at B, deferred backend
start, no confirmed rendering, failure containment, a later visible C, and
recovery preparation at B. Existing RIA-03 retains real heard A precedence over
a later attempted B. The fix makes heard progress optional and retains one
attempted-start locator; recovery chooses heard progress first, then the attempted
start. This is controlled model-free evidence. Case 4.1's eager visible-location
assignment remains for its separate reproduction and correction.

## Host evidence

Local PowerShell outside the sandbox, repository root cwd, Node 24.18.0,
pnpm 11.15.1, Vitest 5.0.5. Raw files below are under ignored
`tmp/evidence/five-pass-audit/`.

| Receipt | Exact command | UTC interval | Outcome |
| --- | --- | --- | --- |
| `u1-3.1-red-01.log` | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t 'five-pass 3.1'` | 20:10:44.355–20:10:46.910 | Exit 1, expected B offset 20, received A offset 0; prerequisite assertions passed |
| `u1-3.1-green-01.log` | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/reader/ReaderPublication.test.tsx src/App.test.tsx` | 20:11:17.392–20:11:22.651 | Exit 0, 345/345 including current 1.1 controls |
| `u1-3.1-static-01.log` | `pnpm.cmd exec prettier --check apps/desktop/src/tts/product-narration-coordinator.ts apps/desktop/src/tts/product-narration-coordinator.test.ts` | 20:11:39.488–20:11:40.350 | Exit 0 |
| Same | `pnpm.cmd exec eslint apps/desktop/src/tts/product-narration-coordinator.ts apps/desktop/src/tts/product-narration-coordinator.test.ts` | 20:11:40.351–20:11:41.919 | Exit 0 |
| Same | `pnpm.cmd --filter @voxleaf/desktop run typecheck` | 20:11:41.920–20:11:45.635 | Exit 0 |

Scoped formatting preceded GREEN. Paired RED input manifest SHA-256:
`1D181AFE9FEB05E00756EB66295D2D67AF8397EFD4241A6B312D185F134ED7C5`.
Paired GREEN/static manifest:
`103A42946015676700513513831F33BCEFFE94D5C0607931785C902E65980793`.
RED production is the previously reviewed 1.1 patch, with the new 3.1 test SHA
`524DE6739BE66E73CB999B6D3FFE16FE25C4DAF6A6DCC8CF9D14B033B203F12A`.

Closed 11-path current manifest `u1-3.1-review-inputs.txt` SHA-256:
`9F5CF0BB86C9162297A6355D07D7736D31DEEEA3D517C93E27934C129396832B`.
Combined U1 patch `u1-3.1-review.diff` SHA-256:
`70A3FC29129024739BBAB81A736BEA78EEF3A2CBAC8C25A39CC0E3F79564E54A`.
Current production SHA-256:
`172ACBEDA038F7439426A89990593E4E9DFB822B94BFCD201A59295278F1C1A1`;
blob `15eb0febf4ef20d1a33d456d1fe38021b63d2cf1`.
Current test SHA-256:
`6246934A22D3482C209C2ACE9FA71CE050CAD7CC0F2CC12546EBF4A56B86351E`;
blob `f589dab82bec62c7c099ae6b0df72a162a63b31a`.

No historical PASS reused. Independent review must reassess 1.1 on the current
shared-source patch and accept 3.1 separately. G6/G7/final G11/G12 and integrated
review remain pending. No host installation, GPU or firewall operation occurred.
