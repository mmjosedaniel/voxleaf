# Services function readability: PR #253 CI repair

## Goal

Repair the bounded dependency and compilation failures exposed while validating
PR #253, without reopening the completed readability campaign.

## User-visible outcome

The optional Chatterbox archive remains verified, bounded and cancellable.
Production dependency auditing and inventory checking accept the current graph.

## Current state

The starting branch is `codex/services-function-readability`, HEAD
`d18c1ae86fa7834771023fa288decba94fb45557`, with a clean worktree and index.
The production audit rejects the yanked `zip 8.6.0` warning. Dependabot PR #244
updates it to `9.0.1`, but compilation rejects `entry.name().to_owned()` because
the name API now returns `Result`. Its generated component inventory is stale.
The Windows native-startup failure is under separate investigation; no cause or
repair is assumed here.

## Scope and non-goals

Update the exact ZIP pin and its required lockfile closure (`nix`, `cfg_aliases`),
map entry-name errors to existing verification failure, cover malformed names,
and regenerate the component inventory with its existing builder. Preserve audit
policy, other dependencies, frozen authorities, historical evidence, product
contracts, model environments and native runners. No package/model rebuild,
staging, commit, push or merge is part of this implementation work order.

## Relevant files and documentation

- `apps/desktop/src-tauri/Cargo.toml` and `Cargo.lock`.
- `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs` and its `tests.rs`.
- `services/tts/release/component-inventory-v1.json` (builder-owned).
- `docs/product/mvp.md`, architecture overview/system diagram, ADR-0042,
  ADR-0043, ADR-0052 and `docs/development/agentic-change-review.md`.
- `scripts/release_inventory.py`, `scripts/release-audit.mjs`, `package.json`.

## Architecture and constraints

No component, process, protocol, package source or inference boundary changes.
Archive names still pass the exact package-prefix and safe-relative-path gates;
byte limits, symlink rejection and cancellation remain authoritative. Synthetic
ZIP fixtures contain no book text. Review of the canonical system diagram finds
no topology change requiring an update.

## Milestones

1. Complete: update ZIP and adapt its fallible name API, retaining the existing
   verification contract.
2. Complete: focused archive regressions, Rust format/clippy, inventory
   regeneration/check and production release audit pass in host PowerShell.
3. Complete locally: independent implementation review and rebuilt-candidate
   native acceptance pass. Hosted CI remains a separate required PR gate.

## Testing and benchmark strategy

Use the configured Rust commands, narrowing cargo test to the existing
`tts_optional_chatterbox::tests` binary test group in default and
`release-locked-runtime` modes. Run `pnpm.cmd format:check:rust`,
`pnpm.cmd lint:rust`, `pnpm.cmd inventory:release`,
`pnpm.cmd inventory:release:check` and `pnpm.cmd audit:release` outside the
managed sandbox. No inference or performance claim changes. Store exact commands,
exits, logs and identities in a unique `SFR-PR253-CI-*` directory under
`tmp/evidence/services-function-readability/`.

## Risks and rollback

The major ZIP update can change malformed-archive behavior; retain existing
traversal, compression, corruption, size, symlink and cancellation coverage and
add a malformed-name regression. Revert only this patch and regenerate the
inventory to roll back; do not weaken audit policy to accept the old warning.

## Progress log

- 2026-10-16: Read project, bug-investigation and independent-review instructions;
  verified the clean starting identity and exact Dependabot patch. Implementation
  and host validation in progress.
- 2026-10-16: Initial 9.0.1 default and release-locked archive/lifecycle groups each pass all
  29 tests, including the added NUL-name case in the existing unsafe-name table.
  Rust formatting and generated inventory checking pass on the host. The old
  native binary passes the director's two-session diagnostic, which is baseline
  evidence only and does not explain the historical CI failure.
- 2026-10-16: Corrected the same dependency to non-yanked `zip 9.0.4` after the
  9.0.1 audit failure. Cargo changed only that version/checksum from the first
  candidate. Repeated the affected host gates; both 29-test groups, Rust
  formatting/clippy, inventory builder/check and complete release audit pass.
  Candidate native acceptance and exact-patch independent review remain pending.

## Discoveries and decisions

- `zip 9.0.1` requires only `nix 0.31.3` and `cfg_aliases 0.2.2` additions in
  this lockfile; unrelated dependency updates are excluded.
- The first 9.0.1 candidate's unchanged production audit failed: host `cargo audit` reported
  **`zip 9.0.1` is also yanked**, with zero vulnerabilities and a null advisory.
  The wrapper threw at `warning.advisory.id`. Policy and parser stayed
  unchanged; this registry evidence required the bounded dependency correction
  rather than acceptance of the failing 9.0.1 candidate.
- The coordinator checked the primary crates.io version record and upstream
  v9.0.4 release: 9.0.4 is not yanked, requires Rust 1.88 (below the project's
  pinned 1.97.1), and includes path-separator/empty-archive fixes. The bounded
  correction selects 9.0.4, retaining only the same two required lock additions.
  The original failure logs and 9.0.1 identities remain immutable.
- The default PATH selected pnpm 11.25.0 instead of the required 11.15.1. Initial
  inventory attempts stopped on that version mismatch (including in a builder
  subprocess). Task-local Corepack shims corrected it; subsequent checks use
  the existing pinned Corepack shims first in PATH.
- The initial `cargo test --lib` attempt exited 101 without running tests because
  the crate has only a binary target; the corrected focused command passed.

## Final validation results

Final candidate checks ran in normal local PowerShell outside the sandbox using
the existing Corepack shims first in PATH (pnpm 11.15.1). Logs and identities are
under `tmp/evidence/services-function-readability/SFR-PR253-CI-20261016-01/`.

| Command | Final candidate result |
| --- | --- |
| `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests` | Exit 0; 29 passed. |
| `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_optional_chatterbox::tests` | Exit 0; 29 passed. |
| `pnpm.cmd format:check:rust` | Exit 0. |
| `pnpm.cmd lint:rust` | Exit 0; default and release-locked all-target clippy. |
| `pnpm.cmd inventory:release` | Exit 0; regenerated using the existing builder. |
| `pnpm.cmd inventory:release:check` | Exit 0; current. |
| `pnpm.cmd audit:release` | Exit 0; Node, Rust and all three Python graphs pass. Rust retains seven informational warnings/five Windows-reachable, and optional Python retains its four documented blind spots. |

The director then ran `pnpm.cmd --filter @voxleaf/desktop tauri build` (exit 0)
and the existing `apps/desktop/scripts/native-startup-smoke.mjs` (exit 0), in
normal local PowerShell, on the new ZIP 9.0.4 executable. Both native sessions,
restart/restoration, synthetic service lifecycle, cancellation, privacy and
cleanup assertions passed. An in-memory diagnostic wrapper observed session
creation failures without changing the runner; no failure was recorded. Logs,
runner PID and executable/script hashes are retained in
`tmp/evidence/tts-adapter-layout/services-function-readability/SFR-PR253-NATIVE-CANDIDATE-01/`.

The historical GitHub WebDriver failure remains unexplained; this local pass
does not prove its cause or claim a WebDriver fix. No native runner was changed.
Independent review `SFR-PR253-CHANGE-REVIEW-01` (GPT-6 Astra high) approved the
implementation and host evidence with no findings. Its immutable report is
retained beside the worker report; the subsequent documentary closeout does not
renew that report's hashes. The added NUL-name case proves rejection and absence
of extraction, not coverage of the new ZIP name-decoding error branch.

This closes the bounded local dependency/API repair. Hosted CI is pending at
this historical closeout and must pass before the PR repair is declared complete;
its later results belong to [PR #253](https://github.com/mmjosedaniel/voxleaf/pull/253).
No fresh installer, model inference or public-release claim is made.
