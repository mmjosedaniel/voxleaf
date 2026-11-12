# Five-pass audit CI follow-up

Date: 2026-11-12. Base: `e859c64b4f6880ca13119af82fea73368d8b252c`.
This is a bounded follow-up to [PR #312](https://github.com/mmjosedaniel/voxleaf/pull/312),
not a revision of the completed ExecPlan or its issued evidence.

## Reproduction and correction

The initial production dependency job failed because the exact RustSec
informational-warning set gained `RUSTSEC-2026-0486`, `rustix 1.1.4`, `unsound`.
The unchanged local `pnpm.cmd audit:release` reproduced that failure. The
[upstream notice](https://rustsec.org/advisories/RUSTSEC-2026-0486.html) describes
unsound extended-attribute buffer handling; it is not dismissed as harmless.
Cargo audit 0.22.2 reported zero vulnerability-category findings and eight
informational notices against advisory database commit
`5fe96cf51fde2fd4e749d51ac8bdc59edbdce77b`.

The VoxLeaf release dependency/audit-policy maintainer reviewed this tuple on
2026-11-12. The affected package is absent from the exact locked Windows
normal/build graph, obtained with:

```text
cargo tree --locked --manifest-path apps/desktop/src-tauri/Cargo.toml --target x86_64-pc-windows-msvc --edges normal,build --prefix none --format "{p}"
```

The policy adds only that tuple with `windowsReachable: false`. All seven prior
tuples, vulnerability rejection, strict warning/reachability equality, dependency
locks and four Python advisory blind spots remain unchanged. This assessment
does not establish safety for Unix or development/test graphs. The inventory's
existing `auditDate: 2026-10-27` remains a historical packaged checkpoint;
this dated receipt records the current assessment without rebuilding authorities.

The initial Windows native job failed at RPI-02 image 2 decode. Its diagnostic
placed the target at approximately y=3765–3861 while the reader viewport was
y=298–671. The reader was not busy at failure, but that does not prove its state
when scrolling began or whether a later restoration moved it. The observed
failure therefore establishes a missing visible-placement precondition, not a
production image-loader defect. Both Ubuntu jobs and all 80 Chromium browser
tests passed in the initial run.

The native harness correction waits for a ready reader and explicitly places
each target through its actual scroll owner, then verifies visibility before
waiting for decoding. Placement and decoding share the existing per-visit
deadline. It retains all 12 visits, the eight-source capacity bound, retirement,
fresh-source revisit and zero-resource cleanup assertions. Regression controls
cover no movement, rollback and a visible image that genuinely fails to decode.
No production reader code, timeout increase or automatic retry is involved.

## Validation

Checks run in normal local PowerShell, outside the managed sandbox, with pinned
Node 24.18.0 and pnpm 11.15.1. Raw logs and host-state details remain in ignored
local evidence; this receipt contains no user profile inventory or book content.

- `pnpm.cmd audit:release`: RED before the policy row; GREEN after it, including
  Node, Rust and all three Python graphs. Eight informational notices, five
  Windows-reachable; four optional Python advisory blind spots remain explicit.
- `pnpm.cmd inventory:release:check`: PASS without regenerating inventory.
- `uv run --project services/tts --locked pytest services/tts/tests/test_release_dependency_graphs.py`:
  26 passed; a pytest cache-write permission warning did not affect tests.
- `pnpm.cmd exec prettier --check services/tts/release/audit-policy.json`: PASS.
- `node --test --test-name-pattern=RPI-CI.*image apps/desktop/scripts/native-smoke.node-test.mjs`:
  four discriminating failures before the harness correction; four passes after.
- `pnpm.cmd test:native-smoke-harness`: 57 passed; exact input and package-export
  identities matched before and after execution.
- `pnpm.cmd exec prettier --check apps/desktop/scripts/native-smoke/reader-scenarios.mjs apps/desktop/scripts/native-smoke.node-test.mjs`
  and `pnpm.cmd exec eslint apps/desktop/scripts/native-smoke/reader-scenarios.mjs apps/desktop/scripts/native-smoke.node-test.mjs`:
  PASS.
- `pnpm.cmd check:evidence` and `git diff --check`: PASS.
- `pnpm.cmd test:native-startup`: PASS on local WebView2 157.0.4341.46 with
  EdgeDriver 157.0.4341.42. The build and complete startup smoke passed, including
  synthetic images, navigation, local protocol/cancellation and publication
  cleanup. Exact source/dependency/export identities remained unchanged;
  declared host state and the held adjacent core were restored and verified.
  The helper's Piper preflight checks were configuration-only; this follow-up
  does not claim a new model-inference or installer lifecycle run.
- Independent exact-patch review: recorded separately in the accompanying
  immutable Change Review Report before Git delivery.

Local WebView2 and the CI runner have different versions. A local startup pass
alone cannot establish that the original CI environment passes; a fresh Windows
CI result remains required before reporting this follow-up complete.
