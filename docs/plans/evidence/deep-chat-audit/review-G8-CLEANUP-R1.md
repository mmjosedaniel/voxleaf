# Change Review Report

Review ID: **DCR-G8-CLEANUP-R1-ASTRA-20261110-01**  
Task ID: DCR supplemental G8 cleanup correction  
Verdict: **APPROVE**  
Base commit and reviewed HEAD: `d375ecc84261c404e855c055e0ecc8949a97caaf`

Reviewed paths and identities: the closed 21-row manifest in [g8-cleanup-execution.md](g8-cleanup-execution.md), receipt `DCR-G8-CLEANUP-EXEC-20261110-01`, incorporated unchanged by SHA-256 `e8d98136a480b93b57099d6117e1b2f156f162a3344bb45e84905b4d6421b64b`. Only its first three paths constitute this supplemental patch. Earlier units present in supporting files are outside this approval.

Additional unchanged validation configuration inspected:

| Path | Status | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `eslint.config.js` | clean | `fbc71764ec5a6d136b2b7181045c8a5bc218a2493822eb07ce7d4b146ced53f1` | `6e223e865761ec9cda99a39de5f7a9310817e92c` |

Identity recheck: **PASS**. Base/HEAD, empty index, all 21 manifest identities and receipt digest remained unchanged. The actual three-file Git diff exactly matches `G8-cleanup-review-patch.diff`. The additional configuration matches the before/after lint snapshots and current file.

Acceptance review:

- Tree-termination rejection no longer skips the separately attempted root stop.
- PowerShell attempts later verified owners after an individual termination failure. Kills precede waits; waits share one 10-second helper budget under the existing 15-second subprocess timeout.
- Full creation-time and executable checks remain; a different process identity is skipped. Existing ancestry acquisition remains intact.
- Capture uncertainty and cleanup failure remain failures even when best-effort termination succeeds. Scratch data is retained.
- Primary and cleanup errors remain represented. Public diagnostics use bounded traversal and fixed phase/category codes, without raw process output, paths or arbitrary exception text.
- Existing assertions were retained or adapted for the new error wrappers; none was weakened to accept the reproduced failure.

Test evidence reviewed: supplied by `/root/dcr_worker`, attributed to normal local PowerShell 7.6.9 on Windows, Node 24.20.0 and offline pnpm 11.15.1. **The reviewer ran no tests.**

| Command | Reviewed result |
| --- | --- |
| `node --test '--test-name-pattern=SAF-13 termination-failure' apps/desktop/scripts/native-smoke.node-test.mjs` | RED: exit 1, expected missing-ESRCH assertion. Production differed only by the default-preserving injection seam. |
| `pnpm.cmd test:native-smoke-harness` | GREEN: exit 0, 53 passed, zero skipped; includes real Windows process trees, unrelated sentinel survival, uncertain-capture retention and independent root cleanup. |
| `node --test apps/desktop/scripts/native-webdriver-client.node-test.mjs apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs` | Exit 0, 125 passed. |
| `pnpm.cmd format:check:typescript` | Exit 0. |
| `pnpm.cmd lint:typescript` | Exit 0. |

All four execution snapshots match before/after. All 240 harness inputs and 491 caller inputs match current files. The broader format/lint snapshots differ currently only on the active Markdown plan, outside those checks’ consumed file types. The recorded host inventory returned to its original state.

Findings: **none**.

Remaining uncertainty: this approves the bounded harness correction only. It does not establish the initiating cause of the earlier Piper cleanup failure or convert that failed execution into PASS. Renewed packaged startup/Piper aggregate evidence, executable relocation and adjacency equivalence, G10 lifecycle and integrated G12 acceptance remain pending.

Required next action: coordinator may proceed within the separately authorized validation plan after rechecking these identities. This report grants no Git permissions and is not a Validation Report.

The original report is retained privately. This public copy uses a repository-relative evidence link and omits the local-memory citation footer.
