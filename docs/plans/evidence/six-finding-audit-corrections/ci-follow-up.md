# PR #287 Windows CI follow-up

This additive receipt preserves the completed ExecPlan and R1/R2 evidence.
Base and reviewed HEAD: `d7873978c6da1c3952099d4de5522e3b18b48a19`.

## Hosted failure and bounded correction

[Foundation run 40983868682](https://github.com/mmjosedaniel/voxleaf/actions/runs/40983868682)
first failed in Windows job `123830129888` during native restart session
creation (`webdriver-session-not-created`). All 35 Chromium cases and the
native build had passed. Ubuntu portable, Ubuntu Rust and dependency checks
passed. One targeted job rerun, requested with
`gh run rerun 40983868682 --job 123830129888 --repo mmjosedaniel/voxleaf`,
passed native startup on unchanged source. The initial WebDriver cause remains
unconfirmed; it was not reproduced in that retry.

The retry's Windows job `123841248793` then failed during Rust tests:
`saf16_cancelled_error_headers_preserve_diagnostic_and_clean_staging` panicked
at its loopback request read with Windows error 10035 (`WouldBlock`). The
default Rust suite reported 147 passed, one failed and seven ignored. This
previously existing test accepted from a nonblocking listener without resetting
the accepted socket's inherited mode. If the request bytes had not arrived,
the read returned immediately instead of using the configured timeout.

The correction sets only that accepted test socket to blocking mode before
configuring its existing five-second read/write timeouts. The bounded accept
loop, four HTTP-status/content-length and cancellation combinations, diagnostic
preservation assertions, zero-transfer assertion and staging cleanup assertions
are unchanged. No production code, public contract, dependency, model, workflow
or product architecture changes. There is no retry or extended timeout in the
test, and no test or assertion is disabled.

## Local validation

All commands ran from the repository root in local PowerShell 7.6.5 outside
the managed sandbox, with installed Rust/Cargo 1.97.1 and
`CARGO_NET_OFFLINE=true`. No tools or dependencies were installed or updated.

| Command | Result |
| --- | --- |
| `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests::saf16_cancelled_error_headers_preserve_diagnostic_and_clean_staging -- --exact --nocapture` | Before correction: exit 0, one passed. Local timing did not reproduce the hosted failure. |
| `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests:: -- --nocapture` | After correction: exit 0, 59 passed, two explicitly ignored. |
| `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_optional_chatterbox::tests::` | After correction: exit 0, 59 passed, two explicitly ignored. |
| `cargo fmt --check --manifest-path apps/desktop/src-tauri/Cargo.toml` | Exit 0. |
| `cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml --all-targets -- -D warnings` | Exit 0. |
| `cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml --all-targets --features release-locked-runtime -- -D warnings` | Exit 0. |

The existing test is the regression; the hosted failure is retained above.
Passing local timing alone is not presented as a deterministic reproduction.
No full local suites, native builds, browser or model tests were repeated for
this test-only correction. Earlier SFA runtime receipts remain historical
evidence, not new execution on the follow-up. A new hosted result is required
to claim the PR's CI is green.

Independent assessment is recorded separately in
[the CI follow-up review](review-CI-R1.md); that report is excluded from its own
identity manifest. The original completed plan and review reports remain intact.
