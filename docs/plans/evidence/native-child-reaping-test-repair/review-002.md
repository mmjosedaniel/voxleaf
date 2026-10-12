# Change Review Report

Review ID: **NATIVE-CHILD-REAPING-TEST-01-REVIEW-002**  
Task ID: **NATIVE-CHILD-REAPING-TEST-01**  
Verdict: **APPROVE**  
Reviewer: independent `change_reviewer`, GPT-6 Astra high

Base commit and reviewed HEAD: `02259dea3be33202a01ea09ca6609c728536bf0b`  
Branch: `codex/app-preference-effects-readability`

The corrected fixture resolves F1 from REVIEW-001. The test now launches a valid,
explicitly selected harness helper, confirms readiness, and verifies termination
of the original process without a post-return grace period.

## Acceptance review

- **Controlled child lifetime:** The factory selects the exact ignored helper using valid harness arguments. The helper opens the parent process handle before signaling readiness and then waits on that handle. It does not terminate from stdin EOF or invalid application arguments.
- **Readiness and live negative control:** The callback waits for readiness within the existing five-second `HANDSHAKE_TIMEOUT`, then requires zero-timeout `WAIT_TIMEOUT` on the cloned child handle. This happens before returning the forced assignment error.
- **Original process identity:** The cloned `OwnedHandle` retains the original process identity throughout both observations; no post-exit PID lookup is used.
- **Immediate termination requirement:** After `spawn_with_job_assigner` returns, the test requires `WAIT_OBJECT_0` with timeout zero. It introduces no post-return sleep, retry, or additional cleanup allowance.
- **Error preservation:** The test still explicitly requires `Err(TtsNativeFailure::ChildUnavailable)`.
- **Handle ownership:** Callback-local handles close on assertion unwind. The final process handle is taken out of static storage before the result and termination assertions. The test also removes an unused readiness-event handle when spawning fails before the callback.
- **Helper cleanup:** Supervisor termination ends the helper. If its parent exits, the retained parent handle becomes signaled and allows the helper to finish.
- **Production isolation:** Both the command-factory variant and its match arm are guarded by `cfg(all(test, windows))`. Existing production spawning, termination, Drop behavior, timeouts, dependencies, and public contracts remain unchanged.
- **Coverage preservation:** Only the subprocess helper is ignored during ordinary test enumeration. The actual regression remains enabled and explicitly launches that helper.
- **Product and architecture constraints:** No changes affect EPUB privacy, local inference, audio persistence, queues, stale sessions, locators, synchronization, or production cancellation. The existing architecture and ADR-0016 remain applicable.
- **Documentation:** The record preserves the rejected first review, the formatting failure, current evidence identities, and limitations. It does not claim to establish the precise historical failure cause.

**Findings: none.**  
**Previous finding F1: resolved.**

## Test evidence reviewed

The following are **director-supplied results from normal local PowerShell
outside the sandbox**, not commands executed by the reviewer. Recorded tools:
PowerShell 7.6.5, Rust 1.97.1, Node 24.20.0, pnpm 11.15.1.

| Command | Result |
| --- | --- |
| `pnpm.cmd format:check:rust` | Exit 0 |
| `pnpm.cmd lint:rust` | Exit 0; default and release-locked configurations, warnings denied |
| `pnpm.cmd test:rust`, five consecutive executions | All exit 0; each passed 87 default and 88 release-locked tests |
| Target regression across those executions | 10/10 passed; each suite lists one ignored subprocess helper |
| `pnpm.cmd check:evidence` | Exit 0 |
| `pnpm.cmd test:evidence` | Exit 0; 13 passed |
| `git diff --check` | Director reports exit 0 after documentation finalization |
| `git diff --cached --quiet` | Director reports exit 0; index empty |

Inspected the saved driver, results, command logs, and identity snapshots under
`tmp/evidence/native-child-reaping-test-repair/attempt-3/`. The nine
source/configuration/support identities match between the host's before/after
snapshots and the current reviewed files.

Attempt 2's format check exited 1 and requested the multiline `format!`
expression; subsequent commands were not reached. Its failure remains recorded.
Attempt 1's passing checks do not establish acceptance of this corrected revision.

## Reviewed paths and identities

`clean` means empty porcelain status. Other entries are the exact porcelain
output for the corresponding path.

| Path | Exact porcelain | SHA-256 | Filter-aware blob |
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
| `docs/development/testing.md` | ` M docs/development/testing.md` | `B174EA8643B6BF0CFE1DBDC8FF1E8E9FF7972072E3AF18390D64A5018A2BC1D2` | `f61846a37ec3e21e910fed21d2deed3ee28cf776` |
| `docs/plans/evidence/native-child-reaping-test-repair/README.md` | `?? docs/plans/evidence/native-child-reaping-test-repair/README.md` | `C829BD6D23AF814A50F03D69FEF4913366579A06913AADFF610AF6993DF7800A` | `02331ec2433f29dd0c9291695d055ce179bbac70` |
| `docs/plans/evidence/native-child-reaping-test-repair/review-001.md` | `?? docs/plans/evidence/native-child-reaping-test-repair/review-001.md` | `E676F99E4908D1A1DEF78A63238D841DD7764344F9B143F65264633DD69FFD86` | `dec9bb7e67226c6ffad3b93ab658b8b136e65ae3` |

**Identity recheck: PASS.** Independently captured all twelve path identities
before inspection and rechecked them afterward; no drift occurred. Base/HEAD
and branch remained unchanged. The index remained empty. The pre-existing App
refactor snapshot had zero hash/deletion mismatches and is excluded from this
approval's scope.

## Remaining uncertainty

The historical failure's precise cause and handle owner remain unproven.
Five successful suite repetitions provide bounded regression evidence, not
proof against every host fault.

Browser, packaged startup, GPU/model, Linux, and full aggregate checks were not
repeated. This approval covers the Windows test repair and its documentation;
it adds no broader runtime or release acceptance claim.

**Required next action: none for this review gate.** Any subsequent
reviewed-content or HEAD change requires a new assessment. Preserve REVIEW-001
and this report unchanged.

This approval is not a Validation Report and does not authorize staging,
committing, pushing, or creating a pull request.

