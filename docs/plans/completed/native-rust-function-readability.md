# Native Rust function readability

Status: implemented and independently accepted. All four extractions, three
unit baselines/post-change gates and combined runtime/package/installed gates
passed. Original host data and installation state were verified after candidate
removal. Changes remain unstaged and uncommitted. Documentary closeout is
recorded separately in the evidence directory.
Prepared on 2026-10-13. Implementation branch:
`codex/native-rust-function-readability`, created from clean, up-to-date `main`
at `5b0161a85f21c13d05ac9d36d3645117de825fe9`.

## 1. Goal

Implement four bounded readability improvements in the native desktop code:

1. Name and share receipt of an expected service state.
2. Name and share the installed Chatterbox manifest identity check.
3. Share resolution of the common development-service paths and dependencies.
4. Share the diagnostic wait-for-active-generation and cancellation sequence.

Use private functions or methods inside their existing Rust owners. No new
production module is necessary. This maintenance plan spans the native work
introduced by M007, M010 and M011; it does not reopen those milestones or the
completed native module-organization and test-layout plans.

## 2. User-visible outcome

The same messages, state transitions, timeouts, errors, runtime admission,
package verification, cancellation and cleanup remain observable. Contributors
can read named operations instead of maintaining repeated decision sequences.
Tests characterize the specific distinctions that an extraction could obscure.

No feature, performance improvement, broader hardware support or correction of
a demonstrated runtime defect is claimed. Local EPUB handling, local inference,
bounded in-memory audio and zero default audio persistence remain unchanged.

The original planning request authorized this plan, its two index links, a branch from
main and a local documentation commit. It does not authorize implementing the
source changes or making later source commits, a push or a PR. A subsequent
execution request supplies implementation authority and its applicable Git
limits; do not infer those permissions from the planning commit.

## 3. Current state

Planning inspected the clean main revision identified above. These are current
source observations, not runtime baseline results. Line numbers are navigation
aids and must be refreshed before implementation.

| Recommendation | Current evidence | Planning disposition |
| --- | --- | --- |
| Expected service state | `tts_service_supervisor.rs:1022,1028,1049,1053,1060,1119,1143,1267,1271` repeat receipt of a `state` control, string comparison and `ProtocolRejected`. | CHANGE: one private supervisor method. |
| Installed manifest identity | `tts_optional_chatterbox.rs:970` and `:1101` repeat the same schema/package/version/profile/module/nonempty-files predicate after distinct hash checks. | CHANGE: one pure private validator. |
| Development service paths | `tts_service_supervisor.rs:178,253,336` repeat service/source path canonicalization and `jsonschema`/`referencing` directory checks. | CHANGE: one feature-gated private function. |
| Diagnostic cancellation | `tts_service_supervisor/host_diagnostics.rs:40` and `:87` repeat the bounded poll of active identity followed by cancellation. | CHANGE: one private diagnostic helper; retain distinct joins. |

The read-only audit packets `RUST-LOCAL-CB-01` and `RUST-LOCAL-SUP-02` supported
these recommendations at the planning revision. The evidence and invariants
are restated here so execution does not depend on chat history. They establish
neither an implementation baseline nor approval of a future patch.

The earlier Chatterbox SKIP concerned splitting ownership across modules.
It remains compatible with extracting one identical predicate inside its
current owner. This plan preserves that historical decision and its evidence.

Retain the current hardware detector, protocol/framing owners, small hash
helper, shell registration, executable synthetic child and independent probe.
Do not combine different runtime fallback policies or the distinct `health`,
`cancel`, `shutdown`, `force_stop` and `fail_session` operations.

## 4. Scope and non-goals

Implement three cohesive units covering the four recommendations. The two
supervisor extractions share production and test paths, so they receive one
baseline, one bounded order and one post-change report. Do not begin a second
overlapping unit against the first one's unstaged changes.

All source paths in this table are relative to `apps/desktop/src-tauri/src/`.

| Unit | Closed candidate allowlist | Work | Planning ceiling, added plus removed lines |
| --- | --- | --- | --- |
| `NFR-SUP` | `tts_service_supervisor.rs`; `tts_service_supervisor/tests.rs` | Expected-state method and common development-path function, with focused characterization. | Two paths, 320 lines, including test fixtures. |
| `NFR-CB` | `tts_optional_chatterbox.rs`; `tts_optional_chatterbox/tests.rs` | Installed identity validator and invalid-identity cleanup regression. | Two paths, 120 lines. |
| `NFR-DIAG` | `tts_service_supervisor/host_diagnostics.rs` | Shared polling/cancellation sequence only. | One path, 85 lines. |

The combined source manifest contains exactly these five paths. Keep existing
unit suites at `<owner>/tests.rs`, private to their parent. No test-directory
reorganization or new public testing API is planned. The supervisor ceiling
reserves room for test-only fixtures; it does not authorize production seams
or changes to the executable fake child.

Documentation scope during execution: this plan, active/completed indexes,
`docs/README.md` and the native coverage explanation in
`docs/development/testing.md`. Reviewed concise receipts may live under
`docs/plans/evidence/native-rust-function-readability/`; raw captures and
temporary scripts belong in ignored `tmp/evidence/native-rust-function-readability/`.

Exclude new modules, traits, crates, dependencies, command-line options, Tauri
commands, serialized contracts, profile IDs, model selection, retry policies,
timeout values, metrics, queue/buffer limits, lock topology and child-process
ownership. Exclude changes to downloads, promotion/removal, path containment,
hash acceptance, cached receipts, Windows FFI, EPUB preparation, locators,
UI, playback and synchronization.

Generated sources, frozen authorities, release manifests/locks, benchmark
thresholds, historical evidence and other completed plans remain untouched.
Do not turn an existing failure or a useful neighboring cleanup into this work.

## 5. Relevant files and documentation

Read [AGENTS.md](../../../AGENTS.md), [the ExecPlan format](../../../.agents/PLANS.md),
[the documentation index](../../README.md), [MVP requirements](../../product/mvp.md),
[the roadmap](../roadmap.md), [architecture overview](../../architecture/overview.md),
[the canonical diagram](../../architecture/system-diagram.md),
[testing guidance](../../development/testing.md),
[agentic refactoring](../../development/agentic-refactoring.md) and
[evidence retention](../../development/evidence-retention.md).

Read `$orchestrate-safe-refactor` and `$validate-safe-refactor`, their complete
agent contracts and validation matrix. Apply their ownership and evidence rules
to these Rust units; use the actual Rust scripts instead of substituting
TypeScript checks for native acceptance.

Applicable authorities and decisions:

- [Rust-owned protocol ADR-0016](../../architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md)
  and [protocol v1](../../architecture/tts-service-protocol-v1.md).
- [Runtime closure ADR-0046](../../architecture/decisions/ADR-0046-repair-chatterbox-runtime-closure-and-windows-path.md)
  and [ordinary acquisition ADR-0050](../../architecture/decisions/ADR-0050-promote-ordinary-chatterbox-acquisition-and-retire-validation-overlay.md).
- [Piper/Chatterbox priority ADR-0051](../../architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md),
  retaining Qwen development code and deterministic checks without new
  model-backed Qwen acceptance or support claims.
- [Piper runtime ADR-0053](../../architecture/decisions/ADR-0053-refresh-piper-onnxruntime.md)
  and [Piper engine ADR-0054](../../architecture/decisions/ADR-0054-refresh-piper-engine-and-phonemizer.md).

Read the prior [native organization](../completed/native-rust-module-organization.md),
[native test layout](../completed/native-rust-test-layout.md) and
[Chatterbox security refresh](../completed/chatterbox-security-dependency-refresh.md)
as historical context, not current acceptance evidence.

Inspect the five allowlisted files and their direct collaborators:
`tts_service_protocol.rs`, `tts_service_fake_child.rs`, `tts_release_core.rs`,
the optional-package manifest currently embedded by Chatterbox, and the existing
native/portfolio/ordinary-release harnesses. Check root and desktop
`package.json`, `Cargo.toml`, Tauri configurations and current CI definitions
before proposing any execution command.

## 6. Architecture and constraints

### Expected service state

Inside `impl TtsServiceSupervisor`, introduce:

```rust
fn receive_expected_state(
    &self,
    session: &ServiceSession,
    timeout: Duration,
    expected_state: &str,
) -> Result<Value, TtsNativeFailure>
```

Its body calls the existing `receive_control(session, timeout, "state")`, checks
the returned `state` against `expected_state`, returns `ProtocolRejected` on
mismatch and otherwise returns the same `Value`. Replace precisely the nine
copies identified above. Retain each call's original timeout and expected state.

`receive_control` validates framing, control shape, kind and service identity,
then updates lifecycle before its caller checks the expected state. Preserve
that ordering even for an unexpected but otherwise valid state. The helper
must not acquire `operation`, retry, catch errors, clean up the child or call
`fail_session`; those responsibilities remain with the existing callers.

Keep `health` on unrestricted state receipt. Preserve record order, time
measurement positions, synthesis cancellation handling and the scope/drop of
every existing lock guard. Do not introduce a lifecycle enum or state-machine
rewrite as part of naming this operation.

### Installed Chatterbox identity

Introduce one private function in `tts_optional_chatterbox.rs`:

```rust
fn validate_installed_runtime_identity(
    runtime: &InstalledRuntimeManifest,
    manifest: &OptionalPackageManifest,
) -> Result<(), OptionalProfileError>
```

Move only the identical condition from `verify_runtime` and
`runtime_manifest_for_bytecode_cleanup`: schema 2, the package ID derived from
the authorized version, package version, profile identity, service module and
nonempty file list. Return the existing `VerificationFailed` error. Both
callers use `?` at the same point after their original hash check and parsing.

Keep filesystem reads, hash decisions and deserialization in the callers.
Full verification permits only the current manifest hash; bytecode cleanup
also permits the authorized legacy-correction hash. Sharing those stages would
erase a deliberate trust distinction and is forbidden. The helper performs no
I/O, state mutation, lock acquisition or error logging.

Keep `INSTALLED_RUNTIME_LOCK`, receipt invalidation, preparation/promotion/
removal ordering, cancellation atomics, consent and pre-network hardware
admission unchanged. No dynamic path, model data, book text or raw error enters
the error surface.

### Common development-service paths

Introduce the following private function under the same
`#[cfg(not(feature = "release-locked-runtime"))]` condition as its callers:

```rust
fn development_service_paths(
    repository_root: &Path,
) -> Result<(PathBuf, PathBuf), TtsNativeFailure>
```

Return `(service_source, service_site_packages)` after canonicalizing
`services/tts/src` and `services/tts/.venv/Lib/site-packages` in the original
order and checking the existing `jsonschema` and `referencing` directories.
Keep the tuple order explicit through named destructuring at all three calls.
Every failure remains `ChildUnavailable`.

Call it from `from_environment`, `piper_from_environment` and
`chatterbox_from_environment` at their existing shared block. Retain enable
flags, repository-root discovery, exact interpreter equality, lock-byte checks,
language/profile validation and model-root resolution in their current order.
Do not create a universal runtime builder: Piper and Chatterbox intentionally
differ in when packaged errors allow a development fallback.

Tests use disposable local directories and explicit path parameters rather
than mutating process-global environment variables. No shipped manifest,
candidate lock, interpreter, installed model or user profile is modified.

### Diagnostic wait and cancellation

Inside `tts_service_supervisor/host_diagnostics.rs`, introduce:

```rust
fn cancel_when_generation_becomes_active(
    supervisor: &TtsServiceSupervisor,
) -> Result<(), &'static str>
```

Move the repeated deadline construction and polling loop into this helper.
Preserve `HANDSHAKE_TIMEOUT`, `POLL_INTERVAL`, lock-error conversion, active
identity cloning, scope construction, timeout check ordering and `cancel`.
The lifecycle guard must be released before cancellation takes its own locks.

Keep worker creation, prepared state, segment ownership and joins at each call
site. Pending must still require a joined `Cancelled` result; descendant must
retain its existing ignored join result and Windows-only condition. Do not
combine complete scenarios, introduce a generic polling framework or refactor
the independent handoff benchmark's superficially similar helper.

### Retained boundaries

All helpers remain private implementation details. No module, package, process,
persistence or trust boundary changes. Review the canonical system diagram at
closeout and record continued applicability; update it only if a separately
approved actual architectural change warrants it.

## 7. Milestones

### Milestone 1: Refresh evidence and freeze bounded orders

Status: complete; all three independent baselines and bounded orders accepted.
Earlier failures remain retained.

Use the existing implementation branch; inspect current HEAD, planning commit,
index and worktree. Preserve unrelated work and stop on an overlapping target.
Refresh the audit of all four recommendations, including their historical SKIPs
and exclusions. Confirm the current test seams, ceilings and exact commands.

Reuse the configured auditor, worker and independent validator with the primary
task as director, prescribed models and concurrency limit, and no supporting
agent delegation. Only one source worker may write at a time. Do not substitute
an unavailable audit/validation model or treat self-review as independent.

Before each unit, require an empty index, clean allowlisted paths and an
independent passing baseline. Record relevant pre-existing failures as
BASELINE-FAIL without repairing them under this plan. Freeze the work order
only after its baseline PASS. Actual results: all three audits complete; DIAG
and SUP baselines/orders accepted; CB final baseline and order now accepted.

### Milestone 2: Implement the two supervisor extractions together

Status: complete; independent post-change acceptance. Unit: `NFR-SUP`.

Characterize the supported test seams before replacing the nine state checks
and three path blocks. Implement both private helpers under one order. Preserve
the receive/update/check sequence and the three constructors' admission order.
Review the worker Change Packet and obtain independent post-change acceptance.
Actual results: baseline 03 passed all twelve commands after correcting host
context and process-local preparation. Implementation added both helpers and
six tests, 272 changed lines in two files. Post-change 04 passed all required
gates after two bounded corrections and one separately assessed unchanged
native-command retry. Earlier failures remain retained; director identities
match and the index remains empty.

### Milestone 3: Extract the Chatterbox identity predicate

Status: complete; independent post-change acceptance. Unit: `NFR-CB`.

Characterize invalid installed identity with an authorized manifest hash before
changing production. Extract only the shared predicate; prove that rejected
identity still prevents bytecode cleanup while legacy/current hash policies
remain separate. Obtain independent post-change acceptance. Actual results:
the final installed baseline passed after isolated snapshot packaging and exact
NSIS executable identity reconciliation. One private helper and a six-case
invalid-identity regression are implemented in 92 changed lines across the two
authorized files after one formatting correction. Independent
[post-change 02](../evidence/native-rust-function-readability/NFR-CB-post-02.md)
passed the entire unit and combined acceptance matrix. The installed journey
and all thirteen restoration checks passed; director identities match.

### Milestone 4: Extract the diagnostic polling sequence

Status: complete; bounded unit independently accepted. Unit: `NFR-DIAG`.

Replace only the two loops with the private helper. Compare every moved
statement and guard lifetime, and execute the existing native diagnostic
scenarios, including Windows descendant containment. Preserve both original
join policies. Independent post-change acceptance:
[NFR-DIAG-POST-CHANGE-20261013-01](../evidence/native-rust-function-readability/NFR-DIAG-post-01.md),
PASS; all four host commands passed, 77 changed lines in the single authorized
path, all 177 Rust test-result entries unchanged. No correction loops or Git
mutations. Combined acceptance is recorded separately below.

### Milestone 5: Validate the combined native patch

Status: complete; NFR-CB-POST-CHANGE-20261013-02 accepts the combined five-path
manifest and all required runtime/package/installed gates.

Allow at most two bounded correction loops per order, then redesign instead of
accumulating unrelated changes. Never carry a rejected worker patch forward.
Earlier accepted disjoint units may remain unstaged if execution forbids
commits; identify them separately from the active unit and keep the index empty.

Validate the complete five-path source manifest and all required combined
gates. Bind results to exact source and executable identities. Source writing
and Git mutations remain idle during validation. Missing models, host support
or installation prerequisites block the affected gate; they do not count as a
pass. Partial-patch results are retained in NFR-PARTIAL-PACKAGE-20261013-01;
the complete combined result is NFR-CB-POST-CHANGE-20261013-02, PASS. Rust passed
94 default and 93 release-locked tests, with one intentional ignored fixture
each. General checks, native startup, supported profiles, isolated Windows
package verification and the complete installed journey passed. The original
historical package authority remained unchanged.

### Milestone 6: Update documentation and archive on acceptance

Status: coverage documentation, diagram review and archival complete after
runtime acceptance. The independent documentary report is retained separately.

Update the native coverage explanation with the implemented tests and preserve
existing test identities, fixtures and feature/platform distinctions. Review
the system diagram. Record actual commands, failures, reruns and limitations
without borrowing historical counts as fresh evidence.

Only after the four changes and every required gate pass, move this plan to
`docs/plans/completed/`, update the active/completed indexes and `docs/README.md`,
repair maintained incoming links and leave no redirect in active. Independently
validate the final documentation. Keep the plan active while work or acceptance
remains outstanding. Source commits, if later authorized, need separate exact-
path Git orders bound to immutable current validation; this plan's documentation
commit does not authorize them. Actual results: testing coverage and maintained
links updated; the diagram still matches the unchanged architecture and was not
edited. Five redundant preparation notes were consolidated without changing
validation reports. No staging, commits, push or PR were performed.

## 8. Testing and benchmark strategy

Every test and validation command runs from the repository root in normal local
PowerShell outside the managed sandbox. Record exact commands and outcomes;
sandbox experiments, earlier audit packets and completed-plan results are not
acceptance for this patch. Do not run application tests just to create this plan.

### Common baseline and post-change gates

For each of the three units:

```powershell
pnpm.cmd format:check:rust
pnpm.cmd lint:rust
pnpm.cmd test:rust
```

Clippy and Rust tests cover both default and `release-locked-runtime` features.
Retain the platform-specific and intentionally ignored subprocess-fixture
distinctions. Record existing test names/results separately for each feature
configuration; new characterization cases are additive. For `NFR-SUP` and
`NFR-DIAG`, also run the following before and after the change:

```powershell
pnpm.cmd test:native-startup
```

Native startup rebuilds the current ordinary executable and runs its model-free
supervisor diagnostics. `NFR-CB` additionally uses the release gates below,
which exercise the installed verifier rather than only the synthetic child.

### Characterization obligations

- Expected-state receipt: cover a valid expected state, a valid but unexpected
  state and a mismatched service identity. The unexpected state must retain
  lifecycle-update-before-rejection behavior; identity rejection must leave
  lifecycle unchanged. Preserve the existing transport-boundary tests and
  diagnostic ordered-message checks. The existing private test module can
  construct a `ServiceSession` with `process` and `input` set to `None` and
  `frames` backed by `mpsc::sync_channel(1)`. Preload an encoded control frame;
  `receive` needs only that receiver. This fixture requires no child, thread,
  Windows condition, production trait, accessor or fake-child scenario. A
  zero-duration empty receive and a disconnected sender can characterize error
  propagation without sleep. These tests do not prove process containment,
  concurrent cancellation or timing measurements; keep the host gates and
  static review of all nine call sites.
- Development paths: temporary directory fixtures with both required
  dependencies, each missing dependency and unavailable service paths. Assert
  canonical returned paths and the existing content-free failure. Retain
  profile/language binding, private interpreter, environment scrubbing and
  release-feature tests.
- Installed identity: construct a synthetic installed manifest whose bytes
  match an authorized test-fixture hash but whose identity is invalid. Both
  full verification and the cleanup path must reject it; a candidate bytecode
  file must remain intact. Reuse `write_runtime`, mutate an identity field,
  reserialize and update only that disposable fixture's authority hash so the
  failure is attributable to identity rather than hash mismatch. Exercise
  `verify_runtime` and `remove_unmanifested_python_bytecode`; check the retained
  bytecode bytes. Keep current valid cleanup, corrupt/stale/traversal,
  concurrent verification, receipt invalidation and promotion assertions.
- Diagnostic loop: the existing native startup matrix must retain normal,
  pending, crash/restart, shutdown and Windows descendant behavior. Review
  deadline construction, polling order, lock release and distinct joins
  statically rather than replacing them with sleep-based duplicate unit tests.

### Supported-model runtime gates

The supervisor unit changes shared startup/preparation/synthesis/shutdown
receipt and development runtime construction. It therefore requires supported
Piper/Chatterbox exact-host acceptance, not only the model-free fake child.
Retain current profile IDs and ADR-0051's deferred Qwen model scope.

Before and after `NFR-SUP`, following the native build above, run these existing
portfolio commands sequentially:

```powershell
pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --preflight-only
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --preflight-only
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4 --preflight-only
node apps/desktop/scripts/bilingual-portfolio-host.mjs --lifecycle-only
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4
```

The last command selects both Chatterbox languages, for four supported arms.
These runs must use the current executable. Presence of environment variables
alone does not prove that a development constructor executed: a discovered
packaged or installed runtime can take precedence. Synthetic path tests remain
necessary to characterize the extracted development helper directly.

Do not append a profile filter to the umbrella
`test:tts:bilingual-portfolio-exact-host` package script: its earlier chained
preflight remains unfiltered and requires Qwen. Use the explicit existing
runner flags above. Keep its assertions for profile switching, cancellation,
playback, synchronization, configuration/offline gates and cleanup unchanged.
The model-free diagnostic-only unit does not trigger another model gate by itself.

### Installed Chatterbox verification gates

Before and after `NFR-CB`, require a freshly built ordinary release candidate,
package inspection, ordinary preflight and the ordinary acquisition journey.
The identity helper participates in both installed verification and cleanup/
repair admission. Preflight alone cannot establish acquisition, narration,
restart, removal and reacquisition through those paths.

Run the existing release scripts from an isolated copy of the exact candidate:

```powershell
pnpm.cmd package:windows
pnpm.cmd package:windows:check
```

`package:windows` writes tracked `windows-package-evidence-v3.json` without an
output override; do not overwrite or manually update that historical authority
in the implementation checkout. Keep the original HEAD and source manifest
immobile while preparing and validating the isolated input. Bind the copy's
inputs and the resulting installer/executable hashes to the candidate report.
Include relevant configuration, scripts, locks and resources in the copy's
input manifest, not only the changed Rust files. New generated outputs are
validation artifacts and do not enter the source allowlist.

These specific release commands support a source copy without `.git`: their
roots resolve from their files. This permits validation without new Git
mutations when the execution request forbids them. Such a copy is not a
substitute for the original checkout's combined `check` gates, whose evidence
guard uses Git. An alternative managed worktree requires separately authorized
setup while implementation and validation are idle.

Provision the copy's own dependencies. Do not link writable `node_modules`,
`.venv`, `target`, or other output directories back to the original checkout.
In particular, an editable Python environment still resolving modules from the
original path would defeat isolation. Build writes in the copy include Piper
distribution/cache outputs, frontend output, Cargo/Tauri artifacts, installer/
checksum and `apps/desktop/src-tauri/release/windows-package-evidence-v3.json`.
Normal Piper packaging verifies its existing manifest; do not run a
`write-manifest` or publication command.

After both release scripts succeed, while still in the copy's root, use the
following existing runner options. Stop on every nonzero command exit and
retain a fresh receipt per baseline, post-change and combined run:

```powershell
$nfrCandidateRoot = (Get-Location).Path
$nfrCandidateRelease = Join-Path $nfrCandidateRoot 'apps/desktop/src-tauri/target/release'
$nfrCandidateInstaller = Join-Path $nfrCandidateRelease 'bundle/nsis/VoxLeaf_0.1.0_x64-setup.exe'
$nfrReceiptDirectory = Join-Path $nfrCandidateRoot 'tmp/evidence/native-rust-function-readability'
$nfrReceiptName = 'ordinary-chatterbox-' + [guid]::NewGuid().ToString('N') + '.json'
$nfrCandidateReceipt = Join-Path $nfrReceiptDirectory $nfrReceiptName
$nfrCandidateInstallRoot = Join-Path $env:LOCALAPPDATA 'VoxLeaf'
New-Item -ItemType Directory -Force -Path $nfrReceiptDirectory | Out-Null
node apps/desktop/scripts/ordinary-chatterbox-release-host.mjs --mode preflight --installed-root "$nfrCandidateRelease"
node apps/desktop/scripts/ordinary-chatterbox-release-host.mjs --mode journey --installed-root "$nfrCandidateInstallRoot" --installer "$nfrCandidateInstaller" --receipt "$nfrCandidateReceipt"
```

Confirm that the candidate release directory contains the executable and all
ordinary resources required by `validateOrdinaryArtifact`; missing resources
block the preflight rather than justify relaxed validation. Preflight accepts
this absolute artifact root and does not require installation registration.
The journey requires exactly `%LOCALAPPDATA%/VoxLeaf` and refuses an existing
installation. It cannot be redirected to an arbitrary scratch install path.
Its receipt contains installer and installed-executable SHA-256 values; compare
them to the fresh candidate artifacts and source manifest. Do not rebuild and
reuse an earlier receipt. Runner options use separate names and values. If
needed, use its existing `--tauri-driver` and `--edge-driver` options with
verified absolute paths, retaining those inputs in the report.

The broader six-choice uninstall matrix, a rebuilt/published optional model
package, dependency refresh and release publication are not required by these
local predicates. Existing installations, model payloads and user data must be
preserved. The ordinary journey refuses an existing installation and temporarily
backs up/restores application data; never remove an installation merely to make
this gate runnable. Confirm the applicable execution authorization for its
installation, download and removal effects. Missing prerequisites block the
gate without blocking unrelated safe units or this planning task. Isolation
protects the implementation checkout's authority; it does not mean the entire
test is confined to that directory. Tool caches, temporary WebDriver files,
installation and AppData effects remain real host operations.

Supported model gates require compatible Windows/WebView2/GPU, exact configured
interpreters/locks/models, existing offline flags and interpreter-specific
firewall prerequisites, no conflicting TTS process and content-safe fixtures.
Do not alter machine/network configuration or replace a missing prerequisite
with a weaker assertion. Report the concrete blocker and retain the plan active.

### Combined closure and evidence identity

After the coherent native batch:

```powershell
pnpm.cmd check:portable
pnpm.cmd check
pnpm.cmd test:native-startup
```

Repeat the supported-model and installed-verifier gates against the combined
candidate identities. Build and execute each ordinary/native artifact in the
documented order; a later build must not silently replace the binary associated
with an earlier receipt. Any reuse must satisfy the identity rule below.

No reader-render benchmark or new performance claim is introduced by this
native function extraction. Keep existing resource/latency assertions in the
applicable host gates unchanged. Reuse a prior required result only while its
scope and source/build identities remain valid under the validation contract.
Relevant drift requires another run and a fresh immutable report.

Each report records its ID, mode, starting/ending HEAD, closed allowlist, exact
porcelain status, worktree SHA-256 and filter-aware expected blob before and
after commands. PASS requires unchanged identities, completed checks and an
empty index. Store identity receipts outside their validated paths. Do not
refresh hashes on an old approval after editing the patch.

Planning acceptance covers twelve required sections, six milestones, four
recommendations mapped to three units, current scripts/runner flags, local
links/anchors, whitespace, evidence retention and exactly the plan plus two
indexes. It does not establish a source baseline or runtime availability.

## 9. Risks and rollback

- Moving the expected-state comparison before lifecycle update changes error
  behavior. Keep the existing receiver intact and test the ordering.
- Sharing more than manifest identity could admit legacy bytes in full
  verification or permit cleanup before identity validation. Preserve caller
  boundaries and characterize rejection before mutation.
- A universal runtime builder could change admission precedence and fallback.
  Extract only the identical development-service path block under its cfg.
- Moving the diagnostic lifecycle guard across `cancel` could deadlock; moving
  joins could change failure reporting or containment. Retain statement scopes
  and scenario-specific joins.
- Host gates may be blocked by configuration or an existing installation.
  Preserve user resources and report the actual prerequisite instead of
  modifying unrelated code or weakening acceptance.

Correct or remove only verified worker-authored hunks on rejection; preserve
all unrelated work. Avoid broad reset, clean, restore or stash. Remove a helper
and its call-site changes together. Every correction receives a new independent
report before acceptance or authorized staging.

## 10. Progress log

- 2026-10-13 final acceptance:
  [NFR-CB-POST-CHANGE-20261013-02](../evidence/native-rust-function-readability/NFR-CB-post-02.md)
  PASS accepts CB and combined runtime closure on the exact five-source manifest.
  CB post 01 failed only formatting; correction 1 produced 92 changed lines and
  the fresh post 02 passed all gates. The installed candidate completed every
  journey step and all thirteen restoration checks; data, private installation,
  registry and shortcut state were verified. The final check ended at
  2026-10-14T00:09:23Z (2026-10-13 local). A slow 8.24 GB reinstall download
  accounted for the last long wait; observed byte progress confirmed it was not
  blocked. Director comparison matched HEAD, five hashes/blobs/statuses and the
  empty index. Four helpers, seven additive tests and 441 changed source/test
  lines are accepted. Testing guidance and plan indexes were updated; the
  canonical architecture diagram remains applicable unchanged. No required
  runtime gate or source correction remains open.
- 2026-10-13 Chatterbox baseline accepted:
  [NFR-CB-BASELINE-20261013-03-FINAL-01](../evidence/native-rust-function-readability/NFR-CB-baseline-03-final.md)
  PASS completes preparation03 with all 17 installed journey steps and verified
  restoration. The ordinary desktop program was absent; the earlier claim that
  it was installed confused Codex's private view with Explorer's view. Existing
  ordinary runtime data and private installation/data were preserved. Five
  redundant operational notes were replaced by one
  [correction summary](../evidence/native-rust-function-readability/NFR-CB-host-preparation-note.md).
  Tauri 2.12.1 changes only the bundle-type marker from UNK to NSS in its temporary
  NSIS executable. A unique-token, in-memory three-byte transformation reproduced
  the installed SHA exactly; the initial raw/installed mismatch remains recorded.
  Future validation must retain both identities and compare the installed
  receipt to the derived NSIS hash. No product fix or repeated journey was needed.
  The [approved CB order](../evidence/native-rust-function-readability/NFR-CB-work-order-01.md)
  produced the private identity helper and additive six-case regression, 91
  changed lines. Independent post-change and combined acceptance remain pending.
- 2026-10-13 supervisor unit accepted:
  [NFR-SUP-POST-CHANGE-20261013-04](../evidence/native-rust-function-readability/NFR-SUP-post-04.md)
  PASS, exact director identity recheck and empty index. Both private helpers
  and six tests are implemented in 272 changed lines. Rust passed 93 default
  and 92 locked tests, plus one ignored fixture each; all supported model arms
  and native gates passed. Two bounded corrections fixed formatting and unused
  bindings. A later WebDriver restart-session failure did not reproduce in the
  one unchanged retry recommended by Astra; its cause remains unknown. No
  third source correction, assertion relaxation or installation change occurred.
  Next: a fresh short-root isolated Chatterbox package baseline using the
  verified normal host context and dependency snapshot preparation.
- 2026-10-13 supervisor baseline accepted:
  [NFR-SUP-BASELINE-20261013-03](../evidence/native-rust-function-readability/NFR-SUP-baseline-03.md)
  passed all twelve commands, including both Piper profiles and both Chatterbox
  language arms. Explorer-launched normal PowerShell provides the correct
  physical AppData view; model variables are scoped to model gates. The
  [attempt 02 failure](../evidence/native-rust-function-readability/NFR-SUP-baseline-02.md)
  retains the validator's mistaken real-Piper selection during synthetic native
  smoke. No source fix was needed. Director identities agree and the
  [bounded SUP order](../evidence/native-rust-function-readability/NFR-SUP-work-order-01.md)
  authorizes one worker, two files and the 320-line ceiling.
- 2026-10-13 normal-host prerequisite: the Explorer-launched
  [host-view probe](../evidence/native-rust-function-readability/NFR-host-view-diagnostic-01.md)
  separates ordinary AppData from Codex LocalCache. A subsequent complete
  ordinary-tree scan, NFR-CB-HOST-INTEGRITY-20261013-01, passed all 13,089 files,
  including six models, with size/hash, final-handle containment, closed file
  set and before/after drift checks. Its ignored integrity receipt SHA-256 is
  `e55c948ed7919029edb3eb72e20daf772c8b22c3db5865d4f369c8d59d9a8d0c`.
  This is prerequisite evidence; UI snapshot and fresh unit baselines remain
  necessary. Neither ordinary nor Codex-private data was relocated or merged.
- 2026-10-13 partial-package checks: independent
  [NFR-PARTIAL-PACKAGE-20261013-01](../evidence/native-rust-function-readability/NFR-PARTIAL-package-01.md)
  passed portable checks, full checks and native startup on the DIAG-only patch.
  This does not close the two outstanding unit baselines or establish their
  future implementation acceptance.
- 2026-10-13 isolated dependency-snapshot attempt:
  [NFR-CB-BASELINE-20261013-02](../evidence/native-rust-function-readability/NFR-CB-baseline-02.md)
  remains BASELINE-FAIL. The unchanged builder passed core authority comparison,
  core smoke and release compilation, then NSIS rejected a 263-character literal
  resource path. No installer, preflight, journey or uninstall occurred.
  Astra recommends a fresh physical short-root copy, preserving the complete
  verified dependency snapshot and all authorities, rather than changing code.
- 2026-10-13 host-view investigation:
  [NFR-SUP-SNAPSHOT-DIAGNOSTIC-20261013-01](../evidence/native-rust-function-readability/NFR-SUP-snapshot-diagnostic-01.md)
  stopped before launch when canonical containment failed. Observed runtime
  files resolve into Codex LocalCache while parent directories retain ordinary
  AppData spelling. The earlier byte-integrity pass does not establish native
  containment. Astra recommends a read-only Explorer-launched PowerShell probe
  before any app operation. Preserve both physical trees, previous reports and
  all runtime checks; no production correction is justified yet.

- 2026-10-13 execution: the maintainer authorized implementation, tests and
  scoped documentation on the existing branch, explicitly without staging,
  commits, push or PR. Starting HEAD is
  `d5ad0427dc58d71bdb678df17454d9412c8488c8`; branch
  `codex/native-rust-function-readability`, index and worktree were clean.
  The director retains ownership and reuses the configured Sol auditor/worker
  and Astra validator. No Git mutation order is authorized.
- 2026-10-13 prerequisite inspection: the independent validator observed an
  existing installation and uninstaller at the ordinary journey's mandatory
  `%LOCALAPPDATA%/VoxLeaf` root. The journey refuses this state, and preserving
  the installation prevents running that required NFR-CB baseline here.
  No installation or user data was removed. Other units remain eligible for
  independent baseline assessment. This is prerequisite evidence, not a test
  failure or implementation acceptance.
- 2026-10-13 authorization update: the maintainer explicitly permits
  uninstalling the current VoxLeaf version when necessary. This supersedes
  the existing-installation prohibition above, but not protection of original
  application data and models. Candidate isolation, verified backups, ordinary
  preflight and a prepared host remain prerequisites; no uninstall has occurred.
- 2026-10-13 fresh audits: NFR-SUP, NFR-CB and NFR-DIAG are CHANGE, medium risk,
  with the exact section 4 allowlists/ceilings and section 6 transformations.
  The auditor independently confirmed the private channel/directory fixtures,
  matching-hash invalid-identity fixture and distinct diagnostic joins. The
  historical module-split SKIPs remain valid. Draft orders require all section
  8 gates for each unit, not only deterministic Rust checks.
- 2026-10-13 accepted immutable
  [NFR-SUP-BASELINE-20261013-01](../evidence/native-rust-function-readability/NFR-SUP-baseline-01.md)
  as BASELINE-FAIL: both Piper journeys timed out during profile selection;
  Chatterbox reported failed installed-profile state and stopped before Spanish
  narration; English was not reached. Nine earlier gates passed. Both source
  paths and HEAD stayed unchanged; index empty. NFR-SUP remains unimplemented.
- 2026-10-13 accepted fresh
  [NFR-DIAG-BASELINE-20261013-01](../evidence/native-rust-function-readability/NFR-DIAG-baseline-01.md),
  PASS for the one-path diagnostic unit. All four host gates passed; Rust
  default/release counts 87/88 plus one intentional fixture ignored each.
  Issued [immutable NFR-DIAG work order](../evidence/native-rust-function-readability/NFR-DIAG-work-order-01.md)
  with the 85-line ceiling. No source or Git writer ran during baseline.
- 2026-10-13 NFR-DIAG accepted after independent post-change PASS and director
  identity recheck. One private helper, two call sites, 77 changed lines, no
  test edits, zero correction loops and empty index. All four commands and all
  177 Rust test-result entries match the baseline. Source remains unstaged.
- 2026-10-13 accepted immutable
  [NFR-CB-BASELINE-20261013-01](../evidence/native-rust-function-readability/NFR-CB-baseline-01.md)
  as BASELINE-FAIL. Three original-root Rust gates passed. A source copy with
  1,246 verified inputs and independently provisioned dependencies failed
  `pnpm.cmd package:windows` at `piper-core-runtime-manifest-stale`, before
  installer construction. Subsequent package/preflight/journey gates were not
  run. Original authority, app installation, data and models remain untouched;
  no CB source order, manifest regeneration or uninstall was performed.
- 2026-10-13 documentation: native coverage now describes the accepted
  diagnostic extraction without claiming the blocked tests exist. Reviewed
  canonical system diagram against the unchanged native supervisor, process,
  protocol, persistence and acquisition boundaries; it remains applicable and
  was not edited. No active/completed links are moved while gates remain open.
- 2026-10-13 scope decision after additional maintainer authorization: the
  maintainer permits necessary extra work after Astra-high analysis and asks
  the director to choose the recommended option. A separate Astra-high
  assessment recommends first changing test preparation, not production or
  authority: physically copy the complete verified original core environment
  into a fresh candidate, with no shared writable links, let the unchanged
  builder reinstall candidate-local VoxLeaf code, and verify imports remain
  inside the copy. This proves an artifact from a dependency snapshot, not
  arbitrary-path clean-install reproducibility. Never edit RECORD metadata or
  regenerate the authority merely to pass.
- 2026-10-13 Astra diagnosis: four third-party RECORD files carry hashes of
  five launchers with absolute-interpreter shebangs. The launchers are not
  packaged but their hashes are copied through RECORD, explaining concrete
  isolated-path manifest drift. Separately, installed Chatterbox v3 has the
  current authorized manifest hash; a read-only host integrity comparison of
  its file set, sizes, hashes and containment is the next step. Do not infer
  that uninstalling the app repairs profile data. Preserve all previous
  reports, original data and source boundaries; issue new reports for renewed
  baselines. A production correction would need an explicit bounded order,
  regression evidence and independent behavioral review.
- 2026-10-13 NFR-SUP baseline in progress: common Rust gates, native startup,
  portfolio UI preflight, three selected-profile preflights and model-free
  lifecycle passed. The Piper Spanish journey failed before source edits at
  `adaptive exact-host profile selection [webdriver-condition-timeout]`.
  Its log showed Piper compatible and active; the scenario also switches to
  Chatterbox, so no Piper synthesis defect or exact cause is established.
  Remaining independent profile runs are pending. No NFR-SUP implementation
  order is authorized on this failing baseline; NFR-DIAG remains independent.
- 2026-10-13: reviewed current Rust owners and tests; the two read-only audit
  packets established four local extraction candidates, without runtime tests
  or source changes.
- 2026-10-13: fast-forward-only refresh confirmed main was current; created the
  implementation branch at the revision recorded above.
- 2026-10-13: grouped the two supervisor changes into one cohesive unit to
  avoid overlapping allowlists during a future uncommitted execution.
- 2026-10-13: a follow-up source audit confirmed process-free receiver fixtures
  and an authorized-hash invalid-identity fixture. Independent planning review
  required supported portfolio and installed-verifier gates beyond Rust tests.
- 2026-10-13: inspected the existing release runner's artifact-root preflight,
  fixed installation root, separate receipt option and isolated-build needs;
  recorded the exact future sequence without executing it.
- [x] Milestone 1: current audits, orders and independent baselines accepted.
- [x] Milestone 2: both supervisor helpers and characterization accepted.
- [x] Milestone 3: installed identity helper and cleanup regression accepted.
- [x] Milestone 4: diagnostic helper and containment scenarios accepted.
- [x] Milestone 5: combined native/runtime acceptance complete.
- [x] Milestone 6: documentation reviewed and plan archived.

## 11. Discoveries and decisions

- Functions are the appropriate granularity for these four improvements; a new
  module or generic abstraction would not clarify their current ownership.
- Nine expected-state checks share a side effect that must remain visible in
  the design: `receive_control` updates lifecycle before the expected-state
  check. The refactor must preserve that behavior, not silently repair it.
- The repeated installed-identity rule is identical, but the preceding hash
  policies are intentionally different. The prior module-split SKIP remains
  valid and does not forbid this smaller extraction.
- The supervisor source and test files are shared by two recommendations.
  Combining them in one approved unit preserves clean target baselines without
  assuming permission for intermediate source commits.
- Pending and descendant diagnostics share only their poll/cancel loop. Their
  worker joins remain distinct.
- Ordinary package construction writes generated tracked release evidence.
  Validation must isolate those outputs and use candidate-bound receipts while
  preserving historical authority in the implementation checkout.
- Planning is documentation-only. Any current host/model/package or test result
  remains unverified until the later execution produces fresh evidence.

## 12. Final validation results

The original preparation/local commit was documentation-only and is not source
acceptance. This execution independently accepted all three units and the
combined five-path patch. The immutable
[combined report](../evidence/native-rust-function-readability/NFR-CB-post-02.md)
records exact commands, results, source identities, candidate binaries and
restoration receipts. All acceptance ran in normal local PowerShell outside
the sandbox. Earlier failed attempts remain historical evidence, not open gates.

| Requirement | Current result |
| --- | --- |
| Fresh execution audits/orders and source baselines | Three CHANGE audits, approved orders and independent baselines accepted; earlier failures retained. |
| Expected-state helper and characterization | Implemented and accepted by NFR-SUP-POST-CHANGE-20261013-04. |
| Installed identity helper and cleanup regression | Implemented and accepted by NFR-CB-POST-CHANGE-20261013-02; 92 changed lines and six invalid-identity cases preserving bytecode. |
| Development-service path helper and fixtures | Implemented and accepted with NFR-SUP; six new tests across the two helpers. |
| Diagnostic poll/cancel helper | Implemented and independently accepted by NFR-DIAG-POST-CHANGE-20261013-01. |
| Rust/default/release and native | Combined PASS: Rust 94/93 plus one ignored fixture each; format, Clippy in both configurations and native diagnostics PASS. |
| Supported runtime and installed gates | Piper ES/EN and Chatterbox ES/EN PASS; isolated package/build/check/preflight and complete installed post journey PASS, including all thirteen restoration checks. |
| General checks | Combined check:portable and check PASS; exact identities unchanged. |
| Testing documentation, diagram review and archival | Coverage and maintained links updated; diagram applicable unchanged; archived after runtime acceptance. Independent documentary closeout retained separately. |

No blocking issue remains in the required runtime matrix. The package evidence
proves the approved isolated dependency-snapshot build, not arbitrary-path clean
reproducibility. It makes no new Linux, Qwen or general performance claim, and
restoration does not claim pins/jump-list coverage. The branch remains
`codex/native-rust-function-readability` at
`d5ad0427dc58d71bdb678df17454d9412c8488c8`; all changes are available for review
with an empty index and no source commit, push or PR.

Keep actual failed attempts and blockers alongside any later successful result.
Do not claim this plan is complete while a required unit or gate is outstanding.
