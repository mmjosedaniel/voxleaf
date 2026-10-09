# Diagnostic validation and correction order

Immutable report: MOD-A-DIAG-02-POST-01-20261006  
Independent validator: refactor_validator, local PowerShell outside sandbox.  
Verdict: FAIL. HEAD before/after c140d0f2971cd6498fff2728dfa009acd01126f1.

Both temporary paths remain ignored with empty porcelain status:

| Path | SHA-256 | Filter-aware blob |
| --- | --- | --- |
| `tmp/mod-a-host-observer/observer.mjs` | `8e308c3f5a97f471228bd1de6ed64db265bb8b209d9dbda04f48bf064aca9b2e` | `0b22d800674d5b7c8d1ce04a1816501cdee13be3` |
| `tmp/mod-a-host-observer/observer.node-test.mjs` | `6a17f51f58773486fd31cbabd4c3a600e3d0490561f5f547e5b7b6c2d6233c5a` | `a1e5c19678d185ca9d8f3f7a4e2b5cbdee69daaf` |

Identity recheck PASS: these paths, four MOD-A source paths and both read-only
harness/client identities remained unchanged. Index empty. Scope/privacy PASS:
178 + 172 = 350 temporary lines only. `node --test
tmp/mod-a-host-observer/observer.node-test.mjs` exited 0, seven tests passed.
HEAD/porcelain/SHA-256/blob/check-ignore checks passed; no portfolio/model run.

Invariant/test-integrity FAIL: the observer template omits the real alternate
script's trailing callback argument comma, so whitespace-normalized recognition
misses the actual script. Tests reuse that same incorrect template. Also, the
`selected` counter conflates alternate-active and requested-active, while `ready`
is unrelated to the three ambiguous waits. Guard/passthrough/error/bounds/privacy/
cleanup behavior otherwise passed review.

## CORRECTION ORDER

Target ID: MOD-A-DIAG-02. Temporary-tool correction only; no MOD-A source correction.
Allowed files: the same two temporary paths, maximum 350 lines total.

1. Match the actual alternate-click template including its trailing comma.
2. Replace self-referential recognition coverage with the actual template read
   from native-startup-smoke.mjs; never import/execute the top-level harness.
3. Replace the unrelated ready/conflated-selected aggregates with exactly three
   bounded conditions: alternate-active, requested-enabled, requested-active.
   Use the guarded, whitelisted requested profile argument to distinguish them.
4. Preserve all existing guard, passthrough, rejection, cleanup and privacy checks.

Forbidden: product/harness edits, timeout/assertion/retry changes, model execution,
installed-state/Git changes or MOD-B work. Revalidation: independent review and
the unchanged Node test command outside sandbox, fresh identities/report before
any instrumented host attempt. Stop if the bounded correction cannot fit.
