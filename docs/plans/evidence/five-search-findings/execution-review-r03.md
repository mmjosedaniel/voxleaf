# Change Review Report

Review ID: **FSF-EXEC-CR-R03-20261116**  
Task ID: **five-search-findings-minimal-corrections**  
Verdict: **CHANGES_REQUESTED**

Base commit and reviewed HEAD: `6130e2fed61f5d632e3f31c69775d1fa60c97373`  
Branch: `codex/revalidated-findings-execplan`

Reviewed paths and identities: Inherit the **entire closed 1,846-path set**, without delta, from `tmp/evidence/five-search-findings/execution-inputs-r03.json`, record `FSF-EXEC-INPUTS-R03-20261116`, SHA-256 `bd2a28221363eea1d70edcdca913e706472be5d4136a69afbd13256bc510c730`.

This binds all **72 candidate paths**, supporting inputs and both sides of the plan relocation, including the deleted original path. The complete tracked patch matches `tmp/evidence/five-search-findings/execution-r03.patch`, SHA-256 `6854e9844d9adea7da8bc6152314ca23b573d76e521d7d3c9a6865f5899dd1c0`. New files were inspected directly. This review evaluates the complete current candidate and does not inherit R02 approval.

Identity recheck: **PASS.** Before and after review, all 1,846 identities matched. Closed-set membership and candidate membership were exact, with no duplicate entries. HEAD and branch remained unchanged; the index remained empty. The tracked patch remained byte-equivalent. Both reserved outputs remained absent:

- `docs/plans/evidence/five-search-findings/execution-review-r03.md`
- `docs/plans/evidence/five-search-findings/execution-closeout-r03.md`

Acceptance review:

- The authorized successor decision is recorded in ADR-0076 and the updated plan. Distinct prospective raw versions and session namespaces prevent missing companion evidence from selecting historical derivation. Frozen profiles, schemas, corpora and measured results remain unchanged.
- **VF-0077:** The inspected execution path captures original settings, verifies the same scheme and four disabled indexes, and consumes its reservation before worker acquisition. Finalization compares observed restoration with the original settings. Completed data, auxiliary files and journal records are bound by digests. Pending raw remains false; prospective derivation receives verified restoration separately and publishes only after private-data deletion. Failed and unstarted sessions have a non-derivable restoration path. The preparation-input gap below remains actionable.
- **VF-0091:** The controller exposes admitted, dispatched and completed states. The queued trial includes a third undispatched occurrence and a non-invalidating release control. The completion trial reaches the actual identity gate with a valid concrete completion. Active trials use the owned child’s adapter-entry exchange; both-active waits for both parked entries before shared invalidation. The runtime joins the witness owner before further cancellation, preserving exclusive reception and termination ownership. The reader validates distinct proof shapes, identities, roles, timings and corresponding raw projections.
- The one-unit witness adaptation preserves the existing two-unit v14 route. Neither adapter entry nor metadata-only release observations are presented as model-entry or physical-playback evidence.
- The other fifteen corrections retain their inspected owners and distinguishing protections, including shared Auto direction, source-range preservation, busy Remove availability, release acknowledgements, safe cleanup, bounded output and cold-runtime primary-error reporting. No new regression was found in those paths.
- VF-0074 remains inconclusive without persistence edits. VF-0082 remains excluded under the sequential contract. Eligible explicit activation for VF-0080 remains available.
- Archival preparation is neutral and does not itself establish completion. Two bounded findings prevent acceptance of this candidate.

Test evidence reviewed:

These are **attributed coordinator executions in normal local PowerShell**, not tests executed by this reviewer. Exact commands, environments, results and input identities are retained in the named receipt bundles and indexed by `docs/plans/evidence/five-search-findings/execution-ledger.md`. Inspected receipt references matched their files.

| Evidence | Attribution and result |
|---|---|
| `cr3-red-01` | Both original discriminants failed before owner changes. |
| `cr3-focused-01` / `cr3-focused-02` | Failed selections and corrections remain retained. Their whole runs are not credited as PASS. |
| `cr3-safety-01` | **19 passed**, including finite real child processes and prospective session controls. |
| `cr3-final-python-01` | Sixteen selected files: **359 passed**; Python formatting, lint and types passed. |
| `cr3-followup-01` | **85 affected cases passed** after proof-validation and finalization-readback changes; all Python static checks passed again. |
| Python union | The renewed 85 cases plus the other **274 unchanged cases** form **359 distinct passing cases**. |
| `cr3-focused-02`, observation step | Native read-only power observation passed. This credits that step, not its failed pytest selection. |
| `cr3-docs-01` | TypeScript/JSON formatting, evidence retention and whitespace checks passed. |
| Earlier current-execution selections | Justified reuse: **539 EPUB**, **313 desktop**, **5 Chromium journeys**, and **112 Node tests with zero skips**. |
| `cr2-package-01` | Justified reuse of the unchanged final build, package check and lifecycle, including installation, first start, repair, uninstall scenarios and original-data restoration. |

Equivalence record `FSF-FOLLOWUP-EQUIVALENCE-R05-20261116`, SHA-256 `62170b94105586002e3f1e6b7ccb7e183c3ef4e6d9713ce41ca62522b457a9ac`, reconstructs without discrepancy. Independent current inventories matched:

- Node: **17,497 entries**, SHA-256 `95684ca7d1ee0984e687ecdc48a10748556caedab87014ea07987f4a3364f488`.
- Python: **3,253 entries**, SHA-256 `1d1045c7eccd0db9ff79190c1a2a54d4b23b5256137cadc445aa30d79e72de7c`.

The four new root command aliases leave every existing package value and script unchanged. Inspected Node consumers do not consume those aliases. New benchmark modules remain outside the packaged product runtime. The later Python differences affect the renewed finalization/proof paths; the retained neighboring selections do not invoke those changed paths. R04’s incorrect-family comparison is not used as acceptance evidence.

Windows tool identities and artifact hashes also matched:

- Installer: `cd004980395b7d4ab404c60c0210f340bbd66e384aa7624018df7e97dd2407ca`.
- Application binary: `1388714f370b5abf99b68632aa954b610fbf50b713a0beb0756bfbd80ac5a81f`.
- Package record: `03709be3881bfe89c21fddc18a0f7d9750963a64dd619040242b50937929d9e5`.
- Lifecycle receipt: `0b3e23b3613e21f6fe855f93c327f53aa85124eeb5fc9ff26b4cc4a0bc211905`.

Findings:

1. **P3 — Preparation accepts invalid official requests and retains unvalidated baseline values.**

   **Owner:** `services/tts/benchmarks/benchmark_safety.py:103`, `binding`; `benchmark_safety_cli.py:56`, preparation dispatch.

   **Concrete trigger:** Submit an otherwise correctly shaped official dual GPU-solo preparation request with `priorCpuSoloSummarySha256: "synthetic-not-a-digest"`. `binding()` validates field membership and selected identifiers but does not validate this value. It copies the string directly into `binding.cpuBaseline`, and `prepare()` persists the reservation and returns `prepared`. The later official command rejects the same request through `_optional_sha256()`.

   The preparation route also omits other static official-request checks, including opt-in and arm/prerequisite consistency.

   **Consequence:** Preparation acknowledges and reserves a session for a request that cannot execute. Arbitrary JSON/string content can enter fields documented as content-free digest bindings, including a mistakenly supplied private path. This occurs before the operator is instructed to change power settings. No worker-admission bypass or successful false result is demonstrated.

   **Supporting evidence:** `benchmark_safety_cli.main()` calls `safety.binding()` directly; it does not apply the official parser’s scalar and relational checks. `binding()` copies both baseline values without validation. Existing safety tests construct valid bindings and mutate later evidence; they do not distinguish malformed preparation input at this command boundary.

   **Bounded correction criterion:** Apply the applicable static official-request validation before native observation or reservation creation, including opt-in, scalar/hash shapes and arm/prerequisite relationships. Keep host/model preflight separate. Add command-boundary controls showing that malformed preparation requests fail without creating a reservation or retaining the supplied value, while valid preparation and subsequent execution remain compatible.

2. **P3 — Maintained testing guidance still declares the resolved successor decisions pending.**

   **Owner:** `docs/development/testing.md:49`.

   **Concrete trigger:** A maintainer follows the five-search testing guidance, which states that VF-0077/VF-0091 “remain pending successor evidence decisions.”

   **Consequence:** The maintained acceptance guidance contradicts ADR-0076, the authorized follow-up and the new workflow described later in the same document. It incorrectly identifies an outstanding decision rather than the actual current acceptance requirement.

   **Supporting evidence:** The current candidate records the decisions and implements their prospective contracts, while retaining the earlier pending-state sentence.

   **Bounded correction criterion:** Replace that stale status with the current prospective-contract and review boundary. Preserve the statement that historical positive fields are not renewed evidence. No behavioral test expansion is needed for this correction.

Remaining uncertainty:

- The malformed-preparation counterexample was established by source tracing, not executed during this read-only review.
- VF-0074’s original failing mounted delivery remains unproved.
- Native power observation was exercised without changing power policy; restoration comparisons use controlled observations.
- No GPU/model, acoustic, live-download, signing, Defender, clean-host or unrelated manual campaign is certified.
- The earlier WebView2 temporary-file race remains a recorded harness limitation.

Required next action: Preserve this report unchanged, reproduce and correct the preparation-input finding, update the stale guidance, renew affected host checks and request a new review with fresh immutable identities. Unaffected evidence may remain reusable with the corresponding proof. Do not declare this archived candidate accepted or refresh this report’s hashes.

No tests, edits, delegation or Git mutations were performed by this reviewer. This report is not a Validation Report or permission to commit, push or create a pull request.
