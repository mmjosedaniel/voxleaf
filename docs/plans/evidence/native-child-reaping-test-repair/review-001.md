# Change Review Report

Review ID: NATIVE-CHILD-REAPING-TEST-01-REVIEW-001  
Task ID: NATIVE-CHILD-REAPING-TEST-01  
Verdict: CHANGES_REQUESTED  
Reviewer: independent change_reviewer, GPT-6 Astra high  
Base commit and reviewed HEAD: `02259dea3be33202a01ea09ca6609c728536bf0b`  
Branch: `codex/app-preference-effects-readability`

The retained-handle oracle fixes the distinction between process termination
and kernel-object destruction. However, the newly added live-process assertion
races an independently exiting test-harness child. This leaves the flaky-test
repair incomplete.

## Finding F1 — P2 — Use a child fixture that remains alive until cleanup

Location: `apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs:19`,
`fail_job_assignment`; fixture selection at line 295.

During `pnpm.cmd test:rust`, `ServiceChild::Fake(NORMAL_SCENARIO)` resolves
`current_exe()` to the Rust unit-test executable. It launches that executable
with `--voxleaf-tts-model-free-service-child normal`. The normal application
entrypoint that dispatches this argument is replaced by the generated test
harness entrypoint.

The child can exit on the unrecognized argument before the callback's
zero-timeout observation. If the parent is descheduled after spawning,
`WAIT_TIMEOUT` becomes `WAIT_OBJECT_0`, failing the new assertion despite
correct supervisor cleanup. If the observation wins the race, the child's
subsequent independent exit also weakens attribution of the final terminated
state to supervisor cleanup.

Supporting evidence: `ServiceChild::command` at
`tts_service_supervisor.rs:544–555` launches `current_exe()` with the
application-specific argument. Dispatch occurs only through `main.rs:21–22`
and `diagnostics/cli.rs`. `Cargo.toml` has no custom harness configuration.
Supplied `gate-3.log` identifies
`target/debug/deps/voxleaf_desktop-71aac22584c4258b.exe`, running unit tests
from `src/main.rs`. Rust test compilation replaces the application entrypoint
with the generated harness.
[Rust test compilation](https://doc.rust-lang.org/rustc/tests/index.html)

Bounded correction criterion: Give this regression a test-only child fixture
whose entrypoint works under the actual Cargo test command and whose lifetime
remains controlled until supervisor cleanup. Retain the original-process
`OwnedHandle`, live negative control, unchanged `ChildUnavailable` assertion,
and zero-timeout post-return termination assertion. Do not add a post-return
retry or grace period. Update the evidence and obtain fresh affected host
checks and a new review report.

This is a source-confirmed entrypoint mismatch and scheduling race. The reviewer
did not execute a reproducer; ten passing test executions do not demonstrate
absence of this race.

## Acceptance review

Original process identity, immediate post-return observation, explicit error,
RAII handle cleanup, and unchanged production supervision are satisfactory.
F1 prevents acceptance of the live-child fixture.

Product constraints and ADR-0016/system diagram remain unchanged. Documentation
correctly distinguishes the historical unexplained failure from the invalid
oracle demonstration. The Windows documentation supports signaled process
objects after termination and valid retained handles:
[termination](https://learn.microsoft.com/en-us/windows/win32/procthread/terminating-a-process),
[handles](https://learn.microsoft.com/en-us/windows/win32/procthread/process-handles-and-identifiers).

## Test evidence reviewed

Director-supplied host results, not commands run by the reviewer: PowerShell
7.6.5 outside sandbox, Rust 1.97.1, Node 24.20.0, pnpm 11.15.1.

- Pre-edit `pnpm.cmd test:rust`: exit 0, 87/88 tests.
- `pnpm.cmd format:check:rust`: exit 0.
- `pnpm.cmd lint:rust`: exit 0, both configurations.
- `pnpm.cmd test:rust`, five executions: every exit 0, 87/88 each.
- `pnpm.cmd check:evidence`: exit 0.
- `pnpm.cmd test:evidence`: exit 0, 13 passed.
- `git diff --check` and `git diff --cached --quiet`: director reports exit 0.

Reviewer inspected `validate.ps1`, `results.json`, relevant
`gate-1.log` through `gate-9.log`, and identical `before.json`/`after.json`.
Seven recorded source/configuration identities matched this patch; documentation
was finalized afterward and bound below. These captures belong to attempt 1;
later captures must use a distinct directory.

## Reviewed paths and identities

| Path | Exact porcelain | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` | `6A81BE7BE0DA5791E55AE52333B760EF4104DE4D0295A12EFF76619285F64504` | `0454020c91fcce79b79b93abf0e55c9009712580` |
| `apps/desktop/src-tauri/src/tts_service_supervisor.rs` | clean | `D8F5554C725758D300E58B153B0DA417F62E5D1DE21EFE89B44A774958FD8937` | `cdc3aae9d90367615d08faaa53be6fd12e44c3d7` |
| `apps/desktop/src-tauri/src/tts_service_fake_child.rs` | clean | `59656CA25B6A061F0722EB01ED956028D80B8FF4F2AA3EA3EA05F51394A65448` | `223971a920f818f3b84390ce2a3cf39cd520863f` |
| `apps/desktop/src-tauri/Cargo.toml` | clean | `98076653B33D485837AA7CE81B62F650EC12F48B83342F0D7C8D399577333F51` | `f06da800939c1867e0d69b6ec6d55b9a13206587` |
| `apps/desktop/src-tauri/Cargo.lock` | clean | `7646582545047FEA31396692FA800EBCBACB12EFEF3B727B75A6C301D4DAE1E2` | `4d94615954d88098822983c3ed55d9d949a3c046` |
| `rust-toolchain.toml` | clean | `DAFAE8F49387948AE1527C41C6B846ACC184B10205EB41719DC5835E38D0F9D1` | `a791afad1d99f9b6411e2409008fa21ee8189034` |
| `package.json` | clean | `D56217DC1693231F9BFBD422D30AFE228D28564068D32FAFE747E06D4FD792EB` | `fd9e98b5009c9b58386cf886e752c1ab0df775f8` |
| `docs/development/testing.md` | ` M docs/development/testing.md` | `97E23A8BA8BB9C29FE9ED632C798BB5128CAA7FB8423ADF8E8AF6AB4463F64BC` | `eff53f848013f8b0b7ef02b552b93aa6078d9e07` |
| `docs/plans/evidence/native-child-reaping-test-repair/README.md` | `?? docs/plans/evidence/native-child-reaping-test-repair/README.md` | `2F84BB10922C215E35563B338E46511F29B470C430A85A730284B5DA39DD2347` | `5926bbb2ae2063fdfd702bdbd433765a28d28518` |
| `apps/desktop/src-tauri/src/main.rs` | clean | `0005AE37462873ACD98477C22D525920C52B9F7D4F9013734C665D6566596682` | `8a055c4ff4454f186210903b1493bff35b7ce19a` |
| `apps/desktop/src-tauri/src/diagnostics/cli.rs` | clean | `38281C0FFEC327FF94B0BAC8B03D4996DCC53C8DB87DC105B2CF75A1AC572A4A` | `b12c4ebe1f05e8b8d743b37d53447e75e29c1426` |

Identity recheck: PASS. All nine supplied identities matched at initial and
final capture; the two additional supporting paths also remained unchanged.
Base/HEAD/branch unchanged; no staged paths. Pre-existing refactor snapshot
had zero hash/deletion mismatches and is excluded from acceptance scope.

Remaining uncertainty: precise historical cause/handle owner unproven; prior
PowerShell diagnostic attributed rather than independently repeated. Browser,
packaged startup, GPU/model, Linux and aggregate gates not repeated for this
Windows test repair.

Required next action: resolve F1, rerun affected checks outside the sandbox,
request a new immutable review ID. Preserve this report. It is not a
refactor Validation Report or authorization for Git mutations.

