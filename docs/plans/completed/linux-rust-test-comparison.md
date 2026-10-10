# Linux Rust test comparison and CI coverage

Created: 2026-10-10. Status: complete; local repaired comparison and CI patch independently accepted. No remote CI execution or Git publication.

## Goal

Establish Linux evidence for the native Rust test-layout refactor by comparing
the original HEAD with the accepted unstaged source under an identical minimal Linux compatibility repair. Add an Ubuntu Rust CI job
only if the comparison passes.

## User-visible outcome

The intended outcome is recorded execution evidence for the two existing
Unix-only symlink tests and, if accepted, automatic execution in future CI.
The repaired comparison supplies passing execution evidence and the Ubuntu Rust job is configured and reviewed. Remote execution remains pending. This does not introduce Linux
desktop distribution or model/hardware support claims.

## Current state

HEAD is `f06c80e04da2025342b1002a548f03ca17e7cc0b` on the existing
`codex/native-rust-test-layout` branch. The preceding campaign's 21 changed
Rust paths and documentation are pre-existing unstaged work and must remain
intact. Its final Windows evidence passed 87/88 tests. Both symlink tests were
already `cfg(unix)` before that refactor. At the start of this follow-up, Ubuntu CI only ran
`check:portable`; Windows ran the Rust scripts. The completed follow-up adds a separate Ubuntu Rust job.

Ubuntu 24.04.3 x86_64 is available in WSL2. Rust and Node were absent. Preparation
used isolated temporary toolchain/snapshot directories plus the official Tauri
Linux development packages in that existing distribution.

## Scope and non-goals

The user subsequently authorized repairing the two verified Linux blockers.
Extract the existing 256-pixel PNG payload from icon.ico to icons/icon.png and
rename only configure_supervised_child's parameter and its Windows use to
_command. Preserve the pre-existing refactor, all assertions, fixtures, ICO/SVG,
contracts, dependencies and Windows behavior. Capture the overlapping supervisor
file before editing and verify that only these two identifier occurrences change.
The subsequently discovered platform dead-code warnings are repaired by five
variant-level cfg_attr/expect annotations in host_profile_detection.rs; all
variants and test conditions remain intact, with unfulfilled expectations still
rejected by Clippy. The exact operation-start parent bytes are retained.

Compare fresh immutable snapshots: HEAD plus this compatibility patch versus
the accepted refactor plus the identical patch. Keep the original failed baseline
and historical receipts unchanged. Add one Ubuntu Rust CI job only after the
renewed comparison passes. Do not stage, commit, push, open a PR, change branches,
weaken warnings/tests or rewrite completed plans/evidence. Use the retained
validator for comparative acceptance and independent change review for the fix/CI.

## Relevant files and documentation

- `AGENTS.md`, `.agents/PLANS.md`, `docs/README.md`, product MVP and canonical
  architecture overview/diagram.
- `.github/workflows/foundation-checks.yml`, `package.json`, `.nvmrc`,
  `rust-toolchain.toml`, native Cargo manifests/build/config and source.
- [Previous completed plan](../completed/native-rust-test-layout.md) and
  [its final evidence](../evidence/native-rust-test-layout/NRTL-FINAL-01/report.md).
- [Testing](../../development/testing.md) and [setup](../../development/setup.md).
- [Official Tauri prerequisites](https://v2.tauri.app/start/prerequisites/#linux).

## Architecture and constraints

Runtime topology, private test/module boundaries, frozen authority, privacy,
local inference, transient audio, cancellation and bounded buffers remain
unchanged. The architecture diagram requires no topology update. Only the four
previously approved contract test namespace additions may differ between the
two collected Linux suites. Compare each feature configuration separately;
require both symlink tests to execute successfully, with no new ignored tests.

## Milestones

1. Capture identities and prepare full baseline/current snapshots. Complete.
2. Run the original comparative Linux gates. Complete: historical BASELINE-FAIL,
   independently recorded without claiming a refactor regression.
3. Repair the authorized baseline defects identically in both fresh arms and
   independently repeat comparison. Complete: LINUX-RUST-REPAIR-COMPARE-02 PASS.
4. Add the conditional Ubuntu Rust job and validate/review its exact patch.
   Complete: LINUX-RUST-REPAIR-CI-01 APPROVE; format, YAML preservation and Bash syntax checks pass. No remote workflow execution claimed.
5. Record final evidence, testing/setup navigation and archive this follow-up
   after CI review. Complete; no Git publication. Historical evidence links retain a navigation-only redirect at the former active path.
## Testing and benchmark strategy

Use the configured `pnpm format:check:rust`, `pnpm lint:rust` and
`pnpm test:rust` scripts with Rust 1.97.1, Node 24.18.0 and pnpm 11.15.1 in both
snapshots. The scripts cover default and `release-locked-runtime`. Record exact
exit statuses, test identities/results, tool versions and before/after hashes.
No Unix execution claim follows from Windows or portable checks. If the baseline
fails, preserve that evidence and do not silently repair unrelated Linux code.
For a CI addition, validate YAML/format and execute the proposed Rust commands
on Ubuntu; no remote workflow execution or PR is authorized.

## Risks and rollback

Package/toolchain setup or existing Linux compilation defects may block the
comparison. Keep those distinct from a refactor regression. Use separate local
snapshots and do not overwrite the original dirty worktree. Temporary builds
contain repository fixtures only, never personal books/models/audio. Revert
only this follow-up's documented edits if necessary; preserve prior work.

## Progress log

- 2026-10-10: User authorized comparative Linux validation and conditional CI,
  without staging, commits or PR. Confirmed existing WSL Ubuntu and official
  availability of pinned Rust. Began bounded toolchain/dependency preparation.

- 2026-10-10: Completed full-snapshot comparison in Ubuntu WSL using pinned
  Rust/Node/pnpm and frozen JavaScript installation. Both snapshots pass format,
  but default/release lint and test compilation exit 101 on the same missing
  PNG icon and Windows-only parameter-use issues. No Rust tests execute.
  Independent [LINUX-RUST-COMPARE-01](../evidence/linux-rust-test-comparison/LINUX-RUST-COMPARE-01.md)
  records BASELINE-FAIL with unchanged inputs/native sources and empty index.
  The incomplete first exploratory snapshot was excluded and replaced by all
  912 HEAD files plus the accepted current native overlay.
- 2026-10-10: Conditional CI addition not performed. Minimum next work is to
  supply the required Linux icon from the existing artwork and make
  `configure_supervised_child` compile cleanly on non-Windows, then establish
  fresh comparative evidence without weakening tests or suppressing warnings
  globally. These production/asset corrections are outside the validation-only
  scope and were not applied. Prior completed plans/evidence remain immutable.

- 2026-10-10: User explicitly requested repair. Captured the original working
  tree and verified all 26 source hashes against the previous comparison.
  Reproduced lint/test exit 101 on the unchanged Linux snapshot. Authorized
  scope is the exact ICO PNG extraction and two parameter identifier changes;
  existing failing checks provide the regression reproduction. Both comparison
  arms receive the same compatibility patch. No test-body edit is required.
  Fresh evidence belongs to LINUX-RUST-REPAIR reports, not the old receipt.
- 2026-10-10: The first repaired comparison executes all Linux tests successfully:
  85 default and 86 release-locked in both arms, including both Unix symlink
  tests. Clippy then exposes five pre-existing platform-only unconstructed enum
  variants. Auditor LINUX-RUST-REPAIR-02 authorizes five variant-level
  cfg_attr/expect(dead_code) annotations in host_profile_detection.rs: four only
  for non-Windows non-test builds and Malformed for non-Windows builds. Keep all
  enum values, matches, tests and -D warnings; unfulfilled expectations remain
  errors. This third repair path is added to the scope. Apply the identical
  annotations to both fresh snapshots and rerun all gates.
- 2026-10-10: The first Windows launch used an injected pnpm 11.25.0 fallback
  and stopped at the repository engine guard before running any checks. Use the
  existing pinned Node 24.18.0/Corepack pnpm 11.15.1 via process-local PATH for
  the authoritative retry; do not change global installations or package policy.

- 2026-10-10: LINUX-RUST-REPAIR-COMPARE-02 independently accepted the repaired
  comparison. Linux 85/86 tests pass in both snapshots, including both Unix
  symlink cases; Windows 87/88 tests and all Rust format/Clippy gates pass.
  The native smoke passed after replacing only the process-selected obsolete
  EdgeDriver150 with a Microsoft-signed temporary driver155 matching installed
  WebView2 155.0.4283.45. No browser/global-driver or source change was needed.
  All source identities stayed fixed; the initial driver failure is retained.
- 2026-10-10: PNG reproduction is lossless extraction from existing icon.ico:
  directory entry 5, offset 4554, length 4292 bytes, PNG 256x256 RGBA8; SHA256
  008b8ae27d726ce284bc2edd9217c927fb4254fcde8aa4f79ee1804b5b648db8.
  The retained derivation script verifies the ICO directory, PNG chunks and CRCs.
  Reviewed the canonical system diagram: no runtime/component topology changed.
- 2026-10-10: Added only ubuntu-native (Ubuntu Rust foundation), preserving the
  existing jobs, triggers, permissions and concurrency. The new job uses the
  same pinned tools/prerequisites and three passing Rust commands. Host
  format:check:typescript, structural YAML comparison and seven Bash syntax
  checks pass. Independent LINUX-RUST-REPAIR-CI-01 returns APPROVE with no
  findings, bound to 41 exact path identities and the unchanged HEAD.
- 2026-10-10: Saved immutable comparison/review receipts and source manifests,
  reconciled setup/testing/navigation, and archived this completed follow-up.
  Old comparison/campaign records remain byte-identical; a navigation-only
  redirect preserves historical links to the former active path. No staging,
  commits, branch change, push, PR or remote workflow dispatch.
## Discoveries and decisions

- Windows omits these two tests by design; previous omission is not proof they
  are broken or have never run elsewhere.
- Compare the pre-refactor HEAD first; accepted Windows reports cannot establish
  a Linux baseline. Preserve prior completed records as historical evidence.

## Final validation results

The original [BASELINE-FAIL](../evidence/linux-rust-test-comparison/LINUX-RUST-COMPARE-01.md)
remains immutable. It records unmodified HEAD and the initial layout failing
Linux compilation, without test execution. Later attempts do not rewrite it.

The repaired [comparison evidence](../evidence/linux-rust-test-repair/README.md)
and independent
[LINUX-RUST-REPAIR-COMPARE-02](../evidence/linux-rust-test-repair/LINUX-RUST-REPAIR-COMPARE-02.md)
record PASS for HEAD plus the compatibility repair versus layout plus the
identical repair. Format, default/release Clippy and default/release tests pass
on both Linux arms: 85/86 tests each, including both Unix symlink tests, zero
ignored/filtered tests and only the four approved namespace differences.
All 913/924 input identities, 41/43 includes and 40 immutable fixture occurrences
are verified. Windows format/Clippy and 87/88 Rust tests pass; the unchanged
native-startup command passes with the matching temporary driver.

The three implementation paths are the supervisor's two identifier edits,
five precise detector lint expectations and the existing-artwork PNG. All
pre-existing test-layout changes, tests, fixture bytes, frozen authority, locks,
ICO/SVG assets and prior campaign evidence remain preserved. Conditional CI
review is accepted by [LINUX-RUST-REPAIR-CI-01](../evidence/linux-rust-test-repair/LINUX-RUST-REPAIR-CI-01.md), with passing YAML/Bash/format checks. No remote CI run, Linux desktop/model support, staging,
commits, branch mutation, push or PR is claimed.
