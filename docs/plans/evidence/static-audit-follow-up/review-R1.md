# Change Review Report

Review ID: **SAF-R1-20261029**  
Task ID: **static-audit-follow-up**  
Verdict: **CHANGES_REQUESTED**

Base commit and reviewed HEAD: `5003538f0870f69c67c33e8d79515ccc87e0c702`  
Branch: `codex/static-audit-follow-up`

Reviewed paths and identities: `tmp/evidence/static-audit-follow-up/review-R1-manifest.json`, SHA-256 `88553cd07856943780d5fab1558cf35ec7c4d7752baac549c2458957269ec65e`. Closed manifest contains 1,432 paths, including 60 changed paths.

Identity recheck: **PASS**. Before and after review, all manifest SHA-256 and filter-aware blob identities matched. HEAD, branch, membership and porcelain statuses matched; the index remained empty. The tracked diff and full new-file contents matched the supplied dossier. All 56 referenced receipt/log/snapshot hashes matched.

Acceptance review: Inspected SAF-01–16, relevant requirements/ADRs, affected production paths, direct callers, regression assertions, generated core changes and documentation. The complete-only Settings correction, latent simulator scope and deliberate-deadline boundary remain appropriately narrow. No actionable findings were identified in U1–U4 or U6. U5 has the ownership defect below. Public wire schemas, dependencies, numerical limits, frozen authorities and completed plans remain unchanged.

Test evidence reviewed: These are **executor-supplied host results**, not commands executed by this reviewer.

- `pnpm.cmd test:typescript`: shared 210, EPUB 742, desktop 970 and seven Node suites totaling 132 passed.
- `pnpm.cmd test:python -o cache_dir=../../tmp/evidence/static-audit-follow-up/pytest-cache` and `pnpm.cmd build:python`: 791 passed; wheel/sdist built.
- TypeScript/Python format, lint and typecheck leaves passed. Subsequent changes outside their consumed inputs do not invalidate those leaves; generated JSON received its separate formatting check.
- `inventory:release:check`, `package:piper-core:write-manifest` and `package:piper-core:check` passed, including both real offline voice smokes and literal-route/ordinary-text assertions.
- Browser spec: all 19 passed. Standalone frontend and native builds passed.
- Rust formatting, both Clippy variants and both test variants passed: 145/144 tests, with seven explicit ignores each.
- Direct native smoke passed on the identified final executable, with unchanged binary identity and zero new observed processes/scratch roots.
- Evidence guard, 31 guard tests, whitespace and final 332-link inspection passed.

Receipt comparisons support current-task evidence applicability. Historical PASS results were not reused. Passing process-cleanup tests do not cover the ownership trigger below.

Findings:

**1. P1 — Process discovery can authorize termination of an unrelated process after parent PID reuse.**

- **File/symbol:** `apps/desktop/scripts/native-smoke/resource-observation.mjs:48–53`, `captureOwnedProcessTree`; termination at line 80.
- **Concrete trigger:** An unrelated surviving process retains a `ParentProcessId` belonging to its exited parent. Windows subsequently assigns that PID to this runner’s driver or another captured descendant.
- **Consequence:** Discovery treats the unrelated survivor as a descendant because it follows numeric `ParentProcessId` alone. It then records that survivor’s current creation time and executable. During cleanup, those newly recorded identities match, so `terminateOwnedProcesses` kills the unrelated process. The termination identity check cannot correct the mistaken ownership decision.
- **Supporting evidence:** The CIM snapshot retains only `ProcessId,ParentProcessId`; no creation-time relationship is checked before adding descendants. Microsoft explicitly documents that reused parent IDs can refer to unrelated processes and identifies creation dates as the discriminator. [Win32_Process documentation](https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-process). Existing real-tree/sentinel tests exercise ordinary ancestry but do not cover stale parent IDs or identity replacement between enumeration and handle acquisition.
- **Bounded correction criterion:** Establish parent-child provenance before granting ownership: retain creation identity in the enumeration, reject children predating the matched parent, and verify that the opened process still matches the enumerated identity. Uncertain identity must never authorize termination. Add deterministic stale-parent and enumeration-to-open identity-change regressions while retaining the real owned-tree cleanup and unrelated-sentinel controls. Keep this correction within the existing helper and tests.

Remaining uncertainty: The finding is established by source tracing and documented Windows semantics; this reviewer did not reproduce it or execute tests. No other acceptance gaps were identified.

Required next action: Correct finding 1, run the affected host-script checks and native cleanup smoke in normal local PowerShell, and submit a fresh immutable review dossier. Unaffected evidence may remain eligible with its existing input/environment proof. Preserve this R1 report unchanged.

This report grants no implementation acceptance, Validation Report status, or Git/publication permission.
