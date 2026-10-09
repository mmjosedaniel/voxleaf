# Piper 1.8 compatibility for PR #218

## Goal

Prepare PR #218 for maintainer integration with Piper 1.8.0 and ONNX Runtime
1.30.0. Commit and publish the validated patch, without merging or publishing
an installer.

## User-visible outcome

Both existing local Spanish and English voices work with the refreshed Piper
engine, preserving bounded in-memory playback and identity-first cancellation.

## Current state

Main is af713cc2fe862f2f37f6c1ed1686d9b5a9185fe9 after PR #219. The Dependabot
branch changes only the Piper requirement. The preparation branch incorporates
main and resolves the sole manifest conflict by retaining ONNX 1.30.0 and Piper
1.8.0. The initial normal-host lock check fails because the August cutoff
excludes Piper's September release. The adapter, package source authority,
inventory and lock still describe Piper 1.4.2.

## Scope and non-goals

Update the current core graph, exact version gate, source and license authority,
package hashes, relevant regression tests and documentation. Preserve voice
artifacts, profile preference IDs, ONNX 1.30, CPU-only execution, protocol,
generation settings, historical evaluation authority and optional engines.
Do not add language extras, models, alignment features, automatic downloads,
private books or generated audio files.

## Relevant files and documentation

Core release manifests/lock, Piper adapter/tests, native core-lock authority,
release inventory, dependency/setup guidance, system diagram, ADR-0053 and a
new Piper runtime ADR. Follow agentic-change-review and release tooling.

## Architecture and constraints

The same one-child local inference topology remains. Piper 1.8 embeds a newer
eSpeak-NG source; bind its actual source revision and preserve source notices.
New runtime results do not rewrite frozen Piper 1.4.2 evaluations. Keep strict
artifact/version checks and all buffer/cancellation/privacy thresholds.

## Milestones

1. Reproduce resolution and adapter incompatibilities; add regression coverage.
2. Refresh the exact graph, engine gate, source artifacts and generated package.
3. Validate deterministic checks and real bilingual host execution/playback.
4. Obtain independent change_reviewer approval for immutable exact identities.
5. Publish the reviewed commit and verify exact-head CI for maintainer handoff.

## Testing and benchmark strategy

All acceptance commands run in normal local Windows PowerShell outside the
sandbox. Use existing uv lock/sync, focused Piper/release tests, pnpm.cmd check,
test:browser, test:native-startup, inventory:release:check, audit:release and
package:piper-core tooling. Run both actual Piper service and WebView playback
arms with six speeds, pause/resume, navigation, cancellation, resource cleanup
and outbound firewall blocks. Compare phonemizer behavior on synthetic ES/EN
text where useful; do not claim a human listening score without one. Rebuild
the strict release artifact from the current exact payload and check resources
for obsolete package metadata before claiming runtime acceptance.

## Risks and rollback

eSpeak changes may alter pronunciation, duration and resource measurements.
Keep new evidence separate from historical measurements and report limitations.
Do not widen admission or timing assertions to accept a failure. The previous
Piper graph and package remain recoverable in main and Git history.

## Progress log

- 2026-10-09: created codex/prepare-pr-218, incorporated main and reproduced
  exclude-newer resolution failure (baseline-lock.log, exit 1). Existing main
  evidence Markdown whitespace was preserved; the merge resolution relative
  to main changes only the intended Piper requirement.
- 2026-10-09: reproduced the version-gate regression (2 failed, 3 passed),
  refreshed the single Piper lock entry and narrow release cutoff, and updated
  adapter admission, source/license authority and generated package evidence.
  The focused regression suite then passed all 41 tests.
- 2026-10-09: excluded unreachable new language helpers and the 21,312,753-byte
  Hebrew model from the runtime. Full upstream corresponding sources remain
  included. The offline package synthesized both voices in memory and passed
  its integrity/failure matrix; installed size is 304,989,506 bytes and the
  compressed core is 213,352,281 bytes.
- 2026-10-09: normal-host pnpm.cmd check, test:browser, test:native-startup,
  inventory:release:check, package:piper-core:check and audit:release passed.
  The exact core lock check and both real development-service arms passed.
  The strict release build produced an NSIS installer without installing or
  publishing it. All 2,022 installed payload hashes and the exact 2,023-file
  package set match the generated manifest.

## Discoveries and decisions

- Windows cp39-abi3 wheels support the existing Python 3.12 runtime. Piper's
  declared ONNX constraint includes 1.30; fresh real service execution passed.
- Current executable versions and historical profile IDs are distinct under
  ADR-0053; the Piper upgrade requires a separately documented overlay.
- Piper source revision 639388b6317fc4731e91d53da42aea68fd4166ff and its
  eSpeak-NG revision 724808c5a83f9ef95fdd0db886ba7ba537ff224a are bound by the
  new source manifest. Published PyPI provenance identifies the same Piper
  release commit/tag and Windows wheel digest. No other locked version changed.
- Twenty-four synthetic ES/EN cases produced identical phoneme hashes under
  old and new runtimes with network APIs denied. This bounded comparison is
  not a listening-quality score or proof of general pronunciation equivalence.
- Existing outbound firewall blocks cover both exact interpreter paths. Old
  target resources were quarantined before rebuilding to avoid stale metadata.

## Final validation results

Evidence is retained locally under tmp/pr-218. test-inputs-v1.json binds the
tested source and supporting paths to base af713cc2fe862f2f37f6c1ed1686d9b5a9185fe9
and setup HEAD ab3ebf7fc0a5b5d1ec91ad351d49d9b5560637fc. Later documentation-only
closure changes must be recorded separately from those tested inputs.

- pnpm.cmd check: exit 0; Shared 209, EPUB 651, desktop 587, Node 38,
  Rust default 87 and strict 88, Python 406; format, lint, types and builds pass.
- pnpm.cmd test:browser: exit 0, 7 passed.
- pnpm.cmd test:native-startup: exit 0; default binary, synthetic EPUB,
  synchronization, restoration, bounded protocol, cancellation and cleanup.
- uv run --project services/tts --locked pytest
  services/tts/tests/test_piper_adapter.py
  services/tts/tests/test_release_dependency_graphs.py
  services/tts/tests/test_release_core.py: exit 0, 41 passed.
- uv lock --project services/tts/release/core --check: exit 0.
- pnpm.cmd package:piper-core:write-manifest, package:piper-core:check,
  inventory:release:check and audit:release: each exit 0. Audit reports the
  existing Rust informational advisories and optional-engine blind spots;
  the Piper graph has no audit blind spots.
- pnpm.cmd --filter @voxleaf/desktop tauri build --config
  src-tauri/tauri.release.conf.json --features release-locked-runtime: exit 0.
- Both real development-service arms and packaged preflight/service arms:
  exit 0, with exact current Piper/ONNX admission and existing voice hashes.

- Both packaged native-startup-smoke.mjs --adaptive-tts-exact-host arms, with
  each exact --tts-profile/--tts-language pair and --exercise-playback-speeds:
  exit 0 on their first runs (playback-es.log and playback-en.log). Spanish:
  audible start 4,026 ms, cancellation 881 ms. English: audible start 4,642 ms,
  cancellation 558 ms. Both warm prepared RTF values were 0.09. All six rates,
  pause/resume, seek, chapter navigation, synchronized highlighting and cleanup
  passed. Both measured zero underruns, external requests, persisted audio
  files and retained audio units after cleanup. Final process inspection found
  neither exact core nor packaged interpreter retained.

Independent review PR218-v1: APPROVE, no actionable findings. The reviewer
verified the 170-path closed snapshot, upstream source differences, actual
voice configurations, package identities and all supplied host evidence.
The final manifest is tmp/pr-218/review-identities-v1d.json, SHA-256
51821F302C9D115AFC5FFB0E718444B1E35F04EFFE3972D6C14DF03E7F7F6153.
Source and Git identities matched before and after review. ADR-0054 is accepted.

This completed plan records local implementation and acceptance. Commit/push
and exact-head CI are the subsequent PR handoff, recorded on the existing PR.
The documentation-only closure is independently reviewed before that handoff.
No new human listening-quality score, installer lifecycle or cross-engine claim
is made. Upstream eSpeak contains real ES/EN pronunciation changes; the matching
synthetic fixtures do not establish general equivalence.
