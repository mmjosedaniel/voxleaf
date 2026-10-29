# Static audit follow-up: minimal corrections

## Goal

Resolve the sixteen findings revalidated on 2026-10-29 with the smallest
responsibility-preserving changes and a deduplicated validation schedule.
The IDs below preserve their order in the audit, prefixed `SAF` to distinguish
them from completed SAC, VAF, VCA and RAC work.

**Execution authorized on 2026-10-29.** The user's subsequent instruction
authorizes implementation and necessary validation through independent
acceptance. It does not authorize commit, push, PR, merge or publication.
The [execution ledger](../evidence/static-audit-follow-up/execution-ledger.md)
records M0 identities, exact mutable paths, missing regressions, gate choices,
original receipts, cleanup and current results.

**Completed on 2026-10-29.** All sixteen corrections and their required host
validation pass. [SAF-R2-20261029](../evidence/static-audit-follow-up/review-R2.md)
approves implementation and scoped current-task evidence reuse after resolving
R1's process-ownership finding. The separate archive assessment is
[SAF-R3-20261029](../evidence/static-audit-follow-up/review-R3.md), outside its
own manifest. Work remains unstaged and uncommitted.

## User-visible outcome

The reader permits changing startup mode after natural completion, keeps
profile changes attached to the publication that requested them, and refreshes
admission before rejecting a new Play action. Narration remains stable across
preparation batches, handles the accepted Spanish time form without duplicating
its article, and sends literal publication text through Piper's ordinary
phonemizer. Decorative images remain unnamed in the accessibility tree.

Optional-package residue remains removable after restart, and a cancellation
accepted before rejected HTTP headers stays a cancellation. Maintainer tools
preserve recovery material, finish owned cleanup on their deliberate deadline,
retain retry inputs until successful output, and report accurate simulation
counters. Historical benchmark conclusions are not recomputed or reclassified.

## Current state

Planning base: `65b19fbed2bd016a44d831ada069f34d0313c075` on clean `main`.
The planning branch was created from that commit with an empty index. Static
revalidation inspected production callers, existing tests as text and relevant
requirements; it did not execute tests or reproduce defects at runtime.

Thirteen findings retain their substance; three need narrower claims:
SAF-03 is established for `complete`, not every `failed` state; SAF-07 is a
latent simulator defect whose invalidation option has only a test consumer;
SAF-13 proves missing guaranteed cleanup on the deliberate timeout, not which
external driver/application processes actually survive. SAF-03, SAF-06 and
SAF-15 are P3. SAF-01 is P1 in maintainer tooling; the other priorities below
are bounded to their actual consumers.

Piper 1.8.0 / ONNX Runtime 1.31.0 is the local CPU core. Optional Chatterbox v7
uses frozen v3 service sources; Qwen is development-only. Changing the live
Piper adapter invalidates the core copied from it, but does not authorize
regenerating the frozen optional runtime. Roadmap M005 remains complete at its
EPUB-to-prepared-segment boundary; its archived plan and frozen authorities are
preserved. Later TTS/audio acceptance must not be attributed to M005.

## Scope and non-goals

### Finding disposition and acceptance criteria

| ID | Finding and scope | Minimal correction and required outcome |
| --- | --- | --- |
| SAF-01 / P1 | `ordinary-chatterbox-release-host.mjs` launches a driver without handling its asynchronous `error`, after moving original data. | Check driver prerequisites before backup, and handle spawn errors immediately through the existing awaited failure/finalization path. Existence checks alone do not cover a later launch failure. A driver that never started is distinct from uncertain process termination. Restore synthetic original data only after verified cleanup; otherwise retain the backup and both errors. Do not claim original data was deleted by the old bug. |
| SAF-02 / P2 | `tts_optional_chatterbox.rs` omits cache-only residue from discovery after failed removal and restart. | Include only the already-owned literal `tts/cb/cache` in retained-data discovery using the existing checked-path helper. A newly constructed manager exposes a removal route after package deletion left cache behind. Preserve containment, reparse/access-error handling and unrelated siblings. No broader deletion or runtime admission. |
| SAF-03 / P3 | `ReaderSettingsDialog.tsx` treats `complete` as active. | Exclude `complete` from the UI activity predicate so Quick/Prepared changes reach the existing coordinator without an extra Stop. Preserve loading, persistence, active-session and legitimate recovery restrictions; do not enable every `failed` state indiscriminately. |
| SAF-04 / P2 | Historical `incremental_prototype.py` leaves its current worker owned after load/generation failure. | Track ownership before `start`; terminate the still-owned worker on exceptional exits, release it after successful shutdown, and always stop measurement. Preserve the original error if cleanup also fails. Do not double-close successful workers or claim every old timeout caused a permanent leak. |
| SAF-05 / P2 | Historical `corrective_v12_quality.py` deletes the scorecard before validating/writing the summary. | Validate the destination first; separate aggregation from deletion and retain the scorecard until successful summary write. Preserve success cleanup and support retry after a write failure. Reject destructive input/output aliasing or output inside the private session subsequently removed. The old aggregate survives; do not claim all evaluation results were lost. |
| SAF-06 / P3 | Historical `dual_worker_playback.py` counts each event interval during one continuous starvation episode. | Count transitions into starvation and reset only when ordered playable audio resumes. Preserve accumulated buffering time, reservation/retained-PCM accounting and acceptance thresholds. This count alone does not change the existing buffering-seconds gate. |
| SAF-07 / P3, latent | The same simulator ignores invalidation inside its final drain. | Stop consumption at the exact invalidation instant and account remaining discarded audio using existing rational arithmetic. Keep no-invalidation behavior identical. No claim of impact on current reports: their consumer never passes this option. |
| SAF-08 / P3 | `release_chatterbox.py` references `partial` before assignment when preparing the download directory fails. | Establish cleanup ownership/path before use and ensure failed cleanup does not replace the primary classified error. A cache path occupied by a file must not trigger a second unhandled cleanup exception. No download should begin on preparation failure. |
| SAF-09 / P2 | A pending Chatterbox selection from book A can commit global configuration while book B already plays Piper. | Bind selection to App's current publication/operation identity, invalidate on close/replacement, and check after each relevant await and before committing configuration. An obsolete operation must not change B's hardware selection, stop B, or refresh closed A. Preserve consistent persisted preference and snapshot if the existing persistence await crosses invalidation; do not solve only the first await or dialog mount. |
| SAF-10 / P2 | Warm preparation loses preceding lexical context used by the conservative English title rule. | Preserve only bounded preceding context needed at the returned continuation, with language/role provenance and conservative handling when the full context is unavailable. Supply it to normalization without emitting it again or widening source ranges. Account its work/retention within existing limits and clear it on owner/context invalidation. Do not rescan an arbitrarily long paragraph on every batch. |
| SAF-11 / P2 | Piper interprets publication `[[...]]` as raw phonemes. | Keep canonical text intact and use a per-voice literal espeak phonemization path for the two admitted Piper voices, bypassing the raw-phoneme parser. Inspect the pinned API and retain its existing voice/options and ordinary-text behavior. No global monkey patch, third-party source edit, invented `literal=True` option, bracket deletion or invisible-character substitution. Keep synthesis, cancellation and PCM/resampling bounds. Audio-empty/crash claims are outside the finding. |
| SAF-12 / P3 | `Las 14:30.` can become `Las las catorce treinta.`. | Add only the needed closed capitalized article forms to the existing longest-first Spanish table, retaining source spans and article casing. Preserve lowercase, standalone time and unsupported-compound behavior. Do not make all normalization case-insensitive or add general time parsing. |
| SAF-13 / P2, bounded | The portfolio's outer timeout kills the runner before its cleanup and skips the cleanup assertion. | Give the existing runner a finite cooperative deadline which aborts/settles its active work before independent cleanup. The parent awaits confirmed cleanup and terminal exit instead of killing a still-owning runner at the deadline. Preserve bounded failure reporting. A bare `Promise.race`, removal of all deadlines, or unverified success is insufficient. The scope is deliberate deadline handling, not arbitrary crash resilience. |
| SAF-14 / P2 | Play rejects an undefined cached profile before a fresh admission check after Stop freed resources. | Make one fresh admission observation before resolving the definitive profile for a new service. Recheck run/owner/profile/language after the await; do not use loaded-session continuation thresholds to admit a new child. If capacity is still insufficient, fail closed without starting preparation/service work. |
| SAF-15 / P3 | Explicit `alt=""` becomes absent and receives `Publication image`. | Preserve an explicit empty string through the existing optional `alternativeText` field; only absence receives fallback. Hide decorative loading/failure placeholders from the accessibility tree as well as retaining empty alt on the loaded image. Nonempty alt and image release remain unchanged. Images/alt remain excluded from TTS. |
| SAF-16 / P2 | Cancel during pending headers can become `Failed` and overwrite the previous diagnostic when an error response arrives. | Observe accepted cancellation after successful send and before recording/validating headers. Preserve the prior report and existing cancellation cleanup. Uncancelled HTTP/length failures still retain their diagnostic. Do not change transport timeouts or add retries. |

No dependency, engine/model version, profile ID, shared schema, IPC protocol,
audio persistence, queue ceiling, hardware threshold or release-support claim
changes. No general refactor or automatic migration; no copyrighted fixtures,
audio, weights, private state or book-bearing diagnostics enter Git. Do not
rewrite completed plans, frozen normalization/evaluation authority or old PASS
records. Any necessary new durable policy is recorded separately, not disguised
as an edit to historical authority.

## Relevant files and documentation

Read [product requirements](../../product/mvp.md),
[Settings behavior](../../product/reader-settings-and-playback-controls.md),
[architecture overview](../../architecture/overview.md), the
[system diagram](../../architecture/system-diagram.md),
[roadmap](../roadmap.md), and [completed M005](../completed/M005-narration-text-preparation.md).
Applicable decisions are ADR-0010 (raster lifecycle), ADR-0012 (bounded
preparation), ADR-0059 (diagnostics), ADR-0061 (owned residue), ADR-0064 (v7),
ADR-0065 (admission/continuation) and ADR-0067 (conservative titles).
Keep the [testing guide](../../development/testing.md),
[evidence policy](../../development/evidence-retention.md) and
[change-review workflow](../../development/agentic-change-review.md) authoritative.

Implementation units are responsibility groups, not sixteen independent test
campaigns. M0 closes exact paths before edits; conditional support-file changes
must be justified there, not expanded silently.

| Unit | Production owners | Existing tests to extend |
| --- | --- | --- |
| U1: settings/admission (03,09,14) | `apps/desktop/src/settings/{ReaderSettingsDialog.tsx,narration-settings-actions.ts}`, `apps/desktop/src/App.tsx`, `apps/desktop/src/tts/{product-narration-coordinator.ts,hardware-profile-compatibility.ts}` only as needed for the internal fresh-admission/ownership boundary | Corresponding `.test.ts`/`.test.tsx`; retain NLC containment and F06 continuation controls. |
| U2: EPUB/accessibility (10,12,15) | `packages/epub/src/narration/{narration-preparation.ts,narration-prepared-segment.ts,narration-bilingual-normalizer.ts,bilingual-spanish-normalization.ts}` as required by bounded checkpoint context; `packages/epub/src/document/xhtml-projector.ts`; `apps/desktop/src/reader/images/SemanticRasterImage.tsx` | `packages/epub/src/integration/narration-preparation-matrix.test.ts`, `src/narration/{narration-normalizer.test.ts,narration-resource-bounds.test.ts}`, `src/document/xhtml-projector.test.ts`; desktop `SemanticRasterImage.test.tsx` and `SemanticDocument.test.tsx`. |
| U3: literal Piper (11) | `services/tts/src/voxleaf_tts/adapters/piper.py`; `release_core.py` only for a bounded real smoke case | `services/tts/tests/{test_piper_adapter.py,test_release_core.py}`; existing native `tts_release_core` coverage. |
| U4: optional lifecycle (02,16) | `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`; `download_diagnostic.rs` only if cancellation must be passed into the existing response boundary | `apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs` and its existing split modules; `OptionalChatterboxControls.test.tsx` for residue presentation. |
| U5: host tools (01,13) | `apps/desktop/scripts/{ordinary-chatterbox-release-host.mjs,bilingual-portfolio-host.mjs,native-startup-smoke.mjs}`; current native-smoke lifecycle/resource-observation and WebDriver helper only where needed | Their existing Node suites, including `windows-release.node-test.mjs` which imports ordinary; benign owned subprocess fixtures. No new general supervisor by default. |
| U6: historical/tooling (04-08) | `services/tts/benchmarks/{incremental_prototype.py,corrective_v12_quality.py,dual_worker_playback.py}`; `services/tts/src/voxleaf_tts/release_chatterbox.py` | `services/tts/tests/{test_incremental_prototype.py,test_benchmark_corrective_v12.py,test_benchmark_dual_worker.py,test_release_chatterbox.py}`. |

One browser integration file,
`apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`, joins the
affected mounted-reader cases rather than starting a separate end-to-end suite
per finding. Do not modify its unneeded fixtures or enable product-only test
capabilities outside the existing opt-in boundary.

Maintained documentation may include this plan/ledger, indexes,
`docs/development/testing.md`, relevant product/architecture clarifications and
`benchmarks/tts/README.md`. Review the canonical diagram; update it only if an
actual boundary changes. None is intended. M005 and frozen authorities stay intact.

## Architecture and constraints

Keep EPUB source mapping in the package, domain ownership in coordinators,
phonemization adaptation in the Piper adapter, and resource cleanup in its
existing host/native owner. A setting operation cannot adopt a replacement book
merely because its dialog closed; a completed selection for the current owner
must still perform identity-first containment. Never admit two simultaneous
model children.

For SAF-10, the current fixture is `"a".repeat(110) + " Brown Dr. " +
"Smith ".repeat(30) + "."`. The cut is source offset 117, or 118 Piper-weighted
units. Seven preceding short paragraphs place it at the product's eight-segment
batch boundary. Compare warm/cold and one/many-batch output, ranges and boundaries.
A bounded context checkpoint is a candidate implementation, not permission to
enlarge the 128-code-point contextual lookahead or retain unbounded prose.
Truncation must remain conservative rather than invent a complete preceding word.

For SAF-11, the pinned Piper implementation offers `EspeakPhonemizer`, not a
literal-mode synthesis flag. Select the smallest instance-local integration
after verifying its ordinary-text semantics. Preserve voice options, including
`espeak_data_dir` and `vowel_clusters`, and equivalent serialization around
espeak's shared native voice state; a new phonemizer instance alone does not
isolate `set_voice`. Verify voice isolation through the adapter's existing
fixtures. Do not alter canonical source text to escape an engine-specific
mini-language. Direct smoke must actually traverse
the changed adapter and a delimiter-containing synthetic input; nonempty PCM
alone does not establish that raw phonemes were bypassed.

For SAF-13, abort polling/requests and await their settlement before teardown;
cleanup has its own bounded channel, independent of the expired operation's
signal. Reuse the existing resource observer to verify owned process exit and
scratch cleanup. If the current delete-session/stop-child path cannot provide
that closure, block acceptance and amend only the necessary owner/helper with
independent review. Do not kill unrelated processes by name or numeric PID,
introduce an unreviewed process framework, or claim protection against arbitrary
forced process death. New runner options, if needed, must be implemented,
tested and documented before their invocations become acceptance commands.

### Generated artifacts

SAF-11 invalidates the live core. Its generator-owned tracked outputs are
`services/tts/release/core/runtime-manifest-v1.json` and
`services/tts/release/core/core-package-evidence-v1.json`; its dist directory,
archive and native/frontend binaries are ignored acceptance artifacts.
Confirm the builder's complete output list at M0 and capture their identities.
Use `package:piper-core:write-manifest` once: it already builds, verifies,
archives and performs both offline voice smokes. Do not precede it with
`package:piper-core`, which would duplicate preparation and use stale authority.
Follow with `package:piper-core:check`.

Inspect `inventory:release:check` before generation. If source/component
inventory inputs actually change, regenerate via `inventory:release` before
the core build and close its exact output list first. Otherwise retain the
identical inventory. Never hand-edit generated files, bump locks/models, or
regenerate Chatterbox v7 source/acquisition/runtime authority for this patch.

## Milestones

### M0: Authorize execution and freeze the evidence/gate map

**Status: complete.** Entry branch/HEAD/index/worktree and original input
identities are captured in the ledger before production edits. Final Route B
and one full Python suite are selected; no historical PASS is reused.
After explicit implementation authorization, recheck
HEAD, worktree/index, instructions and tool configuration. Preserve unrelated
work. Close exact source/test/generated paths and capture original identities
and discovered membership before editing. Start an execution ledger under
`docs/plans/evidence/static-audit-follow-up/`; raw receipts and disposable
fixtures belong under ignored `tmp/evidence/static-audit-follow-up/`.

Retrieve the original receipts below and choose the final test route before
edits. Record `RUN`, `REUSE-CANDIDATE`, `NOT-APPLICABLE` or `BLOCKED` per gate
with its input closure. No complete fresh baseline suite is necessary solely
to rediscover the recent baseline. Add meaningful directed regressions first
and record their intended failures against unchanged production; distinguish
fixture failures from product failures. Reuse existing fixtures and controls.

Check tools, locks, cached Piper sources/voices, disk/scratch access and driver
compatibility before costly preparation. Readiness is not behavior acceptance.
No package installation, personal data relocation or real installer journey is
authorized merely by this plan.

### M1: Reader, preparation and literal Piper corrections

**Status: implemented; directed regressions pass.** U1/U2/U3 receipts and original
failures are retained in the ledger. Combined/browser/core acceptance remains M3.
Apply U1/U2/U3 in small reviewable changes, with one
writer for overlapping files. Important missing regressions:

- Complete-mode editing; active/persistence/recovery controls remain disabled.
- Deferred A selection, close/open B, start B, then resolve A; verify B's exact
  owner/profile survives. Cover close and failed replacement, and invalidation
  during persistence without inconsistent preference/snapshot state.
- F06 loaded-session continuation followed by Stop, recovered RAM and Play;
  fresh rejection when RAM is still insufficient; Stop/close during the probe.
- SAF-10 batch sizes 1/8/16, cold restart at offset 117, accepted `Dr. Morgan`,
  language/block transitions, cancellation and retained/work bounds.
- Spanish lowercase/title-case/all-caps article, standalone time and protected
  unsupported compound; compare text and source ranges.
- Missing/empty/whitespace/nonempty alt through projection and rendering;
  decorative loading/ready/failure states and real Chromium accessibility roles.
- Literal, mixed and unmatched Piper delimiters, ordinary text controls and
  both voices; unchanged PCM/cancellation/cleanup checks. No third-party edits.

Run directed tests during diagnosis, not complete package suites after every
finding. Keep final integration/host acceptance pending until M3.

### M2: Optional lifecycle and maintainer tools

**Status: implemented; directed regressions pass.** U4/U5/U6 source is frozen
for M3. U5's original observer failures and diagnosed recovery are retained in
the ledger. Apply U4/U5/U6 with bounded synthetic failure fixtures:

- Separately test missing-driver rejection before backup, and asynchronous
  launch failure after prerequisites passed and a synthetic backup exists.
  The latter must traverse the real awaited finalization path with simulated
  installation, restore the synthetic original after confirmed cleanup, and
  retain it on uncertain cleanup. Preserve successful startup/sticky-close
  controls; an early-preflight test alone cannot prove the spawn-error repair.
- Cache-only manager reconstruction; partial deletion with a Windows-locked
  cache file, access/reparse failures and unrelated-sibling survival.
- Loopback server holds error headers until cancellation is acknowledged;
  test HTTP error and invalid length, preserved prior diagnostic, cleanup and
  uncancelled controls. No public network or multi-GB acquisition.
- Deliberate short runner deadline after an explicit readiness barrier; benign
  driver/app/worker descendants, no late work after abort, verified exit and
  scratch cleanup, normal exit and cleanup failure. Preserve an unrelated
  sentinel process. Do not wait thirty minutes or load a real model to test it.
- Worker load/acceptance/audio timeout and identity failure, success without
  double termination, cleanup failure without skipping measurement teardown.
- v12 invalid destination/write failure retains scorecard and supports retry;
  successful output still removes the intended private inputs.
- One starvation interval crossing several completion events, two intervals
  separated by playback, simultaneous events, and unchanged buffering seconds.
- Final-drain invalidation inside/at/after completion and before startup; retain
  existing between-event and no-invalidation controls.
- Cache-as-file, mkdir denial and cleanup failure preserve the original
  packaging error; no download attempt on preparation failure.

Extend existing suites rather than creating a duplicate audit harness. The
actual subprocess/loopback paths must be tested, not only extracted arithmetic
or a mock assertion mirroring implementation. Historical GPU benchmarks,
frozen scorecards and generated audio are not required fixtures.

### M3: One final integration batch and independent acceptance

**Status: complete.** Independent R2 approves the corrected implementation and
current-task evidence. Review identified
one U5 process ownership defect; its correction, directed red/green cases, 49
affected Node checks and renewed native cleanup pass as recorded in the ledger.
Fast checks,
the single regenerated Piper core, final suites, browser/native validation and
owned cleanup pass. Finish cheap directed checks and static checks before
core regeneration. Regenerate the core once, then run final affected suite
leaves against the final inputs. Browser hooks/builds precede the final native
build; native gates use that identified executable, without a wrapper rebuild.
Do not rebuild frontend/core after native acceptance without renewing consumers.

Record every result, duration, input identity and cleanup outcome. Obtain
`change_reviewer` APPROVE for the exact final patch and evidence using
`docs/development/agentic-change-review.md`. The reviewer neither edits nor runs
tests. An old RAC/SAC approval does not approve this work. Resolve actionable
findings and obtain a new identity-bound report after relevant changes;
missing required evidence or reviewer remains blocked.

Document actual behavior changes, inspect the whole diff, verify the diagram
still matches, then archive only after all gates and cleanup pass. This is a
behavior-fix batch, not a refactor campaign; use the validation policy's reuse
proof without importing refactor-only per-file ceremony or authority.

## Testing and benchmark strategy

Every future test/validation/build command runs from repository-root normal
local PowerShell **outside the managed sandbox**. Commands are existing scripts
or scoped invocations of their configured Vitest, Node, pytest and Cargo runners.
The original planning turn executed no implementation tests or benchmarks;
current execution is recorded separately in the ledger.

### Evidence actually inspected during planning

The most recent complete source acceptance is
[RAC-R1-20261029](../evidence/revalidated-audit-corrections/review-R1.md), with
[RAC-R2-20261029](../evidence/revalidated-audit-corrections/review-R2.md)
accepting its archive and unchanged evidence. Both record reviewed HEAD
`618d6af472c7dfe73b123a91c4c7018f4e0d0da9` plus the then-uncommitted patch.
They are not test executions on this plan's HEAD. The
[execution ledger](../evidence/revalidated-audit-corrections/execution-ledger.md)
preserves original failures and exact commands.

The original `tmp/evidence/revalidated-audit-corrections/` manifests and selected
result receipts are retrievable. The R2 manifest SHA-256 matches its published
`86f9ba528a7ce3cd37ca19b66261a031ead18830d2373b3412fdb2f857d7ec7b`.
Planning compared its **640 non-document file entries** with disk: 640 matched,
none differed or were missing. This proves those recorded bytes only, not
complete new-file discovery, current environment/tool installation, ignored
build outputs or future-patch equivalence. No historical PASS is approved for
implementation reuse by this comparison.

| Original receipt / historical result | Use for this plan |
| --- | --- |
| RAC `F-TS-tests-01`: shared 210, EPUB 723, desktop 935 and seven Node suites 116 pass; 84.06 s; shared generation check/build and EPUB build included | Reference baseline and existing controls. Changed EPUB/desktop/host leaves require fresh results. Shared and independent Node leaves are reuse candidates only. |
| RAC `F-Host-final-02`: current ordinary + Windows-release suites 52 pass; format/lint renewed; 66.44 s | Both host leaves change or consume changed ordinary/core inputs; renew. Do not retain their superseded result from the earlier aggregate. |
| RAC `F-Python-tests-build-01`: 749 pass, wheel/sdist pass; 61.69 s | One fresh final Python suite/build replaces changed adapters, tools and tests. No duplicate v7-preparation suite afterward. |
| RAC `F-Python-static-02`: service format/lint/mypy successful leaves; overall receipt exit 1 from a later external-script check | Keep the failure attribution. Renew changed service checks; never call that aggregate a PASS. Unchanged external smoke checks may be omitted by unaffected responsibility or reused with complete proof. |
| RAC `B1-browser-01`: complete reader spec 17 pass; 178.43 s | Run the final affected spec once. Old cases are regression assets, not acceptance of the new bundle. |
| RAC `F-Build-01`, `F-Native-01`, `N1-native-01`: frontend/default native build, both Clippy variants, Rust 141/140 with seven ignores each, model-free WebView2 and cleanup pass | New EPUB/UI/native/core/runner inputs invalidate these artifact-dependent gates. Seven ignores are not executed evidence. Renew required consumers once. |
| RAC `F-Docs-R1-01`, `F-Docs-R2-01`: 31 guard tests and renewed evidence guard pass | Unchanged isolated guard-test leaf is a candidate. Markdown discovery/index changes require a fresh guard. |
| [VAF-R5-20261028](../evidence/validated-audit-follow-up/review-R5.md), HEAD `beb1093447a9bd75ee3eee9c28575e4a902b55d7`; R4 implementation and L1 lifecycle/restoration accepted | Useful failure fixtures and lifecycle boundary. Its `review-final.md` is historical R3 BLOCKED, not the accepted closure. No old installer PASS accepts this new binary. |
| [SAC final review](../evidence/static-audit-corrections/review-final.md), `SAC-R4-20261028-01`, HEAD `7c00f2f633ffd0c79043ab694f29b7defb46941a`; [M3 ledger](../evidence/static-audit-corrections/M3-validation-ledger.md) contains Piper/Chatterbox and lifecycle passes | Retain model/DSP/license history and verified immutable payloads as assets. Piper's changed adapter requires new core evidence; optional v7 inference is not changed by this plan. |
| [F06 execution ledger](../evidence/validated-chat-findings-corrections.md), and [NLC reviews](../evidence/narration-logic-corrections-review.md) | Reuse existing continuation/containment fixtures. Neither covers the missing Stop-to-Play or obsolete selection cases. |

Observed durations explain scheduling choices, not promised costs. Historical
failures, skipped/ignored cases and unobserved real-inference measurements remain
explicit. Do not relabel asset reuse, omitted irrelevant gates or source reading
as reused test results.

### Reuse decisions and deduplication

Apply the complete-input proof in the
[validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md):
retrieve the immutable original receipt, compare every consumed source/import,
test/fixture and discovered membership, configuration/lock/tool/library,
environment/isolation assumption, generated input and tested artifact. Include
HEAD/branch where a runner consumes them. A new independent review records
the exact old gate and why the current patch is outside its input closure.
Missing execution-time identity cannot be reconstructed into old proof.

Candidate savings are shared's unchanged tests plus its `generate:check`,
isolated evidence-guard tests, and genuinely independent Node leaves such as
native-WebDriver-client or acquisition-file-barrier. SAF-13 may consume/change
the former, in which case it is no longer independent. The adapter-layout Node
suite also consumes locked Python and package identities: do not exempt it by
filename. Ordinary, Windows-release, portfolio and native-smoke leaves are
affected by this plan or its dependencies.

At M0 choose one route: (A) prove the few independent leaves and run all affected
leaves directly, or (B) run `test:typescript` once with its hooks/seven Node
suites. Prefer B when proving independence is more work than its roughly
84-second historical execution. Do not run B and then all its complete leaves
again. Shared's generation check must be executed or specifically proven reused;
a package build alone does not replace it. The same rule applies to guard tests.

Use directed red/green cases to establish the missing behaviors, then one final
full Python suite and one selected TS route. Do not run `check` and
`check:portable` as well as their leaf commands. Preserve all applicable exclusive
leaves: Rust variants, native build, standalone frontend and Python build.
The report lists executed leaves and does not claim an aggregate ran. Required
CI is not waived. After a PASS, rerun only gates invalidated by a later change,
with a new review of their dependency proof.

### Gate table

| Gate and invariant | Existing command / selection | Timing and invalidation |
| --- | --- | --- |
| D-Desktop | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/settings/ReaderSettingsDialog.test.tsx src/settings/narration-settings-actions.test.ts src/App.test.tsx src/tts/product-narration-coordinator.test.ts src/tts/hardware-profile-compatibility.test.ts src/tts/OptionalChatterboxControls.test.tsx src/reader/images/SemanticRasterImage.test.tsx src/reader/SemanticDocument.test.tsx -t SAF` | New tests use `SAF`; zero selected cases is not evidence. Current shared/dist prerequisites must exist. Select only the relevant files during a unit's directed diagnosis; this is not a repeated full baseline. |
| D-EPUB | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/integration/narration-preparation-matrix.test.ts src/narration/narration-normalizer.test.ts src/narration/narration-resource-bounds.test.ts src/document/xhtml-projector.test.ts -t SAF` | Same directed-selection rule. Public matrix and bounds controls must be included before claiming SAF-10 complete. |
| D-Python | `pnpm.cmd test:python -k saf` | Add `saf` to new regression names; existing complete controls run in F-Python. No real Qwen worker/model. |
| D-Host / D-Native | `node --test --test-name-pattern=SAF apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs apps/desktop/scripts/native-smoke.node-test.mjs`; `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml saf` | Discover new tests through existing suites; test real bounded benign children and loopback paths outside sandbox. Add further exact current suite paths if the established owner requires them. |
| F-Static | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd typecheck:typescript`; `pnpm.cmd format:check:python`; `pnpm.cmd lint:python`; `pnpm.cmd typecheck:python` | Cheap checks before expensive preparation. Typecheck prepares packages. Renew only leaves consumed by later edits/generated files; include any external new helper omitted by configured service globs. |
| H-Core: corrected packaged Piper | `pnpm.cmd inventory:release:check`; if necessary `pnpm.cmd inventory:release` before packaging; `pnpm.cmd package:piper-core:write-manifest`; `pnpm.cmd package:piper-core:check` | Once on final adapter/smoke inputs, after directed tests/static checks. Both offline real voice smokes are already inside generation. Verify delimiter case traverses the literal route. Reuse hash-verified downloads/voice assets, not the obsolete assembled core or its PASS. |
| F-TS | Route B: `pnpm.cmd test:typescript`. Route A: `pnpm.cmd --filter @voxleaf/epub test`, `pnpm.cmd --filter @voxleaf/desktop exec vitest run`, and `node --test apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs apps/desktop/scripts/native-smoke.node-test.mjs` | One route on final source/generated inputs. Route A must add the existing WebDriver-client, adapter-layout or acquisition-barrier suite if its independence/reuse proof fails. Any omitted shared/hook/Node leaf needs explicit reuse proof. Tests, fixtures, import/discovery or environment changes invalidate reuse. |
| F-Python | `pnpm.cmd test:python -o cache_dir=../../tmp/evidence/static-audit-follow-up/pytest-cache`; `pnpm.cmd build:python` | Once after final Python and generated authority inputs. Covers the v7-preparation test files too; do not repeat that alias. No historical model benchmark. |
| B1: mounted interactions/accessibility | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts` | Entire final affected spec once, with existing package/frontend hooks. New cases cover the actual A-to-B interaction and decorative role/name. Existing audio, locator, cancellation and focus controls remain. |
| F-Build | `pnpm.cmd --filter @voxleaf/desktop build` unless the identical browser-build leaf is proven; `pnpm.cmd build:desktop` | After B1 and final core generation. One current native binary. Tauri's own before-build hook is retained, not silently removed. Record artifact bytes. |
| F-Native | `pnpm.cmd format:check:rust`; `pnpm.cmd lint:rust`; `pnpm.cmd test:rust` | After final frontend/core/native inputs. Both default/release-locked variants required; current `tts_release_core` tests are included, not a duplicate separate filtered final run. Renew changed native/resource/script consumers. |
| N1: packaged model-free path/cleanup | `node apps/desktop/scripts/native-startup-smoke.mjs` | Directly reuse F-Build's binary, without a wrapper rebuild. New deadline behavior has dedicated benign-process tests; this run verifies the real driver/WebView2 cleanup path. If that combination cannot cover the changed deadline path, add the smallest tested existing-runner selection before acceptance, not an unversioned temporary script. |
| F-Docs | `pnpm.cmd check:evidence`; `pnpm.cmd test:evidence` unless proven reused; `git diff --check` | Final docs and again after staging when required by index discovery. No application suite merely for planning/archive prose. Manual link/scope/diagram review remains necessary. |

### Expensive gates excluded unless their boundary changes

Do not rerun all six engine arms, six playback rates, Chatterbox GPU inference,
live downloads, full reader-performance benchmarks, historical quality voting,
or a personal install/uninstall journey by default. No affected requirement is
proved merely by doing more of those workloads. Existing immutable models,
voice downloads and optional payloads may be reused after integrity checks.

Reopen the specific gate if implementation changes its owner: installer hooks,
uninstall arguments or personal-data relocation require an explicit restoration
plan. SAF-16's header/error ordering is covered by the fresh loopback cases,
both Rust variants and native smoke, without a complete download. Changes to
origins, redirect policy, downloaded bytes, integrity, extraction or promotion
require their applicable acquisition gates when equivalent bounded coverage
does not establish the changed invariant or a concrete concern remains;
new inference/DSP/bootstrap behavior beyond literal Piper requires appropriate
exact-host coverage. A new support/performance/quality claim requires fresh
measurement of that claim. Prefer the existing narrow runner selection over
the full portfolio. Do not use a time budget to skip an applicable requirement.

## Risks and rollback

- SAF-09 needs consistency across asynchronous persistence, not merely a stale
  React callback guard. Contain the current authorized owner before committing
  a valid selection; obsolete operations cannot transfer authority to B.
- SAF-10 must preserve conservative ambiguity, work bounds, privacy and exact
  ranges. Overlapping context is never emitted twice or written to receipts.
- SAF-11's adapter binding must not affect other voice instances or reinterpret
  ordinary text. No unverified silent fallback to raw phonemes on error.
- SAF-13 cancellation must not race continuing work against teardown. Unknown
  exit/cleanup is a failure with retained recovery material, not success.
- Private scorecards remain disposable after success; fixing retry must not
  introduce indefinite retention, copying into Git or widened deletion roots.
- Before any host mutation, record owned resources, original state, action,
  restoration and verification. Process identity includes creation time and
  executable/handle identity, not PID alone. Use isolated disposable roots;
  preserve user data, pre-existing firewall rules and unrelated processes.
- Preserve original failed receipts. Classify regression, baseline, environment
  or harness/cleanup failure. One infrastructure retry needs a diagnosed changed
  condition; a second failure stops that stage for replan. No repeat-until-green.
- Roll back only inspected task-owned edits/artifacts; never reset/clean the
  shared workspace or remove recovery backups to make a gate pass. Generated
  artifacts are regenerated from the selected source, not patched by hand.

## Progress log

- [x] 2026-10-29: Revalidated findings statically and retained narrower claims
  for 03/07/13 and P3 impact for 03/06/15.
- [x] 2026-10-29: Read plan/architecture/product/testing/evidence instructions,
  inspected existing owners/tests/commands and recent RAC/VAF/SAC records.
- [x] 2026-10-29: Retrieved RAC raw receipts and verified the R2 manifest plus
  640 matching non-document source entries; no PASS reuse approved.
- [x] 2026-10-29: Created `codex/static-audit-follow-up` from clean `65b19fb`.
- [x] 2026-10-29: Drafted this planning-only ExecPlan and its minimal gate map.
- [x] 2026-10-29: Independent read-only planning reviews covered all six units
  and reuse/gate selection. Clarified espeak serialization, the post-preflight
  spawn-error regression and the narrow download-cancellation acceptance.
- [x] 2026-10-29: Documentation guard, whitespace and relative-link inspection
  pass in local PowerShell outside the sandbox. No implementation/test executed.
- [x] M0: Subsequent implementation authorization, clean expected HEAD/index,
  closed inputs/identities, missing regressions and gate ledger; Route B selected.
- [x] M1: Reader/preparation/Piper corrections and directed regressions.
- [x] M2: Optional lifecycle/tool corrections and directed regressions.
- [x] M3: Combined host validation, cleanup, independent R2 APPROVE and archive.

## Discoveries and decisions

- The latest recorded source bytes match the pre-edit tree; that supports a
  reference baseline without pretending the previously missing cases passed.
- Reusing fixtures/assets and avoiding duplicate suites is the principal
  reduction. A full inexpensive leaf can cost less than forensic reuse proof.
- `write-manifest` already performs the whole Piper build and bilingual smoke;
  separate preceding `build` would duplicate it. Preserve generation order.
- Core evidence cannot be carried over after changing its copied adapter;
  frozen Chatterbox v7 need not be rebuilt for a live Piper-only change.
- The original documentation-only planning task was exempt from runtime
  `change_reviewer` acceptance. This authorized behavior patch requires current
  independent APPROVE after implementation and host validation.

## Final validation results

**Implementation and runtime validation accepted by SAF-R2-20261029.**
M0/M1/M2 directed regressions, final TypeScript/Python suites, bilingual core
generation, 19 Chromium cases, frontend/native builds, both Rust variants and
model-free WebView2 smoke/cleanup pass. The exact commands, original failures,
counts and artifact identities are in the
[execution ledger](../evidence/static-audit-follow-up/execution-ledger.md).
No historical PASS is reused. [SAF-R1-20261029](../evidence/static-audit-follow-up/review-R1.md)
requested one U5 parent-PID provenance correction, now implemented with matching
directed and affected-host evidence. R2 approves the exact corrected patch;
the separate R3 assessment covers archive/index/receipt documentation and
unchanged runtime evidence. No commit is authorized.

Planning-only checks on 2026-10-29:

- `pnpm.cmd check:evidence`: PASS from local PowerShell outside the sandbox.
  The first invocation stopped before the guard because PATH selected pnpm
  11.25.0 instead of the required 11.15.1. Selecting the existing Corepack shim
  for that process, with Corepack network disabled, resolved it. No installation
  or dependency/lock edit occurred. This is environment diagnosis, not a test
  failure or evidence of implementation behavior.
- `git diff --check`: PASS; renew the staged check before committing.
- Relative Markdown destinations in the three planning files resolve; source
  scope and gate map received independent read-only planning reviews.
- No application tests, guard test suite, build, model, browser or native runtime
  was executed. No historical PASS has been rebound to this plan.

The original planning Git handoff contained only this plan and its two index
entries. That documentation commit did not accept implementation. Current work
must remain uncommitted under the subsequent execution authorization.
