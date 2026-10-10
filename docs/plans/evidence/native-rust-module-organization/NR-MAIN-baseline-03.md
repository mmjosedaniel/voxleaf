# Validation Report

Report ID: NR-MAIN-BASELINE-03-20261009
Target ID: NR-MAIN
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell 7.6.5 outside sandbox, repository root; all commands
used require_escalated. Existing Corepack pnpm 11.15.1 selected through process
PATH. Supported process-local `VOXLEAF_EDGE_DRIVER_PATH` selects ignored
`tmp/native-rust-module-organization/webdriver-155.0.4283.45/msedgedriver.exe`.
Driver independently verified: 155.0.4283.45, Microsoft signature Valid, SHA256
`DC99C208C10A5364E61C4E5B1341BE492F3224DE753ADB23E973BE97875B1892`.
Validator: reused refactor_validator (Astra high); recorded by director.
Starting HEAD SHA: ed42154668bd71d500b5beab77485f9fd20ee2a2
Ending HEAD SHA: ed42154668bd71d500b5beab77485f9fd20ee2a2

| Validated path | Porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/src-tauri/src/main.rs` | empty | `7B892FDD05856A74A0213C989EB6D6CFA1E4CF8D8D1BA74816F5889F14EF60E8` | `36226406767d3351c70f38328a9164137c5ce49a` |
| `apps/desktop/src-tauri/src/diagnostics/mod.rs` | empty | ABSENT | ABSENT |
| `apps/desktop/src-tauri/src/diagnostics/cli.rs` | empty | ABSENT | ABSENT |

Identity recheck: PASS, all before/after identities and HEAD identical, index
empty before/after (`git diff --cached --quiet`, exit 0). Planned additions absent.

Commands and outcomes:

1. `pnpm.cmd format:check:rust`: exit 0.
2. `pnpm.cmd lint:rust`: exit 0, warnings denied, both feature modes.
3. `pnpm.cmd test:rust`: exit 0, 87 default + 88 release-locked, no failed/ignored.
4. `pnpm.cmd test:native-startup`: exit 0, fresh frontend/native build and complete
   WebView2 smoke: bounded binary delivery, model-free lifecycle/cancellation/
   recovery, file/size/reader/synchronization/image/restoration/preferences and
   cleanup assertions, zero errors or external requests. Nonfatal Vite chunk warning.
5. `git diff --check`: exit 0.

Diff scope: PASS; clean closed source allowlist, only director documentation
outside it dirty. Invariant review: PASS; nine CLI branches and parsing/exits,
sixteen handlers, state/setup/shutdown captured. Test integrity: PASS; no changed
assertions/harnesses/contracts/features. Privacy/artifact review: PASS; ignored
normal outputs only, existing installation and personal data preserved. No source
or Git writer ran during validation. Action required: none, baseline only.

Model/package/admission/acquisition/installer gates are N/A for this dispatch-only
move. Not every model diagnostic CLI branch nor Unix path was executed; no Qwen
runtime result is claimed. Attempts 01 and 02 remain immutable with their actual
environment outcomes. This fresh full run supplies current baseline evidence.
