# Chatterbox security dependency refresh

## Goal

Resolve the release-audit failure exposed by PR #226 with a bounded dependency
update and real Chatterbox package validation. Do not suppress advisories or
claim that a new lock automatically repairs the previously published runtime.

## User-visible outcome

Piper remains available. Chatterbox must retain local Spanish/English narration,
cancellation, bounded resources and memory-only audio with corrected dependencies.
Qwen3 remains deferred under ADR-0051.

## Current state

Base/starting HEAD: `30fd57b91817817dba62d81ee6494bf3f46d8464`, branch
`codex/modularize-settings-and-chatterbox`, PR #226. The refactor is independently
accepted and committed. Both Ubuntu and Windows foundation CI passed. Release
audit fails on both this PR and preceding main `c140d0f`.

The initial worktree was clean. Diagnosis produced task-owned draft edits only
in `services/tts/release/audit-policy.json` and `docs/development/dependencies.md`.
The inventory was regenerated after restoring the last full passing audit date;
it is unchanged. Preserve these edits and all earlier completed-plan evidence.

On 2026-10-06 the user explicitly authorized preparing and executing a bounded
dependency/package update plan after being told the original refactor excluded
dependency and authority changes. This supersedes that exclusion for this plan.

## Scope and non-goals

First freeze candidate evaluation to ignored task-owned files under
`tmp/chatterbox-security-refresh/`, the two diagnostic documentation/policy
edits above, this plan and its index entries. Evaluate only Transformers and
urllib3 initially; retain other exact dependencies, model weights, profile and
language identities. PyPI withdrew Transformers 5.10.0, so evaluate non-yanked
5.17.0 with urllib3 2.8.0, subject to audit and compatibility evidence. The
initial 5.10.4 candidate was rejected after inspecting its unchanged vulnerable
custom-generation download order, despite a zero-finding registry audit.
Transformers 5.17.0 explicitly requires tokenizers >=0.23.1,<0.24.0, so the
candidate also updates tokenizers from 0.22.2 to 0.23.1. No other pin changes.

Freeze a concrete production/package allowlist only after candidate feasibility
and inspection of existing version coupling. New release identities must be
additive; do not overwrite published v2 assets or silently rewrite historical
receipts. Do not alter the installed user's package during candidate evaluation.
No Qwen runtime work, coordinator refactor, advisory suppression, automatic
failover, remote code loading or model replacement is included.

## Relevant files and documentation

- `scripts/release-audit.mjs`, `scripts/release_inventory.py`, root package scripts.
- `services/tts/release/audit-policy.json`, component inventory and licence evidence.
- `services/tts/release/profiles/chatterbox/requirements.in` and generated lock.
- `services/tts/src/voxleaf_tts/release_chatterbox.py`, Chatterbox adapter/service.
- Existing release dependency, package and adapter tests.
- Native optional-package manager and runtime supervisor as integration context.
- Chatterbox acquisition authority v2, ADR-0046, ADR-0050 and ADR-0051.
- `docs/development/dependencies.md`, testing, security/distribution and independent
  change-review workflow; canonical architecture/system diagram.

## Architecture and constraints

### Frozen successor-build preparation unit

The first production unit adds an explicitly selected v3 builder; it does not
switch the native admission authority or the production audit graph yet. Allowed
paths are `services/tts/src/voxleaf_tts/release_chatterbox.py`, its existing
`services/tts/tests/test_release_chatterbox.py`, the new
`scripts/test-chatterbox-dependency-security.py`, new
`services/tts/release/profiles/chatterbox-v3/requirements.in` and generated lock,
new `services/tts/release/optional/chatterbox/source-manifest-v3.json`, and root
`package.json` for explicit successor commands. Plan/index documentation and the
two existing diagnostic drafts remain director-owned. No historical v2 source,
lock, acquisition manifest or evidence may change. The generated successor
source manifest must derive unchanged model/Python/provenance fields and the
measured new lock identity; include the two existing generated runtime modules.

An independently baselined extension adds only
`services/tts/release/optional/chatterbox/licenses/tokenizers-0.23.1-LICENSE.txt`.
Both old and new Tokenizers wheels omit their licence text. The successor alone
includes the exact upstream v0.23.1 root LICENSE from commit
`7f1623b90b5adfb9bc327d4c3468d2f70bbce262` (Git blob
`261eeb9e9f8b2b4b0d119366dda99c6fd7d35c64`, 11,357 bytes, SHA-256
`c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4`).
No upstream NOTICE file exists in that commit's recursive tree. The Apache
licence expression is unchanged; this closes a pre-existing notice omission.

Require a host baseline before implementation, then Python checks and actual
embedded-runtime security/inference evidence. The clean successor uses package
version 3 with manifest schema 2 and no historical runtime correction. Publishing
reviewed new release assets and switching native authority are a later explicit
unit, after this package has concrete identities and independent review.

The published v2 package freezes its lock, executable tree, archive parts and
installed manifest. The current builder rejects lock drift and hardcodes v2.
Updating two pins alone cannot update `cb/2` or reuse prior package evidence.
Any necessary successor package must retain exact hash admission, explicit
activation, local inference, stop-before-removal, bounded staging and rollback.
Generated inventory/locks/manifests must use their generators. Never mark an
incomplete audit as the latest clean result. Publishing assets or promotion needs
a concrete reviewed artifact and applicable release authorization.

## Milestones

1. **Diagnose and freeze candidate scope — complete.** Reproduce failure, verify
   withdrawn Rust notices, identify optional Python findings and inspect coupling.
2. **Candidate graph and bilingual feasibility — complete.** Generated an
   isolated exact lock, audit it, install an isolated environment, verify compatible
   imports/safe loading and run bounded offline Spanish/English inference.
3. **Versioned package integration — in progress.** The additive v3 builder,
   exact lock, source and licence are implemented; its first build and embedded
   bilingual/security probes pass. Reproducible assembly and independent
   preparation review precede publication/native admission and the applicable
   acquisition/lifecycle checks. Record the release boundary explicitly.
4. **Independent review and PR handoff — pending.** Run relevant host checks,
   obtain change_reviewer approval for exact identities, commit/push the accepted
   patch under explicit Git orders, and inspect CI. Never call a failed gate green.

## Testing and benchmark strategy

All checks run in local PowerShell outside sandbox. Use existing commands:
`pnpm.cmd audit:release`, `pnpm.cmd inventory:release:check`,
`pnpm.cmd test:python`, Chatterbox source/acquisition/build commands and applicable
existing package/host scripts after their input surface is verified. Candidate
lock generation uses the existing documented `uv pip compile` process with
Windows/Python 3.12, exact pins, no dependency expansion and generated hashes.
Candidate-specific commands and final gates will be recorded before execution.
Add only meaningful regression coverage; existing dependency assertions remain.

## Risks and rollback

Transformers APIs can affect Chatterbox model loading/generation even if advisory
audit passes. A new dependency tree invalidates old runtime hashes, sizes and
performance evidence. Use isolated environments and existing verified model data;
do not modify live installations or replace release assets. Retain rejected
candidate evidence. Remove only task-owned temporary outputs after path checks.

## Progress log

- 2026-10-06: CI PR run 37560176447 and main run 37528162391 fail the same Rust
  informational-policy comparison. Host `pnpm.cmd audit:release` reproduced exit 1.
- RustSec database `ef6173cbc5c50ec8166f9a5b28f07834144373ee` records withdrawal
  of RUSTSEC-2024-0411 through 0420 on 2026-08-14. Actual Rust audit: exit 0,
  zero vulnerabilities, seven notices, five Windows reachable. Draft policy
  removes only ten withdrawn non-Windows notices; scanner logic is unchanged.
- Full audit then passes Node, Rust, base Python and Piper core, but fails
  Chatterbox: Transformers 5.5.0 has PYSEC-2026-3929/4174; urllib3 2.7.0 has
  PYSEC-2026-4175/4176/4177. The four existing advisory blind spots remain explicit.
- `pnpm.cmd test:python`: 386 passed before and after policy draft; nonfatal
  pytest cache warning. Inventory generator/check and `git diff --check` pass.
- User authorized this expanded plan. Existing auditor is inspecting builder
  and model-validation interfaces read-only; director remains sole writer.
- Candidate 5.10.4/2.8.0: the full 79-package audit reported zero findings and the
  same four blind spots. Source inspection still found download-before-consent
  in `load_custom_generate`; reject this candidate. Upstream commit
  `cbc1651a032b923da7f4b44b3d0e6f68e6ba6b55` fixes that order. GitHub's comparison
  proves tag v5.17.0 contains it (ahead 8, behind 0); evaluate that version next.
- Candidate staging hit Windows' 260-character path boundary, confirmed by a
  diagnostic copy failure. Moved only task-owned candidate data to a verified
  short OS-temp directory; the ignored local pointer records its private path.
  Stopped the rejected candidate's two identified builder processes. Production
  source/manifests, installed runtime and models remain untouched.
- Candidate security probe: seven real-library cases pass for Transformers
  5.17.0, including forward/backslash/absolute template traversal rejection,
  legitimate template saving, remote and local untrusted generation rejection
  before fetch/import, and an explicitly trusted control. The first probe's
  legitimate-output path used an incorrect directory name; corrected it to the
  library's CHAT_TEMPLATE_DIR constant and reran, exit 0. No production edit.
- Full candidate 5.17.0/0.23.1/2.8.0 audit: exit 0, 79 packages, zero known
  findings and the same four explicit URL-package blind spots. The original
  5.5.0 environment fails the template probe with
  `unsafe-template-name-accepted`, confirming the pre-change defect.
- Isolated environment Spanish/English inference and cancellation both pass:
  4.0/3.6 seconds of nonempty finite PCM, cancellation 344/282 ms, zero socket
  attempts and no audio files written. This is not packaged UI acceptance.
- Private feasibility package build passed full tree verification, archive and
  bounded splitting: 13,083 files, 5,027,414,148 installed runtime bytes,
  5,030,969,804 archive bytes. These are candidate measurements, not published
  v2 identities or final successor measurements. Its embedded Python passed all
  seven security cases without PYTHONPATH. Bilingual embedded probes follow.
- Both private feasibility embedded probes passed: Spanish 35.891 seconds
  load/warm, 3.96 seconds PCM, cancellation 375 ms; English 21.406 seconds
  load/warm, 3.64 seconds PCM, cancellation 296 ms. Socket attempts were zero.
  The helper never saves PCM; this is direct adapter evidence, not an OS-wide
  filesystem/network observation or an ordinary installed-application journey.
- Independent baselines `CHATTERBOX-V3-BASELINE-01-20261006` and
  `CHATTERBOX-V3-BASELINE-ADDENDUM-01-20261006` passed before their respective
  edits. See [baseline reports](../evidence/chatterbox-security-refresh/baseline.md).
- The sole successor worker implemented the eight-path preparation unit.
  Host Python tests: 399 passed (13 added, all 18 historical builder tests
  retained); Ruff, mypy (159 files), Python format, scoped Prettier, standalone
  probe format/lint, v2 source/acquisition checks and v3 source checks passed.
  Existing production graph and native admission remain v2. Final v3 build
  uses normal `uv pip sync --require-hashes`, not a stale no-sync environment.
- Final successor build 1 passed: archive 5,030,981,677 bytes, runtime
  5,027,425,801 bytes, 13,084 files, three bounded parts. Its embedded Python
  passed seven security probes and both synthetic language arms; cancellation
  took 406 ms (Spanish) and 359 ms (English). Complete post-inference tree
  verification passed. Seventeen source/build inputs match the repository by
  SHA-256. Exact commands, identities and limitations are in
  [host validation](../evidence/chatterbox-security-refresh/host-validation.md).
- Successor build 2 (fresh staging, same hash-synchronized environment) exited
  0 and reproduced every build-1 archive/manifest/part hash and measurement.
  Preparation acceptance is governed by the independent
  [change review](../evidence/chatterbox-security-refresh/change-review-01.md).
  Publication, native admission and ordinary acquisition remain separate gates.

## Discoveries and decisions

- RustSec drift is not a refactor regression. Withdrawn GTK notices must not be
  retained as active expected warnings; new/unrecognized findings still fail.
- Python failures were hidden by the earlier fail-fast Rust check. They cannot
  be accepted by ignoring IDs or downgrading the audit gate.
- Transformers 5.10.0 is yanked. A non-yanked candidate and successful real
  inference are required; an advisory's minimum fix is not sufficient validation.
- One Transformers advisory currently lists no patched release despite bounding
  affected versions. Confirm the candidate with the live auditor and source
  evidence; do not infer remediation solely from an empty findings list.
- Native successor transition must keep `cb/2` and historical profile `/2` as
  cleanup-only roots, never migration or execution fallbacks for `cb/3`. The
  auditor verified that the existing `failed` snapshot already exposes Remove
  without a frontend or wire-contract change. If only retained v2 data exists,
  use the existing `tts-optional-profile-unavailable` failure with unknown
  installed bytes, not v3's footprint or an unsupported corruption claim.
  Valid v3 alone determines discovery. Explicit removal owns exactly the active
  and retained roots, with the existing busy, containment and shutdown guards.
  A withheld successor must not prevent removal of retained data. Preserve v2
  bytes on observation, cancellation and failed acquisition. These are next-unit
  requirements; no native implementation has changed yet.

## Final validation results

In progress. The original refactor remains accepted, but release security CI is
not green. No dependency candidate or successor runtime has been accepted yet.
No new commit, push, release publication or PR merge has occurred in this plan.
