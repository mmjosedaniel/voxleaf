# Chatterbox v7 msgpack security refresh

Completed on 2026-10-27: verified package retained and published, V7 integrated,
independent local acceptance obtained, and all four hosted checks passed on
integration commit `5695f4ed4a52885e6d6aa03976d23b5c34defde8`. The staged
authorization history and unsuccessful attempts below remain historical.

## Goal

Prepare a distinct, verified `voxleaf-chatterbox-v7` runtime with msgpack 1.2.3 to address the dependency finding CVE-2026-114613 / GHSA-j586-36cw-2gc2. Preserve the other 78 package pins, frozen service modules, Python/Torch/CUDA and all six model identities. Use the existing packaging design rather than a new on-device installer architecture.

Authorization on 2026-10-27: the user selected creating v7 after reviewing the CI finding and alternatives. Preparation and local validation are authorized; publication of the exact artifacts awaits separate approval. Existing PR #278 commit/push authorization applies to reviewed source work, not release assets, merge or installer publication. Base: `fac93a68aa83afdf43c15cade083e809d79df073`, branch `codex/narration-chatterbox-correctness`, clean worktree/index at entry.

Additional authorization on 2026-10-27 (supersedes the preparation-only boundary above without erasing it): the user explicitly approved saving the package and evidence in `dist/v7`, publishing the prerelease and continuing V7 integration until CI is corrected. This explicit destination overrides the security skill's managed-storage requirement for this task after its transport failure. Preparation commit `a74fc85be0c93fe7abdecbfcaf633ecd6cf1a569` preserves the exact R2-approved patch; all 17 staged blobs matched the review. No merge, public installer publication or model change is authorized.

## User-visible outcome

Authorized integration outcome: published V7 becomes the only current optional
runtime; V6 is retained for explicit cleanup. Production audit follows V7.
The preparation-only statements below record the earlier boundary, superseded
by the additional authorization above and the integration results below.

Preparation produces a reviewable local runtime and release parts. Active acquisition and production audit continue selecting v6 until a separately approved publication and integration. A passing candidate audit is not remediation of existing downloaded v6. Later explicit v7 acquisition must retain local inference, bounded ephemeral audio, cancellation, ES/EN behavior and user-data preservation.

## Current state

PR #278's three foundation checks pass at the base commit. The production graph audit fails on unchanged v6 `msgpack==1.2.1`. Local `pnpm.cmd audit:chatterbox:v6` reproduced exit 1, one finding, and four existing URL/CUDA blind spots. The advisory database expanded the listed range to `<1.2.3`; upstream's reproduction describes 1.2.2 and acknowledges uncertainty about the earliest affected release. Dependency inclusion is established; EPUB-to-vulnerable-parser reachability is not established. Do not claim an exploit in VoxLeaf without evidence.

V6's immutable source/lock and published artifacts remain historical authority. Its prior live-download failures remain unresolved. All new validation must use normal local PowerShell outside the sandbox. Historical model files may be reused only after their exact bytes match the source manifest; historical test PASS is not candidate acceptance.

## Scope and non-goals

Integration extension: actual publication readback, version-specific authority,
native/current release selectors, retained-V6 ownership, inventory/audit,
documentation and their focused acceptance gates. No transport redesign,
automatic migration, model changes or public installer publication.

Add v7 recipe/hashed lock, generated source manifest, existing builder dispatch/guards, focused regressions, a real-msgpack security probe and preparation commands. Update maintained documentation without rewriting completed plans or old authority. Build an isolated local package and exercise security, legitimate controls and offline ES/EN generation/cancellation. No active selector/installer/transport change, advisory exception, model replacement, automatic migration, full live download, release publication or unrelated refactor.

## Relevant files and documentation

- `AGENTS.md`, `.agents/PLANS.md`, investigate-bug and fix-finding skills, `docs/development/agentic-change-review.md`.
- `docs/product/mvp.md`, architecture overview/system diagram and ADR-0062; completed v6 plan as historical precedent.
- `services/tts/src/voxleaf_tts/release_chatterbox.py`, `packaging/chatterbox_{integrity,authority,sources}.py`.
- New `services/tts/release/profiles/chatterbox-v7/{requirements.in,requirements.lock}` and generated `release/optional/chatterbox/source-manifest-v7.json`.
- New v7 preparation tests/security probe; existing packaging tests and runtime-smoke script; `package.json`.

## Architecture and constraints

V7 extends the existing closed package identities and inherits frozen v3 service/model/Python provenance through v6. Require synchronization with its exact hashed lock before source/output access. Reject acquisition/reconciliation commands for unpublished v7 before they can reach historical authority. Build/probe output uses the security skill's managed temporary storage; retained supplemental evidence is imported through its managed artifact tool. Source/configuration and this plan remain repository files. Generated locks/manifests must come from their generators. No runtime topology or public protocol change is planned.

## Milestones

1. Diagnosis and independent boundary investigation — complete. Current dependency finding and bounded real-library leak reproduced; first-party EPUB reachability remains unproven.
2. Regressions and minimal preparation support — complete. Independent v7 recipe/lock/source and existing-owner dispatch, hash/sync/authority guards, 12 focused cases.
3. Candidate checks and real-library controls — complete. Candidate audit, focused packaging selection, actual packaged security probes and legitimate controls pass.
4. Isolated artifact build and runtime checks — complete. Offline ES/EN and cancellation pass; post-probe full installed/archive/part integrity check passes.
5. Independent candidate/acceptance review — complete for technical local preparation. Security bypass review found no actionable issues; Astra report `CB-V7-PREPARATION-R1-ASTRA-20261027` returned APPROVE with no findings. Its closed 1,389-path identity manifest SHA-256 is `11a705b055763084ed6ba00bbb666a6ee0e2a68f372888bd1f924d3ebf51d7d7`. Only this plan's acceptance/handoff entries were updated afterward; final closeout review reference: `CB-V7-PREPARATION-R2-ASTRA-20261027` (the independent report owns its verdict). Retention/publication/integration remain outside that technical acceptance.
6. Publication handoff — complete. Exact identities below were approved and published under the additional authorization.
7. Authorized retention/publication — complete. Original evidence and package retained under ignored `services/tts/release/optional/chatterbox/dist/v7`; copied identities verified. Non-latest prerelease targets the preparation commit; every public asset was read back before admission.
8. Active V7 integration — complete and independently accepted. Independent version-specific publication authority preserves historical authorities; current native/audit/inventory/resource selectors and exact cleanup-only V6 ownership are updated. Explicit consent, cancellation, failed-acquisition data and old versions remain preserved until explicit removal.
9. Integration validation — complete locally. Focused publication/selector/retained-root regressions, Python/native checks, compiled NSIS fixtures, generated inventory/license checks and production audit pass through the recorded aggregate continuation. Exact local artifact admission, fresh ES/EN execution and native startup pass. Original prepared-V7 security evidence is subject to the scoped identity/reuse assessment below and independent review.
10. Independent integration acceptance — complete. `CB-V7-INTEGRATION-R2-ASTRA-20261027` returned APPROVE for the exact patch, evidence and scoped reuse after the two R1 gaps were resolved. No implementation findings remained; reviewer did not edit or execute tests.
11. PR/CI closeout — complete for integration. Approved integration committed and pushed to existing PR #278; all four fresh hosted checks pass on its exact head. Plan archived with maintained incoming links/indexes. PR remains open; no merge or public installer publication.

## Testing and benchmark strategy

Register v7 commands before execution, following v6: `package:chatterbox-optional:v7:{lock,write-source,check-source,check-local}`, build, `audit:chatterbox:v7`, `test:chatterbox:v7:preparation` and security/baseline probes. Select new pytest cases first for red evidence; then run the packaging selection including v6 preservation, malformed source/lock, no-sync and no-acquisition-fallback controls. Lock compile uses the existing exact no-deps/hash approach with a fixed resolution cutoff.

Run fast format/lint/types before expensive build. Use existing `format:check:python`, `lint:python`, `typecheck:python`, package JSON formatting, `test:python`, `build:python` and `check:evidence` as applicable. No frontend/native source changes are planned; do not rerun unrelated GPU/voice/six-rate/browser/installer matrices. A single existing `check:portable` at final preparation covers foundation integration; preserve failures and continue only affected/unexecuted stages with exact dependency evidence.

Real security probe must exercise both one-shot and streaming malformed-map handling, an alternate error path where feasible, and valid round trips; isolate process lifetime and bound synthetic data. Establish the actual 1.2.1 result rather than manufacturing a vulnerable baseline. Run the same controls on packaged 1.2.3, then existing dependency/runtime security probes and offline ES/EN smoke with the exact built interpreter. Record warnings, toolchain, before/after source identities, artifact hashes and outcomes. No test runs in the managed sandbox count as acceptance.

Integration gate additions: use existing `test:python` selections for new V7 publication authority and active graph assertions; `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` selections for V7 identity and retained-V6 states; existing Node release/lifecycle fixture suite for exact root ownership. Register any new named focused command before use. Run fast format/lint/types and focused tests before native preparation. Generate acquisition records only from actual public GitHub metadata; capture Python licenses from exact core/V7 interpreters through `scripts/release_inventory.py`, then `inventory:release` and `inventory:release:check`. `audit:release` must pass on the actual active V7 graph without exceptions. Run one integration `pnpm.cmd check`; do not repeat passed leaves unless their inputs change. Reuse prior real-library/runtime probes only after copied artifact identity checks and final independent review. No full live 8.24-GB download, voice/GPU/rate matrix or installed-user-data mutation is planned: transport and frozen runtime behavior are unchanged, and existing live-download failures remain a separate unresolved issue. If native integration evidence exposes a new dependency or defect, record a bounded gate expansion before execution.

## Risks and rollback

Advisory range alone does not prove reachability; retain this uncertainty. Long Windows paths need the existing canonical extended-path build route. Preserve all historical outputs and installed/user data; build into a new private output root. If preparation fails, active v6 remains unchanged and CI remains blocked. Do not replace failed evidence, suppress the advisory or mutate a published package. Repeated errors require a concrete diagnosis, not until-green retries. Publication is a separate irreversible action requiring review of the exact parts first.

## Progress log

- 2026-10-27: verified base/branch and clean worktree; read applicable skill/repository guidance and v6 precedent. Started a fresh read-only security-boundary investigator. Prepared managed temporary artifact storage. Approximately 126 GB free at readiness; not a future capacity guarantee.
- 2026-10-27: generated the hashed lock and source manifest through registered commands. Confirmed all 78 other pin/hash sets are byte-equivalent as sets; six reused model files match manifest size/SHA-256. No old validation PASS was promoted to candidate acceptance.
- 2026-10-27: built the isolated runtime once. The embedded interpreter passed msgpack and prior security controls; offline Spanish and English produced bounded finite nonzero PCM and cancelled without network requests or saved audio.
- 2026-10-27: the single portable integration attempt stopped at Python formatting. Corrected only the new test's formatting; executed the failed and remaining stages individually, all passing. Retained the original failure and before/after identities.
- 2026-10-27 continuation: explicit user authorization resolves the destination restriction. Copied original flat receipts/helpers and package/runtime/archive/parts to ignored `dist/v7`, excluding dependency build environment/download cache. First `robocopy` with an extended prefix failed with error 53 / exit 16 before copying; retry with its supported normal absolute path succeeded. Original temporary data remains intact. Copied-package verification is running. Started independent read-only integration-boundary investigation. Preparation commit was pushed to existing PR #278 so the release can target an immutable public commit.

## Discoveries and decisions

- Candidate preparation cannot by itself make the production audit green: the selector must continue describing actual published v6 until v7 publication and integration are authorized.
- Preserve the existing packaging architecture for this correction; installation-recipe/component redesign is deferred.
- Independent investigator traced top-level msgpack use in librosa's trusted bundled interval map (`strict_map_key=False`) and its optional remote citation helper; no first-party call to that helper was established. srsly uses a separate vendored parser, not the upgraded top-level package. Frozen Chatterbox uses local model loading. These facts do not prove an EPUB exploit or remediation of another vendored parser.
- Reviewed the canonical system diagram and ADR-0062. Preparation does not change component boundaries, topology, protocol, models or admission; no new ADR or diagram edit is warranted. Maintained setup/testing/dependency documentation records the candidate distinction.
- The build needs a canonical extended Windows path. Embedded Python subsequently normalizes its path and Transformers import exceeded this host's disabled long-path limit in managed temporary storage. The original dependency probe failed with `FileNotFoundError`; a reversible `subst V:` mapping to the same managed temporary directory allowed the exact same bytes to pass. Mapping removed in `finally`; no alias used for builder containment, no package patch or rebuild. Runtime acceptance here is for that short-path execution environment, not arbitrary long installation paths.
- Expected limitations/warnings retained: four audit URL/CUDA blind spots, existing pytest cache permission warning, Vite chunk-size warning, Diffusers/Torch deprecation warnings and unavailable optional Cangjie mapping in offline ES/EN. The latter did not attempt network access and does not establish Chinese support.

## Final validation results

This section records the preparation phase. Its storage/publication omissions
were real at that time and are superseded only by the separately recorded
authorized integration results below; the historical failures remain evidence.

All commands below ran in normal local PowerShell outside the managed sandbox. Environment: PowerShell 7.6.5, Node v24.20.0, repository-pinned pnpm 11.15.1, uv 0.11.29 and Python 3.12.10. Per-command receipts contain command, exit/timestamps, environment, full before/after path SHA-256/filter-aware blobs and patch snapshots. Originals are in the returned managed temporary directory under `artifacts/v7/`; raw/private host paths stay outside Git. Persistent promotion to standalone collection `artifacts-28d2aebd4bb3642eb9185e580f19351a54e43e96ba39acc8230cac4248aecbe5` is blocked: the storage tool returned `Transport closed` while importing the first 1.9 GB part, then also failed a directory-only readiness call. No successful permanent import is claimed. Keep the original temporary files; OS cleanup can remove them. Resume managed retention or obtain an explicit alternate destination before publication handoff.

| Receipt | Command / check | Actual result |
| --- | --- | --- |
| R1-red | `pnpm.cmd test:chatterbox:v7:preparation -k v7` before implementation | Exit 1: 9 failed, 3 passed, 111 deselected; failures demonstrate missing v7 support. |
| G1-lock / G2-source / G3-source | `pnpm.cmd package:chatterbox-optional:v7:lock`, `:write-source`, `:check-source` | Exit 0 each; generated authority current. |
| R1-green / R1-corrected | `pnpm.cmd test:chatterbox:v7:preparation` | First exit 1: 122 passed, old invalid-version test still used newly valid 7. Changed its invalid input to 8; corrected run exit 0, 123 passed. |
| F1 / L1 / T1 / T1-corrected | `format:python`, `lint:python`, `typecheck:python` | Format/lint exit 0; initial mypy exit 1 (three annotation/re-export/index errors), corrected exit 0, 178 files. Final integration independently covers current source. |
| A1 | `pnpm.cmd audit:chatterbox:v7` | Exit 0: no known advisories in the audited graph; four existing blind spots retained. |
| S1-baseline | `pnpm.cmd test:chatterbox:v7:security:baseline` | Exit 1: real 1.2.1 leaked 33,554,960 measured bytes per integer/float key arm, both one-shot and streaming. Hook arms 0; four legitimate controls passed; network 0. |
| S2-candidate / S3-packaged | `pnpm.cmd test:chatterbox:v7:security` on synchronized environment / final embedded runtime | Exit 0 each: msgpack 1.2.3, all six arms 0 retained bytes, four legitimate controls, network 0. Does not claim coverage of all upstream UAF variants. |
| M1 / M1-corrected | Managed model-verification helper | First dispatch failed because the wrapper's script-root expression was empty; no model check occurred. Explicit helper path succeeded: six exact sizes/hashes match. |
| D1-lock-identities | Managed lock comparison helper | Exit 0: 79 packages; all other 78 pins and permitted hash sets unchanged. |
| B1-build | Configured `uv run --directory services/tts --locked python -m voxleaf_tts.release_chatterbox build --package-version 7 --output-root <canonical-extended-managed-root>` | Exit 0; complete local receipt validates installed contents against archive and ordered parts. |
| B2-final-integrity | Same configured CLI, `check-local --package-version 7 --output-root <canonical-extended-managed-root>` after runtime probes | Exit 0; all installed files, archive entries, ordered parts and local receipt still match; unpublished/unadmitted status explicit. |
| S4-runtime / S5-previous | `pnpm.cmd test:chatterbox:runtime-security`; `pnpm.cmd test:chatterbox:v6:security --temporary-root <managed-root>` on v7 | Exit 0: 3 security + 2 legitimate controls; 5 rejected namespaces + 4 legitimate controls. POSIX exploit not applicable to Windows. |
| S6-dependency / S6-short-path | `pnpm.cmd test:chatterbox:dependency-security` on v7 | Initial long-path import exit 1 retained; same bytes via short mapping exit 0: 7 security cases, network 0. |
| P1-es / P2-en | `pnpm.cmd test:chatterbox:runtime-smoke --package-version 7 --models <verified-local-models> --language es` / `en` | Exit 0 both: 3.96 / 3.24 seconds bounded PCM; cancellation 406 / 297 ms; load/warm 31.032 / 20.594 s; network 0, audio files 0. Synthetic smoke is not a full performance/quality acceptance matrix. |
| I1-portable | `pnpm.cmd check:portable` | Exit 1 at new Python test formatting, after evidence guard, 13 guard tests and TypeScript formatting passed. |
| F2 / I1-remaining | `pnpm.cmd format:python`; then `format:check:python`, `lint:typescript`, `lint:python`, `typecheck`, `test:typescript`, `test:python`, `build:portable` | Exit 0: one test reformatted; remaining stages all pass. Shared 209, EPUB 680, desktop 854 + Node 101, Python 660; frontend and Python artifacts built. The original full invocation remains a failure, not relabeled PASS. |

Reuse: historical v6 model files were reread and verified before use, and historical frozen source/lock identities are explicit inputs. Historical runtime/CI/installer test passes are not candidate evidence. I1's already-passed evidence and TypeScript formatting stages retain their original receipts; the only intervening source change was Python test formatting, with no changed input to those stages. Build inputs stayed unchanged during construction; later maintained documentation and test formatting do not affect the runtime closure. Final source-identity comparison records these differences explicitly.

Omissions: no new model downloads, GPU/voice/rate matrix, browser/native/installer campaign, full live acquisition or production audit rerun. There are no frontend/native implementation changes in this preparation, and active production still selects the known-affected v6. Existing v6 live-download timeouts remain unresolved and outside this dependency correction. No publication, integration, installed-v7 acceptance or green production CI is claimed.

## Prepared artifact identities and handoff

Runtime archive: 5,031,363,541 bytes, SHA-256 `39dc073e01a5f02ce95b44e23b1024c3062ad1394fce3c917ec113fa45881aaf`; 13,092 installed files / 5,027,805,469 bytes. Runtime-manifest SHA-256: `48b392d82e9937e369170fd5c816b7a4ad766009f8816739441dddbd076c5d8a`.

| Proposed asset for `chatterbox-runtime-v7` | Bytes | SHA-256 |
| --- | ---: | --- |
| `voxleaf-chatterbox-runtime-v7.zip.part-001` | 1,900,000,000 | `0a37672637556b34fd4e952443f1ff32a58d65de72c6be31b205c533e9967774` |
| `voxleaf-chatterbox-runtime-v7.zip.part-002` | 1,900,000,000 | `108e735e74112a7c0cb83ec6e082ffdf9e0e99923fa646cb692d128f0f994711` |
| `voxleaf-chatterbox-runtime-v7.zip.part-003` | 1,231,363,541 | `ca14f2f143b5499eb12b606e1a894ddcaf9d6a3ae225fca131c7e2d0a13d2f4e` |

Next boundary: retain the verified parts and original evidence after resolving the storage-tool failure, then obtain authorization for publication as a non-latest prerelease and subsequent integration. Integration requires new acquisition/native/audit/inventory authority and relevant tests; it cannot be represented as already complete by this preparation. Do not merge or publish an installer. Keep this plan active.

## Authorized publication and integration results

The preceding handoff is historical. On 2026-10-27 the user authorized and the
agent completed retention and publication. Local `dist/v7` now contains the
runtime tree, ZIP, three parts, build receipt and original evidence/helpers.
Original temporary storage was preserved. `C1-retained-package` ran
`pnpm.cmd package:chatterbox-optional:v7:check-local`, exit 0, verifying the
copied runtime, archive and all ordered parts. Part hashes were checked again
before uploading; no package rebuild or model download occurred.

Published prerelease: <https://github.com/mmjosedaniel/voxleaf/releases/tag/chatterbox-runtime-v7>,
release ID `425862980`, target `a74fc85be0c93fe7abdecbfcaf633ecd6cf1a569`,
published `2026-10-27T19:05:33Z`. GitHub readback confirmed all three exact
sizes/digests, public uploaded state, prerelease status and unchanged latest
release. An initial draft-by-tag API lookup returned 404; listing releases
resolved the existing draft ID without creating another release. The original
draft/public readbacks and release notes are retained under `dist/v7/evidence`.

New host receipts use the same toolchain and before/after source identity
format as preparation. They reside in `dist/v7/evidence`; no raw host paths,
private text, audio, logs or package binaries are added to Git.

| Receipt | Actual result |
| --- | --- |
| I2-red-python / I2-red-python-corrected | Initial pytest argument used the wrong working-directory-relative path: exit 4, no tests. Correct invocation: one expected failure, six deselected, active graph still V6. |
| I2-red-rust | New successor identity expectation failed with actual 6 versus expected 7. |
| I3-python / I3-corrected | First focused selection: 138 passed, one failure exposing inherited `cb/6` layout. Corrected V7 authority: 28 V7 authority/preparation tests pass. |
| I5-quality-python | Python lint and mypy pass, 180 files. |
| G4-acquisition | Registered V7 writer and acquisition checker exit 0 using actual public release readback. |
| G5-licenses-inventory / G6-dated-inventory | Exact core/V7 interpreter license capture and inventory generation/check pass. Only license package-version change is msgpack 1.2.1 to 1.2.3. |
| I6-native | Focused native selection: 49 passed, 2 intentionally ignored, 78 filtered; exit 0. |
| A2-production | `pnpm.cmd audit:release` exit 0: all active graphs pass; four existing Chatterbox URL/CUDA blind spots and Rust informational notices remain. Audit date advanced only after this pass. |
| I8-integration | Single `pnpm.cmd check` exit 1 at audit-policy JSON formatting, after evidence guard and 13 guard tests pass. |
| I8-policy-format / I8-remaining | JSON format corrected; format checks and TypeScript lint pass. Rust lint fails on the explicit constant release-feature assertion in the opt-in test. |
| I9-remaining | First lint annotation was attached to a macro invocation and ignored; exit 1 retained. Moved it to the test function; assertion and executable behavior unchanged. |
| I10-remaining | Rust/Python lint and all type checks pass. Shared 209, EPUB 680 and desktop 854 pass. Node 100 pass / 1 fails: the ordinary-host guard still contained V6 byte totals. Updated its three V7 totals and added retained-V6 identity to its rejection cases. |
| I11-remaining | Corrected ordinary-host selection: 13 pass; JS formatting/lint pass. Default Rust: 126 pass, 3 ignored. Release-feature link failed with LNK1104 because R7 still owned that executable. Preserve this scheduling failure; retry only that configuration after R7 exits. |
| I12-python-build | Python: 675 pass, one fails because inventory assertion still referenced historical V6 lock. Changed that explicit expected lock to current V7; inventory bytes were already correct. Build was not reached. |
| I13-python-build | Exact dependency/inventory selection: 7 pass; Python format/lint/mypy pass. `pnpm.cmd build` passes, including optimized native executable and Python sdist/wheel. |
| R7-local-admission | `pnpm.cmd test:chatterbox:v7:local-admission` with explicit existing part/model paths: exit 0, one opt-in test passes in 820.29 s. All nine artifacts verified; production native reassembly/extraction/admission, rediscovery, ES/EN execution, post-probe integrity and explicit owned removal pass. Synthetic retained-V6 sentinel survives acquisition and is removed only explicitly; unrelated sentinel survives. |
| N2-native-startup | `node apps/desktop/scripts/native-startup-smoke.mjs`, the configured startup leaf after I13's unchanged build: exit 0. WebView2 reader/restoration and bounded fake-service lifecycle pass, no external requests. No second build needed. |
| I14-release-rust | Release-feature Rust configuration after R7 exits: 125 passed, 3 ignored, exit 0. The ignored tests are explicit host/child opt-ins; R7 is separately executed above. |

R7 used a fresh temporary data root, never the user's installed package root.
It read and hash-verified the existing six models, made local copies through a
fail-closed test download hook and exercised real native admission. ES/EN
produced 3.84/3.68 seconds of finite bounded PCM, cancellation 390/343 ms,
load/warm 35.172/24.453 s, network attempts 0 and saved audio 0. These timings
describe this synthetic smoke with concurrent checks, not a performance matrix.
The prior installed V6 and user library/preferences were not modified.

The constant-feature assertion annotation changes lint handling only. Its
runtime assertion remains identical to the source used by the in-progress
exact local replay. The full native acquisition implementation, manifests,
parts, smoke helper and models were not edited during that replay.

An editing-tool default encoding mismatch temporarily affected three UTF-8
files. Their UTF-8 text was restored before acceptance; no intentional Spanish
or unrelated content changes are part of the patch.

Pending gates at this entry: independent review and hosted CI. Later entries record their actual
outcomes. No prior green CI is attributed to this integration.

Scoped reuse proposal for independent assessment: original S3/S4/S5/S6 security
probe receipts apply to the identical retained runtime and unchanged probe
sources; C1 verifies copied contents, and R7 independently verifies every input
artifact and admitted tree. Fresh R7 supersedes preparation ES/EN smoke for
current installed acceptance. A2's graph/locks/scanner inputs remain identical;
only audit-date metadata/JSON whitespace changed afterward, with G6 inventory
verification. Failed aggregates remain failures: I8 supplies unchanged guard
leaves, I10 the unaffected Vitest/Node cases and type/lint leaves, I11 the
corrected 13-case Node owner and default Rust, I12 the unaffected Python cases,
I13 the corrected seven-case Python owner plus current build, I14 release Rust,
and N2 current native startup. R7's only test-source change while running was
the lint-only constant-assertion annotation, not its executable logic. Full
before/after path identities, environment and exact changed-path comparisons
are retained in `integration-reuse-comparison.json`; reuse is not a new run or
transfer of a historical approval.

Integration omissions: no full live HTTP acquisition, model download/rebuild,
GPU/voice/rate matrix, signed/public installer or user-installation campaign.
Existing V6 full-delivery timeouts remain unresolved. The active selector and
ownership changes are covered by real local admission and compiled NSIS
fixtures. No frontend production code changed in V7 integration; NCC browser
evidence remains its original scope, while hosted Windows CI runs its browser
suite afresh. Native startup was run because native admission changed. Four
dependency-audit blind spots remain explicit; no advisory exception was added.

### Exact-input review follow-up

`CB-V7-INTEGRATION-R1-ASTRA-20261027` returned **BLOCKED**, without implementation
findings. It accepted the other scoped reuse decisions but required two fresh
receipts: R7's test file had acquired a lint-only attribute, and the Windows
release consumer imported the ordinary-host guard changed after I10. Its
immutable 1,396-path manifest SHA-256 is
`e5d5db35da9acc1ea4b5613c621d6c1d2e3442ac157adf98340086557cd5c5dd`.
The static equivalence of R7 was not treated as final execution evidence.

With all tracked sources frozen, both requested selections ran in host PowerShell:

- `R8-exact-final-admission`: the configured local-admission command with the same
  verified parts/models, exit 0, one test passes in 766.58 s. Native admission,
  rediscovery, ES/EN, post-probe integrity and explicit removal all pass. ES/EN:
  4.20/3.28 seconds PCM, cancellation 407/344 ms, load/warm 32.125/21.953 s,
  network attempts 0, audio files 0. This supersedes R7 for final test identity.
- `R9-windows-consumer`: `node --test apps/desktop/scripts/windows-release.node-test.mjs`,
  exit 0, 22 passed with the final transitive import, including compiled NSIS and
  lifecycle ownership/failure controls. This supersedes that portion of I10.

Both before/after source snapshots are retained. Only this plan's factual
follow-up was edited after these runs. No production/test source, package,
model, dependency or environment correction was needed. The next independent
exact-patch review is `CB-V7-INTEGRATION-R2-ASTRA-20261027`; its report owns the
verdict. Commit/push requires APPROVE, and hosted CI remains a subsequent gate.

### Integration commit and hosted acceptance

R2 returned **APPROVE** with no pending findings. Its immutable manifest SHA-256
is `6d1fb7d91c1a9fd92ba0f0c4f4bb8228f5749ccb627954641fd625f697aabd3f`.
The 1,396 source identities were rechecked before staging; all 40 staged paths
and filtered Git blobs matched the approval. A first precommit guard stopped on
PowerShell-versus-Git sorting order, not different membership; exact set and
blob checks resolved this without discarding or changing any staged content.
Staged diff/evidence checks passed.

Integration commit `5695f4ed4a52885e6d6aa03976d23b5c34defde8` was pushed to
[PR #278](https://github.com/mmjosedaniel/voxleaf/pull/278); worktree and index
were clean at that checkpoint. The GitHub connector returned 403 editing PR
metadata; authenticated `gh pr edit --body-file` succeeded. The title and body
now describe NCC corrections plus V7 and retain validation failures/limits.

Fresh hosted runs for this head:
[Foundation checks 40572573748](https://github.com/mmjosedaniel/voxleaf/actions/runs/40572573748)
and [Release dependency audit 40572573753](https://github.com/mmjosedaniel/voxleaf/actions/runs/40572573753).
Both started; all four jobs are pending/in progress at this entry. The earlier
preparation-head audit failure is preserved, not attributed to this new head.

Final readback supersedes that in-progress entry: both workflows completed
successfully for `5695f4ed4a52885e6d6aa03976d23b5c34defde8`; PR head readback
matches. Original connector responses are retained in
`dist/v7/evidence/CI-integration-5695f4e.json`.

| Hosted check | Job | Final result |
| --- | --- | --- |
| Production dependency graphs | 122430391268 | PASS, including exact graph audit and inventory verification |
| Ubuntu portable foundation | 122430391448 | PASS |
| Ubuntu Rust foundation | 122430391994 | PASS |
| Windows native foundation | 122430391956 | PASS, including browser, packaged WebView2 startup and the full foundation aggregate |

This fresh hosted aggregate is separate from the local failed aggregate and its
approved continuation; no failure was relabeled. The final archive/index/link
patch changes documentation only and preserves every validated executable
input. Its independent exact-patch closeout reference is
`CB-V7-CLOSEOUT-R3-ASTRA-20261027`; that report owns its verdict. Any subsequent
documentation-commit CI is recorded in the PR and retained receipts rather than
rewriting this immutable historical implementation acceptance.

Outcome: the production graph no longer selects affected V6 msgpack. The same
reviewed V7 parts are publicly available and preserved locally; no new package
build was introduced during integration. Explicit acquisition is still required
for an existing user installation. Remaining limitations are the four audit
blind spots and historical complete-live-delivery timeouts; this correction
does not claim to resolve them. No further in-scope implementation or acceptance
work remains after the referenced documentary closeout approval.
