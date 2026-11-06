# PR #307 Windows stdin-fixture cleanup follow-up

Base and tested HEAD: `e530a20b2085e6ac42e6d864ce10c2d19ad5f1aa`.
This is a narrow test-fixture follow-up; the completed EPUB plan and its earlier
acceptance reports remain unchanged historical records.

## Hosted failure and deterministic reproduction

The [original Windows job](https://github.com/mmjosedaniel/voxleaf/actions/runs/42292888381/job/128150608007)
passed 175 Rust tests and failed one, with eight ignored, in the default mode.
`sac12_cancel_interrupts_real_blocked_stdin_without_queuing_more_work` panicked
at the original `tests.rs:810` immediate `remove_file(capacity_path).unwrap()`:
Windows error 32, a sharing violation. The affected setup had already observed
the child-published capacity file. Publication/readability does not guarantee
immediate deletability on Windows. The exact other handle owner on CI is unknown.

A repository-authored regression holds a real deny-delete file handle, attempts
removal, records OS error 32, and releases the handle immediately after that first
attempt. With the original one-attempt behavior it fails with the same OS error;
with the bounded retry it succeeds on exactly the second attempt. The synthetic
file and directory are removed even in the intended RED case.

Only the Windows test fixture changes. It retries error 32 using the existing
poll interval and the fixture's existing two-second publication deadline. It does
not renew that deadline, retry other errors, or change production cancellation.
Controls prove that missing/access-denied errors propagate immediately even with
retry time remaining, and a sharing violation with an expired deadline propagates
after one attempt. Both original real blocked-stdin tests retain their watchdog,
timing, process/input ownership, cancellation and replacement-owner assertions.

This follows the evidence-first approach of the earlier
[cancellation-fixture CI correction](../seven-finding-minimal-corrections/ci-cancellation-fixture-follow-up.md),
which addressed a different race and is not reused as proof of this correction.

## Local validation

All acceptance commands ran in normal local PowerShell outside the sandbox using
Rust/Cargo 1.97.1, Node 24.18.0 and offline Corepack pnpm 11.15.1. Per-attempt full
source hashes, commands, timestamps, output and exit statuses are retained under
`tmp/evidence/epub-budget-cancellation-reflow/ci-pr307/`, alongside the original
hosted job log. No source test results were borrowed from historical campaigns.

| Receipt | Exact command | Outcome |
| --- | --- | --- |
| CI-RED | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests::sac12_capacity_cleanup -- --nocapture` | PowerShell wrapper exit 1. One intended OS-32 failure and one passing error/deadline control. |
| CI-GREEN | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests::sac12_ -- --nocapture` | Exit 0; eight passed, including both actual blocked-stdin controls, without watchdog rescue. |
| CI-final-default | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests:: -- --nocapture` | Exit 0; 44 passed, five explicitly ignored. |
| CI-final-release | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_service_supervisor::tests:: -- --nocapture` | Exit 0; 43 passed, five explicitly ignored. |
| CI-final-static | `pnpm.cmd format:check:rust` followed by `pnpm.cmd lint:rust` | Exit 0; formatting and all-target Clippy in default and release-locked modes. |

The first combined/static run also passed. The final run supersedes it because
the negative-error regression was strengthened to keep the retry window open for
non-sharing errors; both attempts remain recorded. Existing locked dependencies
and Cargo caches were used. The affected supervisor suite in both configurations
covers this Windows-only helper and its callers; unrelated Rust, Python, browser,
packaged/model and performance campaigns were not rerun or relabelled as current.

## Review and delivery boundary

Independent review and the final current-byte hygiene receipt accompany this
record separately. Local passing tests do not imply that a newer hosted workflow
has passed. The correction leaves EPUB behavior, C15's modeled-only finding and
C05's deferred Chatterbox update unchanged. Commit/push/PR updates remain the
coordinator's separately authorized actions.
