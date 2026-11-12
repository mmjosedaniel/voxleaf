# Five-pass audit execution ledger

Execution started 2026-11-11. Base and initial HEAD:
`a3241571944530d468e2f4f2d37a0a2394a8df84`.
Branch: `codex/five-pass-audit-plan`. Initial index/worktree: clean.
Scope and authority: [completed ExecPlan](../../completed/five-pass-audit-revalidation-and-corrections.md).
No staging, commits, push, PR, merge or publication authorized.

## Evidence policy and initial readiness (historical)

All checks run in local PowerShell outside the managed sandbox. On
2026-11-11T20:01:21Z, readiness reported Node `v24.20.0`, pnpm `11.15.1`,
uv `0.11.29`, Cargo/Rust `1.97.1`. Prepend `tmp/rpi-tools` to PATH so nested
`pnpm.cmd` resolves the existing pinned Corepack shim. Root package.json fixes
pnpm 11.15.1 and admits Node ^24.15.0. Readiness is not a behavior PASS.

Raw logs and execution-time identity manifests belong to ignored
`tmp/evidence/five-pass-audit/`. Public records contain synthetic/content-safe
observations only. Every RED must identify the asserted defect, not fixture or
infrastructure failure. Each implemented case receives independent review before
source writing resumes. Review approval is scoped; final integration remains
pending until the selected combined gates and final exact-patch review pass.

No prior behavioral test result is currently reused. U8/ADD-01 explicitly reuses
U8/2.2 Rust formatting and Clippy after independent full-input/environment
equivalence review. RPI, DCR, CAF and EBC provide historical
lineage and reusable fixture/control designs. Their recorded outcomes stay bound
to their original inputs. Changed source/tests/harness, transitive dependencies,
configuration, lockfiles, tools, artifacts, discovered membership or relevant host
conditions invalidate affected results. Missing original identity/environment
proof requires a fresh run. Verified assets may be reused separately. The nine
existing v7 runtime/model assets now match current manifest sizes and SHA-256;
the [host preparation](host-preparation.md) distinguishes that from pending G8.

The initial Node observation above differs from `.nvmrc` (`24.18.0`). Before
behavioral tests, the existing pinned installation was selected through
process-local PATH, followed by the pnpm shim directory. At 20:03:02Z,
`node --version` and `pnpm.cmd exec node --version` both returned `v24.18.0`,
`pnpm.cmd --version` returned `11.15.1`, and
`uv run --project services/tts --locked python --version` returned `3.12.10`.
No global Node selection or downloaded asset changed.

## Case and gate register

Gate definitions and canonical commands are in the ExecPlan G0-G12 table.
Focused command/test filters and exact identities are recorded before each run.
The table retains the attributed unit approvals. All retained cases also have
integrated approval FPA-INTEGRATED-CR-R1-20261111, linked below.
G11 applies to each affected language; G12 and final integrated review apply to
the whole campaign. G0 precedes consumers after EPUB/shared source changes.

| Case | Unit | Focused RED/GREEN and controls | Required combined gates | State |
| --- | --- | --- | --- | --- |
| 1.1 | U1 | G1 coordinator/Reader navigation ownership | G7, G11, G12 | Product/browser APPROVE FPA-G6-CR-R1-20261111 |
| 3.1 | U1 | G1 first-start failure/recovery checkpoint | G7, G11, G12 | Product/browser APPROVE FPA-G6-CR-R1-20261111 |
| 4.1 | U1 | G1 canceled recovery/next Play/manual move | G7, G11, G12 | Product/browser APPROVE FPA-G6-CR-R1-20261111 |
| 3.2 | U2 | G1 scheduler/PCM initial lead and allocation | G7, G11, G12 | Product/browser APPROVE FPA-G6-CR-R1-20261111 |
| 5.1 | U3 | G1 Reader/highlight/tracker/persistence | G7, G10, G11, G12 | Product/browser APPROVE FPA-G6-CR-R1-20261111 |
| 5.2 | U3 | G1 pointer/focus placement lifetime | G7, G10, G11, G12 | Product/browser APPROVE FPA-G6-CR-R1-20261111 |
| 1.3 | U4 | G1 loader dispatch/full-queue controls | G7, G10, G11, G12 | Product/browser APPROVE FPA-G6-CR-R1-20261111 |
| 2.4 | U4 | G1 latest matching observer entries | G7, G10, G11, G12 | Product/browser APPROVE FPA-G6-CR-R1-20261111 |
| 1.4 | U5 | G2 range literals/public mapping controls | G7, G11, G12 | Unit APPROVE renewed FPA-U5-2.5-CR-R1-20261111; fresh G2 verified |
| 2.5 | U5 | G2 structural language/offset/budget controls | G7, G11, G12 | Unit APPROVE FPA-U5-2.5-CR-R1-20261111; fresh G2 verified |
| 4.2 | U6 | G2 resolver/public navigation controls | G7, G11, G12 | Product/browser APPROVE FPA-G6-CR-R1-20261111 |
| 3.3 | U7 | G1 Reset/profile ownership/failed Stop | G7, G11, G12 | Relevant scope renewed by FPA-U8-ADD-01-CR-R1-20261111 |
| 2.1 | U8 | G1 client/controls/settings ownership | G8, G11, G12 | Unit APPROVE renewed by FPA-U8-ADD-01-CR-R1-20261111 |
| 2.2 | U8 | G1 and G5 busy removal/Stop rollback | G8, G11, G12 | Unit APPROVE renewed by FPA-U8-ADD-01-CR-R1-20261111 |
| ADD-01 | U8 | G1 and G5 committed cancellation/cleanup failure | G8, G11, G12 | Unit APPROVE FPA-U8-ADD-01-CR-R1-20261111; cumulative U8 renewed |
| 1.5 | U9 | G3 benchmark CLI bounded subprocess output | G11, G12 | Unit APPROVE renewed FPA-U10-1.7-CR-R1-20261111 on expanded capture |
| 1.7 | U10 | G3 dual-worker/memory finalization ownership | G11, G12 | Unit APPROVE FPA-U10-1.7-CR-R1-20261111 |
| 2.3 | U11 | G3 cancellation admission/invalidation/publication | G11, G12 | Unit APPROVE FPA-U11-2.3-CR-R2-20261111; R1 F1 resolved |
| ADD-02 | U11 | G3 cold/measured loads, memory stop/cleanup | G11, G12 | Unit APPROVE renewed FPA-U11-2.3-CR-R2-20261111 |
| 1.8 | U12 | G4 wrapper argument rejection before child work | G9, G11, G12 | Unit APPROVE renewed FPA-U12-4.4-CR-R1-20261111 |
| 4.4 | U12 | G4 receipt key equivalence/strict fields | G9, G11, G12 | ALREADY CORRECT, APPROVE FPA-U12-4.4-CR-R1-20261111 |
| 3.4 | U13 | G3 target wheel/universal/source/ambiguity | G9, G11, G12 | Source/inventory APPROVE FPA-U13-3.4-CR-R1-20261111; generated core APPROVE FPA-U13-CORE-CR-R1-20261111 |
| 4.3 | U14 | G3 authority staged replacement/rollback | G11, G12 | Unit APPROVE FPA-U14-4.3-CR-R1-20261111; integrated approval recorded below |
| 5.3 | U15 | G4 installer descendants/deadline/restoration | G9, G11, G12 | Unit APPROVE FPA-U15-5.3-CR-R1-20261111; U12 controls renewed |
| 5.4 | U16 | G4 response body timeout/cancel/invalid JSON | G7, G10, G11, G12 | Unit APPROVE FPA-U16-5.4-CR-R1-20261111; final G4/harness/global JS evidence assessed |
| 1.2 | — | Preserve unsupported PNG navigation/fallback policy | Documentary disposition | Withdrawn as planned |
| 1.6 | — | Preserve pilot/official exit distinction | Documentary disposition | Contract unresolved; no fix authorized |
| 1.9 | — | Preserve ADR-0046 single-instance boundary | Documentary disposition | Deferred as planned |
| 4.5 | — | Preserve dedicated caller buffer ownership | Documentary disposition | Deferred as planned |

## Execution and review receipts

Current integration status: the selected desktop, EPUB, Python, Rust, Node,
Chromium, real native Piper, resource, optional-admission and Windows installer
gates pass. [Package/lifecycle evidence](package-gates.md) verifies declared host
restoration; [runtime renewal](runtime-evidence-renewal.md) and
[final equivalence](final-evidence-equivalence.md) bind current inputs.
G12 documentary checks pass before integrated review.
[FPA-INTEGRATED-CR-R1-20261111](review-INTEGRATED-R1.md) is APPROVE with no
findings. The plan is archived; fresh archival documentary checks and their
separate closeout report follow this update in the same evidence directory.

All25 retained cases have reviewed unit dispositions:24 corrections and4.4
already correct. The four original exclusions/conditions remain unchanged.
Final native outcomes and preserved failures are in
[native gates](native-gates.md): A05 startup, both Piper language arms and native
resource checks pass after the reviewed portfolio harness correction. Earlier
failed attempts and their verified restoration remain separately attributed.

The [final input comparison](final-evidence-equivalence.md) records unchanged
source, artifact and tool identities for seven current frontend/browser/type
results. The integrated review independently approved that reuse. Fresh combined Python
and Rust checks and refreshed Piper configuration are in
[combined gates](combined-gates.md).

G10's [Chromium resource gate](g10-browser.md) passes6/6 against 640 unchanged
current inputs; native G10 also passes on final A05 inputs. The integrated review
assessed both separately from the earlier G6 approval.

The following unit execution notes preserve their original chronology; pending
statements there describe those checkpoints, not current batch acceptance.

Case 1.1 has an attributed [RED/GREEN receipt](u1-case-1.1.md); independent
unit [review R1](review-U1-1.1-R1.md) is APPROVE. Its patch remains subject to
renewed review after later U1 changes and to combined gates. U1 has one assigned
implementation writer; a separate read-only preparation agent is mapping existing
suite paths and documentation constraints. The reusable `change_reviewer` is
assigned independently and does not run tests, edit or delegate.

U1's closed implementation allowlist is
`apps/desktop/src/tts/product-narration-coordinator.ts` and its existing
`product-narration-coordinator.test.ts`. App and ReaderPublication are inspected
consumers; caller edits require a new work-order decision. Case 1.1 uses held
shutdown to distinguish delayed boundary/paragraph requests from a superseding
chapter request, with pause/play and replacement controls. Cases 3.1 and 4.1
separately exercise attempted-start and visible-location recovery authority.

Before Vitest ran, the first local capture attempt failed because
`Tee-Object -LiteralPath -Append` is not a supported parameter set. Its reported
zero came from a stale LASTEXITCODE and is not a test outcome. Keep that failed
wrapper output; correct to supported capture and fail on wrapper errors. This
is a diagnosed capture failure, not product RED or current PASS.

## Configured focused suite selection

G1 prefix: `pnpm.cmd --filter @voxleaf/desktop exec vitest run`; paths below
are relative to that desktop cwd. G2 uses `--filter @voxleaf/epub` instead and
EPUB-relative paths. Select RED by case test name; GREEN includes relevant
existing neighboring assertions. Record the actual selected lists per receipt.

| Unit | Existing suites |
| --- | --- |
| U1 | `src/tts/product-narration-coordinator.test.ts`; consumer controls `src/reader/ReaderPublication.test.tsx`, App as needed |
| U2 | `src/tts/adaptive-buffer-scheduler.test.ts`, `src/tts/pcm-playback.test.ts` |
| U3 | `src/reader/segment-highlight-controller.test.tsx`, `src/reader/active-visual-locator.test.ts`, `src/reader/ReaderPublication.test.tsx`, `src/persistence/narration-position-save-bridge.test.ts`, `src/persistence/reader-position-save-coordinator.test.ts` |
| U4 | `src/reader/images/publication-raster-image-loader.test.ts`, `src/reader/images/SemanticRasterImage.test.tsx`, `src/reader/images/raster-image-source.test.ts` |
| U5 | `src/narration/narration-normalizer.test.ts`, `src/narration/narration-source.test.ts`, `src/narration/narration-prepared-segment.test.ts`, `src/narration/narration-resource-bounds.test.ts`, `src/integration/narration-preparation-matrix.test.ts` |
| U6 | `src/locator/target-resolver.test.ts`, `src/integration/ingestion-matrix.test.ts`, relevant `src/navigation/navigation-document.test.ts`, `src/public/open-epub-publication.test.ts` cases |
| U7 | `src/settings/narration-settings-actions.test.ts`, `src/tts/hardware-profile-compatibility.test.ts` |
| U8 | `src/tts/optional-chatterbox-client.test.ts`, `src/tts/OptionalChatterboxControls.test.tsx`, `src/settings/narration-settings-actions.test.ts`; both G5 Rust feature modes |

G3 prefix: `uv run --project services/tts --locked pytest`; suite filenames
below are under `services/tts/tests/` relative to repository root.

| Unit | Existing suites |
| --- | --- |
| U9 | `test_benchmark_cli.py` |
| U10 | `test_benchmark_dual_worker.py`, `test_benchmark_dual_worker_runtime.py`, `test_benchmark_dual_worker_cli.py`, `test_benchmark_memory.py` |
| U11 | `test_benchmark_batch_official.py`, `test_benchmark_batch_execution.py`, `test_benchmark_batch_cli.py`, `test_benchmark_batch_matrix.py`, `test_benchmark_v13_authority.py`; adapter suites if touched |
| U13 | `test_release_dependency_graphs.py`, `test_release_core.py` |
| U14 | `test_chatterbox_v7_authority.py`; preparation/release consumer suites if affected |

G4 root commands are `node --test apps/desktop/scripts/windows-release.node-test.mjs`
for U12/U15 and `node --test apps/desktop/scripts/native-webdriver-client.node-test.mjs`
for U16. U16 changes also consume `pnpm.cmd test:native-smoke-harness`.
The G7 portfolio preflight's applicable configured leaves include desktop
Vitest `src/tts/ProductNarrationControls.test.tsx`,
`src/tts/AdaptivePreparationControls.test.tsx`, and
`src/reader/ReaderPublication.test.tsx`, plus native-WebDriver and
`bilingual-portfolio-host.node-test.mjs` Node suites. Bind deduplication to
actual cwd/arguments/inputs, then run each selected Piper arm's
`--preflight-only` and real arm sequentially.

## Preparation dependencies requiring explicit work orders

- U13: the corrected core inventory is embedded in the Piper package and can
  invalidate its runtime manifest. If reproduced, add the configured
  `pnpm.cmd package:piper-core:write-manifest` generator and its closed generated
  manifest/evidence outputs to U13's allowlist before generation. A plain build
  against an obsolete manifest would fail and would not repair authority.
- G9: the release wrapper writes the existing Windows v3 evidence path. Preserve
  its exact historical bytes with a restoration journal, capture fresh output
  in ignored evidence and restore the original. Use a new lifecycle receipt
  directory with the required filename, not a predecessor receipt path.
- G7/G10: reverify installed browser/driver compatibility, default native build,
  Piper assets and firewall/process permissions. Keep release-locked and default
  artifacts distinct. Native/audio/GPU/package stages have one owner.
- U11: determine whether changed cancellation proof fields/derivation require
  a successor authority before edits; historical v4/v13 results remain immutable.
  Read-only preparation found v13's cancellation trials inherit v4's closed
  shape and current derivation trusts five `passed` booleans. The retained 2.3
  correction needs witnessed acceptance, identity invalidation and publication
  suppression; the next available authority is currently v14. Freeze its bounded
  work order and durable decision at U11, rechecking version availability then.
  Early memory safety observation must remain separate from the inherited
  comparable measurement window; incomplete cold trials are non-derivable.

## Host and closure

Final G7/G10 native checks, G8 admission/recovery and G9 installer lifecycle and
outer restoration are accepted by the integrated review. See
[native gates](native-gates.md) and [package gates](package-gates.md) for exact
commands, artifact identities, host comparisons and retained recovery material.
Admission does not claim inference; unsigned packaging does not claim signing,
publication, clean-host validation or opaque global shell-history restoration.
The plan and maintained indexes are archived after integrated approval. Final
documentary acceptance is recorded separately so its report is outside its own
reviewed manifest. HEAD and the empty Git index remain unchanged.

### Historical early browser checkpoint

Focused U3 Chromium attempts use synthetic EPUB/audio and isolated browser
contexts. Their existing runner owns the loopback server and browser teardown;
no human audibility or native-model claim follows. No installer, GPU inference,
firewall or real user-profile mutation has been started.
No installation/profile restoration is currently required. Mandatory future native/resource,
admission and package/lifecycle gates remain pending; the plan stays active.
