# Validation Report

Report ID: NR-SUP-BASELINE-01-20261009
Target ID: NR-SUP
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox, repository root, require_escalated;
process-local Corepack pnpm 11.15.1 and verified Microsoft EdgeDriver 155.0.4283.45
under the ignored campaign tmp directory. Reused independent Astra validator.
Starting HEAD SHA: 2451b3da80f3821081279e11869cb83a4ae67cd7
Ending HEAD SHA: 2451b3da80f3821081279e11869cb83a4ae67cd7

| Validated path | Porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/src-tauri/src/tts_service_supervisor.rs` | empty | `4414CAB38237151611F361F93262C121BB0E1754E9673BF346BC00287E66D3FE` | `faf1986b78c1e10ac78bd4b5ac1f187b37f0f40d` |
| `apps/desktop/src-tauri/src/tts_service_supervisor/host_diagnostics.rs` | empty | ABSENT | ABSENT |

Identity recheck: PASS, identical before/after HEAD/identities and empty index
(`git diff --cached --quiet`, exit 0). Planned addition absent.

Commands and outcomes:

1. `pnpm.cmd format:check:rust`: exit 0.
2. `pnpm.cmd lint:rust`: exit 0, warnings denied in both feature modes.
3. `pnpm.cmd test:rust`: exit 0; 87 default + 88 release-locked, no failed/ignored.
4. `pnpm.cmd test:native-startup`: exit 0; fresh native build and complete
   model-free/WebView2 smoke, target normal/pending/cancel/crash/restart/shutdown/
   Windows-descendant matrix, binary delivery and application/reader/restoration/
   cleanup assertions; zero errors/external requests. Nonfatal Vite chunk warning.
5. `git diff --check`: exit 0.

Diff scope: PASS; both allowlisted paths pristine, source clean after NR-MAIN;
director docs/evidence outside scope. Invariant review: PASS; complete `run_host`
review includes fixed fixture, 19,200-byte assertion, all scenarios, cancellation,
lock/poll/deadline/sleep/join/error/cfg behavior. Resolved fixture SHA256 is
`B57CF18AB2B6A922D9018F028A7B1002D2916B706F7B574299CB30F2F7600753`.
Test integrity: PASS, assertions unchanged and both feature modes exercised.
Privacy/artifact review: PASS; no prohibited files, no validator source/doc/Git
edits, no existing installation/model/data replacement or removal.
Action required: none; baseline only, immutable work order needed before edits.

Models, packaging, admission and installed journeys are N/A for the isolated
model-free diagnostic move. Unix, model-backed and installed-artifact execution
are not established. Production lifecycle/selection/command implementations must
remain unchanged. Recorded immutably by director.
