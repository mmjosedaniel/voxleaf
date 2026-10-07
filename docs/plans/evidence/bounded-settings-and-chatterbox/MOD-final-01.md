# Validation Report

Report ID: MOD-FINAL-01-20261006. Target: bounded settings and Chatterbox campaign.
Mode: FINAL. Verdict: PASS. Independent validator: refactor_validator (Astra high).
Environment: local PowerShell outside sandbox.
Starting/ending HEAD: c140d0f2971cd6498fff2728dfa009acd01126f1.

## Validated identity and reused evidence

All seven path names, exact porcelain states, SHA-256 and filter-aware blobs
in [MOD-A-SCOPED-FINAL-01-20261006](MOD-A-scoped-final-01.md#validated-path-identities)
were independently rechecked before and after this inspection and match exactly.
That immutable manifest is this report's validated source manifest. MOD-B's
implementation allowlist is empty. Index remains empty; HEAD unchanged.

No source edit or new concern invalidated the accepted checks, so no test/model
rerun was needed. Reused exact-identity results: driver 17 tests; package build,
desktop types, format/lint; desktop 581 Vitest and 37 Node; browser 7;
`pnpm.cmd check:portable` and `pnpm.cmd check` exit 0 including Python, both
Rust configurations and native build; native lifecycle and Piper/Chatterbox
Spanish/English model journeys PASS.

The original six-arm portfolio remains exit 1: Qwen Spanish failed and English
was not reached. Campaign PASS follows explicit amended scope and ADR-0051;
it does not certify Qwen or relabel that command.

## Fresh commands and outcomes

- Before/after `git rev-parse HEAD`, path-specific
  `git status --porcelain=v1 --untracked-files=all`,
  `Get-FileHash -Algorithm SHA256` and `git hash-object --path=... -- ...`:
  exact agreement with all seven accepted identities.
- `git diff --cached --quiet`: exit 0; index empty.
- `git diff --check`: exit 0, including director documentation updates.
- `git diff --name-only -- apps/desktop/src-tauri packages services docs/architecture/system-diagram.md`:
  no changes.
- Read-only relative-link checks across ADR-0051, ADR index, docs index, roadmap,
  active index, ExecPlan and MOD-B audit: 300 local links, none missing.
- `Test-Path`: task observer, cancelled seek observer and exact task-owned
  temporary driver directories all absent.
- `Get-NetFirewallRule -PolicyStore ActiveStore -Name 'VoxLeaf-MOD-A-Offline'`:
  zero rules. `NODE_OPTIONS`: absent.
- Read MOD-B audit, ADR, plan/index changes and cleanup record: consistent.

## Independent review

Scope PASS: accepted product patch 568 lines, harness repair 262 lines, expected
documentation/evidence only. Native Rust, shared/EPUB packages, Python service,
frozen authorities and canonical diagram unchanged. MOD-B made no source edit.

Invariants PASS: accepted MOD-A and synchronization invariants remain bound to
unchanged identities. MOD-B SKIP has concrete inspected support: already-testable
admission/artifact functions and intentional installed-state lock/receipt ownership.
It does not claim new native test execution. No diagram update is required.

Test integrity PASS: no changed tests since acceptance, weakened assertions,
timeout increase, filtered acceptance rerun or unsupported pass claim. SKIP needs
no new modification baseline/post-change execution.

Documentation PASS: ADR-0051 and roadmap truthfully preserve Qwen development
code/history, defer unresolved work and distinguish four successful required
journeys from the failed six-arm command. Earlier failure entries remain history.

Privacy/artifacts PASS: no private/model/book/audio artifacts entered the diff.
Independently confirmed temporary directories and exact firewall rule absent.
[Cleanup record](MOD-host-cleanup-02.md) agrees with observed absence; global
tools and unrelated rules were outside scope. No staging, commit, push or PR.

Action required: none for campaign acceptance. Director may perform the planned
documentation-only move to completed and update status/index links, followed by
link/whitespace checks. Source acceptance remains tied to the immutable manifest.
