# Windows child-reaping test repair

Task ID: NATIVE-CHILD-REAPING-TEST-01  
Date: 2026-10-11 (America/Bogota)  
Base and current HEAD: `02259dea3be33202a01ea09ca6609c728536bf0b`  
Branch: `codex/app-preference-effects-readability`

This is a separately authorized test repair after the App preference refactor.
It changes the Windows test oracle, its test-only child fixture, and testing
guidance. A four-line command-factory seam in the supervisor is gated by
`cfg(all(test, windows))`; it does not change production execution, child
supervision, timeouts, dependencies, or the
completed refactor's acceptance criteria or immutable reports.

## Failure and diagnostic

[FINAL-001](../app-preference-effects-readability/final-001.md) records
`pnpm.cmd check` exiting 101: the default 87 Rust tests passed, but the
release-locked run failed
`tts_service_supervisor::tests::failed_job_assignment_kills_and_reaps_the_spawned_child`
at the assertion that `OpenProcess` must return a null handle.
[FINAL-002](../app-preference-effects-readability/final-002.md) records the
unchanged full rerun passing. That rerun was not a repair.

The old assertion confused process termination with destruction of its kernel
object. Windows retains the object while handles remain open, and a handle can
remain valid after exit. See Microsoft's
[process termination documentation](https://learn.microsoft.com/en-us/windows/win32/procthread/terminating-a-process)
and [process handles documentation](https://learn.microsoft.com/en-us/windows/win32/procthread/process-handles-and-identifiers).

During the preceding read-only investigation, a local PowerShell/PInvoke
diagnostic started a hidden synthetic `cmd.exe /d /c exit 23`, retained its
original handle, waited for its exit, then reopened its PID. All 10 repetitions
returned an openable process with exit code 23 and zero-time waits reporting
`WAIT_OBJECT_0` on both handles. Both handles were released. This demonstrates
the old oracle's false-positive mechanism; it does not identify who held a
handle during the historical failed suite. No exit-state/handle-owner trace
was captured for that incident, so its precise cause remains unproven.

A fresh pre-edit `pnpm.cmd test:rust` also passed 87/88 tests outside the sandbox.
The original test file had SHA-256
`853E06DEEC2013D72696F893D15ABA86F2BAEEDB08236130B85E2C5E0D62754B`
and filter-aware blob `1099ae86295ff062b4574c5845701dcd1d6e1ad4`.

## Repair and preserved requirement

The initial repair passed all host gates but was rejected by
[REVIEW-001](review-001.md): `ServiceChild::Fake` launches `current_exe()` with
application-only arguments, while Cargo replaces the normal main entrypoint
with its test harness. That child can exit independently on an invalid argument,
making a live-child assertion race and weakening cleanup attribution.

The correction adds a Windows-only test command factory and launches an exact
ignored helper with valid test-harness arguments. A process-scoped named event
confirms that the helper has opened the original parent's process handle. It
then waits indefinitely on that parent handle: stdin closure cannot end the
fixture, and parent death prevents an orphan. The callback bounds readiness by
the existing five-second `HANDSHAKE_TIMEOUT`, before assignment failure.
All process/event handles use RAII and are non-inheritable. Only the subprocess
helper is ignored in the main test list; the real regression still runs
normally and explicitly starts that helper. No Cargo features were added.

The callback clones the original child's handle into an `OwnedHandle`, checks
`WAIT_TIMEOUT` with timeout zero to prove the child is still running, and
retains the handle before returning the intended assignment error.
After `spawn_with_job_assigner` returns, the test takes ownership of that
same handle, checks `ChildUnavailable`, and requires `WAIT_OBJECT_0` with
timeout zero. There is no post-return wait, retry, sleep, or additional grace
period that could hide late cleanup.

The live-child assertion is a negative control; the final assertion verifies
the running-to-terminated transition for the same process identity. Keeping the
handle open makes kernel-object persistence part of the normal regression
scenario. RAII releases it even if the final assertion panics, replacing manual
cleanup that was unreachable after the old failing assertion.

The supervisor's existing kill, bounded wait, and Drop behavior are unchanged.
No books, models, audio, external services, or product settings are used.
The canonical system diagram and ADR-0016 still describe the same local
supervisor ownership and cancellation boundary; no diagram or ADR update is
needed. This bounded test repair does not require a new ExecPlan under
`.agents/PLANS.md`.

## Host validation

Executor: director, with the implementation worker stopped throughout.
Normal local PowerShell 7.6.5 outside the managed sandbox, Node v24.20.0,
Rust 1.97.1, pnpm 11.15.1. Only the process PATH was prefixed with
`C:\nvm4w\nodejs\node_modules\corepack\shims;` to select the pinned pnpm.
The saved local driver `tmp/evidence/native-child-reaping-test-repair/attempt-3/validate.ps1`
ran these existing repository commands serially:

| Command | Result |
| --- | --- |
| `pnpm.cmd format:check:rust` | Exit 0. |
| `pnpm.cmd lint:rust` | Exit 0; default and release-locked Clippy, warnings denied. |
| `pnpm.cmd test:rust`, five consecutive executions | Every exit 0; every execution 87 default and 88 release-locked passed. Repaired test passed 10/10 across both configurations; 875 total passing test executions. Each suite lists one ignored subprocess helper, which the regression explicitly launches. |
| `pnpm.cmd check:evidence` | Exit 0. |
| `pnpm.cmd test:evidence` | Exit 0; 13 passed. |
| `git diff --check` | Exit 0. |
| `git diff --cached --quiet` | Exit 0; index empty. |

Attempt history is retained separately: attempt 1 passed the same gates on the
first handle-based patch, then REVIEW-001 requested the fixture correction.
Attempt 2 stopped at `pnpm.cmd format:check:rust` (exit 1), which requested
only a multiline `format!` expression; later commands were not reached.
The worker applied that formatting and stopped. Attempt 3, summarized above,
passed all commands on the corrected fixture. No rejected attempt is acceptance
evidence for the final patch.

The complete source/toolchain identity manifest below matched before and after
all post-change commands. The new documentation was finalized after these code
checks; it changes no test input. The independent review records its identities.
Browser, native startup, portable/full aggregates and GPU/model tests were not
rerun for this Windows test-only repair. The earlier refactor results remain
historical results, not fresh evidence for this new patch. Linux cannot execute
this Windows-only test and was not rerun. Five successful repetitions are
bounded regression evidence, not a guarantee against every possible host fault.

Raw command captures and identity JSON stay in ignored
`tmp/evidence/native-child-reaping-test-repair/`, local only, disposable after
review/commit handoff; this concise record remains the durable summary.

| Validated path | Porcelain before and after | SHA-256 before and after | Filter-aware blob before and after |
| --- | --- | --- | --- |
| `apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` | `FA7D8092689B08A6806AE3330D51AC03D0AEF58345895A2D219539653998E948` | `bd4c0d27ac7497eae0837895e8024cdc97761a47` |
| `apps/desktop/src-tauri/src/tts_service_supervisor.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor.rs` | `23F8C44039B4DAB2DA8BC18F7ACD58C3E960D08FAABB1A00D751CA9841137EE5` | `671b6168addd815db302f83e59c662fc11f70e40` |
| `apps/desktop/src-tauri/src/tts_service_fake_child.rs` | clean | `59656CA25B6A061F0722EB01ED956028D80B8FF4F2AA3EA3EA05F51394A65448` | `223971a920f818f3b84390ce2a3cf39cd520863f` |
| `apps/desktop/src-tauri/Cargo.toml` | clean | `98076653B33D485837AA7CE81B62F650EC12F48B83342F0D7C8D399577333F51` | `f06da800939c1867e0d69b6ec6d55b9a13206587` |
| `apps/desktop/src-tauri/Cargo.lock` | clean | `7646582545047FEA31396692FA800EBCBACB12EFEF3B727B75A6C301D4DAE1E2` | `4d94615954d88098822983c3ed55d9d949a3c046` |
| `rust-toolchain.toml` | clean | `DAFAE8F49387948AE1527C41C6B846ACC184B10205EB41719DC5835E38D0F9D1` | `a791afad1d99f9b6411e2409008fa21ee8189034` |
| `package.json` | clean | `D56217DC1693231F9BFBD422D30AFE228D28564068D32FAFE747E06D4FD792EB` | `fd9e98b5009c9b58386cf886e752c1ab0df775f8` |
| `apps/desktop/src-tauri/src/main.rs` | clean | `0005AE37462873ACD98477C22D525920C52B9F7D4F9013734C665D6566596682` | `8a055c4ff4454f186210903b1493bff35b7ce19a` |
| `apps/desktop/src-tauri/src/diagnostics/cli.rs` | clean | `38281C0FFEC327FF94B0BAC8B03D4996DCC53C8DB87DC105B2CF75A1AC572A4A` | `b12c4ebe1f05e8b8d743b37d53447e75e29c1426` |

## Independent review and Git boundary

The [independent Change Review Report](review-002.md) records the verdict for
the frozen repair patch, including the new guidance and this record. It is
outside its own identity manifest.

Pre-existing App refactor source, documentation, archived plan and reports are
preserved. No staging, commit, push, PR, merge, or main modification is authorized
or performed. The task's source changes are
`apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` and the test-only
seam in `apps/desktop/src-tauri/src/tts_service_supervisor.rs`; documentation
changes are `docs/development/testing.md` and this evidence directory.

