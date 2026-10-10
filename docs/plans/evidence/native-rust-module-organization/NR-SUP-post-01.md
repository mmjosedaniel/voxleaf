# Validation Report

Report ID: NR-SUP-POST-01-20261009
Target ID: NR-SUP
Mode: POST-CHANGE
Verdict: PASS
Environment: local PowerShell outside sandbox, repository root, require_escalated
for every acceptance command; existing Corepack pnpm 11.15.1 and verified
Microsoft EdgeDriver 155.0.4283.45 through process-local settings. Astra validator.
Starting HEAD SHA: 2451b3da80f3821081279e11869cb83a4ae67cd7
Ending HEAD SHA: 2451b3da80f3821081279e11869cb83a4ae67cd7

| Validated path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/src-tauri/src/tts_service_supervisor.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor.rs` | `E339DE585A0439D15DD879AFD41FE364A0A68E57569CC027CC144B98E925B87D` | `71c9a4c069a816989b264dfe9148e33ac03ec497` |
| `apps/desktop/src-tauri/src/tts_service_supervisor/host_diagnostics.rs` | `?? apps/desktop/src-tauri/src/tts_service_supervisor/host_diagnostics.rs` | `3ECFD77675DB84BD9A1F98738A43BB095A9A54AD1DBD22EF928FBC12D2EDEA5D` | `86f0a71a3f392eb0874798cd17f0f2ca94f84fac` |

Identity recheck: PASS, all before/after identities and HEAD identical, index
empty before/after; source writers and Git idle.

Commands and outcomes:

1. `pnpm.cmd format:check:rust`: exit 0.
2. `pnpm.cmd lint:rust`: exit 0, all targets, warnings denied, both feature modes.
3. `pnpm.cmd test:rust`: exit 0; 87 default + 88 release-locked, no failed/ignored,
   counts match baseline.
4. `pnpm.cmd test:native-startup`: exit 0; fresh release build and full model-free
   host/WebView2 smoke, relocated `run_host`, binary delivery, cancellation/crash
   recovery/descendant containment, reader/ingress/restoration/cleanup and zero
   errors/external requests. Existing Vite chunk warning is nonfatal.
5. `git diff --check`: exit 0.

Diff scope: PASS, exactly two approved source files, 223 added/removed lines below
280; director docs/evidence outside unit. Invariant review: PASS, independent
exact-text comparison proves complete function identical except include depth.
Resolved fixture SHA256 remains
`B57CF18AB2B6A922D9018F028A7B1002D2916B706F7B574299CB30F2F7600753`.
All scenarios, 19,200-byte assertion, cancellation/lock/poll/deadline/sleep/join/
error ordering and Windows block remain intact. Private child/re-export preserve
entry point; explicit imports include Windows-gated descendant constant. All
production runtime/lifecycle/method/command/constants/model diagnostics unchanged.
Test integrity: PASS, no removed/weakened/changed assertions; moved executable
matrix passes native startup, deterministic counts match.
Privacy/artifact review: PASS, no generated/frozen/historical/private/prohibited
or unrelated source edits; existing installation/data preserved. Validator edited
no files or Git state. Action required: none; any drift requires fresh validation.

Model/package/admission/installer gates N/A for this diagnostic-only move.
Unix and model-backed/installed-artifact behavior remain untested by this report.
Recorded immutably by director.
