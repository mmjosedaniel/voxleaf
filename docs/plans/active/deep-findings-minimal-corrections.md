# Minimal corrections for the deeply revalidated findings

## Goal

Resolve the supported VF-0034 through VF-0055 cases with the smallest changes to
their existing owners, preserving earlier corrections and reusing valid evidence.
Keep each trigger distinguishable even when several cases share a patch or test
invocation. Do not turn this work into a refactor or a new repository-wide audit.

**Status on 2026-11-13: planned; execution is not authorized yet.** The current
request authorizes this ExecPlan, its supporting audit records, a branch and a
commit. It explicitly excludes executing the plan. No production, test, runtime,
generated artifact or completed-plan changes belong to this planning commit.
The intended branch is `codex/deep-findings-minimal-corrections`.

## User-visible outcome

- Reader recovery accepts proven scrollbar movement, failed visual following
  cannot replace a measured location, and opening after a storage-read failure
  does not overwrite an existing checkpoint with an automatic beginning save.
- Supported EPUBs retain inline text and stable block construction around inert
  anchors, accept navigation labels with edge whitespace, and prepare bounded
  narration without structural-event overflow, silent-prefix dead ends or lost
  lexical-expansion letters.
- Spanish quoted ordinals and supported time spacing produce consistent text.
  Piper retains scene transitions across omitted punctuation-only segments.
- Buffering messages describe the threshold that actually resumes playback.
  Completed playback cannot retain an impossible pending speed change, and
  callbacks that stop a run cannot trigger a stale failure or synthesis dispatch.
- Chatterbox storage and retry actions reflect current installed validity;
  successful explicit verification can restore the selected narrator. Selecting
  the already healthy profile preserves the current diagnostic episode.
- Maintainer installer waits terminate with verified ownership, and a quality
  finalization setup failure preserves staged inputs and permits a safe retry.
- Stop-time played duration is described at its established receipt precision.
  VF-0050 does not introduce a new exact interrupted-frame guarantee.

These are intended outcomes, not implemented or freshly tested claims.

## Current state

The inspected baseline is `main` at
`5fdb2dc835e99e43034e8b40c99817f45236358f`. Product sources match that commit.
Its preceding product integration is #314,
`403eb27916afe26d4794a7e36aeb97e6d1529bf1`; #315 adds the findings workflow.
At planning entry the index was empty. The only worktree changes were the
registry, audit index and seven audit/reconciliation reports from this chat.
They are included as the evidence for this plan, without rewriting the earlier
five-pass reports or their conclusions.

Read the [deep validation](../../development/findings/audits/2026-11-13-deep-findings-validation.md),
[historical reconciliation](../../development/findings/audits/2026-11-13-findings-reconciliation.md),
[audit index](../../development/findings/audits/README.md) and
[registry](../../development/findings/registry.md). The deep report incorporates
the chat's case-specific investigations, original plans, tests and current callers.
It qualifies earlier overstatements and adds VF-0054/VF-0055. Its source links and
historical aliases are the detailed intake authority; this plan defines the work.

Nineteen of the original twenty cases have source-supported violating sequences.
VF-0050 is an established measurement limitation with no inspected requirement for
exact interruption accounting. VF-0054 and VF-0055 are two additional static
candidates. All 22 retain their current registry dispositions until execution
supplies the specified evidence. Static support does not establish natural
frequency, host reproduction, acoustic output or successful correction.

| ID | Trigger and present consequence | Earlier work and uncovered condition | Unit |
| --- | --- | --- | --- |
| VF-0034 | After unavailable placement, native scrollbar movement reaches readable text but cannot admit manual recovery; Play remains disabled. | CFR-03 and CI314 cover wheel/PageDown and passive-restoration arbitration, not the scrollbar. | U1 |
| VF-0035 | A segment completes after follow geometry failed; the completion writer can replace measured manual position B with audible end A. | PN-04 stops before completion; RCF-16 covers manual disarming. | U1 |
| VF-0036 | An inert inline/empty anchor inside a wrapper with an ID flushes projected text, shifts generated blocks and can lose the wrapper's target. | CFR-04 preserves real block descendants; its fixture does not combine the parent ID and inline split. This is a #314 regression. | U3 |
| VF-0037 | `Dijo «Llegó 1.º».` is treated as a nonterminal masculine ordinal. | CFR-18 terminal ordinals and R7 quotation context did not cover paired closing punctuation after the ordinal. | U4 |
| VF-0038 | After committed installation with failed cleanup, invalid installed files leave an old receipt advertising installed bytes. | CFR-22 covers failed transfers; RCF-13 preserves a valid installed package after cleanup failure. | U2 |
| VF-0039 | A supported time preceded by `la`/`a la` and U+2009 can gain a duplicate article. | CFR-09 covers NBSP/NNBSP; the article lookbehind and later whitespace collapse differ. | U4 |
| VF-0040 | Ordinary Chatterbox installer or uninstaller never exits, leaving finalization and application-data restoration pending. | FPA-5.3 bounds a different PowerShell lifecycle runner. CCF-C04 covers spawn failure. | U9 |
| VF-0041 | Prepared 2/5/10-minute refill messages show the production target even though automatic resume uses one minute. | B01 preserves the production target; RCF-20/SFA-05 cover presentation and rounding, not this distinction. | U6 |
| VF-0042 | The second exclusive directory creation fails before finalization's guarded region; retry encounters the first directory and CLI can expose a raw error. | M006 and CFR-06 cover normal finalization/generation admission. CFR-21's v12 publisher is another owner. | U10 |
| VF-0043 | Check fails against a retained committed-package receipt; the next generic Retry moves to acquisition confirmation instead of re-verification/cleanup. | RCF-13 and CCF-C14 distinguish valid active cleanup from acquisition, but not this failed Check route. | U2 |
| VF-0044 | A transient repository read failure falls back to book start; hide/close or passive initial sampling can save that fallback over a valid checkpoint. | M004 blanket initialization and RPI-01 canonical restoration do not prove this failed-read sequence. ADR-0011 reserves malformed repair for validated user saving. | U1 |
| VF-0045 | Pause synchronizes a new audible segment; mounted reader callback stops an unavailable chapter; the outer operation then handles stale player work as a current failure. | B04 and prior pause receipts cover containment separately, not this reentrant ordinary Pause path. | U7 |
| VF-0046 | Explicit Check returns directly from failed to Installed, or a failed poll precedes successful acquisition; App leaves the selected narrator unavailable. | CAF-R3.1 covers an observed Verifying transition; SFA-06 covers the inverse poll/action order. | U2 |
| VF-0047 | XHTML/NCX labels retain edge NBSP; strict BookV1 validation rejects the publication. A whitespace-only label can also suppress title fallback. | M003 internal NBSP preservation, CFR-13 breaks and RCF-15 hidden labels do not cover these edges. | U3 |
| VF-0048 | Natural completion retains pending rate preparation; selecting/resetting speed after completion leaves a nonexistent next-boundary change or stale feedback. | RCF-19 assumes a real buffered successor; CCF-C11 addresses active reset ownership. | U6 |
| VF-0049 | Clicking the already healthy selected Chatterbox profile calls the accepted selection callback and clears current diagnostics. | CFR-08 guards Piper only. MAF-10's loaded-profile admission is a protection to retain. | U2 |
| VF-0050 | Stop between worklet reports freezes the last accepted rendered-frame count, which may omit a positive tail. | CCF-C20 confirms rendering/end and DCR-06 handles Pause. Exact Stop precision has no inspected acceptance threshold. | U11 |
| VF-0051 | A legal window with 1,365 tiny leaves needs 4,097 structural events although public preparation consumes only leaves. | M005 event bounds and B02 deep cursors cover other shapes; depth bounds do not constrain breadth. | U5 |
| VF-0052 | An unprotected prefix of 320 U+200B plus `A`, or a sufficiently long interior silent run, exhausts Piper source capacity without a legal advancing cut. | CFR-20 explicitly drains whitespace; ADR-0066 silent tails already progress. Formatting omissions are a distinct class. | U5 |
| VF-0053 | An omitted punctuation-only Piper segment owns a scene break, so the following spoken handoff loses its 1,200-ms scene transition. | SFA-01 preserves direct scene boundaries; M010 omission tests use leading punctuation. | U8 |
| VF-0054 | A hard cut inside an expanded Spanish ordinal makes a warm continuation lose letters and differ from cold reconstruction. | M005 promises expansion-safe, batch-independent segments; the expansion has multiple source origins without match-local atomicity. | U4 |
| VF-0055 | Snapshot synchronization triggers inline Stop before client synthesis is active; the outer method still dispatches the retired request. | CCF-C07 guards startup publication; the synthesis publication lacks the corresponding check. The supported timing sequence requires no additional outer clock delta. | U7 |

## Scope and non-goals

Implement U1-U10 only after their discriminating reproductions; retain the
qualified U11 disposition below. Related variants stay under their existing IDs.
If a candidate cannot be demonstrated at the stated public boundary, record the
counterevidence and narrow or defer that ID instead of manufacturing a fix.
In particular, distinguish controlled production-caller timing from measured
natural frequency for VF-0045/VF-0055.

Use current owners and existing test harnesses. Share one receipt-authority fix
for VF-0038/VF-0043 and one reentrancy guard pattern for VF-0045/VF-0055. Consolidate
normalizer/packer edits before final EPUB checks, and App/coordinator edits before
final desktop checks. Do not require one new helper, test file or full suite per ID.

No dependency upgrades, model changes, new persisted audio/text, new protocol,
schema migration, broad parser rewrite, blanket checkpoint reset, new buffering
policy, automatic inference retry or global process cleanup. Do not reopen
VF-0001's approved recovery policy, B04's preserved prior checkpoint,
VF-0032/VF-0033's deferred process/API questions, or frozen benchmark authorities.
Do not change completed plans or historical receipts. Push, PR creation, merge
and release are outside the current authorization.

## Relevant files and documentation

Paths below are relative to the repository root. Consult existing callers and
tests before editing; a listed support file is not an instruction to change it.

| Unit | Primary implementation owners | Existing regression owners |
| --- | --- | --- |
| U1 | `apps/desktop/src/reader/{ReaderPublication.tsx,active-visual-locator.ts,segment-highlight-controller.ts}`, `apps/desktop/src/App.tsx`, `apps/desktop/src/persistence/reader-position-{restore,save}-coordinator.ts` | Corresponding reader/persistence tests, `App.test.tsx`, `src/integration/package-reader-matrix.test.tsx`, reader browser suites |
| U2 | `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`, desktop `src/tts/{optional-chatterbox-client.ts,OptionalChatterboxControls.tsx}`, `src/App.tsx`, `src/settings/ReaderSettingsDialog.tsx` | Native `tts_optional_chatterbox/tests.rs`, client/controls/App/Settings tests, existing hardware controls/settings action tests |
| U3 | `packages/epub/src/document/xhtml-projector.ts`, `src/navigation/navigation-document.ts` | Projector/navigation, public opening, ingestion and package-reader matrices |
| U4 | `packages/epub/src/narration/narration-bilingual-normalizer.ts`, existing source-mapped protection/packer interfaces only where needed | `narration-normalizer.test.ts`, `narration-segment-packer.test.ts`, public `narration-preparation-matrix.test.ts` |
| U5 | `packages/epub/src/narration/{narration-source-window.ts,narration-preparation.ts,narration-segment-packer.ts}` | Source-window/source, packer, resource-bounds and public preparation tests |
| U6 | `apps/desktop/src/tts/{adaptive-preparation-presentation.ts,adaptive-buffer-scheduler.ts,product-narration-coordinator.ts,pcm-playback.ts}` | Adaptive controls/scheduler, Product controls, PCM and coordinator tests |
| U7 | `apps/desktop/src/tts/{product-narration-coordinator.ts,pcm-playback.ts}` | PCM/coordinator tests with real mounted Reader/App callbacks and typed-client spies |
| U8 | `apps/desktop/src/tts/product-narration-coordinator.ts`, private preparation metadata only if existing boundary reasons are insufficient | Public preparation plus coordinator semantic-handoff tests |
| U9 | `apps/desktop/scripts/ordinary-chatterbox-release-host.mjs`, existing `scripts/windows-package-lifecycle-installer.ps1` as the reusable ownership primitive | `ordinary-chatterbox-release-host.node-test.mjs`, `windows-release.node-test.mjs`, disposable Windows process scenarios |
| U10 | `services/tts/benchmarks/quality.py`, `quality_cli.py` only if typed error mapping needs adjustment | `services/tts/tests/test_benchmark_quality.py`; shared quality-helper consumers |
| U11 | `docs/development/testing.md` and registry precision statement | Static consistency with worklet/backend/PCM receipt ownership |

Read [MVP](../../product/mvp.md),
[reader controls](../../product/reader-settings-and-playback-controls.md),
[system diagram](../../architecture/system-diagram.md),
[overview](../../architecture/overview.md),
[roadmap M005](../roadmap.md#milestone-5-prepare-text-for-natural-narration) and
[completed M005](../completed/M005-narration-text-preparation.md).
Applicable decisions are ADR-0007 (safe ingestion and locator recovery), ADR-0011
(storage), ADR-0012 (source-mapped bounded preparation), ADR-0057 (traversal,
capacity and unavailable chapters), ADR-0065 (validated runtime/diagnostics),
ADR-0066 (silent tails) and ADR-0070 (placement and recovery). Their canonical
files are under `docs/architecture/decisions/`.

Follow [findings maintenance](../../development/findings/README.md),
[independent change review](../../development/agentic-change-review.md),
[testing](../../development/testing.md) and
[evidence retention](../../development/evidence-retention.md). Reuse the historical
controls cited by the deep report. The latest completed CFR plan and its
[final review](../evidence/chat-findings-recovery/review-final-r03.md) and
[CI314 follow-up](../evidence/chat-findings-recovery/ci-follow-up.md) are especially
relevant; they are historical acceptance, not approval of this future patch.

## Architecture and constraints

The package owns safe semantic projection, normalization, source ranges and
bounded continuation. The reader owns measured visual placement. App/persistence
own saving and selected-profile availability. The coordinator owns run identity,
dispatch and semantic timing; the player owns rendered progress. Native optional
acquisition owns installed verification and cleanup provenance. Keep those
boundaries, local inference, ephemeral audio and existing cancellation ownership.

Preserve all source/work/output/cursor and audio queue limits. A private
leaf-only projection in U5 may omit retained structural events that its consumer
never uses, but must still charge their traversal work and carry language/quote
context. Never fix overflow by raising limits or resetting work accounting.
No public contract or new process boundary is expected. Inspect the canonical
diagram at closeout and update it only if the actual architecture changes.

Two scoped decisions prevent unnecessary changes:

1. **VF-0036 compatibility:** remove the newly introduced inline flush while
   preserving genuine block descendants. Same-byte publications can already have
   stored generated locators from different projection versions. Existing saved
   tuples contain no reliable provenance to distinguish them. Retain the existing
   exact/nearest-valid recovery policy; document that an ambiguous old tuple may
   resolve to another passage, and verify a new manual save/reopen. Do not invent
   lossless migration, infer provenance from a book hash, or reset every book.
   A new versioned locator/storage scheme would require separately justified scope.
2. **VF-0050 precision:** propose documenting played duration as confirmed rendered
   frames received before retirement, a lower bound at abrupt interruption. The
   6,000-frame report cadence is not a universal undercount bound because message
   delivery can lag. Do not delay Stop or add asynchronous terminal callbacks just
   to manufacture exact diagnostics. Preserve the observation in the registry;
   only close it as an accepted precision limitation after review of the current
   documentation/requirements. Evidence of an existing stronger requirement would
   reopen this decision and require a separately bounded metrics-only receipt.

## Milestones

All execution milestones below are **not started**. The work and validation are
future instructions. The planning inspection is recorded separately in Progress.

### M0 — Establish scoped execution evidence

After execution is authorized, record HEAD, index and dirty-input identities.
Reconcile any source drift with this plan and the registry. Read the original
immutable receipts before reusing them. Build a small evidence ledger under
`docs/plans/evidence/deep-findings-minimal-corrections/`; keep raw logs, inventories
and manifests under ignored `tmp/evidence/deep-findings-minimal-corrections/`.
Do not copy historical logs into Git.

Prepare new regressions in the existing owners, grouped by shared dependencies.
Run the focused failing assertions on the original relevant implementation before
changing that owner. Capture the exact failure, expected invariant and next action.
A setup failure is not RED evidence. Reuse available baseline context; do not run
all historical suites to establish another broad baseline. Perform cheap host,
tool/asset and containment readiness checks before any expensive native stage.

Validation: discriminating failures and an explicit run/reuse/defer decision per
selected gate. No candidate becomes confirmed from a mock-only impossible order.

### M1 — Bound maintainer failure paths (U9, U10)

**U9 / VF-0040.** Replace the two unbounded installer waits with one bounded owned
process path. Prefer adapting the existing suspended-start Windows Job helper
over copying its process-tree implementation or polling global PIDs. Both
installation and uninstallation need descendant termination/reaping and a common
deadline. Retain the distinction between proven no-spawn and uncertain failure,
the stable-root-absence observation, and primary/cleanup error reporting. Restore
application data only after containment is verified; otherwise retain the owned
backup and report recovery information without private inventory contents.

Use the existing Node harness and disposable Windows children for hanging parent,
parent-exits/descendant-lives, successful exit, spawn failure, and failed reap.
Both installer and uninstaller routes must reach a bounded outcome. Assert an
unrelated process/sentinel survives, no owned descendants remain on verified
cleanup, original bytes restore only when safe, and a later retry can proceed.
Exercise the actual production wrapper, not only a mocked timeout. Reuse one
fixture/helper for both routes. If the reused PowerShell primitive changes, its
original lifecycle coverage joins the affected scope.

**U10 / VF-0042.** Guard exclusive finalization directory creation before the
first move. Remove only a directory created by this invocation and still empty;
preserve a pre-existing path, concurrent contents and the primary error if cleanup
also fails. Surface a content-free `QualitySessionError` through the existing CLI
mapping. Do not move this setup into the later destructive cleanup block or use
`exist_ok=True`. Preserve subsequent finalization's existing ownership rules.

Inject failure at the second mkdir with tiny synthetic WAV inputs already staged.
Assert the staging byte inventory is unchanged, existing/conflicting directories
survive, the CLI does not print a raw private path, and retry with the same session
identifier completes the ordinary blinded result. Add rollback-failure and
existing-directory controls to the same parameterized fixture; no model is needed.

Validation: G-PY and G-NODE, then affected static leaves. The final real installer
smoke is shared with M5; no download or inference is needed to prove a process wait.

### M2 — Correct EPUB projection and bounded preparation (U3-U5)

**U3 / VF-0036.** Make inert phrasing/empty/whitespace/hidden anchors transparent
to the surrounding inline run. Flush only for admitted semantic block boundaries;
"any admitted content" is too broad because inline text would still split the
parent. Preserve child blocks, publisher IDs, duplicate-ID policy, source spaces
and language. Use `<p>Intro</p><div id="target">Alpha <a id="empty"></a>Beta</div><p>Gamma</p>`
and small variants to assert the parent target, text, generated following-block
identity and exact offsets. Retain CFR-04's real nested block controls. Compare
pre-#314, current and corrected projection expectations from source history;
exercise current opening and save/reopen under the compatibility limit above.

**U3 / VF-0047.** Normalize label-edge whitespace consistently with the existing
public schema before empty-label/title fallback in both XHTML and NCX collectors.
Keep internal NBSP, raw XML/attribute budgets and retained label limits. Use
literal U+00A0 and `&#160;`, whitespace-only labels, title fallback, hidden labels,
breaks and a valid internal-NBSP control through public EPUB opening. Check both
detailed and BookV1 navigation outputs; do not weaken the schema to admit bad edges.

**U4 / VF-0037.** Let the bounded terminal-ordinal decision see through proven
paired closing quotation punctuation. Reuse the existing bounded quotation
context; implement straight-quote parity explicitly if needed, rather than
assuming every closing-looking mark is paired. Assert `Dijo «Llegó 1.º».` uses
`primero`, while an ordinal before a noun still uses its accepted form. Cover
straight/typographic quotes, unmatched punctuation, explicit language/code and
warm/cold continuation without expanding the lookahead bound.

**U4 / VF-0039.** Align supported inline-space treatment in the time/article
decision with later normalization. Include U+2009 and consider U+2007 only under
the same explicit supported-space rule. Preserve capitalization and source spans.
Parameterize ASCII/NBSP/NNBSP/thin-space, bare time, `la`/`a la`, surrounding numeric
compounds and seconds. Line/paragraph separators, semantic breaks, code and
foreign language must not acquire authority from the new inline-space handling.

**U4 / VF-0054.** Give each accepted lexical expansion one private match-local
atomic cut boundary while retaining its per-code-point source mapping. Prefer
cutting before the expansion when it fits in a fresh segment. Do not merge adjacent
independent expansions merely because their protection categories match, silently
raise weights, or convert a small expansion into an oversized-token error.

The exact witness is a Spanish default-language paragraph of 156 `a` characters
followed by `#1.º.`, using current Piper v2's 160 spoken-weight limit. The old
hard cut can emit the `pri` prefix and then lose `mero` in warm continuation.
Assert complete ordered spoken text and equal warm/cold results at every returned
boundary with batch sizes 1, 2 and 8; place seven short paragraphs before it to
exercise desktop's eighth-segment continuation. Include feminine/multidigit
ordinals, a legal earlier whitespace cut, adjacent expansions, protected oversized
tokens and preserved source ranges. Keep frozen legacy normalization unchanged.

**U5 / VF-0051.** Prefer a private leaf-only retained projection for the public
preparation consumer, which currently discards structural events. Keep the full
event-producing API's ceiling for its other callers, charge every structural
transition and preserve inherited contexts/cursor checkpoints. If implementing a
resumable event window is smaller, demonstrate a complete continuation for every
boundary before choosing it; simply stopping at the cap is insufficient.

Use public preparation of 1,364 versus 1,365 small leaves, quoted/nested variants
at 4,096/4,097 events, initial versus later windows, and the next spine document.
Drain batches of 1 and 8 and assert ordered ranges, no loss/duplication, bounded
retained state/work, cold deep starts, warm continuation, cancellation and retry.
Retain the low-level full-event overflow controls.

**U5 / VF-0052.** Extend the existing no-legal-cut advancement only to explicitly
approved unprotected formatting omissions such as U+200B/U+2060. Preserve source
offsets and work debits; do not drain arbitrary omitted code, images or protected
content. Soft hyphen and semantic line-break policy remain separate.

Test 319 marks + `A`, 320 marks + `A`, interior `A` + 638/639 marks + `B`, silent
tails and whole 4,096-position silent windows. The corrected 320-prefix range must
start at offset 320 and include `A`. Require a subsequent batch/next paragraph to
advance, with cancellation and protected-content controls. Retain CFR-20's ASCII
and nonbreaking whitespace cases. Share public fixtures with U4 where helpful.

Validation: one final G-EPUB union after these shared owners settle; affected
G-DESKTOP public-consumer controls follow. No voice generation is required to
prove text, mapping, atomicity or bounded traversal.

### M3 — Preserve playback ownership and terminal state (U6-U8)

**U6 / VF-0041.** Derive the visible automatic-resume threshold from the same
existing scheduler policy used to resume. Keep the selected production target
unchanged and distinguish it only where it informs the user. Both compact and
detailed controls must agree. Parameterize prepared targets 1/2/5/10 minutes,
initial preparation versus refill, voluntary Pause, rate-adjusted lead, final tail
and capacity escape. Do not add a fixed wall-clock delay or new scheduler target.

**U6 / VF-0048.** At genuine completion retire pending speed preparation and its
generation ownership. Speed selection/reset after completion updates the saved
preference without scheduling a nonexistent boundary or allowing a late callback
to reset it. Keep last highlight/end position and completed Stop/Play behavior.
Assert completion with pending preparation, late success/failure, selection/reset
after completion, and Stop then explicit Play at the saved rate (including 75%).
Retain real buffered-successor, voluntary Pause, fallback and active reset controls.

**U7 / VF-0045 and VF-0055.** Capture the original run token/player/scheduler and
recheck them immediately after synchronous notification/publication boundaries,
before further player operations, catch handling, abort-controller installation
or synthesis dispatch. Stale catches must not use the replacement token as their
authority. Apply the same local identity principle in PCM after started callbacks;
reuse the existing ended-callback precedent rather than redesigning the event bus.

Use a controlled direct playback clock with the real mounted Reader/coordinator
subscription order. An eligible audible transition enters a chapter rejected by
the reader's block limit and synchronously calls Stop. For Pause, assert one
containment, no spurious operational-failure state, no obsolete resume and a
successful explicit Play after navigating to valid content. Preserve B04's prior
stored checkpoint; the deep audit withdrew the ordinary persistence allegation.

For dispatch, keep the outer clock delta zero after the nested callback, and
reserve work while generation still wants more audio after Quick startup. Assert
**zero synthesis IPC calls after invalidation**, not merely no stale audio. Assert
the positive-control current request still dispatches, late completion is ignored,
cleanup settles and later explicit Play works. Check the adjacent late-preparation
abort-controller and outer-snapshot publications under this same ordering; change
them only if a demonstrated current consequence needs the same guard. No new ID
or claim of stale audible output follows solely from their code shape.

**U8 / VF-0053.** Retain a run-scoped scene-boundary fact while discarding Piper
punctuation-only segments. Apply it to the next actual spoken handoff, including
across preparation batches; do not mutate a predecessor already dispatched.
Prefer existing metadata plus one private bounded carry. If private incoming
metadata is necessary, keep it inside the existing scheduler/coordinator contract.
Do not create silent PCM or change the shared wire schema.

Use `First.` / `—` / scene break / `Second.` within a batch and with `First.` as
the eighth prepared unit. Assert the scene transition when the successor is
buffered, preserve audible ellipsis precedence, and do not transfer an omitted
segment's ellipsis delay. Include multiple omitted units, an all-omitted batch,
no successor, buffering, seek/Stop cancellation and a replacement run. Carry must
clear with run ownership and must not delay startup or natural completion.

Validation: G-DESKTOP and the selected real-browser cases, then one native playback
batch in M5. Add worklet tests only if worklet/backend source actually changes.

### M4 — Correct measured recovery, saving and optional-profile recovery (U1, U2)

**U1 / VF-0034.** First observe native scrollbar input in Chromium and WebView2.
Add only the minimum reliable gesture provenance needed to feed the existing
measured-displacement admission and cancel passive viewport restoration. A trusted
`scroll` event alone is not proof of manual intent. Do not admit programmatic
reflow, preference/initial restoration, selection or a motionless pointer.
If scrollbar delivery cannot provide the assumed signal, record that observation
and choose a bounded explicit recovery route before modifying admission policy.
Exercise actual thumb movement, the recovered exact `prepareNarration.startLocator`,
wheel/PageDown and same-locator movement controls; a synthetic scroll is a negative
control, not the positive reproduction.

**U1 / VF-0035.** Bind completion-driven visual advancement to successfully
measured follow for that segment/epoch. On failed geometry preserve manual B and
the next-Play start while retaining the heard A.end checkpoint in its own owner.
Do not just clear all following permanently. Cover valid follow, failure then
completion, geometry recovery, manual disarming, late animation frames and the
next explicit Play. Reuse PN-04/RCF-16 fixtures and inspect real callback consumers.

**U1 / VF-0044.** Automatically initialize a checkpoint only after proven absence,
not generic `book-start` fallback. Preserve failed-read/malformed bytes until
validated user navigation or audible progress owns a later save. Inspect passive
initial samples as well as the immediate flush; changing only the first-save flag
must not leave the second writer open. Avoid changing the repository format.
Use a valid mid-book record, one failed read and later available storage, then
hide/close/reselect: the original record and restored offset must survive. Include
malformed data until a genuine save, missing records, successful canonical restore,
failed-write retry, unsupported future versions and size-limit protections.

**U2 / VF-0038 and VF-0043.** Separate current installed-validity proof from the
retained receipt that authorizes root-specific cleanup. Failed Check invalidates
installed-byte disclosure but preserves cleanup ownership. Use an existing typed
installed-package-invalid route if its contract fits; distinguish it from an
acquisition failure so Retry performs real verification/cleanup, without a new
download or automatic consent. Do not hash the entire package on every poll or
discard the receipt merely to hide bytes.

Use a disposable committed fixture with a cleanup failure, remove a required
installed file, Check, refresh the native/client snapshot, restore the file and
Check with cleanup retry. Assert hidden installed size while invalid, retained
root provenance, actual second verification and Installed after cleanup. Preserve
valid active-package size on cleanup failure, active-worker protection, wrong-root
and sentinel rejection, precommit failure and ordinary acquisition confirmation.
Both native feature modes and mounted UI command selection must cover this path.

**U2 / VF-0046.** Admit a successful explicit Check/acquisition result to the
existing selected-profile refresh only while the initiating publication, profile
and language still own an unavailable narrator. Cover direct Failed-to-Installed
and failed progress-poll-before-success order. Passive healthy Installed polls
must not reset the diagnostic episode; stale results for another book/profile
must not reinitialize it. Reuse the existing refresh action, keep explicit Play,
and preserve the real reinstall/Verifying route.

**U2 / VF-0049.** Extend the existing healthy checked-profile UI guard to the
already loaded Chatterbox selection with the same profile/language ownership.
Keep the action-level admission barrier, unhealthy reselect recovery and explicit
Recheck semantics. Returning false as an apparent error is not an idempotence fix.
With nonzero metrics, click the real checked control and assert unchanged owner
and monotonic measurements. A real profile/language change and explicit Recheck
retain their documented reset behavior. No new model load is needed for the
deterministic mounted control proof.

Validation: affected G-DESKTOP, G-BROWSER and G-RUST; M5 shares native admission,
startup/playback and installer preparation. Do not run a native build per case.

### M5 — Integrate once, review and close

On the final combined source, finish only missing or invalidated union gates.
Execute required native admission with already verified local V7 inputs and the
selected packaged reader/playback coverage. Exercise the ordinary install/remove
wrapper on disposable paths with the final artifact; factor that limited smoke
into its existing Node tests if needed, instead of running the full download/GPU
journey just to test a timeout. Record the exact production functions exercised.
Preserve established install-root and user-profile safeguards and verify restoration.

Resolve U11's documented precision decision without changing Stop behavior.
Update affected product/development documentation and registry entries with exact
trigger evidence, next-action outcome and remaining qualifications. Keep the
completed M005 plan and other historical authorities immutable. The current
narration documentation may explain changed mutable behavior without rewriting
M005's original acceptance.

Freeze source and evidence, and delegate one independent review to
`change_reviewer` (GPT-6 Astra high) under the existing workflow. Supply every ID,
the full current patch, exact identities, host receipts and justified reuse.
The reviewer does not execute tests. Resolve actionable findings, rerun only gates
invalidated by the correction, and obtain approval for the exact final patch.
Missing reproduction, cleanup, required host evidence or reviewer approval prevents
acceptance of the affected scope. A historical review cannot supply this approval.

After acceptance, fill Final validation results per ID, move the plan to
`completed/` and update both indexes and incoming links. Execution/acceptance does
not independently authorize another commit, push, PR or release; use the then-current
user authorization. The present commit delivers only this plan and its records.

## Testing and benchmark strategy

### Evidence actually inspected during planning

No tests, formatter, linter, type checker, build, package, native program or
benchmark was executed for this plan. Read-only inspection compared recorded
SHA-256 values and current files; it did not refresh old receipts or certify the
current host environment.

- `CFR-CR-FINAL-R03-20261113` binds
  `tmp/evidence/chat-findings-recovery/cfr-final-r03-frozen/evidence-hashes.json`
  at `58829c2ce16a0eeecd1eec56c0fd455c485cf8a3d498999efdbe4be6e68a9d07`.
  All **377/377 indexed evidence files** remain present and match.
- `CFR-CR-CI314-R01-20261113` binds
  `tmp/evidence/chat-findings-recovery/ci314-review-r01/evidence-hashes.json`
  at `8cc04572b336496c808be5e8ec25d83b641b3633a2aa83802611a9749a791ec7`.
  All **36/36 indexed evidence files** remain present and match. These are indexed
  records, not 413 newly run checks or necessarily 413 unique files.
- The relevant captured repository rows in `ci314-unit-static.before` match
  **458/458** current files. For `g2-r02.before`, **455/458** match; the differences
  are `ReaderPublication.tsx` and `reader-reflow-restoration.ts/.test.ts`, changed
  by CI314 outside the EPUB gate. The comparison selects captured source, test,
  script/config and benchmark paths, excluding generated dist/target and installed
  dependencies. It is not proof of complete dependency/directory/environment parity.
- `g5-default-final-05.inputs.before` has **597/597** matching selected repository
  rows. `r02-python.inputs.before` has **354/355**: the captured
  `benchmarks/tts/short-segment-batch-result-v14.json` is now absent.
  `m1-final-02.inputs.before` has **350/355**: that absence plus four changes already
  explained by the later R02 capture (v3 scorecard, root package aliases, v12 test
  and CustomVoice test). Do not silently drop the missing artifact from an old
  manifest or claim complete Python-input equality.

The original receipts include commands, exits, timestamps and execution-time
captures. Current installed tools/dependencies, browser binaries, live host state
and directory membership have not been fully compared. Thus planning grants no
unconditional future runtime PASS. It establishes retrievable evidence and the
following practical reuse/invalidation decisions.

| Evidence | Historical result | Reuse decision for this plan |
| --- | --- | --- |
| CI314 `ci314-unit-static`, `g6-ci314-browser-full` | 1,318 desktop Vitest and 240 Node tests; 92 Chromium tests; TS static leaves passed. | Useful baseline and existing controls. U1/U2/U6-U8 change consumed inputs, so affected results must be renewed. Never pass filters through the desktop `test` wrapper: the historic command accidentally ran its full Vitest and Node suites. |
| CFR `g2-r02` | 563 tests in ten EPUB files passed. | Current EPUB source rows still match; do not repeat this whole baseline before RED. U3-U5 invalidate its preparation/projection consumers, so run the final affected union with new regressions. |
| CFR `g5-default-final-05`, `g5-locked-final-05` | Each mode passed 80 tests, with three existing ignored cases. | Baseline controls remain valuable. U2 changes their manager, so both affected feature-mode selections run again. Ignored exact-local admission is separate. |
| CFR `m1-final-02`, `r02-python` | Original union 122 passed; renewed v12/CustomVoice selection 40 passed. | U10 invalidates quality and `customvoice_screen.py`, which imports quality helpers; renew those consumers together. CLI/preflight and independent v12 leaves are reuse candidates only after full closure/environment and missing-v14 independence are established. Otherwise run only the uncertain leaf. |
| CFR `g4-final` | 48 release Node tests passed. | Cannot reuse after U9 merely because `windows-release.mjs` is unchanged: its tests import `ordinary-chatterbox-release-host.mjs`. Renew with the ordinary-wrapper suite in one invocation. |
| CFR `g10-native-harness`, `g10-native-smoke-r03` | 99 Node + 12 Adaptive controls; renewed native-smoke leaf 59 passed. | Adaptive changes in U6 and EPUB-consuming native-smoke inputs invalidate those leaves. Unchanged WebDriver/portfolio leaves are candidates for reuse with exact transitive/runtime proof; portfolio tests also exercise native-startup-smoke, so inspect that closure. |
| CFR G7/G8/G9, [native summary](../evidence/chat-findings-recovery/native-package-summary.md) | Startup/Piper ES+EN, local V7 admission without inference, unsigned build and six lifecycle cases passed. G8 outer cleanup failure and separate verified recovery remain recorded. | Reuse verified immutable core/model assets and build caches. Changed frontend/native inputs need new relevant runtime/artifact receipts. Old installer/playback PASS cannot certify the future build. No inference, live download, signature or Defender claim follows from local admission. |
| PN/RPI/FPA and older controls linked by the deep report | Prior acceptance covers neighboring triggers, often at older source. | Reuse fixtures, expected invariants and diagnostic methods. Latest CFR receipts supersede overlapping baseline evidence; do not rerun each historical campaign. |

For an individual PASS to be reused at execution, its original immutable host
receipt must be retrievable; all consumed source/transitive imports, tests,
fixtures, configuration, locks, discovered directory membership, tools/libraries,
runner and tested artifact bytes must match. Relevant host/isolation assumptions
must also match. Include HEAD when the runner consumes Git/version state. Record
the original report/gate, dependency comparison and why changed paths are outside
that closure. Missing inputs, unknown drift or changed assertions require the
affected gate to run. Do not regenerate old manifests to make them current.
Prepared artifacts and fixtures can be reused without treating an old runtime
measurement as current. These evidence rules do not turn this bug-fix plan into
a per-unit refactor validation campaign.

### Smallest useful gate set

Run every test and validation command in **normal local PowerShell outside the
managed automation sandbox**, from the repository root unless specified. Select
exact files with the configured runners. New regressions should use `VF-00xx`
names, enabling focused RED selection; collect/record selected names and reject
an empty selection. Parameterize related shapes within each invariant.

Do not run a full GREEN suite after every small edit and again unchanged at the
end. Use one focused RED batch per shared owner, then one final union of affected
files after the dependent edits settle. Earlier host GREEN can satisfy that union
only for an identical, independently justified subset. New failures or review
corrections justify additional runs; elapsed time alone does not.

| Gate | Timing and minimum responsibility | Existing command/runner |
| --- | --- | --- |
| G-PREP | Prepare package exports after U3-U5 and before desktop/native consumers. Reuse outputs only with exact input/output proof. An already-required TS typecheck can supply this build. | `pnpm.cmd build:packages` |
| G-EPUB | U3-U5 final union: projection, opening, navigation, mutable/frozen normalization controls, source mapping, boundaries, public batch continuation, cancellation and resource limits. | EPUB Vitest selection below |
| G-DESKTOP | U1/U2/U6-U8 final union: real App/reader callbacks, saving, owner replacement, pending rates, dispatch, UI retry and next Play. | Desktop Vitest selection below |
| G-PY | U10 model-free finalizer/CLI plus shared quality-helper consumers. Add v12/preflight only if dependency proof fails or their owner changes. | Pytest selection below |
| G-NODE | U9 actual bounded process wrapper, disposable Windows descendant tests, release attachment consumers; reused helper controls if changed. | Node selection below |
| G-RUST | U2 manager and adjacent ownership controls, default and release-locked behavior. | Two Cargo selections below |
| G-BROWSER | Real scrollbar/geometry, failed-follow completion, persistence/reopen, checked profile and completed-speed UI; existing PN/CFR/B04/RCF controls. One selected union on final inputs. | Existing Playwright runner below |
| G-NATIVE | Final WebView2/native startup and one Piper ES playback/semantic-speed arm; native scrollbar interaction must be observed. English and both mutable preparation profiles retain deterministic controls. | Existing startup and selected portfolio commands below |
| G-LOCAL | Final U2 exact local V7 admission/verification/removal; reuse local verified inputs, extend existing fault scenarios for the retained-receipt case if absent. | `pnpm.cmd test:chatterbox:v7:local-admission` |
| G-PACKAGE | One current release-locked installer from final source. U9 install/uninstall smoke uses its actual production wrapper with that artifact and disposable state. If the shared lifecycle primitive changes, renew its affected lifecycle coverage as well. | `pnpm.cmd package:windows:verified-core`; `pnpm.cmd package:windows:check`; configured lifecycle command below when affected |
| G-STATIC | Each affected language's format/lint/types once on final inputs; Rust includes both configured Clippy modes. | Configured static commands below |
| G-REVIEW | Current docs, evidence, scope, restoration, per-ID disposition and independent approval for the frozen patch. | `pnpm.cmd check:evidence`, source/diff/link inspection, required reviewer |

Final deterministic file unions (reduce only with explicit consumed-input proof;
add an adjacent consumer when implementation changes its owner):

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts src/navigation/navigation-document.test.ts src/public/open-epub-publication.test.ts src/integration/ingestion-matrix.test.ts src/narration/narration-normalizer.test.ts src/narration/narration-source.test.ts src/narration/narration-source-window.test.ts src/narration/narration-segment-packer.test.ts src/narration/narration-prepared-segment.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/integration/package-reader-matrix.test.tsx src/reader/ReaderPublication.test.tsx src/reader/active-visual-locator.test.ts src/reader/reader-reflow-restoration.test.ts src/reader/segment-highlight-controller.test.tsx src/persistence/reader-position-restore-coordinator.test.ts src/persistence/reader-position-save-coordinator.test.ts src/persistence/reader-position-repository.test.ts src/persistence/narration-position-save-bridge.test.ts src/settings/ReaderSettingsDialog.test.tsx src/settings/narration-settings-actions.test.ts src/tts/HardwareCompatibilityControls.test.tsx src/tts/OptionalChatterboxControls.test.tsx src/tts/optional-chatterbox-client.test.ts src/tts/AdaptivePreparationControls.test.tsx src/tts/ProductNarrationControls.test.tsx src/tts/adaptive-buffer-scheduler.test.ts src/tts/pcm-playback.test.ts src/tts/product-narration-coordinator.test.ts
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py services/tts/tests/test_customvoice_screen.py services/tts/tests/test_customvoice_screen_authority.py
node --test apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_optional_chatterbox::tests
```

The Python quality suite already covers its CPU-fallback helper consumer. New
finalizer CLI assertions belong in that existing suite. Do not invoke a real
quality generation/benchmark command for a synthetic filesystem rollback defect.

Use the existing browser files and keep original assertions intact:

```powershell
pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts --grep 'VF-00(34|35|36|44|45|46|48|49|53|55)|CFR-02|CFR-03|PN-|RCF-16|RCF-17|LCF completed|NLC real worklet|CCF-C07/C09/C20|preserves one canonical passage'
```

Before running, ensure new names cover the actual mounted/browser scenarios,
including the unchanged PageDown/wheel controls. U7's deliberately controlled
reentrancy remains identified as such; browser success does not establish its
natural incidence. Add only missing observability to existing harnesses.

For native work, finish the current portfolio's deterministic preflight leaves
(Product/Adaptive/Reader, WebDriver and portfolio Node tests), reusing matching
receipts where eligible. Renew the EPUB-consuming native-smoke Node leaf after
U3-U5. Existing configured leaf commands include:

```powershell
node --test apps/desktop/scripts/native-webdriver-client.node-test.mjs apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs
pnpm.cmd test:native-smoke-harness
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es --preflight-only
pnpm.cmd test:native-startup
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es
```

`test:native-startup` already builds the default native artifact. Share that
artifact across compatible scenario arms; it does not replace the release-locked
build. Add the scrollbar and relevant terminal/transition scenarios through the
existing native scenario owner if missing; a generic startup PASS cannot cover
them. Record actual exercised cases. The plan selects one Piper language because
these changes do not alter engines or language-specific runtime setup; add the EN
arm only if implementation changes that distinction or the selected arm cannot
cover it. No six-profile portfolio, GPU-quality run or redownload is selected.

If U9 changes the shared lifecycle primitive or package lifecycle behavior, use:

```powershell
pnpm.cmd package:windows:lifecycle -Installer <absolute-current-installer> -LifecycleReceipt <new-owned-evidence-directory/windows-lifecycle-receipt-v1.json>
```

Resolve and record the concrete paths before execution. This lifecycle command
does not by itself cover the ordinary Node wrapper; G-NODE/current-installer smoke
must exercise that changed path. If no safe existing path can do so, add one
bounded scenario to its current Node test owner and record the invocation before
launch, rather than inventing an undocumented CLI flag. Keep one host-mutating
owner at a time, preserve primary failures, and verify profile/process/resource
restoration before a later gate. Failed containment is not permission to restore
over a still-running process or delete an uncertain tree.

Final affected static leaves:

```powershell
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd typecheck:typescript
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
pnpm.cmd format:check:rust
pnpm.cmd lint:rust
pnpm.cmd check:evidence
```

Do not add `pnpm check` plus `check:portable` around the same already-covered
leaves. Required later PR CI remains required if publication is authorized.
Do not repeat runtime gates after documentation-only edits unless those documents
are consumed by the gate. Broaden the selected checks if implementation changes
an engine, wire contract, resource limit, installer topology or evidence authority.

## Risks and rollback

- **Authority drift:** a broad manual-scroll or completion fix can admit reflow
  as user intent or erase heard progress. Keep separate visual/heard owners and
  exact next-Play assertions. Revert the affected unit if negative controls fail.
- **Locator ambiguity:** removing erroneous blocks corrects future projection
  but cannot recover every unversioned historical tuple. Preserve existing safe
  resolver policy, user-controlled new saves and the explicit compatibility limit.
- **False progress:** a leaf-only/silent-prefix fix can skip text, lose context or
  evade bounds. Require complete public drain, cold/warm comparison, work and
  cancellation assertions before accepting U4/U5. Keep immutable source bytes.
- **Reentrancy:** returning early can strand reservations or suppress a genuine
  failure. Test cleanup and next explicit Play as well as zero stale dispatch.
  Roll back the local guard if current-owner controls fail; do not disable callbacks.
- **Receipt ownership:** clearing an invalidity flag/receipt indiscriminately can
  delete valid installed data or hide required cleanup. Preserve root identity,
  active-worker barriers, explicit retry and invalid-package disclosure separately.
- **Filesystem/process recovery:** uncertain termination or publication must retain
  the backup/staging evidence. Only operate on resolved owned disposable paths;
  no global kill, recursive speculative cleanup or automatic repeat of a failed
  host mutation. Diagnose the exact failure before a bounded retry.
- **Overclaiming reuse:** source hash agreement is insufficient for runtime/host
  equivalence. Keep historical failures and recovery separate; rerun a narrow gate
  when its independence cannot be proven. Do not replace a missing receipt with a
  newly computed hash list.

Keep implementation deltas identifiable by U1-U11 even if they share a final
commit. Reverse only task-owned changes when authorized; preserve unrelated user
work and all immutable evidence. No data/schema migration is expected, so rollback
does not require rewriting user records. A host restoration failure leaves that
gate incomplete until recovery is verified.

## Progress log

- 2026-11-13 — Planning baseline recorded at `5fdb2dc835e99e43034e8b40c99817f45236358f`.
  Reconciled the 20 original cases, the qualified diagnostic observation and two
  additional findings against the deep report and current owners.
- 2026-11-13 — Inspected repository scripts, latest CFR/CI314 reviews and original
  receipts. Read-only hash inventory matched 377/377 and 36/36 indexed records;
  selected source-capture comparisons and the missing v14 artifact are recorded
  above. No test or validation gate was executed.
- 2026-11-13 — Created this pending plan, its index/registry links and the supporting
  audit record set. Branch/commit delivery belongs to the planning request only.
- M0-M5 execution, production corrections, new regressions and independent
  behavioral acceptance: **not started**.

## Discoveries and decisions

- Related historical fixes are present, but their fixtures omit these specific
  triggers. Preserve the original expected behavior and extend its existing test
  owner; do not treat a previous plan title as proof this variant is fixed.
- Use eleven responsibility units for 22 IDs, with shared file changes and union
  gates. VF-0038/VF-0043 share installed-receipt ownership; VF-0045/VF-0055 share
  synchronous invalidation guards. Each ID retains its own observable assertion.
- The original CI314 filtered `desktop test -- ...` command ran the complete
  package test script. Direct configured Vitest file selection avoids accidentally
  repeating both Vitest and Node tooling for every small correction.
- Release Node tests import the ordinary wrapper; CustomVoice imports quality
  helpers. Both are real transitive invalidations despite unchanged test filenames.
- A native-smoke leaf consumes generated EPUB exports. Rebuild once from current
  source and renew that leaf; preserving an old executable or dist directory is
  not evidence for changed preparation code.
- VF-0050 remains a proposed documented precision limitation; no new terminal
  receipt or Stop delay is planned. VF-0036 retains the existing locator-recovery
  policy with an explicit unversioned-history limitation.
- The deep review closed the ordinary B04 stored-position allegation and did not
  establish stale audible output for VF-0055. Do not add fixes or claims for those
  withdrawn implications.

## Final validation results

**Planning deliverable only.** All 22 IDs are mapped to triggers, owners,
minimal correction/disposition, prior coverage gaps, next-action assertions and
selected gates. Existing commands and relevant test files were inspected.
Historical evidence integrity was compared by reading files; no runtime PASS is
granted to this plan. No tests, checks, builds or benchmarks were run, and no
production code was changed. This nonbehavioral planning/documentation patch is
exempt from independent implementation review; the future fixes are not exempt.

Implementation remains pending. At execution closeout replace this pending result
with a per-ID table containing actual owner/path, reproduction level, exact host
command and outcome or immutable reused gate, adjacent controls, next action,
registry disposition and exact independent review ID. Include artifact/host
restoration and any unresolved scope. Do not mark this plan complete while required
gates or supported cases remain open, and do not describe static timing witnesses
as measured natural incidence or acoustic validation.
