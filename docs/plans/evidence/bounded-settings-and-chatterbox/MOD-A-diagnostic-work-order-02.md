# APPROVED WORK ORDER

Target ID: MOD-A-DIAG-02  
Goal: source-free, content-safe diagnosis of the actual profile-selection wait.  
Risk: medium.

Allowed files:

- `tmp/mod-a-host-observer/observer.mjs`
- `tmp/mod-a-host-observer/observer.node-test.mjs`

Required edits and behavior invariants: freeze the seven observer/privacy/test
requirements in [the diagnostic draft](MOD-A-diagnostic-draft-02.md). The worker
creates only the two temporary files. Exact native-runner/adaptive guard,
unchanged receiver/arguments/results/errors, bounded fixed-field records and
original cleanup in finally are mandatory. Closed value whitelists only.
No repository product/harness edits, retries, timeout/assertion changes, native
interception, installed-state mutation or Git operation. No optional reproduction.

Diff ceiling: two ignored temporary files, maximum 350 lines total.

Baseline evidence: MOD-A-DIAG-02-BASELINE-01-20261006, independent
refactor_validator, PASS in local PowerShell outside sandbox. Both allowlisted
paths have empty porcelain status and ABSENT identities before/after; existing
gitignore excludes both. HEAD remains c140d0f2971cd6498fff2728dfa009acd01126f1,
index empty, all four MOD-A source identities match POST05. No tests/models ran.
Read-only harness identities remained unchanged:

| Path | Status | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/scripts/native-startup-smoke.mjs` | empty | `74c71fad4e847e05b80c86d903d0f60a8e1ea6b688e0232f5636c72978f0eae3` | `e84d80537e3cdab4c79a95ddcfae83053c08491d` |
| `apps/desktop/scripts/native-webdriver-client.mjs` | empty | `b898bb5c312c3099e2e43656a8ff27dba2dd9137ece26aaa73255dcef7381051` | `bfdeae55313b5a4f3d249eb03709632aa0ee8540` |

Baseline commands: read draft/module; git check-ignore -v; before/after HEAD,
porcelain, SHA-256 and filter-aware blob checks; git diff --cached --quiet exit 0.
Scope/design/test-integrity/privacy reviews PASS. Module import has no top-level
application/network execution. Baseline permits authoring only, not model run.

Worker validation: none; return implementation for independent validation.

Acceptance commands: `node --test tmp/mod-a-host-observer/observer.node-test.mjs`
in local PowerShell outside sandbox, independent source/behavior/privacy review,
before/after identity checks. Test inactive guard, passthrough/error preservation,
bounded recording and cleanup after failed observation. Diagnostic acceptance
does not accept MOD-A or replace an uninstrumented portfolio pass.

Completion output: Change Packet only; no commit or push.
