# Native Rust test layout

Created: 2026-10-09. Status: completed; ten units and all host aggregate gates accepted; changes unstaged.

## Goal

Separate the existing native Rust unit tests from production source into private
child files, and move the existing Windows hardware-probe submodule into its
own file. Improve navigation while preserving the current logical module tree,
runtime behavior, test coverage, privacy boundaries, and frozen authority.

This maintenance plan spans native work introduced by M007, M010, and M011. It
does not add a product roadmap milestone or reopen their acceptance. It builds
on the [completed native organization plan](../completed/native-rust-module-organization.md),
whose diagnostic extractions and recorded SKIP decisions remain valid.

The execution request authorized all six stages, ten units, validations and
documentation. The existing branch was retained. All source and documentation
changes remain unstaged and uncommitted; no branch creation/switch, main update,
push, PR or package publication was performed.

## User-visible outcome

Contributors can read a production module without scrolling through its unit
tests, and find those tests at `<module>/tests.rs`. The hardware detector's
Windows-specific implementation is separately navigable. Reading, narration,
hardware admission, acquisition, process ownership, cancellation, and cleanup
behave as before.

Completion means all ten eligible owners use the agreed test layout, the
existing Windows submodule has its own file, and validation demonstrates that
no tests or behavior were lost. There is no arbitrary maximum line count, new
performance claim, or requirement to split every remaining large file.

## Current state

Planning inspected `main` at
`7a04ecbe26cab1230e8d089b1fe7cd543515bec4`. The index and worktree were clean
before this plan's documentation edits. This is provenance, not an execution
baseline; inspect the actual checkout again before implementation.

The planning snapshot contained fifteen Rust files under `apps/desktop/src-tauri/src/`. Nine
production files contained inline `tests` modules; a tenth,
`tts_protocol_contract.rs`, contained test-only fixture tables and four
root-level tests. The crate retains a binary entry point and no `lib.rs`.

All source paths in the following queue are relative to
`apps/desktop/src-tauri/src/`. Line counts include tests, comments, and blank
lines; they describe the inspected snapshot, not defects. All destinations in the table now exist and have independent acceptance.

| Unit | Existing owner | Lines | New unit-test file | Implementation status |
| --- | --- | ---: | --- | --- |
| NRTL-HASH | `sha256_hex.rs` | 41 | `sha256_hex/tests.rs` | Accepted (unstaged) |
| NRTL-FRAMING | `tts_service_protocol.rs` | 355 | `tts_service_protocol/tests.rs` | Accepted (unstaged) |
| NRTL-CORE | `tts_release_core.rs` | 484 | `tts_release_core/tests.rs` | Accepted (unstaged) |
| NRTL-FAKE | `tts_service_fake_child.rs` | 408 | `tts_service_fake_child/tests.rs` | Accepted (unstaged) |
| NRTL-HANDOFF | `tts_service_handoff.rs` | 557 | `tts_service_handoff/tests.rs` | Accepted (unstaged) |
| NRTL-CB | `tts_optional_chatterbox.rs` | 3,127 | `tts_optional_chatterbox/tests.rs` | Accepted (unstaged) |
| NRTL-SUP | `tts_service_supervisor.rs` | 1,953 | `tts_service_supervisor/tests.rs` | Accepted (unstaged) |
| NRTL-CONTRACT | `tts_protocol_contract.rs` | 643 | `tts_protocol_contract/tests.rs` | Accepted (unstaged) |
| NRTL-PROBE | `tts_protocol_probe.rs` | 684 | `tts_protocol_probe/tests.rs` | Accepted (unstaged) |
| NRTL-HW | `host_profile_detection.rs` | 1,678 | `host_profile_detection/tests.rs` | Accepted (unstaged) |

NRTL-HW also creates `host_profile_detection/windows_probe.rs` from the
existing private `windows_probe` module. Its production and test movements
form one cohesive, three-file unit so its source-inspection test can cover the
complete final implementation in a single accepted patch.

The other five files have explicit dispositions:

- `hardware_profile_authority.rs` already contains only tests and is included
  under `#[cfg(test)]` from `main.rs`: retain it unchanged.
- `main.rs` remains the Tauri registration, managed-state, startup, and exit
  owner; retain the completed reduction to 63 lines.
- `diagnostics/mod.rs`, `diagnostics/cli.rs`, and
  `tts_service_supervisor/host_diagnostics.rs` contain executable diagnostic
  wiring, not embedded unit-test suites: retain them unchanged.

The previous campaign's PASS results remain historical evidence. This execution
established a fresh clean baseline at HEAD
`f06c80e04da2025342b1002a548f03ca17e7cc0b` on the existing
`codex/native-rust-test-layout` branch. The final source tree has 26 Rust
files, all ten private test children, and the separate Windows child. The five
excluded sources remain byte-identical. See the
[evidence index](../evidence/native-rust-test-layout/README.md) for fresh reports.

## Scope and non-goals

In scope are the ten test-file moves, their private module declarations and
necessary test-only imports/helpers, the existing Windows module extraction,
fixture-path corrections, preservation of the hardware source scan, and
documentation of the contributor convention.

Keep production owner filenames and their logical module paths. Do not create
generic `hardware/`, `tts/`, `utils/`, or shared test-framework layers merely to
reduce file sizes. In particular, retain Chatterbox verification/mutation
ownership and supervisor lifecycle ownership. The previous SKIPs are not
permission to redesign those owners.

Do not change assertions, fixtures, protocol fields, limits, Tauri commands,
features, dependencies, Cargo targets, package manifests, generated files,
frozen authorities, completed plans, or historical evidence. Do not introduce
`lib.rs`, public test hooks, or Cargo integration-test crates under
`apps/desktop/src-tauri/tests/` for these private unit tests.

This is the user's explicit layout preference, not a claim that inline Rust
tests are incorrect. Small modules such as `sha256_hex.rs` participate in the
chosen convention. A fresh audit verifies safe relocation; an earlier SKIP
based on cohesive production logic does not cancel the requested test move.
Already separate tests and runtime diagnostics remain documented exclusions.
If a move requires behavioral or visibility changes, report the concrete
blocker instead of silently omitting that unit or expanding the refactor.

## Relevant files and documentation

Read the current versions before execution:

- `AGENTS.md`, `.agents/PLANS.md`, and [the documentation index](../../README.md).
- [MVP requirements](../../product/mvp.md), [architecture overview](../../architecture/overview.md),
  [canonical system diagram](../../architecture/system-diagram.md), and
  [roadmap](../roadmap.md).
- [ADR-0016](../../architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md),
  [ADR-0019](../../architecture/decisions/ADR-0019-privacy-safe-hardware-profiles-and-recovery.md),
  and [ADR-0051](../../architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md).
- [Agentic refactoring](../../development/agentic-refactoring.md) and
  [testing guidance](../../development/testing.md).
- `.agents/skills/orchestrate-safe-refactor/SKILL.md` and its
  `references/refactor-contracts.md`; `.agents/skills/validate-safe-refactor/SKILL.md`
  and its `references/validation-matrix.md`.
- `package.json`, `apps/desktop/package.json`,
  `apps/desktop/src-tauri/Cargo.toml`, all source owners in the queue, their
  direct callers, and the fixtures embedded by each test.
- [Previous audit record](../evidence/native-rust-module-organization/audits.md)
  and [previous final validation](../evidence/native-rust-module-organization/NR-final-01.md).

The Rust Book's [test organization](https://doc.rust-lang.org/book/ch11-03-test-organization.html)
explains private unit tests versus integration tests. The Rust Reference's
[module source filenames](https://doc.rust-lang.org/reference/items/modules.html#module-source-filenames)
defines the separate-file layout used here. Both inline and separate-file
child modules are valid; this project is selecting the latter for navigation.

## Architecture and constraints

### Private test-module convention

Keep `<owner>.rs` as the parent. Replace its inline test module with:

```rust
#[cfg(test)]
mod tests;
```

Put the former module body, including its existing tests and local helpers,
in `<owner>/tests.rs`. Preserve `use super::*;` and any explicit imports needed
there. Do not copy the enclosing `mod tests { ... }` wrapper into that file.
This retains the logical `owner::tests` path and access to private parent items
without increasing production visibility. Do not create both `<owner>.rs` and
`<owner>/mod.rs`, or add unnecessary `#[path]` overrides.

Keep test-only helpers under this compilation boundary. Do not move helpers
also used by executable paths into test files. Preserve existing `windows`,
`unix`, and `release-locked-runtime` conditions and test cleanup/locking.

### Contract and frozen-probe exceptions

For NRTL-CONTRACT, move `VALID_FIXTURES`, `INVALID_FIXTURES`,
`validate_control_fixture`, and the four root-level tests into the child. Keep
all production validators/constants unchanged. Preserve the fifteen valid
and three invalid fixture entries. The only planned test-identity changes are:

| Before | After |
| --- | --- |
| `tts_protocol_contract::rust_fixture_surface_matches_every_closed_control_kind` | `tts_protocol_contract::tests::rust_fixture_surface_matches_every_closed_control_kind` |
| `tts_protocol_contract::rust_fixture_surface_rejects_shared_invalid_controls` | `tts_protocol_contract::tests::rust_fixture_surface_rejects_shared_invalid_controls` |
| `tts_protocol_contract::rust_fixture_surface_keeps_frozen_maximum_arithmetic` | `tts_protocol_contract::tests::rust_fixture_surface_keeps_frozen_maximum_arithmetic` |
| `tts_protocol_contract::rust_boundary_rejects_nested_narration_and_audio_drift` | `tts_protocol_contract::tests::rust_boundary_rejects_nested_narration_and_audio_drift` |

For NRTL-PROBE, keep the entire `#[cfg(test)] mod frozen_authority` block
unchanged in the parent, including its values and compilation condition.
This is an explicit exception to moving test-only declarations: frozen
authority is protected, while executable tests move. Preserve the child's
`use super::frozen_authority::*;` and `use super::*;`. Move the four test-only
helpers `dimensions_within_limit`, `audio_dimensions_are_valid`,
`count_within_limit`, and `within_timeout` into the child; remove only the
now-unused parent test-only wildcard import. Preserve all nine test identities
and assertions. Never merge the independent probe with production framing.

### Compile-time fixtures and source inspection

For every relocated `include_str!` or `include_bytes!`, record its original
resolved repository path and fixture hash before editing. Nested test files
require one additional `../` to reach existing shared/package fixtures.
Change the include spelling, not its target or bytes. This applies to contract,
Chatterbox, release-core, fake-child, protocol, and supervisor tests. Includes
remaining in production files retain their current paths.

The hardware privacy test is a different case: it embeds implementation source,
which intentionally changes shape. After NRTL-HW, its coverage must include
`../host_profile_detection.rs`, `windows_probe.rs`, and `tests.rs`, all resolved
from `host_profile_detection/tests.rs`. The old scan included the inline tests
as well as production code. Check every resulting source against the existing
forbidden strings; retain the fragmented literals that avoid matching the
scan's own definitions. Include the Windows source even when the test runs on
a non-Windows host. Scanning only the smaller parent would weaken the test.

### Existing Windows module boundary

Use `#[cfg(windows)] mod windows_probe;` in the same parent and move the
existing module body into `host_profile_detection/windows_probe.rs`. Preserve
`WindowsHostProbe`'s `pub(super)` visibility, imports, FFI, trusted library
loading, handle cleanup, adapter bounds, and error-to-availability mapping.

Keep report types, `HostProbePort`, normalization, non-Windows handling,
`HOST_PROBE_ACTIVE`, admission, and the Tauri command in their current owner.
There is no new abstraction, dependency, process, persistence owner, or logical
module boundary. Review the system diagram at closeout; no diagram change is
expected for these physical-file movements.

### Behavioral invariants

EPUB contents and inference remain local; generated audio remains transient.
Cancellation, identity invalidation, one-child ownership, bounded buffers,
timeouts, and content-free diagnostics remain unchanged. No narration,
normalization, locator mapping, or malformed-EPUB handling code is in scope.
The SHA helper's vectors, verifier rejection cases, temporary-root cleanup,
Windows Job Object tests, release feature gates, protocol errors, and probe
concurrency checks retain their existing semantics. Synthetic-child, handoff,
probe, and supervisor host diagnostics remain available in non-test builds.

### Execution and acceptance ownership

Apply `$orchestrate-safe-refactor` and `$validate-safe-refactor` with an explicit
Rust adaptation: use this source inventory and the Rust commands below in
place of their generic TypeScript inventory and focused checks. Retain their
Audit Packet, Work Order, identity, correction, and Validation Report contracts.
Planning findings are not baseline or implementation approvals.

The primary task directs; reuse one `clean_code_auditor` and one
`clean_code_worker` using GPT-6.1 Sol high, plus one `refactor_validator` using
GPT-6 Astra high. Only the worker writes source, one unit at a time. Supporting
agents do not delegate. If Git operations are authorized, reuse a
`git_steward` using GPT-6.1 Sol medium; keep at most four supporting roles
alongside the director. Record steward unavailability before the director
performs an authorized order. Do not substitute an unavailable auditor,
worker, or validator model. This refactor uses its validator, without adding
a feature/bug `change_reviewer` gate.

For each unit, obtain a fresh audit, a passing host baseline, and then a frozen
work order naming exact paths, symbols, forbidden edits, commands, and a diff
ceiling based on the measured moved bodies. Normal units allow only the parent
and new test file; NRTL-HW allows those plus its Windows child. Mechanical
movement produces a large line diff without authorizing unrelated edits.

Keep the index empty and each new unit's allowlisted paths free of pre-existing
changes. Preserve unrelated work. When commits are not authorized, accepted
disjoint units may remain unstaged; the queue deliberately touches each parent
in only one unit. Record accepted file identities so later work cannot silently
change them. Do not carry a rejected patch into another unit. Allow at most two
correction loops before redesigning the order.

Keep source writers and Git mutations idle throughout validation. Reports bind
an immutable Report ID, HEAD, closed allowlist, and before/after path identities;
new files are `ABSENT` at baseline. Drift requires new validation, not refreshed
hashes on an old approval. Authorized staging/commits must consume the exact
accepted report and path identities and inspect the staged names and diff.
Branch setup must respect the execution request; this plan does not direct an
automatic update of `main` or any remote mutation.

During execution, store new content-safe reports under the proposed
`docs/plans/evidence/native-rust-test-layout/` directory, outside their own
validated source manifests. Update this plan serially while agents are idle;
include documentation in a separate closeout manifest. Never rewrite earlier
campaign evidence.

## Milestones

### 1. Establish the current inventory and baseline

**Work:** Reinspect HEAD, worktree/index, script definitions, all fifteen source
files, and role availability. Record all test functions, conditions, fixture
include targets, and protected source blocks. Confirm the ten-unit queue and
five exclusions against the current source. Prepare the first bounded order.

**Validation:** The independent validator runs the three Rust scripts below
before source edits, captures both feature configurations and test identities,
and issues BASELINE evidence. A relevant existing failure is `BASELINE-FAIL`;
do not rewrite tests to make a relocation possible. Each later unit gets its
own current-state baseline under the same contract.

**Status:** Complete.

### 2. Establish the layout in the smaller owners

**Work:** Execute NRTL-HASH, NRTL-FRAMING, NRTL-CORE, NRTL-FAKE, and
NRTL-HANDOFF sequentially as separate accepted units. Start with SHA to exercise
private child resolution. Its four known-answer vectors remain one test.
Retain runtime-callable synthetic-child and handoff code in their parents.

**Validation:** Per-unit baseline/post-change Rust scripts, exact test inventory
comparison, assertion review, and resolved-fixture comparison. No new shared
test abstraction or production visibility is needed.

**Status:** Complete.

### 3. Separate the larger stateful suites

**Work:** Execute NRTL-CB and NRTL-SUP as separate units. Move their suites and
local fixtures together. Preserve Chatterbox's temporary-root ownership,
cleanup, concurrency helpers, and installed-state locking tests. Preserve
supervisor feature/Windows conditions and process-assignment failure helpers.
Leave `host_diagnostics.rs` and production lifecycle/package owners intact.

**Validation:** Per-unit baseline/post-change Rust scripts and inventory checks
for both feature configurations, including platform-conditioned tests on the
appropriate host. Compare embedded fixture identities and test cleanup logic.

**Status:** Complete.

### 4. Separate contract and independent-probe tests

**Work:** Execute NRTL-CONTRACT and NRTL-PROBE separately using the exact
fixture, helper, namespace, and frozen-authority rules above.

**Validation:** Per-unit baseline/post-change Rust scripts. Account for all
eighteen contract fixtures, the four intentional test-path mappings, all nine
unchanged probe test paths, and the unchanged frozen-authority block. Production
probe entry points remain compiled outside `cfg(test)`.

**Status:** Complete.

### 5. Organize hardware detection and preserve source coverage

**Work:** Execute NRTL-HW as one unit with exactly three source paths. Externalize
the tests and existing Windows child, then make the existing source-inspection
test examine the complete resulting source set. Preserve the injected probe
port, normalization, bounded report, privacy checks, and live Windows test.

**Validation:** Per-unit baseline/post-change Rust scripts on Windows, including
the live `production_windows_probe_emits_only_the_bounded_report` test. Review
the relocated FFI/cleanup body and source-scan coverage. A non-Windows compile
cannot establish Windows acceptance. No hardware-support promotion follows
from the current host result.

**Status:** Complete.

### 6. Document the convention and validate the complete result

**Work:** Update `docs/development/testing.md` with the private child-test
convention and exceptions; update `docs/development/agentic-refactoring.md`'s
native navigation section with the actual paths. Inspect the final source
inventory for omitted or duplicate tests and retained runtime diagnostics.
Review the canonical diagram and record why its architecture remains accurate.

**Validation:** Run the package and final gates below, review the complete diff
and protected artifacts, and obtain independent FINAL acceptance for the current
source identities. Record exact outcomes and remaining host limitations.

**Closeout:** Only after all ten units and final validation pass, complete the
progress/results sections, move this plan to `docs/plans/completed/`, and update
`docs/plans/active/README.md` and `docs/README.md`. Validate links after the move.
The original completed native plan and its evidence remain unchanged.

**Status:** Complete.

## Testing and benchmark strategy

Run every acceptance command from the repository root in normal local
PowerShell outside the managed sandbox. Sandbox runs are exploratory and must
be repeated unchanged on the host. Commands below exist in `package.json` at
the inspected revision; recheck them before execution.

For each source unit, use these commands for baseline and post-change evidence:

```powershell
pnpm.cmd format:check:rust
pnpm.cmd lint:rust
pnpm.cmd test:rust
```

The lint and test scripts both cover default and `release-locked-runtime`
configurations. Capture test names/results from each test run separately;
reject disappearance, duplication, newly ignored tests, changed conditions, or
unexpected renames. Apply only the four contract-name mappings listed above.
Equal counts alone are insufficient. Track Windows-only and Unix-only cases
explicitly; Windows evidence does not claim Unix execution. Source counts and
previous campaign results are not a substitute for the fresh collected suite.

After the coherent native package group, run:

```powershell
pnpm.cmd check:portable
```

Before accepting the complete campaign, run:

```powershell
pnpm.cmd check
pnpm.cmd test:native-startup
```

`check:portable` does not compile Rust and is not a cross-platform Rust gate.
`check` includes Rust format/lint/tests and the native desktop build. The
native-startup script builds and exercises packaged WebView2/native diagnostic
wiring, providing a final check that runtime helpers were not accidentally
made test-only. Run these aggregate gates once for the accepted batch; repeat
only when corrections or identity drift invalidate their evidence.

Fixture hashes, unchanged assertions, private visibility, the protected probe
block, and hardware source-scan coverage are independent review criteria in
addition to command success. Preserve current platform and feature conditions;
if an appropriate non-Windows Rust host is unavailable, disclose that untested
scope without disabling or claiming those tests passed.

No new benchmark, model download, installer replacement, real acquisition,
firewall change, or model-backed journey is required by the specified physical
moves. This plan makes no latency, VRAM, or throughput claim. If implementation
reveals a runtime logic change, stop the unit, revise its scope and applicable
host gates, and establish fresh evidence rather than treating it as relocation.
Retain Qwen code/tests and its deferred status under ADR-0051.

## Risks and rollback

| Risk | Prevention and recovery |
| --- | --- |
| Tests compile out or gain an extra nested namespace | Verify `#[cfg(test)] mod tests;`, compare collected identities for both features, and reject missing/duplicate tests. |
| A moved include resolves to the wrong file | Compare resolved target paths and fixture hashes; fix only the relative path. |
| Hardware privacy coverage narrows to the parent | Keep the existing forbidden strings and inspect parent, Windows child, and separated tests. |
| A convenient shared helper changes production visibility or ownership | Preserve private child access and keep runtime helpers in their current owner; reject scope expansion. |
| Frozen authority or historical evidence drifts | Preserve the complete protected block and fixture bytes; inspect the complete diff against the baseline. |
| Platform/feature-specific behavior is missed | Retain conditional attributes and record host-specific collection and validation limits. |
| A failed or drifting patch contaminates later work | Pause that unit, correct it within its order or remove only verified worker-authored changes; require a fresh report before proceeding. |

Each unit's allowed paths are its rollback boundary. Without commits, reverse
only its verified patch while preserving other accepted or user-authored work.
If local commits were authorized, record the exact unit commit for a subsequent
authorized revert; do not reset, clean, rewrite history, or discard unrelated
changes. Do not alter installations, books, model caches, or generated audio.

## Progress log

- 2026-10-09: Created this plan from the current source and the completed native
  organization record. The requested change is physical test separation plus
  extraction of the existing Windows child, preserving production ownership.
- 2026-10-09: Read-only planning audit confirmed the contract fixture/test move
  and the probe move with its frozen-authority exception. No source edits,
  runtime validation, branch creation, staging, or commits were performed.
- 2026-10-09: Documentation checks passed in normal local PowerShell outside
  the sandbox: twelve required sections, six milestones, thirteen local links,
  six existing script names, ten proposed test destinations, and exactly the
  three intended documentation changes. A second read-only planning review
  found no actionable issue in the contract/probe instructions.
- Execution progress is recorded below; evidence is separate from the prior campaign.

- 2026-10-09: Execution authorized for all six stages and ten units, with no
  staging, commits, branch changes, main update, push, PR or publication. Fresh
  host inspection found clean worktree/index on existing branch
  `codex/native-rust-test-layout`, HEAD
  `f06c80e04da2025342b1002a548f03ca17e7cc0b`. Reused role instances were created
  with requested models: auditor/worker GPT-6.1 Sol high, validator GPT-6 Astra
  high, each bound to the current repository role instructions; no steward is
  needed because Git mutations are forbidden. The worker remains idle during
  validation. Current source inventory records 15 files, 41 literal includes,
  90 source test functions with conditions, and protected/excluded identities in
  [initial inventory](../evidence/native-rust-test-layout/initial-inventory.json.txt).
  NRTL-HASH audit CHANGE accepted, two paths/60-line ceiling; independent
  [NRTL-HASH-BASELINE-01](../evidence/native-rust-test-layout/NRTL-HASH-BASELINE-01/report.md)
  passes all three exact Rust commands outside sandbox, 87 default and 88
  release tests, unchanged identities and empty index. The immutable
  [work order](../evidence/native-rust-test-layout/NRTL-HASH-order-01.md) is now
  approved. Existing Corepack shim selects pinned pnpm 11.15.1 through
  process-local PATH only; no toolchain configuration was edited. Unix-only
  tests are retained but not executed on this Windows host.
- 2026-10-09: NRTL-HASH accepted after independent [NRTL-HASH-POST-01](../evidence/native-rust-test-layout/NRTL-HASH-POST-01/report.md), all three exact host Rust gates passed, test identities/results and source invariants preserved, live accepted identities rechecked, index empty. Source changes remain unstaged; no Git mutations.

- 2026-10-09: NRTL-FRAMING accepted after independent [NRTL-FRAMING-POST-01](../evidence/native-rust-test-layout/NRTL-FRAMING-POST-01/report.md), all three exact host Rust gates passed, test identities/results and source invariants preserved, live accepted identities rechecked, index empty. Source changes remain unstaged; no Git mutations.

- 2026-10-09: NRTL-CORE accepted after independent [NRTL-CORE-POST-01](../evidence/native-rust-test-layout/NRTL-CORE-POST-01/report.md), all three exact host Rust gates passed, test identities/results and source invariants preserved, live accepted identities rechecked, index empty. Source changes remain unstaged; no Git mutations.

- 2026-10-09: NRTL-FAKE accepted after independent [NRTL-FAKE-POST-01](../evidence/native-rust-test-layout/NRTL-FAKE-POST-01/report.md), all three exact host Rust gates passed, test identities/results and source invariants preserved, live accepted identities rechecked, index empty. Source changes remain unstaged; no Git mutations.

- 2026-10-09: NRTL-HANDOFF accepted after independent [NRTL-HANDOFF-POST-01](../evidence/native-rust-test-layout/NRTL-HANDOFF-POST-01/report.md), all three exact host Rust gates passed, test identities/results and source invariants preserved, live accepted identities rechecked, index empty. Source changes remain unstaged; no Git mutations.

- 2026-10-09: NRTL-CB accepted after independent [NRTL-CB-POST-01](../evidence/native-rust-test-layout/NRTL-CB-POST-01/report.md), all three exact host Rust gates passed, test identities/results and source invariants preserved, live accepted identities rechecked, index empty. Source changes remain unstaged; no Git mutations.

- 2026-10-09: NRTL-SUP accepted after independent [NRTL-SUP-POST-01](../evidence/native-rust-test-layout/NRTL-SUP-POST-01/report.md), all three exact host Rust gates passed, test identities/results and source invariants preserved, live accepted identities rechecked, index empty. Source changes remain unstaged; no Git mutations.

- 2026-10-09: NRTL-CONTRACT accepted after independent [NRTL-CONTRACT-POST-01](../evidence/native-rust-test-layout/NRTL-CONTRACT-POST-01/report.md), all three exact host Rust gates passed, test identities/results and source invariants preserved, live accepted identities rechecked, index empty. Source changes remain unstaged; no Git mutations.

- 2026-10-09: NRTL-PROBE accepted after independent [NRTL-PROBE-POST-01](../evidence/native-rust-test-layout/NRTL-PROBE-POST-01/report.md), all three exact host Rust gates passed, test identities/results and source invariants preserved, live accepted identities rechecked, index empty. Source changes remain unstaged; no Git mutations.

- 2026-10-09: NRTL-HW accepted after independent [NRTL-HW-POST-01](../evidence/native-rust-test-layout/NRTL-HW-POST-01/report.md), all three exact host Rust gates passed, test identities/results and source invariants preserved, live accepted identities rechecked, index empty. Source changes remain unstaged; no Git mutations.


- 2026-10-09: All ten units independently accepted. Supplemental read-only auditor
  found no actionable source issue. [NRTL-PACKAGE-01](../evidence/native-rust-test-layout/NRTL-PACKAGE-01/report.md)
  passed `pnpm.cmd check:portable` on the host. Testing/navigation convention
  and evidence index now documented. Full/native-startup aggregate acceptance
  and final archival remain outstanding.

- 2026-10-09: All ten units accepted with individual fresh BASELINE and POST reports.
  Aggregate [NRTL-PACKAGE-01](../evidence/native-rust-test-layout/NRTL-PACKAGE-01/report.md)
  and [NRTL-FINAL-01](../evidence/native-rust-test-layout/NRTL-FINAL-01/report.md)
  pass the three specified host aggregate commands. All source identities remain
  accepted; source writers stayed idle. Updated contributor testing/navigation
  guidance and evidence navigation. Reviewed the canonical architecture diagram:
  no runtime topology, owner or trust boundary changed. Archived this plan and
  updated active/completed/documentation indexes; a separate documentation
  receipt verifies this closeout without changing the source manifests.
## Discoveries and decisions

- Inline Rust unit tests are idiomatic. Separate private child files are also
  supported and meet the user's explicit navigation preference without an API
  expansion or conversion to integration tests.
- Test separation applies to all ten eligible owners, including the small SHA
  helper. Already independent hardware-authority tests stay where they are.
- Preserve the earlier Chatterbox and supervisor ownership decisions. A long
  remaining production file is not, by itself, a new refactoring requirement.
- Move the existing `windows_probe` child physically; keep report types,
  normalization, admission, and commands together. Combine its test and source
  move into one bounded unit to preserve the complete source-scan contract.
- Keep the frozen probe authority in place. Move its executable tests and
  test-only helpers without consolidating independent evidence with production
  protocol code.
- Only four contract test paths intentionally change. All other existing test
  names, conditions, assertions, and fixture identities must be preserved.
- The canonical system diagram describes the same runtime topology after these
  movements. Contributor testing/navigation docs now record the convention.

## Final validation results

| Area | Result |
| --- | --- |
| Fresh baseline and coordination | Clean initial worktree/index, unchanged execution HEAD, exact requested auditor/worker/validator models; one source writer, idle during validation. |
| Ten unit baselines and post-change reports | PASS: each unit independently ran `format:check:rust`, `lint:rust` and `test:rust` before/after editing. See [all twenty reports and ten orders](../evidence/native-rust-test-layout/README.md). |
| Tests, assertions and conditions | PASS: exact 87 default / 88 release-locked Windows names/results, with only the four documented contract namespace mappings. All ninety source test functions retained. Two Unix-only tests remain unexecuted on this host. |
| Fixtures, frozen authority and exclusions | PASS: original fixture targets/bytes, complete frozen probe block, five excluded sources and executable diagnostics preserved. |
| Hardware extraction and privacy scan | PASS: unchanged Windows implementation/visibility/FFI/cleanup; all fifteen hardware tests execute on Windows. Existing privacy assertions inspect all three resulting sources unconditionally. |
| Portable package gate | PASS: [NRTL-PACKAGE-01](../evidence/native-rust-test-layout/NRTL-PACKAGE-01/report.md), `pnpm.cmd check:portable`. This is not non-Windows Rust evidence. |
| Full repository and native startup | PASS: [NRTL-FINAL-01](../evidence/native-rust-test-layout/NRTL-FINAL-01/report.md), `pnpm.cmd check` and `pnpm.cmd test:native-startup`, tied to the final source identities. |
| Architecture and navigation | Reviewed canonical diagram: private file moves preserve runtime topology, trust boundaries and ownership, so no diagram edit is needed. Testing/navigation convention and plan indexes updated. |
| Archive and documentation receipt | All six stages complete; archived here after source FINAL acceptance. Separate documentation identity/link review is recorded as `NRTL-DOCS-FINAL-01` alongside the source evidence. |
| Git and remaining scope | HEAD unchanged; empty index; all changes unstaged, no commits/push/PR/publication. No non-Windows Rust execution, model-backed journey or new performance/general-hardware claim. |

The reports preserve immutable source identities; later source changes require
new validation. Documentation has a separate closeout manifest so archiving
does not rewrite source acceptance. Raw local logs and the byte-preserving
`.json.txt` evidence format are explained in the evidence index.