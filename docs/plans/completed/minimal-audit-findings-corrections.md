# Minimal corrections for the eleven revalidated audit findings

## Goal

Correct all eleven findings retained from the static review of 2026-10-29 with
the smallest justified changes. Reproduce each cause before its correction,
reuse existing fixtures and verified artifacts, and run the smallest sufficient
set of current checks. This is a cross-milestone correction plan, not a refactor
or a new product milestone.

**Status: implemented, host-validated and archived under M4.** Implementation
review [MAF-R1-20261029](../evidence/minimal-audit-findings-corrections/review-R1.md)
is APPROVE. The separate `MAF-R2-20261029` report in the
[review evidence](../evidence/minimal-audit-findings-corrections/)
records the authoritative final documentary verdict and identity recheck.
The 2026-10-29 execution instruction
authorizes all eleven corrections and the plan's necessary host validation and
generation, superseding the earlier planning-only restriction. It does not
authorize commit, push, PR, merge, publication, installation, downloads, tool
updates or changes to personal state. See the
[execution ledger](../evidence/minimal-audit-findings-corrections/execution-ledger.md).

Planning base: `cdeb3630bca3a61126a83cb261e5d341d33277e0`, initially clean `main`.
Plan branch: `codex/minimal-audit-findings-corrections`.
Execution started at the exact plan commit
`2f6a80b7b19be6cc62b7706bd85e9be96a1a2b8e`, with clean worktree and empty index.
HEAD remains unchanged; implementation and documentation are uncommitted.
The planning base is not a fabricated test baseline.

## User-visible outcome

- Restoring a valid passage around an image, line break or empty structural
  block uses meaningful geometry instead of an empty rectangle at the origin.
- English narration preserves numeric tokens adjacent to combining marks and
  retains their exact source locations.
- Switching from completed Prepared playback to Quick produces consistent
  preferences and playback state without an artificial playback failure.
- Chatterbox removal excludes a concurrent restart. Selecting an already active
  healthy Chatterbox profile does not falsely report incompatibility because
  that same model occupies memory.
- Maintainer tools preserve cleanup ownership, reject incomplete RAM samples,
  accept valid updated GPU counters and label partial v12 results correctly.
- Malformed direct Python protocol text receives the existing typed rejection
  and service cleanup instead of escaping as an encoding exception.

## Current state

The chat contained eleven distinct findings, including both passes called
"fourth". The follow-up independently inspected all eleven against the same
base. Nine have a concrete static defect; F2 and F4 retain conditional host or
interleaving effects. No audit test, build, model, application or reproduction
was run. Static evidence is not current runtime acceptance.

Completed SAF, RAC and VCA work already provides useful runners, synthetic
fixtures and original receipts. They are historical evidence, not proof of the
new cases. In particular, SAF fixed cooperative cleanup in the portfolio wrapper,
but `reader-corrections-host.mjs` still uses a separate synchronous timeout.
The latest observer correction is covered by SAF R2's replacement Node/N1
receipts, not by its earlier aggregate alone.

M005 remains complete at the bounded preparation boundary. The canonical diagram
still describes the intended owners; no topology change is proposed. Current
Chatterbox v7 uses immutable frozen v3 service modules. F3 concerns the mutable
Python consumer, not a demonstrated desktop route or permission to rewrite v7.

## Scope and non-goals

### Complete finding ledger

MAF numbers below map one-to-one to the chat's F1-F11. Every row remains in scope.
For a conditional finding, M1 must establish the stated fault/interleaving. If
that cannot be established, retain the row as BLOCKED with counterevidence and
revise the plan explicitly; do not silently omit it or implement a speculative
rewrite. The already-refuted v9/v11 extension of F6 is excluded.

| ID | Evidence and trigger at the planning base | Minimum correction and acceptance boundary |
| --- | --- | --- |
| MAF-01 / F1 / P2 | `apps/desktop/scripts/reader-corrections-host.mjs:27` kills the runner at the same 30-minute deadline that the runner uses to begin cooperative cancellation. The next arm can start without confirmed cleanup. | Reuse the existing bounded cooperative arm/cleanup mechanism in `bilingual-portfolio-host.mjs` where practical. Preserve the four reader-correction arms/arguments, await cleanup acknowledgement and terminal exit, and stop the sequence on uncertain cleanup. Increasing the timeout alone is insufficient. Reproduce with a short injected deadline and benign children, not a 30-minute model run. No claim of permanent orphaning. |
| MAF-02 / F2 / P2 conditional | `apps/desktop/scripts/native-smoke/resource-observation.mjs:236` can continue after nonterminating CIM failure and accept a positive root-only RAM sum. | Make failed/incomplete enumeration or unreadable still-live owned processes fail the observation rather than become valid zero/partial data. Preserve existing PID/creation-identity safeguards and allow a verified exited child to disappear legitimately. Exercise the actual generated PowerShell with controlled CIM/Get-Process faults, not only a mocked final number. Do not convert this into a general process-observer redesign. |
| MAF-03 / F3 / P3 | `services/tts/src/voxleaf_tts/protocol.py:280` encodes schema-admitted lone-surrogate text; `service.py` does not catch the resulting `UnicodeEncodeError`. | Reject malformed text through the existing `ProtocolFailure` boundary and existing cleanup/rejection flow. Preserve valid astral characters, byte bounds and content-free diagnostics. Do not broadly catch unrelated programming failures. Scope is direct mutable Python service input; native JSON rejects this input before the ordinary UI route. |
| MAF-04 / F4 / P2 conditional | `narration-settings-actions.ts:67-69` refreshes availability only after removal. Native stop/removal and configuration/spawn do not share one exclusion interval. | Contain Play during the asynchronous configuration/removal action and close the native admission/spawn-versus-removal gap using existing owners. Trace lock order before editing: `force_stop` deliberately interrupts without waiting for the ordinary operation lock. A stale verified runtime must not spawn after removal begins; failed termination must prevent deletion. Test the real permitted ordering with barriers, not sleeps. Preserve cancellation and unrelated process ownership; do not merely disable dialog Close. No corruption or permanent-orphan claim. |
| MAF-05 / F5 / P2 | `services/tts/benchmarks/service_handoff_cli.py:317-353` acquires the host before sampler/thread setup enters `try/finally`. | Establish cleanup ownership immediately after successful spawn, include partial initialization failures, and verify bounded termination/wait before returning failure. Preserve the original classified failure and report cleanup failure separately. Test constructor failure with an identified benign child; do not load a model to reproduce a setup failure. |
| MAF-06 / F6 / P3 | v12's full harness skips failed cancellation observations, but `corrective_v12.py:289` assigns language by compacted index. | Carry the actual trial language/identity through the existing internal observation path and serialize the correct language. Preserve schema, trial IDs, incomplete/failure gates and historical results. One failed ES trial followed by successful EN trials must keep EN labels. v9/v11 screen loops stop at the first failure and are not defective on this evidence; do not edit them. This finding does not establish a false overall PASS. |
| MAF-07 / F7 / P2 | `reader-reflow-restoration.ts:103` accepts all-zero fallback geometry from a range with no client rectangles and skips block fallback. | Treat absent range geometry as unavailable and use the existing block fallback. Keep valid zero-width text carets with meaningful geometry. Prefer a change in geometry acceptance; change the semantic mapper only if a reproduced case requires it. Preserve locator identity and manual/passive navigation policy. |
| MAF-08 / F8 / P2 | `narration-bilingual-normalizer.ts:351` treats a combining mark as a lexical boundary: English `cafe\u03018` can expand its digit while `café8` is preserved. | Extend only the necessary lexical-boundary protection using existing Unicode mark semantics. Preserve `8\u0301`, decomposed/composed tokens, source spans, continuation and normal accepted expansions. No NFC rewrite, new tokenizer, grapheme framework, broader language policy, dependency or change to frozen v1 normalization. |
| MAF-09 / F9 / P2 | `services/tts/benchmarks/memory.py:219` discards `FmtValue.CStatus=1` (`PDH_CSTATUS_NEW_DATA`), which is valid updated counter data. | Accept both valid data statuses while retaining invalid-status/value rejection and sampling bounds. Update the existing test that incorrectly expects status 1 to be discarded. Cover mixed adapter instances and missing/invalid samples at the consumer boundary. RAM is unaffected; some VRAM failures are already rejected or mitigated by the PyTorch maximum. Do not claim prior host measurements or historical PASSes were proven wrong. |
| MAF-10 / F10 / P3 | Packaged profile radio reselection calls `optional.select()` before stopping the loaded model; native repeats fresh-start free-VRAM admission and the renderer can show `failed/incompatible`. | Make same-profile healthy loaded reselection idempotent or route it through existing valid-owner continuation, without weakening fresh-start, changed-profile, recovery or download gates. Preserve unavailable/failed-owner handling and explicit recheck semantics. Test the selected radio with prior admitted facts and reduced free memory. Audio/package corruption is not alleged. |
| MAF-11 / F11 / P2 | After natural completion, `product-narration-coordinator.ts:608` changes selection but retains the old scheduler mode/target. Prepared 120000 -> Quick violates `adaptive-preparation.ts:327`. | Release/reconcile completed mode-dependent state before publishing the new consistent selection. Preserve the final heard checkpoint, preference failure handling and explicit restart; do not auto-play. Exercise completed 2/5/10-minute selections with a short end-of-source tail, including subsequent ticks and Play. Keep the one-minute control, which can mask the defect. |

No refactor campaign, new dependencies, public schema/protocol amendment,
hardware-threshold change, model/runtime upgrade, new release identity, DSP/rate
algorithm change, blanket normalization change or historical evidence rewrite.
Do not mutate completed ExecPlans, frozen evaluation authority, published v7,
copyrighted fixtures, audio, weights, secrets or personal data. Internal helper
or observation changes are allowed only when required by one ledger row.

## Relevant files and documentation

Read [documentation index](../../README.md), [MVP](../../product/mvp.md),
[Settings requirements](../../product/reader-settings-and-playback-controls.md),
[overview](../../architecture/overview.md),
[system diagram](../../architecture/system-diagram.md), [roadmap](../roadmap.md),
[completed M005](../completed/M005-narration-text-preparation.md),
[testing guide](../../development/testing.md),
[evidence retention](../../development/evidence-retention.md),
[independent change review](../../development/agentic-change-review.md) and
[Git workflow](../../development/git-workflow.md).

Applicable decisions: ADR-0007/0012 (source locations and bounded preparation),
ADR-0044 (Chatterbox capacity), ADR-0064 (immutable v7), ADR-0065 (new admission
versus healthy loaded continuation), ADR-0067 (conservative Unicode handling).
The evidence-reuse and dependency rules in the
[validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md)
are used for gate planning, not to turn this bug-fix batch into a refactor.

### Bounded implementation owners

Prefer these existing files and tests. M0 freezes a literal path allowlist before
editing; support paths below are conditional, not instructions to modify all of
them. Keep one writer at a time for shared coordinator/browser/native owners.

| Unit | Production candidates | Existing tests/support |
| --- | --- | --- |
| U1: maintainer host lifecycle (01,02) | `apps/desktop/scripts/reader-corrections-host.mjs`, `native-smoke/resource-observation.mjs`; existing `bilingual-portfolio-host.mjs` arm helper only if its interface needs a bounded extension | `native-smoke.node-test.mjs`, `bilingual-portfolio-host.node-test.mjs`; reuse safe import/entrypoint and child fixtures. Add wrapper coverage to a discovered existing suite. |
| U2: Python (03,05,06,09) | `services/tts/src/voxleaf_tts/protocol.py`; `service.py` only if rejection cleanup needs it; `services/tts/benchmarks/{service_handoff_cli.py,memory.py,corrective_v12.py,harness.py,contracts.py}` as required | `test_protocol.py`, `test_service.py`, `test_service_handoff_cli.py`, `test_benchmark_memory.py`, `test_benchmark_corrective_v12.py`; existing contract/authority tests remain controls. |
| U3: settings/native lifecycle (04,10,11) | `apps/desktop/src/settings/narration-settings-actions.ts`, `tts/product-narration-coordinator.ts`; `HardwareCompatibilityControls.tsx`, `optional-chatterbox-client.ts`, `ReaderSettingsDialog.tsx`, `App.tsx` only where the ownership route requires it; `src-tauri/src/{tts_optional_chatterbox.rs,tts_service_supervisor.rs}` | Corresponding TS/TSX tests; `tts_optional_chatterbox/tests.rs`, `tts_service_supervisor/tests.rs`; existing synthetic runtime roots and session hooks. |
| U4: restoration/preparation (07,08) | `apps/desktop/src/reader/reader-reflow-restoration.ts`; `semantic-dom-range-mapper.ts` only if needed; `packages/epub/src/narration/narration-bilingual-normalizer.ts` | Existing reflow/mapper tests; `narration-normalizer.test.ts`, `narration-resource-bounds.test.ts`, `src/integration/narration-preparation-matrix.test.ts`. |
| Shared integration | No new product framework | `apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts`, `reader-narration-bugfixes.smoke.spec.ts`; native harness only for an uncovered necessary integration case. |

Documentation during execution: this plan and a new ledger/review reports under
`docs/plans/evidence/minimal-audit-findings-corrections/`; update `testing.md`
and maintained behavior documentation only where corrected behavior warrants it.
Review the diagram/M005 terminology and record whether they still match; do not
rewrite them for internal fixes that preserve their boundaries.

F3 changes a live service input to the Piper core. Generator-owned outputs, if
invalidated, are `services/tts/release/core/runtime-manifest-v1.json` and
`core-package-evidence-v1.json`; conditional inventory output is
`services/tts/release/component-inventory-v1.json`. Regenerate only through the
existing commands below. Never hand-edit generated hashes. Ignored package/dist,
wheel/sdist, native/frontend outputs and task receipts are artifact evidence,
not source allowlist entries. Published optional Chatterbox remains untouched.

## Architecture and constraints

Keep EPUB text on-device, inference local and generated PCM memory-only. No
publication text, raw exception text containing input, audio or paths enter
diagnostics. Maintain queue/work/byte limits, source-code-point locator ranges,
heard/visible position policy and cancellation on owner replacement.

MAF-04 must close both renderer reentrancy and native exclusion without blocking
the independent interruption path or creating opposite lock orders. Unknown
termination/removal status remains a failure with recoverable owned state.
MAF-10 cannot use continuation to authorize a new child, install or replacement.
MAF-11 cannot weaken snapshot validation to hide an inconsistent scheduler.
MAF-08 must preserve bounded scanning and must not silently accept unsupported
numeric syntax. MAF-02/09 must not convert unknown metrics into passing zeros.

## Milestones

### M0: Freeze scope, reproduction paths and evidence decisions

Status: **Complete**. Exact plan HEAD, clean entry, allowlist, original receipts,
tools and reused artifact identities are recorded in the execution ledger.

Record actual HEAD, clean/dirty paths, literal owners, input/discovery identities
and available original receipts before any source or regression edit. Read the
current command graph and confirm tool/driver/artifact readiness cheaply before
costly preparation. Do not install/update tools or download models by default.
Close F2's PowerShell failure path, F4's real lock ordering and F10's same-owner
semantics. Choose each gate below as EJECUTAR, REUTILIZAR con prueba, NO APLICA or
BLOQUEADO with an invariant and dependency explanation. Do not rerun a full
baseline simply because this is a new task.

### M1: Add the missing regressions and preserve intended failures

Status: **Complete**. Directed intended failures cover all eleven findings.
F2 used generated PowerShell faults; F4 used the permitted installed-runtime
ordering with real benign processes in both feature modes. See the ledger.

Use synthetic input and the existing test suites. Tag new directed cases `MAF`
(Python/Rust `maf`) so filtered runs are auditable. Record test discovery/counts;
zero selected tests is not evidence. Add tests before the relevant production
fix and retain intended-red receipts plus positive controls. A failed fixture,
stale dist, import or environment is not the intended product failure.

Use real benign owned processes and the generated PowerShell for host ownership
faults; use deterministic barriers for the native remove/start race. No actual
package deletion, GPU allocation or long model run is needed to create these
fault conditions. F7 needs real DOM geometry in Chromium, not only jsdom mocks.

### M2: Apply minimal corrections in the four bounded units

Status: **Implemented and host-validated**. Directed green, combined suites,
browser integration, native build and current native smoke pass.

Fix only each reproduced cause and run its directed green/controls. Shared
files have one writer. Prefer the existing arm runner, observation types,
continuation policy and geometry fallback over parallel abstractions. Keep
failed attempts and their classification. All eleven rows need explicit status;
do not accept a unit with unresolved lifecycle/cleanup evidence.

### M3: One combined validation and affected artifact generation

Status: **Complete**. Existing core inputs are verified; one generator run,
combined suites, browser integration, native build/smoke and resource checks
pass. No historical test PASS is reused.

Freeze the combined source patch. Run applicable fast static checks before
package/native preparation, rebuild only invalidated outputs, then execute
each final affected suite once. Preserve package hooks, Rust feature variants
and builder prerequisites. Run the bounded browser selection and one current
native smoke on the resulting binary. Do not immediately rerun full suites
that already include the directed cases. Renew only consumers invalidated by a
later correction; any pending combined/host gate prevents final acceptance.

### M4: Independent acceptance and documentation closeout

Status: **Implementation APPROVE; documentary closeout recorded**. R1 independently
accepted all eleven corrections with no findings. Maintained behavior/testing
documentation and indexes are updated, and this plan is archived. Final
documentary acceptance and identity freshness are recorded by the separate
R2 report linked above; moving the plan alone does not establish acceptance.

Delegate to `change_reviewer` (GPT-6 Astra high) under the existing workflow.
Supply exact current diff/path identities, all eleven dispositions and normal
local PowerShell receipts, including justified reused leaves. Pause source
writes and Git mutations during review. Resolve actionable findings and obtain
APPROVE for the exact current patch; missing evidence/reviewer is BLOCKED.
The reviewer reads evidence and does not run tests. Do not reuse an old APPROVE.

Finalize maintained behavior/testing documentation before that review. After
implementation acceptance, archive this plan and update index links, then obtain
a new immutable review of the final documentary patch and identities. The new
report may retain unaffected runtime receipts only through the explicit reuse
proof; the pre-archive APPROVE is not approval of changed final bytes. Keep each
report outside its own identity manifest. New implementation commits/publication
require their own authorization; the planning commit does not grant it. This
execution explicitly excludes all commits, push, PR, merge and publication.

## Testing and benchmark strategy

### Previously executed checks inspected during planning

These are historical results read from ledgers and, for SAF Node/Python, original
local result/log/before/after receipts. **None was executed by this planning
task and no historical PASS has yet been accepted for the future patch.**
SAF receipt HEAD is `5003538f0870f69c67c33e8d79515ccc87e0c702` with then-uncommitted
patch identities; a HEAD match alone would not describe those bytes.

| Original evidence | Actual historical command/result | Reuse decision for this plan |
| --- | --- | --- |
| [SAF ledger](../evidence/static-audit-follow-up/execution-ledger.md), `F-TS-tests-01` | `pnpm.cmd test:typescript`: shared 210, EPUB 742, desktop 970, seven Node suites 132; 85.64 s; package hooks and 17-contract generation check. | Reference and existing fixtures. Changed EPUB/desktop/Node inputs invalidate affected leaves. Do not reuse the old aggregate: SAF R2 superseded two Node leaves after its run. |
| [SAF R2](../evidence/static-audit-follow-up/review-R2.md), `F-U5-R1-final-01` | Scoped Prettier/ESLint; `node --test apps/desktop/scripts/native-smoke.node-test.mjs apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs`: 49 passed, 30.32 s. | Correct latest observer baseline reference. F1/F2 invalidate importing leaves. Existing controlled-PowerShell and benign-child fixtures are reusable. The old suite never covered the separate reader wrapper timeout. |
| SAF `F-Python-tests-build-01` | `pnpm.cmd test:python -o cache_dir=../../tmp/evidence/static-audit-follow-up/pytest-cache`, then `pnpm.cmd build:python`: 791 passed, wheel/sdist; 64.85 s. | F3/F5/F6/F9 invalidate the consumed Python suite/build. Avoid a full baseline; retain directed red and one final full Python run. |
| SAF `F-Python-static-01`, `F-TS-typecheck-01`, `F-TS-format-lint-01` | Python format/lint/mypy (180 files), inventory check; TS typecheck/build hooks and format/lint passed. | Renew changed-language leaves on final inputs. An unchanged release inventory can be checked without regenerating it. |
| SAF `B1-browser-01` | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts`: 19 passed, about 2.9 min, including worklet/completion/cleanup. | Fixture/control reuse, not proof of the missing F7/F11 or remove/reselection cases. Run only the affected browser cases plus named controls. |
| SAF `F-Native-01`, `F-Build-01`, `N1-native-R1-02` | Both Rust Clippy/test variants (145/144 passed, seven ignored each); frontend/native build; direct native smoke passed on binary SHA-256 `6ae59ed0269bef3a66faca8d50c9ff7a317881ecc5fa9a388b57526146d608aa`. | Native lifecycle, renderer and observer changes invalidate their consumers. Ignored tests were not executed. Rebuild once and run one N1; old binary is not corrected-code evidence. |
| SAF `H-Core-generation-01`, `H-Core-identities-01` | `package:piper-core:write-manifest` and `package:piper-core:check` passed; both real offline voices included; 72.49 s. ZIP SHA-256 `b453ef151efd72b730bb2122c047f86d4bdc2e338d4baf9f3b0104e5a29e85ac`. | Reuse source/voice downloads by manifest, not the assembled old core after F3. One corrected build already includes both voice smokes; do not add a duplicate model matrix. |
| [RAC ledger](../evidence/revalidated-audit-corrections/execution-ledger.md), [VCA ledger](../evidence/verified-chat-audit-corrections/execution-ledger.md) | RAC: shared210/EPUB723/desktop935/Node116, Python749, browser17. VCA: shared210/EPUB720/desktop929/Node110, Python735, browser15. | Older references, superseded for efficient planning by SAF. Do not spend more on reconstructing old environments than on a cheap affected rerun. |

Original SAF captures remain under ignored `tmp/evidence/static-audit-follow-up/`.
The inspected `F-Python-tests-build-01`, `F-U5-R1-final-01` and
`N1-native-R1-02` prefixes each have `-result.json`, `.log`, `-before.json` and
`-after.json`. Resolve other exact paths from their receipts, not by inventing
a missing filename. R2 names
`review-R2-manifest.json`, SHA-256
`84842cce9213aaf3dee944fad378aafaaf7633930f6b9518abab7b3eee49cdfc`, covering
1,433 paths and 68 receipts at that review. Current sampled Python files match
SAF's final snapshots; observer/test match its R1-corrected snapshot but not its
earlier one. These are partial comparisons, not full dependency/environment proof.

### Reuse rules and the intended savings

- **EJECUTAR:** every new regression and affected final leaf; a historical test
  without the new assertion cannot prove the correction. Skip a new whole-repo
  baseline and avoid full-suite repetition after each of eleven fixes.
- **REUTILIZAR con prueba:** unchanged original PASS leaves only with original
  immutable receipt/command/outcome, all source/transitive inputs, discovered
  membership, fixtures/config/locks/tool versions, build/artifact bytes,
  environment/isolation and the same invariant. Record original gate/report ID
  and the current comparison in a new independent report. Shared-contract-only
  tests and evidence-guard unit tests are candidates, not approved reuse now.
- Reuse verified source archives/voices/drivers and unchanged model assets as
  **artifacts**, separately from test results. Rebuild outputs that consume
  changed source. Do not share mutable baseline/candidate environments or edit
  old manifests to make a comparison pass.
- **NO APLICA:** unrelated model quality/listening, six-rate/Qwen portfolios,
  optional runtime regeneration/full downloads and personal NSIS journeys for
  the bounded changes above. No new support/performance claims. F3's core build
  is explicitly required; it is not hidden in this exclusion.
- **BLOQUEADO:** required receipt/input identity, host capability or cleanup
  proof is missing. Prefer rerunning the small affected gate when practical;
  never turn missing data, a failed receipt, a skipped test or a sandbox run
  into PASS. No result is reusable merely because source filenames match.

### Gate matrix and concrete commands

All future tests, format/lint/type/schema/build/benchmark commands run in normal
local PowerShell **outside the automation sandbox**. Default cwd is repository
root. Commands below already exist as scripts or underlying configured runner
invocations; `MAF`/`maf` selects tests to be added in M1, not existing coverage.

| Gate | Invariant and command | Timing / invalidation |
| --- | --- | --- |
| D-Desktop | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/settings/narration-settings-actions.test.ts src/tts/product-narration-coordinator.test.ts src/tts/HardwareCompatibilityControls.test.tsx src/settings/ReaderSettingsDialog.test.tsx src/reader/reader-reflow-restoration.test.ts src/reader/semantic-dom-range-mapper.test.tsx -t MAF` | Directed red/green by affected subset; current package dist required. Extend selection to App/optional-client tests only if those owners change. Do not pass file selection to desktop's chained `test` script. |
| D-EPUB | `pnpm.cmd --filter @voxleaf/epub test src/narration/narration-normalizer.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts -t MAF` | Red/green for source preservation, mark adjacency, valid controls, bounded public preparation and continuation. Preserve `pretest` build. |
| D-Python | `pnpm.cmd test:python -k maf` | Red/green for malformed direct protocol plus cleanup, post-spawn setup failure, v12 language provenance/incomplete gate, valid/invalid PDH statuses. Synthetic fixtures; affected discovery/config/imports invalidate. |
| D-Node | `node --test --test-name-pattern=MAF apps/desktop/scripts/native-smoke.node-test.mjs apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs` | Red/green using actual generated PowerShell and benign children; assert no next arm before confirmed cleanup. Include reader-wrapper tests in these discovered suites, not a new unreferenced file. |
| D-Native | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml maf` and the same command with `--features release-locked-runtime` before `maf` | Controlled remove/configure/spawn ordering, release selection/continuation and cleanup. Include positive controls, failed stop, locked deletion and later retry. New hooks are test-only and preserve interruption. |
| F-Static | `pnpm.cmd format:check`; `pnpm.cmd lint`; `pnpm.cmd typecheck` | Once on definitive source before expensive preparation. Includes TS/Python and Rust format/Clippy variants; typecheck includes package builds. Recheck only invalidated leaves after corrections/generation. |
| H-Core | `pnpm.cmd inventory:release:check`; if actually stale, `pnpm.cmd inventory:release`; then `pnpm.cmd package:piper-core:write-manifest`; `pnpm.cmd package:piper-core:check` | F3 changes packaged live protocol input. One generator-owned build, includes both offline voices. Verify cache inputs first and final output identities/cleanup. No preceding duplicate core build. |
| F-Tests | `pnpm.cmd test:typescript`; `pnpm.cmd test:python`; `pnpm.cmd test:rust` | Once after final source and applicable generated inputs. Preserve TS pretest/generation hooks, seven discovered Node suites and both Rust variants. A proved independent leaf may be replaced by its receipt only with a complete aggregate-to-leaf map. |
| B1 | Use the single browser invocation below. | New actual-DOM F7; completed Prepared->Quick F11; mounted remove/reselection F4/F10 where native mocks cannot prove the UI route; two existing reflow/completion controls. Confirm these names and nonzero discovery before use. Browser/package hooks run once. |
| F-Build | `pnpm.cmd build:desktop`; `pnpm.cmd build:python`; standalone `pnpm.cmd --filter @voxleaf/desktop build` only if its leaf is not already evidenced by B1's identical frontend build | After corrected core; retain configured browser/Tauri frontend hooks. Capture command, cwd, environment and input/output identities to count B1's frontend build toward the portable build leaf; otherwise run the standalone command. Capture final native/frontend/wheel identities. No additional `pnpm.cmd build` aggregate after these leaves. |
| N1 | `node apps/desktop/scripts/native-startup-smoke.mjs` | One model-free native run against the final identified binary, after F-Build; no rebuild wrapper. Verify protocol/cancellation, local reader behavior, zero external requests and owned process/scratch cleanup. Old N1 is invalidated by F2/F4. |
| F-Docs | `pnpm.cmd check:evidence`; `pnpm.cmd test:evidence`; `git diff --check`; relative-link/scope/diagram review | Final docs and new immutable reports. Guard tests may be reused only if their isolated closure/environment is proved identical; actual repository guard must inspect the new documents. No Markdown-specific test framework is configured. |

B1 selection:

```powershell
pnpm.cmd test:browser reader-reflow-restoration.smoke.spec.ts reader-narration-bugfixes.smoke.spec.ts --grep 'MAF|preserves one canonical passage|LCF completed narration restarts'
```

Use one final `check`-equivalent leaf ledger; do not also run both `check` and
`check:portable`. Map every selected aggregate obligation to the executed or
independently reused leaf, including hooks/exclusive builds. Report the leaves
as executed, never claim an aggregate command ran when it did not. If the
equivalence cannot be established, use the configured aggregate instead of
silently dropping a prerequisite. CI requirements are unaffected.

F-Static's package build satisfies later directed desktop prerequisites only
while its inputs stay identical. Before directed red, use `pnpm.cmd build:packages`
only if package outputs are stale/missing; record that preparation separately.
After regeneration, inspect changed generated JSON with the existing formatter
and renew consumers. Do not rerun unrelated models merely because a module is
under `services/tts`.

### Host, performance and acceptance limits

For F1/F2/F5, a controlled real-process/PowerShell fault regression is required;
pure mocked exit codes are insufficient for ownership acceptance. For F4,
barrier-controlled Rust tests must exercise the actual manager/supervisor
boundary in both feature modes; N1 validates the rebuilt native host. For F10,
synthetic host facts establish the loaded-owner rule without exhausting GPU RAM.
If those tests cannot reach the ordinary release branch without bypassing its
owner, add a bounded existing-runner case before acceptance or mark it BLOCKED;
do not substitute a passing fake with a different lifecycle.

F7's targeted fallback is not expected to change batching/layout/steady-state
complexity. Confirm this at M0 and independent review. The testing guide requires
`pnpm.cmd benchmark:reader` and `pnpm.cmd benchmark:reader:native` after material
renderer/reflow/driver/reference-host changes. If the patch or environment makes
that rule applicable, run both once on final inputs; do not waive it for cost.
F2's metric fix invalidates prior native resource observations and must receive
fresh real-query success/failure evidence; any new resource-budget claim requires
the corresponding benchmark, not a recycled number. F9 validates API status
handling, without claiming Windows on this host was observed emitting status 1.

The published v7 model/adapter/loader and DSP remain unchanged, so full GPU,
quality and six-rate matrices are not selected. Review any expansion into those
boundaries before implementation; it invalidates the NO APLICA decision and
requires its exact existing host gates. Do not mutate personal installations
to manufacture a model-free race.

## Risks and rollback

Record a run ID and a resource journal before host work: owned temporary roots,
PID plus creation time/executable identity, original state and verified cleanup
for success, failure and cancellation. Preserve unrelated sentinels and user
resources. Unknown cleanup blocks acceptance. Core generation uses existing
staging/backup recovery; keep a verified previous package until promotion and
cleanup succeed. Never broadly kill processes by name or recursively delete a
computed path without resolving containment.

Classify failures as intended regression, fixture/preparation, environment,
product or harness/cleanup. At most one infrastructure retry per stage after a
recorded changed condition; repeated failure requires diagnosis/replanning.
Retain all receipts. Do not rerun expensive work automatically after a context
reset; first inspect any active run and its ownership. Roll back only task-owned
changes/outputs with explicit review; preserve pre-existing work and evidence.

No runtime fix may be accepted by weakening an assertion, stripping the malformed
case, lowering resource limits or hiding a failed cleanup. If F4 needs a broader
lock/lifecycle redesign, stop and revise its bounded design rather than changing
the native protocol. If F6 needs an internal observation field, preserve other
benchmark callers and frozen external result schemas.

## Progress log

- 2026-10-29: Execution starts at exact plan HEAD
  `2f6a80b7b19be6cc62b7706bd85e9be96a1a2b8e`, on the requested branch with
  empty index and clean worktree. The ledger freezes mutable paths and initial
  gate dispositions before source/test edits; read-only investigations cover
  host observation, Python and native lifecycle. No historical PASS is reused.
- 2026-10-29: All eleven causes reproduced, corrections implemented, combined
  host gates passed and cleanup verified. `MAF-R1-20261029` independently
  approves the implementation, scoped current-task evidence retention and
  exclusions without findings. M4 archives this plan, updates maintained indexes
  and requests the distinct R2 review of the exact final documentary identities.
- 2026-10-29: Read-only review consolidated eleven findings and revalidated their
  scope. F2/F4 remain conditional; F6's v9/v11 extension was refuted. No tests ran.
- 2026-10-29: Planning inspected current configuration, product/architecture
  boundaries, SAF/RAC/VCA ledgers and available SAF original receipts. Partial
  identity matches were recorded only as historical reference, not reuse approval.
- 2026-10-29: Created this plan and active-index entry on the requested local
  branch. At that planning checkpoint all milestones M0-M4 were **Not started**.

## Discoveries and decisions

- The cheap final Python/TS suites already cover many historical corrections;
  rebuilding an elaborate historical-reuse proof can cost more than rerunning
  an affected suite. Prioritize artifacts, existing fixtures, no full baseline,
  one final run and no redundant expensive matrices.
- SAF's aggregate predates a later observer fix. Its R2 report explicitly
  substitutes two Node leaves and N1; use the right original receipt.
- Test F1 in a discovered existing suite: the separate reader wrapper is not
  automatically exercised by the seven current Node suites.
- The live Python protocol fix invalidates the assembled Piper core, while
  immutable optional v7 is outside that mutable source closure.
- A plan-only documentation patch is exempt from behavioral `change_reviewer`
  acceptance. The future implementation is not exempt.

## Final validation results

All eleven corrections are implemented and reproduced. MAF-02's partial RAM
observation and MAF-04's permitted native interleaving are demonstrated on this
host. Directed red/green receipts and the combined validation map are retained
in the [execution ledger](../evidence/minimal-audit-findings-corrections/execution-ledger.md).

Current combined passes: 210 shared, 749 EPUB, 984 desktop and 151 Node tests;
806 Python tests; 148/147 Rust tests with seven explicit ignored cases per mode.
All applicable lint, type and format leaves pass on their recorded inputs.
Piper core was generated once with both offline voice smokes and checked.
All nine selected Chromium cases pass, including existing final-highlight and
reflow controls. Wheel/sdist and the native release build pass. N1 validates the
current executable, with zero external requests, no new processes/temp roots
and unchanged binary identity. Documentary checks pass. Independent R1 approves
all eleven corrections without findings; the separate R2 report governs final
archival acceptance. The execution ledger maps commands, failed receipts,
current-session retention and resource cleanup.

No historical test result is reused. Existing source archives/voices and matching
EdgeDriver were hash verified as artifacts. Frozen optional v7, v9/v11, public
contracts, dependencies and versions remain unchanged. The diagram's owners and
M005 preparation boundary still match; neither document needs amendment.
The ledger records failed attempts, invalidations and the bounded browser-stage
replans. No new performance, GPU/quality, installer or clean-host claim is made.
