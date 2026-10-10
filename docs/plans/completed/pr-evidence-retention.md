# PR evidence retention cleanup

Status: technical implementation and independent acceptance complete on 2026-10-10. Git publication remains a separate pending director handoff.

## Goal

Reduce PR #229 to reviewable code, documentation and essential acceptance
records while preserving the original evidence outside Git. Prevent raw logs
and temporary validation captures from being added again.

## User-visible outcome

The prepared patch has a much smaller evidence diff and a documented distinction between
versioned acceptance summaries and local/CI execution artifacts. Product
behavior is unchanged. No cleanup commit or PR publication has occurred at technical closeout.

## Current state

Branch `codex/native-rust-test-layout`, starting HEAD
`5401f899e3ffabfc8f3e79873bc0b5fa45b11155`, initially clean. The PR adds 276
evidence files and 83,001 evidence lines. The three new evidence collections
contain 47 logs and 155 `.json.txt` captures. Main's 60 earlier evidence files
are outside this cleanup. Existing Rust/fixture assertions remain approved.

## Scope and non-goals

Archive the three new evidence collections, remove redundant raw material from
the tracked tree, retain essential reports and source identities, repair their
navigation, and add an evidence retention policy, ignore rules and a tested
repository guard. Update this PR with one normal follow-up commit/push. Do not
change Rust, application/service/package behavior, dependencies, old campaign
evidence, or merge/rewrite history. User approval of the suggested cleanup
authorizes retiring current-PR evidence paths after byte-preserving archival;
this is not permission to rewrite historical test outcomes.

## Relevant files and documentation

The three `docs/plans/evidence/{native-rust-test-layout,linux-rust-test-comparison,linux-rust-test-repair}`
collections, their two completed plans and evidence links, `.gitignore`,
`package.json`, repository scripts, testing and contributor documentation.
The accepted audit and frozen work order allow exactly 239 paths: 224 retirements and 15 editable paths. See the [retention policy](../../development/evidence-retention.md); the two original completed plans remain immutable.

## Architecture and constraints

No product component, process, runtime data flow, public contract, privacy,
cancellation, audio persistence or bounded-resource ownership changes. The
canonical system diagram remains appropriate. Preserve original report bytes
in the external archive; make later archive navigation explicit. No new
production or development dependencies. Restrict the artifact guard so valid
fixtures and older curated evidence are not rejected.

## Milestones

1. Inventory, archive and audit; establish a fresh baseline. Archive verified,
   audit accepted and EVIDENCE-RETENTION-BASELINE-01 passed before edits.
2. Remove raw captures, maintain useful evidence navigation, and implement the
   retention guard with regression cases. Complete; all four independent host gates passed.
3. Validate exact changes and archive recovery, close documentation and archive
   the technical plan. Complete. A separate director Git Action Order must
   stage, commit and normally push the same branch; publication is pending.

## Testing and benchmark strategy

Use local PowerShell outside the sandbox. Baseline format/lint checks and
identity capture precede edits. After edits run the same checks, the new guard
and its meaningful positive/negative tests, verify ignored patterns, changed
Markdown links and archive hashes, and compare all untouched source/fixture
identities. Do not repeat unaffected Rust/native suites. Review package-script
CI integration and the exact final diff independently. Acceptance records stay
in ignored scratch rather than recreating a large tracked evidence bundle.

## Risks and rollback

The external archive must exist and every entry must match before removal.
Report navigation must not imply that an archived raw file remains present in
the current checkout. A cleanup commit removes files from the PR's final diff;
the prior branch commit still contains them. Squash merging may keep the final
main history compact; merge itself is outside this task. Recovery uses the
verified external archive and manifest, without overwriting unrelated work.

## Progress log

- 2026-10-10: User authorized the proposed cleanup and update of PR #229.
- 2026-10-10: Archived all 276 original files (5,416,967 bytes) and verified every
  entry. Local archive: `Documents/Codex/artifacts/voxleaf/pr-229-evidence-5401f899/original-evidence.zip`.
  SHA256: `80f9b59a9d38730f1046b01a5dac3cb5e8f3f0a599807759242a51a95ecc30fc`.
  The adjacent `manifest.json` records each original path, byte size and SHA256.

- 2026-10-10: Accepted audit and independent EVIDENCE-RETENTION-BASELINE-01:
  pinned host TypeScript format/lint passed; source identities and index stayed
  unchanged. Archive and all 276 entry hashes were rechecked before deletion.
- 2026-10-10: Removed exactly 224 literal raw-capture files from the three new
  collections. Retained 50 Markdown files (47 immutable receipts and three
  updated indexes) and two unchanged identity manifests. Original failed Linux
  baseline and successful repair remain distinct historical outcomes.
- 2026-10-10: Implemented the four-exception Git-index guard, isolated Node
  regression tests, scoped ignores and policy/navigation links. Both new
  commands begin existing aggregate CI commands; workflow YAML is unchanged.
  At that implementation checkpoint, independent post-change acceptance, plan archival and Git handoff were pending.

- 2026-10-10: Independent post-change validation passed the four pinned host
  commands below and all 13 guard tests, with no skips. Exact 239-path identities
  stayed stable during execution; the index stayed empty. Archive recovery,
  immutable/older/protected inputs, ignores and navigation passed review.
- 2026-10-10: Completed the technical milestones and archived this plan after
  acceptance. Final edits only clarify repository-access and historical CI
  wording and update plan navigation. The director must recheck final document
  identities/links before the separate Git handoff. No cleanup commit, push or
  PR publication has occurred at this technical closeout.

## Discoveries and decisions

- Existing `*.log` ignores do not match `.log.txt`; renaming machine output
  also bypassed normal formatting globs. Keep raw artifacts in an ignored
  directory instead of changing extensions to make them trackable.
- Remote Ubuntu Rust foundation succeeded on the starting PR head; this does
  not claim Linux desktop packaging or model/hardware support.

## Final validation results

Independent host validation used pinned Node 24.18.0 and pnpm 11.15.1 outside
sandbox. All commands exited 0:

- `pnpm.cmd format:check:typescript`
- `pnpm.cmd lint:typescript`
- `pnpm.cmd check:evidence`
- `pnpm.cmd test:evidence`: 13 passed, zero failed or skipped.

The exact 239-path identity manifest was stable before/after commands. Review
confirmed 224 retirements, 47 unchanged Markdown receipts, two byte-identical
identity manifests, 60 unchanged older evidence records and 968 unchanged
out-of-scope original paths, including source/fixtures/workflows and both
original completed plans. All 276 ZIP entries matched the archive manifest;
archive SHA-256 remains
`80f9b59a9d38730f1046b01a5dac3cb5e8f3f0a599807759242a51a95ecc30fc`.
Eleven ignore probes passed; 257 local Markdown links/anchors and four pinned
archived blob links resolved. Package CI wiring and `git diff --check` passed;
no independent review finding remained. Rust/native suites were not rerun.

Evidence remains in ignored `tmp/evidence-retention/validator/`:
`post-commands.json`, `post-preservation-checks.json`,
`post-links-and-review.json`, `post-before.json`, `post-after.json` and command
logs. These results precede the final documentation-only archival; final
navigation/identity confirmation is required before publication. Earlier
runtime results remain historical evidence tied to their recorded identities.
