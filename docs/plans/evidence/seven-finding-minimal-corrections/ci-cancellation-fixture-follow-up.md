# PR #289 Windows cancellation-fixture follow-up

Base and tested HEAD: `ce11f0154efc701e20e1f38f0c4e2d800b8170b7`.
This is a separate correction after the immutable historical-v6 CI follow-up.

## Evidence and correction

On that head, Ubuntu portable, Ubuntu Rust and dependency audit passed.
Ubuntu Python passed 818 tests with seven platform skips. Windows browser and
packaged WebView2 passed, but the release-locked Rust suite failed:
153 passed, one failed, seven ignored. The
[original Windows job](https://github.com/mmjosedaniel/voxleaf/actions/runs/41150625835/job/124386023826)
reported `Option::unwrap()` on the cleared cancellation field inside
`saf16_cancelled_error_headers_preserve_diagnostic_and_clean_staging`.

R7-02 permits the cancelled transfer to finish and clear operation ownership
before the test server reads that field. A bounded completion channel added
before the correction forces this ordering and reproduces the same panic locally.
The test now retains the cancellation `Arc` before cancelling, waits for actual
download completion, verifies the retained signal and the cleared manager field,
then attempts its rejected headers. A cancelled peer may already be closed;
successful header writes remain mandatory in both non-cancelled controls.

The four status/length versus cancellation combinations retain their diagnostic,
cleanup, worker-ownership, absent-package and result assertions. Production code
and network behavior are unchanged. The regression explicitly covers the prior
interleaving instead of relying on scheduling or blind workflow retries.

## Fresh local validation

All commands ran in normal local PowerShell outside the managed sandbox on
2026-10-31 UTC, with Rust/Cargo 1.97.1, Node 24.18.0 and pnpm 11.15.1.
Original receipts and input/output captures remain ignored under
`tmp/evidence/seven-finding-minimal-corrections/`.

| Receipt | Command | Outcome |
| --- | --- | --- |
| CI10-rust-before | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_optional_chatterbox::tests::saf16_cancelled_error_headers_preserve_diagnostic_and_clean_staging -- --exact --nocapture` | Exit 101; one failure at the same stale field lookup with completion forced before observation |
| CI11-rust-after | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests:: && cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_optional_chatterbox::tests::` | Exit 0; 64 passed, two explicitly ignored per mode |
| CI12-rust-static | `pnpm.cmd format:check:rust && pnpm.cmd lint:rust` | Exit 0; formatting and Clippy in both modes |

The earlier remote failure is retained in `CI09-windows-rust-failure.log`.
No automatic retry was performed. This test-only patch selects the affected
optional-download suite in both configurations; Python, browser, packaged/model
and unrelated Rust suites are not rerun locally or represented as fresh results.
Existing dependencies and Cargo artifacts were used without reinstallation.

Independent review and exact source/receipt identities accompany this record.
Fresh hosted status for the next commit remains available on
[PR #289](https://github.com/mmjosedaniel/voxleaf/pull/289); no pending check is
reported here as passed. The completed ExecPlan and prior review reports retain
their original outcomes and limitations.
