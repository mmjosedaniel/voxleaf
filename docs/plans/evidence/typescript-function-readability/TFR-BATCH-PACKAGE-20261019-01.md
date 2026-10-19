# Validation Report

Report ID: TFR-BATCH-PACKAGE-20261019-01
Target ID: TFR-BATCH (TFR-01/02/05 changes; TFR-03/04 accepted SKIPs)
Mode: PACKAGE
Verdict: PASS
Environment: normal local PowerShell outside sandbox, including ordinary WMI PowerShell for browser/native and all aggregate leaves.
Starting HEAD SHA: 2648617f86fdfd7dddc8dc81fdeabd36942f3c3c
Ending HEAD SHA: 2648617f86fdfd7dddc8dc81fdeabd36942f3c3c

Validated paths: the following closed ten existing files plus two approved ABSENT guards. Status is exact porcelain prefix (` M` plus the listed path); empty denotes no porcelain entry.

| Path | Status | SHA256 | Filter-aware blob |
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

Identity recheck: PASS. Before `identity-before.json`; authoritative ending `native-final/identity-after.json`, captured after the final `git diff --check`. Full HEAD/index and all twelve identities agree. Source/discovery/config/lock/fixture/script membership and bytes (1,298 entries) stayed identical throughout PACKAGE; 13,184 JS/Corepack/pnpm files and 2,276 model-free Python environment files stayed identical. `package-closure.json` and complete before/after manifests retain proof.

Commands and outcomes: repository-root cwd. Node 24.18.0, pnpm 11.15.1 through the exact Corepack shim, PowerShell 7.6.5, Rust/Cargo 1.97.1, uv 0.11.29, Python 3.12.10. Tool hashes and relevant environment are in `environment-before/after.json` and `host-environment-before.json`; model selectors removed. UTC times below.

| Gate / exact command | Start / end UTC | Seconds | Outcome |
| --- | --- | ---: | --- |
| G-BUILD-desktop / `pnpm.cmd build:desktop` | 10/19/2026 17:40:27 / 10/19/2026 17:40:50 | 23.4273235 | exit 0 |
| G-BUILD-portable-frontend / `pnpm.cmd --filter @voxleaf/desktop build` | 10/19/2026 17:40:50 / 10/19/2026 17:40:51 | 0.7246527 | exit 0 |
| G-BUILD-python / `pnpm.cmd build:python` | 10/19/2026 17:40:26 / 10/19/2026 17:40:27 | 0.3900989 | exit 0 |
| G-CROSS-tests / `pnpm.cmd test:typescript` | 10/19/2026 17:39:28 / 10/19/2026 17:39:43 | 14.5945454 | exit 0 |
| G-CROSS-types / `pnpm.cmd typecheck:typescript` | 10/19/2026 17:39:20 / 10/19/2026 17:39:27 | 6.7125111 | exit 0 |
| G-EVIDENCE-tests / `pnpm.cmd test:evidence` | 10/19/2026 17:39:03 / 10/19/2026 17:39:05 | 2.4278376 | exit 0 |
| G-EVIDENCE / `pnpm.cmd check:evidence` | 10/19/2026 17:39:02 / 10/19/2026 17:39:03 | 0.4177346 | exit 0 |
| G-FORMAT-python / `pnpm.cmd format:check:python` | 10/19/2026 17:39:06 / 10/19/2026 17:39:06 | 0.6594445 | exit 0 |
| G-FORMAT-rust / `pnpm.cmd format:check:rust` | 10/19/2026 17:39:05 / 10/19/2026 17:39:06 | 0.5157212 | exit 0 |
| G-LINT-python / `pnpm.cmd lint:python` | 10/19/2026 17:39:06 / 10/19/2026 17:39:07 | 0.3722847 | exit 0 |
| G-LINT-rust / `pnpm.cmd lint:rust` | 10/19/2026 17:39:07 / 10/19/2026 17:39:20 | 13.6775012 | exit 0 |
| G-TEST-python / `pnpm.cmd test:python` | 10/19/2026 17:39:43 / 10/19/2026 17:40:07 | 23.9030884 | exit 0 |
| G-TEST-rust / `pnpm.cmd test:rust` | 10/19/2026 17:40:07 / 10/19/2026 17:40:26 | 19.5508686 | exit 0 |
| G-TYPES-python / `pnpm.cmd typecheck:python` | 10/19/2026 17:39:27 / 10/19/2026 17:39:28 | 1.092633 | exit 0 |
| native-final/G-NATIVE.json / `pnpm.cmd test:native-startup` | 10/19/2026 17:42:21 / 10/19/2026 17:42:59 | 38.4758184 | exit 0 |
| G-DIFF-after.json / `git diff --check` | 10/19/2026 17:41:14 / 10/19/2026 17:41:14 | 0.038819 | exit 0 |
| native-final/G-DIFF-after.json / `git diff --check` | 10/19/2026 17:43:17 / 10/19/2026 17:43:17 | 0.0390937 | exit 0 |

Results: evidence guard passed and 13 evidence tests passed. Shared 209, EPUB 655, desktop 730 Vitest plus 76 Node tests passed; shared generate:check ran through its configured pretest. All workspace types passed; Python mypy checked 171 source files and pytest passed 571 tests. Default Rust passed 94, release-locked-runtime passed 93; each intentionally ignores the existing subprocess fixture that its parent assignment-failure test invokes. Both Clippy variants passed with warnings denied. Python sdist/wheel and both exact native/portable builds passed.

One non-failing pytest warning reports an existing permission denial writing cache nodeids. It did not omit tests or fail assertions; no cache repair/retry was attempted. The existing frontend bundle-size advisory also remains non-failing. Neither warning changes thresholds or acceptance commands.

Aggregate mapping (configured graphs captured before execution in `gate-ledger.json`):

| Required leaf | Evidence | Aggregate coverage |
| --- | --- | --- |
| check:evidence / test:evidence | fresh G-EVIDENCE / G-EVIDENCE-tests | check and check:portable |
| format:check:typescript / lint:typescript | independently reused POST05 worker gates below | both |
| format:check:python / lint:python | fresh G-FORMAT-python / G-LINT-python | both |
| format:check:rust / lint:rust default and release | fresh G-FORMAT-rust / G-LINT-rust | check exclusive |
| typecheck:typescript / typecheck:python | fresh G-CROSS-types / G-TYPES-python | both |
| test:typescript / test:python | fresh G-CROSS-tests / G-TEST-python | both |
| test:rust default and release | fresh G-TEST-rust | check exclusive |
| build:packages | exact nested configured leaf in G-CROSS-types, then configured pretests; unchanged 248 package artifacts through close | both |
| build:desktop | fresh G-BUILD-desktop: default `pnpm --filter @voxleaf/desktop tauri build` | check exclusive |
| `pnpm --filter @voxleaf/desktop build` | fresh G-BUILD-portable-frontend | check:portable exclusive |
| build:python | fresh G-BUILD-python, sdist/wheel from configured uv backend | both |

The aggregate commands `pnpm.cmd check` and `pnpm.cmd check:portable` were NOT executed. Their unique configured leaves were executed/mapped as above, with dependencies satisfied and exclusive Rust/native/portable requirements retained. CI requirements are unchanged.

Reused gates: TFR-05-POST-20261019-01 (SHA256 `974B1D3180D1B2D5D4C21D58BF82B2881A7AC658E3FB300CF8A15A1B558DD8EF`) binds worker TFR-05-worker-01 G-FAST-format and G-FAST-lint. Original host receipts retain exact start/end/duration (6.1777247 s and 4.912081 s), command, cwd and full identities. Both PACKAGE before/after comparisons independently match consumed sources, library membership/bytes, resolved pinned tools and relevant original host environment. Only the three director progress Markdown paths and the new POST05 Markdown report differ from worker discovery; they are outside the TS format glob and ESLint runtime source inputs. No source/config/test change intervened.

Combined browser: reuse POST05 G-BROWSER (`pnpm.cmd test:browser`, 2026-10-19T17:34:05.1693275Z to 17:34:18.6944128Z, 13.5250853 s, seven passed). Complete current source, test/fixture/runner/lock/library proof and identical built frontend bytes preserve its boundary. Chromium 1248, Playwright 1.64.0, explicit locale/timezone/viewport and original 1,811-file installed runtime before/after manifests remain recorded. No intervening browser installation/configuration mutation occurred. Browser cleanup retained no port 4173 listener or new browser/node process.

Native: the successful aggregate builder changed the executable hash, so POST05 native behavior was not rebound to that binary. A fresh final configured `pnpm.cmd test:native-startup` ran after all aggregate builders (38.4758184 s PASS); no builders ran afterwards. Final tested executable SHA256 `8ECDF1445458390C8A6CE44CAFC48919607539C54EDBB6AE198D455AE253DB12` and frontend hashes are retained in `native-final/native-artifacts-after.json`. This was artifact invalidation after a successful configured build, not a failed-stage retry. Default Tauri build, packaged WebView2 startup, bounded fake-service lifecycle/cancellation/crash recovery, local-file/size limits, keyboard/reflow/reader synchronization and persistence/replacement cleanup passed with no external requests. Signed EdgeDriver 155.0.4283.45 and installed WebView2 155.0.4283.62 were verified.

G-HOST scope: accepted TFR-01-POST-20261019-01 and authoritative TFR-02-POST-20261019-02 retain their actual lifecycle/Piper ES/Piper EN/Chatterbox ES+EN measurements and exact execution inputs. No new model measurement ran after TFR-05; its unchanged model/runtime responsibility has no G-HOST assignment under plan section 8. Earlier frontend/native model artifacts are not falsely claimed identical to the final EPUB frontend. Qwen deferral is unchanged.

Acceptance boundary: BATCH, combined source/runtime package gates only.
Pending batch gates: final owned-firewall restoration verification and G-DOCS/FINAL documentary closure. These prevent campaign/final acceptance; this PACKAGE PASS does not authorize Git mutation.

Preparation/cleanup: per-run PASS. Ordinary local context containment and pinned tool/driver readiness passed. Source and package versions unchanged. Existing configured builders alone produced ignored package/frontend dist, Rust target/gen, Python project dist and caches; manifests/output ledger retain exact identities. Python environment libraries stayed unchanged. No task native/driver/Python process remains; the pre-existing native profile is preserved. Eight prior firewall rules and exact installed Python/manifest identities agree. At ending capture the task-owned rule remained explicitly retained; separate director removal and independent restoration evidence are still required.

Retries: no failed PACKAGE stage or retry. Native was rerun only because the authorized builder invalidated executable bytes. Earlier baseline failures, dependency/package preparation, cancelled/accepted UAC, model-memory recovery and consumed retry budgets remain in immutable prior reports; no reset, threshold weakening or substitute gate.

Diff scope: PASS. Exactly five changed source/test files, 260 added+removed lines across the three approved units; all other campaign paths unchanged. TFR-03 SKIP avoids unnecessary ReaderPublication extraction. TFR-04 revised SKIP preserves observable Promise reaction/publication ordering; original and revised audits remain immutable. No source/config/dependency/Git mutation by validation.
Invariant review: PASS. Independently reviewed per-unit transformations preserve synchronous guard/error order, exact frozen profile eligibility, cancellation/session identity, navigation precedence, bounds and immutable assembly. Combined tests exercise actual public parsing, shared contracts and desktop paths; canonical architecture and M005 boundary remain unchanged.
Test-integrity review: PASS. Prior assertions preserved; only approved characterization and four navigation precedence cases added. No snapshots relaxed, filtered substitute, public testing API or disabled assertion.
Privacy/artifact review: PASS. No books, audio, weights, private data, raw logs or manual generated changes entered source diff. Raw receipts stay in ignored local evidence; only concise immutable Markdown reports are proposed for repository retention.
Action required: complete exact-rule restoration and final frozen documentary review. No source correction.

Evidence root: `tmp/evidence/typescript-function-readability/TFR-BATCH-PACKAGE-20261019-01/`; final authoritative runtime/identity receipts are under `native-final/`. Refer to original immutable unit reports for their full historical baseline/recovery records.
