# Piper ONNX Runtime compatibility for PR #219

## Goal

Prepare PR #219 on current main with ONNX Runtime 1.30.0, preserving Piper 1.4.2
and both existing voice artifacts. Commit and publish only the validated patch;
the maintainer performs the merge.

## User-visible outcome

The packaged local CPU narrator continues to generate Spanish and English audio,
cancel safely, and release its resources with the updated inference runtime.

## Current state

Main was clean at 2640d1f744e05c453cb4632213cca4be5cd4eac7. The original PR changes
only the core manifest. Its cutoff excludes the requested release, its lock is
stale, and the adapter rejects every ONNX Runtime version except 1.27.0.
The source manifest, component inventory and packaged file hashes also bind the
old graph. Main has been merged into codex/prepare-pr-219 without conflicts.

## Scope and non-goals

Update the current release graph, exact adapter runtime gate, regression tests,
source/inventory/package identities and current contributor documentation.
Preserve frozen v6/v8 candidate manifests, historical evaluation results, voice
hashes, Piper settings, protocol v1, profile selection and cancellation rules.
Do not update Piper itself, optional engines, or unrelated dependencies. No
release publication, signing, private book ingestion or audio persistence.

## Relevant files and documentation

- services/tts/release/core and python-license-evidence.json.
- services/tts/src/voxleaf_tts/piper_adapter.py and its tests.
- scripts/release_inventory.py and existing package/host validation scripts.
- Current dependency/setup/release guidance and a bounded runtime-upgrade ADR.
- Product MVP, ADR-0020, system diagram and agentic-change-review workflow.

## Architecture and constraints

One local service tree, exact CPU provider, transient bounded PCM and identity-
first cancellation remain unchanged. Historical ONNX 1.27 evaluation evidence
must not be relabeled as evidence for 1.30. The new runtime is admitted only with
fresh deterministic, real-model bilingual and packaged application checks.

## Milestones

1. Reproduce dependency resolution and runtime gate incompatibilities.
2. Add regression coverage and apply the smallest coherent graph/runtime update.
3. Regenerate inventory and packaged authorities using repository tooling.
4. Run normal-host checks, bilingual synthesis/lifecycle/performance journeys,
   and obtain independent change_reviewer approval for exact identities.
5. Commit/push, update the existing PR and verify exact-head remote CI.

## Testing and benchmark strategy

All validation uses normal local PowerShell outside the automation sandbox.
Start with uv lock --project services/tts/release/core --check and focused pytest
for the Piper adapter and release graph. Use existing package:piper-core commands
to regenerate and verify the actual core with offline ES/EN smoke. Run the
existing exact-host scripts for each Piper profile using the refreshed runtime,
then the appropriate packaged narration journey. Keep all existing timing,
memory, cancellation and privacy gates. Finish with pnpm.cmd check,
pnpm.cmd test:browser, pnpm.cmd test:native-startup,
pnpm.cmd inventory:release:check and pnpm.cmd audit:release.
Record installer/listening limits honestly; do not transfer historical results.

## Risks and rollback

ONNX changes can affect model loading, output, latency or native DLL closure.
Reject an incompatible candidate instead of widening version/provider checks or
weakening assertions. Exact source and runtime manifests prevent partial graph
updates. The original graph remains recoverable in main and Git history.

## Progress log

- 2026-10-09: attached PR #219, created the preparation branch and merged main.
  Host lock check exits 1: exclude-newer 2026-08-01 filters the 2026-09-10 release.
  PyPI confirms a Python 3.12 Windows x64 wheel and the same required package
  names. Only ONNX Runtime needs a later package-specific cutoff.
- 2026-10-09: a regression test first demonstrated acceptance of the obsolete
  1.27 runtime (1 failed, 2 passed). The adapter now requires 1.30; the native
  development path binds the current release core instead of the frozen v6
  environment. Model/generation assertions retain historical v6 authority;
  a separate regression binds the current manifest, lock and adapter version.
- 2026-10-09: uv regenerated the 15-entry graph with only ONNX Runtime changed.
  The existing licence normalizer regenerated the ONNX record from installed
  metadata while preserving unchanged optional-runtime licence evidence. The
  full capture command could not find three v3 packages in the available old
  optional environment; no optional package was modified to work around it.
  Inventory generation and 39 focused Python tests passed.
- 2026-10-09: the core package generator passed real offline ES/EN synthesis:
  230,712/211,764 PCM bytes, 2,010 files, 283,547,743 installed bytes and
  192,195,418 compressed bytes. No audio was persisted. The first aggregate
  check found the native authority's old core-lock hash; updating it retained
  the existing tamper rejection test. The repeated pnpm.cmd check passed.
  Production dependency audit passed with existing informational warnings and
  optional-package blind spots. Packaged host journeys and independent review
  remain pending; Windows elevation for the new exact-interpreter firewall
  rules has been requested.

## Discoveries and decisions

- The adapter's exact runtime check is an execution boundary, not just metadata.
- Existing frozen benchmark manifests remain historical 1.27.0 authorities.
  A new ADR must explain the current runtime compatibility overlay explicitly.

## Final validation results

Local implementation and validation are complete. Deterministic checks and
fresh Piper runtime journeys pass; independent review PR219-v3 is APPROVE with
no actionable findings. Logs and immutable review identities are under ignored
tmp/pr-219. Commit/push and exact-head CI are the subsequent PR handoff; neither
this plan nor the review authorizes merging or publishing an installer.

- pnpm.cmd check: exit 0 (check-v2.log), including 404 Python tests, 209 shared,
  651 EPUB, 587 desktop, 38 Node and 87/88 Rust tests, format/lint/types/builds.
- Focused pytest for test_piper_adapter.py, test_release_dependency_graphs.py
  and test_release_core.py: exit 0, 39 tests (focused-green.log).
- pnpm.cmd test:browser: exit 0, seven tests (browser-v1.log).
- pnpm.cmd test:native-startup: exit 0 (native-v1.log), default build and fake
  service. It proves browser/native lifecycle, not real-model playback.
- pnpm.cmd package:piper-core:write-manifest and package:piper-core:check:
  exit 0; generation includes real offline ES/EN adapter smoke.
- pnpm.cmd inventory:release:check, pnpm.cmd audit:release and
  uv lock --project services/tts/release/core --check: exit 0.
- pnpm.cmd --filter @voxleaf/desktop tauri build --config
  src-tauri/tauri.release.conf.json --features release-locked-runtime: exit 0;
  NSIS installer built (release-build.log), not installed or published.
- Direct model-free native-startup-smoke.mjs against the strict release build
  exited 1 (native-release-v1.log). That script expects the unconfigured fake
  service, which existing ServiceChild::configured intentionally disables in
  release-locked-runtime. The official default-build command above passes;
  this exploratory mismatch does not replace the missing real release journey.
- Independent source review PR219-v1: BLOCKED, no confirmed code defects;
  fresh bilingual service/playback/cancellation/resource/privacy evidence is
  required. The native-command disposition above arrived after that report.

- The user created the two exact interpreter firewall rules through an elevated
  PowerShell session. Normal-host inspection confirmed both enabled outbound
  blocks and both exact program paths; ES/EN portfolio preflights passed.
- The first packaged service run failed because Tauri's existing target resource
  directory retained five old onnxruntime-1.27.0.dist-info files. All current
  payload hashes matched, but the exact file-set guard correctly rejected the
  extra files. Quarantining only those five generated residual files restored
  the exact manifest file set. No verifier or tracked runtime file was changed.
- Both selected bilingual-tts-profiles-host.mjs Piper arms passed (exit 0),
  exercising real synthesis, busy rejection, cancellation, reload and shutdown.
- The existing native-startup-smoke.mjs --adaptive-tts-exact-host command with
  --exercise-playback-speeds and each exact --tts-profile/--tts-language pair
  passed against the strict release binary and manifest-verified package.
  Spanish: audible start 3,949 ms, cancellation 651 ms, warm prepared RTF 0.08.
  English: audible start 4,099 ms, cancellation 414 ms, warm prepared RTF 0.09.
  Both passed pause/resume, seek, chapter navigation, six rates (100 to 75%),
  synchronization, bounded resources and cleanup; zero measured underruns,
  external requests, persisted audio files and retained audio units.
- The first English playback run timed out at next-segment seek. An unchanged
  repeat passed. The first result remains in playback-piper-en.log; this is an
  observed intermittent test result, not a diagnosed or fixed defect.
- The broader bilingual-portfolio-host.mjs Spanish arm timed out during profile
  selection because its --exercise-profile-switch route selects Chatterbox.
  Chatterbox v3 is absent on this host; the unchanged packaged selection action
  requires its installed state. The direct Piper journeys preserve all Piper
  playback/resource/privacy assertions but do not claim a cross-engine pass.
- The default build's existing bilingual service entry point also passed ES/EN
  against release/core/.venv using Start-Process -Wait (exit 0 each). An earlier
  direct PowerShell GUI invocation did not wait and supplied no reliable exit
  status; it is not test evidence. Final process inspection found neither
  current-core nor packaged interpreter processes retained.

PR219-v2 was BLOCKED before these fresh host results. PR219-v3 independently
reviewed the 140-path snapshot and all positive/negative evidence, approved the
compatibility change and reported no actionable findings. The unexplained
English seek intermittence remains disclosed; no installer lifecycle,
cross-engine switching, listening-quality score or broader hardware claim is
made. ADR-0053 is accepted. This completed plan records local acceptance;
the existing PR records the subsequent commit, publication and exact-head CI.
