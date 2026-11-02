# Narration settings lifecycle correction evidence

Task: NSL-01–04. Entry and unchanged HEAD:
`bfbf391d7a13e1ee6b3f704051a6596359ce5deb`.
Branch: `codex/narration-settings-lifecycle-corrections-plan`.
The entry index/worktree were clean. No Git mutation or publication is authorized.

All acceptance commands run at repository root in normal local PowerShell 7.6.5
outside the managed sandbox. The process-local offline Corepack shim resolves
the repository's pnpm 11.15.1; Node is 24.20.0. No global installation or engine
bypass was used. Raw receipts, original failures, source membership/hashes,
exports, installed dependencies and browser/tool identities are retained under
ignored `tmp/evidence/narration-settings-lifecycle-corrections/20261102-01/`.
Each gate has a unique ID, exact command/cwd, UTC start/end, exit and input hash.

## Reproduction and correction

| Finding | Executed red evidence | Correction and controls |
| --- | --- | --- |
| NSL-01 | G1-red: false and thrown activation lack local feedback; future profile state leaves Activate enabled. | Fixed activation-specific retry copy, catch and feedback clearing; known persistence/selectable-profile restrictions checked before teardown. Existing native failure snapshots and healthy-loaded reselection remain. A false result is not labeled a storage failure. |
| NSL-02 | G1-red: mounted App imported with `DEV=false`; native selection starts without a narrator, then same-publication Piper owner attaches/starts; stale selection returns true. | Narrator-lifetime changes invalidate App's existing operation guard in the committed layout phase. Stale callbacks cannot commit/stop/refresh/reset a new owner; explicit current-owner retry passes. Reversible persistence and SAF-09 replacement remain covered. |
| NSL-03 | G1-red: real coordinator plus synchronous storage, Prepared-120000 -> Stop -> Quick or Prepared-60000 writes before deferred native shutdown; projection throws `invalid-ui-state`. | Startup changes join outstanding containment and recheck closed/activity/persistence/recovery eligibility before writing. Successful cleanup, failed cleanup and close preserve coherent saved/visible state. All-target natural completion remains covered. |
| NSL-04 | G1-reset-fixture-corrected: mounted App/real coordinator, Quick playback -> Reset -> close/reopen while shutdown waits. Accepted Prepared-60000 is overwritten by Quick; compact 75% is overwritten by 100%. | Dialog pending counts survive child unmount; App owns Reset promise/settlement and compact-speed exclusion. Old completion cannot release newer ownership. Close/reading remain available; post-reset choices work. PSC-04 ordinary Stop speed and truthful partial reset remain positive controls. |

Seven production files, their existing suites and one existing Chromium file
are the implementation unit. No scheduler/projection invariant, protocol, shared
contract, package/model, dependency, normalization, locator, DSP or native source
changes. The system diagram was reinspected and still matches the existing
process, component, persistence and local-inference topology. M005 remains outside
scope. No book content, audio or private host inventory is added to tracked docs.

## Gate decisions and exact commands

| Gate | Classification | Current receipt and outcome |
| --- | --- | --- |
| G0 | EJECUTAR | `G0-exports`, `pnpm.cmd build:packages`: PASS. Cheap rebuild chosen because complete historical preparation proof was not established. |
| G1 | EJECUTAR | `G1-red`: eleven failures, including three NSL-04 setup failures. `G1-reset-fixture-corrected`: three intended NSL-04 failures. Production was unchanged for both. |
| G2 | EJECUTAR | `G2-desktop-current`: eight suites, 407 tests PASS. |
| G3 format | EJECUTAR | `G3-format-current`, `pnpm.cmd format:check:typescript`: PASS. |
| G3 lint | EJECUTAR | `G3-lint-current`, `pnpm.cmd lint:typescript`: PASS. |
| G3 types | EJECUTAR | `G3-types-current`, `pnpm.cmd --filter @voxleaf/desktop typecheck`: PASS. |
| G4 | EJECUTAR | `G4-browser-eligibility`: all six selected Chromium journeys PASS, retries=0; normal package/frontend build hooks retained. |
| G5 | REUTILIZAR CON PRUEBA / EJECUTAR | Identical Piper payload reused; current `G5-core-check`, `pnpm.cmd package:piper-core:check`: PASS. Historical checker PASS is not acceptance. |
| G6 | EJECUTAR | `G6-build`, `pnpm.cmd build:desktop`: PASS; one build, configured frontend hook retained. |
| G7 | EJECUTAR | `G7-Piper`: PASS; original-resource restoration and process/scratch cleanup verified. |
| G8 | EJECUTAR | `G8-evidence-R1` and `G8-diff-R1`: PASS; 82 local link targets exist. Archival document/link checks are renewed for R2. |
| G9 | EJECUTAR | [NSL-R1-20261102](review-R1.md): APPROVE, no findings. Final archival assessment is retained separately as `review-R2.md`. |

G2 command, also used by G1 with appended `-t NSL-` and the corrected reset
reproduction with `-t NSL-04`:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/settings/narration-settings-actions.test.ts src/settings/ReaderSettingsDialog.test.tsx src/tts/product-narration-coordinator.test.ts src/tts/HardwareCompatibilityControls.test.tsx src/tts/OptionalChatterboxControls.test.tsx src/tts/ProductNarrationControls.test.tsx src/tts/hardware-profile-compatibility.test.ts
```

G4 preserves Windows quoting through the pnpm shim:

```powershell
pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep '"NSL-|SPM-01/02|MAF-11 completed Prepared 120000|SAF-09"'
```

G7 directly consumes G6 without rebuilding:

```powershell
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en
```

Rust/Python unit campaigns, full EPUB/shared campaigns, model acquisition,
Chatterbox GPU, Qwen, installer/firewall, six-rate DSP and performance benchmarks
are **NO APLICA**: their responsibilities and consumed implementation remain
unchanged. No CI/protected-branch requirement is waived or claimed as executed.

## Retained failures and bounded renewal

- G1-red's NSL-04 fixture was still in `checking`, so Reset never ran. That is
  setup failure, not reproduction. After setting compatible presentation,
  the targeted rerun demonstrates both real overwrites and pending-state loss.
- G1-red retains the real projection exception and thrown activation's unhandled
  rejection. Final suites have no unhandled-error report.
- Initial G2 passed 406. G3-types rejected two widened fixture literals;
  explicit literal types fixed them. G2/G3 were renewed for changed tests.
- First G4: four passes/two failures. The new precheck incorrectly called
  `isProfileCurrentlyAllowed`, which describes the active profile, preventing
  both NSL activation and existing SAF-09 from reaching native selection. This
  was a product regression, not an infrastructure retry. The correction reads
  compatible supported/development-only profiles for the current language and
  retains the healthy-loaded fast path. A positive different-profile test was
  added. Its first typecheck caught `unavailable` instead of `incompatible` in
  the fixture; corrected before current G2/G3. The full G4 then passed.
- All failed outputs and original receipts remain; first G4 screenshots/traces
  were copied to `G4-browser-failure-artifacts/` before rerunning. No passing
  subset replaced a failed aggregate. No infrastructure retry was consumed.
- An executable hash sampled while G6 was still compiling is retained as
  `G6-precompletion-executable-observation.json`, never as acceptance. The final
  G6 identity was captured only after exit 0 and binds its build receipt.

## Reuse and identity

The exact SPM receipts named by the plan were retrieved into the local historical
reference record: desktop F1, browser F1, build/native F1, exports, core and
Python packaging final. Their old behavioral PASS results are not reused.
The shared/EPUB exports were freshly prepared; configured later hooks still run.

`core-artifact-reuse.json` binds the original SPM manifests and hashes, compares
all 2,024 payload files by relative path, size and SHA-256, and compares all 26
runtime/source/authority/lock inputs plus discovered membership. Drift is empty.
Packaging helpers are excluded from runtime payload; none changed here. Current
G5 checks the archive/evidence/manifest/tree without regenerating or downloading
models. The historical checker environment was not assumed identical.

Current gate receipts bind all tracked/nonignored source/test/config membership,
exports and installed tooling. Later Markdown-only updates do not feed the
TypeScript renderer/tests or the native binary. Current evidence comparison and
independent review must confirm that each consumed closure remains unchanged.

Installed before/after inventories match across 24,009 entries, including
20,360 files and the captured environment; only declared generated caches are
excluded. The current comparison preserves original result/input hashes and
shows zero export-content or membership drift. Differences after G2/G3/G4/G6/G7
are only maintained Markdown. G5 additionally predates the final desktop action
and its test: the Python core checker consumes neither renderer file. No runtime,
checker, package, tool or dependency input changed across that retained gate.

## Native isolation and remaining acceptance

G6 binary SHA-256:
`b44fbc249b39d50cae7e7a3f06f1d899f689f1f5aff5eda9e2fea57f10650845`.
Readiness records compatible WebView2/driver major 156, full tool/browser hashes,
available capacity and writable scratch. The SPM preservation wrapper is reused
as a pattern with new owned paths/receipts; it checks resolved parent containment,
retains the entire original resource tree in a verified recovery sibling, stages
the verified core and restores the original in `finally`. The native runner uses
an isolated WebView profile. Process ownership includes PID, creation time and
executable; pre-existing processes/scratch remain untouched.

G7 passes with five audio contexts created/closed, zero underruns, no stale
playback, zero retained/discarded units after cleanup, zero external requests and
zero generated audio files. Cancellation observed 244 ms. Quick audible start
was 6,505 ms with 23,677 ms playable lead; Prepared was 8,254 ms with 61,157 ms
playable lead. These are this one Piper EN observation, not performance/support
promotion, a six-rate sweep or a Chatterbox GPU result.

`native-restoration.log`, `G6-resources-before.json` and
`G6-resources-after.json` verify identical full original file membership/content,
absent recovery sibling, unchanged tested executable and no new owned process
or scratch root. Existing scratch roots were retained. There was one native build
and one native arm; no package regeneration, personal installation or firewall
mutation. Independent NSL-R1-20261102 approves implementation and scoped evidence
retention without findings. The separate NSL-R2 assessment covers the final
archival documentation; neither review grants Git/publication authorization.

## Modified files

Production, under `apps/desktop/src/`:

- `App.tsx`: narrator-lifetime invalidation and surviving reset ownership.
- `settings/narration-settings-actions.ts`: selection eligibility before teardown.
- `settings/ReaderSettingsDialog.tsx`: pending ownership and activation eligibility.
- `tts/HardwareCompatibilityControls.tsx`: release only at action settlement.
- `tts/OptionalChatterboxControls.tsx`: bounded activation feedback and retry.
- `tts/ProductNarrationControls.tsx`: compact-speed exclusion during Reset.
- `tts/product-narration-coordinator.ts`: containment before startup persistence.

Regressions: `App.test.tsx`, `settings/ReaderSettingsDialog.test.tsx`,
`settings/narration-settings-actions.test.ts`,
`tts/OptionalChatterboxControls.test.tsx`,
`tts/product-narration-coordinator.test.ts`, and
`apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`.

Documentation: product MVP, testing guide, documentation index, active/completed
plan indexes, this plan moved from active to completed, this ledger and immutable
review reports. No existing completed plan or historical evidence was rewritten.
