# Chatterbox certifi and Pillow security refresh

Created: 2026-10-20. Status: candidate preparation validated; independent
preparation review, authorized publication and production integration pending.

Cleanup checkpoint confirmed on the ordinary host at 2026-10-20T22:45:49Z:
the fresh synchronized v5 build completed with exit 0 at 22:44:14Z.
Its archive SHA-256 is
`ed198de45e0cf105ff9822f560188f8f019a3f414c2c633e517be6ec2a5f8b15`;
it differs from the earlier probed candidate, so repeat runtime probes on this
exact package before acceptance. The earlier ES/EN and security probes passed,
but their final check-local stalled in Corepack and was cancelled; no package
integrity pass is claimed. All owned work processes ended, the remaining idle
console was closed, V/W aliases were removed, and the Git index is empty.
Source edits remain saved and uncommitted; user data was not modified.
Persistent `artifacts/resume-20261020.md` and
`artifacts/safe-pause-20261020.md` contain continuity and the final receipt.

## Goal

Resolve PR #266's production dependency audit failure by replacing vulnerable
certifi and Pillow in a verified, additive Chatterbox runtime package. A changed
lock alone is not installed remediation. Keep the eight accepted reader fixes
and their completed plan intact.

## User-visible outcome

Compatible hosts can acquire and execute a corrected local Chatterbox package
in Spanish and English. Piper, stable locations, bounded queues, cancellation,
memory-only audio and user data retain their current behavior. Older vulnerable
packages remain removable but cannot silently satisfy corrected admission.

## Current state

Branch `codex/reader-narration-acquisition-bugfixes`, starting HEAD
`0d97b4e36fc32b3e12abd93406d0be298f8409e6`, PR #266 against `main`.
The initial worktree and index are clean. B01–B08 have independent R6 approval.
Both Ubuntu CI foundations pass; Windows foundation was running at diagnosis.

GitHub audit run 39504014194 and ordinary Windows `pnpm run audit:release`
both fail the production optional Chatterbox graph. Node, Rust, base Python
and Piper pass. Current pins are certifi 2026.7.22 and Pillow 12.3.0.
The initial certifi upstream advisory GHSA-6q48-6c7w-9gw2 identified 2026.10.18
as patched; the live audit subsequently requires 2026.10.19 (see progress).
Eight Pillow advisories identify 13.0.0: CVE-2026-112895,
CVE-2026-112400, CVE-2026-112397, CVE-2026-112896, CVE-2026-112897,
CVE-2026-112395, CVE-2026-112404 and CVE-2026-112899. Non-yanked compatible
Windows/Python 3.12 wheels exist. Compatibility remains to be validated.

The approved scope exception supersedes the earlier dependency-upgrade
exclusion only for certifi and Pillow. Existing
commit/push/PR authorization applies to reviewed updates of PR #266; no merge,
overwrite of published artifacts or new public installer is authorized.

## Scope and non-goals

Only certifi and Pillow pins may change. Retain the other 77 package versions,
Torch/CUDA, official model bytes/revision, profiles, languages and protocol.
Keep published v2/v3 locks, source/runtime/acquisition authority and receipts
immutable. Existing v4 is an unpublished, unadmitted current-source build;
do not repurpose it or silently overwrite its evidence. Select a distinct
successor identity after the boundary investigation (v5 is the candidate).

One primary agent writes source. The skill-required investigator and bypass
reviewer are read-only; the repository's independent change_reviewer supplies
acceptance. No Qwen inference, broad dependency refresh, advisory suppression,
capacity increases, model replacement or unrelated refactoring.

## Relevant files and documentation

- `services/tts/release/profiles/chatterbox-v3/requirements.{in,lock}` (read-only baseline), new successor profile and generated lock.
- `services/tts/src/voxleaf_tts/packaging/chatterbox_{integrity,authority,sources}.py`, `release_chatterbox.py`, additive successor helpers as justified.
- `services/tts/tests/test_release_chatterbox*.py`, `test_release_dependency_graphs.py`, existing security probe and relevant release tests.
- `services/tts/release/optional/chatterbox/`, native `tts_optional_chatterbox.rs` and its tests, release Tauri/NSIS configuration.
- `scripts/release-audit.mjs`, `scripts/release_inventory.py`, generated component/license inventory and audit policy.
- Ordinary installed host and Windows release scripts/tests; settings size disclosures; package scripts and Dependabot selectors.
- ADR-0052, dependency/testing/release documentation, canonical system diagram, this plan and indexes. Freeze exact integration paths before edits.

## Architecture and constraints

The fix is at the shipped-runtime dependency and native-admission boundary.
Pillow vulnerable presence is confirmed by the locked graph; individual image
sink reachability must be distinguished from demonstrated exploitability.
Certifi's root store can affect Python TLS callers; native package acquisition
uses its existing Rust HTTPS boundary. Preserve fail-closed complete hashes,
exact origins, commit/package identities, bounded staging and explicit consent.

Build and probe in an isolated temporary environment, never mutate the user's
installed interpreter. Keep old data intact through an independently verified
backup/restore path during installed gates. Follow the Codex Security artifact
storage policy for plugin evidence; repository plans/source remain normal files.
Generated locks/manifests/inventory must come from their existing or explicitly
added generators. Published package assets require a concrete reviewed artifact
and explicit publication authorization before uploading.

## Milestones

1. **Diagnosis and scope — complete.** Reproduce audit, establish exact pins,
   investigate security/compatibility boundary independently, and freeze successor
   identity plus allowlists. Preserve failure evidence and upstream references.
2. **Candidate graph and local package — complete.** Add two-pin successor
   graph, generated hashes, focused dependency regressions and additive builder.
   Audit the exact candidate; validate imports, security repairs, offline ES/EN,
   runtime integrity and existing package compatibility. Preserve v3/v4 bytes.
3. **Reviewed publication preparation — in progress.** Freeze source/artifact
   identities, measured sizes/digests and local evidence; review the patch and
   concrete publication manifest. Publish only after applicable authorization.
4. **Production integration and installed acceptance — not started.** Generate
   acquisition authority from publication readback, admit only the successor,
   retain old versions as cleanup-only, update audit/inventory/disclosures.
   Run ordinary installed B06/B07, ES/EN, lifecycle and restoration gates.
5. **Independent review and PR update — not started.** Complete required checks,
   skill bypass/regression review and exact-patch change review; commit/push the
   authorized update, confirm fresh CI and close this plan only after acceptance.

## Testing and benchmark strategy

Every test/build/audit/validation executes in ordinary Windows PowerShell outside
the sandbox; assert Windows package identity 15700. Record exact commands,
inputs, environment, outputs, exits and restoration. Run fast checks before
expensive builds. Existing commands inspected at plan creation:

| Gate | Command / boundary | Timing |
| --- | --- | --- |
| Baseline live advisories | `pnpm run audit:release` | Before edits; failed as above |
| Python quality and regression | `pnpm run format:check:python`, `lint:python`, `typecheck:python`, `test:python`, `build:python` | After affected edits |
| Frozen compatibility | `pnpm run package:chatterbox-optional:v3:check-source`, `package:chatterbox-optional:v3:check-acquisition`, v4 source/local checks where inputs exist | Before accepting successor builder |
| Successor graph/build/security | Add explicit versioned commands after inspecting existing CLI; use documented `uv pip compile` with no dependency expansion | Candidate preparation |
| Production dependencies | `pnpm run audit:release`, `inventory:release:check` | After corrected production admission |
| Repository | `pnpm run check` | Final runtime candidate |
| Browser/native/audio | `pnpm run test:browser`, `test:native-startup`, `test:tts:reader-corrections-host` | Integrated runtime; four ES/EN arms, no Qwen |
| Installed | `pnpm run package:windows:verified-core`, `package:windows:check`, `package:windows:reader-corrections` with explicit receipt | Exact rebuilt installed candidate |
| Closeout | `pnpm run check:evidence`, `git diff --check`, exact identity review | Final documents |

New successor commands and security probes must be recorded before execution.
Tests must demonstrate the unsafe pins fail and corrected pins satisfy the
boundary while v2/v3/v4 historical generators stay unchanged. Real-library
probes supplement, not replace, the dependency audit. Preserve bounds, all
barriers and deadlines. Reuse results only with a complete input identity proof.

## Risks and rollback

Pillow is a major-version update: import/API and model execution compatibility
must be measured. A clean audit does not prove every vulnerability unreachable
or every caller compatible. Do not weaken checks to bypass installation or CI.
Failures retain original receipts and require a bounded, evidence-backed retry.
No automatic repair or execution of old installed packages. Temporary firewall
rules, helper processes, registry/shortcuts and data backups must be restored.
Preserve the current accepted commit; never reset/stash/clean unrelated work.

## Progress log

- 2026-10-20: the bounded two-dependency update was approved. Read primary
  advisories and PyPI wheel metadata. Ordinary-host baseline audit failed with
  the same affected pins as CI; source/lock/audit policy unchanged from main.
- The `codex-security:fix-finding` skill is active. The fresh read-only
  security-boundary investigator completed its trace; primary remains sole writer.
- Selected v5 with the frozen v3 runtime sources and unchanged model authority.
  Added isolated layout, generated source recipe and five regression tests.
  Baseline rejected v5 as unsupported (586 existing tests passed); the installed
  v3 runtime failed the new unsafe-certifi-version probe without being modified.
- First candidate audit rejected certifi 2026.10.18 under updated
  PYSEC-2026-4320. The advisory feed now requires 2026.10.19, which restores
  unaffected roots while excluding emSign ECC Root CA - G3. Regenerated only
  the v5 lock/source recipe; preserved the original failed audit receipt.
- Ordinary-host refresh-v5, 2026-10-20 22:15:09–22:15:42 UTC, identity 15700:
  format, lint, mypy, 591 Python tests, source check and candidate audit passed.
  Audit reports no known vulnerabilities in indexed packages; the same four
  direct-URL packages remain explicit audit blind spots. This is candidate
  evidence, not production admission or installed remediation.
- Added and executed versioned v5 lock/write-source/check-source commands,
  audit:chatterbox:v5; package:chatterbox-optional:v5 and its check-local command
  prepare/verify the unpublished artifact. test:chatterbox:runtime-security
  exercises the certificate store plus malformed/legitimate Pillow inputs.
- Windows long paths are disabled on this host. Both ordinary and extended
  temporary paths failed uv's wheel installation before packaging. Added an
  explicit absolute --output-root for build/check-local, with separate vN
  children and unchanged defaults; source-authority commands reject the option.
  The isolated build uses a temporary V: alias to the managed test workspace,
  removed by its launcher on exit. No registry setting was changed.
- Ordinary-host fast-output, 22:20:14–22:20:46 UTC, identity 15700: Python
  formatting/lint/types, 593 tests and v3/v4/v5 authority checks passed. Models
  were copied into the isolated workspace after exact size/SHA-256 checks;
  originals were only read. The two runtime probe commands use -I -B.
- The first alias-based build rejected mixed Windows canonical-path prefixes
  under its existing containment check. Use the uniform extended alias syntax
  --output-root //?/V:/build for build and check-local; backslash-form arguments
  were escaped again by pnpm and rejected. No containment check was weakened.
- Ordinary-host check:portable passed at 22:25:12–22:27:26 UTC. The isolated
  certifi/Pillow library probe passed three security cases and two legitimate
  controls. Packaged-runtime probes, publication and installed gates remain
  pending; these results do not constitute complete remediation.
- GitHub confirms foundation run 39504014207 succeeded, including Windows;
  release dependency audit run 39504014194 remains the failing PR check.
- Reviewed the canonical system diagram: candidate preparation changes no
  running component, inference flow or persistence boundary. Its current v3
  admission statement remains accurate until production integration.
- The fresh skill-required bypass reviewer found that inherited --no-sync
  could label a stale vulnerable environment as v5. Two bounded regression
  cases reproduced the missing rejection through CLI and Python API before
  any source lookup or output mutation. V5 now requires synchronization; v2–v4
  retain their historical options. The prior no-sync build and candidate-prep-r1
  snapshot are superseded preparation evidence, not an accepted publication.
- Validation paused with the fresh synchronized build and runtime probes
  already running. No further validation,
  publication, commit or integration work will start before resumption. Source
  changes are saved in the working tree. The active jobs must finish and their
  owned processes/temporary drive aliases must be gone before restart clearance.
- User resumed the task. Ordinary-host prep-resumed-gates passed on
  2026-10-20 at 22:50:46–22:53:07 UTC (identity 15700): check:portable,
  v3 source/acquisition, v4 source, v5 source and candidate advisory audit.
  Results include 595 Python tests, 209 shared tests, 672 EPUB tests,
  786 desktop tests, 81 desktop script tests and 13 evidence tests.
  No indexed vulnerability or new advisory exception was reported.
- Both real-library security probes and fresh-package ES/EN passed, but the
  combined probe-resumed job failed its final local-integrity check. Diagnosis
  with full Windows paths proved zero missing/modified manifest entries and
  the unchanged archive hash; 46 extra Numba .nbc/.nbi cache files caused the
  rejection. The probe launcher had omitted NUMBA_CACHE_DIR, which the native
  supervisor already sets outside the runtime. The smoke probe now requires
  that cache setting. Repeat after bounded cleanup of only those 46 files;
  no user runtime or installed data is modified. The first retry helper failed
  PowerShell parsing before execution; preserve that failed result separately.
- Ordinary-host probe-v5-isolated-cache-b passed at 22:56:28–22:59:55 UTC,
  identity 15700. Both security probes, ES/EN and the complete v5 check-local
  passed on archive `ed198de45e0cf105ff9822f560188f8f019a3f414c2c633e517be6ec2a5f8b15`.
  Spanish produced 4.12 seconds of bounded PCM, English 3.84 seconds;
  cancellation took 344/328 ms, with zero network attempts or audio writes.
  The final check compared all runtime files, archive members and split parts
  with the generated receipt; V: was removed on exit. The publication proposal
  identifies exactly three assets totaling 5,031,103,825 bytes, preserving
  historical assets and excluding installers and models. Publication and
  desktop admission remain pending.

## Discoveries and decisions

- Prior local B01–B08 approval does not make the current live release audit pass.
- V3 lock changes alone would falsify installed remediation. V4 already exists
  for an independent local-only build and is not a free production identity.
- The shipped v3 adapter/runtime sources are frozen historical blobs. Avoid
  pulling current runtime refactors into this dependency-only update.
- Published assets and historical authorities remain immutable. Any successor
  adoption must include old-root cleanup tests, accurate bytes and fresh readback.

## Final validation results

Overall remediation is not complete. Baseline `pnpm run audit:release`: exit 1,
ordinary host identity 15700, 2026-10-20 22:00:37–22:01:08 UTC. Candidate portable
checks, 595 Python regressions, v3/v4 compatibility, v5 source authority,
candidate audit, real-library security probes, ES/EN and final full package
integrity now pass. Persistent Codex Security artifacts retain exact logs,
input hashes and host metadata under their job names above. No publication,
installed acceptance or independent preparation approval is claimed yet.
