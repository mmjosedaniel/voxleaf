# Chat findings execution ledger

Execution authorized 2026-11-12. Clean starting HEAD
`95eb4887121f2696beabade407d04afa6441e881`, branch
`codex/chat-findings-20261112-plan`. Private captures belong under ignored
`tmp/evidence/chat-findings-recovery/`.

## U8, case 7

G3 focused RED — EJECUTAR. Verify the standalone preflight exit and receipt
through stdin/stdout for pilot, official, malformed input and inconsistent
receipt conditions. The prior FPA receipt does not cover the new cases.
Inputs include benchmark source and test files, Python configuration and locks,
the installed Python environment and base standard library.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_cli.py -k 'preflight_exit_matches_requested_purpose or preflight_invalid_input_exits_two'
```

Host receipt `u8-red` exited 1 with the two expected assertion failures, five
passing controls and 23 deselections. The pilot passed preflight but exited 2.
The inconsistent failed official receipt exited 0. Before/after source and
runtime captures matched, including 4,896 expanded runtime rows. Input SHA-256
`F695130103E96A90ACED96D7ADBF95B8DEC766F5824FF2F518301978C9E406D2`.

G3 GREEN — EJECUTAR. Run the existing CLI and preflight suites with the new
exit predicate and test matrix. Same environment closure as RED.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_cli.py services/tts/tests/test_benchmark_preflight.py
```

Host receipt `u8-green` exited 0 with 45 passing tests and one existing
pytest cache warning. Before/after input and runtime captures matched.
Input SHA-256 `CFC49DFA3A4B73AFD5ACE654C66B4FAFA6DD530ABA7FCBD8EDAC6CC907AA87FC`.

## U7, cases 6 and 14

G3 focused RED — EJECUTAR. Use disposable synthetic quality sessions to
exercise duplicate generation, aggregate unlink failure and stale quality
admission. Capture benchmark/Python inputs as for U8.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py -k 'duplicate_generation or preserves_and_applies_one_classification_correction'
```

`u7-red` exited 1 with two expected assertion failures. Duplicate admission
deleted 13 existing files. A failed aggregate unlink left the correction
published. Before/after inputs and runtime matched.

G3 GREEN — EJECUTAR. Run the quality suite including preserved staging bytes,
retry after an unlink error, stale aggregate rejection and regenerated aggregate
admission. Same benchmark/Python closure as RED.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py
```

`u7-green` exited 0 with 38 passing tests and one pytest cache warning.
Input SHA-256 `691155E918B66BBF793A6ED3C81FA63A2E69F283EE1A87D6A93424BC22A789B4`.
Before/after source and runtime captures matched.

## U10, cases 21 and 24

G3 focused RED — EJECUTAR. Inject adapter setup and derivation I/O failures
in disposable sessions. Check ownership and retry behavior without models.
Use the benchmark/Python closure above.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_corrective_v12.py -k 'derivation_resumes_after_failure or quality_setup_failure_preserves_machine_session'
```

`u10-red` exited 1 with four expected failures and one passing preparation
control. Partial deletion and scorecard locks left a visible summary. The
previous writer bypassed atomic final publication. Adapter setup left a
reserved quality directory. Before/after input and runtime captures matched.

G3 GREEN — EJECUTAR. Cover the v12 benchmark and authority suites with fault
injection across staging and resumable cleanup. Same benchmark/Python closure.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_corrective_v12.py services/tts/tests/test_benchmark_v12_authority.py
```

`u10-green` exited 0 with 28 passing tests and one pytest cache warning.
Input SHA-256 `6DC10C2831D0C90116E7FD41CFB4F1596FFC300A7B70B6E03AC62B6E802DDE22`.
Before/after inputs and expanded runtime matched.

## U9, case 11

G3 focused RED — EJECUTAR. Run the mathematically equal speaker scores
through successor version plumbing with the old comparison still in place.
Use only the existing fake generation adapter and synthetic scorecard.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_customvoice_screen.py -k exact_overall_tie
```

`u9-red` exited 1. Binary floating-point sorting picked Serena for the
synthetic exact tie despite Vivian's higher pronunciation mean. The version
boundary control succeeded before the ranking assertion.

G3 GREEN — EJECUTAR. Exercise the synthetic successor scorecard and existing
frozen v1/v2 authority controls. Same benchmark/Python closure.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_customvoice_screen.py services/tts/tests/test_customvoice_screen_authority.py
```

`u9-green` exited 0 with eight passing tests and one pytest cache warning.
Input SHA-256 `9E491E85074EA33497C54A95AD50D0058B7DF8FC2809742A0EA34B16EB09C09C`.
The successor has no real evaluation. The historical selected speaker is retained.

### M1 final Python checks

G3 and G11 — EJECUTAR. The latest changes add public derivation admission
coverage and successor authority controls. Earlier receipts used a broader
input capture, so use the focused combined selection on the final Python tree.
Capture Python dependencies, base runtime, tool identities and source
membership as above. Format only changed Python files before these checks.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_cli.py services/tts/tests/test_benchmark_preflight.py services/tts/tests/test_benchmark_quality.py services/tts/tests/test_benchmark_corrective_v12.py services/tts/tests/test_benchmark_v12_authority.py services/tts/tests/test_customvoice_screen.py services/tts/tests/test_customvoice_screen_authority.py
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
```

### M1 static and final Python receipts

First combined run passed 122 tests and format. Lint flagged two local style
issues. Typecheck flagged four test-only import or annotation issues. Repeat
the same selections on the corrected inputs to bind the final Python patch.

Second capture passed 122 tests, format and lint. Typecheck found a remaining
test-only forwarding annotation. The final renewal targets the changed v12
test file plus the configured static checks.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_corrective_v12.py
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
```

`m1-v12-final` passed 23 tests and all three final static checks exited 0.
The unchanged suites in `m1-final-02` depend on neither the changed v12
test module nor its local mock annotation. EPUB and desktop source changes
are outside the Python command closure.

## U4, cases 4 and 13

G2 focused RED — EJECUTAR. Use the XHTML projection and navigation fixtures to
test safe inert descendants and label breaks with exact decoded text accounting.
Capture package sources, fixture membership, installed JS dependencies, tools,
configuration and generated package inputs.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts src/navigation/navigation-document.test.ts -t 'inert block anchor|visible XHTML break'
```

`u4-red` reproduced three failures. Both inert anchor forms failed at
block destination admission. The visible break failed the exact byte limit
because its separator was attributed to the image's leading whitespace.

## U5, cases 9, 10 and 18

G2 focused RED — EJECUTAR. Verify normalizer output and source mapping for
closed Spanish time articles, numeric ranges and terminal ordinal context.
Same JS capture as U4. Cases belong to the mutable bilingual normalizer.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts -t 'SAF-12|CFR-10'
```

The first invocation exited 255 when the Windows command shim parsed the
alternation as a pipe. Execute the existing normalizer suite without filtering
to retain the neighboring controls and avoid the shim quoting issue.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts
```

`u5-red-02` reproduced seven normalization failures and passed 274 controls.

## U6, case 20

G2 focused RED — EJECUTAR. Drain real preparation requests with leading and
interior collapsible gaps at segment and source-window boundaries. Check
source ranges and equivalent one/many segment drains. Same JS capture as U4.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/integration/narration-preparation-matrix.test.ts -t CFR-20
```

`u6-red` reached the public preparation error with 319, 320 and 4,095
leading spaces followed by an interior gap. The 4,096 control already
progressed and exposed an over-specific trailing-space assertion. The final
assertion preserves both substantive tokens and exact range starts.

G2 final selection — EJECUTAR. Run U4–U6 together against the changed
projection, navigation, normalization, packing and continuation inputs.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts src/navigation/navigation-document.test.ts src/public/open-epub-publication.test.ts src/integration/ingestion-matrix.test.ts src/narration/narration-normalizer.test.ts src/narration/narration-source.test.ts src/narration/narration-segment-packer.test.ts src/narration/narration-prepared-segment.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts
```

The first combined attempt caught an incorrect matcher index increment.
The next caught an editorial label ending in a digit. Both corrections
preceded the final run. Public integration fixtures import generated package
exports, so early integration results using pre-edit exports are diagnostic.
G0 `pnpm.cmd build:packages` exited 0. The focused public case passed 4/4
against the rebuilt exports. `m2-built-green` then exited 0 with 561 tests
across 10 files and matching before/after input captures.

## U1 and U2, reader placement and healthy profile

G1 RED — EJECUTAR. Exercise the real App/Reader PN-02 stopped placement
matrix and the saved healthy profile action. Capture current desktop, EPUB
and shared inputs, dependency closure and generated exports.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t PN-02
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/settings/narration-settings-actions.test.ts -t CFR-08
```

`u1-stop-red` reproduced six failures with ten passing PN-02 controls.
`u2-red` confirmed that reselecting the saved loaded Piper profile stopped
and refreshed the existing owner.

G1 integration — EJECUTAR. The affected desktop selection includes the
placement, preferences, highlight, profile, and App integration suites.
Use the G1 file list in the plan and the same JS input capture as G2.

`m3-green` passed 585 tests in 14 files with matching inputs.

## U3, cases 5, 16 and 22

G1 RED — EJECUTAR. Existing held-download and stale-poll case requires the
native confirming state to survive host rejection.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/optional-chatterbox-client.test.ts -t 'preserves download'
```

G5 RED — EJECUTAR. The synthetic failed transfer does not establish retained
installed bytes. Record Rust source/tool inputs and default feature mode.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml cfr22_failed_transfer_does_not_claim_installed_bytes
```

`u3-client-red` passed the success control and reproduced the false Failed
state after a host denial. `g5-u3-red` reproduced the installed size claim.

G5 and Rust static checks — EJECUTAR on final native changes in both feature
modes. Reuse the host capture design for registry, compiler, cache, executable,
embedded resources and current workspace inputs.

```powershell
pnpm.cmd format:check:rust
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_optional_chatterbox::tests
pnpm.cmd lint:rust
```

## U11, cases 15, 19 and 23

G4 RED — EJECUTAR. Exercise reordered ordinary receipt records and strict
installed binary fields in the configured Windows release Node suite. Capture
the release script, package aliases, authorities, fixtures and JS tools.

```powershell
node --test apps/desktop/scripts/windows-release.node-test.mjs
```

G1 final desktop and G4 Windows evidence — EJECUTAR. Run the ExecPlan’s
affected desktop union after the optional client/control change and the
release-owner Node test after the exact-pair wrapper and evidence writer.
Use the fresh host receipts `g1-final` and `g4-final`; historical runtime
results have incomplete current input identity.

G5/G11 renewal — EJECUTAR. Run both G5 feature modes and configured Rust
format/Clippy leaves against the final Rust inputs. The new case 5 Windows test
uses a fresh manager, installed runtime and backup sentinels, blocked staging,
active-operation exclusion, explicit Check and malformed-path preservation.

G1 renewal — EJECUTAR. G1 final initially passed 584 of 585. A second status
region duplicated the native denial message and broke the existing SFA-06
accessibility assertion. Suppress the redundant region while the renderer
still considers acquisition available and rerun the focused controls suite.

G6 — EJECUTAR. Collect focused browser cases and exercise Chromium once
against the current patch. Includes CFR-02, CFR-03, CFR-08, CFR-12, CFR-16 and
CFR-17 and adjacent controls. The two new stop arms extend the PN fixture.

## Preliminary integration disposition before R02

This records the state supplied to preliminary review R01. The R02 and host
completion sections below supersede the open gates recorded here.

- G1 final: 584/585. The only failure was the duplicate status region for
  SFA-06. That control is the only production edit after the run.
  The entire control file then passed 25/25 in `g1-controls-final`.
- G4: 48/48 in `g4-final`. The broad capture detected a Chromium test
  edit during this Node run. The release script, wrapper, Node test,
  configured aliases, authority, fixture and installed JS rows match.
- G5: 80 pass and 3 pre-existing ignored in each feature mode, receipts
  `g5-default-final-04` and `g5-locked-final-04`; Rust format and both Clippy
  modes passed. The `-04` runtime closure includes the new locked staging,
  concurrent ownership, malformed path and Check recovery coverage.
- G6: `g6-integration-02` collected 15 and passed 13. Its Chromium cache
  discovery failed, so the successful assertions are diagnostic and need a
  fresh run with browser bytes captured. Initially Stop preceded B admission.
  With frames retained until admission, `g6-stop-probe` passed stopped-exact.
  A range-only mock still permits the block fallback. A throwing element
  geometry mock produces a page exception. The current non-finite geometry
  fixture avoids that exception and reaches unavailable. After real wheel
  movement, Play remains disabled in `g6-stop-invalid-rect`. This is an open
  integration failure. The receipt and synthetic trace are retained.
- G7, G8 and G9 are pending on the current host. G8 uses local V7
  admission without inference. G9 must preserve the original tracked
  evidence file and verify restoration and the exact current unsigned pair.
- G10: `g10-native-harness` passed 99 Node and 12 adaptive Vitest tests.
- G11: TypeScript package build/types, lint and format passed before the
  latest browser-fixture refinement. Final-input renewal follows the
  correction. Final Python static checks and both Rust modes passed.
- G12: current preliminary review will record scope, diff and path identities.
  Independent acceptance and final evidence/privacy checks remain pending.

## Preliminary review R01 follow-up

The [immutable review report](review-preliminary-r01.md) records five
findings and the missing authority/fault controls. The Chromium provenance
diagnostic observed wheel intent at scrollTop 293 after movement from 13.
The following scroll event also saw 293 and therefore could not prove
movement. A non-passive native wheel listener records the pre-scroll
position and still requires an actual displacement. The real browser case
then passed in `g6-r02-wheel`.

R02 — EJECUTAR. Renew G1 and G2 unions after the final source formatting,
focused Chromium race cases followed by the final browser selection, G5 and
Rust static checks in both modes, and G3 v12 plus screen/authority tests
with configured Python static checks. Renew G11 TypeScript after fixture
stabilization. Existing G4 and G10 have unchanged direct release/harness
inputs. G7–G9 remain pending.

### R02 focused and integrated results

| Gate | Current host result |
| --- | --- |
| G1 | `g1-r02-final` passed 585 tests in 14 files. |
| G2 | `g2-r02` passed 563 tests in 10 files after formatting and the package build. Two new controls cover multi-digit editorial labels. |
| G3 | `r02-python` passed 40 v12 and CustomVoice screen/authority tests. The unaffected prior G3 tests retain their inputs. A pre-existing pytest cache warning did not affect execution. |
| G4 | `g4-final` passed 48 tests. The subsequent corrections leave release code, fixtures, authority and the installed Node dependency closure unchanged. |
| G5 | `g5-default-final-05` and `g5-locked-final-05` each passed 80 tests with three pre-existing ignored cases. Check clears only its own staging-reconciliation failure when staging is now absent. |
| G6 | `g6-r02-final` collected and passed 20 Chromium tests. `g6-r02-races` passed the five new focused race arms. Browser bytes and package exports were captured. |
| G10 | `g10-native-harness` passed 99 Node tests and 12 adaptive Vitest tests. G1 includes Product and Reader controls on current bytes. |
| G11 | `g11-r02-final` passed TypeScript format, lint and all workspace type checks after `pnpm.cmd build:packages`. Python format, Ruff and mypy passed. Rust format and both Clippy modes passed in the `-05` capture. |

G6 exercises actual wheel and normal descendant keyboard focus after stopped
unavailable placement. Resizing alone leaves Play gated. Explicit Play
starts the measured passage. The coordinator's equal-coordinate regression
still confirms that deduplication does not block recovery. The held appearance
fixture verifies both editing orders and preferences on reopening. The held
follow fixture delivers actual wheel motion before releasing the correction,
and a synthetic scroll leaves that correction armed. The saved heard position
survives both arms.

The v12 fault tests cover pre-existing quality and a competing quality
publication. Cleanup retries refuse substituted session or scorecard
identities and preserve another publisher's summary. V3 tests exercise
the eligibility threshold, pronunciation, later audiobook suitability and
stable speaker-order ties. No model ran for those scorecard controls.

At the end of R02, G7–G9 and G12 acceptance were pending. Native evidence preparation binds
the complete current G6 package export set to its before/after hashes, and
revalidates historical Piper/V7 asset bytes before use.

### Host completion and G12

The [native and package summary](native-package-summary.md) records G7–G9
commands, outcomes, exact installer identity, and restoration. G8's
successful command, outer cleanup failure and successful guarded recovery
retain separate receipts. The current host validation used the local verified
Piper/V7 assets and current binaries, with no historical runtime PASS treated
as a current host result.

G12 — EJECUTAR. Run `pnpm.cmd check:evidence` and `git diff --check` in normal
PowerShell. Inspect links, changed paths, frozen authorities and scope. The
canonical system diagram remains accurate because process boundaries and
privacy/data flows did not change. The M005 narration preparation boundary
continues to end at bounded source-to-narration preparation. No audio or
inference claim extends that milestone. Archive after independent approval.

The G10 native-smoke Node leaf imports the generated EPUB package. After the
R02 package build, `g10-native-smoke-r03` renewed that leaf and passed all 59
tests. The other G10 leaves retain their original passing receipts. The review
packet preserves input projections for both the renewed and retained leaves.

`g12-final` passed `pnpm.cmd check:evidence` and `git diff --check` in normal
PowerShell. Relative links resolve, the Git index is empty, the v2 authorities
and tracked historical Windows evidence match HEAD, and the curated evidence
contains synthetic results rather than raw logs, private EPUB content, generated
audio or model files.

### Independent acceptance

`CFR-CR-FINAL-R03-20261113` approved the integrated change with no remaining
findings. The [final review report](review-final-r03.md) records the exact
approved patch and evidence. The ExecPlan moved to the completed index after
this approval. Closeout changes are documentary and preserve the reviewed
runtime and test files.
