# TTS adapter layout and runtime package continuity

Status: planned; implementation and runtime validation have not started.
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

The current request authorizes this plan and its local branch only. It does not
authorize implementation, staging, commits, pushes or pull requests. A later
execution request authorizes its stated implementation scope; Git publication
still requires its own authorization. Do not add checkpoints by committing
without that authorization.

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

Status: not started.

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

Status: not started.

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

Status: not started.

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

Status: not started.

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
- [ ] Milestone 1: accepted bounded order and independent host baseline.
- [ ] Milestone 2: atomic source/import/package migration.
- [ ] Milestone 3: fresh runtime artifacts and independent host acceptance.
- [ ] Milestone 4: final documentation, aggregate review and archival.

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
- Plan creation and branch setup are the only actions authorized by the current
  request. This document is not a grant of Git or release-publication authority.

## 12. Final validation results

Plan preparation: documentation checks passed outside the sandbox. No runtime
implementation or product validation is claimed. The ignored authoring checker
was run from repository root with
`powershell.exe -NoProfile -ExecutionPolicy Bypass -File tmp/evidence/tts-adapter-layout/plan-authoring/check-plan.ps1`.
It checks required headings, relative links, configured executable scripts,
index navigation, Git identities/scope and whitespace, including the new file.

| Gate | Current result |
| --- | --- |
| Local branch from clean `main` | PASS: `codex/tts-adapter-layout`; unchanged base HEAD; no staging or commit |
| Required plan sections, links and command references | PASS: 12 sections, 14 relative links and 20 distinct executable script references |
| Authoring diff scope and whitespace | PASS: this new plan and the two documentation indexes; empty index; no source edits |
| Independent documentary review | PASS after the host-test lifecycle correction; this is not implementation acceptance |
| Independent implementation baseline/post-change reports | Not run; implementation not started |
| Fresh Piper and local Chatterbox v4 runtime evidence | Not run; no new payloads created |
| V4 native admission, release publication, push or PR | Outside this plan's implementation scope and current authorization |

Replace implementation statuses only with observed results tied to their
source and artifact identities. Until then this plan remains active.
