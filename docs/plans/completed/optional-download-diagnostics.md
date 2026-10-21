# Optional download diagnostics and bounded installed probe

## Goal

Preserve the last Chatterbox artifact-download failure in process memory and
allow explicit JSON export, then run a short probe in the installed application.

## User-visible outcome

Settings offers manual export of the most recent download error. The report
contains bounded technical fields, survives retries within the process, and is
lost when VoxLeaf exits. No diagnostic file or upload is automatic. No report
is fabricated for successful downloads or intentional cancellation.

## Initial state

`download_artifact` discards its source errors into `DownloadFailed`. HTTP
status and length rejection are conflated. The installed v5 acquisition is
incomplete; three subsequent native-function probes succeeded but were not
installed-app acceptance. HEAD remains `702f80b5b688193e10ef58f9a5cbebb3a42a4090`;
the existing v5 integration patch is preserved and remains uncommitted.

## Scope and non-goals

Add a bounded native diagnostic, a read-only command, renderer validation and
manual export, focused regressions, user/architecture/development documentation,
and an installed probe that cancels around the first MiB. Preserve the generic
operation failure codes and existing acquisition/cleanup semantics. No new
dependencies, retry/resume algorithm, timeout changes, complete acquisition,
inference, publication, commit, or replacement of B06/B07 acceptance.

## Relevant files and documentation

Native owner: `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`, its tests
and `main.rs`. Renderer: `optional-chatterbox-client.ts`,
`OptionalChatterboxControls.tsx` and focused tests under `apps/desktop/src/tts`.
Installed harness: `apps/desktop/scripts/ordinary-chatterbox-release-host.mjs`
and its tests. Documentation: user Windows guide, architecture overview/system
diagram, development release guide, this plan and active index. The parent v5
security-refresh plan retains its full installed acceptance requirements.

## Architecture and constraints

Native owns exactly one structured failure record, separate from operation
state so cleanup/retry cannot erase the original failure. A later download
failure replaces it. Record stage/category, artifact ordinal/provider, elapsed
time, bytes, HTTP status/length and numeric OS error where available. Never
store source error strings, URLs, paths, headers, book text, audio or secrets.
The renderer can only read this report; export uses a user-initiated local JSON
download and no arbitrary native filesystem write command. Memory and report
size remain bounded. An error in reporting must not prevent cleanup.

## Milestones

1. Establish regression and freeze the existing patch; implement native capture.
2. Implement and test the validated read/export UI; document the behavior.
3. Run host quality/regression checks; package the exact candidate.
4. Install temporarily with verified preservation, exercise report export and
   bounded real acquisition/cancellation, then restore the original state.
5. Obtain independent `change_reviewer` approval for this exact addition and
   record evidence and remaining parent-plan blockers.

## Testing and benchmark strategy

All commands run in ordinary local PowerShell outside the managed sandbox.
Use existing `pnpm --filter @voxleaf/desktop test`, `pnpm run test:rust`,
`format:check`, `lint:typescript`, `lint:rust`, `typecheck:typescript`,
`test:browser`, `test:native-startup`, and `package:windows:check` as applicable.
The installed harness needs an explicit bounded mode before execution; it must
not enter the full journey or claim B06/B07 completion. Reuse the existing
verified-core packaging and backup/restore wrappers with fresh candidate/input
identities. Tests cover replacement/reset, original-error preservation, HTTP
versus size rejection, OS/timeout classification, privacy, export failure and
explicit export only. Retain logs outside Git and provide exact host receipts.

## Risks and rollback

Avoid concurrent acquisition, source changes during review, signed-URL leakage,
unbounded error strings and automatic filesystem persistence. Verify restored
user data/installation/registry/shortcuts after the installed probe. Any
unexpected process or occupied backup path stops mutation. Exported diagnostic
test files and temporary staging are task-owned and removed after verification.

## Progress log

- 2026-10-20: Read the current native error mapping, renderer contract and
  installed preservation workflow. The change is authorized; implementation,
  host validation and independent acceptance are pending.
- 2026-10-20: Implemented one typed native report, nullable read-only IPC,
  validated manual JSON export and its Settings control. Documented retention,
  privacy and export in ADR-0059, the Windows user guide, product requirements,
  architecture overview/system diagram and the release development guide.
- 2026-10-20: Host Rust checks passed (110 default and 109 release-locked tests;
  two existing ignored host tests in each configuration), plus both Clippy gates.
  TypeScript types/lint and the desktop suite passed (801 Vitest and 83 Node
  tests). Nine real-browser tests, all format checks and evidence checks passed.
  Initial test-double and harness initialization failures were fixed and rerun.
- 2026-10-20: Added the explicit `package:windows:download-probe` harness mode.
  It exercises a real native error, manual Settings export, bounded ordinary
  acquisition/cancellation and process restart. It cannot be combined with full
  acquisition corrections and does not issue a B06/B07 acceptance receipt.

## Discoveries and decisions

- A debug `eprintln!` alone is insufficient: the installed Windows GUI has no
  normal console. The report therefore needs a native read-only IPC boundary.
- The diagnostic is an error report, not a transfer history or a connectivity
  fix. Successful bounded probes do not identify the old discarded error.

## Final validation results

Normal-host command evidence (Windows package identity result 15700), with
logs and input manifests retained outside Git under the task artifact directory:

- `download-diagnostics-fast`: `pnpm run test:rust` and `pnpm run lint:rust`
  passed before the subsequent TypeScript test-double error stopped that job.
  Native source has not changed since those checks.
- `download-diagnostics-renderer-r3`: `pnpm run format:typescript`,
  `pnpm run typecheck:typescript`, `pnpm run lint:typescript`, and
  `pnpm --filter @voxleaf/desktop test`; exit 0.
- `download-diagnostics-browser`: `pnpm run format:check`,
  `pnpm run check:evidence`, and `pnpm run test:browser`; exit 0, nine tests.
- `download-diagnostics-harness`: `pnpm run format:check:typescript`,
  `pnpm run lint:typescript`, and `pnpm --filter @voxleaf/desktop test`; exit 0,
  801 Vitest and 83 Node tests after adding exact installer/executable hashes
  to the bounded receipt.
- `download-diagnostics-package`: verified the complete source copy, ran
  `pnpm run package:piper-core:check` and `pnpm run package:windows:check`, then
  `pnpm --filter @voxleaf/desktop tauri build --config <short-resource-config>
  --features release-locked-runtime`; exit 0. The existing short-resource
  mapping preserves payload destinations and checks every copied resource hash.
  The unsigned local installer is 203,866,547 bytes, SHA-256
  `c8580509978288d207d086c7a97e51899bf625747ffebe2fc4bc85a67e18ea30`.
- Initial installed attempts exposed two harness defects: text comparison of
  equivalent JSON with different key order, and a Cancel request after an
  operation had already failed. Semantic comparison and normal retry selection
  fixed those defects. The harness also waits for the Settings controls and
  records fixed stage names. All attempts restored the original user state.
  `download-diagnostics-harness-r5` repeats formatting, lint and the desktop
  suite successfully for the final harness.
- `download-diagnostics-installed-r4`: `pnpm run package:windows:download-probe
  --installer <download-diagnostics-candidate-setup.exe>
  --receipt <download-diagnostics-installed-r4.json>` passed. The actual
  installed executable hash is
  `7734f9a955d7d8207d420487b9feed9bbdfa252f92d5898c367dbfc075ade5b4`.
  A task-owned directory at the partial-file path induced native `create-file`
  / `io` / OS code 5 after HTTP 200 in 395 ms. The manually exported JSON matched
  the native report. A subsequent real acquisition reached an observed
  1,770,496 bytes, cancelled to `absent`, removed staging, retained the original
  error, and discarded it on process restart. This controlled OS error is not
  evidence of the cause of the historical intermittent connection failure.
- The preservation receipt verifies unchanged data, installation state,
  registry, shortcuts and startup value, with no leftover test installation.
  Aggregate SHA-256 comparison passed; the inventory and digest remain in the
  local preservation receipt. The ordinary installation root was absent
  before this test and remains absent afterwards. No firewall changes or TTS
  inference were required.

Independent review `DOWNLOAD-DIAGNOSTICS-R1-ASTRA-20261021T031411Z` approved this
diagnostics feature and bounded installed probe with no findings. It verified
all 1,343 source identities before/after review, all 12 job-input comparisons
and the 2,031-resource mapping. Its immutable report and evidence are retained
in the local `download-diagnostics-20261020` artifact collection. The final
documentary closeout report is retained separately as
`DOWNLOAD-DIAGNOSTICS-CLOSEOUT-R3`, outside its own source manifest. Closeout R2
requested two stale status-reference corrections in the ADR index and system
diagram; those references now point to this completed, scoped outcome.

This scoped ExecPlan is complete. The installed probe covers the release IPC,
manual export, cancellation and restart boundaries directly; it is not full
acquisition or GPU narration acceptance. The parent security-refresh plan's
B06/B07 blockers remain unchanged. No commit, push or publication was performed.
