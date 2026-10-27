# Chatterbox v7 msgpack security refresh

## Goal

Prepare a distinct, verified `voxleaf-chatterbox-v7` runtime with msgpack 1.2.3 to address the dependency finding CVE-2026-114613 / GHSA-j586-36cw-2gc2. Preserve the other 78 package pins, frozen service modules, Python/Torch/CUDA and all six model identities. Use the existing packaging design rather than a new on-device installer architecture.

Authorization on 2026-10-27: the user selected creating v7 after reviewing the CI finding and alternatives. Preparation and local validation are authorized; publication of the exact artifacts awaits separate approval. Existing PR #278 commit/push authorization applies to reviewed source work, not release assets, merge or installer publication. Base: `fac93a68aa83afdf43c15cade083e809d79df073`, branch `codex/narration-chatterbox-correctness`, clean worktree/index at entry.

## User-visible outcome

Preparation produces a reviewable local runtime and release parts. Active acquisition and production audit continue selecting v6 until a separately approved publication and integration. A passing candidate audit is not remediation of existing downloaded v6. Later explicit v7 acquisition must retain local inference, bounded ephemeral audio, cancellation, ES/EN behavior and user-data preservation.

## Current state

PR #278's three foundation checks pass at the base commit. The production graph audit fails on unchanged v6 `msgpack==1.2.1`. Local `pnpm.cmd audit:chatterbox:v6` reproduced exit 1, one finding, and four existing URL/CUDA blind spots. The advisory database expanded the listed range to `<1.2.3`; upstream's reproduction describes 1.2.2 and acknowledges uncertainty about the earliest affected release. Dependency inclusion is established; EPUB-to-vulnerable-parser reachability is not established. Do not claim an exploit in VoxLeaf without evidence.

V6's immutable source/lock and published artifacts remain historical authority. Its prior live-download failures remain unresolved. All new validation must use normal local PowerShell outside the sandbox. Historical model files may be reused only after their exact bytes match the source manifest; historical test PASS is not candidate acceptance.

## Scope and non-goals

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
6. Publication handoff — pending. Record exact artifact identities and concrete publication proposal. Keep plan active while publication/integration are outstanding.

## Testing and benchmark strategy

Register v7 commands before execution, following v6: `package:chatterbox-optional:v7:{lock,write-source,check-source,check-local}`, build, `audit:chatterbox:v7`, `test:chatterbox:v7:preparation` and security/baseline probes. Select new pytest cases first for red evidence; then run the packaging selection including v6 preservation, malformed source/lock, no-sync and no-acquisition-fallback controls. Lock compile uses the existing exact no-deps/hash approach with a fixed resolution cutoff.

Run fast format/lint/types before expensive build. Use existing `format:check:python`, `lint:python`, `typecheck:python`, package JSON formatting, `test:python`, `build:python` and `check:evidence` as applicable. No frontend/native source changes are planned; do not rerun unrelated GPU/voice/six-rate/browser/installer matrices. A single existing `check:portable` at final preparation covers foundation integration; preserve failures and continue only affected/unexecuted stages with exact dependency evidence.

Real security probe must exercise both one-shot and streaming malformed-map handling, an alternate error path where feasible, and valid round trips; isolate process lifetime and bound synthetic data. Establish the actual 1.2.1 result rather than manufacturing a vulnerable baseline. Run the same controls on packaged 1.2.3, then existing dependency/runtime security probes and offline ES/EN smoke with the exact built interpreter. Record warnings, toolchain, before/after source identities, artifact hashes and outcomes. No test runs in the managed sandbox count as acceptance.

## Risks and rollback

Advisory range alone does not prove reachability; retain this uncertainty. Long Windows paths need the existing canonical extended-path build route. Preserve all historical outputs and installed/user data; build into a new private output root. If preparation fails, active v6 remains unchanged and CI remains blocked. Do not replace failed evidence, suppress the advisory or mutate a published package. Repeated errors require a concrete diagnosis, not until-green retries. Publication is a separate irreversible action requiring review of the exact parts first.

## Progress log

- 2026-10-27: verified base/branch and clean worktree; read applicable skill/repository guidance and v6 precedent. Started a fresh read-only security-boundary investigator. Prepared managed temporary artifact storage. Approximately 126 GB free at readiness; not a future capacity guarantee.
- 2026-10-27: generated the hashed lock and source manifest through registered commands. Confirmed all 78 other pin/hash sets are byte-equivalent as sets; six reused model files match manifest size/SHA-256. No old validation PASS was promoted to candidate acceptance.
- 2026-10-27: built the isolated runtime once. The embedded interpreter passed msgpack and prior security controls; offline Spanish and English produced bounded finite nonzero PCM and cancelled without network requests or saved audio.
- 2026-10-27: the single portable integration attempt stopped at Python formatting. Corrected only the new test's formatting; executed the failed and remaining stages individually, all passing. Retained the original failure and before/after identities.

## Discoveries and decisions

- Candidate preparation cannot by itself make the production audit green: the selector must continue describing actual published v6 until v7 publication and integration are authorized.
- Preserve the existing packaging architecture for this correction; installation-recipe/component redesign is deferred.
- Independent investigator traced top-level msgpack use in librosa's trusted bundled interval map (`strict_map_key=False`) and its optional remote citation helper; no first-party call to that helper was established. srsly uses a separate vendored parser, not the upgraded top-level package. Frozen Chatterbox uses local model loading. These facts do not prove an EPUB exploit or remediation of another vendored parser.
- Reviewed the canonical system diagram and ADR-0062. Preparation does not change component boundaries, topology, protocol, models or admission; no new ADR or diagram edit is warranted. Maintained setup/testing/dependency documentation records the candidate distinction.
- The build needs a canonical extended Windows path. Embedded Python subsequently normalizes its path and Transformers import exceeded this host's disabled long-path limit in managed temporary storage. The original dependency probe failed with `FileNotFoundError`; a reversible `subst V:` mapping to the same managed temporary directory allowed the exact same bytes to pass. Mapping removed in `finally`; no alias used for builder containment, no package patch or rebuild. Runtime acceptance here is for that short-path execution environment, not arbitrary long installation paths.
- Expected limitations/warnings retained: four audit URL/CUDA blind spots, existing pytest cache permission warning, Vite chunk-size warning, Diffusers/Torch deprecation warnings and unavailable optional Cangjie mapping in offline ES/EN. The latter did not attempt network access and does not establish Chinese support.

## Final validation results

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
