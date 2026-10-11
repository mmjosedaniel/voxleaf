# TTS adapter layout and runtime package continuity

Status: complete. Independent implementation acceptance, exact firewall cleanup
and independent documentary review PASS. IPV6-POSTCHANGE-02 freshly passes all
three baseline commands and22 campaign gates, copied-provider proof, four
candidate and four desktop arms, with full identities unchanged. The accepted
patch is IPV6-CHANGE-PACKET-02:35 paths,272/450 incremental IPv6 lines,
3669/3900 full-unit additional lines. Prior FAIL reports remain immutable.
The denied urllib3 probe is classified separately, never permitted to execute.
Chatterbox v4 stays local/unpublished/unadmitted; the application retains v3.
Source/artifact writers are idle and the index remains empty.
Prepared on 2026-10-10. Working branch: `codex/tts-adapter-layout`, created from
local `main` at `8fac7086902e203bf3792d569b30edade37896cf`.

## 1. Goal

Group the concrete Python TTS engines under one `adapters/` package while
preserving their responsibilities, local execution and service contracts.
Complete the import and runtime-package migration together: changing a source
path must not silently invalidate an admitted package or its provenance.

This is a cross-milestone maintenance plan, not a new product milestone. The
preceding [service organization campaign](../completed/tts-service-organization.md)
is complete and does not authorize changes to runtime payloads under its old
acceptance reports.

## 2. User-visible outcome

Readers retain the same voices, language/profile identities, cancellation,
playback, privacy and installation behavior. Contributors find concrete engine
implementations together and can still start the existing service modules.

The implementation produces a freshly verified Piper core and a local
Chatterbox v4 candidate. Ordinary Chatterbox acquisition remains on the admitted
v3 package. A local v4 build does not mean v4 is published, downloadable or
admitted by the desktop. That subsequent release transition is separate work.

## 3. Current state

At the base commit, `services/tts/src/voxleaf_tts` has 19 tracked Python files:
13 at its root, four in `packaging/` and two in `generated/`.

| Target | Observed responsibility | Planning disposition |
| --- | --- | --- |
| `piper_adapter.py` (510 lines) | CPU engine admission, voice selection and bounded PCM conversion | Candidate move to `adapters/piper.py`; preserve implementation |
| `chatterbox_adapter.py` (405 lines) | Exact local multilingual engine and bounded synthesis | Candidate move to `adapters/chatterbox.py`; package migration required |
| `qwen_adapter.py` (489 lines) | Development-only Qwen engine and profile admission | Candidate move to `adapters/qwen.py`; no promotion of Qwen |
| `fake_engine.py` (210 lines) | Deterministic engine used by the default service and tests | Candidate move to `adapters/fake.py`; retain in runtime closures |
| `engine.py`, `protocol.py`, `service.py` | Engine contracts, framed transport and service lifecycle | SKIP directory relocation; only `service.py` needs an import update |
| `piper_service.py`, `chatterbox_service.py`, `qwen_service.py` | Stable module entrypoints | Keep paths; update their adapter imports |
| `release_core.py`, `release_chatterbox.py`, `packaging/` | Maintainer assembly, integrity and release authority | Adjust only the package consequences of this migration |
| `generated/` | Shared-contract generated Python schemas | Excluded from manual changes; retain exact location and bytes |

Line counts describe the inspected snapshot, not limits or reasons to split
engine logic further. Tests are already independent under `services/tts/tests`.

The read-only audit `PY-RUNTIME-LAYOUT-01` found no concrete reason to create a
`runtime/` package for the service, protocol and engine contracts. The audit
`PY-CHATTERBOX-ADAPTER-LAYOUT-PLAN` blocked a standalone adapter move because:

- Chatterbox's `runtimeModules` lists are literal source and destination paths.
  Its v3 authority currently hashes the live root adapter and service while
  retaining fixed hashes of published archives.
- `PackageLayout` supports only v2/v3; its non-v2 output directory is literally
  `dist/v3`. Extending a version type alone would collide with existing output.
- Piper copies an installed local package, excludes root-level dormant adapter
  paths, and embeds a root-level Piper import in its offline smoke script.
  Its exact runtime manifest changes when runtime code moves.

Those findings are prerequisites for this plan, not accepted implementation
work orders. The clean starting branch and empty index were verified; no source
changes or test executions were performed while preparing the plan.

## 4. Scope and non-goals

In scope:

- The four moves, one empty `adapters/__init__.py`, direct import consumers and
  tests of the actual service/distribution boundaries.
- Piper inclusion/exclusion and smoke updates, followed by generator-produced
  current runtime manifest and package evidence from a fresh build.
- Explicit historical Chatterbox source selection and an isolated, local-only
  v4 build using the unchanged v3 dependency lock and model revisions.
- Maintainer command registration, provenance documentation and independent
  before/after validation of the complete migration.

Out of scope: another folder layer per provider; a generic adapter registry,
factory or `utils` package; dividing adapter internals merely by line count;
moving tests, benchmarks, protocol, service owners or generated schemas;
dependency upgrades; changes to protocol v1, narration, model admission,
performance thresholds, voice settings or product UI; publishing or activating
Chatterbox v4; rewriting historical evidence or completed plans.

The 2026-10-10 execution request authorizes local implementation, artifact
preparation, independent validation and documentation on the existing branch.
Staging, commits, pushes, pull requests and package publication are explicitly
excluded. Do not add checkpoints by committing.

## 5. Relevant files and documentation

Read before execution:

- [Project documentation index](../../README.md), [MVP](../../product/mvp.md),
  [roadmap](../roadmap.md), [system diagram](../../architecture/system-diagram.md)
  and [architecture overview](../../architecture/overview.md).
- [ADR-0016](../../architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md),
  [ADR-0051](../../architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md),
  [ADR-0052](../../architecture/decisions/ADR-0052-admit-security-refreshed-chatterbox-v3.md)
  and [ADR-0054](../../architecture/decisions/ADR-0054-refresh-piper-engine-and-phonemizer.md).
- [Implemented service map](../../development/tts-service-organization.md),
  [testing](../../development/testing.md),
  [evidence retention](../../development/evidence-retention.md),
  [release guidance](../../development/release-security-and-distribution.md),
  `AGENTS.md`, `.agents/PLANS.md`, and both safe-refactor skills and references.

The starting impact inventory is below. It is not permission for arbitrary
edits beneath these directories. The auditor must freeze exact paths, including
both sides of each move, before the work order is issued.

| Area | Paths to inspect or include in the bounded order |
| --- | --- |
| Runtime source | The four old adapter/engine paths and five proposed `adapters/` files; `service.py` and the three `*_service.py` files |
| Packaging source | `services/tts/src/voxleaf_tts/release_core.py`, `release_chatterbox.py`, `packaging/chatterbox_authority.py`, `packaging/chatterbox_integrity.py`; a small `packaging/chatterbox_sources.py` only if needed for the two historical source consumers |
| Existing Python tests | `services/tts/tests/test_piper_adapter.py`, `test_chatterbox_adapter.py`, `test_qwen_adapter.py`, `test_service.py`, `test_release_core.py`, `test_release_chatterbox.py` |
| New behavioral coverage | Focused source-provenance, isolated-import and payload-closure cases alongside those suites; freeze any new test filename before editing |
| Current Piper generated outputs | `services/tts/release/core/runtime-manifest-v1.json` and `core-package-evidence-v1.json`, written only by the existing builder |
| New Chatterbox source recipe | Proposed `services/tts/release/optional/chatterbox/source-manifest-v4.json`; never replace v2/v3 recipes |
| Commands and guidance | Root `package.json`, `docs/development/tts-service-organization.md`, this plan and the documentation indexes |

Inspect these consumers without presuming edits are necessary:
`apps/desktop/src-tauri/src/tts_service_supervisor.rs`,
`tts_release_core.rs` and its `tests.rs`, `tts_optional_chatterbox.rs`,
`apps/desktop/scripts/windows-release.mjs`,
`ordinary-chatterbox-release-host.mjs`, `scripts/build-windows-release.ps1`,
`scripts/release_inventory.py`, both `.github/workflows/` files and
`packages/shared/scripts/generate-contracts.mjs`.

Inventory tracked imports, string module names, subprocess targets, monkeypatch
targets, source-file probes and package file lists. Search `piper_adapter`,
`chatterbox_adapter`, `qwen_adapter` and `fake_engine`; do not search through
ignored environments, model caches or runtime distributions. Historical
references are not active consumers to rewrite.

## 6. Architecture and constraints

### Proposed source layout

```text
services/tts/src/voxleaf_tts/
  __init__.py
  engine.py
  protocol.py
  service.py
  piper_service.py
  chatterbox_service.py
  qwen_service.py
  adapters/
    __init__.py
    piper.py
    chatterbox.py
    qwen.py
    fake.py
  release_core.py
  release_chatterbox.py
  packaging/                 # existing maintainer helpers; focused additions only
  generated/                 # unchanged generated contract modules
```

Keep `adapters/__init__.py` empty. Adapters depend on the existing engine and
protocol contracts through parent-relative imports; those contracts do not
import concrete adapters. Importing the service or one provider must not import
another provider or require its optional libraries. Preserve lazy imports,
exception identities relied on by callers, exact environment configuration and
provider-specific Windows path handling.

Keep `voxleaf_tts.service`, `voxleaf_tts.piper_service`,
`voxleaf_tts.chatterbox_service`, `voxleaf_tts.qwen_service` and both release
module entrypoints. The old adapter import paths are internal migration targets;
verify that assumption against tracked consumers. An undiscovered supported
external import contract requires a revised order, not silent removal. Do not
retain forwarding files just to make a cosmetic folder while maintaining two
layouts indefinitely.

Privacy, one active inference child, bounded frames/queues/PCM, stale-result
rejection, cancellation and memory-only generated audio are invariants. EPUB
admission and narration preparation remain unchanged; no real book contents
belong in tests or receipts. Approximately 15 seconds of buffered audio remains
an audio lead, not an imposed wall-clock wait.

### Piper: regenerate the current package, preserve historical evidence

Piper core v1 is the current rebuildable package authority; ADR-0054 already
records refreshes of its executable bytes. Its exact identity includes manifest
and archive hashes, not just the `v1` filename. This plan keeps its package and
profile IDs, source recipe, dependency lock, voices and notices unchanged.

Update the dormant-code exclusions to cover `adapters/chatterbox.py` and
`adapters/qwen.py`, retaining the corresponding service exclusions and all
existing exclusions. Include `adapters/__init__.py`, `adapters/piper.py` and
`adapters/fake.py`; preserve the generated protocol closure. Update the offline
smoke import. Prove that similarly named legitimate siblings still copy.

Use `package:piper-core:write-manifest` only after the reviewed source patch and
new closure tests are ready. It creates fresh current manifest/package evidence;
do not hand-edit hashes or claim old installer/performance results validate the
new bytes. Preserve the original identities in the baseline receipt and retain
the old local package safely until rollback is no longer needed. Rebuild native
consumers that embed the manifest before exercising the new package.

The current writer is not a transaction across both tracked outputs: it writes
the runtime manifest during staging, before the bilingual smokes and package
evidence. Before running it, save the exact previous bytes of both tracked
outputs and the previous verified local payload in ignored recovery storage.
If any later step fails, record the failure, restore only those worker-owned
outputs from the captured bytes and recover the previous payload; verify their
original identities before retrying. Never accept a new manifest paired with
old evidence or broaden this task into a builder lifecycle rewrite.

### Chatterbox: immutable v2/v3 and a separate local v4

Historical builds/checks must resolve their original runtime bytes independently
of the new live tree. Candidate provenance anchors already recorded in the
repository are v2 build commit `814fd2f70bd3588d31022207eb976c0ff93712a3`
and v3 build commit `998c7b24cda7e969e9ed0344f348506bf38af3b0`.

Before moving any file, prove that those commits contain the full expected
module sets and that the raw bytes match the frozen adapter/service hashes and
available runtime manifests. Preserve v2's documented generated-module
correction separately; do not retrofit it into the original archive identity.
If a provenance binding cannot be established, report BLOCKED before source
migration. Never fall back to current sources or guessed hashes.

Implement a small, closed maintainer-only source resolver shared by historical
copying and authority validation. It reads verified raw Git blobs for the fixed
versions and exact allowed paths, without checking out over the worktree,
executing historical code, rewriting text or downloading automatically. Missing
history, a missing module or a mismatched hash fails explicitly. Do not require
Git inside a packaged service. Keep unit fixtures self-contained; verify the
real repository binding separately. Document the full-history prerequisite for
maintainer checks and inspect CI before introducing that prerequisite there.
Resolve and verify historical sources before environment synchronization or
output mutation. Both the legacy CLI and `build_package` keep v2 as the default.

For proposed v4:

- Add a distinct layout, source recipe and `dist/v4` staging/environment/output
  paths. Reuse the exact `profiles/chatterbox-v3/requirements.lock`; do not
  resolve a new dependency graph.
- Audit every version branch, including synchronization and notices: today
  `--require-hashes` and the Tokenizers licence are v3-only branches. V4 must
  retain both guarantees, the safe-loader checks and the same licence closure;
  simply extending the accepted version literal is insufficient.
- Explicitly include `__init__.py`, `engine.py`, `protocol.py`, `service.py`,
  `chatterbox_service.py`, `adapters/__init__.py`, `adapters/chatterbox.py`,
  `adapters/fake.py` and both existing `generated/` modules. Do not include
  Piper/Qwen implementations or maintainer tooling.
- Derive new runtime-manifest, archive, part and source identities from actual
  local outputs. Mark local receipts unpublished and unadmitted; do not emit
  download URLs or copy v3 publication, timing or hardware results into them.
- Preserve all existing v2/v3 authority files. In particular,
  `runtime-package-evidence-v4.json` already describes package v3: evidence
  schema/file numbering is not the next package number. Never overwrite it.
- Keep existing default/v3 command meanings and active native v3 admission.
  Do not silently redirect an old package command to the new payload.

No ordinary-build v4 resources, installed path, native admission hash or release
tag is promoted by this campaign. If maintaining package continuity proves more
costly than the organizational benefit, stop at the prerequisite gate with the
evidence and a revised recommendation; do not leave a partially moved tree.

### Execution ownership

Use the safe-refactor director, one reusable `clean_code_auditor`, one
`clean_code_worker`, and one `refactor_validator`; reuse the Git steward only for
authorized Git work. Keep the specified Sol/Astra roles and concurrency limits.
The director authors coordination documentation; only the worker writes source.
Source writing, validation and Git mutation never overlap.

Treat the runtime/import/package migration as one atomic acceptance unit. The
exception to the normal small-file unit is justified by the shared service/fake
imports, exact package closures and authority checks: accepting only the moves
would leave a broken distributable. Milestones below are ordered work inside
that unit, not permission to accumulate independently accepted dirty patches.
The auditor must approve the closed scope and diff ceiling and the validator
must establish a passing baseline before the immutable work order is issued.

Every code, test, configuration and generated-output path in that order must
start clean; absent new files are recorded as ABSENT. Existing plan/index edits
are coordination work outside the source-unit baseline, preserved and reviewed
separately. At most two correction loops are allowed before redesigning the
order. No failed patch carries into another unit. Retain immutable report IDs,
HEAD and exact path identities; any drift needs revalidation, not refreshed
approval hashes. Missing roles or required host evidence means BLOCKED.

## 7. Milestones

### Milestone 1: Freeze the migration and its baseline

Status: complete. Audit and deterministic baseline accepted; renewed host
prerequisite report `TTS-ADAPTER-LAYOUT-01-HOST-PREREQUISITES-20261011-03` PASS.
The initial Windows Error 5 report remains historical. Work order
`TTS-ADAPTER-LAYOUT-01-WO-01` is frozen at the unchanged HEAD and baseline.

Recheck branch/HEAD/index, audit every target and complete the consumer inventory.
Resolve historical byte provenance, Piper current-authority handling and
package directory isolation before authorizing any move. Inspect configured
host runners to identify which exercise fresh candidate bytes and which only
exercise the still-admitted Chatterbox v3. Freeze exact paths and commands,
including any required focused local-candidate runner. Record SKIP/EXCLUDED
targets explicitly. Take baseline source, package and protected-authority
identities and run the existing deterministic/package checks in section 8.

Acceptance: an accepted Audit Packet, a PASS baseline report and one bounded
Approved Work Order. An unresolved release/provenance prerequisite is BLOCKED,
not a rationale to weaken a check. Do not claim unavailable cached packages or
hardware gates passed.

### Milestone 2: Implement imports and package continuity together

Status: implementation and subsequent authorized audit-policy redesign prepared.
[IPv6 packet 02](../evidence/tts-adapter-layout/IPV6-CHANGE-PACKET-02.md)
is frozen within the accepted order/correction:35 paths,3669/3900 additional lines,
272/450 IPv6 redesign lines and151/300 generated lines. Source/artifact writing is
idle; independent IPV6-POSTCHANGE-02 now accepts the exact frozen identities.

First add verified historical source selection and isolated v4 layout support;
then move the four implementations and update direct consumers. Add the empty
package marker. Update Piper exclusions/smoke, the new Chatterbox recipe and the
focused tests. Preserve old command semantics and all specified exclusions.
Register the new local-only commands described in section 8 before running them.

Acceptance: reviewable worker Change Packet within the frozen order, unchanged
engine algorithms/contracts, preserved historical authority bytes, complete
new closures, and no active import of a removed path. Historical references and
versioned source selection legitimately retain the old path strings.

### Milestone 3: Assemble and exercise the new payloads

Status: complete. Independent IPV6-POSTCHANGE-02 PASS covers three baseline
commands,22 campaign gates, actual copied providers, four bilingual candidate
arms and four frozen-desktop arms. Full before/after identity recheck PASS.
Historical FAIL checkpoints remain preserved; none substitutes for these results.
Recovery timing deviation and safe retries remain recorded in Change Packet03.

Run generator/build preparation while the worker owns writes. Refresh current
Piper outputs, assemble Chatterbox v4 in its isolated directory, inspect the
maintainer wheel and both runtime payloads, and retain compact new identities.
The validator does not generate or repair tracked authority during acceptance;
freeze those outputs before post-change validation.

Run the fresh-process/offline/cancellation matrix in section 8 against the
actual new package paths. Repeat non-writing builds/checks to establish their
consistency. Rebuild local native/installer consumers of the Piper manifest.
The still-admitted Chatterbox v3 must continue to validate and load its original
layout. Do not substitute cached v3 execution for v4 runtime evidence.

Acceptance: independent PASS on the complete patch and the named artifacts,
including historical checks, fresh payload execution, failure cases and exact
identity rechecks. A model-free suite or successful wheel build alone is
insufficient for this milestone.

### Milestone 4: Document and close the bounded campaign

Status: complete. Live acceptance, exact-six firewall cleanup and independent
documentary closeout pass. The director archives this plan with changes unstaged.

Update the implemented service map and maintainer source-history/build
instructions. Review the system diagram; keep its process/data-flow model and
active Chatterbox v3 claim unless the documented architecture actually changed.
Describe v4 as local preparation only. Review full portable/native aggregate
results and the final diff for unrelated work and prohibited artifacts.

Store concise Markdown receipts under
`docs/plans/evidence/tts-adapter-layout/`; put raw output, temporary scripts,
identity dumps and local candidate metadata in ignored
`tmp/evidence/tts-adapter-layout/<run>/` or ignored distribution directories.
Do not commit models, runtime archives, generated audio or book data.

Acceptance: all implementation gates actually pass, pending publication/admission
is explicit, and indexes link the archived completed plan. Leave this plan active
if implementation or required evidence is incomplete. Git actions follow the
user's execution instructions; acceptance itself does not authorize a commit.

## 8. Testing and benchmark strategy

Run every acceptance command from normal local PowerShell outside the managed
automation sandbox, using the repository-pinned toolchain. Record the exact
command, source/artifact identities, result and evidence path. A sandbox result
is exploratory only. Preserve pre-existing failures as BASELINE-FAIL.

### Existing configured commands

These commands exist in root `package.json` at the recorded base. Recheck the
configuration when executing; do not infer that they were run for this plan.

Baseline and post-change deterministic coverage:

```powershell
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
pnpm.cmd test:python
pnpm.cmd build:python
pnpm.cmd package:piper-core:check
pnpm.cmd package:chatterbox-optional:check-source
pnpm.cmd package:chatterbox-optional:check-acquisition
pnpm.cmd package:chatterbox-optional:v3:check-source
pnpm.cmd package:chatterbox-optional:v3:check-acquisition
```

Piper preparation and subsequent non-writing verification are distinct:

```powershell
pnpm.cmd package:piper-core:write-manifest
pnpm.cmd package:piper-core
pnpm.cmd package:piper-core:check
```

The first command intentionally regenerates the two allowlisted current Piper
outputs and is a worker preparation step, never a baseline or validator repair.
Capture the before/after identities; freeze the tracked outputs before review.

Required aggregate and affected local-package gates after source acceptance:

```powershell
pnpm.cmd check:portable
pnpm.cmd check
pnpm.cmd test:native-startup
pnpm.cmd package:windows
pnpm.cmd package:windows:check
pnpm.cmd inventory:release:check
pnpm.cmd audit:release
pnpm.cmd test:chatterbox:dependency-security
```

An unchanged passing aggregate need not be repeated just to duplicate its
constituent checks. New source/artifact changes require new applicable evidence.

### Local v4 command deliverables, not currently executable commands

Add and document a `--package-version 4` build/source-check route only after
implementing the explicit layout and version handling. Proposed root script
names are `package:chatterbox-optional:v4`,
`package:chatterbox-optional:v4:write-source`,
`package:chatterbox-optional:v4:check-source` and
`package:chatterbox-optional:v4:check-local`. They do not exist at plan creation.
The last must verify the exact local tree, manifest, archive/parts and source
identity without claiming publication. Its final CLI arguments and the focused
candidate smoke runner must be recorded in the work order/configuration before
execution; do not invent shell commands while following this plan.

### Required assertions and host evidence

| Boundary | Required evidence |
| --- | --- |
| Real behavior | Existing adapter/service assertions remain effective: admission failures, profile selection, bounded PCM, cancellation, malformed frames and stale suppression. Imports alone do not prove behavior. |
| Import isolation | Fresh interpreter using the installed wheel/copied payload, without checkout/PYTHONPATH leakage; stable module entrypoints import and default service operates with only its declared dependencies. Importing one adapter does not load another provider or optional library. |
| Piper closure | Freshly copied runtime includes Piper/fake/schema modules and excludes dormant Chatterbox/Qwen plus packaging helpers; mutation cases reject missing/extra/tampered files. Fresh bilingual offline smoke succeeds without persisted audio. |
| Chatterbox closure | Exact v4 module set and separate output directories; neither live source changes nor v4 generation changes v2/v3 authority. A removed required module fails verification; a full development environment cannot mask a missing packaged import. |
| Historical source binding | Verify the two real commit/module bindings; test missing history, wrong commit/path, changed bytes and version collisions with bounded synthetic fixtures. Historical errors cannot silently select current source. |
| Fresh package execution | Piper Spanish/English and Chatterbox v4 Spanish/English: real local model load, framed handshake, bounded audio, cancel/cleanup and fresh process restart, using public/synthetic text. Verify filesystem/network policy with the established host harness. |
| Qwen | Preserve its development-only status; run model-free profile/adapter tests and module-entrypoint checks. If a real Qwen claim is made, require its own available exact-host evidence; do not invent support or download models for promotion. |
| Desktop continuity | Newly built desktop loads refreshed Piper and unchanged admitted Chatterbox v3. Exercise play, pause, seek, chapter/voice/session replacement and shutdown; verify zero stale ownership and no ordinary audio files. |

Existing host entrypoints include `test:tts:exact-host`,
`test:tts:adaptive-exact-host`, `test:tts:resilience-exact-host`,
`test:tts:bilingual-profiles-exact-host`,
`test:tts:bilingual-portfolio-exact-host`, `test:tts:handoff-host`,
`package:windows:lifecycle`, `package:windows:ordinary-chatterbox:preflight` and
`package:windows:ordinary-chatterbox`. Inspect their prerequisites, selected
profiles and artifact paths at milestone 1 and freeze the smallest set that
covers the matrix. A journey hardcoded to v3 is v3 evidence only. Add a bounded
local-candidate runner if needed, without changing production v3 admission or
weakening existing runners to accept a convenient artifact.

The lifecycle and ordinary-Chatterbox journey runners perform local install/
uninstall operations and reject a pre-existing installation. If selected, use
their documented clean-host prerequisites, preserve the data they protect, and
verify their cleanup/restoration on success and failure. Use an appropriate
clean test host or report BLOCKED when those prerequisites are unavailable;
never remove an existing user installation or overwrite user data to make a
test runnable. Temporary test installation is distinct from publication or a
permanent upgrade of the user's application.

Separate deterministic results from exact-host observations. Record fresh
startup, RTF, underrun, memory and cancellation observations needed to compare
the touched runtime with its baseline, without transferring historical
measurements or human listening scores. No performance improvement is claimed
for reorganizing files. Required unavailable hardware/evidence remains BLOCKED.

## 9. Risks and rollback

The main risks are package closure drift, accidental eager optional imports,
historical hash/source mismatch, v3/v4 output collisions and confusing a local
candidate with a published package. Tests and fresh artifact identity receipts
must address each directly. Keep dependency/model/voice locks unchanged.

Before replacing an ignored local payload, retain its verified manifest/archive
identities and a recoverable copy outside the builder's replacement target.
Resolve every Windows move/delete target under the intended directory first.
Rollback the complete approved migration and its current generated outputs
together, using verified worker-owned paths/hunks or an authorized revert.
Never use a repository-wide destructive reset or discard unrelated work.
Restore the prior verified local payload if needed. No remote release is
changed. Any temporary host-test installation must follow the selected runner's
cleanup/data-restoration procedure, with its outcome recorded; it must not
leave a permanent application or user-data change behind.

If scope expands to new dependency versions, public contracts, production v4
admission or release publication, stop and revise the plan and review boundary.
The small organizational benefit does not justify silently expanding the task.

## 10. Progress log

- [x] User explicitly authorized the proposed bounded local-IPv6 validation
  redesign/test after the exact denied-probe distinction was explained. Keep
  every socket operation blocked; only separately classify the identified
  provenance-bound local capability attempt. No dependency/provider changes,
  preimport bypasses or permission to execute network operations follow.
- [x] Accepted [IPV6-AUDIT-01](../evidence/tts-adapter-layout/IPV6-AUDIT-01.md)
  and independent [IPV6-PREEDIT-01](../evidence/tts-adapter-layout/IPV6-PREEDIT-01.md)
  PASS: three commands,588 Vitest+49 Node; exact real bind predicate verified
  separately from the retained strict-policy FAIL. All35/260/25/2031/2037
  identities and15 authorities unchanged. Six task rules/eight originals verified.
- [x] Froze [IPV6-WORK-ORDER-01](../evidence/tts-adapter-layout/IPV6-WORK-ORDER-01.md)
  before resuming the sole writer; three paths,450 incremental/3900 total lines.
  Preserve all earlier reports, package bytes and Git boundaries.
- [x] Froze [IPV6-CHANGE-PACKET-01](../evidence/tts-adapter-layout/IPV6-CHANGE-PACKET-01.md),
  raw SHA25668ef03caa991546a39a34e15b3be3aaedcaef0646e0e72463b56bb2448e84f75.
  Director scope review passes: three paths,268/450 incremental,3665/3900 total;
  other32/protected260 unchanged. Writer prepared complete reuse proof for
  unchanged25 artifacts and2024/13085/2024 runtime closures; no acceptance claim.
- [x] [IPV6-POSTCHANGE-01](../evidence/tts-adapter-layout/IPV6-POSTCHANGE-01.md)
  FAIL: format/lint PASS,588 Vitest and50/51 Node PASS. New fixture miscounts
  assignment plus one call as two calls; its real negative matrix stops early.
  Actual copied providers independently PASS CPU1/IPv6probe1, unexpected counters0.
  All identities preserved;22 campaign gates/models NOT RUN.
- [x] Issued [IPV6-CORRECTION-ORDER-01](../evidence/tts-adapter-layout/IPV6-CORRECTION-ORDER-01.md),
  first of two permitted loops: explicit event counts only,16-line ceiling,
  all cases/assertions preserved. Production policy and artifacts stay frozen.
- [x] Froze [IPV6-CHANGE-PACKET-02](../evidence/tts-adapter-layout/IPV6-CHANGE-PACKET-02.md),
  raw SHA2566aa5e4587aaacee7d426e51ab2b011762deb80384cdfa020aab68d6cec39185c.
  Correction10/16 lines, cumulative272/450 and3669/3900 full-unit; other34
  sources and all artifacts unchanged. Fresh full independent validation running.
- [x] [IPV6-POSTCHANGE-02](../evidence/tts-adapter-layout/IPV6-POSTCHANGE-02.md)
  PASS, raw SHA256e8097f39e7ef857b8ed736081f0d56b949c1f10233b39a6cf7440f6f137c61da:
  fresh three baseline commands and22 gates, real provider proof, candidate4/4
  and desktop4/4. All35/260/25/2031/2037 identities and25 authorities unchanged;
  zero remaining test processes. Earlier failures stay immutable.
- [x] Cleanup03 removes only six task rules; independent cleanup-readback-05
  verifies zero task rules, eight unchanged originals, active firewall and zero
  test processes. SHA256fffa447c9514c7afceaa00d569fbdaa2472dd401a783427f8b3962822cbfaf23.
- [x] Independent clean_code_auditor approves final documentary closeout with no
  material findings. Director checks pass39 Markdown evidence files/277 relative
  links, accepted35 source identities, whitespace/evidence/index gates. Archive
  mechanically to completed/ and update navigation; post-move checks are retained
  in ignored final-closeout-04/after-archive.json. No source or Git-index mutation.

- [x] REDESIGN-POSTCHANGE-03: renewed exact firewall/preflight PASS, three baseline
  PASSs and19/22 final gates PASS. Copied-provider imports complete with the exact
  denied CPU probe, but one denied urllib3 IPv6 bind fails audit acceptance.
  Models/dependency-security were not run after the early failure; all identities
  remain unchanged and no test processes survive.
- [x] REDESIGN-NETWORK-AUDIT-01 BLOCKED: zero socket tolerance is explicit; no
  allowed correction under the current order. Preserve controls and diagnostics.
- [x] Finish exact cleanup of the six temporary rules. First cleanup elevation
  was cancelled; user-confirmed retry succeeded. Independent cleanup-readback-04
  verifies zero task rules, eight exact originals, enabled firewall and zero
  test processes. See [CLOSEOUT-03](../evidence/tts-adapter-layout/CLOSEOUT-03.md).

- [x] User confirmed retrying the UAC prompt. The unchanged saved preparation
  script completed with status prepared and six exact task rules created;
  `tmp/evidence/tts-adapter-layout/firewall-resumption-01/result.json` retains
  names/program bindings. The earlier elevation-cancelled receipt remains.
  Independent readback and a fresh full validation report are now required;
  no code or artifact changed to remove the environment blocker.

- [x] Accepted REDESIGN-ADDENDUM-01 after the worker stopped at its original
  ceiling. Same three paths,520/3500 ceilings; Windows probe classification,
  exact counter budget and no-atexit audit framing required explicitly.
- [x] Frozen redesign packet01, independently validated FAIL; issued bounded
  correction01 for test-fixture collision and redundant escapes only. Frozen
  packet02 retains all assertions and current504/520,3415/3500 bounds.
- [x] REDESIGN-POSTCHANGE-02: three baseline PASSs,18/22 campaign gates PASS;
  all35/260/25/2031/2037 identities unchanged,27 recoveries verified. No new code
  defect observed; eight original firewall rules and empty index preserved.
- [x] Complete live acceptance under the authorized denied-socket accounting
  revision: IPV6-POSTCHANGE-02 PASS, including model/security gates. Preserve
  [CLOSEOUT-02](../evidence/tts-adapter-layout/CLOSEOUT-02.md) as the historical
  missing-rule checkpoint; final documentary review also passes.

- [x] 2026-10-11 resumption: user explicitly authorized continuing after the
  two-loop blocker. Preserve CLOSEOUT-01 and POST-CHANGE-03 unchanged; redesign
  the candidate audit policy rather than add an unreviewed third patch. Git
  remains on the same execution HEAD with an empty index and retained patch.
  Previous role tasks are no longer live, so new configured auditor/validator
  role tasks replace them; exactly one implementation writer remains required.
- [x] Accept the redesigned Audit Packet, independently bind pre-edit evidence,
  then issue a bounded order retaining unconditional subprocess/network denial.
- [x] REDESIGN-PREEDIT-01 deterministic PASS: three host gates, 588 Vitest +47
  Node tests, unchanged source35/protected260/artifact25/frozen2031+2037. Original
  baseline PASS and current candidate FAIL remain distinct. Issued immutable
  REDESIGN-WO-01 after validator idle; one configured writer owns three paths.
  Runner-only implementation may proceed; actual providers/models remain
  prohibited until renewed offline prerequisites pass.
- [x] Accepted REDESIGN-AUDIT-01: same 35-path unit, only runner/tests/guidance
  editable; maximum 400 incremental and 3,400 combined additional lines, with
  generated ceiling unchanged. This explicit allocation supports real-policy
  regression coverage; it does not broaden product or package behavior.
- [x] Renew offline host prerequisites. The first resumption elevation was
  cancelled before the script ran; its receipt remains. The user-confirmed retry
  created six exact rules and independent report03 verified them. Cleanup is
  recorded separately; prerequisite PASS does not accept the socket observation.

- [x] 2026-10-10: inspected the module responsibilities, direct consumers,
  packaging paths, release authority and preceding completed campaign.
- [x] 2026-10-10: recorded runtime-core SKIP and the packaging prerequisite
  discovered by the independent read-only audit.
- [x] 2026-10-10: created `codex/tts-adapter-layout` from clean local `main` at
  `8fac7086902e203bf3792d569b30edade37896cf`; HEAD unchanged, index empty.
- [x] 2026-10-10: drafted this ExecPlan; source implementation remains unstarted.
- [x] 2026-10-10: independent planning follow-up found the selected package
  boundary viable, subject to historical source verification, explicit v4 hash/
  licence handling and recovery from a partial Piper authority refresh.
- [x] 2026-10-10: host documentation checks passed for all 12 required sections,
  14 plan links, 20 executable script references, the three-file authoring scope,
  whitespace, unchanged base HEAD/main and an empty index.
- [x] 2026-10-10: corrected the final documentary review finding by making
  host-test installation prerequisites and cleanup/restoration explicit; the
  independent auditor confirmed no documentary corrections remain.
- [x] 2026-10-10 execution: confirmed existing branch `codex/tts-adapter-layout`
  at `7bbad9d5bef3a83c913ea5d7b948213a05bb0362`. Its plan/index-only commit
  follows the recorded base; the initial worktree and index are clean. Preserve
  that documentation and perform no Git mutations.
- [x] 2026-10-10 execution: started the configured `clean_code_auditor`
  (GPT-6.1 Sol high) and `refactor_validator` (GPT-6 Astra high). The worker
  definition is available; no implementation order exists before audit
  acceptance and baseline PASS. No Git steward is needed for this no-Git task.
- [x] 2026-10-10 execution: accepted [AUDIT-01](../evidence/tts-adapter-layout/AUDIT-01.md)
  (`CHANGE`, high risk), freezing 35 source-unit paths and a 3,000-line
  rename-aware edit ceiling in addition to four mechanical moves. Verified raw
  historical modules match the available original/corrected v2 and installed v3
  manifests. Full payload integrity/execution is a separate pending gate.
- [x] 2026-10-10 execution: issued draft work-order terms to the independent
  validator for the ten existing baseline commands. No approved work order or
  source edits have been issued. The selected future desktop route is
  non-installing; v4 receives a separate artifact-bound candidate runner.
- [x] 2026-10-10 execution: independent
  [BASELINE-01](../evidence/tts-adapter-layout/BASELINE-01.md) PASS for all ten
  commands, including 457 Python tests. All 35 source-unit path identities,
  260 protected identities and HEAD stayed unchanged; index empty. One pytest
  cache-write permission warning did not fail any test.
- [x] 2026-10-10 execution: independent read-only installed-v3 verification
  passed the frozen runtime manifest, all 13,083 runtime records and six model
  records. This does not claim synthesis, offline execution or new-artifact
  validation.
- [x] 2026-10-10 execution: recorded
  [HOST-BLOCKED-01](../evidence/tts-adapter-layout/HOST-BLOCKED-01.md). Required
  exact-program outbound firewall rules are absent. A narrow creation attempt
  outside the sandbox failed with Windows System Error 5; no rule was created.
  The auditor confirmed BLOCKED before moves. No worker/source order or runtime
  artifact preparation began; source, historical authority and user install
  remain recoverable and unchanged.
- [x] 2026-10-10 resumption: user authorized assistant preparation; a saved
  PowerShell script launched through `Start-Process -Verb RunAs` completed and
  created exactly `VoxLeaf-Adapter-Layout-Test-0`, `-1` and `-2`. Host readback
  confirms enabled outbound Block rules, Profile Any, for copied Piper,
  installed v3 and proposed v4 interpreters. Preserve the prior BLOCKED reports;
  a new independent prerequisite report is pending. Retain these task-owned
  rule identities for precise cleanup after validation.
- [x] 2026-10-10 resumption: accepted the new independent
  [HOST-VALIDATION-03](../evidence/tts-adapter-layout/HOST-VALIDATION-03.md) PASS;
  all original baseline identities remain unchanged and reusable. Issued
  [work order WO-01](../evidence/tts-adapter-layout/APPROVED-WORK-ORDER-01.md)
  and started the configured GPT-6.1 Sol high worker as sole source writer.
- [x] Milestone 1: accepted bounded order and independent host baseline.
- [x] Milestone 2: atomic source/import/package migration frozen in Change Packet 01.
- [x] Correction loop 1: addressed the independent POST-CHANGE-01 findings under
  [CO-01](../evidence/tts-adapter-layout/CORRECTION-ORDER-01.md), then issue new
  identities in [Change Packet 02](../evidence/tts-adapter-layout/CHANGE-PACKET-02.md)
  for independent validation. The previous FAIL remains immutable.
- [x] Milestone 3: fresh runtime artifacts and independent host acceptance.
- [x] Independent POST-CHANGE-02 attempted all 22 gates: FAIL for timer imports,
  sorted-wire completion comparison and two stale frozen desktop resource files.
  Python 485 and desktop 634 tests pass; all source/protected/artifact identities
  held. Native startup and dependency security pass with verified environment.
- [x] Final correction loop 2: runner regression repair and clean Windows build,
  with recovery and a new desktop-02 freeze under CORRECTION-ORDER-02. All 2,031
  resources and fresh NSIS inputs match exactly. Source total 2,983/3,000;
  generated 151/300. Change Packet 03 frozen; independent acceptance pending.
- [x] Milestone 4: final documentation, aggregate review and archival.
- [x] Independent POST-CHANGE-03: all 22 commands attempted, 21 PASS and candidate
  FAIL. All four frozen-desktop arms passed; source/protected/artifact identity
  recheck PASS. Both correction loops exhausted; no third patch authorized.
- [x] Blocked closeout: final evidence and redesign recommendation documented;
  six exact task firewall rules removed after process cleanup, eight originals
  retained. Plan stays active; no staging, commit, push, PR or publication.

## 11. Discoveries and decisions

- File length is not the deciding criterion. Group the four concrete engines,
  retain cohesive root owners and preserve independent test files.
- This runtime migration is more consequential than the completed maintainer
  helper extractions. Python tests or a wheel build alone cannot validate it.
- The selected release boundary refreshes Piper's current generated authority
  and prepares local Chatterbox v4 while preserving admitted/published v3.
  It does not require a new protocol, profile or dependency graph.
- Existing v3 authority generation depends on live source paths. Resolve that
  historical binding before moving code; never combine new-source hashes with
  old published archive hashes.
- The source migration is planned, not approved by the earlier BLOCKED packet.
  A fresh accepted audit and passing baseline must establish the actual order.
- The subsequent execution request authorizes implementation locally, but
  explicitly excludes staging, commits, push, PR and release publication.
- Host prerequisite inspection found an existing ordinary VoxLeaf installation.
  It must remain intact. Installation runners require their clean-host
  prerequisites; the audit must identify exact non-installing coverage or
  record an uncovered required gate as BLOCKED.
- `package:windows` writes the current tracked Windows package evidence through
  its builder. Its output must be explicitly scoped as preparation and frozen
  before independent checks, rather than mutated during validation.
- Baseline PASS and source provenance do not discharge mandatory host evidence.
  Administrator-capable setup of exact interpreter firewall rules was the
  initial blocker, resolved by elevated preparation and HOST-VALIDATION-03.
  Retain unique identities of newly added rules for exact cleanup;
  do not remove existing rules by their shared display name or substitute
  development-runtime rules. See the host blocker receipt before resuming.
- Freeze the new desktop executable/resources at ignored
  `tmp/tts-adapter-layout-desktop-01/` before aggregate builds can overwrite
  ordinary outputs. Exact-program rule `VoxLeaf-Adapter-Layout-Test-3` was
  separately prepared for its Piper `runtime/python.exe`; the validator must
  verify the frozen binary, payload and rule when accepting the desktop route.
- The first recovery capture stopped before any generator/build because Windows
  PowerShell 5 could not copy a long dependency path. Preserve that partial
  backup. A fresh PowerShell 7 capture at the shorter ignored
  `tmp/tts-adapter-layout-recovery-02/` verified nine original artifacts before
  preparation resumed. Its complete identities and command outcomes are in
  `tmp/evidence/tts-adapter-layout/worker-preparation-02/preparation-receipt.json`.
  This environment adjustment does not change any acceptance gate.
- V4 source generation/build and both Piper preparation commands completed with
  exit 0 in `worker-preparation-02`. Windows preparation then stopped after
  Rust/NSIS generation because its Windows PowerShell child could not autoload
  `Get-AuthenticodeSignature` (`CouldNotAutoloadMatchingModule`). No desktop
  artifact was frozen and no independent acceptance command had run. Retain the
  failed receipt/log and nine-artifact recovery capture; investigate the child
  module environment before any narrowly scoped preparation retry.
- The same `pnpm` to `powershell.exe` diagnostic proved that inherited
  PowerShell 7 module precedence selected Security v7 in Windows PowerShell 5,
  causing duplicate TypeData members. A process-local `PSModulePath` selecting
  native Windows PowerShell modules imported Security v3 and read the new
  binary's actual `NotSigned` status. Both diagnostic receipts remain in
  `worker-preparation-02`; the Windows-only retry uses a new
  `worker-preparation-03` receipt. No builder or signature requirement changed.
- The Windows retry completed with exit 0. Its receipt records
  `prepared-and-frozen-unvalidated` and four verified frozen artifact entries
  beneath `tmp/tts-adapter-layout-desktop-01/`. The builder reports
  `unsigned-local` and `antivirus=not-run`; no installation, signing, antivirus
  or publication claim follows from this preparation success.
- Independent POST-CHANGE-01 passed 483 Python tests, 588 Vitest plus 45 Node
  tests, package/history checks and isolated fresh wheel inspection, but failed
  lint (I001), five test typing errors, restored-copy error semantics and host
  preflight. The report rechecked all 35 source paths, 260 protected paths,
  14 artifacts and 2,037 frozen resource records unchanged. No inference ran.
- Host preflight exposed an actual Windows package virtualization mapping for
  installed v3: the logical LocalAppData path resolves into the Codex package's
  LocalCache. This is observed outside the sandbox. CO-01 requires a verified
  logical/canonical pair, retained anti-link checks and exact canonical-program
  firewall coverage. Task rule `VoxLeaf-Adapter-Layout-Test-4` is prepared through
  `firewall-setup-04`; cleanup must name only the five task-owned rules.
- CO-01 returned a frozen six-file correction with total accounting
  2,948/3,000 and 151/300 generated lines. Actual core, V4 and frozen core
  manifests contain ten copied source modules each and exclude all correction
  paths; 14 artifacts and 2,037 frozen resources remain hash-identical.
  This only checked listed modules. POST-CHANGE-02 subsequently established
  two extra old root adapter files in the frozen desktop tree, already present
  before both reports. The prior desktop reuse claim is insufficient; preserve
  the failed freeze and regenerate clean resources/installer under CO-02.
- POST-CHANGE-02 confirmed a sorted-key protocol encoding triggers the runner's
  order-sensitive JSON comparison despite equal identity fields. Correct the
  runner and cover exact key-set/value equality without changing the protocol.
- Native startup initially failed because PATH EdgeDriver 150 did not match
  WebView 155. The repository-prescribed signed matching driver was prepared
  in an isolated task directory and independently verified; the unchanged gate
  passed with process-local VOXLEAF_EDGE_DRIVER_PATH. The global driver remains
  unchanged. Dependency security similarly passed using the exact fresh v4
  embedded Python, offline and with bytecode disabled. Initial failures remain.
- CO-02 selects a separate desktop-02 freeze. Exact task firewall rule
  `VoxLeaf-Adapter-Layout-Test-5` was prepared and read back as enabled outbound
  Block/Any for that frozen interpreter; all existing rules remain. Cleanup
  names only task rules 0 through 5, with exact program identity checks.
  The first CO-02 recovery attempt hit Windows path-length errors before any
  cleanup or builder. Its partial recovery-03 and receipt remain; a new shorter
  `tmp/tal-recovery-04` capture must verify exact bytes before mutation.
- The short five-output Windows recovery succeeded. The first CO-02 Windows
  preparation then reached its prescribed nested Piper builder before a
  separate current Piper recovery copy had been captured. The director halted
  the owned pipeline during Rust compilation. This preparation-order lapse is
  retained, not described as a prior backup. The completed nested core step
  left all 2,024 files, both tracked outputs and the archive byte-identical to
  pre-writer records; all nine original recovery captures remain verified.
  A fresh complete current nine-output capture is required before retry. No
  partial core failure or mixed authority was observed; no desktop-02 freeze
  or acceptance followed from the interrupted attempt.
- A nine-output pre-retry recovery at `tmp/tal-recovery-05` preceded the next
  successful Windows build. Complete whole-resource comparison then rejected
  four copied v2 optional authorities absent from current installer inputs,
  outside the cleaned core subtree. No desktop-02 freeze was made. The exact
  files and hashes are retained in `whole-resource-integrity-stop-01.json`
  (SHA256 `bef321a023b09c8b024bd1a8106d7db487f15c98689913240c5377ec079e70d2`).
  PREPARATION-ADDENDUM-01 permits recovered cleanup of those four staging
  copies and the existing builder retry only. This adds no source correction,
  changes no historical authority and does not relax complete-set checks.
- Final preparation succeeded with 2,031 exact resources/NSIS inputs, preserving
  all older artifacts. POST-CHANGE-03 independently rehashed 27 recovery copies
  and the frozen artifacts, then ran every required gate. Its sole failure is
  the new candidate runner's handling of NumPy's denied optional local `lscpu`
  probe: RuntimeError escapes an OSError handler and a local denied launch is
  counted as networkDenied. No network event or v4 inference acceptance follows.
  Auditor and validator agree an exception-only patch is insufficient. A future
  redesigned order must preserve process denial and distinguish process/network
  observations; the two-loop limit prevents another patch under this order.
- The final desktop route passes refreshed Piper ES/EN and admitted Chatterbox
  v3 ES/EN. Measured Chatterbox starts of 47,952/85,033 ms remain limitations,
  not performance-improvement claims. All arms report zero stale playback,
  underruns, audio files or external requests. System diagram review found no
  process/data-flow/admission change requiring an edit.
- After immutable report issuance and verified process cleanup, exact task
  firewall rules 0 through 5 were removed; separate host readback retains all
  eight originals and zero task rules. Future inference needs fresh offline
  preparation. Recovery and raw evidence remain in ignored local storage.

## 12. Final validation results

Current authority: [IPV6-POSTCHANGE-02](../evidence/tts-adapter-layout/IPV6-POSTCHANGE-02.md)
PASS, raw SHA256e8097f39e7ef857b8ed736081f0d56b949c1f10233b39a6cf7440f6f137c61da.
All three baseline commands and22 campaign gates freshly pass on exact frozen
IPV6-CHANGE-PACKET-02 identities; copied-provider proof, candidate4/4 and desktop4/4
pass. Final identities35/260/25/2031/2037 and25 authorities unchanged, zero test
processes. Cleanup03 and independent cleanup-readback-05 now confirm zero task
rules, eight originals intact and zero test processes. Independent documentary
approval is complete; see [CLOSEOUT-04](../evidence/tts-adapter-layout/CLOSEOUT-04.md).

Observed desktop quick audible starts: Piper es5314ms/en4910ms; Chatterbox v3
es43685ms/en41229ms. Cancellation986/843/295/295ms respectively. All arms report
zero underruns and external requests, no stale audio and unchanged watched audio
files. No performance improvement, universal hardware or listening-quality claim.
The ordinary installation was preserved; install/uninstall runners were not
selected and no clean-installer lifecycle is certified. Qwen remains model-free
and development-only. The canonical system diagram was rechecked: unchanged
processes, memory-only playback and active v3 admission require no diagram edit.
Release-audit informational findings/blind spots and preparation recovery timing
deviation remain explicit in the full report; no publication/signing claim.

The historical checkpoints below retain their original outcomes and limitations;
their pending/blocked statements describe those earlier stages only.

Historical result superseding its preceding checkpoint: [REDESIGN-POSTCHANGE-03](../evidence/tts-adapter-layout/REDESIGN-POSTCHANGE-03.md)
FAIL, raw SHA256 `96eeb727e82b4a83be71cb2553d41ffe2bf82fbd71dcf5c651538583b1c54176`.
Renewed offline prerequisites and preflight PASS; three baseline and19/22
campaign commands PASS. The copied-provider import audit fails on the denied
local urllib3 socket bind, while lscpu classification is verified correct.
[Network audit](../evidence/tts-adapter-layout/REDESIGN-NETWORK-AUDIT-01.md) permits
no correction under the current zero-socket authority. Full identities/owned
process cleanup PASS; temporary firewall-rule cleanup was subsequently verified
in separate cleanup-readback-04, preserving the immutable validation report.
No global acceptance or archival follows. [CLOSEOUT-03](../evidence/tts-adapter-layout/CLOSEOUT-03.md)
records that recoverable state; all earlier stages remain historical.

Previous checkpoint authority is [REDESIGN-POSTCHANGE-02](../evidence/tts-adapter-layout/REDESIGN-POSTCHANGE-02.md),
overall BLOCKED with no new executed code failure. Raw SHA256:
`68261bd928fbcb918e74ef93666747c6913b51e6f79080a7966e5ca45c4239fc`.
Three baseline commands and18/22 final gates PASS freshly. Preflight executed
exit1 at missing offline rules; candidate, desktop models, dependency-security
and the supplementary real copied-provider import proof remain pending. Full
identity/cleanup rechecks PASS. [CLOSEOUT-02](../evidence/tts-adapter-layout/CLOSEOUT-02.md)
records the exact blocker and recovery state. Entries below retain prior stages.

REDESIGN-CHANGE-PACKET-02 freezes the first redesign correction: only the test
fixture changed, eight added/deleted lines within the 12-line order. Overall
504/520 and 3415/3500 bounds remain unchanged. Writer is idle; fresh independent
validation is required. Raw packet SHA256:
`adcc238f945118c9faf5026ce50a40adf4cad3654626e29da28344e2450afb04`.

REDESIGN-POSTCHANGE-01 returned FAIL: format passes, lint reports two needless
escapes, and the real-Python fixture collides with the policy's probe_path global
when authority is null. Desktop results: 588 Vitest PASS and 48/49 Node PASS.
All source/protected/artifact identities and diff bounds independently pass.
REDESIGN-CORRECTION-01 permits only the two fixture/lint repairs in the test file;
production policy and artifacts stay frozen. No model or other 22 final gates
ran on this failing patch. Offline prerequisites remain independently BLOCKED.

REDESIGN-CHANGE-PACKET-01 is frozen for independent validation: 504/520
incremental lines, 3415/3500 combined, generated 151/300 and mechanical 1614.
The worker's actual closure/reuse receipt preserves the 25 artifacts and both
2031/2037 resource trees; no execution acceptance follows. The source writer is
idle. Raw packet SHA256:
`851dd4d4e60562635318bf47dacdfda045cb1de0011c347d859ddf73db105276`.

Resumption update: REDESIGN-ADDENDUM-01 accepts the auditor's concrete Windows
probe classification, exact counter and forced-exit framing findings. The sole
writer stopped at 439/400 incremental lines after formatting; the accepted
same-scope ceilings are now 520 incremental and 3500 combined. No test coverage
may be removed to meet them. The original pre-edit PASS and frozen packages
remain authorities; source writing may finish before new independent validation.
Offline preparation remains blocked by cancelled Windows elevation, separately
from permission to implement and run model-free checks.

Historical plan preparation: documentation checks passed outside the sandbox;
that checkpoint did not claim implementation. The ignored authoring checker
was run from repository root with
`powershell.exe -NoProfile -ExecutionPolicy Bypass -File tmp/evidence/tts-adapter-layout/plan-authoring/check-plan.ps1`.
It checks required headings, relative links, configured executable scripts,
index navigation, Git identities/scope and whitespace, including the new file.

| Gate | Current result |
| --- | --- |
| Execution branch and HEAD | `codex/tts-adapter-layout` at unchanged execution HEAD `7bbad9d5bef3a83c913ea5d7b948213a05bb0362`; empty index, no commit |
| Historical authoring structure | PASS at preparation: 12 sections, 14 relative links and 20 executable script references |
| Historical authoring scope | PASS before implementation: plan and two indexes only; empty index; no source edits then |
| Historical documentary review | PASS after the host-test lifecycle clarification; not implementation acceptance |
| Independent deterministic baseline | PASS: `TTS-ADAPTER-LAYOUT-01-BASELINE-20261011-01`, ten commands, 457 Python tests, unchanged source/protected identities and empty index |
| Historical Chatterbox source binding | PASS: exact v2/v3 Git blobs and available runtime manifests; frozen authorities preserved |
| Existing installed v3 integrity | PASS: frozen manifest, 13,083 runtime records and six models; final execution is recorded separately below |
| Initial offline host prerequisite attempt | Historical BLOCKED: Windows System Error 5; no rule created by that attempt; retained in HOST-VALIDATION-02 |
| Historical renewed offline prerequisites | HOST-VALIDATION-03 PASS at that time; its task rules were subsequently removed. REDESIGN-POSTCHANGE-03 verifies renewed prerequisites PASS; those temporary rules were also removed after validation |
| Historical independent validation | POST-CHANGE-03 FAIL: 21/22 commands PASS, fresh-v4 candidate blocked; identities unchanged for that earlier patch |
| Previous independent checkpoint | REDESIGN-POSTCHANGE-02 BLOCKED: three baseline and18/22 final commands PASS at the missing-rule checkpoint |
| Earlier full independent validation | REDESIGN-POSTCHANGE-03 FAIL: three baseline and19/22 final commands PASS; real copied-provider audit rejects denied local IPv6 bind, identities unchanged |
| Current full independent validation | IPV6-POSTCHANGE-02 PASS: three baseline and22/22 gates, actual-provider/candidate/desktop matrices, complete identities and zero test processes |
| Current IPv6 pre-edit gate | IPV6-PREEDIT-01 PASS: three baseline commands, exact actual bind predicate and full identity continuity; no candidate acceptance |
| Historical blocked-checkpoint closeout | PASS before implementation: evidence/whitespace/index checks; only coordination documents and Markdown evidence changed then |
| Fresh Piper, local Chatterbox v4 and Windows preparation | Complete clean artifacts; exact 2,031 resources/NSIS inputs and 27 recovery copies independently verified |
| Desktop execution | Current frozen-desktop02 four arms PASS on corrected runner, refreshed Piper and admitted v3; original report03 stays historical |
| Final closeout | Independent documentary approval with no findings; implementation accepted, cleanup verified and archival complete, earlier FAILs immutable |
| Historical host cleanup | Six task rules removed after report03 of the original order, before later resumption; eight originals preserved |
| Current host state | CLEANED-VERIFIED: cleanup03 removed six task rules; independent readback05 confirms zero task rules, eight unchanged originals, enabled firewall and zero test processes |
| Final blocked-checkpoint checks | Host evidence/whitespace/empty-index PASS; 35 source and eight original firewall identities rechecked |
| V4 native admission, release publication, push or PR | Outside this plan's implementation scope and current authorization |

Execution receipts and exact commands are in
[the evidence index](../evidence/tts-adapter-layout/README.md). The baseline
built only the maintainer sdist/wheel and checked existing cached Piper bytes;
it did not rebuild any runtime or installer. Final post-change report 03 records
21 PASS commands and one candidate failure for its exact older identities.
Historical REDESIGN-POSTCHANGE-03 records renewed offline PASS and the denied-socket
acceptance failure. See [earlier blocked closeout](../evidence/tts-adapter-layout/CLOSEOUT-03.md)
and the preserved [earlier closeout](../evidence/tts-adapter-layout/CLOSEOUT-01.md)
for preparation deviation, recovery, cleanup and limits. No staging, commit,
push, PR or publication occurred.
Implementation is accepted under IPV6-POSTCHANGE-02; final independent documentary
review passes and this plan is archived. All code/artifact writing is idle;
changes remain unstaged and uncommitted on the existing branch.
