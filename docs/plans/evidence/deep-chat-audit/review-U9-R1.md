# Change Review Report

Review ID: **DCR-U9-R1-ASTRA-20261109-01**
Task ID: **U9 / DCR-11 (two JS callers) / DCR-12**
Verdict: **APPROVE**
Acceptance boundary: **Local unit review only**

Base commit and reviewed HEAD: both `d375ecc84261c404e855c055e0ecc8949a97caaf`.

Reviewed paths and identities: the complete 11-row `Closed reviewed inputs` table in `docs/plans/evidence/deep-chat-audit/u9-dcr-11-12-execution.md`, receipt **DCR-U9-EXEC-20261109-01**, is incorporated by reference at document SHA-256 `e6e78f18cb4ff2def861fcb0fff31da67a8e010599c794e7724e5b8db6e89258`. Preserve those bytes with this report. The first four rows are the U9 patch: both host modules, the new `effective-firewall-block.mjs` helper, and `tts-adapter-layout-host.node-test.mjs`. Other rows are unchanged supporting tests, Python policy and configuration. Other unit patches and plan/index edits are excluded.

Identity recheck: **PASS.** Base/HEAD, all 11 path statuses, SHA-256 values and filter-aware blobs matched before/after inspection and the GREEN snapshot. The staged index remained empty. Supplied RED and GREEN before/after snapshots are respectively identical. The saved tracked diff equals the current three-path tracked diff; the new helper was inspected in full.

Acceptance review:

- **DCR-11: locally approved for both JS callers.** The shared query matches the current Python effective-policy contract: exact enabled Domain/Private/Public profiles from ActiveStore, running firewall service, one healthy enabled outbound Any-profile block for the exact target application, and one unrestricted address, port/protocol, service, interface and interface-type filter. Query failures cannot become successful admission. Both callers execute this helper through their existing bounded PowerShell wrappers. The synthetic fixtures run the actual PowerShell predicate without changing host firewall rules.
- **DCR-12: locally approved.** Successful shutdown requires the stopped control record, child `close` with code zero and no signal, and clean stdout EOF. Parser errors remain sticky; partial bytes and additional queued frames reject success. The cleanup wait timer is cleared. The malformed-input path can still consume queued `protocolRejected` after EOF/nonzero exit. Existing frame-size, buffer, queue and owner-cleanup bounds remain unchanged.
- RED evidence used unchanged production plus a preserved test-only export/extraction harness. The shutdown decision was extracted from its original source with only a shorter timeout; the GREEN tests invoke the actual exported production function. Existing assertions were not weakened. No model evaluation, installer operation, host firewall mutation or new public runtime contract is claimed.

Test evidence reviewed: supplied normal local PowerShell results in `tmp/evidence/deep-chat-audit/U9/`, attributed to **DCR-U9-EXEC-20261109-01**. The reviewer executed no tests or formatters.

1. RED: `node --test '--test-name-pattern=DCR-1[12]' apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs` — exit 1; 9 passed and 32 failed, including two enclosing failed test nodes. Canonical-policy and clean-shutdown controls passed; invalid policy/tail controls exposed the intended failures.
2. GREEN: `node --test apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs` — exit 0; 74 passed, zero failed/skipped/cancelled. Recorded interval: 2026-11-09 20:16:41.7814364–20:16:56.1340873 UTC. This includes real PowerShell execution for both callers and disposable real Node children for clean/malformed/partial/extra shutdown output.
3. Supplied scoped formatting and ESLint results passed on the four owned files. They do not replace final G7. No historical PASS was reused.

Recorded environment: Windows NT 10.0.26200.0, PowerShell 7.6.9, Node v24.20.0; pinned pnpm 11.15.1 through offline Corepack for scoped static checks. The Windows PowerShell executable identity is retained in the private receipt.

Findings: **none**.

Remaining uncertainty: DCR-11's Python handoff caller belongs to U10 and remains outside this approval. Final G4/G7 integration and final exact-patch review remain pending. These model-free checks do not re-certify benchmark or hardware results.

Required next action: No U9 correction required. Complete U10 and applicable integration gates before closing DCR-11 overall. This report is not a Validation Report and grants no Git authorization.
