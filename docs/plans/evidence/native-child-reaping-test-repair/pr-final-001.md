# Validation Report

Report ID: NATIVE-CHILD-REAPING-TEST-01-PR-FINAL-001  
Target ID: NATIVE-CHILD-REAPING-TEST-01  
Mode: FINAL  
Verdict: PASS  
Validator: independent refactor_validator, GPT-6 Astra high

Environment: normal local Windows PowerShell outside the managed sandbox.
Session-only PATH prefix `C:\nvm4w\nodejs\node_modules\corepack\shims`;
`pnpm.cmd --version` confirmed 11.15.1. Source writers and Git steward idle.

Starting HEAD SHA: `02259dea3be33202a01ea09ca6609c728536bf0b`  
Ending HEAD SHA: `02259dea3be33202a01ea09ca6609c728536bf0b`  
Branch: `codex/app-preference-effects-readability`

Validated paths: the six source paths below. Before/after identities identical;
blobs computed with Git's path-aware filters.

| Path | Exact porcelain | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/src/App.tsx` | ` M apps/desktop/src/App.tsx` | `B703D30F15DA2E4F852610C6D41D7ABBF66DD0829B9C994554A139FC5CA5FEFE` | `6416fbc5e1d90a13d3a5be83f0a2f5e0f343db81` |
| `apps/desktop/src/App.test.tsx` | ` M apps/desktop/src/App.test.tsx` | `8B2474D801B21355E4276ADA28D0036FC6E5405001D50F549133992DFB6662F0` | `6c02452d5d2572f1531bfaf11b6a404c34b40763` |
| `apps/desktop/src/settings/app-preference-effects.ts` | `?? apps/desktop/src/settings/app-preference-effects.ts` | `24A5AA2F857A23050432F987998716855601FB28F6260B25680513E4AC039AAA` | `13b1d2d54c33e4998c0faafe5a5052047e2aff79` |
| `apps/desktop/src/settings/app-preference-effects.test.tsx` | `?? apps/desktop/src/settings/app-preference-effects.test.tsx` | `B6ADF594DF25EF32B47CE8006D2D6FBC2AFF5F2E698A67E22703292F96E4E7EF` | `7f38a7ebe0f63a8bd0f1be6769a4ec58fec8fec1` |
| `apps/desktop/src-tauri/src/tts_service_supervisor.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor.rs` | `23F8C44039B4DAB2DA8BC18F7ACD58C3E960D08FAABB1A00D751CA9841137EE5` | `671b6168addd815db302f83e59c662fc11f70e40` |
| `apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` | `FA7D8092689B08A6806AE3330D51AC03D0AEF58345895A2D219539653998E948` | `bd4c0d27ac7497eae0837895e8024cdc97761a47` |

Identity recheck: PASS. HEAD, branch, all six source identities and empty index
unchanged. All twelve REVIEW-002 identities matched before and after execution.
Original App identities also match POST-CHANGE-002, PACKAGE-001 and FINAL-002.
`git diff --check` and `git diff --cached --quiet`: exit 0.

## Commands and outcomes

`pnpm.cmd check`: exit 0, executed unchanged outside the sandbox.

| Gate | Outcome |
| --- | --- |
| Evidence guard | PASS; 13 tests |
| Formatting | PASS; TypeScript, Rust, Python; 174 Python files |
| Linting | PASS; TypeScript, Python, both Rust Clippy configurations with warnings denied |
| Type checking | PASS; TypeScript and mypy, 171 Python files |
| Generated contracts | PASS; 17 files |
| Shared tests | PASS; 209 tests across 20 files |
| EPUB tests | PASS; 651 tests across 33 files |
| Desktop tests | PASS; 646 Vitest tests across 56 files, plus 51 Node tests |
| Default Rust tests | PASS; 87 passed, 0 failed, 1 ignored |
| Release-locked Rust tests | PASS; 88 passed, 0 failed, 1 ignored |
| Python tests | PASS; 485 passed, 1 warning |
| Builds | PASS; shared, EPUB, Vite, native Tauri release, Python sdist and wheel |

The actual failed-assignment regression passed in both Rust configurations.
The ignored `assignment_failure_child_fixture` is explicitly launched by that
regression; it is not omitted behavioral coverage.

Nonfatal warnings: pytest could not write `.pytest_cache/v/cache/nodeids`;
Vite reported a chunk exceeding 500 kB. Neither prevented completion.

## Reviews and limitations

Diff scope: PASS. Four accepted App paths plus two independently reviewed Rust
paths. The supervisor adds four Windows/test-only command-factory lines.
Production spawn, termination, ownership and timeouts remain unchanged.
Expected director-owned plan/index/testing/evidence documentation remains
outside the source manifest. No unrelated source or tracked generated changes.

Independent repair authority:
[NATIVE-CHILD-REAPING-TEST-01-REVIEW-002](review-002.md), APPROVE.
All exact reviewed identities remained current.

Invariant review: PASS. App behavior remains bound to its previously validated
identities. The repair retains the original process handle, establishes fixture
readiness and a live child before forced assignment failure, and requires
termination immediately after failed spawn returns. No post-return grace period,
retry, or production behavior change. Owned handles clean up; the helper exits
when its parent dies.

Earlier browser/native-startup/portable evidence applies to unchanged App
sources. Those gates were not rerun for the Windows-test-only repair and are
not claimed as fresh combined-manifest runtime evidence. GPU/model and
cross-platform behavior were not newly tested.

Test-integrity review: PASS. Exact helper invocation and explicit readiness
replace the invalid PID-reopen oracle. No assertions, snapshots, commands or
cleanup requirements were relaxed. Historical failed reports remain; this PASS
does not establish the precise cause of the earlier intermittent incident.

Privacy/artifact review: PASS. No book contents, audio, weights, secrets, private
data or unrelated artifacts entered the reviewed diff. The validator performed
no source, documentation or Git mutations. Raw captures remain ignored under
`tmp/evidence/native-child-reaping-test-repair/pr-final-001/`.

Action required: none for validation. Publication remains subject to authorized
identity rechecks and path-scoped Git operations.

