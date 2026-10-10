# Native Rust module organization

Created: 2026-10-09. Completed: 2026-10-09. Status: complete; independently accepted.

## Goal

Improve navigation and responsibility boundaries in
`apps/desktop/src-tauri/src/` through small, independently validated Rust
refactors. Evaluate all twelve current files, implement only evidence-backed
extractions, and retain cohesive code when a split would increase coupling.

This is one maintenance ExecPlan spanning native work introduced by M007,
M010, and M011. It does not create a new product roadmap or reopen those
completed milestones. Its descriptive filename follows `.agents/PLANS.md`.

The execution request on 2026-10-09 authorizes all six stages, reuse or creation
of a dedicated `codex/` branch from the current checkout, and small local commits
of this plan's documentation and independently accepted units. It forbids push,
PR creation, merge, and automatic updates of main. Existing installations,
models, and personal data must be preserved; destructive test-resource changes
require separate authorization. A passing review does not broaden this scope.

## User-visible outcome

Application behavior remains unchanged: the same local EPUB reading, supported
Piper/Chatterbox narration, hardware admission, package acquisition, cancellation,
and cleanup. Contributors can locate native commands, runtime configuration,
process containment, hardware probing, and diagnostic entry points without
reading unrelated implementation details.

Success is clearer ownership with preserved evidence, not a target file count
or line limit. A documented `SKIP` is a valid outcome for any candidate.

## Current state

Planning inspection used `main` at
`6d2d75537600a2ddf13a3cf18f2b848de4f14957`. The tracked worktree and index were
clean before these documentation edits. This is provenance, not an execution
baseline. Reinspect the actual checkout when implementation starts.

All source paths below are relative to `apps/desktop/src-tauri/src/`. Counts
include comments, blank lines, and embedded tests; they do not establish defects.

| Target | Current file | Lines | Observed responsibility and proposed audit |
| --- | --- | ---: | --- |
| NR-CB | `tts_optional_chatterbox.rs` | 3,127 | Fixed manifests, acquisition, verification, installed-state locking, repair/removal, commands, and tests. Reconcile the prior SKIP before proposing extraction. |
| NR-SUP | `tts_service_supervisor.rs` | 2,053 | `ExactRuntime`, child construction/Job Object containment, session/lifecycle ownership, commands, and host scenarios. Audit independent seams while retaining lifecycle ownership. |
| NR-HW | `host_profile_detection.rs` | 1,678 | Report types, normalization, Windows probes, unsupported-host handling, admission, command, and tests. Audit the existing `windows_probe` boundary first. |
| NR-MAIN | `main.rs` | 163 | Nine diagnostic argument branches plus Tauri registration, managed state, setup, and exit cleanup. Audit extraction of dispatch. |
| NR-PROBE | `tts_protocol_probe.rs` | 684 | Model-free protocol probe, native binary response, frozen authority constants, and tests. Preserve its independent evidence role. |
| NR-FAKE | `tts_service_fake_child.rs` | 408 | Synthetic child/descendant scenarios used by executable host validation and the development default. This is not exclusively a unit-test module. |
| NR-HANDOFF | `tts_service_handoff.rs` | 557 | Exact-host handoff measurements through the real supervisor and a frozen benchmark profile. |
| NR-CONTRACT | `tts_protocol_contract.rs` | 643 | Closed JSON control validation, limits, and shared-fixture conformance. Candidate for grouping, not rewriting contracts. |
| NR-FRAMING | `tts_service_protocol.rs` | 355 | Bounded frame I/O, strict JSON decoding, audio validation, and native failures. Already a cohesive transport module. |
| NR-CORE | `tts_release_core.rs` | 484 | Discovery and verification of the packaged Piper core. Keep separate from optional acquisition. |
| NR-HASH | `sha256_hex.rs` | 41 | Small digest encoding helper with real callers in both package verifiers. Presumptive retain. |
| NR-AUTH | `hardware_profile_authority.rs` | 163 | Test-only schema, fixture, capability, and privacy authority checks. Preserve assertions and protected authority. |

The table above retains planning provenance. Fresh execution audits are recorded
in [the campaign audit record](../evidence/native-rust-module-organization/audits.md).
The current dispositions below supersede the initial NOT AUDITED state. Both
source units completed independent baseline, implementation and post-change
acceptance before their exact-path local commits.

| Target | Fresh decision | Execution status |
| --- | --- | --- |
| NR-CB | SKIP | Retain intentional verification/mutation boundary |
| NR-SUP | CHANGE, model-free `run_host` only | Accepted and committed as `719dea0` |
| NR-HW | SKIP | Retain private Windows probe and injected normalization |
| NR-MAIN | CHANGE, CLI dispatch only | Accepted and committed as `2451b3d` |
| NR-PROBE | SKIP | Retain independent frozen probe authority |
| NR-FAKE | SKIP | Retain executable and development-default synthetic peer |
| NR-HANDOFF | SKIP | Retain frozen diagnostic and ADR-0051 scope |
| NR-CONTRACT | SKIP | Retain cohesive closed semantic predicates |
| NR-FRAMING | SKIP | Retain cohesive bounded transport |
| NR-CORE | SKIP | Retain distinct packaged Piper verification |
| NR-HASH | SKIP | Retain already-shared digest encoding |
| NR-AUTH | SKIP | Retain test-only hardware authority |

### Prior Chatterbox decision

The accepted [MOD-B audit](../evidence/bounded-settings-and-chatterbox/MOD-B-audit-01.md)
on 2026-10-06 concluded `SKIP`: named stages were already testable, and installed
state intentionally shared verification/mutation locking and receipt
invalidation. Moving private types would not have simplified ownership.

The earlier conversational suggestion to prioritize splitting this file is
therefore conditional. A new NR-CB audit must compare current code with that
reasoning and identify a specific navigation, maintenance, or testing benefit
that outweighs the added private sharing. File length and a preferred tree
are insufficient. Without such evidence, retain the implementation and record
SKIP here; do not rewrite the completed plan or its audit.

## Scope and non-goals

In scope after implementation is requested:

- Audit the twelve files and their direct callers/tests, then extract cohesive
  responsibilities into private Rust modules where justified.
- Update `mod` declarations, imports, minimum necessary Rust visibility, Tauri
  registration paths, and compile-time include paths for accepted moves.
- Keep tests near the behavior they protect, either inline or in private
  `#[cfg(test)]` submodules; preserve assertions and coverage across relocation.
- Record each target as changed, skipped, blocked, or excluded, with evidence.
- Update contributor documentation and this plan to reflect accepted structure.

Out of scope:

- Product/UI changes, new engines, dependencies, crates, binaries, protocol
  versions, serialized fields, error codes, commands, or executable arguments.
- New acquisition behavior, resumable downloads, caching policies, support
  claims, hardware thresholds, process concurrency, retry or timing policies.
- EPUB extraction/normalization/segmentation, locator mapping, reader state,
  playback scheduling, or synchronization changes. No M005 boundary change.
- Qwen production work or investigation of its deferred runtime failure;
  retain its development code, configuration gates, and deterministic tests.
- Generic `utils`/service/repository layers, shared filesystem abstractions
  without demonstrated callers, or making internals public just to split files.
- Manual changes to generated sources, frozen evaluation authority, manifests,
  locks, historical evidence, completed ExecPlans, or installed model payloads.

## Relevant files and documentation

Read the current versions before each affected unit:

- `AGENTS.md`, `.agents/PLANS.md`, `docs/README.md`, `docs/product/mvp.md`,
  `docs/plans/roadmap.md`, and `docs/plans/active/README.md`.
- `docs/architecture/overview.md`, `docs/architecture/system-diagram.md`,
  `docs/architecture/tts-service-protocol-v1.md`, and
  `docs/architecture/hardware-profile-recovery-authority-v1.md`.
- `docs/architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md` and
  `docs/architecture/decisions/ADR-0019-privacy-safe-hardware-profiles-and-recovery.md`.
- `docs/architecture/chatterbox-official-acquisition-authority-v2.md`,
  `docs/architecture/decisions/ADR-0046-repair-chatterbox-runtime-closure-and-windows-path.md`,
  `docs/architecture/decisions/ADR-0047-separate-chatterbox-uninstall-retention.md`,
  `docs/architecture/decisions/ADR-0050-promote-ordinary-chatterbox-acquisition-and-retire-validation-overlay.md`,
  and the current v3 manifests consumed by the native source. Historical v2
  descriptions must not replace the current v3 package identity.
- `docs/architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md`,
  `docs/plans/completed/chatterbox-security-dependency-refresh.md`, and
  `docs/plans/completed/bounded-settings-and-chatterbox-modularization.md`.
- `docs/development/agentic-refactoring.md`, both refactor skills, and their
  `references/refactor-contracts.md` and `references/validation-matrix.md`.
- Root and desktop `package.json`, `apps/desktop/src-tauri/Cargo.toml`,
  `apps/desktop/src-tauri/tauri.conf.json`, and `tauri.release.conf.json` beside it.
- `apps/desktop/scripts/native-startup-smoke.mjs`,
  `apps/desktop/scripts/ordinary-chatterbox-release-host.mjs`,
  `apps/desktop/scripts/bilingual-portfolio-host.mjs`,
  `scripts/build-windows-release.ps1`, `scripts/test-windows-package-lifecycle.ps1`,
  and `.github/workflows/foundation-checks.yml` for actual gate behavior.

## Architecture and constraints

### Proposed module direction

The following is a navigation hypothesis, not an allowlist or a requirement to
create every file. Each accepted unit must specify its exact old/new paths.
If NR-CB is skipped, its current file may remain unchanged; the rest of the
campaign can still proceed. Keep `hardware_profile_authority.rs` in place
unless an audit establishes that a permitted relocation preserves its authority.

```text
apps/desktop/src-tauri/src/
  main.rs
  sha256_hex.rs
  hardware_profile_authority.rs
  hardware/
    mod.rs                      # narrow hardware facade/command
    report.rs                   # existing report types, if separation helps
    detection.rs                # normalization, selection, admission
    windows_probe.rs            # existing cfg(windows) implementation
  tts/
    mod.rs
    commands.rs                 # thin supervisor command adapters
    protocol/
      mod.rs                    # framing/decoding and native failures
      contract.rs               # existing control predicate and limits
    supervisor/
      mod.rs                    # sole session/lifecycle owner
      runtime_configuration.rs  # exact profile/runtime selection
      child_process.rs          # spawning, containment, termination
    packages/
      mod.rs
      piper_core.rs
      chatterbox/               # only if a fresh CHANGE justifies it
        mod.rs                  # manager and shared mutation boundary
        commands.rs
        manifest.rs
        download.rs
        verification.rs
        installation.rs
  diagnostics/
    mod.rs
    cli.rs
    protocol_probe.rs
    fake_child.rs
    supervisor_host.rs
    service_handoff.rs
```

Keep normal command flow toward the existing owners: command adapters call
the supervisor/package manager; runtime selection consumes verified package
descriptors; package admission consumes the hardware gate; frame I/O uses
the control contract. Diagnostics exercise those owners. The development
fake-child path is already used by `ServiceChild::configured()` and
`current_exe()`; do not remove it or introduce a dependency cycle to make the
directory tree look cleaner. An accepted order must account for its existing
argument/scenario dependencies, using the narrowest justified sharing.

### Invariants for every applicable work order

1. Preserve all sixteen registered Tauri command names, argument shapes,
   return shapes/error codes, managed state, application-data-root setup,
   binary `Response`, and exit-time `force_stop`. Rust module paths may change;
   renderer invocation names must not.
2. Preserve all nine CLI dispatch branches, literal flags, argument parsing,
   success/failure exit codes, and unknown-argument behavior. Snapshot them from
   `main.rs` and their constants before edits. Keep probes/fake children callable
   from the same executable in the configurations that currently expose them;
   do not move them into Cargo integration tests or add test-only feature gates.
3. Keep one supervisor, one child tree, existing operation/session/lifecycle
   locks, lock order, cancellation identity invalidation, stale-result rejection,
   timeouts, queue/audio bounds, and zero automatic restart/retry. Preserve Windows
   Job Object ownership, failed-assignment kill/reap, and path conversion.
4. Keep `release-locked-runtime` restrictions and every `cfg(windows)`,
   `cfg(not(windows))`, and test condition effective. No development environment
   fallback may become reachable in the ordinary release.
5. Preserve Chatterbox's native pre-network host gate, closed sources/redirects,
   byte/hash checks, containment/reparse-point checks, staging/cancellation,
   atomic promotion, shared installed-runtime lock, receipt lifetime/invalidation,
   exact repair/migration/cache rules, and stop-before-removal ordering.
6. Preserve privacy-safe hardware fields and unknown/unavailable semantics,
   precision and memory selection, concurrency guard, and unsupported-host
   behavior. No shell, network, model loading, device identity, or persistence
   surface is added to hardware detection.
7. Preserve exact included manifest/schema/fixture/generated-module bytes.
   Inventory each `include_str!`/`include_bytes!` and verify its resolved target
   after a move. Do not edit the included authority or generator output.
8. Preserve protected tests and frozen literals, including the probe's
   `frozen_authority`. Hardware's
   `implementation_has_no_process_network_model_or_persistence_surface` currently
   scans one source file: if detection is split, cover every resulting
   implementation file without dropping its assertions. Audit test discovery
   under both Rust feature configurations; zero matching tests is not a pass.
9. Keep inference local, book text and PCM out of diagnostics, and generated
   audio non-persistent. No change to EPUB acceptance or stable-locator behavior.

### Execution and review protocol

Apply `$orchestrate-safe-refactor` and `$validate-safe-refactor` with an explicit
Rust scope in each packet. Their TypeScript command matrix is not native
acceptance evidence; use the Rust and host gates below. The existing completed
MOD-B plan provides precedent for this adaptation; no skill or agent rewrite
is part of this task.

- The primary task directs. Reuse one `clean_code_auditor` (Sol high), one
  `clean_code_worker` (Sol high), and one `refactor_validator` (Astra high);
  use the configured Git steward (Sol medium) only for authorized Git work.
  Keep at most four supporting agents and exactly one source writer. No
  supporting agent delegates. Do not silently substitute unavailable models.
- Audit before prescribing a split. Convert CHANGE into draft terms; get the
  validator's fresh BASELINE PASS before issuing an immutable Approved Work
  Order. Normally bound a unit to one production owner, its tests, and at most
  two directly coupled support files, counting new files. Milestones may need
  several units. Justify an unavoidable wider mechanical move explicitly.
- Record exact paths, symbols, invariants, diff ceiling, and closed acceptance
  commands. Existing assertions move with behavior; add only tests needed to
  protect a demonstrated gap, not tests of the preferred file layout.
- Keep the index empty and proposed paths free of pre-existing edits. Preserve
  unrelated work, including this plan's uncommitted documentation. A future
  unit overlapping dirty paths requires resolution before writing; do not
  discard or silently absorb that work.
- POST-CHANGE PASS must bind an immutable Report ID, HEAD, old/new path
  identities, and before/after identity checks. Keep reports outside their
  validated source allowlist, under `docs/plans/evidence/native-rust-module-organization/`
  when created. The director records reports; the validator does not edit docs.
- Run required acceptance commands outside the sandbox with writers/Git idle.
  At most two correction loops precede redesign. A rejected patch cannot carry
  into the next unit. Authorized commits follow exact-path Git Action Orders;
  without commit authority, do not start another unit on overlapping dirty paths.
- Refactor acceptance uses the existing validator, without an additional
  `change_reviewer`. A discovered behavior fix is separate work with its own
  scope and required review, never folded into this refactor.

## Milestones

### Milestone 1: Establish inventory, evidence, and execution units

**Work:** Reinspect HEAD, status, package scripts, and all twelve targets.
Record imports, command/CLI inventories, compile-time includes, protected blocks,
test ownership, and feature/platform paths. Read MOD-B before the NR-CB audit.
Confirm the configured roles and available host resources. Establish whether
planned Git actions and installed-package tests are authorized; do all
independent preparation before requesting any missing authority.

Use read-only inventory commands such as:

```powershell
git status --short
git rev-parse HEAD
git diff --cached --quiet
git ls-files -- apps/desktop/src-tauri/src
rg -n 'include_(str|bytes)!|#\[cfg|#\[tauri::command\]|pub const .*ARGUMENT' apps/desktop/src-tauri/src
```

**Validation:** Accepted Audit Packet for the first unit, draft exact allowlist,
and independent baseline with the applicable gates below. Expected: relevant
commands pass on unchanged code and the allowlist/index are clean. A historical
test result is not a baseline. No source edits on BASELINE-FAIL.

**Status:** Complete. All twelve fresh audits recorded; NR-MAIN's clean
three-path allowlist has independent [BASELINE-03 PASS](../evidence/native-rust-module-organization/NR-MAIN-baseline-03.md)
and an immutable [work order](../evidence/native-rust-module-organization/NR-MAIN-work-order.md).

### Milestone 2: Decide and, if justified, organize optional Chatterbox

**Work:** Audit NR-CB against MOD-B. On SKIP, retain the module and record why.
On CHANGE, select the smallest useful boundary, such as command adapters or a
cohesive manifest operation, before considering further extractions. Preserve
the manager's single mutation/verification boundary. No blanket six-file split.
Each later extraction needs its own packet and baseline on the then-current code.

**Validation:** Rust gates before/after each accepted unit; native startup for
command changes; the fresh ordinary release journey for affected acquisition,
verification, runtime discovery, repair, or removal paths. Review both callers
in `main.rs` and the supervisor. Missing required host evidence blocks acceptance
of the affected change, not unrelated audit work.

**Status:** Complete by fresh NR-CB SKIP. The current v3/retained-v2 code and tests
reinforce the intentional mutation/verification boundary; the audit found no
new benefit that justifies revoking MOD-B. No Chatterbox source changed.

### Milestone 3: Separate supervisor adapters and process configuration

**Work:** Audit NR-SUP. Consider command wrappers, `ExactRuntime` selection,
`ChildProcess` containment, and host scenario entry points as separate units.
Keep `TtsServiceSupervisor`, `ServiceSession`, and coupled identity/lifecycle
ordering together unless a distinct audit proves a safer boundary. Extract host
scenario bodies here if approved; their final diagnostic placement is completed
in Milestone 5, without a second rewrite of those bodies.

**Validation:** Rust gates in both feature modes, native startup's model-free
child/protocol/lifecycle exercises, and relevant Piper/Chatterbox host journeys
for runtime construction or lifecycle paths. Inspect environment scrubbing,
Windows paths, Job Object cleanup, binary responses, and default/release cfg
selection. No newly widened runtime capability.

**Status:** Complete. Only the model-free `run_host` extraction was justified,
independently validated and committed as `719dea0`. Configuration, containment,
adapters and model-backed helpers retain evidence-backed SKIP decisions.
No production lifecycle change occurred.

### Milestone 4: Organize hardware probing and preserve authority coverage

**Work:** Audit NR-HW and NR-AUTH together. Start with the existing nested
`windows_probe` boundary; split report/normalization only for demonstrated value.
Keep the command/admission callers and unsupported-platform implementation
working. Preserve authority tests; extend the existing source-surface assertion
to all extracted implementation files if required.

**Validation:** Rust gates, the existing synthetic/unknown/provider-selection
tests, the Windows native probe test, and native startup for command integration.
If host-admission implementation is moved, require the ordinary Chatterbox
preflight against the candidate artifact. Explicitly disclose platform arms
not executed; portable TypeScript checks do not exercise Unix Rust branches.

**Status:** Complete by fresh NR-HW and NR-AUTH SKIP. The existing private
Windows probe, injected normalization tests, admission predicate and authority
tests already establish useful boundaries. Retaining the layout also preserves
the source-surface privacy test's complete implementation coverage.

### Milestone 5: Consolidate navigation, diagnostics, and bootstrap

**Work:** Audit NR-MAIN, NR-PROBE, NR-FAKE, NR-HANDOFF, NR-CONTRACT, NR-FRAMING,
NR-CORE, and NR-HASH, reusing accepted work from earlier stages. Group cohesive
modules only where it clarifies ownership. Extract CLI dispatch so `main.rs`
clearly shows registration/setup/shutdown. Keep probe versus production framing
independent where frozen evidence requires it; no deduplication of their authority.
Retain the small SHA helper and cohesive verifiers unless an audit justifies more.

**Validation:** Rust gates and native startup, preservation of all sixteen
command names and nine CLI branches, include-target equivalence, and unchanged
feature availability. For diagnostic branches not executed by native startup,
name the existing harness that exercises them and retain the model-scope limits
below. No new binary, feature, plugin, or command surface.

**Status:** Complete for NR-MAIN and the seven unchanged remaining targets.
CLI extraction passed independent baseline/post checks and is committed as
`2451b3d`. All remaining navigation candidates were audited and retained by SKIP.
NR-SUP's diagnostic placement is completed once in Milestone 3, with no second
body rewrite or forced broader directory tree.

### Milestone 6: Complete independent acceptance and documentation

**Work:** Close every inventory entry with its packet/report and actual old/new
paths. Review the aggregate diff for accidental logic changes, weakened tests,
private data, generated files, and unrelated edits. Document the final native
module map in `docs/development/agentic-refactoring.md` or another existing
appropriate contributor document only if it improves navigation; do not broaden
the generic skill scope incidentally.

Review the canonical diagram and overview against the resulting code. Internal
module moves do not by themselves change process, trust, persistence, or runtime
topology; record that conclusion and edit architecture only if its documented
model actually changes. An unexpected architectural change requires rescoping.

**Validation:** Independent PACKAGE/FINAL reports with the aggregate gates and
all triggered native/package evidence on the current identities. Archive this
plan and update both indexes only after required work is complete. A blocked
accepted CHANGE remains open; an evidence-backed SKIP may close normally.

**Status:** Complete. Both source units accepted/committed, all ten SKIPs recorded,
contributor navigation updated, architecture reviewed without topology change.
[PACKAGE](../evidence/native-rust-module-organization/NR-package-01.md) and
[FINAL](../evidence/native-rust-module-organization/NR-final-01.md) independently
pass against the complete fifteen-path source inventory. The plan is archived
with updated documentation indexes; documentation is committed separately from
the accepted source units.

## Testing and benchmark strategy

Every test, format, lint, build, and validation command runs from the repository
root in normal local PowerShell outside the managed sandbox. Record exact
commands, exit codes, feature mode, source identity, and relevant host/artifact
identity. Sandbox output is exploratory only. Do not run costly suites for this
documentation-only planning request.

### Rust baseline and per-unit acceptance

```powershell
pnpm.cmd format:check:rust
pnpm.cmd lint:rust
pnpm.cmd test:rust
```

The root scripts run Clippy with warnings denied and Cargo tests both normally
and with `release-locked-runtime`. Preserve the discovered test/assertion set
through moves; record renames and explain count differences. Keep unit tests
for malformed controls/frames, bounds, cancellation, containment, hash rejection,
and hardware fail-closed behavior. Run existing tests rather than adding a
mirror of every extracted helper.

### Runtime and artifact gates

The validator freezes applicable rows in each work order before edits. Record
N/A with a path-based reason for an untriggered gate; never silently omit one.

| Trigger | Existing command(s) | Evidence required |
| --- | --- | --- |
| Tauri registration, CLI, fake child, probe, supervisor, or startup wiring | `pnpm.cmd test:native-startup` | Fresh native build and WebView2/model-free protocol and service lifecycle, including supervised host matrix. |
| Shared runtime construction, synthesis lifecycle, cancellation, or profile dispatch | `pnpm.cmd test:tts:bilingual-portfolio-exact-host` | Piper/es, Piper/en, Chatterbox/es, Chatterbox/en on the exact candidate; record whole-command status separately from each arm. |
| Packaged runtime selection, packaged verifier, release cfg, or acquisition code | `pnpm.cmd package:windows` then `pnpm.cmd package:windows:check` | Fresh ordinary release-locked binary/installer and verified core; old installer receipts do not transfer. |
| Native host-admission boundary | `pnpm.cmd package:windows:ordinary-chatterbox:preflight` | Candidate installed binary identity and live native gate; preflight alone does not prove acquisition/narration. |
| Acquisition, installed verification/repair, activation/removal, or their release runtime integration | `pnpm.cmd package:windows:ordinary-chatterbox:preflight` and `pnpm.cmd package:windows:ordinary-chatterbox` | Exact candidate's acquisition cancellation/retry, verification, offline bilingual narration, restart, removal, Piper fallback selection, reacquisition, cleanup. |
| Installed layout, app-data/repair/removal ownership, or installer integration | `pnpm.cmd package:windows:lifecycle` | Current artifact's install, first-start, repair, retention/removal, and uninstall evidence. |

Under ADR-0051, current model-backed acceptance requires the four
Piper/Chatterbox arms, not Qwen promotion or repair. The existing portfolio
script still has six arms. Preserve its real exit status, report Qwen failure
or non-execution explicitly, and use scoped acceptance only with all four
required arms evidenced on the same patch. If an early failure prevents a
required arm, acceptance is blocked. Do not invent a four-arm script or change
the harness merely to obtain a green result. Existing Qwen deterministic tests,
cfg restrictions, and CLI behavior remain protected by review and Rust gates.

`pnpm.cmd test:tts:exact-host` and `pnpm.cmd test:tts:handoff-host` exist but
exercise historical Qwen-specific routes. They are not mandatory model runs
for a mechanical relocation under ADR-0051. If preserving an affected path
requires new Qwen runtime work, stop that unit and obtain separate scope rather
than treating deferral as proof of correctness.

Before installer/journey commands, inspect their current effects, payloads,
driver/model requirements, and consent. The ordinary journey downloads and
removes optional packages and installs/uninstalls the app; the lifecycle script
rejects a pre-existing installation. Use authorized test resources and preserve
the user's installation/data. Do not assume command names imply read-only work.
Missing necessary resources/authority block those gates, not planning.

Some build/journey commands write default tracked evidence files. Before a run,
record those paths, preserve existing evidence, and use a supported output
override where available (the ordinary journey supports `--receipt`). Record
actual invocations. If no override exists, arrange a disposable validation
checkout under an authorized setup order, run from its repository root, and
retain fresh output as a separate report. Do not overwrite or hand-edit
historical evidence, refresh a PASS by replacing hashes, or disable evidence
generation. Bind every installed run to the just-built artifact.

### Package and final gates

```powershell
pnpm.cmd check:portable
pnpm.cmd check
git diff --check
```

Run the portable aggregate after the coherent desktop group and the full native
aggregate before final acceptance. `check` includes repository format, lint,
types, tests, and builds; it does not replace triggered installed/model gates.
Use the browser gate only for a justified renderer integration concern; ordinary
rendered behavior edits are outside this plan. Any future authorized PR must
also satisfy the repository's current required checks, without treating CI as
a replacement for local Windows/exact-host evidence.

Avoid repeating an unchanged expensive gate without a new change or unresolved
concern. Evidence reuse must meet the immutable identity contract; new source,
HEAD, or validated paths require a new report and applicable reruns. Do not
claim Linux/Unix native coverage from `check:portable`; if Unix-specific native
code is altered rather than simply retained, scope an actual supported native
gate before accepting that change.

## Risks and rollback

| Risk | Containment |
| --- | --- |
| Cosmetic fragmentation or excessive visibility | Require concrete Audit Packet evidence; SKIP is valid; use private/super visibility and cohesive owners. |
| Deadlocks, double ownership, or stale PCM after extraction | Preserve lock scope/order, identities, Drop/cleanup behavior; exercise cancellation and real child containment. |
| Broken includes or different embedded bytes | Map resolved targets before/after; preserve exact authority content and both feature builds. |
| Tauri macro/export or CLI regression | Compare command/argument inventories; run native startup; retain same executable and release visibility. |
| Hardware privacy assertion scans only the old facade | Keep all forbidden-surface assertions covering the extracted implementation, plus existing report tests. |
| Expensive or destructive installed journeys | Inspect effects and current installation first; use authorized isolated resources and fresh receipts. |
| Old validation accepted after further edits | Freeze Report IDs/HEAD/path identities; block on drift and revalidate. |

Use small sequential units. On a failed unit, permit bounded correction or
remove only verified worker-authored changes; preserve pre-existing and accepted
work. Do not use broad reset/clean/restore operations or delete user data. Before
recursive Windows file operations, verify absolute targets are within the exact
owned test directory. Any rollback of committed work follows a separately
authorized Git action. No rejected patch advances to the next unit.

## Progress log

- 2026-10-09 closeout: accepted immutable NR-PACKAGE-01-20261009 and
  NR-FINAL-01-20261009, both PASS at
  `719dea00f824ef6e3bf92c531f0b04d9be14ceb9`, with independent before/after
  captures of [NR-SOURCE-MANIFEST-01](../evidence/native-rust-module-organization/NR-source-manifest-01.md).
  Portable/full checks, native WebView2 and diff checks pass. All six stages are
  complete; two changes and ten SKIPs, no rejected patch or open source work.
  Archived this plan and updated contributor/index navigation. No push, PR,
  merge, main update, model download or existing installation/data mutation.
- 2026-10-09 execution: independent NR-PACKAGE-01-20261009 PASS on `719dea0`:
  `pnpm.cmd check:portable` and `git diff --check` exit 0; fifteen source
  identities unchanged before/after and index empty. Shared 209, EPUB 651,
  desktop 587 plus 38 Node, Python 406 tests; generated contracts, type checks
  and portable builds pass. Ten SKIPs unchanged; all 41 includes resolve to
  the same 33 unique targets. Nonfatal pytest cache-permission and Vite chunk
  warnings disclosed. Separate FINAL capture and full native gates now running.
- 2026-10-09 execution: steward NR-SUP-COMMIT-01 passed immutable report/order/live
  agreement, exact staging, staged diff/blob inspection and pre-commit recheck.
  Local commit `719dea00f824ef6e3bf92c531f0b04d9be14ceb9`
  (`refactor(native): isolate model-free supervisor diagnostics`) contains only
  the two accepted paths; index empty after commit and all director documentation
  preserved. No remote operation. PACKAGE/FINAL validation now binds all fifteen
  current native source paths to this HEAD and compares the complete campaign
  against execution base `ed42154668bd71d500b5beab77485f9fd20ee2a2`.
- 2026-10-09 execution: accepted [NR-SUP-POST-01](../evidence/native-rust-module-organization/NR-SUP-post-01.md),
  PASS on `2451b3da80f3821081279e11869cb83a4ae67cd7` with exact two-path
  identities and passing before/after recheck. All five host gates pass, Rust
  counts 87/88 unchanged. Function text and fixture bytes equivalent; production
  owners untouched. Zero correction loops. Authorize exact source-only local
  commit; keep documentation outside its staging order.
- 2026-10-09 execution: NR-SUP Change Packet delivered exactly two paths and 223
  added/removed lines. The worker moved `run_host` unchanged apart from the
  necessary fixture include depth, retained its entry point by re-export and
  used explicit private-child imports. No tests or runtime methods changed.
  Director scope review passes; independent post-change validation is running.
- 2026-10-09 execution: [NR-SUP-BASELINE-01](../evidence/native-rust-module-organization/NR-SUP-baseline-01.md)
  PASS on `2451b3d`, pristine two-path allowlist and empty index, all five host
  commands passed, 87/88 Rust tests and native matrix. Issued the immutable
  [NR-SUP work order](../evidence/native-rust-module-organization/NR-SUP-work-order.md)
  for only `run_host` plus private child wiring, 280-line ceiling. Fixture bytes
  bound by SHA256; all runtime/model/lifecycle implementations remain protected.
- 2026-10-09 execution: steward order NR-MAIN-COMMIT-01 passed report/order/live
  SHA256/blob/status checks, exact staging/diff review and pre-commit recheck.
  Local commit `2451b3da80f3821081279e11869cb83a4ae67cd7`
  (`refactor(native): isolate diagnostic CLI dispatch`) contains only the three
  accepted source files. Index empty afterwards; plan/evidence preserved outside
  commit. No remote operation. NR-SUP fresh baseline requested on this new HEAD.
- 2026-10-09 execution: accepted [NR-MAIN-POST-01](../evidence/native-rust-module-organization/NR-MAIN-post-01.md),
  PASS on HEAD `ed42154668bd71d500b5beab77485f9fd20ee2a2`, exact three-path
  identities recorded in the immutable report and rechecked before/after all
  five host commands. Rust remains 87/88 and native WebView2 passes. Exact-text
  comparison preserves both CLI body and Tauri tail. Zero correction loops.
  Source commit may stage only this report's three paths; evidence stays separate.
- 2026-10-09 execution: [NR-MAIN-BASELINE-03](../evidence/native-rust-module-organization/NR-MAIN-baseline-03.md)
  passed every frozen command outside sandbox after process-local tool selection.
  Issued the immutable NR-MAIN work order. Worker moved the entire iterator/match
  unchanged into `diagnostics/cli.rs`, declared the narrow module and called it
  before Tauri setup. Change Packet: exactly three allowed files, 213 added plus
  removed lines, no tests or contracts changed, no deviations. Director diff
  review found the requested mechanical move; independent POST-CHANGE is running.
- 2026-10-09 execution: all twelve audits complete: two bounded CHANGE decisions
  (NR-MAIN CLI dispatch; NR-SUP model-free host diagnostic), ten SKIPs. Hardware,
  package verifiers, contracts, framing, probe, fake child, handoff and SHA retain
  their existing boundaries. See the [audit inventory](../evidence/native-rust-module-organization/audits.md).
- 2026-10-09 execution: NR-MAIN-BASELINE-01 was BLOCKED by global pnpm mismatch;
  existing Corepack pnpm 11.15.1 resolved it. [BASELINE-02](../evidence/native-rust-module-organization/NR-MAIN-baseline-02.md)
  passed format/Clippy/Rust (87/88) but native startup failed at WebView session
  creation on unchanged source. Host inspection found driver 150 versus runtime
  155. A new ignored test-only Microsoft-signed EdgeDriver 155.0.4283.45 was
  provisioned without replacing an existing driver or installation. Baseline-03
  repeats the unchanged commands with the supported process-local driver path.
  No implementation order issued while baseline acceptance is pending.
- 2026-10-09 execution: fresh inspection found a clean worktree and empty index
  on `codex/native-rust-module-organization` at
  `ed42154668bd71d500b5beab77485f9fd20ee2a2`. Reuse this dedicated branch without
  updating main. All twelve tracked native targets still exist. The named Sol
  auditor/worker/steward and Astra validator are available and have been started
  once for reuse, with no supporting delegation and one source writer maximum.
  Audits and validation-resource inspection are in progress; historical results
  are not execution evidence. No source work order has been approved yet.
- 2026-10-09: Created the planning document from current native source, scripts,
  architecture/ADR guidance, agent contracts, and the accepted MOD-B audit.
  Recorded twelve targets, six milestones, a conditional module tree, immutable
  review gates, and Rust-specific validation. Added documentation index links.
  Source implementation, agent campaign, baseline tests, and Git mutations have
  not started.
- 2026-10-09: Documentation-only validation in normal local PowerShell outside
  the sandbox passed (exit 0): all twelve required sections, six milestones,
  fourteen referenced repository scripts, existing file references and index
  links, balanced code fences, no trailing whitespace, sixteen current Tauri
  handlers, `git diff --check`, an empty index, and the exact three-file scope.
  These checks validate this plan, not the proposed runtime refactor.

## Discoveries and decisions

- Final structure intentionally stays mostly flat. Only `diagnostics/cli.rs`
  (with its module declaration) and the private supervisor `host_diagnostics.rs`
  are justified additions. There is no new generic TTS/packages/hardware tree.
- Reviewed `docs/architecture/system-diagram.md` and `overview.md` against both
  bounded patches. They retain the same Tauri owner, one child tree, protocol,
  trust/privacy boundaries, package verification, persistence and runtime/model
  selection. No diagram or architecture-text change is warranted; contributor
  navigation is documented separately. M005 narration preparation is untouched.
- Execution host inspection found an existing VoxLeaf installation and data
  root. Preserve them. Installer/journey commands are unavailable for this
  resource under current authorization; unrelated model-free units can proceed.
- NR-MAIN's initial closed unit is `main.rs`, new `diagnostics/mod.rs`, and new
  `diagnostics/cli.rs`, limited to the intact nine-branch CLI extraction (250
  added/removed lines maximum). Baseline/post commands are the three Rust
  scripts, native-startup, and `git diff --check`; see the audit record for all
  invariants and untriggered-gate reasons. No source order before baseline PASS.
- The flat twelve-file directory is not itself a defect. The strongest audit
  candidates are mixed runtime/adaptor/diagnostic responsibilities, not size.
- MOD-B already accepted keeping Chatterbox together. This plan preserves that
  evidence and requires a newly justified CHANGE before an extraction.
- Refactor skills describe TypeScript, but their review/identity discipline
  applies with explicitly supplied Rust commands, as in the prior MOD-B plan.
- Fake-child/probe/handoff code is callable in the executable, so moving it to
  test-only compilation would change behavior. The proposed diagnostics folder
  describes purpose, not a new build boundary.
- Hardware contains a source-inspection privacy test. Moving only its facade
  without extending its scan would silently reduce coverage.
- No new roadmap or milestone number is needed. The existing roadmap and
  previously completed plans remain unchanged; this plan owns execution tracking.

## Final validation results

Implementation: **Complete: two independently accepted source units committed
locally, aggregate PACKAGE and FINAL PASS.** Five source paths changed (229 insertions,
207 deletions); ten original files retain their implementation. No installed-
artifact or model-backed runtime acceptance is claimed by this campaign.

| Check | Result |
| --- | --- |
| Planning documentation checks | Historical planning PASS retained above; not execution acceptance |
| Twelve fresh audits | Two CHANGE, ten SKIP; current source and MOD-B compared independently |
| NR-MAIN baseline | BASELINE-03 PASS; attempts 01/02 retain tool-version/environment failures |
| NR-MAIN post-change | POST-01 PASS; exact body/Tauri tail, five host commands, Rust 87/88, native WebView2 |
| NR-SUP baseline | BASELINE-01 PASS on post-NR-MAIN HEAD, five host commands |
| NR-SUP post-change | POST-01 PASS; exact body/fixture, five host commands, Rust 87/88, native matrix/WebView2 |
| Piper/Chatterbox model and installed-package gates | N/A: shared model/runtime/lifecycle/selection/admission/acquisition/verifier/install owners unchanged; not run |
| Independent package report | NR-PACKAGE-01 PASS, portable aggregate and diff check, fifteen stable identities |
| Independent final report | NR-FINAL-01 PASS on `719dea0`; `pnpm.cmd check`, `pnpm.cmd test:native-startup`, `git diff --check` all exit 0; fifteen identities stable |
| Architecture diagram/overview review | Same component/process/trust/persistence/runtime topology; no edit needed |
| Documentation closeout/archive | Contributor map and indexes updated; plan archived after independent source PACKAGE/FINAL acceptance |

Unix native branches and model-backed diagnostic CLI branches were not executed.
Qwen remains deferred under ADR-0051 with existing code/tests retained. Existing
installation and personal data remain untouched; installer commands were not
needed and were not run. No push, PR, merge or main update is authorized.
