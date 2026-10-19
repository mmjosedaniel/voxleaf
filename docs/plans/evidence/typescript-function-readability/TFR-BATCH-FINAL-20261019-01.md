# Validation Report

Report ID: TFR-BATCH-FINAL-20261019-01
Target ID: TFR-BATCH, final source/documentary/host closure
Mode: FINAL
Verdict: PASS
Environment: normal local PowerShell outside sandbox; ordinary WMI PowerShell for read-only runtime/isolation verification.
Starting HEAD SHA: 2648617f86fdfd7dddc8dc81fdeabd36942f3c3c
Ending HEAD SHA: 2648617f86fdfd7dddc8dc81fdeabd36942f3c3c

Validated paths: closed seventeen-path scope below (ten existing source/test paths, two accepted-SKIP ABSENT guards, five documentary entries including the removed active plan). Porcelain prefix plus path is exact; empty means no entry. The report itself is outside evaluated paths.

| Path | Porcelain prefix | SHA256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/src/tts/process-client.ts` | ` M` | `4E7C07870321BEC73994F1A494E77DEEF1A12DC0D7195759E620AB4BA00F6D9D` | `92dea92b51a7a2cd17703cfd4537ccfa07a36a74` |
| `apps/desktop/src/tts/process-client.test.ts` | ` M` | `E0B65F08C683B0F3595743986BA2D414B8A170AF64608C3F7EEFA7F6AB4D2CB8` | `c003bc63fe28a4278730e9211db533c1fcffd711` |
| `apps/desktop/src/tts/hardware-profile-compatibility.ts` | ` M` | `357CDA9B5C3EE6A4FB60D0E0D7093A529C4BA4CFAA98818FD10596B5304597E9` | `3cc3c020a3c90a4eaf3a62162ff8cf39ed7483c3` |
| `apps/desktop/src/tts/hardware-profile-compatibility.test.ts` | empty | `7360D94C4526A9B5B76EFC0E9BF5C8ADB2E26316453A405F880B1531B8887BA8` | `774f4bb3144be1940393786e458da7f16b56ba60` |
| `apps/desktop/src/reader/ReaderPublication.tsx` | empty | `25B15E04479662CA491AC5DC67CD378E354B775153E298640CE9239F3EB68C86` | `d7f4ea3b06815e93677afb5710b5d497bee07cfd` |
| `apps/desktop/src/reader/ReaderPublication.test.tsx` | empty | `DC0FA3C43803B6694A72F813E64E595B284195ED0B616D88E8D3549B311C0E7D` | `57bd519293dff2bff71fb37f2567aa1fec774d0b` |
| `apps/desktop/src/reader/narration-bindings.ts` | empty | `ABSENT` | `ABSENT` |
| `apps/desktop/src/reader/narration-bindings.test.ts` | empty | `ABSENT` | `ABSENT` |
| `apps/desktop/src/tts/product-narration-coordinator.ts` | empty | `1063D715A7DB4D96A94638CE1F00B3ABB38D2A02461F58F6B942D687ACF45E0B` | `60cab7f948a54a5a91edac6418ffc4fb6a0db66b` |
| `apps/desktop/src/tts/product-narration-coordinator.test.ts` | empty | `CAA6DCB3E96482F288F1972F6661B453657E95E95DE3BEDAB1097829694EB262` | `bf5b0a8c5dfdddceb8414e1f58d92c60cdaae0d8` |
| `packages/epub/src/package/package-document.ts` | ` M` | `6D7EC2E7C58E17D600113AD9710074F713E8F0AE7514671D0F366F0E95EFA7DB` | `5566bc0d806f73c7c96f4c0675ffe9f849c5a5d3` |
| `packages/epub/src/package/package-document.test.ts` | ` M` | `7D3A09EFE0FD37DE44080EC5E4995E6EBA800F56609FE264B9F0061E3B64D7AC` | `7295162e1dd533060e966123f2a44d7fecbf4074` |
| `docs/README.md` | ` M` | `F751D727BADC366A44EA51557EBF28EA16CE5191ECABE2F0F4710C90F6BD8C75` | `e78325c3b635eb95cae5cadc45a2bca5428f050c` |
| `docs/plans/active/README.md` | ` M` | `9FA065ADDB4626BBCF21EEE32FF44750C9E5E2514CBAC56DEEBB495CD30F1B67` | `8429c40455f42b43ff1ea1faf9e7c25ef904d006` |
| `docs/plans/completed/README.md` | ` M` | `CBCC5614F6F5194281ECC4271407E27548348243C0204CB20568639B55910618` | `21d322c460d2253a5bbbdea889b7fec4c0a96e06` |
| `docs/plans/active/typescript-function-readability.md` | ` D` | `DELETED` | `DELETED` |
| `docs/plans/completed/typescript-function-readability.md` | `??` | `6CBD262029276C48B03D81B7D34D07E83965189842FF5B6A51326EBD90631400` | `fec9e0e06c3165cab04baef7beeb923376e9c7e1` |

Identity recheck: PASS. Authoritative `capture-03/identity-before.json` and `identity-after.json` agree after the last acceptance command; branch remains `codex/typescript-function-readability`, full HEAD unchanged, index empty. Full source/discovery manifests agree across final review (1,301 entries, including the deleted-path marker).

Commands and outcomes: repository-root cwd, pinned Node 24.18.0 / Corepack pnpm 11.15.1 / PowerShell 7.6.5.

| Fresh final command/check | UTC start / end | Seconds | Result |
| --- | --- | ---: | --- |
| `pnpm.cmd check:evidence` | 10/19/2026 17:53:38 / 10/19/2026 17:53:38 | 0.4261892 | exit 0 |
| `git diff --check` | 10/19/2026 17:55:12 / 10/19/2026 17:55:12 | 0.0387181 | exit 0 |
| Full patch, twenty-four retained reports, commands/status/architecture and relative-link review | frozen final review | not timed | PASS |
| Read-only ordinary-host runtime/artifact/isolation comparison | captured 2026-10-19T17:53:45.847Z | metadata only | PASS |

Reused gates are individually bound to [PACKAGE PASS](TFR-BATCH-PACKAGE-20261019-01.md), SHA256 `06B508D1370901712F7D1E7C370767C3600CE1D89F2A2121F34B8C05759480AF`, and its original immutable receipts, not newly executed:

| Required boundary / exact commands | Original gate evidence and result |
| --- | --- |
| `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript` | TFR-05-worker-01 G-FAST-format/lint, independently bound by POST05 and PACKAGE; PASS |
| `pnpm.cmd typecheck:typescript`; `pnpm.cmd test:typescript`; nested `pnpm.cmd build:packages` and shared generate:check | PACKAGE G-CROSS-types/tests; PASS shared 209, EPUB 655, desktop 730 Vitest + 76 Node |
| `pnpm.cmd format:check:python`; `pnpm.cmd lint:python`; `pnpm.cmd typecheck:python`; `pnpm.cmd test:python` | PACKAGE G-FORMAT/LINT/TYPES/TEST-python; PASS, mypy 171 files, pytest 571 |
| `pnpm.cmd format:check:rust`; `pnpm.cmd lint:rust`; `pnpm.cmd test:rust` | PACKAGE G-FORMAT/LINT/TEST-rust; PASS default/release Clippy and 94/93 tests; existing subprocess fixture remains intentionally ignored in the outer suite |
| `pnpm.cmd build:python`; `pnpm.cmd build:desktop`; `pnpm.cmd --filter @voxleaf/desktop build` | PACKAGE G-BUILD-python/desktop/portable-frontend; PASS; exact native and portable exclusive leaves preserved |
| `pnpm.cmd test:evidence` | PACKAGE G-EVIDENCE-tests; 13 passed; guard/fixtures/config unchanged |
| `pnpm.cmd test:browser` | POST05 G-BROWSER; seven passed, 13.525 s; same final frontend and browser runtime |
| `pnpm.cmd test:native-startup` | PACKAGE native-final/G-NATIVE; PASS 38.476 s after all builders, same tested executable |

Each original report/receipt retains exact UTC command intervals, cwd, tool/environment/input identities and logs. PACKAGE expands and maps every unique leaf of `check` and `check:portable`; neither aggregate command was itself executed. All exclusive default/release Rust, Python, portable frontend and default native build requirements are resolved. No CI requirement is waived.

Current equivalence proof: `closure.json`, `capture-03/inputs-before/after.json`, libraries/environment/package-artifact manifests and `runtime-reuse-proof.json`. Compared with PACKAGE, changes are only the completed-plan move, three indexes and new immutable Markdown reports. These are not imported/discovered runtime, TS, Python, Rust, fixture, package or build inputs; the changed Git/documentary boundary received fresh G-DOCS. Complete 13,184-file JS/Corepack/pnpm, 2,276-file model-free Python and 1,811-file Chromium/FFmpeg manifests and membership match. Relevant pinned tool hashes/versions, drivers, WebView2 155.0.4283.62, browser configuration/environment, all package/frontend/Python distribution bytes and the final tested executable agree. No builder or package-version change occurred during documentary closure. The final executable remains SHA256 `8ECDF1445458390C8A6CE44CAFC48919607539C54EDBB6AE198D455AE253DB12`.

G-HOST is retained at its actual accepted TFR-01 and TFR-02 execution boundaries ([POST01](TFR-01-POST-20261019-01.md), [authoritative POST02](TFR-02-POST-20261019-02.md)). Their lifecycle and Piper ES/EN plus Chatterbox ES/EN results are not rebound as new measurements after TFR-05 or after firewall removal. Plan section 8 assigns no new model gate to the EPUB-only unit; Qwen remains deferred. Final native/browser/combined gates cover the final affected source state.

Acceptance boundary: FINAL.
Pending batch gates: none.
Preparation/cleanup: PASS. [Independent cleanup](TFR-CLEANUP-20261019-01.md), SHA256 `16AD29FEBBBD2D6DAA5BEAC083929ECE0B9FF4EEE618DA76F7A38486C531477C`, and current ordinary-host recheck confirm the exact owned rule absent, all eight prior rules unchanged, no task native/driver/Python processes, no new native profile or port 4173 listener, and unchanged installed interpreter/manifests. Removal restores original state; it is not an environment assumed for any new model measurement. No source, package, process or firewall mutation by this final validation.

Retries/corrections: one metadata-wrapper preparation error expanded a variable in the DELETED-path branch and recursively attempted receipt capture; a duplicate-receipt guard stopped it before final gates. Original script/partial captures are preserved; one literal-variable correction produced complete capture-02. The director then corrected one documentary count/ceiling phrase (actual 129 lines within approved 180), re-froze the same scope, and capture-03 became authoritative before the first gate. Neither action retried runtime tests, altered authority or reset historical budgets. All earlier environment/model failures, bounded recoveries and immutable superseded reports remain retained.

Diff scope: PASS. Independently reviewed all source hunks: five changed source/test files, 260 added+removed lines, three approved changes and two justified SKIPs. Documentary changes are exactly the approved move/index updates and concise immutable evidence. No unrelated tracked changes or Git mutation; work remains unstaged/uncommitted.
Invariant review: PASS. TFR-01 names the same foreign-service predicate at five original sites; TFR-02 retains exact profile identity and admission/persistence guards; TFR-05 preserves EPUB2/3 navigation errors and validation order/final freezing. SKIP03 keeps already-cohesive reader effects; SKIP04 avoids changing Promise reaction/publication ordering. Privacy, bounds, cancellation, stable locators, normalization and public contracts remain unchanged. System diagram, ADR and completed M005 boundaries remain accurate without edits.
Test-integrity review: PASS. Seven approved public characterization cases added, existing startup observation strengthened, no prior assertion weakened or removed. No dependency, generated source, snapshot or frozen authority change. Results are bounded synthetic/current-host evidence, not a performance improvement or universal guarantee. Existing non-failing pytest-cache and frontend-size advisories remain disclosed.
Privacy/artifact review: PASS. Twenty-four pre-existing campaign Markdown reports/audits/orders match accepted hashes and membership, with no raw/private/book/audio/model artifact additions. Evidence manifest SHA256 `A74164F09FFF05CA111B524955E8F67CE637274019E35DA09B3AC4CFDA8D6E81`; its full entries are in local `evidence-before/after.json`. The malformed historical report remains byte-preserved in ignored storage (153,966 bytes, SHA256 `BE2976A983637091806BAB05A28C9D4BE3925FC97A94D25222DDB6BA5F272172`) with concise archive provenance. Raw captures remain local, not permanent public artifacts.

Documentation/link review: PASS. Completed plan accurately records all five outcomes, gates/reuse, failures, timings, limits, host restoration and no Git authority. Active directory contains only its index; no redirect remains. All 283 relative links across the four live documentary files and twenty-four retained records were checked; the sole anticipated target was this report. Its creation resolves that target, with the resolution and unchanged scope rechecked in a separate immutable post-issuance receipt.
Action required: none for this authorized campaign. Staging, commit, push and PR remain outside authorization.

Evidence root: `tmp/evidence/typescript-function-readability/TFR-BATCH-FINAL-20261019-01/`. Authoritative identities are under `capture-03/`; failed/earlier captures are preserved separately. This new report is outside its evaluated scope and does not rewrite any earlier evidence.
