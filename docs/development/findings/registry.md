# Findings registry

Use the [workflow](README.md) to reconcile these records with the checkout under
review. The [import manifest](history-import.md) identifies the historical
snapshots, integration commits and scope of this seed.

All imported entries have latest check `not-revalidated` at the 2026-11-13
import on `403eb27916afe26d4794a7e36aeb97e6d1529bf1`. The disposition and
evidence below belong to the historical source. A linked test identifies a
scenario and its scope. Consult the cited report for recorded execution.

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

## VF-0001

**Recovery starts at the last heard position.** When an earlier pass established heard progress and a later start attempt fails before audio, recovery uses the latest heard locator. The attempted start supplies the target when there is no heard locator.

- Reported concern — Recovery can return to A after an attempted start at B. The report questioned this intentional priority when A contains the latest heard position.
- Owner — [`product-narration-coordinator.ts`](../../../apps/desktop/src/tts/product-narration-coordinator.ts). `ProductNarrationCoordinator.recover`.
- Historical disposition — `intentional`. [CFR-01][cfr-plan] and the [CFR final review][cfr-review] preserve the policy in #314. The case required no correction commit.
- Lineage — CFR-01 and the withdrawn VUC recovery proposal describe the same behavior. FPA first-start and cancelled-recovery corrections exercise different prerequisites.
- Why it escaped or stayed open — The candidate conflicted with the documented recovery policy.
- Evidence — [VUC recovery decision](../../plans/completed/visible-locator-unicode-compound-corrections.md) and [CFR final review][cfr-review] record the disposition.

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

## VF-0004

**Inert anchors preserve block descendants.** An EPUB 3 inert external or no-href anchor wrapping a supported block must preserve its safe descendants and leave the link inert.

- Historical consequence — Projection rejected the supported document when a block entered the inline collector.
- Owner — [`xhtml-projector.ts`](../../../packages/epub/src/document/xhtml-projector.ts). `XhtmlProjector.beginLink`.
- Historical disposition — `fixed`. [CFR-04][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-04 extends the M003 and ADR-0007 inert-link behavior. [VF-0031](#vf-0031) concerns a different navigation boundary.
- Why it escaped or stayed open — Earlier inline-link cases missed flow descendants.
- Evidence — [Projection test](../../../packages/epub/src/document/xhtml-projector.test.ts) `projects inert block anchor descendants`.

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

## VF-0009

**Spanish time article survives no-break spacing.** Normalize synthetic `Las\u00a014:30.` and the narrow no-break variant with one article. Preserve supported casing and source spans.

- Historical consequence — Article recognition missed the no-break space and emitted a second article.
- Owner — [`bilingual-spanish-normalization.ts`](../../../packages/epub/src/narration/bilingual-spanish-normalization.ts). `SPANISH_LEXICAL_NORMALIZATION_FORMS`.
- Historical disposition — `fixed`. [CFR-09][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-09 extends SAF-12. [VF-0018](#vf-0018) is a different Spanish context rule in the same suite.
- Why it escaped or stayed open — Earlier coverage used ASCII spacing. Article recognition preceded whitespace collapse.
- Evidence — [Normalizer regression](../../../packages/epub/src/narration/narration-normalizer.test.ts) `SAF-12 preserves the closed Spanish time article` includes both no-break spaces.

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

## VF-0021

**Failed v12 quality setup or publication leaves a retryable session.** If adapter/corpus setup or map/HTML publication fails, stage and clean only newly owned output while preserving the existing machine session for retry.

- Historical consequence — Failure before protected publication could leave an unusable quality directory and block retry.
- Owner — [`corrective_v12_quality.py`](../../../services/tts/benchmarks/corrective_v12_quality.py). `generate_quality_session`.
- Historical disposition — `fixed`. [CFR-21][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-21 follows R8-02 adapter-close and SAF-05 summary-write checks. Related ownership issues are [VF-0006](#vf-0006) and [VF-0024](#vf-0024).
- Why it escaped or stayed open — Earlier checks covered close or summary failure. Setup and publication lay outside the protected scope.
- Evidence — [Python regression](../../../services/tts/tests/test_benchmark_corrective_v12.py) `test_v12_quality_failure_preserves_machine_session`.

## VF-0022

**Package size reflects proven retained bytes.** After failed transfer, partial removal or invalid installation, report retained storage only where ownership and size evidence supports it. Omit unknown retained bytes.

- Historical consequence — Error states could report the full expected package size without proof of the bytes retained.
- Owner — [`tts_optional_chatterbox.rs`](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs). `OptionalChatterboxManager::snapshot_operation` and `snapshot_from`.
- Historical disposition — `fixed`. [CFR-22][cfr-plan], [CFR final review][cfr-review], #314.
- Lineage — CFR-22 follows CAF staging estimate removal and the RCF-13/C14 postcommit proof rules. [VF-0005](#vf-0005) concerns staging ownership.
- Why it escaped or stayed open — Earlier controls covered staging-only estimates or valid postcommit provenance. Error states could still use manifest size.
- Evidence — [Rust regression](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs) `cfr22_failed_transfer_does_not_claim_installed_bytes`.

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

## VF-0029

**Fallback placement and reflow preserve the saved checkpoint.** Restore an interior checkpoint when its geometry is unavailable, then edit appearance, flush and reopen. Preserve the canonical checkpoint while allowing a visible fallback to guide an explicit narration start. Layout changes alone lack manual save authority.

- Historical consequence — Visual fallback or layout changes could replace the saved interior checkpoint with a different offset.
- Owner — [`reader-position-save-coordinator.ts`](../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts). `ReaderPositionSaveCoordinator.scheduleReflow`.
- Historical disposition — `fixed`. [RPI-01][rpi-plan], [RPI closeout][rpi-review], #311.
- Lineage — RPI-01 includes the related C1 image-layout observation. CAF R4.1 and CCF C02 addressed visual publication and narration start. [CFR-12](#vf-0012) covers a different edit ordering.
- Why it escaped or stayed open — Earlier tests checked visible placement and narration separately from persistence through layout changes.
- Evidence — [Browser regression](../../../apps/desktop/tests/browser/reader-image-lifecycle.smoke.spec.ts) `RPI-01/C1 preserves canonical progress through image and appearance layout`. Historical evidence distinguishes controlled fallback and the observed C1 geometry change.

## VF-0030

**Image loading releases and reuses bounded capacity.** When early occurrences fill the live image capacity, moving to later occurrences must free eligible offscreen resources and prioritize visible work. Returning to released images can reload them within the existing limits.

- Historical consequence — Later visible images could remain unavailable after earlier occurrences exhausted live capacity.
- Owner — [`publication-raster-image-loader.ts`](../../../apps/desktop/src/reader/images/publication-raster-image-loader.ts). `PublicationRasterImageLoader.pumpImages`.
- Historical disposition — `fixed`. [RPI-02][rpi-plan], [RPI closeout][rpi-review], #311.
- Lineage — RPI-02 is the image lifetime policy extension. The later Windows CI timeout had unresolved cause and remains separate.
- Why it escaped or stayed open — Visibility observation disconnected after initial admission. Later images had no capacity transition to retry.
- Evidence — [Browser regression](../../../apps/desktop/tests/browser/reader-image-lifecycle.smoke.spec.ts) `RPI-02 loads later images and reloads released earlier occurrences` and [RPI ledger][rpi-ledger]. The original capacity issue reproduced in Chromium.

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
