# Validation Report

Report ID: TFR-DOCS-FINAL-20261019-01
Target ID: TFR-BATCH documentary blocked-handoff review
Mode: FINAL
Verdict: FAIL
Environment: local PowerShell outside sandbox (require_escalated), repository-root cwd; PowerShell 7.6.5, Node v24.18.0, Corepack pnpm 11.15.1; process-local PATH selection and COREPACK_ENABLE_NETWORK=0.
Starting HEAD SHA: 2648617f86fdfd7dddc8dc81fdeabd36942f3c3c
Ending HEAD SHA: 2648617f86fdfd7dddc8dc81fdeabd36942f3c3c
Validated paths: the closed ten-path documentary order listed below. This report itself is outside the evaluated paths.
Validated path identities: before-command exact porcelain, SHA-256 worktree bytes and filter-aware expected Git blob IDs.

| Path | Porcelain | SHA-256 | Expected index blob |
| --- | --- | --- | --- |
| `docs/README.md` | ` M docs/README.md` | `942BC85B3F1C44DA0ED20B296D1E43734FCC69ACCC14356A6DE9D68FA42A5A54` | `5eb6a7cd8a2b259af78d1088aa7f1b4820db0ad6` |
| `docs/plans/active/README.md` | ` M docs/plans/active/README.md` | `7ED26B31B72DD6CE20F81B9546537420A1253633667B5F7F9DFE1B3AD4BF9323` | `27c06423246d2bbc6f02ab77a537b3417a736bb9` |
| `docs/plans/active/typescript-function-readability.md` | ` M docs/plans/active/typescript-function-readability.md` | `320E1C5D123BD211ED100D5F055F3BAB5D6625492389C9AF127E44B8809A5CB3` | `899a0ca4848f45ecbf9cb8fa86f4e758bcd029cd` |
| `docs/plans/evidence/typescript-function-readability/TFR-01-audit-and-draft-01.md` | `?? docs/plans/evidence/typescript-function-readability/TFR-01-audit-and-draft-01.md` | `2D3FAC2C40A159E9069D2F2568B52F688C288B23C2760FB0C35148319606116D` | `95434e1bd7a2efa2dfcbcdf3914044275f979d52` |
| `docs/plans/evidence/typescript-function-readability/TFR-02-audit-01.md` | `?? docs/plans/evidence/typescript-function-readability/TFR-02-audit-01.md` | `A2E37F699734963160E1F8F4DCF83B77BD18828D5D45FA97D06A662394807DFB` | `9dd4738cb9818773b1462efcddefb877e1f9bb1f` |
| `docs/plans/evidence/typescript-function-readability/TFR-03-audit-skip-01.md` | `?? docs/plans/evidence/typescript-function-readability/TFR-03-audit-skip-01.md` | `65A7B8436E0FD54229E0083869267742E20E449247B522CD961D2AFC02CB8C06` | `ee9356b1fe45380e53b5f3b3207e69c60f809511` |
| `docs/plans/evidence/typescript-function-readability/TFR-04-audit-01.md` | `?? docs/plans/evidence/typescript-function-readability/TFR-04-audit-01.md` | `0EC3C7C729F7B48AE5177096BB657427AF1C55DA92EC8748332F4927FB525F94` | `1abb23bfdaba095bf3a4c02c0d77128a24da9a9d` |
| `docs/plans/evidence/typescript-function-readability/TFR-05-audit-01.md` | `?? docs/plans/evidence/typescript-function-readability/TFR-05-audit-01.md` | `DFA7299F3A41FA8D638096B5D9319054BC39113AA068D78F3E0124EF9822F326` | `0f472a76488a1792ba756e28e8507a41f8b16d0e` |
| `docs/plans/evidence/typescript-function-readability/TFR-BATCH-BASELINE-20261019-01.md` | `?? docs/plans/evidence/typescript-function-readability/TFR-BATCH-BASELINE-20261019-01.md` | `BE2976A983637091806BAB05A28C9D4BE3925FC97A94D25222DDB6BA5F272172` | `65dc0d18d3cdf14a8c620e088e22dbec65e163fc` |
| `docs/plans/evidence/typescript-function-readability/TFR-BATCH-BASELINE-20261019-02.md` | `?? docs/plans/evidence/typescript-function-readability/TFR-BATCH-BASELINE-20261019-02.md` | `F00CCF60DA574E01C14FC3BEC704C9D74986F892CB97229834B03D37DF75AC1F` | `37bca0a2d3c6030c601d4cf8c582fe261687a247` |

Identity recheck: PASS. All ten identities and full HEAD unchanged; index empty before/after. Raw manifests: identity-before.json and identity-after.json in the receipt collection below.
Commands and outcomes:
- `pnpm.cmd check:evidence`, repository-root cwd, local PowerShell outside sandbox; 2026-10-19T14:36:29.9983536Z to 2026-10-19T14:36:30.4410469Z; 0.443 seconds; exit 0. Inputs: frozen path manifest, current package.json and evidence-guard hash in environment.json; result/log retained under check-evidence.json/.log.
- `git diff --check`, repository-root cwd, local PowerShell outside sandbox; 2026-10-19T14:36:30.4535745Z to 2026-10-19T14:36:30.4887946Z; 0.035 seconds; exit 0. Inputs: frozen path manifest, current package.json and evidence-guard hash in environment.json; result/log retained under diff-check.json/.log.
- Manual current review: 197 local links resolved, with only this anticipated report absent before creation; this report is now its exact target. Configured commands were compared with current package scripts and original baseline receipts. Full changed/new documentation reviewed; current source remains unchanged.
Reused gates: none. Original baseline receipts were checked for accurate documentary transcription, not reused as production acceptance.
Acceptance boundary: FINAL
Pending batch gates: all unresolved production obligations in baseline report02 remain: desktop tests/model-free preflight, shared EPUB/browser, native startup, lifecycle/four supported model arms, later unit baselines/posts, combined TypeScript and portable/native aggregates. This documentary report cannot close the production campaign.
Preparation/cleanup: not-applicable to runtime; no dependency repair, native/model process, firewall or installed-package mutation occurred. Only new ignored receipts and this immutable report were created.
Retries: none. Earlier dependency-preparation budgets and failed baseline remain unchanged.
Diff scope: PASS. The evaluated changes are the approved plan/index/audit/evidence handoff only; four CHANGE candidates remain unimplemented, TFR-03 is justified static SKIP, plan stays active, and no Git mutation is authorized or performed.
Invariant review: PASS. Maintained status and continuation requirements preserve blocked production acceptance and distinguish actual cheap checks, failed test discovery, ineffective preparation and developer-only preflight from runtime proof. TFR-04 limits the early-exit claim to preservation rather than asserting an unproven notification defect. The unchanged system diagram remains applicable.
Test-integrity review: PASS. No production/test/assertion/harness/configuration changes; raw baseline receipts substantiate the reported exits and durations. The evidence guard passes the Git index and extension policy; it does not establish concision of untracked Markdown.
Privacy/artifact review: FAIL for evidence-retention concision. No private/prohibited content was found, but TFR-BATCH-BASELINE-20261019-01.md is 153,966 bytes/1,600 lines, including 1,536 accidental empty command-table rows and only 64 meaningful lines. Retaining this malformed bulk in docs/plans/evidence conflicts with docs/development/evidence-retention.md. Its .md extension and passing automated guard do not cure the defect.
Action required: byte-preserve the original malformed report in ignored raw evidence before retiring its oversized documentation copy; record SHA-256, byte size, entry manifest and recovery location in a new compact provenance record. Original SHA-256 is BE2976A983637091806BAB05A28C9D4BE3925FC97A94D25222DDB6BA5F272172. Never rewrite the original report. Retain compact report02 and this immutable failed review. Freeze a revised closed documentary scope, update the anticipated review link, and obtain a new independent report. This correction grants no source implementation, dependency retry reset or production gate reuse.

Receipt collection: `tmp/evidence/typescript-function-readability/TFR-DOCS-FINAL-20261019-01/` (identity/environment records, two exact command logs/results, local-link review).
