# R8 independent review reports

Reports are immutable. This file is excluded from its own identity manifest.
The reviewer inspected code and supplied host evidence without edits or tests.

## R8-R1-20261101

Task ID: R8-20261101. Verdict: **APPROVE**.
Base and reviewed HEAD: `46616e8be197023625d0fd8ff94556fc1478189b`.
Branch: `codex/eight-revalidated-findings-plan`.

Closed manifest: `tmp/evidence/eight-revalidated-findings/run-01/R8-R1-20261101-manifest.json`.
It binds 40 task paths and 344 supporting paths with status, SHA-256 and
filter-aware blob identities. Manifest SHA-256:
`b5c919613583e949777114e493604c30452a14b99bc5ab253f8ecdc9ec1e8ea6`.
Tracked diff SHA-256:
`9bd8708ad9e7383047f5830a2fc21ed9616dd714559e26407c081716258d45bb`.
All three untracked task files were inspected.

Identity recheck: **PASS**. Before/after identities match all 384 paths. Actual
changed membership/statuses and captured diff match. HEAD/branch unchanged,
index empty.

Acceptance review:

- R8-01 uses the bounded shared IFD0 parser, preserves dimension/pixel limits
  and exact decoder agreement. Chromium and packaged WebView2 establish the
  conditional behavior.
- R8-02/03 cover six quality entry points, exactly one close, cleanup-only
  failure, original generation-error precedence, owned-output cleanup and zero
  as an observed RAM minimum reaching the existing failure path.
- R8-04/06 preserve already-open contents focus, modal containment during late
  navigation, settlement, dismissal, restoration and listener cleanup.
- R8-05 joins App-owned removal to replacement containment, including without
  an old coordinator. Success/failure release admission without autoplay;
  explicit Play uses the replacement.
- R8-07 shares bounded fallback resolution for TOC/inline links. Public XHTML
  and NCX controls cover alias occurrences, direct first occurrence, self-links
  and unresolved fragments; rejection and cancellation remain intact.
- R8-08 reflects current compatibility/reader eligibility without consuming
  recovery or automatic restart.

Local EPUB processing, bounded ownership, cancellation, stable locators and
persistence boundaries remain satisfied. No actionable regression or weakened
assertion was found.

Host evidence reviewed: EPUB 205, desktop 399, Python 66, native harness 50,
Chromium 10; seven selected static checks, exports, Piper integrity and desktop
build pass. Both WebView2 arms consume executable SHA-256
`18e5be1ed0d4e5d97797f102f52e8273e49f1c0c05de3fbd01bde64bc4adaac5`.
Native resource restoration and process/scratch cleanup pass. Exact commands
are in the [execution ledger](execution-ledger.md).

Current-task evidence retention: **approved**. Recorded source membership and
bytes match apart from maintained Markdown outside runtime inputs. All 251
package exports match. No historical PASS or failed partial aggregate is
accepted. The strict installed comparison remains failed; independent inspection
confirms only a 135-byte diagnostic append, unchanged original prefix and 24,008
other entries. This output-only change does not invalidate selected receipts.

The initial G10 preceded final ledger bytes. Fresh G10-Documents-r2 resolves
the gap: all 1,499 inputs match, evidence/diff checks and 414 links pass.
Supplemental SHA-256 identities:

- Result: `406d0f3535f3fa17240be150b709c85620add03de874611ce83c57e6189b6abe`
- Inputs: `9eb5a4a08a5bc6cf4dbc7fbc69590ba952cf3c08c9c73b43365452cf1f37bd90`
- Exports: `5e2210673ab9d2c06aa373f73e41b1c4bf3f54c99e2415b2e702648900e1a51f`
- Output: `dc56cad54e6c87be5a7f8706e5bea3e27f251f32d197e5b3e0262fd965048514`

Findings: **none**. No acceptance-blocking uncertainty. Native results apply
only to this host and selected arms, not broader model/hardware/installer/rate
portfolios. No action required for this patch; subsequent archival edits need
a new assessment. Approval does not authorize Git mutations or publication.

## R8-R2-20261101

Task ID: R8-20261101. Verdict: **APPROVE**.
Base and reviewed HEAD: `46616e8be197023625d0fd8ff94556fc1478189b`.
Branch: `codex/eight-revalidated-findings-plan`.

Closed manifest: `tmp/evidence/eight-revalidated-findings/run-01/R8-R2-20261101-manifest.json`.
It covers 42 task paths and 344 supporting paths, including both sides of the
plan move. Manifest SHA-256:
`4340bb1bda5c6e85f873443e0b18eeb610c2793c1571a3f64585aed92480ec91`.
Tracked diff SHA-256:
`acdf8cbf0702a777e29173553db4ee6924f940096dd9e102e2ac61242007453e`.

Identity recheck: **PASS**. All 386 identities/statuses match before/after
review. Captured diff matches current patch. HEAD/branch unchanged and index
empty. The sole additional changed path is this explicitly excluded report file.

Acceptance review: archived plan preserves the approved R8-01 through R8-08
scope, criteria, historical failures and limitations. Active/completed indexes,
incoming links, ADR status and ledger consistently record R1 implementation
approval and this separate archival assessment. No runtime, test, fixture,
runner, configuration or contract identity changed from R1.

Evidence retention: R1 selected current-task receipts remain applicable under
its independent input/environment proof. All original receipt identities remain
unchanged, all 184 R2-manifest receipts match, and all 251 exports still match.
No historical PASS or failed aggregate is promoted.

Fresh G10-Archive ran in normal host PowerShell outside the sandbox:
`pnpm.cmd check:evidence`, `git diff --check`, and `check-links.ps1` all pass;
504 local links resolve and all 1,500 recorded inputs match current bytes.

- Result SHA-256: `f89eee54cdd4e1d605150593f6c7e86234e5c25f27378756c831b31a011113d6`
- Inputs SHA-256: `81c8e8f5fcd0fb5748872d69f9e26e80d140c636752e8194e2b8432b3b7a5174`

The reviewer inspected identities/evidence without tests or file modifications.
Findings: **none**. No acceptance-blocking uncertainty; R1 exact-host and
selected-portfolio limitations remain unchanged. Required next action: none.
Recording this report in its excluded file does not alter the reviewed manifest;
any other reviewed-path change requires a new assessment. This approval is not
a refactor Validation Report or authorization for Git mutations/publication.
