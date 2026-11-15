# Findings registry

Use the [workflow](README.md) to reconcile these records with the checkout under
review. The [import manifest](history-import.md) identifies the historical
snapshots, integration commits and scope of this seed.

Imported entries started at `not-revalidated` on
`403eb27916afe26d4794a7e36aeb97e6d1529bf1` on 2026-11-13. Dated assessments
identify later checks and their scope. A linked test identifies a scenario.
Consult its cited report for recorded execution.

The [reconciliation of the five static passes][audit-2026-11-13-reconciliation]
records the previous work, regression risks and proposed correction checks for
VF-0034 through VF-0053.

The 2026-11-13 [deep-findings ExecPlan](../../plans/completed/deep-findings-minimal-corrections.md)
maps VF-0034 through VF-0055 to scoped corrections, prior evidence and selected
regressions. Implementation is accepted by DFM-CR-R03-20261114 on the exact task
patch: 21 cases are fixed/validated and VF-0050 is intentional at its documented
precision. The [results](../../plans/evidence/deep-findings-minimal-corrections/results.md)
and [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md)
separate reproductions, failed attempts, current acceptance and qualified reuse.

| ID | Area | Finding | Historical disposition |
| --- | --- | --- | --- |
| [VF-0001](#vf-0001) | Reader | Recovery starts at the last heard position | `intentional` |
| [VF-0002](#vf-0002) | Reader | Play after Stop during a pending placement | `fixed` |
| [VF-0003](#vf-0003) | Reader | Measured manual recovery after unavailable placement | `fixed` |
| [VF-0004](#vf-0004) | EPUB | Inert anchors preserve block descendants | `fixed` |
| [VF-0005](#vf-0005) | Runtime | Owned recovery of abandoned Chatterbox staging | `fixed` |
| [VF-0006](#vf-0006) | Benchmarks | Rejected generation preserves an existing quality session | `fixed` |
| [VF-0007](#vf-0007) | Benchmarks | Preflight exit follows the requested purpose | `fixed` |
| [VF-0008](#vf-0008) | Settings | Reselecting the ready Piper profile preserves playback | `fixed` |
| [VF-0009](#vf-0009) | Narration | Spanish time article survives no-break spacing | `fixed` |
| [VF-0010](#vf-0010) | Narration | Unsupported en-dash ranges stay intact | `fixed` |
| [VF-0011](#vf-0011) | Benchmarks | Exact voice-score ties reach the declared tie breakers | `fixed` |
| [VF-0012](#vf-0012) | Reader | Appearance edits survive held initial placement | `fixed` |
| [VF-0013](#vf-0013) | EPUB | Visible breaks separate EPUB 3 navigation label words | `fixed` |
| [VF-0014](#vf-0014) | Benchmarks | Defect corrections invalidate stale aggregates | `fixed` |
| [VF-0015](#vf-0015) | Release | Ordinary Chatterbox receipt comparison ignores object key order | `fixed` |
| [VF-0016](#vf-0016) | Runtime | Host denial preserves the existing download confirmation | `fixed` |
| [VF-0017](#vf-0017) | Reader | Manual movement wins before a pending follow correction | `fixed` |
| [VF-0018](#vf-0018) | Narration | Terminal masculine ordinal expands to primero | `fixed` |
| [VF-0019](#vf-0019) | Release | Attaching ordinary evidence preserves exact-artifact observations | `fixed` |
| [VF-0020](#vf-0020) | Narration | Collapsed whitespace preserves bounded preparation progress | `fixed` |
| [VF-0021](#vf-0021) | Benchmarks | Failed v12 quality setup or publication leaves a retryable session | `fixed` |
| [VF-0022](#vf-0022) | Runtime | Package size reflects proven retained bytes | `fixed` |
| [VF-0023](#vf-0023) | Release | Ordinary receipt binary fields retain strict primitive types | `fixed` |
| [VF-0024](#vf-0024) | Benchmarks | v12 derivation can resume interrupted cleanup | `fixed` |
| [VF-0025](#vf-0025) | Reader | Next requires witnessed adjacency across prepared windows | `fixed` |
| [VF-0026](#vf-0026) | Reader | Relative placement distinguishes requested and fallback positions | `fixed` |
| [VF-0027](#vf-0027) | Reader | Rejected newer placement retires the older request | `fixed` |
| [VF-0028](#vf-0028) | Reader | Failed visual follow preserves measured inspection | `fixed` |
| [VF-0029](#vf-0029) | Reader | Fallback placement and reflow preserve the saved checkpoint | `fixed` |
| [VF-0030](#vf-0030) | Reader | Image loading releases and reuses bounded capacity | `fixed` |
| [VF-0031](#vf-0031) | EPUB | Standalone PNG spine target lacks an admitted XHTML fallback | `not-confirmed` |
| [VF-0032](#vf-0032) | Runtime | Concurrent optional-package management across application processes | `deferred` |
| [VF-0033](#vf-0033) | EPUB | Caller mutation of bytes retained by EPUB opening | `deferred` |
| [VF-0034](#vf-0034) | Reader | Scrollbar movement cannot restore Play after unavailable placement | `fixed` |
| [VF-0035](#vf-0035) | Reader | Segment completion replaces visual position after failed follow | `fixed` |
| [VF-0036](#vf-0036) | EPUB | Empty inert anchor splits an implicit paragraph and shifts locators | `fixed` |
| [VF-0037](#vf-0037) | Narration | Standalone Spanish ordinal before a closing quote expands to primer | `fixed` |
| [VF-0038](#vf-0038) | Runtime | Failed Chatterbox re-verification leaves stale storage proof | `fixed` |
| [VF-0039](#vf-0039) | Narration | Thin space between Spanish article and time duplicates the article | `fixed` |
| [VF-0040](#vf-0040) | Release | Ordinary Chatterbox installer or uninstaller can block profile restoration | `fixed` |
| [VF-0041](#vf-0041) | Narration | Prepared playback shows the wrong active refill target | `fixed` |
| [VF-0042](#vf-0042) | Benchmarks | Failed scorecard directory creation blocks quality finalization retry | `fixed` |
| [VF-0043](#vf-0043) | Runtime | Failed post-commit integrity check replaces cleanup retry with download confirmation | `fixed` |
| [VF-0044](#vf-0044) | Reader | Restoration read failure can replace saved progress with book start | `fixed` |
| [VF-0045](#vf-0045) | Narration | Pause can turn an unavailable chapter into a playback error | `fixed` |
| [VF-0046](#vf-0046) | Runtime | An installed Chatterbox recheck can leave Play disabled | `fixed` |
| [VF-0047](#vf-0047) | EPUB | A no-break space at a TOC label edge prevents opening | `fixed` |
| [VF-0048](#vf-0048) | Narration | Completed narration still promises a pending speed change | `fixed` |
| [VF-0049](#vf-0049) | Settings | Reselecting healthy Chatterbox resets narration metrics | `fixed` |
| [VF-0050](#vf-0050) | Narration | Stop drops rendered slow-playback frames between receipts | `intentional` |
| [VF-0051](#vf-0051) | Narration | Short list items exhaust a source window before the first batch | `fixed` |
| [VF-0052](#vf-0052) | Narration | A silent formatting prefix can block Piper preparation | `fixed` |
| [VF-0053](#vf-0053) | Narration | Piper drops the scene pause when it skips punctuation | `fixed` |
| [VF-0054](#vf-0054) | Narration | A split lexical expansion loses text on warm continuation | `fixed` |
| [VF-0055](#vf-0055) | Narration | Inline Stop can precede a stale synthesis dispatch | `fixed` |
| [VF-0056](#vf-0056) | Release | Missing installer helper unnecessarily retains the application-data backup | `fixed` |
| [VF-0057](#vf-0057) | Tests | An unscheduled caller is mistaken for a blocked stdin writer | `fixed` |

## VF-0057

**An unscheduled caller is mistaken for a blocked stdin writer.** The SAC12
cancellation test waits 30 ms for a new caller thread and treats a timeout as
proof that its write was admitted. If that thread has not run, the subsequent
request can legitimately be accepted instead of returning Busy.

- Owner — `sac12_cancel_interrupts_real_blocked_stdin_without_queuing_more_work`
  in `apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs`.
- Disposition — `fixed`, P2 test harness; correction accepted under
  PORTFOLIO-READINESS-CR-R2-20261114. No production cancellation defect is established.
- Lineage — SAC-12's original production deadline fix is in
  [static audit corrections](../../plans/completed/static-audit-corrections.md).
  The [PR #307 follow-up](../../plans/evidence/epub-budget-cancellation-reflow/ci-follow-up.md)
  repaired a distinct Windows capacity-file sharing violation. This new test
  ordering case is not equivalent to either earlier trigger; the import manifest
  does not include SAC-12 as a VF entry.
- Reproduction — `reproduced`, 2026-11-14, base
  `97d36c213e16ea015c24b1589454d61dab4379ea` plus a temporary test-only 100-ms
  caller delay. It reproduces the hosted Busy assertion, not the unobserved
  exact hosted scheduling sequence. The diagnostic was removed afterward.
- Current assessment — `validated`, 2026-11-14, same base plus the task patch;
  both Rust configurations pass the preserved adjacent protections and strengthened
  completion assertion. [R2 review](../../plans/evidence/portfolio-readiness/review-r2.md)
  approves the exact implementation; documentary archival is assessed separately.
- Correction — admit the request synchronously before observing completion;
  retain real pipe pressure, Busy rejection, cancellation, bounded watchdog and
  process/writer ownership assertions. Require a delivered error acknowledgement,
  rather than accepting absence of completion as a successful cancellation test.
- Evidence — [CI diagnosis](../../plans/evidence/portfolio-readiness/ci-diagnosis.md)
  and [portfolio plan](../../plans/completed/portfolio-readiness-and-presentation.md).
  Prior coverage assumed caller scheduling during the observation interval;
  ordinary passing runs did not discriminate that interleaving.

## VF-0001

**Recovery starts at the last heard position.** When an earlier pass established heard progress and a later start attempt fails before audio, recovery uses the latest heard locator. The attempted start supplies the target when there is no heard locator.

- Reported concern — Recovery can return to A after an attempted start at B. The report questioned this intentional priority when A contains the latest heard position.
- Owner — [`product-narration-coordinator.ts`](../../../apps/desktop/src/tts/product-narration-coordinator.ts). `ProductNarrationCoordinator.recover`.
- Historical disposition — `intentional`. [CFR-01][cfr-plan] and the [CFR final review][cfr-review] preserve the policy in #314. The case required no correction commit.
- Lineage — CFR-01 and the withdrawn VUC recovery proposal describe the same behavior. FPA first-start and cancelled-recovery corrections exercise different prerequisites.
- Why it escaped or stayed open — The candidate conflicted with the documented recovery policy.
- Evidence — [VUC recovery decision](../../plans/completed/visible-locator-unicode-compound-corrections.md) and [CFR final review][cfr-review] record the disposition.
- 2026-11-13 assessment — `inspected-absent` for a policy violation. Explicit recovery still prioritizes the latest heard locator and falls back to the attempted start. [Audit][audit-2026-11-13]

## VF-0002

**Play after Stop during a pending placement.** Pause at A, request B, stop before placement settles, then press Play. Use the measured exact or fallback destination if available. An unavailable result gates Play. Stop still suppresses automatic restart and checkpoint writes.

- Historical consequence — The next explicit Play could start at A instead of measured B. An unavailable result could retain stale Play availability.
- Owner — [`product-narration-coordinator.ts`](../../../apps/desktop/src/tts/product-narration-coordinator.ts). `ProductNarrationCoordinator.settleReaderPlacement`.
- Historical disposition — `fixed`. [CFR-02][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-02 is a regression introduced by #313 and related to [PN-02](#vf-0026).
- Why it escaped or stayed open — The earlier test stopped before the next explicit Play.
- Evidence — [Coordinator regression](../../../apps/desktop/src/tts/product-narration-coordinator.test.ts) `PN-02 real App/reader preserves requested segment and checkpoint` and the [browser controlled placement cases](../../../apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts) `CFR-02 CFR-03 PN-02`.

## VF-0003

**Measured manual recovery after unavailable placement.** After unavailable placement gates Play, a genuine readable manual measurement can restore availability even at the same locator. Offscreen reflow and synthetic movement preserve the gate.

- Historical consequence — Play stayed disabled even after the user reached a readable location. Equal-locator deduplication could skip recovery.
- Owner — [`ReaderPublicationContent`](../../../apps/desktop/src/reader/ReaderPublication.tsx) and [`ProductNarrationCoordinator.updateVisibleLocator`](../../../apps/desktop/src/tts/product-narration-coordinator.ts).
- Historical disposition — `fixed`. [CFR-03][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-03 extends [PN-02](#vf-0026) through a distinct recovery trigger. PN-R1-F1 covers the offscreen reflow safeguard.
- Why it escaped or stayed open — Earlier checks covered invalid reflow and a direct manual flag. The preliminary browser reproduction exposed the missing gesture provenance.
- Evidence — [Browser regression](../../../apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts) `CFR-02 CFR-03 PN-02 real preparation and reader placement preserve the requested passage` and [CFR final review][cfr-review].
- 2026-11-13 assessment — `inspected-absent` for admitted wheel or keyboard movement with readable geometry. The measured update lifts the gate before equal-locator deduplication. Scrollbar-only movement has a separate input route in [VF-0034](#vf-0034). [Audit][audit-2026-11-13]

## VF-0004

**Inert anchors preserve block descendants.** An EPUB 3 inert external or no-href anchor wrapping a supported block must preserve its safe descendants and leave the link inert.

- Historical consequence — Projection rejected the supported document when a block entered the inline collector.
- Owner — [`xhtml-projector.ts`](../../../packages/epub/src/document/xhtml-projector.ts). `XhtmlProjector.beginLink`.
- Historical disposition — `fixed`. [CFR-04][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-04 extends the M003 and ADR-0007 inert-link behavior. [VF-0031](#vf-0031) concerns a different navigation boundary.
- Why it escaped or stayed open — Earlier inline-link cases missed flow descendants.
- Evidence — [Projection test](../../../packages/epub/src/document/xhtml-projector.test.ts) `projects inert block anchor descendants`.
- 2026-11-13 assessment — `inspected-absent` for inert anchors wrapping admitted block descendants in a block collector. The block branch is present. Its handling of an empty inline anchor with an ID introduces [VF-0036](#vf-0036). [Audit][audit-2026-11-13]

## VF-0005

**Owned recovery of abandoned Chatterbox staging.** After restart, an optional-package manager may see staging without its in-memory receipt, including alongside a valid install. Startup reconciliation and explicit Check can recover owned staging while preserving install and backup. Polling stays read-only.

- Historical consequence — Check could leave abandoned staging behind. A valid installation could hide the residue behind Installed.
- Owner — [`tts_optional_chatterbox.rs`](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs). `reconcile_staging_locked`.
- Historical disposition — `fixed`. [CFR-05][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-05 follows LCF-02, RCF-13, CAF R1.3 and C14. [VF-0022](#vf-0022) covers related storage reporting.
- Why it escaped or stayed open — Earlier protections addressed concurrent polling and live operation provenance. This trigger begins in a fresh manager.
- Evidence — [Rust regression](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs) `cfr05_startup_and_check_retry_preserve_installed_and_backup_during_staging_recovery`.

## VF-0006

**Rejected generation preserves an existing quality session.** A duplicate candidate or rejected candidate/fingerprint admission must preserve the existing staging session. Cleanup owns only an admitted failed generation.

- Historical consequence — Rejection entered the cleanup path and deleted an existing session.
- Owner — [`quality.py`](../../../services/tts/benchmarks/quality.py). `generate_candidate_audio`.
- Historical disposition — `fixed`. [CFR-06][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-06 follows RAC-02 and R8-02. [VF-0021](#vf-0021) concerns a separate v12 publication path.
- Why it escaped or stayed open — Earlier tests covered finalized sessions and adapter-close failure. Rejected admission happened inside cleanup.
- Evidence — [Python regression](../../../services/tts/tests/test_benchmark_quality.py) `test_rejected_generation_preserves_staging_session`.
- 2026-11-13 second-pass assessment — `inspected-absent` for rejected duplicate and fingerprint admission. The checks precede the deletion scope. [VF-0042](#vf-0042) concerns the next command, finalization. [Second audit][audit-2026-11-13-pass-2]

## VF-0007

**Preflight exit follows the requested purpose.** A valid passing pilot returns success while official eligibility and promotion flags stay false. Failing or invalid requests retain failure exits.

- Historical consequence — A passing pilot receipt reported success while the standalone command exited 2. The earlier plan deferred the meaning of that exit.
- Owner — [`cli.py`](../../../services/tts/benchmarks/cli.py). `_preflight_passed`.
- Historical disposition — `fixed`. [CFR-07][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-07 and FPA-1.6 describe one contract decision. FPA deferred it and CFR U8 implemented the selected purpose-aware behavior.
- Why it escaped or stayed open — The earlier plan explicitly left the exit-code contract unresolved.
- Evidence — [CLI regressions](../../../services/tts/tests/test_benchmark_cli.py) `test_preflight_exit_matches_requested_purpose` and `test_preflight_invalid_input_exits_two`. See the [earlier deferral][fpa-exclusions].

## VF-0008

**Reselecting the ready Piper profile preserves playback.** Clicking the already selected, saved, healthy Piper profile for the current language leaves narration and recovery ownership intact.

- Historical consequence — The redundant selection entered configuration, stopped narration and could reset the recovery episode.
- Owner — [`narration-settings-actions.ts`](../../../apps/desktop/src/settings/narration-settings-actions.ts). `createNarrationSettingsActions().selectProfile`.
- Historical disposition — `fixed`. [CFR-08][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-08 extends MAF-10 and NLC-03 to the saved Piper selection path.
- Why it escaped or stayed open — Previous work handled healthy Chatterbox and same-profile rechecks. The Piper radio still entered configuration.
- Evidence — [Action test](../../../apps/desktop/src/settings/narration-settings-actions.test.ts) `CFR-08 preserves an already loaded saved Piper profile` and [browser control](../../../apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts) `CFR-08 checked healthy Piper label` for both languages.
- 2026-11-13 fourth-pass assessment — `inspected-absent` for the saved healthy Piper radio route. Its guard returns before selection and episode reset. The healthy Chatterbox path returns success from the action and reaches the reset callback, tracked in [VF-0049](#vf-0049). [Fourth audit][audit-2026-11-13-pass-4]

## VF-0009

**Spanish time article survives no-break spacing.** Normalize synthetic `Las\u00a014:30.` and the narrow no-break variant with one article. Preserve supported casing and source spans.

- Historical consequence — Article recognition missed the no-break space and emitted a second article.
- Owner — [`bilingual-spanish-normalization.ts`](../../../packages/epub/src/narration/bilingual-spanish-normalization.ts). `SPANISH_LEXICAL_NORMALIZATION_FORMS`.
- Historical disposition — `fixed`. [CFR-09][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-09 extends SAF-12. [VF-0018](#vf-0018) is a different Spanish context rule in the same suite.
- Why it escaped or stayed open — Earlier coverage used ASCII spacing. Article recognition preceded whitespace collapse.
- Evidence — [Normalizer regression](../../../packages/epub/src/narration/narration-normalizer.test.ts) `SAF-12 preserves the closed Spanish time article` includes both no-break spaces.
- 2026-11-13 assessment — `inspected-absent` for bounded U+00A0 and U+202F gaps. The article matcher consumes both before the bare time rule runs. U+2009 follows [VF-0039](#vf-0039). [Audit][audit-2026-11-13]

## VF-0010

**Unsupported en-dash ranges stay intact.** An en dash joining unsupported time, date or percentage range endpoints must prevent partial expansion. Standalone times after editorial labels remain eligible.

- Historical consequence — One endpoint could expand while the other stayed in its original form.
- Owner — [`narration-bilingual-normalizer.ts`](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts). `hasEnDashNumericNeighbor`.
- Historical disposition — `fixed`. [CFR-10][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-10 follows BNC-03, VUC-02 and Celsius compound protections.
- Why it escaped or stayed open — Prior compound cases used different separators or endpoint classes.
- Evidence — [Normalizer matrix](../../../packages/epub/src/narration/narration-normalizer.test.ts) `CFR-10` rows include both a range and multi-digit editorial label controls.

## VF-0011

**Exact voice-score ties reach the declared tie breakers.** An exact overall tie such as 13/3 must reach pronunciation and later tie breakers in the versioned screen. Preserve the frozen v2 authority and results.

- Historical consequence — Different binary floats for the same mathematical mean could bypass pronunciation and later tie breakers.
- Owner — [`customvoice_screen.py`](../../../services/tts/benchmarks/customvoice_screen.py). `submit_and_select`.
- Historical disposition — `fixed`. [CFR-11][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-11 uses the v1-to-v2 authority transition as precedent for v3.
- Why it escaped or stayed open — The earlier omission is unknown. The report isolates unequal binary-float representations of a mathematical tie.
- Evidence — [Screen regression](../../../services/tts/tests/test_customvoice_screen.py) `test_exact_overall_tie_uses_authority_order`. Synthetic controls exercise scoring without a model run.

## VF-0012

**Appearance edits survive held initial placement.** Change two appearance fields while initial placement is pending. Apply the complete latest controlled preference snapshot and verify both fields after reopening.

- Historical consequence — Only the first differing appearance field could be applied and returned to App, losing the other edit.
- Owner — [`ReaderPublication.tsx`](../../../apps/desktop/src/reader/ReaderPublication.tsx). `ReaderPublicationContent`.
- Historical disposition — `fixed`. [CFR-12][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-12 is related to [RPI-01](#vf-0029) and the PN placement changes. The slow asynchronous preference-read hypothesis was excluded because this production read is synchronous.
- Why it escaped or stayed open — Earlier cases missed the combined App and Reader callback ordering and tested edits after placement.
- Evidence — [Browser regression](../../../apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts) `CFR-12 held initial placement applies both persisted preferences` covers both edit orders.

## VF-0013

**Visible breaks separate EPUB 3 navigation label words.** An admitted visible XHTML break within a TOC label must preserve word separation with bounded whitespace accounting.

- Historical consequence — The parser dropped the visible break and joined the words.
- Owner — [`navigation-document.ts`](../../../packages/epub/src/navigation/navigation-document.ts). `NavigationDocumentParser.appendLabelText`.
- Historical disposition — `fixed`. [CFR-13][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-13 retains the RCF-15, CAF alt-text and DCR-07 controls. [VF-0004](#vf-0004) is a separate XHTML projection case.
- Why it escaped or stayed open — Earlier label checks covered hidden text and retained attributes. They missed the visible break.
- Evidence — [Navigation regression](../../../packages/epub/src/navigation/navigation-document.test.ts) `visible XHTML break` table row.
- 2026-11-13 fourth-pass assessment — `inspected-absent` for the visible-break word join. A visible break supplies collapsible ASCII whitespace and the parser emits one separator before the next retained character. [VF-0047](#vf-0047) concerns non-ASCII characters retained at the label boundary. [Fourth audit][audit-2026-11-13-pass-4]

## VF-0014

**Defect corrections invalidate stale aggregates.** If old aggregate removal fails during publication of a defect correction, preserve a safe retry path. CPU fallback derivation must reject stale aggregates.

- Historical consequence — A correction could publish before aggregate deletion failed. A later retry looked duplicate, and derivation could still consume the stale aggregate.
- Owner — [`quality.py`](../../../services/tts/benchmarks/quality.py). `correct_meaning_changing_defect`.
- Historical disposition — `fixed`. [CFR-14][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-14 follows M010 correction and SAF-05 output recovery. [VF-0024](#vf-0024) concerns final cleanup retry in v12.
- Why it escaped or stayed open — Earlier output recovery did not exercise failure between correction publication and aggregate invalidation.
- Evidence — [Python regression](../../../services/tts/tests/test_benchmark_quality.py) `test_v6_quality_preserves_and_applies_one_classification_correction`. The documented direction can cause false rejection.

## VF-0015

**Ordinary Chatterbox receipt comparison ignores object key order.** Reordering ordinary receipt application, outcomes or installer fields must preserve equivalence. Field sets remain strict and step order remains significant.

- Historical consequence — Equivalent ordinary receipt objects could be rejected solely because their keys were reordered.
- Owner — [`windows-release.mjs`](../../../apps/desktop/scripts/windows-release.mjs). `validateOrdinaryChatterboxReceipt`.
- Historical disposition — `fixed`. [CFR-15][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-15 concerns `validateOrdinaryChatterboxReceipt`. The [FPA-4.4 review][fpa-receipt] accepted `validateLifecycleReceipt` as already correct. These are distinct validation paths.
- Why it escaped or stayed open — The earlier check exercised lifecycle receipts while the ordinary comparison still used `JSON.stringify`. The ordinary behavior dates to `ddd3cbc` (#205).
- Evidence — [Release regression][release-test] `DCR-05 and five-pass 4.4 keep release evidence strict and independent of object key order` exercises the ordinary reordered objects. The [CFR ledger][cfr-ledger] records the dedicated RED.

## VF-0016

**Host denial preserves the existing download confirmation.** When native admission rejects the attempt and the token remains Confirming, show attempt feedback, retain Cancel and its token, and keep Remove unavailable.

- Historical consequence — The client projected Failed while native state remained Confirming, hid Cancel and offered Remove.
- Owner — [`optional-chatterbox-client.ts`](../../../apps/desktop/src/tts/optional-chatterbox-client.ts). `OptionalChatterboxClient.download`.
- Historical disposition — `fixed`. [CFR-16][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-16 follows SFA-06 and EFC-07. [VF-0005](#vf-0005) covers a distinct startup lifecycle.
- Why it escaped or stayed open — Prior recovery controls exercised different native states.
- Evidence — [Browser regression](../../../apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts) `CFR-16 preserves download confirmation after native admission changes`.

## VF-0017

**Manual movement wins before a pending follow correction.** A real manual scroll before the second follow frame must cancel the pending correction. Synthetic movement and automatic layout changes preserve their separate authority.

- Historical consequence — The pending follow correction could undo genuine manual movement.
- Owner — [`segment-highlight-controller.ts`](../../../apps/desktop/src/reader/segment-highlight-controller.ts). `SegmentHighlightController`.
- Historical disposition — `fixed`. [CFR-17][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-17 follows RAC-07, RCF-16/17 and FPA-5.1. [PN-04](#vf-0028) concerns failed following after audible progress.
- Why it escaped or stayed open — Earlier checks covered already admitted inspection and late events. The earlier movement before arbitration was missing.
- Evidence — [Browser regression](../../../apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts) `CFR-17 arbitration before the second follow frame`. Natural incidence remains unmeasured.

## VF-0018

**Terminal masculine ordinal expands to primero.** In synthetic `Terminó 1.º.`, expand the terminal ordinal to `primero`. Preserve `primer` before a noun, as in `1.º puesto`.

- Historical consequence — The standalone ordinal could be read as `primer`.
- Owner — [`bilingual-spanish-normalization.ts`](../../../packages/epub/src/narration/bilingual-spanish-normalization.ts). `SPANISH_LEXICAL_NORMALIZATION_FORMS`.
- Historical disposition — `fixed`. [CFR-18][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-18 preserves the earlier apocope corpus case. [VF-0009](#vf-0009) is another Spanish context check.
- Why it escaped or stayed open — Existing corpus coverage used the before-noun form.
- Evidence — [Normalizer regression](../../../packages/epub/src/narration/narration-normalizer.test.ts) terminal ordinal and noun controls in `SAF-12 preserves the closed Spanish time article`.
- 2026-11-13 assessment — `inspected-absent` for immediate terminal period and complete-leaf examples. The before-noun control still selects `primer`. A paired closing quote follows [VF-0037](#vf-0037). [Audit][audit-2026-11-13]

## VF-0019

**Attaching ordinary evidence preserves exact-artifact observations.** Updating ordinary evidence must preserve verified signature and scan observations bound to the same installer and application bytes, or fail before overwriting them.

- Historical consequence — The update path could replace verified signature and scan observations with defaults when its alias omitted the relevant arguments.
- Owner — [`windows-release.mjs`](../../../apps/desktop/scripts/windows-release.mjs). `createPackageEvidence / writePackageEvidence`.
- Historical disposition — `fixed`. [CFR-19][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-19 follows M011, CAF R1.5, DCR-05 and FPA U12. [VF-0015](#vf-0015) and [VF-0023](#vf-0023) cover distinct ordinary receipt checks.
- Why it escaped or stayed open — Earlier protections covered other evidence boundaries. The command alias omitted signature and scan arguments.
- Evidence — [Release regression][release-test] signature and scan attachment controls in `DCR-05 and five-pass 4.4 keep release evidence strict and independent of object key order`. The historical tracked evidence was unsigned and unscanned. No actual signed-release incident was established.

## VF-0020

**Collapsed whitespace preserves bounded preparation progress.** Long leading or interior collapsed whitespace must allow bounded progress to the following substantive token with correct source offsets, including across provisional-window limits.

- Historical consequence — Collapsed spaces at the start of a Piper window could prevent packing the next substantive character. Long interior gaps and the provisional window limit exposed related stalls.
- Owner — [`narration-bilingual-normalizer.ts`](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts). `normalizeNarrationSourceTokensInternal`.
- Historical disposition — `fixed`. [CFR-20][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-20 follows SAC-08 and ADR-0066 silent suffix handling. The trigger is a prefix or interior gap.
- Why it escaped or stayed open — Earlier traversal checks covered silent suffixes. They missed whitespace before a required token.
- Evidence — [Preparation integration regression](../../../packages/epub/src/integration/narration-preparation-matrix.test.ts) `CFR-20 drains %i leading spaces with first source offset %i`.
- 2026-11-13 fifth-pass assessment — `inspected-absent` for the original 320-NBSP prefix followed by a short substantive token. The Piper packer drains each collapsed-whitespace omission when the inclusive source-span ceiling precludes a candidate. U+200B produces a different omission and still fails under [VF-0052](#vf-0052). [Fifth audit][audit-2026-11-13-pass-5]

## VF-0021

**Failed v12 quality setup or publication leaves a retryable session.** If adapter/corpus setup or map/HTML publication fails, stage and clean only newly owned output while preserving the existing machine session for retry.

- Historical consequence — Failure before protected publication could leave an unusable quality directory and block retry.
- Owner — [`corrective_v12_quality.py`](../../../services/tts/benchmarks/corrective_v12_quality.py). `generate_quality_session`.
- Historical disposition — `fixed`. [CFR-21][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-21 follows R8-02 adapter-close and SAF-05 summary-write checks. Related ownership issues are [VF-0006](#vf-0006) and [VF-0024](#vf-0024).
- Why it escaped or stayed open — Earlier checks covered close or summary failure. Setup and publication lay outside the protected scope.
- Evidence — [Python regression](../../../services/tts/tests/test_benchmark_corrective_v12.py) `test_v12_quality_failure_preserves_machine_session`.
- 2026-11-13 second-pass assessment — `inspected-absent` for failed file preparation before v12 quality publication. The files are prepared in a temporary directory, with the final rename after generation. [VF-0042](#vf-0042) uses a separate command and destination layout. [Second audit][audit-2026-11-13-pass-2]

## VF-0022

**Package size reflects proven retained bytes.** After failed transfer, partial removal or invalid installation, report retained storage only where ownership and size evidence supports it. Omit unknown retained bytes.

- Historical consequence — Error states could report the full expected package size without proof of the bytes retained.
- Owner — [`tts_optional_chatterbox.rs`](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs). `OptionalChatterboxManager::snapshot_operation` and `snapshot_from`.
- Historical disposition — `fixed`. [CFR-22][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-22 follows CAF staging estimate removal and the RCF-13/C14 postcommit proof rules. [VF-0005](#vf-0005) concerns staging ownership.
- Why it escaped or stayed open — Earlier controls covered staging-only estimates or valid postcommit provenance. Error states could still use manifest size.
- Evidence — [Rust regression](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs) `cfr22_failed_transfer_does_not_claim_installed_bytes`.
- 2026-11-13 assessment — `inspected-absent` for a failed transfer before promotion. `snapshot_operation` has no postcommit receipt to supply a size. [VF-0038](#vf-0038) covers failure of re-verification after a receipt has been created. [Audit][audit-2026-11-13]

## VF-0023

**Ordinary receipt binary fields retain strict primitive types.** Require exactly the admitted binary fields with primitive values. Reject a digest array and extra fields before constructing allowlisted evidence.

- Historical consequence — The digest check could accept a one-element array, and nested extras could be copied into the evidence record.
- Owner — [`windows-release.mjs`](../../../apps/desktop/scripts/windows-release.mjs). `installedBinaryEvidence / validateOrdinaryChatterboxReceipt`.
- Historical disposition — `fixed`. [CFR-23][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-23 was added during review. [VF-0015](#vf-0015) covers key order in the same validator under a different trigger.
- Why it escaped or stayed open — Regex coercion and copying the nested object defeated the intended field checks.
- Evidence — [Release regression][release-test] malformed binary controls in `DCR-05 and five-pass 4.4 keep release evidence strict and independent of object key order`. The historical report records no observed private-data disclosure.

## VF-0024

**v12 derivation can resume interrupted cleanup.** If final cleanup fails after deriving a summary, preserve validated retry material and report cleanup success only after verified removal.

- Historical consequence — Cleanup failure could leave a summary without the scorecard needed to resume. The CLI already reported the exception.
- Owner — [`corrective_v12_quality.py`](../../../services/tts/benchmarks/corrective_v12_quality.py). `derive_and_cleanup`.
- Historical disposition — `fixed`. [CFR-24][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-24 follows SAF-05 deletion ordering. [VF-0021](#vf-0021) concerns setup and publication before derivation.
- Why it escaped or stayed open — SAF-05 delayed deletion until summary writing. The subsequent cleanup still could fail after the scorecard was gone.
- Evidence — [Python regression](../../../services/tts/tests/test_benchmark_corrective_v12.py) `test_v12_derivation_resumes_after_failure`.

## VF-0025

**Next requires witnessed adjacency across prepared windows.** Revisit a separated prepared window and request Previous or Next. Offer and execute relative movement only with a witnessed adjacent range.

- Historical consequence — Next could cross a gap between prepared ranges during paused narration.
- Owner — [`product-narration-coordinator.ts`](../../../apps/desktop/src/tts/product-narration-coordinator.ts). `ProductNarrationCoordinator.goToNextBoundary`.
- Historical disposition — `fixed`. [PN-01][pn-plan], [PN review][pn-review], #313.
- Lineage — PN-01 updates the earlier CAF R4b.1 and CCF C01 policy. #304 added the predecessor guard before symmetry was required.
- Why it escaped or stayed open — Earlier policy deliberately allowed Next over remembered boundaries. The paused disjoint-window case motivated the change.
- Evidence — [Coordinator regression](../../../apps/desktop/src/tts/product-narration-coordinator.test.ts) `PN-01 rejects an unwitnessed successor after revisiting separated windows`. The preparing arm is a control.

## VF-0026

**Relative placement distinguishes requested and fallback positions.** When an explicit relative jump targets an interior offset, exact placement can admit its intended action. Approximate placement only supplies a later explicit Play target. Unavailable placement admits neither autoplay nor checkpoint publication.

- Historical consequence — An approximate or unavailable outcome could look like a successful placement at a different offset and admit effects intended for the requested position.
- Owner — [`ReaderPublication.tsx`](../../../apps/desktop/src/reader/ReaderPublication.tsx). `ReaderPublicationContent / runProgrammaticNavigation`.
- Historical disposition — `fixed`. [PN-02][pn-plan], [PN review][pn-review], #313.
- Lineage — PN-02 precedes [CFR-02](#vf-0002) and [CFR-03](#vf-0003). The later cases add Stop followed by Play and manual recovery after unavailable placement.
- Why it escaped or stayed open — Prior handling settled against a different offset without distinguishing placement outcomes.
- Evidence — [Coordinator integration regression](../../../apps/desktop/src/tts/product-narration-coordinator.test.ts) `PN-02 real App/reader preserves requested segment and checkpoint` uses controlled geometry. See [PN review][pn-review].

## VF-0027

**Rejected newer placement retires the older request.** An explicit newer request that is rejected or superseded must not let an older placement commit or falsely settle at the old locator. Preserve valid nearest-position and no-op cases.

- Historical consequence — A rejected newer request could appear to settle at the previous locator or leave an older pending request in control.
- Owner — [`ReaderPublication.tsx`](../../../apps/desktop/src/reader/ReaderPublication.tsx). `ReaderPublicationContent / runProgrammaticNavigation`.
- Historical disposition — `fixed`. [PN-03][pn-plan], [PN review][pn-review], #313.
- Lineage — PN-03 is an outcome contract related to [PN-02](#vf-0026).
- Why it escaped or stayed open — Earlier invalidation could leave an unchanged revision or a pending placement owned by the older intent.
- Evidence — [Reader controls](../../../apps/desktop/src/reader/ReaderPublication.test.tsx) `PN-03 rejected superseding intent retires an older pending placement` and `PN-03 reports injected resolver rejection without admitting the old location`. Rejection uses fault injection.

## VF-0028

**Failed visual follow preserves measured inspection.** If audible progression reaches a new segment while following cannot establish geometry, retain the latest measured manual inspection for ordinary Stop and Play. Continue recording audible progress for recovery.

- Historical consequence — An audible transition could replace the measured visual locator despite failed follow geometry, leading ordinary Play to start at a different position.
- Owner — [`segment-highlight-controller.ts`](../../../apps/desktop/src/reader/segment-highlight-controller.ts). `SegmentHighlightController`.
- Historical disposition — `fixed`. [PN-04][pn-plan], [PN review][pn-review], #313.
- Lineage — PN-04 is related to [CFR-17](#vf-0017), which covers genuine movement before the next follow frame.
- Why it escaped or stayed open — Prior handling promoted audible progress to visual authority without a measured placement.
- Evidence — [Coordinator regression](../../../apps/desktop/src/tts/product-narration-coordinator.test.ts) `PN-04 failed follow preserves measured inspection for Stop/Play` uses controlled missing geometry and measured inspection. [PN ledger][pn-ledger] records the evidence.
- 2026-11-13 assessment — `inspected-absent` for failed follow on Resume or the next audible start, followed by Stop before that segment completes. Completion of that same segment has a separate writer in [VF-0035](#vf-0035). [Audit][audit-2026-11-13]

## VF-0029

**Fallback placement and reflow preserve the saved checkpoint.** Restore an interior checkpoint when its geometry is unavailable, then edit appearance, flush and reopen. Preserve the canonical checkpoint while allowing a visible fallback to guide an explicit narration start. Layout changes alone lack manual save authority.

- Historical consequence — Visual fallback or layout changes could replace the saved interior checkpoint with a different offset.
- Owner — [`reader-position-save-coordinator.ts`](../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts). `ReaderPositionSaveCoordinator.scheduleReflow`.
- Historical disposition — `fixed`. [RPI-01][rpi-plan], [RPI closeout][rpi-review], #311.
- Lineage — RPI-01 includes the related C1 image-layout observation. CAF R4.1 and CCF C02 addressed visual publication and narration start. [CFR-12](#vf-0012) covers a different edit ordering.
- Why it escaped or stayed open — Earlier tests checked visible placement and narration separately from persistence through layout changes.
- Evidence — [Browser regression](../../../apps/desktop/tests/browser/reader-image-lifecycle.smoke.spec.ts) `RPI-01/C1 preserves canonical progress through image and appearance layout`. Historical evidence distinguishes controlled fallback and the observed C1 geometry change.
- 2026-11-13 third-pass assessment — `inspected-absent` for the appearance-only rewrite of a restored canonical offset. App admits recovered state after settlement, and reflow only expedites an already admitted save. [VF-0044](#vf-0044) concerns a failed storage read followed by lifecycle flush. [Third audit][audit-2026-11-13-pass-3]

## VF-0030

**Image loading releases and reuses bounded capacity.** When early occurrences fill the live image capacity, moving to later occurrences must free eligible offscreen resources and prioritize visible work. Returning to released images can reload them within the existing limits.

- Historical consequence — Later visible images could remain unavailable after earlier occurrences exhausted live capacity.
- Owner — [`publication-raster-image-loader.ts`](../../../apps/desktop/src/reader/images/publication-raster-image-loader.ts). `PublicationRasterImageLoader.pumpImages`.
- Historical disposition — `fixed`. [RPI-02][rpi-plan], [RPI closeout][rpi-review], #311.
- Lineage — RPI-02 is the image lifetime policy extension. The later Windows CI timeout had unresolved cause and remains separate.
- Why it escaped or stayed open — Visibility observation disconnected after initial admission. Later images had no capacity transition to retry.
- Evidence — [Browser regression](../../../apps/desktop/tests/browser/reader-image-lifecycle.smoke.spec.ts) `RPI-02 loads later images and reloads released earlier occurrences` and [RPI ledger][rpi-ledger]. The original capacity issue reproduced in Chromium.
- 2026-11-13 second-pass assessment — `inspected-absent` for the permanent live-capacity exhaustion of later visible occurrences after earlier images leave the retention margin. Visibility retires the earlier source, release advances the capacity revision, and the pump retries visible work first. This assumes the ordinary observer delivers the visibility changes. [Second audit][audit-2026-11-13-pass-2]

## VF-0031

**Standalone PNG spine target lacks an admitted XHTML fallback.** A PNG navigation target without an admitted reflowable XHTML fallback is outside the supported spine contract. A valid bounded XHTML fallback remains eligible.

- Reported concern — The candidate treated rejection of an unsupported PNG target as a defect. The documented spine policy requires XHTML or an admitted fallback.
- Owner — [`open-epub-publication.ts`](../../../packages/epub/src/public/open-epub-publication.ts). `openEpubPublication`.
- Historical disposition — `not-confirmed`. [FPA exclusions][fpa-exclusions] records the withdrawal. The case required no correction commit.
- Lineage — FPA-1.2 was withdrawn. CAF R6.1 and R8-07 describe related admitted XHTML fallback behavior.
- Why it escaped or stayed open — The candidate assumed support beyond the documented ingestion boundary.
- Evidence — [ADR-0007](../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md) and the [FPA exclusion][fpa-exclusions]. No regression run for the withdrawn case is attributed.

## VF-0032

**Concurrent optional-package management across application processes.** Two processes can contend for optional-package state. The supported install, verification and removal workflow requires one running application instance.

- Reported concern — Potential contention between multiple application processes remains outside the historical single-instance workflow. The source records no supported-workflow reproduction for this candidate.
- Owner — [`tts_optional_chatterbox.rs`](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs). `OptionalChatterboxManager`.
- Historical disposition — `deferred`. The [FPA exclusions][fpa-exclusions] record the deferral without a correction commit.
- Lineage — FPA-1.9 records an out-of-scope cross-process ownership concern. [CFR-05](#vf-0005) handles staging recovery in the supported process model.
- Why it escaped or stayed open — The historical plan explicitly deferred enforcing cross-process ownership.
- Evidence — [ADR-0046](../../architecture/decisions/ADR-0046-repair-chatterbox-runtime-closure-and-windows-path.md) and the [FPA deferral][fpa-exclusions]. No cross-process fix or regression run is attributed.

## VF-0033

**Caller mutation of bytes retained by EPUB opening.** A caller can mutate bytes aliased by asynchronous ZIP reads. The desktop supplies a dedicated buffer. A package-level transfer or snapshot contract would require an explicit ownership and memory-budget decision.

- Reported concern — Caller mutation could change bytes still being read asynchronously. The desktop's dedicated buffer leaves this an unresolved package API question.
- Owner — [`open-epub-publication.ts`](../../../packages/epub/src/public/open-epub-publication.ts). `openEpubPublication`.
- Historical disposition — `deferred`. The [FPA exclusions][fpa-exclusions] record the deferral without a correction commit.
- Lineage — FPA-4.5 continues the same API ownership question as CAF R2.2.
- Why it escaped or stayed open — The historical decision preserved the desktop's dedicated-buffer path and deferred a public ownership change.
- Evidence — [CAF plan](../../plans/completed/chat-audit-minimal-follow-up.md) and the [FPA deferral][fpa-exclusions]. No supported desktop reproduction, implementation change or regression run is attributed.

## VF-0034

**Scrollbar movement cannot restore Play after unavailable placement.** After failed placement gates Play, moving the native scrollbar to readable text changes the viewport without admitting a measured manual locator. Play stays disabled.

- Owner — `ReaderPublicationContent` and `ActiveVisualLocatorTracker.admitManualScrollMovement`, consumed by `ProductNarrationCoordinator.updateVisibleLocator`.
- Disposition — `fixed`, P2. Variant of [VF-0003](#vf-0003) for a different input source. [VF-0017](#vf-0017) uses the same manual-movement admission for a pending follow.
- Coverage gap — The prior browser recovery cases drive wheel and PageDown input. They do not drive the scrollbar.
- 2026-11-13 assessment — `inspected-present`. The ordinary scroll observer can sample the viewport. Only the earlier wheel, touch or key intent can mark that sample as measured manual.
- Next check — Drag the actual scrollbar after unavailable placement, verify the viewport moved and compare Play and its first prepared locator against the wheel case and programmatic-scroll control. [Source trace and snapshot][audit-2026-11-13]

- 2026-11-13 deep assessment — Present after scrollbar-only movement. The input lacks the measured-manual admission required by Play. Native thumb-drag delivery remains to be exercised. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: real Chromium thumb movement and WebView2 input provenance. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0035

**Segment completion replaces visual position after failed follow.** When a same-chapter segment finishes after follow could not measure its placement, the completion event can replace the last measured visual locator with the end of that segment. Stop followed by ordinary Play can then start outside the passage still visible.

- Owner — `SegmentHighlightController.accept` on `segment-completed`, via the reader's `settleLocator` callback.
- Disposition — `fixed`, P2. Variant of [VF-0028](#vf-0028) triggered by completion rather than Resume or the next audible start.
- Coverage gap — The PN-04 missing-geometry case stops before completion of the affected segment. The controller's geometry-only case stops at the start event.
- 2026-11-13 assessment — `inspected-present` under the failed-follow condition. Natural incidence in the packaged WebView is unknown.
- Next check — Let the affected segment finish with missing geometry. Compare the next ordinary Play target with the last measured passage and verify that the heard-end checkpoint still advances. [Source trace and snapshot][audit-2026-11-13]

- 2026-11-13 deep assessment — Present when failed follow retains the active projection through completion. Later manual inspection or clearing the projection prevents this route. Preserve independent heard-end persistence. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: controlled geometry through mounted Reader/coordinator and next Play. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0036

**Empty inert anchor splits an implicit paragraph and shifts locators.** An empty no-href anchor with an ID between direct text runs inside a `div` creates two semantic paragraphs. Later generated anchors shift. On reopening the same bytes after the update, a saved generated anchor can resolve exactly to the wrong paragraph.

- Owner — `XhtmlProjector.beginLink` and `flushPendingParagraph`. The renderer, locator index and narration leaf projection consume the extra block.
- Disposition — `fixed`, P2. Variant introduced by the [VF-0004](#vf-0004) correction in `403eb279` (#314).
- Coverage gap — The inert-block regression exercises wrappers without a wrapper ID and genuine block descendants.
- 2026-11-13 assessment — `inspected-present`. Parent/commit source comparison shows the added unconditional flush for this ID-bearing anchor.
- Next check — Compare public opening and saved-location resolution across the two projections for the same bytes. Keep the genuine block-wrapper and explicit paragraph controls. [Source trace and snapshot][audit-2026-11-13]
- 2026-11-13 fourth-pass assessment — `inspected-present` for an additional navigation consequence of the same split. Both text runs inherit the surrounding container's ID, the sidecar drops it as ambiguous, and a link to that container recovers to chapter start. Include a preceding paragraph and assert exact fragment resolution after a correction. [Fourth audit][audit-2026-11-13-pass-4]
- Reconciliation — Compare locators saved by both the original and split projections before choosing compatibility behavior. Identical book bytes and locator tuples can select different passages across those projections. Keep real block descendants and the exact TOC assertion. [Correction analysis][audit-2026-11-13-reconciliation]

- 2026-11-13 deep assessment — Present for empty, whitespace-only and direct inline-text inert wrappers. A correction must distinguish genuine block children. Unique publisher IDs can recover by value, while matching generated tuples can resolve exactly to another block. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: public EPUB opening and same-byte locator reopening. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0037

**Standalone Spanish ordinal before a closing quote expands to primer.** In Spanish prose such as `Dijo «Llegó 1.º».`, the paired closing quote precedes the period. The lexical rule falls back to the before-noun form `primer`.

- Owner — `isTerminalOrdinal` in the active bilingual normalizer, consumed by Piper and Chatterbox preparation.
- Disposition — `fixed`, P3. Variant of [VF-0018](#vf-0018) where a paired quote precedes the terminal punctuation.
- Coverage gap — The terminal period, true leaf end and before-noun cases have controls. The paired closing-quote context is absent from those controls.
- 2026-11-13 assessment — `inspected-present` at the prepared-text boundary.
- Next check — Compare exact prepared text and ranges for the quoted terminal case and for an ordinal before a noun, with the existing artificial-window and context protections. [Source trace and snapshot][audit-2026-11-13]

- 2026-11-13 deep assessment — Present under effective Spanish. The quotation role and toggled straight-quote state alone cannot prove a closing pair for the proposed correction. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: public bounded preparation with paired quote and language controls. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0038

**Failed Chatterbox re-verification leaves stale storage proof.** After promotion and failed cleanup, Check can find that the active installation is now invalid. An ordinary refresh can still display the full manifest size.

- Owner — `OptionalChatterboxManager::retry_cleanup` and `snapshot_operation`, consumed by `OptionalChatterboxControls`.
- Disposition — `fixed`, P3. Variant of [VF-0022](#vf-0022) where explicit re-verification invalidates previously established postcommit proof.
- Coverage gap — The failed-transfer control never acquires a receipt. The RCF-13 cleanup retry exercises a retained, valid active install.
- 2026-11-13 assessment — `inspected-present` for the ordered filesystem failures and subsequent refresh. Frequency and actual retained bytes were not measured.
- Next check — Force postcommit cleanup failure in a disposable root, remove one installed artifact, and check the snapshot after failed re-verification. Compare against valid-install cleanup failure and preserve backup ownership. [Source trace and snapshot][audit-2026-11-13]
- 2026-11-13 second-pass assessment — `inspected-present` for the same sequence. The failure updates the error code and retains cleanup provenance. The ordinary snapshot still uses that provenance to project the manifest footprint. The next Settings action after this failure is tracked in [VF-0043](#vf-0043). [Second audit][audit-2026-11-13-pass-2]
- Reconciliation — #314 added the receipt-based exception to size suppression. Track installed verification independently of cleanup authority. Share the retained-receipt setup with VF-0043 and assert the amount and the next action independently. [Correction analysis][audit-2026-11-13-reconciliation]

- 2026-11-13 deep assessment — Present with a retained postcommit receipt and subsequently invalid active files. Verification-cache tree stamps detect a removed file, while the cached operation snapshot still republishes the manifest amount. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: native committed-package cleanup fault, invalid Check and repaired retry in both feature modes. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0039

**Thin space between Spanish article and time duplicates the article.** In Spanish prose `Las\u200914:30.`, article recognition skips this form, bare-time expansion adds another article, and whitespace normalization emits `Las las catorce treinta.`.

- Owner — `matchesLexicalForm` in the active bilingual normalizer.
- Disposition — `fixed`, P3. Variant of [VF-0009](#vf-0009) for U+2009, a prose whitespace character distinct from the two no-break controls.
- Coverage gap — The earlier fix covers ASCII, U+00A0 and U+202F. The generic whitespace normalizer accepts U+2009 but the article matcher does not.
- 2026-11-13 assessment — `inspected-present` at the prepared-text boundary.
- Next check — Compare exact prepared text and source spans for U+2009, both no-break spaces and a bare time, preserving bounded matching and compound controls. [Source trace and snapshot][audit-2026-11-13]

- 2026-11-13 deep assessment — Present for U+2009. U+2007 follows the same mechanism. ASCII, U+00A0 and U+202F use the covered article-plus-time rule. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: public preparation across the explicit inline-space set. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0040

**Ordinary Chatterbox installer or uninstaller can block profile restoration.** If the launched installer or uninstaller never exits, the ordinary Windows release journey can wait indefinitely after moving existing application data aside. A stalled uninstall also prevents the finalizer from reporting its retained backup.

- Owner — `runInstaller`, `runUninstaller` and `finalizeJourney` in `ordinary-chatterbox-release-host.mjs`.
- Disposition — `fixed`, P2, maintainer tooling. Variant of FPA 5.3 in the ordinary Node journey. The historical correction covers the separate PowerShell lifecycle command.
- Coverage gap — CCF-C04 covers spawn failure and ambiguous install state. RAC-03 covers cleanup that returns or rejects. The Node waits rely on a child event.
- 2026-11-13 assessment — `inspected-present` given a non-exiting child. Existing user data remains in the backup. Natural incidence is unknown.
- Next check — Use an owned, disposable process that stays alive at each of the two launch points. Check deadline, safe restoration when teardown is established, and backup retention with a reported recovery path when it is uncertain. [Source trace and snapshot][audit-2026-11-13-pass-2]

- 2026-11-13 deep assessment — Present if either owned child does not exit. Stable-root observation starts after uninstaller exit. Backup data remains retained during the indefinite wait. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: actual disposable Windows installer/descendant processes through the production wrapper. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0041

**Prepared playback shows the wrong active refill target.** During an involuntary underrun after a five-minute prepared start, narration details show progress toward one minute and label five minutes as the active target. The scheduler and wait estimate use one minute for ordinary resumption.

- Owner — `loadedAudioStatusText` in `adaptive-preparation-presentation.ts`, through `createAdaptivePreparationUiState` and `AdaptivePreparationControls`.
- Disposition — `fixed`, P3, product presentation. B01 preserves the chosen production target. DCR-24 protects frame accounting at the resume boundary.
- Coverage gap — The detail test uses Quick for involuntary buffering and Prepared for a voluntary pause. The prepared scheduler test does not inspect the disclosure.
- 2026-11-13 assessment — `inspected-present` during ordinary prepared refill with more narration still expected.
- Next check — Drive a five-minute Prepared run into buffering. Check both displayed fields and resumption at one minute of playable audio. Preserve the selected target for startup and voluntary pause. [Source trace and snapshot][audit-2026-11-13-pass-2]
- 2026-11-13 third-pass assessment — `inspected-present` for the same detail-panel sequence. The compact player also shows the configured target as the active target through the same formatter. [Third audit][audit-2026-11-13-pass-3]

- 2026-11-13 deep assessment — Present for Prepared two-, five- and ten-minute refill. Compact and expanded text share the label. The selected production goal itself is valid. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: mounted preparation controls with 1/2/5/10 minute targets. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0042

**Failed scorecard directory creation blocks quality finalization retry.** After `audio` is created, a transient failure creating `scorecards` leaves `audio` behind before any sample is moved. Once the original failure is resolved, repeating finalization for the same staged session fails on the existing directory.

- Owner — `finalize_session` in `services/tts/benchmarks/quality.py`.
- Disposition — `fixed`, P3, maintainer tooling. Variant of the retry obstruction in [VF-0021](#vf-0021), for retained blinded-quality finalization. [VF-0006](#vf-0006) covers admission to candidate generation.
- Coverage gap — The retained finalization controls start with a clean output layout. Existing rejection controls exercise candidate generation.
- 2026-11-13 assessment — `inspected-present` after a failure limited to the second directory creation. Staged samples remain intact in this sequence.
- Next check — Fail the second `mkdir` in an admitted disposable session, clear the fault, then finalize the same ID. Keep finalized-session and genuinely failed generation controls. [Source trace and snapshot][audit-2026-11-13-pass-2]

- 2026-11-13 deep assessment — Present before any WAV move when the second exclusive mkdir fails. The first empty directory blocks retry, and the filesystem exception bypasses the typed CLI result. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: controlled filesystem faults through finalization and the real CLI with retry. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0043

**Failed post-commit integrity check replaces cleanup retry with download confirmation.** If Check fails to verify a committed installation, Settings classifies the result as an acquisition failure. After access is restored, the next action on a compatible host can discard the recorded cleanup provenance and ask for download confirmation even when the package is valid again.

- Owner — `OptionalChatterboxControls` action selection, `OptionalChatterboxManager::retry_cleanup` and `select_at`.
- Disposition — `fixed`, P3, product recovery. Variant of [VF-0038](#vf-0038) with a different consequence on the next user action. RCF-13 defines explicit post-commit recovery and NCC-03 defines fresh acquisition retry.
- Coverage gap — RCF-13 retries cleanup of a still-verifiable installation. NCC-03 exercises three cached acquisition errors without the post-commit receipt.
- 2026-11-13 assessment — `inspected-present` with a retained receipt, one failed re-verification, resolved access and host admission. Download still requires consent.
- Next check — Fail one integrity read in an installed disposable fixture after cleanup fails. Restore access and check that the next action can verify, finish cleanup and report Installed without selecting a new acquisition. Keep a true acquisition verification failure as the opposite control. [Source trace and snapshot][audit-2026-11-13-pass-2]

- 2026-11-13 deep assessment — Present after failed installed verification followed by restored access on an acquisition-admitted host. A separate consent action starts the download. A denied host takes its compatibility path. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: native retained-receipt Check and repair plus mounted command routing. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0044

**Restoration read failure can replace saved progress with book start.** If the position read temporarily fails, App makes the default locator eligible for a lifecycle save. Once access returns, book replacement or a hidden-document flush can overwrite valid stored progress with the beginning before any navigation or heard checkpoint. A malformed v1 envelope can likewise be replaced before a user-generated save.

- Owner — `App` save-owner construction and `ReaderPositionSaveCoordinator` lifecycle flush, through the web-storage repository.
- Disposition — `fixed`, P2. Variant of [VF-0029](#vf-0029) at storage restoration admission rather than appearance reflow.
- Coverage gap — The malformed restore matrix reads through the restore coordinator. It omits the App save owner and a later lifecycle flush. The canonical-recovery controls cover successful storage reads.
- 2026-11-13 assessment — `inspected-present` when the first read is unavailable and a later storage write succeeds, or when the original envelope is malformed v1. Unsupported or over-limit envelopes retain their write guards.
- Next check — Fail only the first position read over a valid stored offset. Reselect the same EPUB without moving or narrating. Verify that the prior offset survives. Cover untouched malformed v1 and repair after explicit navigation. [Source trace and snapshot][audit-2026-11-13-pass-3]
- Reconciliation — Narrow automatic initial-save admission to a confirmed missing record. In the mounted check also observe whether a passive initial locator update can enqueue a save before intentional navigation after the read fails. The timing of that path remains unverified. [Correction analysis][audit-2026-11-13-reconciliation]

- 2026-11-13 deep assessment — Present for unavailable read followed by successful write, and premature replacement of malformed v1. Future-version and oversized envelopes retain rejection. Include passive initial sampling in correction coverage. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: actual WebStorage repository with one failed read or malformed bytes and next user save/reopen. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0045

**Pause can turn an unavailable chapter into a playback error.** If Pause first confirms rendering of the next chapter and the desktop rejects its presentation, the reader stops the same player inline. The original Pause then fails against the stopped scheduler. Its catch uses the current run token and can take a normal unavailable-placement stop into failure recovery.

- Owner — `AdaptivePcmPlayer.pause` and the failure token in `ProductNarrationCoordinator.pause`, through reader audible-follow settlement.
- Disposition — `fixed`, P2. B04 variant at the direct-render Pause call site. RIA-03 and DCR-06 cover rendering-signal timing.
- Coverage gap — B04's automatic case uses a manual audible-progress source. The coordinator control directly supplies explicit navigation settlement.
- 2026-11-13 assessment — `inspected-present` for the ordered positive direct-render observation and inline invalidation during Pause. Incidence in the packaged WebView is unmeasured.
- Next check — Use the real reader, coordinator and player. Deliver the first positive observation for an unavailable chapter during Pause and verify ordinary Play after returning to an available chapter. Preserve real playback fault recovery. [Source trace and snapshot][audit-2026-11-13-pass-3]

- 2026-11-13 deep assessment — Present when Pause first confirms the new chapter and inline Stop invalidates it. Pause catches with the new token, while ordinary tick-first handling rejects the stale error. Host timing remains unmeasured. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: controlled device timing through mounted production Reader/coordinator callbacks; natural incidence remains unknown. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0046

**An installed Chatterbox recheck can leave Play disabled.** On a compatible host with the profile already selected, failure to verify its installed files leaves narration unavailable. If Settings later verifies the installed package, App's acquisition filter skips the Failed-to-Installed transition and the same book still has disabled Play.

- Owner — The optional package subscription in `App`, through `OptionalChatterboxControls` and narration profile availability.
- Disposition — `fixed`, P3. CAF-R3.1 variant for an explicit integrity retry. [VF-0043](#vf-0043) concerns the separate action after a failed cleanup re-verification.
- Coverage gap — App's reinstall test publishes Verifying before Installed. Native controls establish installed state separately from the selected narrator's UI.
- 2026-11-13 assessment — `inspected-present` for a successful installed-integrity recheck in the same book with retained profile selection and earlier unavailable narration.
- Next check — Restore access after a temporary integrity failure, use Check on the same book and verify that Play becomes available. Preserve explicit startup, true acquisition and replacement ownership controls. [Source trace and snapshot][audit-2026-11-13-pass-3]

- 2026-11-13 deep assessment — Present on direct Failed-to-Installed verification. The same filter can ignore genuine acquisition completion when a current poll fails just before Download succeeds. Preserve initiating-owner identity. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: real optional client IPC boundary with mounted App, explicit completion and stale-owner controls. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0047

**A no-break space at a TOC label edge prevents opening.** EPUB 3 XHTML and EPUB 2 NCX can pass a spine-target label such as `\u00A0Chapter One` through their parsers. BookV1 rejects the retained edge whitespace and opening returns `malformed-package`.

- Owner — TOC label normalization in `NavigationDocumentParser` and `NcxNavigationParser`, consumed by `projectBookV1`.
- Disposition — `fixed`, P2. The trigger differs from [VF-0013](#vf-0013), which concerns a visible break inside an EPUB 3 label.
- Coverage gap — RCF-15, CAF-R3.4 and DCR-07 protect visibility and retained bytes. The non-XML-whitespace fixture puts U+00A0 between items, outside the label.
- 2026-11-13 assessment — `inspected-present` for a short spine-target label with substantive text and leading or trailing U+00A0. Natural incidence is unknown.
- Next check — Open representative EPUB 2 and EPUB 3 fixtures through the public entry point, compare both edge positions with ordinary ASCII padding, and verify the label and link. Preserve internal no-break spaces, the blank-label rule, hidden/alt behavior and byte/code-point bounds. [Source trace and snapshot][audit-2026-11-13-pass-4]

- 2026-11-13 deep assessment — Present when the label enters coarse spine navigation. Groups and non-spine entries do not cause this failure. An NBSP-only visible label can also suppress a valid title fallback. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: public EPUB opening of XHTML/NCX labels. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0048

**Completed narration still promises a pending speed change.** A speed selected during the last unit can stay pending after completion. Selecting a different speed after completion also forwards it to the retained player, leaving the compact controls waiting for a current section that has already ended.

- Owner — Terminal rate state in `AdaptiveBufferScheduler` and `ProductNarrationCoordinator`, displayed by `ProductNarrationControls`.
- Disposition — `fixed`, P3. RCF-19 addresses a genuine queued successor; LCF-01 covers starting again after completion.
- Coverage gap — The existing completion control has no pending rate. The RCF-19 boundary control preloads a second unit.
- 2026-11-13 assessment — `inspected-present` for a successful change with the final unit active or already complete.
- Next check — Select a slow rate during the last direct unit and again after natural completion. Confirm the finished state gives truthful feedback and the next explicit Play starts at the saved rate. Keep real successor activation and persistence-error feedback as controls. [Source trace and snapshot][audit-2026-11-13-pass-4]

- 2026-11-13 deep assessment — Present during last-unit and post-completion selection. Obsolete rate preparation can additionally fail after the ticker stops. Check the UI journey through Stop and the next Play. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: controlled completion with late speed preparation, saved preference and next Play. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. R01 additionally exposed empty-tail and paused-end completion; their late-success/rejection/reset witnesses now pass without changing SAC-11. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0049

**Reselecting healthy Chatterbox resets narration metrics.** Clicking the checked Chatterbox profile while it plays preserves the admitted service owner but clears the recovery episode's accumulated playback, buffering, intentional wait and underrun totals.

- Owner — Checked-radio path in `HardwareCompatibilityControls` and `ReaderSettingsDialog`, through App's `resetRecoveryEpisode` callback.
- Disposition — `fixed`, P3, diagnostics. Variant of [VF-0008](#vf-0008) and adjacent to MAF-10's Chatterbox service-admission correction.
- Coverage gap — The mounted MAF-10 control checks service identity, generation, shutdowns, optional mutations and playing phase. CFR-08 covers the Piper no-op guard.
- 2026-11-13 assessment — `inspected-present` for a checked, enabled Chatterbox radio with healthy continuation and prior nonzero playback.
- Next check — Extend the mounted checked-radio control with an accumulated playback counter and verify it stays monotonic through reselection. Keep real profile changes and explicit compatibility resets as controls. [Source trace and snapshot][audit-2026-11-13-pass-4]

- 2026-11-13 deep assessment — Present for an enabled checked Chatterbox radio with healthy same-language continuation and positive metrics. Its successful no-op reaches the reset callback. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: real Chromium checked-profile interaction with nonzero played duration. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0050

**Stop drops rendered slow-playback frames between receipts.** Stopping a slowed unit after it starts rendering and before its next output report freezes only the last received frame count. A fresh episode can report zero playback even after rendered audio.

- Owner — WSOLA Stop message and Web Audio receipt ownership, through `AdaptivePcmPlayer` invalidation and the coordinator's final metrics snapshot.
- Disposition — `intentional`, P3, diagnostics. CCF-C20 covers completion and active observations; this case interrupts an incomplete unit.
- Coverage gap — The slow-backend control asserts periodic, Pause and natural-end counts. The product retention control tests accumulation across owner changes without comparing a real incomplete worklet's final output to the frozen total.
- 2026-11-13 assessment — `inspected-present` for a partial render past the last received cumulative count, followed by Stop. The size and frequency of the discrepancy are unmeasured.
- Next check — Stop an owned slowed unit after positive output and before the next report. Compare the frozen metric with that unit's actual output, preserving immediate invalidation, bounded shutdown and suppression of stale notifications from other units. [Source trace and snapshot][audit-2026-11-13-pass-4]
- Reconciliation — Decide whether the confirmed-receipt lower bound is sufficient for interrupted-playback diagnostics. If fuller counting is required, any final receipt must be bounded, specific to the retired unit and episode, and limited to the diagnostic total. [Correction analysis][audit-2026-11-13-reconciliation]

- 2026-11-13 deep assessment — The undercount remains inspected-present as a measurement limitation. Whether exact interrupted totals are mandatory remains inspected-inconclusive under the current contract. Preserve immediate Stop while resolving that precision requirement. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — Current worklet/PCM ownership and requirements remain consistent with the accepted-cumulative-receipt lower bound at abrupt Stop. Testing documentation now states that precision and the unbounded-by-cadence delivery tail. No runtime change or exact-frame promise is introduced; final disposition awaits independent review. [Execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md).

- 2026-11-14 closure — `intentional`; the accepted-receipt precision limit remains `inspected-present`, with no stronger exact-Stop requirement found. Reviewed documentation preserves immediate cancellation and makes no universal cadence-bound promise. DFM-CR-R03-20261114 APPROVE accepts this disposition; no runtime correction or new acoustic measurement is claimed. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0051

**Short list items exhaust a source window before the first batch.** A visually readable list with 1,365 one-character items fails narration from its opening. The 4,097th structural or leaf event is collected before the source-token window fills and before public preparation can return even its first segment.

- Owner — `retainEvent` and traversal stop conditions in `narration-source-window.ts`, consumed by `prepareNarrationBatch`.
- Disposition — `fixed`, P2. The B02 and ADR-0057 structural cursors bound the walk across windows. This input fills the event collection ahead of the token collection.
- Coverage gap — The source-window pressure control uses empty synthetic lists and expects rejection. The cursor control exercises a long textual leaf. The reachable case is an admitted XHTML list with substantive items and ordinary public batching.
- 2026-11-13 assessment — `inspected-present` starting at the list's canonical anchor. The exact event count follows from the source. EPUB incidence is unknown.
- Next check — Open a synthetic chapter with 1,364 and 1,365 short items. Drain the public batches, check ordered, stable ranges and the desktop's next Play, and preserve both per-window caps, same-document continuation and linked cancellation. [Source trace and snapshot][audit-2026-11-13-pass-5]

- 2026-11-13 deep assessment — Present from the list anchor at event 4,097. Starting at the first leaf leaves 4,095 events. Breadth reaches this failure within the XML depth guard. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: public preparation through dense structural windows, cold continuation and cancellation. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0052

**A silent formatting prefix can block Piper preparation.** With 320 U+200B zero-width spaces followed by ordinary prose in one paragraph, Piper's public preparation returns `resource-limit-exceeded` before the first word. The normalizer omits those characters from speech and still accounts for their source positions.

- Owner — Source-span selection and the collapsed-whitespace-only fallback in `packNarrationBoundaryScanInternal`.
- Disposition — `fixed`, P2 for the affected passage. Variant of [VF-0020](#vf-0020) for `formatting-mark` omissions.
- Coverage gap — CFR-20 tests U+00A0 at 319, 320, 4,095 and 4,096 source positions. It deliberately restricts its fallback to collapsed whitespace. The recognized zero-width omission follows a different branch.
- 2026-11-13 assessment — `inspected-present` for a plain-text prefix of U+200B followed by a short word on the active Piper profile. Natural incidence is unknown.
- Next check — Compare public preparation at 319 and 320 U+200B positions with the existing NBSP control. Verify the first word and its exact source range, bounded progress, and continued rejection where a substantive protected token exceeds its limit. [Source trace and snapshot][audit-2026-11-13-pass-5]

- 2026-11-13 deep assessment — Present for the silent prefix and an interior run before more speech. Whole silent windows and suffixes have existing progress paths. Scope other omission categories explicitly. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: public preparation through formatting omissions and subsequent source ranges. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0053

**Piper drops the scene pause when it skips punctuation.** When an isolated punctuation paragraph lies immediately before a recognized silent scene separator, preparation attaches the scene boundary to that paragraph's segment. Piper skips it, so the preceding spoken paragraph retains its ordinary 600-ms pause when the next spoken unit is buffered.

- Owner — `ProductNarrationCoordinator.#prepareNarration` filters segments before mapping their boundaries to playback delays. Package-side scene metadata is present before filtering.
- Disposition — `fixed`, P3. Playback-consumer variant of SFA-01 under the documented Piper-only punctuation omission.
- Coverage gap — The SFA-01 playback control places a scene separator directly after a spoken paragraph. The Piper omission test exercises a leading skipped unit without scene metadata.
- 2026-11-13 assessment — `inspected-present` for buffered spoken successors and an ordinary non-ellipsis paragraph before the discarded punctuation.
- Next check — Use real EPUB preparation and the mounted Piper coordinator to observe the single intended 1,200-ms transition. Check that punctuation stays out of synthesis, an audible terminal ellipsis keeps its 900-ms override, and a missing successor adds no pause. [Source trace and snapshot][audit-2026-11-13-pass-5]
- Reconciliation — Include a scene across the eight-segment preparation boundary. The preceding audio unit can already be scheduled, so carry run-owned scene evidence to the incoming speakable unit and keep the audible ellipsis policy. [Correction analysis][audit-2026-11-13-reconciliation]

- 2026-11-13 deep assessment — Present within and across the eight-segment batch boundary with a buffered successor. Preserve the audible ellipsis override and the final/underrun paths. Static evidence only. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: public preparation and controlled buffered spoken handoffs across omission-only batches. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0054

**A split lexical expansion loses text on warm continuation.** A Piper hard boundary can split a multi-origin Spanish expansion that fits in a fresh segment. The next request renormalizes the raw suffix, losing letters and differing from cold preparation at the same locator.

- Owner — Lexical-span protection in `narration-bilingual-normalizer.ts` and `bilingual-spanish-normalization.ts`, consumed by the scanner, packer and public warm continuation.
- Disposition — `fixed`, P2. Adjacent to VF-0037 and R7-05, with a different trigger and invariant.
- Coverage gap — Packer controls cover per-source-unit expansions and protected code. CFR-18 covers grammatical form. M005 requires expansion preservation and batch-size determinism.
- 2026-11-13 assessment — `inspected-present` through independent source inspections. In Spanish Piper v2, 156 lowercase a characters followed by `#1.º.` can produce `#pri` at [0,158), then warm `.º.` while cold gives `mero.` at [158,161). Seven earlier short paragraphs place this boundary at the desktop's eighth segment. Natural incidence is unmeasured.
- Next check — Compare public one- and eight-segment draining and cold preparation at the returned locator. Keep ordinary whitespace boundaries, adjacent independent matches, source mapping and oversized-token rejection. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: public warm/cold preparation at expansion cuts and batch boundaries. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


## VF-0055

**Inline Stop can precede a stale synthesis dispatch.** Snapshot publication between scheduler reservation and client synthesis can confirm a new audible chapter, trigger synchronous unavailable placement and Stop, then return to dispatch the obsolete segment.

- Owner — `ProductNarrationCoordinator.#synthesize` across `#publish`, PCM synchronization and `TtsProcessClient.cancel/synthesize`.
- Disposition — `fixed`, P3, timing-dependent cancellation defect. Continues the fifth pass's unindexed pre-dispatch question and is adjacent to VF-0045 and CCF-C07's service-start guard.
- Coverage gap — CCF-C07 guards service start after synchronous publication. Synthesis checks its run token after awaiting the client.
- 2026-11-13 assessment — `inspected-present` for the source-supported order, independently inspected twice. Active follow, direct-audio confirmation during publication, pending synthesis and zero outer accounting delta permit one obsolete local IPC. A positive outer delta can throw before dispatch. Host incidence and whether native inference starts remain unmeasured. Shutdown subsequently contains the operation and rejects late results.
- Next check — Use the mounted reader, a controlled direct-render clock and an unavailable next chapter. Assert zero synthesis IPC after inline invalidation, bounded cleanup and subsequent explicit Play. Cover current-run dispatch and late local-preparation ownership. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. R01 additionally exposed post-publication local preparation after Stop; the mounted public-preparation witness now admits zero obsolete work. Natural incidence remains unmeasured. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).

## VF-0056

**Missing installer helper unnecessarily retains the application-data backup.**
After `runJourney` moves controlled data aside, Node cannot spawn the PowerShell
helper. No child PID exists, but the wrapper reports uncertain containment and
leaves recovery blocked instead of preserving the original launch error and
restoring the absent destination.

- Owner — `runOwnedInstaller` and `runJourney` in `ordinary-chatterbox-release-host.mjs`.
- Disposition — `fixed`, P2, maintainer tooling. Acceptance is bounded by the linked host evidence and independent report for the CI correction.
- Lineage — Recurrence of unimported CCF-C04's proven no-spawn recovery contract, introduced by `1058d991cfc78cb3fdbadc6526059b04f783735f`. Linked to VF-0040's process-wrapper correction; this trigger is failure to create the helper, not a non-exiting installer. The [CCF plan](../../plans/completed/confirmed-chat-findings-minimal-corrections.md#u6-maintainer-recovery-and-output-identity) requires immediate safe restoration only when no installer began.
- Coverage gap — The existing Windows C04 test exercised a helper receipt for a rejected target. The VF-0040 uncertain fixture used a missing helper and incorrectly expected uncertainty. Ubuntu exposed the distinction through the retained portable test.
- 2026-11-14 assessment — `reproduced` by Ubuntu PR #316 CI and a controlled missing-helper path in normal Windows PowerShell on the starting HEAD. The new regression fails before the owner edit. Its two attempts pass afterward, together with all 39 ordinary-host tests, including real Windows containment, ambiguous ENOENT, failed cleanup and backup retention after a launched helper yields no receipt.
- Correction — Preserve the actual spawn error and privately mark no-spawn only when the actual child has no PID and a spawn syscall. Keep session/install/destination absence checks; uncertainty after process creation still retains the backup. No public contract or architectural change.
- Evidence and final acceptance — [CI follow-up](../../plans/evidence/deep-findings-ci-follow-up/acceptance.md), [independent report](../../plans/evidence/deep-findings-ci-follow-up/review-r01.md). Historical completed plans and reviews remain unchanged.

[cfr-plan]: ../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#finding-and-history-register
[cfr-review]: ../../plans/evidence/chat-findings-recovery/review-final-r03.md
[cfr-ledger]: ../../plans/evidence/chat-findings-recovery/execution-ledger.md
[pn-plan]: ../../plans/completed/passage-navigation-minimal-corrections.md
[pn-review]: ../../plans/evidence/passage-navigation/review-r3.md
[pn-ledger]: ../../plans/evidence/passage-navigation/execution-ledger.md
[rpi-plan]: ../../plans/completed/reader-position-and-image-lifecycle.md
[rpi-review]: ../../plans/evidence/reader-position-and-image-lifecycle/closeout.md
[rpi-ledger]: ../../plans/evidence/reader-position-and-image-lifecycle/execution-ledger.md
[fpa-exclusions]: ../../plans/completed/five-pass-audit-revalidation-and-corrections.md#excluded-or-conditional-register
[fpa-receipt]: ../../plans/evidence/five-pass-audit/review-U12-4.4-R1.md
[release-test]: ../../../apps/desktop/scripts/windows-release.node-test.mjs
[audit-2026-11-13]: audits/2026-11-13-static-logic-audit.md
[audit-2026-11-13-pass-2]: audits/2026-11-13-static-logic-audit-pass-2.md
[audit-2026-11-13-pass-3]: audits/2026-11-13-static-logic-audit-pass-3.md
[audit-2026-11-13-pass-4]: audits/2026-11-13-static-logic-audit-pass-4.md
[audit-2026-11-13-pass-5]: audits/2026-11-13-static-logic-audit-pass-5.md
[audit-2026-11-13-reconciliation]: audits/2026-11-13-findings-reconciliation.md
[audit-2026-11-13-deep]: audits/2026-11-13-deep-findings-validation.md

- 2026-11-14 execution — `reproduced` on the original relevant owner: controlled production Reader/coordinator reentrancy with zero retired synthesis dispatch; no natural-incidence or stale-audio claim. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.
