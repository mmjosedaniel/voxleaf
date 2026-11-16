# Correct the revalidated findings from five searches

## Goal

Resolve the 17 source-supported cases VF-0075–VF-0081, VF-0083–VF-0092 with the narrowed scope below, and determine whether VF-0074 has a supported mounted trigger before changing its behavior. Keep VF-0082 outside implementation because concurrent evaluator correction is excluded by the supported sequential workflow.

This is a cross-milestone correction plan, not a new product capability. User authorization on 2026-11-16 covers preparing this plan, its evidence assessment, a branch and a local commit. **Execution is not authorized yet.** No implementation, regression test, benchmark, package build or installer run belongs to this planning task.

## User-visible outcome

Explicit nested automatic direction renders correctly; prepared narration respects omitted marks and prose/code boundaries; Settings presents busy optional removal accurately. Maintainer release, recovery and benchmark tools report only observed success, keep bounded resources and preserve safe retry. These outcomes do not establish voice quality, physical audibility, live optional-package delivery or support for retained development engines.

## Current state

Planning base and source HEAD: `079c38ece8687b24859db4f64d4f92bba67bdcee`, initially on `main`; plan branch: `codex/revalidated-findings-execplan`. The index was empty. Nine modified/untracked findings documents from the same chat were present; preserve and commit those supporting audit records with the plan, without rewriting historical conclusions.

The [deep assessment](../../development/findings/audits/2026-11-16-deep-findings-validation.md) supersedes the interpretation, not the bytes, of the [five searches and reconciliation](../../development/findings/audits/README.md). It inspected all 18 original subagent reports. The [registry](../../development/findings/registry.md) retains original dispositions and dated reassessments. Sixteen original cases and new VF-0092 have static support; none was reproduced by this audit. VF-0074 remains inconclusive at the product boundary, VF-0082 is not confirmed within the supported contract, and VF-0080 is P3 presentation only. VF-0076 and VF-0085 are the two supported P2 cases.

The following table binds each trigger to its owner, history and bounded correction. Detailed source links and counterevidence remain in the deep assessment and [reconciliation](../../development/findings/audits/2026-11-16-findings-reconciliation.md).

| ID / unit | Current trigger, owner and prior coverage | Correction and discriminating acceptance |
| --- | --- | --- |
| VF-0074 / U0 | After heard playback and Stop, `reader-position-save-coordinator.ts` accepts a different unmarked passive sample; actual arrival through tracker → App is unproved. U3/5.1, reflow and settled-placement guards remain effective for their original cases. | First obtain a mounted source-to-sink witness, exact reopen and a genuine manual successor. If absent, retain inconclusive status and make no speculative persistence change. If present, protect the heard checkpoint without blocking deliberate manual movement, ordinary reading or no-audio attempts. |
| VF-0075 / U1 | `xhtml-projector.ts` plus `SemanticDocument.tsx` loses an explicit nested Auto declaration when its token equals inherited Auto. VF-0064 covered implicit paragraph direction, not declaration provenance. | Preserve explicit versus inherited Auto at the existing safe-semantic boundary. Assert computed child direction for English outer/Hebrew inner content, inherited siblings and fixed LTR/RTL. Preserve locator order, offsets, implicit paragraphs and reopen. Do not force Auto on every node. |
| VF-0076 / U3 | The retry and reinstall paths in `ordinary-chatterbox-release-host.mjs` swallow Download rejection and admit Installed before terminal cleanup. B06/B07 deliberately retain Installed after native commit. | Own and join each attempt's terminal acknowledgement before success evidence; keep snapshots for progress only. Inject Installed then terminal failure, delayed success and successful retry. Receipt, cleanup and next action must reflect the same attempt; no unhandled rejection or extra download. |
| VF-0077 / U4 | `batch_official.py` writes `sleepSettingRestored: true` without evidence, and `batch_result.py` trusts it. Earlier v4/v14 resource cleanup does not prove operator restoration. | Replace the unconditional positive with a prospective, explicit observation/confirmation boundary tied to original and final power settings. Missing, failed or mismatched evidence cannot pass cleanup. Preserve fixed historical results and existing output consumers. Do not automatically change power policy; document the operator step before accepting a new run. |
| VF-0078 / U1 | A supported Spanish article, ordinary space, omitted mark and time bypass the combined matcher in `narration-bilingual-normalizer.ts`, producing a second article. VF-0061 and BNC-02 covered neighboring separators/lookaround. | Treat only already-admitted omitted marks consistently within the bounded article gap. Preserve typed omissions, source offsets, protected expansion and code/language barriers. Both Piper and Chatterbox public preparation must produce one article. |
| VF-0079 / U3 | `windows-release.mjs` compares the NSIS language map using serialized key order. Earlier VF-0015 fixed a different receipt record comparison. | Compare exact key/value membership independently of object order. Reordered map passes; missing/extra/changed keys fail. Keep ordered fallback-language arrays and raw attachment digest checks unchanged. |
| VF-0080 / U2 | After Settings remounts during post-commit cleanup, `OptionalChatterboxControls.tsx` offers Remove although `narration-settings-actions.ts` rejects it before Stop/deletion, with incorrect Stop-and-retry guidance. | Use persistent acquisition ownership for Remove availability and truthful busy feedback. Verify remount, both completion orders, cleanup failure and successful next Remove. Preserve explicit eligible activation: verified Installed discovery is not shown unsafe. No new activation prohibition. |
| VF-0081 / U3 | The ordinary cancellation journey catches non-ENOENT staging lookup errors as absence. The bounded path already uses strict absence checks. | Reuse the strict absence predicate. ENOENT passes; EACCES/I/O/unknown state fail before retry can erase evidence. Existing leaf residue also fails; preserve cancellation/containment ownership and cleanup. |
| VF-0082 / excluded | Two simultaneous `quality.py` corrections can overwrite each other, but CFR U7 explicitly supports sequential ownership. Its invalidation/freshness fix remains valid. | No lock, transactional publication or concurrency feature. Retain the documented disposition and existing sequential retry controls. Reopen only with a separately approved concurrency requirement. |
| VF-0083 / U4 | `quality_cli.py` accumulates stdout/stderr using `capture_output=True` before its stdout limit. Five-pass U9 bounded a different launcher; nonzero exit is already rejected here. | Bound binary stdout while reading, discard unnecessary stderr, preserve the absolute deadline and explicitly reap owned processes. Finite noisy child, overflow, exact boundary, nonzero exit, invalid encoding/JSON, timeout and inherited-pipe controls must remain bounded and content-free. |
| VF-0084 / U1 | An omitted mark resets the English predecessor summary, allowing `Baker St.` to expand before uppercase continuation. H6/RAC/SAF covered plain title and numeric contexts. | Omitted marks must not erase logical predecessor provenance. Preserve ambiguous abbreviation and period; retain accepted titles, language/code barriers and bounded continuation reconstruction. Same-mark variants stay under this ID. |
| VF-0085 / U3 | `test-windows-package-lifecycle.ps1` marks uninstall attempted before the journal rehashes an unreadable source installer, preventing owned cleanup. H13/U15 and DCR-05 covered containment/readable drift. | Journal the entry installer identity without depending on a fresh source read to launch the owned uninstaller. Keep final fresh identity checks, primary failure, bounded containment, backup preservation and restore-after-uninstall ordering. Inject unreadable source before cleanup; no retry of an uncertain live uninstall. |
| VF-0086 / U4 | `customvoice_screen.py` creates the exclusive session, then staging outside rollback; staging failure strands the session. VF-0042 covered later finalization. | Empty-only rollback of a newly owned session after staging setup failure in v2/v3. Same-ID retry succeeds after clearing the fault. Preserve existing, competing, redirected and cross-version entries; failed rollback retains explicit recovery. Inspect adjacent setup calls before widening the cleanup interval. |
| VF-0087 / U3 | Optional-data reporting in `nsis-hooks.nsh` checks missing descendants without validating unsafe existing ancestors. LCF-03 covered leaf junctions and ancestor error 5. | Validate ancestry before crediting absence, sharing the existing safety model without following a reparse point. Compiled Windows fixture must show unsafe intermediate + missing leaf returns non-success and leaves outside sentinels intact. Ordinary absence, removal, locked data, update and preferences remain controls. |
| VF-0088 / U3 | `optional-download-probe.mjs` accepts any diagnostic after its barrier, including a response failure before file creation. Historical create-file evidence was genuine. | Require the intended diagnostic stage/type and barrier identity before crediting this probe. Response-stage and unrelated errors fail; matching capture, exact export and post-Cancel retention pass. Do not narrow the generic diagnostic export contract. |
| VF-0089 / U4 | `dual_worker_cli.py` binds GPU baseline identity/digest without all v5 duration/count/cancellation/audit gates. Historical 446.24-second baseline qualified manually. | Require the frozen baseline success criteria before either official or diagnostic concurrent worker construction. Insufficient duration/count, failed trials/audits and mismatched identity fail; exactly eligible baseline passes. Preserve existing CPU progression and the historical resource-limit conclusion. |
| VF-0090 / U4 | Solo cold runtime load can fail before the object becomes finalizer-owned in `dual_worker_cli.py`. A destructor is only best effort. | Acquire explicit ownership before loading; failed initial/final cold loads close once and preserve the primary error plus safe cleanup failure. Keep pilot/concurrent ownership and successful early-close behavior. Do not claim an observed orphan. |
| VF-0091 / U4 | Queued and complete-before-release trials share a hook; concurrent active labels also lack distinct phase witnesses. EFC-02 separately proves a pending future, not these official trials. | Define the exact queue/worker phase under the existing v5 authority before implementation. Use bounded deterministic barriers and observed dispatch/entry/completion/release events for distinct trials; unwitnessed phases cannot pass. Preserve stale rejection and deadlines. If the frozen result contract cannot represent the needed evidence, stop this case for a prospective contract decision rather than rewriting history or relabeling duplicate evidence. |
| VF-0092 / U1 | English title lookahead skips inline-code whitespace, e.g. `St.<code> </code>James`. The right-side predicate dates to H6 and differs from VF-0084's left context. | Every skipped gap token must be same-language prose. Preserve the abbreviation across code/foreign boundaries, accepted plain titles and exact source endpoints. Exercise both public profiles, warm/cold continuation and window edges without widening lookahead. |

## Scope and non-goals

Implement only these bounded owners after execution authorization. Extend existing meaningful tests and use existing fixtures; do not create one suite, full baseline or hardware run per finding. Read the current owner/callers again if HEAD changes before execution.

Preserve frozen M005, legacy normalization, benchmark profiles/corpora, historical summaries, completed plans, model/package versions, public playback rules and the sequential quality workflow. New diagnostic evidence must remain content-free. Do not change native optional activation policy to fix VF-0080, infer a reader failure from a sink-only VF-0074 test, or turn VF-0091 into a general scheduler redesign.

The only semantic-model extension anticipated is the minimum declaration provenance needed for VF-0075; audit the complete model/projector/renderer callers if required. No new dependency, external service, automatic recovery policy or wire/persistence schema is planned. Any additional public-contract change needs an explicit plan decision, affected consumer coverage and independent review before implementation.

## Relevant files and documentation

- [MVP privacy/playback](../../product/mvp.md#playback), [overview](../../architecture/overview.md#component-boundaries), [system diagram](../../architecture/system-diagram.md#component-and-trust-boundary-map), [synchronization authority](../../architecture/synchronization-authority-v1.md), [ADR-0067](../../architecture/decisions/ADR-0067-conservative-english-titles-and-unicode-marks.md).
- [M005 terminology/boundary](../completed/M005-narration-text-preparation.md#definitions-and-terminology), [roadmap](../roadmap.md), [narration boundary corrections](../completed/narration-boundary-navigation-corrections.md), [four-pass corrections](../completed/four-pass-findings-corrections.md).
- [Findings workflow](../../development/findings/README.md), [testing](../../development/testing.md), [evidence retention](../../development/evidence-retention.md), [independent review](../../development/agentic-change-review.md), [plan rules](../../../.agents/PLANS.md).
- U0/U2: `apps/desktop/src/{App.tsx,persistence,reader,settings,tts}`; inspect the bridge, tracker, save coordinator, optional client, mounted controls and shared actions.
- U1: `packages/epub/src/document/{document-model.ts,xhtml-projector.ts}`, `packages/epub/src/narration/{narration-source-projector.ts,narration-bilingual-normalizer.ts}`, `apps/desktop/src/reader/SemanticDocument.tsx`.
- U3: `apps/desktop/scripts/{ordinary-chatterbox-release-host.mjs,optional-download-probe.mjs,windows-release.mjs}`, `scripts/test-windows-package-lifecycle.ps1`, `apps/desktop/src-tauri/windows/nsis-hooks.nsh`; native `tts_optional_chatterbox.rs` is an unchanged contract consumer unless new evidence requires a separately recorded scope change.
- U4: `services/tts/benchmarks/{batch_official.py,batch_result.py,batch_cli.py,quality_cli.py,customvoice_screen.py,dual_worker_cli.py,dual_worker_controller.py,dual_worker_runtime.py}` and their current test consumers. These retained benchmark tools do not expand supported product engines.

## Architecture and constraints

Book bytes and derived text stay local; generated product audio remains memory-only. UI presentation must not become acquisition or persistence authority. Cancellation and stale identity rejection remain immediate; cleanup retains ownership until containment is verified. Preserve queue/output bounds, absolute deadlines, synthetic-only fixtures and exact source ranges. A skipped or unknown cleanup observation must never become success.

Direction provenance stays in the sanitized EPUB model, with no publisher HTML/CSS passthrough. Narration corrections operate only in mutable profiles and preserve code, language, typed omissions, work limits and cancellation. Prepared-text correctness is not an acoustic acceptance claim.

Installer faults run only against owned disposable roots, with original application/profile state protected and outside sentinels verified. Any uncertain process containment prevents restoration and retains the backup. Prospective benchmark fixes do not retroactively change historical measured outcomes.

Review the canonical diagram and overview at closeout. Update them only if the implemented boundary actually changes; current scope preserves component/process topology.

## Milestones

1. **M0 — Freeze execution intake and qualify U0. Not started.** Confirm future authorization, HEAD, clean task paths and closed input manifests. Read the [reuse assessment](../evidence/five-search-findings/test-evidence-reuse.md). Reuse existing baseline records as historical controls; run only new discriminating cases before each owner's edits. For VF-0074, stop at inconclusive if a bounded mounted witness cannot establish arrival. Do not invent a test that calls the sink with an impossible sample.
2. **M1 — U1 narration and direction; U2 Settings. Not started.** Group the three normalizer predicates in one bounded patch and common public-input matrix. Preserve explicit direction provenance and all consumers. Narrow Remove presentation as specified. Run final G-EPUB, G-DESKTOP and G-BROWSER once after their shared inputs settle; defer duplicate integration runs until then.
3. **M2 — U3 release and cleanup. Not started.** Correct terminal acknowledgement, strict absence, record comparison, journal identity and probe attribution. Extend the compiled NSIS fixture for ancestor safety. Run G-NODE once for final U3 inputs; acquire one final unsigned package and its existing lifecycle gate after frontend/hook inputs settle.
4. **M3 — U4 retained tooling. Not started.** Correct truthful restoration evidence, bounded capture, setup rollback, prerequisite qualification, explicit runtime ownership and distinct cancellation witnesses. Resolve VF-0077's operator observation boundary and VF-0091's phase semantics before writing success assertions. Run one final Python union with existing synthetic adapters; no GPU/model execution.
5. **M4 — Combined closeout. Not started.** Complete relevant static checks once for the final input set, compare reuse candidates, record original trigger + adjacent protection + next user action for every implemented ID, update registry and guidance, and obtain an exact-patch independent review. Move this plan only after implementation and required acceptance finish. Future Git actions require their own authorization; this planning commit does not authorize implementation commits or push.

## Testing and benchmark strategy

### Minimum sufficient execution policy

The [evidence assessment](../evidence/five-search-findings/test-evidence-reuse.md) records inspected historical receipts and the precise limits of recycling them. Reuse test design, synthetic fixtures and verified immutable inputs. An old passing result cannot close any of the newly uncovered assertions or survive a change to its consumed owner/test/runner.

Run all checks in normal local PowerShell outside the managed sandbox. Capture command, cwd, exit, selected test names/counts, tool/dependency/environment identities and before/after consumed inputs under ignored `tmp/evidence/five-search-findings/`. Use a single focused RED selection per cohesive unit on original owners, then one final combined GREEN per affected family. Retain failed attempts. A corrected fixture invalidates its prior result, not unrelated gates. Never rerun a passing unchanged gate merely for a new review or documentation update.

Use these existing configured tools and files; inspect current configuration before execution if it drifted. Planned new regression names use `FSF-` (TS/Node/browser) or `fsf_` (Python), allowing the same commands to select new assertions. Add cases inside the listed suites, not placeholder passing tests.

| Gate | Required scope and minimum controls | Decision |
| --- | --- | --- |
| G-EPUB | VF-0075/78/84/92; public synthetic EPUBs in both current profiles, exact ranges, fixed/implicit direction, omission variants, code/language barriers, warm/cold + one/many batches, current resource/cancellation controls | RUN after final U1; old 574/655-pass results do not cover changed predicates |
| G-DESKTOP | Direction renderer + locator consumer and remounted busy Remove, no unintended Stop/select, later successful action; retained VF-0058 and implicit-direction controls | RUN once; include U0 persistence/tracker/bridge consumers only if its witness leads to a fix |
| G-BROWSER | New computed-direction and same-byte reopen case plus existing VF-0064; U0 requires a separate mounted tracker → App → save → reopen witness and manual successor if promoted | RUN selected cases only; no full browser suite |
| G-NODE | VF-0076/79/81/85/87/88 in ordinary/release/barrier fixtures; both download phases, no-spawn/uncertain containment, final installer drift, actual compiled NSIS ancestor/sentinel behavior | RUN combined current files; zero skipped Windows/NSIS prerequisites in the required scope |
| G-PY | VF-0077/83/86/89/90/91; frozen eligibility edges, operator observation absence, capped pipes, safe retry, owned close and witnessed phase distinction | RUN one synthetic union; no inference/benchmark matrices |
| G-STATIC | Affected JS/TS and Python formatting/lint/types; EPUB/shared exports before consumer checks | RUN once after changes; Rust checks only if Rust inputs/contracts become affected |
| G-PACKAGE | Final unsigned canonical NSIS build/check and existing lifecycle, including actual owned uninstall/restoration | RUN once because NSIS hooks and lifecycle owner change; use verified existing core/model inputs and avoid a separate default-feature build |
| G-REVIEW | Current patch, per-ID trigger/controls, actual host results and bounded reuse decisions | Required independent `change_reviewer`; no tests or delegation by reviewer |

Concrete final family commands (not executed during planning):

```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts src/document/document-model.test.ts src/public/open-epub-publication.test.ts src/narration/narration-normalizer.test.ts src/narration/narration-source-window.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/SemanticDocument.test.tsx src/reader/semantic-dom-range-mapper.test.tsx src/reader/ReaderPublication.test.tsx src/tts/OptionalChatterboxControls.test.tsx src/tts/optional-chatterbox-client.test.ts src/settings/narration-settings-actions.test.ts src/App.test.tsx
pnpm.cmd --% --filter @voxleaf/desktop test:browser reader-reflow-restoration.smoke.spec.ts --grep "FSF-|VF-0064"
node --test apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs apps/desktop/scripts/acquisition-file-barrier.node-test.mjs
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_batch_cli.py services/tts/tests/test_benchmark_batch_official.py services/tts/tests/test_benchmark_v14_authority.py services/tts/tests/test_benchmark_quality.py services/tts/tests/test_customvoice_screen.py services/tts/tests/test_customvoice_screen_authority.py services/tts/tests/test_benchmark_dual_worker_cli.py services/tts/tests/test_benchmark_dual_worker.py services/tts/tests/test_benchmark_dual_worker_runtime.py services/tts/tests/test_benchmark_dual_worker_result_cli.py
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
pnpm.cmd package:windows:verified-core
pnpm.cmd package:windows:check
pnpm.cmd package:windows:lifecycle
```

For focused RED, use the applicable same file subset with Vitest `-t FSF-`, Node `--test-name-pattern=FSF-`, or pytest `-k fsf_` before its production edit; confirm selected names, not just exit status. Use existing finite fault seams so no real installer/model run is required for RED.

If U0 is promoted, add `src/reader/active-visual-locator.test.ts`, `src/persistence/reader-position-save-coordinator.test.ts` and `src/persistence/narration-position-save-bridge.test.ts` to the final desktop union. Put its mounted browser witness in the selected reflow suite and extend that single browser selection with `R7-04`. Keep ordinary manual reading, no-audio attempt, natural completion, Stop and reflow distinct. Failure to establish reachability does not justify those source edits.

The existing package wrapper includes core integrity verification; do not duplicate it as an extra acceptance command. If cached core bytes fail that prerequisite, use its documented regeneration route and record why the package gate expanded. A changed NSIS artifact cannot reuse an earlier installed PASS. Lifecycle preflight must respect a pre-existing real installation; use an authorized disposable host/context or report blocked, never remove it to make the test pass.

No root `check`, `check:portable`, full repository test baseline, complete browser matrix, GPU/acoustic rerun, real optional download, optional v7 local-admission replay or signing/scanning/publication is selected by this scope. These are omitted because their affected behavior is outside the correction, not because an old PASS certifies new code. Add a gate only for a demonstrated new dependency, changed boundary or unresolved failure, and record its reason before execution.

## Risks and rollback

- Direction provenance can affect all safe-model callers. Keep the representation minimal and verify inherited inline/block behavior; reject uncontrolled publisher attributes.
- Normalizer changes can alter source spans, terminal periods or streaming context. Keep bounds and typed omissions; roll back the cohesive U1 correction if its public matrix fails.
- Holding Download promises must not deadlock cancellation or orphan rejection. Retain attempt identity and finite terminal waits.
- Installer correction must not bypass ownership or restore while a child survives. On uncertain containment, keep original backups and explicit recovery; never “repair” by deleting host data.
- Python output bounds must not introduce pipe deadlock or unbounded descendants. Use finite child fixtures, deadline-bound reaping and content-free failure.
- New benchmark evidence cannot be retrofitted onto old results. Keep historical profiles/results immutable; if a needed evidence field changes a public contract, obtain the scoped decision first.
- Roll back only task-owned unaccepted changes with an explicit path review. Do not reset the workspace, rewrite completed plans or discard another contributor's work.

## Progress log

- 2026-11-16: Read the deep assessment and prior plan/evidence sources; inspected current command configuration and relevant test owners. No behavioral checks executed.
- 2026-11-16: Verified integrity of four retained #321 receipt bundles and sampled 13 current owner identities; all sampled bytes match. This is historical input inspection, not full environment equivalence or acceptance of future edits. See the reuse assessment.
- 2026-11-16: Created `codex/revalidated-findings-execplan` from the stated source HEAD. Prepared this plan and its active index entry; supporting audit documents remain unchanged.
- All implementation milestones remain **Not started**. The next implementation task must receive authorization to execute.

## Discoveries and decisions

- The corrected scope has 17 implementation candidates, one conditional investigation and one unsupported-concurrency exclusion. Keep original IDs; do not reopen the broad VF-0080 activation claim.
- The previous broad test results genuinely exist and their inspected receipt parts are intact. They missed distinct predicates or phase assertions. Reuse their fixtures and neighboring expectations, then run a narrow new regression rather than repeat the entire old campaign.
- The most expensive model/live-download results do not answer these new triggers. No current runtime PASS is imported simply from a completed ExecPlan.
- Planning-only verification may run the existing evidence/privacy guard and Git whitespace inspection outside the sandbox. It does not execute any milestone or product test.

## Final validation results

**Implementation: NOT EXECUTED.** No findings are marked resolved by this plan.

Planning review and document-check outcomes are owned by the reserved [FSF-PLAN-CR-R01-20261116 report](../evidence/five-search-findings/plan-review-r01.md) and [planning closeout](../evidence/five-search-findings/plan-closeout.md). These neutral links do not imply approval before those records exist.

During execution, replace this section's implementation status only with actual per-ID owner/test/assertion/host-evidence/review/resolution links. Record evidence reuse separately from runs, unresolved gates and verified restoration. Update the findings registry without rewriting older assessments; VF-0074 and VF-0082 may close with an evidence-backed no-fix disposition rather than an invented implementation.

