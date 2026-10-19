# Director validation reassessment

Decision ID: NFR-SUP-RETRY-DECISION-20261013-01.
Evidence: immutable [post-change 03 failure](NFR-SUP-post-03.md).
The separately consulted Astra-high advisor recommends one unchanged-command
retry, not another source correction. The first WebView completed its probes;
the second session creation failed after `deleteSession`. Asynchronous profile
release is plausible but unproven; original driver detail was not retained.

Authorized fresh report: NFR-SUP-POST-CHANGE-20261013-04.

1. Verify exact unchanged source/HEAD/index/environment and complete owned
   application/driver/WebView teardown.
2. Reuse only post-03's completed format, both Clippy and both Rust-test results
   while their scope/identities remain valid under plan section 8. Explicitly
   cite them; do not refresh the failed report or call it an approval.
3. Run `pnpm.cmd test:native-startup` exactly once in the same verified normal
   Explorer host context with model variables absent. Record the new binary.
4. If it passes, run all pending baseline-03 gates 5–12 on that exact binary.
   Describe the previous failure as not reproduced, not as a proven fixed cause.
5. If it fails again, stop retries and investigate the rejected driver session
   separately before proposing any further action.

No new source correction, warning suppression, wait/timeout/selector/assertion
or harness change is authorized. Full refactor acceptance still requires every
gate, an independent immutable PASS and director identity recheck.
