# APPROVED WORK ORDER: diagnostic validation revision

Target ID: MOD-A-DIAG-02. Goal/risk/allowlist/invariants/forbidden changes and
commands remain those of diagnostic-work-order-02 and diagnostic-correction-02.

Director reviewed the stopped temporary patch: observer 182 lines, tests 184,
366 total. The additional 16 lines supply requested-profile discrimination and
read actual harness templates for meaningful recognition tests. They introduce
no new behavior or responsibility. Compressing those checks has no benefit.

Revised ceiling: two existing ignored temporary files, maximum 375 lines,
covering this current 366-line patch only. No further writing is authorized.
This is a diagnostic estimate correction, not a production correction loop or
source-allowlist expansion. All MOD-A product/harness identities remain frozen.

Baseline evidence remains MOD-A-DIAG-02-BASELINE-01-20261006 PASS; failed review
MOD-A-DIAG-02-POST-01-20261006 remains immutable. Obtain a new independent
post-change report and run `node --test
tmp/mod-a-host-observer/observer.node-test.mjs` outside sandbox. Only a passing
review plus tests permits the separately authorized instrumented full portfolio.
No diagnostic result alone accepts MOD-A. No commit or push.
