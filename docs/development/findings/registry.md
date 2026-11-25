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

The November 18 implementation covers VF-0093 through VF-0132. Current
per-case results, host prerequisites and the exact independent review are
linked from the [implementation ledger](../../plans/evidence/november-17-findings/implementation-cases.md)
and [completed ExecPlan](../../plans/completed/november-17-findings-corrections.md).

The [November 23 reconciliation](audits/2026-11-23-findings-reconciliation.md) records
previous fix scope, regression risks and bounded correction checks for VF-0093
and VF-0133 through VF-0166.

The [November 23 deep validation](audits/2026-11-23-deep-findings-validation.md) reviews
all 35 triggers and records seven additional cases, VF-0167 through VF-0173.

Each of the 42 November 23 entries has a dated execution update. The six
milestones link the individual trigger checks, adjacent controls and recovery
actions. The host record distinguishes listening, measured performance and
artifact-bound installer evidence. [Execution plan](../../plans/completed/november-23-findings-corrections.md) · [Integrated checks](../../plans/evidence/november-23-findings/integrated-gates.md)

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
| [VF-0058](#vf-0058) | Runtime | Late cancellation loses the Chatterbox installation completion event | `fixed` |
| [VF-0059](#vf-0059) | Release | Ordinary journey can restore application data without verified smoke cleanup | `fixed` |
| [VF-0060](#vf-0060) | EPUB | Trailing no-break space rejects a TOC label at the retained limit | `fixed` |
| [VF-0061](#vf-0061) | Narration | An en space before a Spanish time duplicates the article | `fixed` |
| [VF-0062](#vf-0062) | Playback | Direct Web Audio playback allocates two extra full-unit buffers | `fixed` |
| [VF-0063](#vf-0063) | Reader | Shift+Space scrolling cannot recover Play after unavailable placement | `fixed` |
| [VF-0064](#vf-0064) | EPUB | Implicit paragraphs lose the direction of their XHTML container | `fixed` |
| [VF-0065](#vf-0065) | Benchmarks | v14 derivation deletes the raw session before validation | `fixed` |
| [VF-0066](#vf-0066) | Playback | A pending refill can resume below one playable minute after a rate change | `fixed` |
| [VF-0067](#vf-0067) | Release | The ordinary journey can record a different installer from the one it ran | `fixed` |
| [VF-0068](#vf-0068) | Release | Attaching receipts can change the build authority of unchanged artifacts | `fixed` |
| [VF-0069](#vf-0069) | Benchmarks | v14 can pass scheduling after playback simulation fails | `fixed` |
| [VF-0070](#vf-0070) | Benchmarks | v14 CPU admission accepts a memory signal unrelated to the failed batch | `fixed` |
| [VF-0071](#vf-0071) | Benchmarks | Externally mixed v14 inputs lack pairing proof; ordinary workflow defect not established | `not-confirmed` |
| [VF-0072](#vf-0072) | Release | Fresh-build evidence can attribute signature, scan and checksum observations to replaced artifacts | `fixed` |
| [VF-0073](#vf-0073) | Benchmarks | v14 can report a passed privacy audit after measured-worker privacy detection | `fixed` |
| [VF-0074](#vf-0074) | Reader | A passive viewport sample can overwrite a heard checkpoint after Stop | `candidate` |
| [VF-0075](#vf-0075) | Reader | A nested explicit automatic direction is lost in the rendered reader | `candidate` |
| [VF-0076](#vf-0076) | Release | The ordinary journey accepts Installed before download cleanup settles | `candidate` |
| [VF-0077](#vf-0077) | Benchmarks | v14 reports restored sleep settings without observing restoration | `candidate` |
| [VF-0078](#vf-0078) | Narration | An omitted formatting mark before a Spanish time duplicates the article | `candidate` |
| [VF-0079](#vf-0079) | Release | Reordering custom NSIS language keys blocks release validation | `candidate` |
| [VF-0080](#vf-0080) | Settings | Ordinary Chatterbox installation exposes actions while cleanup owns the download | `candidate` |
| [VF-0081](#vf-0081) | Release | Cancellation evidence treats a failed staging lookup as absence | `candidate` |
| [VF-0082](#vf-0082) | Benchmarks | Concurrent evaluator corrections can replace an accepted correction | `candidate` |
| [VF-0083](#vf-0083) | Benchmarks | Quality generation retains both output pipes before enforcing the result limit | `candidate` |
| [VF-0084](#vf-0084) | Narration | An omitted mark can turn an ambiguous English street abbreviation into Saint | `candidate` |
| [VF-0085](#vf-0085) | Release | The lifecycle journal can prevent uninstall and application-data restoration | `candidate` |
| [VF-0086](#vf-0086) | Benchmarks | Failed CustomVoice staging creation leaves a session that blocks retry | `candidate` |
| [VF-0087](#vf-0087) | Release | Optional-data cleanup accepts absence beneath an unsafe directory | `candidate` |
| [VF-0088](#vf-0088) | Release | A download probe can accept an unrelated error as its injected file-create failure | `candidate` |
| [VF-0089](#vf-0089) | Benchmarks | v5 concurrent execution can start with a failed GPU baseline | `candidate` |
| [VF-0090](#vf-0090) | Benchmarks | v5 can skip explicit worker cleanup after a cold-load observation fails | `candidate` |
| [VF-0091](#vf-0091) | Benchmarks | The v5 queued cancellation trial can pass with no queued request | `candidate` |
| [VF-0092](#vf-0092) | Narration | English title lookahead can cross inline-code whitespace | `candidate` |
| [VF-0093](#vf-0093) | Runtime | Cancel start can miss in-flight native package verification | `candidate` |
| [VF-0094](#vf-0094) | Release | The download probe rejects the native first-artifact diagnostic | `candidate` |
| [VF-0095](#vf-0095) | Settings | Late Cancel can hide the post-commit Chatterbox cleanup action | `candidate` |
| [VF-0096](#vf-0096) | Reader | Flattened inline direction scopes can scramble visual run order | `candidate` |
| [VF-0097](#vf-0097) | Reader | Hidden Auto markup can push a chapter over the live-node limit | `candidate` |
| [VF-0098](#vf-0098) | Benchmarks | Forced quality-generation timeout can strand private staging and block retry | `candidate` |
| [VF-0099](#vf-0099) | Benchmarks | An invalid v5 authority commit reaches official execution | `candidate` |
| [VF-0100](#vf-0100) | Release | Windows validation can install in a remembered nondefault location | `candidate` |
| [VF-0101](#vf-0101) | Release | Standalone lifecycle receipt can credit installer bytes it did not exercise | `candidate` |
| [VF-0102](#vf-0102) | Playback | Late rate failure after paused final audio can overwrite the saved speed | `candidate` |
| [VF-0103](#vf-0103) | Playback | A short underrun can report zero buffering time | `candidate` |
| [VF-0104](#vf-0104) | Benchmarks | Interrupted safety journal write can block restoration retry | `candidate` |
| [VF-0105](#vf-0105) | Benchmarks | A warm-up privacy detection can leave a passing v14 audit | `candidate` |
| [VF-0106](#vf-0106) | Runtime | Chatterbox can start while a newer compatibility check is pending | `candidate` |
| [VF-0107](#vf-0107) | Release | Windows evidence attachment can accept a missing or stale checksum | `candidate` |
| [VF-0108](#vf-0108) | EPUB | Central-directory ordering can change ZIP compression admission | `candidate` |
| [VF-0109](#vf-0109) | EPUB | Empty CDATA can reject an XHTML document at its node limit | `candidate` |
| [VF-0110](#vf-0110) | Narration | A warm batch boundary can lose an ampersand expansion | `candidate` |
| [VF-0111](#vf-0111) | Narration | A scene ornament can lose its silent classification across a source window | `candidate` |
| [VF-0112](#vf-0112) | Runtime | Chatterbox acquisition can follow a redirected staging directory | `candidate` |
| [VF-0113](#vf-0113) | Narration | An implicit paragraph can lose the language of its line break | `candidate` |
| [VF-0114](#vf-0114) | Runtime | Chatterbox provider loss during load is reported as a warm-up failure | `candidate` |
| [VF-0115](#vf-0115) | Benchmarks | An accepted v6 quality scorecard can be impossible to aggregate | `candidate` |
| [VF-0116](#vf-0116) | Benchmarks | CPU fallback CLI loses the retryable `quality-busy` result | `candidate` |
| [VF-0117](#vf-0117) | Benchmarks | A failed quality correction can print a filesystem traceback | `candidate` |
| [VF-0118](#vf-0118) | Settings | An over-limit saved profile can stop playback before Chatterbox activation fails | `candidate` |
| [VF-0119](#vf-0119) | EPUB | A chapter filename containing `#` can prevent a book from opening | `candidate` |
| [VF-0120](#vf-0120) | EPUB | A padded `xml:id` can send navigation to chapter start | `candidate` |
| [VF-0121](#vf-0121) | Settings | Replacing a focused Settings action can leave Escape unhandled | `candidate` |
| [VF-0122](#vf-0122) | Playback | A stale fallback warning can follow an explicit selection of 1× | `candidate` |
| [VF-0123](#vf-0123) | Benchmarks | Native refill wall timing starts after resource sampling | `candidate` |
| [VF-0124](#vf-0124) | Benchmarks | Native active-cancellation evidence can credit a Stop after generation completes | `candidate` |
| [VF-0125](#vf-0125) | Benchmarks | Reader reflow benchmarks time frame callbacks without observing realignment | `candidate` |
| [VF-0126](#vf-0126) | Narration | Chatterbox can fail before speech after a long silent prefix | `candidate` |
| [VF-0127](#vf-0127) | Settings | A known oversized language preference can interrupt narration | `candidate` |
| [VF-0128](#vf-0128) | Narration | An explicitly foreign line break can permit a Spanish word join | `candidate` |
| [VF-0129](#vf-0129) | Benchmarks | v6 calls a multi-evaluator quality session eligible | `candidate` |
| [VF-0130](#vf-0130) | Benchmarks | Malformed preflight fields can bypass the CLI failure receipt | `candidate` |
| [VF-0131](#vf-0131) | Benchmarks | Quick-start lead is sampled after playback starts | `candidate` |
| [VF-0132](#vf-0132) | Runtime | Graceful shutdown can accept invalid trailing protocol output | `candidate` |
| [VF-0133](#vf-0133) | Runtime | A cancelled Download can borrow the next Chatterbox confirmation | `candidate` |
| [VF-0134](#vf-0134) | EPUB | A leading nonbreaking space in a chapter filename can prevent opening | `candidate` |
| [VF-0135](#vf-0135) | EPUB | An internal link wrapping a paragraph can prevent opening | `candidate` |
| [VF-0136](#vf-0136) | Reader | PageDown from a focused inline link can leave an old checkpoint | `candidate` |
| [VF-0137](#vf-0137) | Narration | An omitted formatting mark can defeat long scene-break recognition | `candidate` |
| [VF-0138](#vf-0138) | Playback | Refill timing can end while playback-rate preparation is pending | `candidate` |
| [VF-0139](#vf-0139) | Benchmarks | Retained quality evaluation can accept an unaggregatable panel | `candidate` |
| [VF-0140](#vf-0140) | Benchmarks | Failed quality cleanup can omit its JSON failure receipt | `candidate` |
| [VF-0141](#vf-0141) | Settings | A staging failure can hide verified Chatterbox cleanup | `candidate` |
| [VF-0142](#vf-0142) | Reader | Appearance changes can settle a chapter jump before its target renders | `candidate` |
| [VF-0143](#vf-0143) | Reader | A wheel gesture at the scroll boundary can misattribute restoration movement | `candidate` |
| [VF-0144](#vf-0144) | Playback | Slowed playback can drop the end of a PCM unit | `candidate` |
| [VF-0145](#vf-0145) | EPUB | Text in a hidden TOC label can prevent opening | `fixed` |
| [VF-0146](#vf-0146) | Runtime | Native Chatterbox Download can accept an incomplete compatibility report | `candidate` |
| [VF-0147](#vf-0147) | Benchmarks | Interrupted preparation can strand a benchmark reservation ID | `candidate` |
| [VF-0148](#vf-0148) | Release | The Windows package check can pass with a damaged Piper payload | `candidate` |
| [VF-0149](#vf-0149) | Release | A disappearing WebView2 file can abort the Windows lifecycle harness | `confirmed` |
| [VF-0150](#vf-0150) | Settings | Reader says defaults are active while using a custom appearance | `candidate` |
| [VF-0151](#vf-0151) | Reader | Focus can move behind the forced-colors table of contents | `candidate` |
| [VF-0152](#vf-0152) | EPUB | The reader drops an individual list item's direction | `candidate` |
| [VF-0153](#vf-0153) | Playback | Refill speed feedback refers to an audio section that ended | `candidate` |
| [VF-0154](#vf-0154) | Runtime | A pending TTS start remains eligible after application exit cleanup | `candidate` |
| [VF-0155](#vf-0155) | Release | The inventory labels an inactive crate as required on Windows | `candidate` |
| [VF-0156](#vf-0156) | Reader | A delayed audio receipt can move the reading viewport during Pause | `candidate` |
| [VF-0157](#vf-0157) | Reader | Finishing automatic direction preparation can drop reader focus | `candidate` |
| [VF-0158](#vf-0158) | Narration | A spaced Unicode minus can allow partial Celsius normalization | `candidate` |
| [VF-0159](#vf-0159) | Runtime | The startup witness can report model loading after it finishes | `candidate` |
| [VF-0160](#vf-0160) | Benchmarks | The handoff benchmark can report zero network activity without sampling | `candidate` |
| [VF-0161](#vf-0161) | EPUB | Valid mixed-case text direction can prevent opening | `candidate` |
| [VF-0162](#vf-0162) | EPUB | A declared metadata prefix alias can prevent opening | `candidate` |
| [VF-0163](#vf-0163) | Reader | Closing an oversized first chapter can save an unread position | `candidate` |
| [VF-0164](#vf-0164) | Reader | Paragraph Play can be enabled before a jump settles | `candidate` |
| [VF-0165](#vf-0165) | Benchmarks | Native stable-playback evidence can include earlier runs | `candidate` |
| [VF-0166](#vf-0166) | Settings | The local Chatterbox candidate can offer unsupported removal and stop Piper | `candidate` |
| [VF-0167](#vf-0167) | EPUB | An OPF vocabulary alias can admit a fixed-layout rendition | `candidate` |
| [VF-0168](#vf-0168) | Reader | Replacing the book can suppress an appearance-save failure | `candidate` |
| [VF-0169](#vf-0169) | Maintainer playback evidence | Playback-speed timing gates measure intentional pauses | `candidate` |
| [VF-0170](#vf-0170) | Maintainer network evidence | Successful network sampling omits IPv6 protocols | `candidate` |
| [VF-0171](#vf-0171) | Retained quality tooling | Scorecard or aggregate publication can bypass the CLI error response | `candidate` |
| [VF-0172](#vf-0172) | Narration | A dotted identifier can suppress a standalone Celsius expansion | `candidate` |
| [VF-0173](#vf-0173) | Narration | Inline code markers get different scene classification across source windows | `candidate` |
| [VF-0174](#vf-0174) | CI | The main branch rules allow a merge with failing or pending CI | `confirmed` |
| [VF-0175](#vf-0175) | Dependency updates | The weekly Chatterbox v7 resolver rejects the pinned Windows wheel | `confirmed` |
| [VF-0176](#vf-0176) | Dependency updates | The base and core Python update jobs do not maintain their uv locks | `confirmed` |
| [VF-0177](#vf-0177) | CI | Distinct PR and push runs can cancel each other | `candidate` |
| [VF-0178](#vf-0178) | CI | Rust foundation can compile and test an uncommitted resolution | `candidate` |
| [VF-0179](#vf-0179) | Local foundation checks | ESLint scans package-local ignored scratch directories | `confirmed` |
| [VF-0180](#vf-0180) | CI | A later native command can mask a Windows setup failure | `candidate` |
| [VF-0181](#vf-0181) | Release audit | Node and Rust failures discard the advisory details | `confirmed` |
| [VF-0182](#vf-0182) | Release audit | Equivalent Rust warning policy objects can fail the check | `candidate` |
| [VF-0183](#vf-0183) | Release inventory | The generated audit result exceeds the production Node severity check | `candidate` |
| [VF-0184](#vf-0184) | Dependency updates | A deferred TypeScript major blocks grouped development updates | `confirmed` |
| [VF-0185](#vf-0185) | Windows CI fixture | A passing synthetic lifecycle receipt depends on file and wall-clock timing | `confirmed` |

## VF-0057

- 2026-11-25 [CI audit][audit-ci-2026-11-25] on `28e157c` — The November 14 Windows CI failure predates the synchronous write admission in #318. The repaired test still admits the write before asserting Busy, so the earlier scheduling assumption is `inspected-absent`.

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
- 2026-11-16 assessment — `inspected-absent` for the alleged violation on `079c38ece8687b24859db4f64d4f92bba67bdcee`. Explicit Recover still uses the latest heard locator when one exists. A later write to the durable checkpoint has its own trigger in [VF-0074](#vf-0074). [Audit][audit-2026-11-16]

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for the alleged recovery-target policy violation. Explicit recovery still uses the latest heard locator when present and the attempted start otherwise. [Recovery owner](../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1155) [Audit][audit-2026-11-17]

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
- 2026-11-17 fourth-pass assessment — `inspected-absent` for the original abandoned, owned staging lifecycle on `50f3b9e`. Startup and ordinary Check use the [ancestry-checked reconciler](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2031). [VF-0112](#vf-0112) concerns different acquisition callers. [Fourth audit][audit-2026-11-17-pass-4]

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
- 2026-11-15 assessment — `inspected-absent` for those two no-break spaces on the [current audit snapshot][audit-2026-11-15]. The en-space variant has a separate trigger, [VF-0061](#vf-0061).

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
- 2026-11-16 second-pass assessment — `inspected-absent` for the original sequential unlink failure. Removal precedes publication and the [current derivation](../../../services/tts/benchmarks/cpu_fallback_result.py#L400) rejects stale aggregates. Concurrent correction publication has a separate admission defect, [VF-0082](#vf-0082). [Second pass][audit-2026-11-16-pass-2]
- 2026-11-17 fourth-pass assessment — `inspected-absent` on `50f3b9e` for publishing the correction before aggregate removal. [VF-0117](#vf-0117) concerns the command's failure receipt for the same filesystem fault. [Fourth audit][audit-2026-11-17-pass-4]

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
- 2026-11-16 third-pass assessment — `inspected-absent` for the original failed preparation in the admitted v12 machine session. The [temporary quality directory](../../../services/tts/benchmarks/corrective_v12_quality.py#L419) owns preparation before publication. [VF-0086](#vf-0086) is a retained screen with a separate setup owner. [Third pass][audit-2026-11-16-pass-3]

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
- 2026-11-15 fourth-pass assessment — `inspected-absent` for that capacity failure in the current source when the viewport observer delivers the exit. Retirement releases the old handle, advances the capacity revision and schedules the waiting visible occurrence. A cancelled completion must still match its registered controller to publish. [Fourth-pass assessment][audit-2026-11-15-pass-4]

- 2026-11-17 third-pass assessment — `inspected-absent` on `50f3b9e` for permanent raster capacity exhaustion after earlier occurrences leave the retention margin. Outside status retires their handles, release advances the capacity revision, and the loader pumps visible demand ahead of queued prefetch. [Visibility handling](../../../apps/desktop/src/reader/images/publication-raster-image-loader.ts#L155), [release and retry](../../../apps/desktop/src/reader/images/publication-raster-image-loader.ts#L267). [Third audit][audit-2026-11-17-pass-3]

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


- 2026-11-15 assessment — `inspected-absent` for U+2009 and the U+2007 companion on the [current audit snapshot][audit-2026-11-15]. Both are in the live matcher. The broader inline-space mismatch is [VF-0061](#vf-0061).

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


- 2026-11-15 assessment — `inspected-absent` for the original installer/uninstaller waits on the [current audit snapshot][audit-2026-11-15]; both enter the wrapped deadline and containment receipt path. [VF-0059](#vf-0059) concerns the separately launched narration smoke and loss of its cleanup verdict.

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


- 2026-11-16 second-pass assessment — `inspected-absent` for a failure limited to the scorecard directory creation. [Finalization](../../../services/tts/benchmarks/quality.py#L387) removes the empty directory it owns before any WAV move and reports the setup failure. [Second pass][audit-2026-11-16-pass-2]

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


- 2026-11-15 assessment — `inspected-absent` for the original explicit integrity retry and failed ordinary poll before download completion on the [current audit snapshot][audit-2026-11-15]. Cancellation after commit has a different generation handoff, [VF-0058](#vf-0058).

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


- 2026-11-15 assessment — `inspected-absent` for the original short-label edges and blank XHTML label fallback on the [current audit snapshot][audit-2026-11-15]. [VF-0060](#vf-0060) is a pre-trim length rejection, before the corrected finish logic runs.

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


- 2026-11-17 second-pass assessment — `inspected-absent` on `50f3b9e` for the reported pending-rate behavior after logical completion. The [player](../../../apps/desktop/src/tts/pcm-playback.ts#L877) retires the future-rate attempt once the scheduler reports complete. [VF-0102](#vf-0102) follows a final unit that has ended while the scheduler is still paused. [Second audit][audit-2026-11-17-pass-2]

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

- 2026-11-15 second-pass assessment — `inspected-absent` for the original 1,365-item event overflow in public preparation. The public caller retains only leaves and charges structural traversal without retaining those events. [Source trace and snapshot][audit-2026-11-15-pass-2]


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


- 2026-11-17 third-pass assessment — `inspected-absent` on `50f3b9e` for loss of an already classified scene boundary after a Piper punctuation elision in the examined path. [The product preparation callback](../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2134) transfers that boundary to the following speakable unit. [VF-0111](#vf-0111) concerns a scene that the package never classifies. [Third audit][audit-2026-11-17-pass-3]

## VF-0054

**A split lexical expansion loses text on warm continuation.** A Piper hard boundary can split a multi-origin Spanish expansion that fits in a fresh segment. The next request renormalizes the raw suffix, losing letters and differing from cold preparation at the same locator.

- Owner — Lexical-span protection in `narration-bilingual-normalizer.ts` and `bilingual-spanish-normalization.ts`, consumed by the scanner, packer and public warm continuation.
- Disposition — `fixed`, P2. Adjacent to VF-0037 and R7-05, with a different trigger and invariant.
- Coverage gap — Packer controls cover per-source-unit expansions and protected code. CFR-18 covers grammatical form. M005 requires expansion preservation and batch-size determinism.
- 2026-11-13 assessment — `inspected-present` through independent source inspections. In Spanish Piper v2, 156 lowercase a characters followed by `#1.º.` can produce `#pri` at [0,158), then warm `.º.` while cold gives `mero.` at [158,161). Seven earlier short paragraphs place this boundary at the desktop's eighth segment. Natural incidence is unmeasured.
- Next check — Compare public one- and eight-segment draining and cold preparation at the returned locator. Keep ordinary whitespace boundaries, adjacent independent matches, source mapping and oversized-token rejection. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 execution — `reproduced` on the original relevant owner: public warm/cold preparation at expansion cuts and batch boundaries. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).


- 2026-11-17 third-pass assessment — `inspected-absent` on `50f3b9e` for the original lexical expansion interior split. [Packing](../../../packages/epub/src/narration/narration-segment-packer.ts#L536) excludes lexical expansion interiors. [VF-0110](#vf-0110) uses an allowed boundary before the expansion and loses preceding context. [Third audit][audit-2026-11-17-pass-3]

## VF-0055

**Inline Stop can precede a stale synthesis dispatch.** Snapshot publication between scheduler reservation and client synthesis can confirm a new audible chapter, trigger synchronous unavailable placement and Stop, then return to dispatch the obsolete segment.

- Owner — `ProductNarrationCoordinator.#synthesize` across `#publish`, PCM synchronization and `TtsProcessClient.cancel/synthesize`.
- Disposition — `fixed`, P3, timing-dependent cancellation defect. Continues the fifth pass's unindexed pre-dispatch question and is adjacent to VF-0045 and CCF-C07's service-start guard.
- Coverage gap — CCF-C07 guards service start after synchronous publication. Synthesis checks its run token after awaiting the client.
- 2026-11-13 assessment — `inspected-present` for the source-supported order, independently inspected twice. Active follow, direct-audio confirmation during publication, pending synthesis and zero outer accounting delta permit one obsolete local IPC. A positive outer delta can throw before dispatch. Host incidence and whether native inference starts remain unmeasured. Shutdown subsequently contains the operation and rejects late results.
- Next check — Use the mounted reader, a controlled direct-render clock and an unavailable next chapter. Assert zero synthesis IPC after inline invalidation, bounded cleanup and subsequent explicit Play. Cover current-run dispatch and late local-preparation ownership. [Deep validation][audit-2026-11-13-deep]

- 2026-11-14 closure — `fixed`, latest check `validated` on `fab1c9e186552515e828c33ce75e11628dda8300` plus the exact DFM-CR-R03-20261114 approved patch. The per-case result identifies the discriminating regression, adjacent controls and successful next action; runtime/static gates and restoration are accepted with explicit input-matched reuse. R01 additionally exposed post-publication local preparation after Stop; the mounted public-preparation witness now admits zero obsolete work. Natural incidence remains unmeasured. [Results](../../plans/evidence/deep-findings-minimal-corrections/results.md), [review](../../plans/evidence/deep-findings-minimal-corrections/review-r03.md).

The authorized correction attempt for VF-0058–VF-0073 is tracked in the
[execution ledger](../../plans/evidence/four-pass-findings-corrections/execution-ledger.md).
It records current-branch reproductions, completed checks and the remaining
acceptance gaps by case. Implementation R02 approved the scoped corrections and current-task evidence.
The dated audit observations preserve their original checkout coverage.
[Completed plan](../../plans/completed/four-pass-findings-corrections.md) ·
[Implementation review](../../plans/evidence/four-pass-findings-corrections/review-r02.md).

## VF-0058

**Late cancellation loses the Chatterbox installation completion event.** On a
compatible host with Chatterbox selected but unavailable, use Cancel while the
download command is pending. If verified promotion wins and cleanup succeeds,
Settings ends at Installed without refreshing that narrator. Play stays
unavailable until another action refreshes the selection.

- Owners — [OptionalChatterboxClient.cancel and its action generation](../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L313), [App's installation subscriber](../../../apps/desktop/src/App.tsx#L449) and the [native commit](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1591).
- Historical disposition — `candidate`, P2 product availability. `inspected-present` on the [2026-11-15 snapshot][audit-2026-11-15]; high confidence in the stated order, no native frequency established.
- Lineage — Variant of [VF-0046](#vf-0046). [ADD-01](../../plans/completed/five-pass-audit-revalidation-and-corrections.md) covers the fresh post-cancel display state, including successful installation and cleanup failure. The [client test](../../../apps/desktop/src/tts/optional-chatterbox-client.test.ts#L42) asserts the snapshot and request ownership; the [App test](../../../apps/desktop/src/App.test.tsx#L1096) covers download/retry without post-commit cancellation.
- Next check — Drive the current Settings/Play boundary through accepted cancellation after native commit, paired download settlement and a fresh Installed result. Verify Play returns without starting speech. Keep pre-commit cancellation, cleanup failure, ordinary completion and stale book/language/profile controls.
- 2026-11-15 reconciliation — `inspected-present`. ADD-01 exercised the same ordering through the client snapshot. The mounted narrator and the next explicit Play were outside that proof. [Case review](audits/2026-11-15-findings-reconciliation.md#vf-0058--chatterbox-cancel-after-install-commit)
- 2026-11-15 deep validation — `inspected-present`. Traced commit, paired Download settlement, client generation, the App subscriber and hidden Activate for the selected profile. A later visibility/compatibility check can recover availability, so permanent corruption is not claimed. Ordinary completion and stale-owner controls remain effective. [Detailed assessment](audits/2026-11-15-deep-findings-validation.md#vf-0058--completion-ownership)

- 2026-11-15 implementation closure — `fixed`, latest check `validated` on the R02-approved patch based on `df0109b0cefb50394e55eed10f2065140de837ec`. Mounted App reproduced both completion/cancellation orders and verified one refresh, no autoplay and successful explicit Play after the fix. [Execution evidence](../../plans/evidence/four-pass-findings-corrections/execution-ledger.md).
- 2026-11-16 assessment — `inspected-absent` for the lost completion on `079c38ece8687b24859db4f64d4f92bba67bdcee`. Late Cancel joins the paired Download and checks a fresh snapshot before publishing that Download's completion. The release runner consumes a different boundary in [VF-0076](#vf-0076). [Audit][audit-2026-11-16]
- 2026-11-16 second-pass assessment — `inspected-absent` for the paired late-Cancel sequence. The pending Cancel also still disables installed actions in the remount control. Ordinary post-commit actions without Cancel have a separate admission gap, [VF-0080](#vf-0080). [Second pass][audit-2026-11-16-pass-2]

## VF-0059

**Ordinary journey can restore application data without verified smoke
cleanup.** After backing up the application profile, the maintainer journey
launches native narration smokes. If a smoke exits after reporting uncertain
process cleanup, its parent sees only an ordinary test failure. The finalizer
can uninstall and restore the profile without proof that the smoke's
descendants stopped.

- Owners — [runCommand and runBilingualSmoke](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L833), [finalizeJourney](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1088), and the native smoke's [cleanup verdict](../../../apps/desktop/scripts/native-startup-smoke.mjs#L101).
- Historical disposition — `candidate`, P2 maintainer tooling. `inspected-present` on the [2026-11-15 snapshot][audit-2026-11-15] when smoke cleanup is unverified and the remaining teardown succeeds. No observed lingering process or data loss is claimed.
- Lineage — Variant of the recovery rule in [RAC-03](../../plans/completed/revalidated-audit-corrections.md) and adjacent to [VF-0040](#vf-0040) and [VF-0056](#vf-0056). Those paths classify session/installer failures, not the separate bilingual smoke launcher. [The portfolio runner](../../../apps/desktop/scripts/bilingual-portfolio-host.mjs#L232) already consumes the native smoke cleanup receipt.
- Next check — Through the ordinary journey's real child-result boundary, distinguish a failed assertion with confirmed teardown from failed/missing cleanup evidence. Use a disposable profile and verify only the former can restore it after safe uninstall.
- 2026-11-15 reconciliation — `inspected-present`. SAF-13 and MAF-01 already use a cleanup receipt on the portfolio and reader-correction routes. The ordinary launcher still discards that distinction. [Case review](audits/2026-11-15-findings-reconciliation.md#vf-0059--smoke-containment-before-profile-restoration)
- 2026-11-15 deep validation — `inspected-present`. The separate smoke's missing containment verdict is not repaired by the already-closed ordinary session or successful uninstall. Verified no-spawn, failed session close and uncertain installer cleanup retain their distinct protections. No orphan or data loss was observed. [Detailed assessment](audits/2026-11-15-deep-findings-validation.md#vf-0059--restoration-requires-the-smokes-containment)

- 2026-11-15 implementation closure — `fixed`, latest check `validated` on the R02-approved patch based on `df0109b0cefb50394e55eed10f2065140de837ec`. Actual disposable child processes verified that restoration waits for a positive cleanup receipt and terminal process outcome, including negative and missing receipts and assertion failure after safe teardown. [Execution evidence](../../plans/evidence/four-pass-findings-corrections/execution-ledger.md).

## VF-0060

**Trailing no-break space rejects a TOC label at the retained limit.** An
otherwise admitted spine-target label containing 1,024 visible code points
followed by U+00A0 is rejected before either parser trims the edge, so the
desktop cannot open the EPUB.

- Owners — [NavigationDocumentParser.appendLabelText](../../../packages/epub/src/navigation/navigation-document.ts#L521) and [NcxNavigationParser.appendLabelText](../../../packages/epub/src/navigation/ncx-navigation-parser.ts#L652), reached by public EPUB opening.
- Historical disposition — `candidate`, P3 product compatibility at a narrow boundary. `inspected-present` on the [2026-11-15 snapshot][audit-2026-11-15]; high confidence in the rejection, incidence unknown.
- Lineage — Variant of [VF-0047](#vf-0047). That fix trims short labels; its retained attribute byte control and the [NCX length control](../../../packages/epub/src/navigation/ncx-navigation-parser.test.ts#L179) exercise normalization and the maximum separately.
- Next check — Open EPUB 2 and 3 fixtures with padded exact-maximum labels; compare ASCII padding, unpadded labels and a genuinely oversized normalized label. Preserve internal no-break spaces and separate XML/attribute budgets.
- 2026-11-15 reconciliation — `inspected-present`. Commit `fa2ff5d` added end trimming for VF-0047 and retained the earlier immediate length check. The combined maximum-length plus trailing NBSP case survived that fix. [Case review](audits/2026-11-15-findings-reconciliation.md#vf-0060--toc-label-limit-with-a-trailing-nbsp)
- 2026-11-15 deep validation — `inspected-present`. The same retained-counter/trim mismatch also affects other admitted non-ASCII trailing padding, including U+202F. Leading Unicode padding, trailing ASCII padding and retained attribute UTF-8 charging are distinct controls to preserve. [Detailed assessment](audits/2026-11-15-deep-findings-validation.md#vf-0060--trim-and-retained-length)

- 2026-11-15 implementation closure — `fixed`, latest check `validated` on the R02-approved patch based on `df0109b0cefb50394e55eed10f2065140de837ec`. Public EPUB2 and EPUB3 opening passed with literal and entity suffix padding at the retained Unicode limit. Substantive overflow and adjacent attribute bounds remain enforced. [Execution evidence](../../plans/evidence/four-pass-findings-corrections/execution-ledger.md).
- 2026-11-16 assessment — `inspected-absent` for the reported exact-limit suffix on `079c38ece8687b24859db4f64d4f92bba67bdcee`. Both label parsers handle trimmable overflow and retain the substantive limit. [Audit][audit-2026-11-16]

## VF-0061

**An en space before a Spanish time duplicates the article.** In the active
Spanish narration profiles, synthetic prose `Las\u200214:30.` yields
`Las las catorce treinta.` at the prepared-text boundary. The article matcher
omits U+2002 from its inline set, the bare time supplies its own article, and
the later prose pass treats the space as ordinary whitespace.

- Owner — [matchesLexicalForm](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L988), consumed by the active package preparation path.
- Historical disposition — `candidate`, P3 product narration. `inspected-present` on the [2026-11-15 snapshot][audit-2026-11-15]; the predicted text is static evidence, not an audio measurement.
- Lineage — Variant of [VF-0039](#vf-0039) and [VF-0009](#vf-0009). The finite matcher added the previously reported thin/figure and no-break spaces; U+2002 already belongs to the prose whitespace predicate but remains outside that matcher.
- Next check — Compare the public prepared text and source spans with the already supported spaces and a bare time. Preserve semantic line/paragraph breaks, code, language barriers and guarded number compounds.
- 2026-11-15 reconciliation — `inspected-present`. SAF-12, CFR-09 and U4 cover five separators together. U+2002 remains outside that context-specific matcher. [Case review](audits/2026-11-15-findings-reconciliation.md#vf-0061--u2002-between-article-and-time)
- 2026-11-15 deep validation — `inspected-present`. U+2003 and other horizontal separators expose the same mismatch as U+2002. A one-character repair would leave the family incomplete; unrestricted whitespace would risk crossing semantic separators. Preserve the local gap, source spans, code/language guards and bounded continuation. [Detailed assessment](audits/2026-11-15-deep-findings-validation.md#vf-0061--the-gap-is-wider-than-u2002)

- 2026-11-15 implementation closure — `fixed`, latest check `validated` on the R02-approved patch based on `df0109b0cefb50394e55eed10f2065140de837ec`. Public Spanish preparation preserved one article and exact original ranges for the reported horizontal spaces while retaining neighboring separator behavior. [Execution evidence](../../plans/evidence/four-pass-findings-corrections/execution-ledger.md).
- 2026-11-16 assessment — `inspected-absent` for U+2002 and U+2003 on `079c38ece8687b24859db4f64d4f92bba67bdcee`. Both are accepted by the bounded horizontal separator predicate. [VF-0078](#vf-0078) concerns an omitted mark alongside a space. [Audit][audit-2026-11-16]

## VF-0062

**Direct Web Audio playback allocates two extra full-unit buffers.** The
1× route converts the retained FIFO unit into a new `Float32Array`, allocates
an equally sized `AudioBuffer`, then copies between them. Both are live together
at the copy. For 480,000 frames this is up to 3,840,000 additional bytes of
sample storage versus the specified 1,920,000-byte extra-buffer ceiling.

- Owner — [WebAudioPcmPlaybackBackend.#startDirect](../../../apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts#L195) and [#readRemainingPcm](../../../apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts#L170), reached at the default playback rate. [Buffer authority](../../architecture/adaptive-buffer-authority-v1.md#playback-api-implementation).
- Historical disposition — `candidate`, P3 resource budget. `inspected-present` on the [2026-11-15 snapshot][audit-2026-11-15]. This counts logical allocations during a copy; it does not establish process memory, retention across units, an underrun or a leak.
- Lineage — No matching registry entry found in the inspected playback history. The same allocations predate the backend file split (`fbb39a17`); origin and prior coverage escape are unknown.
- Next check — Observe allocations for one complete max-sized 1× unit. Preserve finite-sample rejection, exact starter offset, original FIFO ownership, and the separate transferred-input worklet path at slow rates.
- 2026-11-15 reconciliation — `inspected-present`. Git shows one direct device copy in the parent of `bc4c1a8` and the new staging array in that commit (#169). #230 moved the backend with the existing allocation. The current test counts Web Audio buffers and misses the staging array. [Case review](audits/2026-11-15-findings-reconciliation.md#vf-0062--second-full-unit-allocation-at-1)
- 2026-11-15 deep validation — `inspected-present` as a logical allocation-contract violation. The non-default v3 allowance does not relax the sole direct active-device-copy invariant. No process-memory, leak, crash or audible effect was measured. [Detailed assessment](audits/2026-11-15-deep-findings-validation.md#vf-0062--allocation-not-a-measured-leak)

- 2026-11-15 implementation closure — `fixed`, latest check `validated` on the R02-approved patch based on `df0109b0cefb50394e55eed10f2065140de837ec`. An unaligned maximum unit at direct 1x used one full device sample store with verified partial-offset and WSOLA controls. RSS was outside this check. [Execution evidence](../../plans/evidence/four-pass-findings-corrections/execution-ledger.md).
- 2026-11-16 assessment — `inspected-absent` for the extra direct-path full-unit arrays on `079c38ece8687b24859db4f64d4f92bba67bdcee`. The owner decodes the remaining PCM directly into the device buffer. [Audit][audit-2026-11-16]

## VF-0063

**Shift+Space scrolling cannot recover Play after unavailable placement.** With focus on reader content, moving upward by a page with Shift+Space can reach a readable passage while Play remains disabled. The key handler filters out Shift before arming the manual-scroll measurement, which is the input that can clear the placement gate.

- Owners — [ReaderPublication key and scroll handlers](../../../apps/desktop/src/reader/ReaderPublication.tsx#L1341), [ActiveVisualLocatorTracker.admitManualScrollMovement](../../../apps/desktop/src/reader/active-visual-locator.ts#L429) and [ProductNarrationCoordinator.updateVisibleLocator](../../../apps/desktop/src/tts/product-narration-coordinator.ts#L909).
- Historical disposition — `candidate`, P2 reader recovery. `inspected-present` for the source path when the focused viewport scrolls and there is no other pending manual intent. Upstream default scrolling supports the trigger. Installed WebView2 delivery and incidence remain unmeasured. [Second-pass assessment][audit-2026-11-15-pass-2]
- Lineage — Variant of [VF-0003](#vf-0003) and [VF-0034](#vf-0034) through a keyboard modifier guard. The historical recovery controls exercise wheel, unmodified PageDown and scrollbar movement. The original reason for the broad modifier filter is unknown.
- Next check — Use a trusted Shift+Space event with upward scroll room and reader focus after an unavailable placement. Check actual movement, Play eligibility and the first prepared locator. Compare unmodified PageUp, a focused button and programmatic scroll.
- 2026-11-15 reconciliation — `inspected-present` conditional on actual host scrolling. CFR-03 (#314) introduced the modifier guard and proved unmodified PageDown. VF-0034 subsequently exercised the scrollbar route. [Case review](audits/2026-11-15-findings-reconciliation.md#vf-0063--shiftspace-after-unavailable-placement)
- 2026-11-15 deep validation — `inspected-present` conditional on real host viewport movement. Upstream Blink also permits Ctrl+Home/End on Windows, while this guard rejects Ctrl. Retain these as explicit same-owner variants, with installed WebView2 input/geometry still unobserved. A Shift+Space-only fix is insufficient for that broader chord coverage. [Detailed assessment](audits/2026-11-15-deep-findings-validation.md#vf-0063--modified-scrolling-keys)

- 2026-11-15 implementation closure — `fixed`, latest check `validated` on the R02-approved patch based on `df0109b0cefb50394e55eed10f2065140de837ec`. Actual trusted Shift+Space, Ctrl+Home and Ctrl+End moved WebView2 after keydown and recovered audible reading at the saved visual placement. Chromium verified the first prepared range. Natural frequency was not measured. [Execution evidence](../../plans/evidence/four-pass-findings-corrections/execution-ledger.md).

## VF-0064

**Implicit paragraphs lose the direction of their XHTML container.** Direct text in a `<div dir="rtl">` inside an otherwise `ltr` chapter becomes a paragraph whose direction comes from the enclosing block collector. The text keeps its RTL context on an inline span. The paragraph retains an LTR base direction, which also supplies the side from which the reader samples its caret.

- Owners — [XhtmlProjector.consumeBodyElement](../../../packages/epub/src/document/xhtml-projector.ts#L947) and [flushPendingParagraph](../../../packages/epub/src/document/xhtml-projector.ts#L1392), through the [semantic paragraph renderer](../../../apps/desktop/src/reader/SemanticDocument.tsx#L546) and [visual locator sample](../../../apps/desktop/src/reader/active-visual-locator.ts#L662). [Direction preservation requirement](../../architecture/decisions/ADR-0008-visual-reader-architecture.md#render-closed-semantic-values-directly-in-the-application-dom).
- Historical disposition — `candidate`, P3 reader presentation. `inspected-present` for the RTL wrapper with direct text in an LTR chapter. The emitted attributes and sampling side follow from source. The resulting caret offset depends on geometry. [Second-pass assessment][audit-2026-11-15-pass-2]
- Lineage — [VF-0036](#vf-0036) concerns locator shifts from an empty inline anchor. This case concerns direction on the projected paragraph. The M003 projection fixture covers inherited chapter direction and the renderer fixture supplies explicit block direction. Origin and earlier escape are unknown.
- Next check — Compare the semantic and rendered paragraph direction for an implicit RTL paragraph and an explicit `p` under the same wrapper. Check neighboring LTR prose, nested overrides and the measured reading-line caret.
- 2026-11-15 reconciliation — `inspected-present`. M003 covers inherited context, SFA-04 covers table and definition boundaries, and VF-0036 covers inert anchors. The `div` context discrepancy predates SFA-04. [Case review](audits/2026-11-15-findings-reconciliation.md#vf-0064--base-direction-of-implicit-paragraphs)
- 2026-11-15 deep validation — `inspected-present` for the semantic block direction. Explicit paragraphs preserve effective direction; implicit ones lose the nearest block override. A specific caret offset or damaged saved position remains unproved. Preserve block IDs and inline overrides when fixing. [Detailed assessment](audits/2026-11-15-deep-findings-validation.md#vf-0064--implicit-block-direction)

- 2026-11-15 implementation closure — `fixed`, latest check `validated` on the R02-approved patch based on `df0109b0cefb50394e55eed10f2065140de837ec`. Implicit and explicit RTL matched in projection, visual caret geometry and actual save/reopen in Chromium, with an inline-only direction control. [Execution evidence](../../plans/evidence/four-pass-findings-corrections/execution-ledger.md).
- 2026-11-16 CI follow-up — A trusted End could land in the empty trailing scroll area. The Chromium fixture now selects an interior passage with Page Down and waits for the actual noninitial and return-to-start saves. [CI evidence](../../plans/evidence/four-pass-findings-corrections/ci-follow-up.md).

- 2026-11-16 assessment — `inspected-absent` for the original implicit RTL paragraph in an LTR container on `079c38ece8687b24859db4f64d4f92bba67bdcee`. The nearest block's direction reaches the paragraph. [VF-0075](#vf-0075) concerns a repeated explicit direction at the render boundary. [Audit][audit-2026-11-16]

## VF-0065

**v14 derivation deletes the raw session before validation.** The official derive command removes the ignored session in a `finally` before checking the loaded evidence and even after an evidence read fails. A recoverable authority mismatch can leave the operator with neither raw input for another attempt nor a validated summary.

- Owners — [batch_result_cli._run_successor](../../../services/tts/benchmarks/batch_result_cli.py#L100), reached by [`benchmark:tts:batch:derive`](../../../package.json#L55), and [derive_v14_summary](../../../services/tts/benchmarks/batch_result.py#L164). [Documented v14 workflow](../../../benchmarks/tts/README.md#L581).
- Historical disposition — `candidate`, P2 maintainer tooling. `inspected-present` for a readable session and a validation rejection after successful directory removal. For v14 hardware evidence, the trigger is prospective. [Second-pass assessment][audit-2026-11-15-pass-2]
- Lineage — Adjacent to [VF-0024](#vf-0024). This case loses inputs before validation in a separate result owner. The [DCR-17 routing assertion](../../../services/tts/tests/test_benchmark_batch_cli.py#L251) explicitly expects the session to be absent at derivation entry. The reason the destructive ordering was retained is unknown.
- Next check — Use a complete synthetic v14 session with a mismatched local schema digest, restore the expected schema, and retry with the same session. Keep successful scoped cleanup before summary emission and preserve the frozen legacy derivation routes.
- 2026-11-15 reconciliation — `inspected-present`. DCR-17 introduced the v13 order in `2e464da` and U11 inherited it in v14. The routing assertion freezes deletion before entry to a substituted deriver. The reviewed decisions contain no requirement to discard retryable input on rejection. [Case review](audits/2026-11-15-findings-reconciliation.md#vf-0065--v14-session-deletion-before-validation)
- 2026-11-15 deep validation — `inspected-present`. Both read failure and authority rejection consume inputs. The documented rule requires deletion before successful output, not before validation. Partial cleanup and output-pipe failure are separate recovery limits; early concurrent derivation is outside the documented sequential flow. [Detailed assessment](audits/2026-11-15-deep-findings-validation.md#vf-0065--validation-before-consumption)

- 2026-11-15 implementation closure — `fixed`, latest check `validated` on the R02-approved patch based on `df0109b0cefb50394e55eed10f2065140de837ec`. The v14 CLI preserved raw input on rejected derivation, supported same-session retry and removed inputs before success. Failed or partial removal produced failure. [Execution evidence](../../plans/evidence/four-pass-findings-corrections/execution-ledger.md).

- 2026-11-17 second-pass assessment — `inspected-absent` on `50f3b9e` for validation-after-delete in the [prospective safety deriver](../../../services/tts/benchmarks/benchmark_safety_cli.py#L19). It validates and encodes before removing the owned data directory and checks absence before success output. [Second audit][audit-2026-11-17-pass-2]

## VF-0066

**A pending refill can resume below one playable minute after a rate change.** After an involuntary underrun with more narration expected, 45 seconds of source audio qualifies for refill at 0.75×. If the stretcher is still preparing when the listener returns to 1.00×, the scheduler keeps its earlier admission and the direct backend can start the next unit with only 45 playable seconds.

- Owners — [AdaptiveBufferScheduler.selectPlaybackRatePercent](../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L642), [refill state](../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1067) and [AdaptivePcmPlayer.synchronize](../../../apps/desktop/src/tts/pcm-playback.ts#L201). [Refill authority](../../architecture/adaptive-buffer-authority-v1.md#low-water-and-exhaustion).
- Historical disposition — `candidate`, P2 playback. `inspected-present` for a cold slower-rate path with exactly this ordering. Device timing and incidence remain unmeasured. [Third-pass assessment][audit-2026-11-15-pass-3]
- Lineage — Adjacent to [VF-0041](#vf-0041) and DCR-24. This case concerns admission before a resumed unit starts. Existing controls cover a fixed-rate underrun and first-start rate preparation with Pause. Historical origin and escape are unknown. [Underrun control](../../../apps/desktop/src/tts/pcm-playback.test.ts#L2137), [rate preparation control](../../../apps/desktop/src/tts/pcm-playback.test.ts#L1625).
- Next check — Deplete a 1.00× run, buffer 45 source seconds, hold slower-rate preparation pending, and return to 1.00×. Observe no device start until the current-rate minute is available. Preserve the complete shorter tail, explicit playback overrides and the rate of a unit already started.
- 2026-11-15 reconciliation — `inspected-present`. U2/3.2 explicitly corrected 45 seconds at 0.75× followed by 1× before the initial allocation. Its change left the post-underrun case with initial playback already committed. [Case review](audits/2026-11-15-findings-reconciliation.md#vf-0066--rate-change-during-pending-automatic-refill)
- 2026-11-15 deep validation — `inspected-present`. Worklet-preparation failure can automatically fall back to 1x through the same stale refill admission, without a second user rate selection. Preserve ordinary unit succession, explicit Resume/Play available, shorter complete tails and the original underrun count. [Detailed assessment](audits/2026-11-15-deep-findings-validation.md#vf-0066--both-explicit-and-automatic-rate-fallback)

- 2026-11-15 implementation closure — `fixed`, latest check `validated` on the R02-approved patch based on `df0109b0cefb50394e55eed10f2065140de837ec`. An actual Chromium Worklet underrun was followed by no premature restart at slower-rate lead, then one restart when the final 1x watermark was met. Deterministic fallback coverage passed. [Execution evidence](../../plans/evidence/four-pass-findings-corrections/execution-ledger.md).
- 2026-11-16 CI follow-up — Worklet registration and the gated synthesis response reached their checkpoints independently. The browser test awaits the fixture callback and still checks 45 seconds of playable audio, buffering and one source start before release. [CI evidence](../../plans/evidence/four-pass-findings-corrections/ci-follow-up.md).

- 2026-11-16 assessment — `inspected-absent` for a changed speed while the refill's stretcher is still pending on `079c38ece8687b24859db4f64d4f92bba67bdcee`. Rate selection recomputes effective lead with automatic refill pending up to successor start. [Audit][audit-2026-11-16]

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for the pending automatic refill rate-change trigger. [Rate selection](../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L643) refreshes effective lead and the [state gate](../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1073) keeps the refill pending until playback admission. [Audit][audit-2026-11-17]

## VF-0067

**The ordinary journey can record a different installer from the one it ran.** If a build replaces the installer at its original path after installation, the ordinary journey hashes the replacement when writing its result. The attached journey observation can then refer to an installer whose installed behavior the journey did not exercise.

- Owners — [runJourney](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1131), [receipt construction](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L330) and [receipt admission](../../../apps/desktop/scripts/windows-release.mjs#L416). [Hash-bound journey decision](../../architecture/decisions/ADR-0050-promote-ordinary-chatterbox-acquisition-and-retire-validation-overlay.md#context).
- Historical disposition — `candidate`, P2 maintainer tooling. `inspected-present` when the replacement precedes receipt construction and the journey otherwise passes. No actual misattributed receipt was observed. [Third-pass assessment][audit-2026-11-15-pass-3]
- Lineage — [VF-0015](#vf-0015) and [VF-0023](#vf-0023) cover schema checks after receipt generation. The lifecycle runner separately compares its initial and final installer identity. Historical origin and escape of the ordinary producer gap are unknown. [Lifecycle comparison](../../../scripts/test-windows-package-lifecycle.ps1#L433).
- Next check — Use disposable files and controlled installer completion. Replace the source at the same path after its launch and assert that a successful receipt can identify only the bytes used for installation. Preserve the separate installed-executable identity and failure cleanup.
- 2026-11-15 reconciliation — `inspected-present`. The producer's late hash dates to #205. CFR-15/CFR-23 protect the consumer and the separate lifecycle runner compares pre/post identities. The proposal binds the installer actually launched by the ordinary journey. [Case review](audits/2026-11-15-findings-reconciliation.md#vf-0067--installer-bytes-attributed-to-the-ordinary-journey)
- 2026-11-15 deep validation — `inspected-present` for concurrent source-installer replacement. Consumer hash equality cannot prove which bytes were launched. Distinguish the installed executable from the build executable; no misattributed published release was observed. [Detailed assessment](audits/2026-11-15-deep-findings-validation.md#vf-0067--the-exercised-installer-identity)

- 2026-11-15 implementation closure — `fixed`, latest check `validated` on the R02-approved patch based on `df0109b0cefb50394e55eed10f2065140de837ec`. Disposable fixture revisions, including a restored original, left the exercised run-owned installer bytes stable. The unsigned installed journey verified startup, containment, uninstall and profile restoration. [Execution evidence](../../plans/evidence/four-pass-findings-corrections/execution-ledger.md).

- 2026-11-17 second-pass assessment — `inspected-absent` on `50f3b9e` for replacement of the source installer in the [ordinary runner](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1220), which hashes and launches its owned copy. The standalone lifecycle producer is a separate variant in [VF-0101](#vf-0101). [Second audit][audit-2026-11-17-pass-2]

## VF-0068

**Attaching receipts can change the build authority of unchanged artifacts.** With valid receipts and an unchanged installer and build executable, an update to the checkout's Piper manifest and matching distribution copy can change the Piper digest on package evidence. The installed resources still come from the original installer.

- Owners — [PowerShell attachment branch](../../../scripts/build-windows-release.ps1#L152), [createPackageEvidence](../../../apps/desktop/scripts/windows-release.mjs#L593) and [writePackageEvidence](../../../apps/desktop/scripts/windows-release.mjs#L764). The [historical desktop layout runner](../../../apps/desktop/scripts/tts-adapter-layout-host.mjs#L1450) also reads this digest as the identity of the packaged resource.
- Historical disposition — `candidate`, P2 maintainer tooling. `inspected-present` when current release inputs pass their configuration checks and differ from the build record. Existing package evidence was not regenerated or exercised. [Third-pass assessment][audit-2026-11-15-pass-3]
- Lineage — Adjacent to [VF-0019](#vf-0019). CFR-19's attachment controls cover scan preservation and live artifact drift. This case keeps the same artifacts and changes the build authority fields. Historical origin is unknown. [Attachment controls](../../../apps/desktop/scripts/windows-release.node-test.mjs#L1338).
- Next check — Hold the built and installed bytes and both receipts fixed while changing a current authority digest. Require the attachment to preserve the original authority or refuse the write. Check unchanged-input attachment, new builds and existing signature, scan and receipt checks.
- 2026-11-15 reconciliation — `inspected-present`. #205 reused the evidence builder for attachment. CFR-19 addresses signature and scan observations. The Piper field represents the packaged manifest digest, which the historical verifier compares against packaged bytes. [Case review](audits/2026-11-15-findings-reconciliation.md#vf-0068--build-authority-during-receipt-attachment)
- 2026-11-15 deep validation — `inspected-present`. Preserving previous JSON is safe only with trustworthy build provenance. Authority inputs can already drift between bundling and the first baseline evidence write. The distinct fresh-build artifact-observation case is [VF-0072](#vf-0072). [Detailed assessment](audits/2026-11-15-deep-findings-validation.md#vf-0068--attachment-cannot-establish-build-provenance)

- 2026-11-15 implementation closure — `fixed`, latest check `validated` on the R02-approved patch based on `df0109b0cefb50394e55eed10f2065140de837ec`. A changed authority file in the disposable release inputs was rejected without replacing existing evidence or checksum. Restoring the input permitted the same attachment. The actual unsigned handoff passed. [Execution evidence](../../plans/evidence/four-pass-findings-corrections/execution-ledger.md).

## VF-0069

**v14 can pass scheduling after playback simulation fails.** A sequence of complete two-unit batches can overflow the replay buffer. The official runner records `playback-invalid` and fills the playback measurements with zeros. Those zeros satisfy the summary's buffering and retention predicates, which lets the sustainability conclusion pass if the other checks do.

- Owners — [simulate_bounded_playback](../../../services/tts/benchmarks/batch_playback.py#L92), [batch_official._playback_raw](../../../services/tts/benchmarks/batch_official.py#L676), [batch_result._derive_summary](../../../services/tts/benchmarks/batch_result.py#L403) and the [inherited conclusion validator](../../../services/tts/benchmarks/v4_authority.py#L613).
- Historical disposition — `candidate`, P2 maintainer tooling. `inspected-present` for a completed matrix whose replay is rejected and whose remaining scheduling predicates pass. No v14 run or sustainability claim was reproduced. [Fourth-pass assessment][audit-2026-11-15-pass-4]
- Lineage — Adjacent to [VF-0065](#vf-0065) in the current derivation command. This defect concerns an emitted conclusion. The simulator's existing limit check expects rejection for over-capacity arrivals. Historical origin is unknown. [Simulator assertion](../../../services/tts/tests/test_benchmark_batch_execution.py#L236), [backpressure and scheduling authority](../../../benchmarks/tts/profile-v4.json#L254).
- Next check — Carry a completed otherwise qualifying matrix through v14 derivation with consecutive pairs whose unchecked arrival would exceed capacity. Require a permissible bounded replay or a failed scheduling conclusion. Preserve the observed invalid-playback code and verify a valid replay and a real underrun.
- 2026-11-15 reconciliation — `inspected-present`. The omission dates to the official v4 matrix. DCR-17 and U11 added separate cleanup and cancellation requirements. The current schema and validator accept the all-zero failure placeholder for the otherwise qualifying sequence. [Case review](audits/2026-11-15-findings-reconciliation.md#vf-0069--scheduling-pass-after-replay-rejection)
- 2026-11-15 deep validation — `inspected-present`; scope expanded to both standard viability and sustainability when the remaining gates pass. The producer's ordinary `playback-incomplete` path already carries failed attempts and does not provide the same natural false-PASS example. Demo usefulness stays not-evaluated. [Detailed assessment](audits/2026-11-15-deep-findings-validation.md#vf-0069--rejected-playback-cannot-prove-a-passing-gate)

- 2026-11-15 implementation closure — `fixed`, latest check `validated` on the R02-approved patch based on `df0109b0cefb50394e55eed10f2065140de837ec`. The producer exercised overflow with model-free timing. Invalid playback kept bounded retention and scheduling unproved, and a contradictory direct summary was rejected. [Execution evidence](../../plans/evidence/four-pass-findings-corrections/execution-ledger.md).

## VF-0070

**v14 CPU admission accepts a memory signal unrelated to the failed batch.** A complete full-GPU summary can pair an unrelated measured failure with a qualifying memory code observed at the final sample. The admission check accepts the two aggregate facts without evidence that the first attempt of a two-unit batch hit the memory stop.

- Owners — [monitor final sample](../../../services/tts/benchmarks/batch_official.py#L434), [failed-attempt aggregation](../../../services/tts/benchmarks/batch_result.py#L293) and [load_v14_cpu_admission](../../../services/tts/benchmarks/v14_authority.py#L279). [First-attempt requirement](../../../benchmarks/tts/profile-v4.json#L267).
- Historical disposition — `candidate`, P2 maintainer tooling. `inspected-present` for an otherwise valid committed v14 GPU summary satisfying the aggregate predicates. Current CPU admission remains prospective. [Fourth-pass assessment][audit-2026-11-15-pass-4]
- Lineage — U11/2.3 protects version and committed input identity. ADD-02 correctly ends early/mid-run stops before session publication. The admission fixture supplies a memory code and a positive failure count independently, so it cannot distinguish a stop on the qualifying attempt. Historical origin is unknown. [U11 decision](../../architecture/decisions/ADR-0072-versioned-batch-cancellation-proof-and-safety.md#decision), [existing admission fixture](../../../services/tts/tests/test_benchmark_v14_authority.py#L136).
- Next check — Distinguish a memory stop attributed to the exact batch-two first attempt from an unrelated attempt failure plus a final-sample reserve breach. Keep the latter nonqualifying and retain version, commit and verified cleanup guards.
- 2026-11-15 reconciliation — `inspected-present`. v14 inherits the independent aggregate checks from its predecessors. An active safety stop currently exits before a derivable session. A positive CPU admission path needs a versioned proof of attributable stop and cleanup. [Case review](audits/2026-11-15-findings-reconciliation.md#vf-0070--batch-specific-cpu-admission)
- 2026-11-15 deep validation — `inspected-present`. Traced an unrelated measured failure through failed-row completion, valid independent cancellation trials, final-only reserve breach and exact committed-summary admission. Historical placeholders establish matrix structure, not dispatched attempts, and are not a new defect by themselves. [Detailed assessment](audits/2026-11-15-deep-findings-validation.md#vf-0070--row-counts-are-not-causal-stop-proof)

- 2026-11-15 implementation closure — `fixed`, latest check `validated` on the R02-approved patch based on `df0109b0cefb50394e55eed10f2065140de837ec`. The v14 admission surface rejects aggregate memory evidence without attributable causal proof. Acceptance covers this fail-closed path only. Positive successor admission is deferred. [Execution evidence](../../plans/evidence/four-pass-findings-corrections/execution-ledger.md).

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for positive v14 CPU admission with unrelated memory evidence. The [current authority](../../../services/tts/benchmarks/v14_authority.py#L327) retains the deliberate fail-closed rule. [Audit][audit-2026-11-17]

## VF-0071

**v14 derivation can use cold-load observations from another run.** The runner writes cold-load times to a separate file. Given a session with valid raw evidence and the five well-shaped load observations of another run, derivation combines them and can change the cold-load p95 and the standard conclusion.

- Owners — [batch_cli._run](../../../services/tts/benchmarks/batch_cli.py#L326), [batch_result_cli._run_successor](../../../services/tts/benchmarks/batch_result_cli.py#L100) and [batch_result._load_observations](../../../services/tts/benchmarks/batch_result.py#L74).
- Historical candidate assessment — `candidate`, P3 evidence integrity. `inspected-present` for mixed local inputs. The normal writer emits the two files from one execution. No naturally mixed session was observed. [Fourth-pass assessment][audit-2026-11-15-pass-4]
- Lineage — Related to [VF-0065](#vf-0065) at the same input boundary. This case can derive an incorrect summary from two individually readable inputs. Existing [CLI routing assertions](../../../services/tts/tests/test_benchmark_batch_cli.py#L228) check version and cleanup with a substituted deriver. Historical origin is unknown.
- Next check — Exchange the cold-load files of two complete disposable sessions with different load times. Check that only the original paired observations can contribute to a report. Preserve legacy read semantics and retryable current inputs.
- 2026-11-15 reconciliation — `inspected-present` for externally mixed inputs. The normal exclusive session writer emits a matched pair. v5 puts load observations in its own raw record. The short-segment route still validates the two files separately. [Case review](audits/2026-11-15-findings-reconciliation.md#vf-0071--cold-load-session-binding)
- 2026-11-15 deep validation — Disposition changed from `candidate` to `not-confirmed` as an ordinary workflow defect; latest check `inspected-inconclusive` for actionable ordinary-flow failure. The exclusive ID/version directory, one execution and post-write receipt produce a matched pair. External substitution remains source-supported conditional hardening, with no spontaneous mixing route found. The normal-flow input-loss defect is VF-0065. [Detailed assessment](audits/2026-11-15-deep-findings-validation.md#vf-0071--revise-the-actionable-classification)

- 2026-11-15 implementation closure — `not-confirmed`. Excluded from this plan. The ordinary writer defect remains not confirmed. Externally mixed local inputs remain a conditional observation. [Execution evidence](../../plans/evidence/four-pass-findings-corrections/execution-ledger.md).

## VF-0072

**Fresh package evidence can attribute signature and scan observations to replaced artifacts.** If another build replaces the installer after PowerShell reads its signature, optionally scans it and writes its checksum, but before Node hashes it, the evidence can identify the replacement while retaining the earlier observations. The checksum sidecar can still refer to the earlier installer.

- Owners — [build finalization](../../../scripts/build-windows-release.ps1#L223), [initial evidence identity](../../../apps/desktop/scripts/windows-release.mjs#L551) and [attachment-only observation binding](../../../apps/desktop/scripts/windows-release.mjs#L738).
- Historical disposition — `candidate`, P2 maintainer evidence integrity. `inspected-present` at `997cddff2a8658440324a87e44178a98018dea77` on 2026-11-15 for concurrent replacement during this interval. No signing incident, public release or natural occurrence was observed.
- Lineage — Distinct fresh-build caller variant of [VF-0019](#vf-0019)/CFR-19. Related to [VF-0067](#vf-0067) for executed installer identity and [VF-0068](#vf-0068) for build-input authority. Attachment's observed-hash checks do not run for this caller, while the final rehash only compares the replacement with itself.
- Next check — Use disposable artifacts and controlled signature/scan results. Replace the installer after the PowerShell observations and before Node's first hash, then require rejection or one identity across observed bytes, checksum and JSON. Keep signed/unsigned, optional scan, unchanged input, attach and later drift controls.
- Correction boundary — Bind observations and publication to a run-owned immutable artifact snapshot, or fail before corresponding success on drift. Preserve independent installed/build identities and containment. Existing attachment tests do not establish this earlier boundary.
- Evidence — [Deep validation](audits/2026-11-15-deep-findings-validation.md#vf-0072--build-observations-can-refer-to-replaced-bytes). Source inspection only, no executed reproduction.

- 2026-11-15 implementation closure — `fixed`, latest check `validated` on the R02-approved patch based on `df0109b0cefb50394e55eed10f2065140de837ec`. The Windows PowerShell fixture verified that finalization holds observed installer bytes stable during evidence handoff. The actual unsigned build validated the PowerShell-to-Node evidence and checksum; signed and Defender paths remain outside this result. [Execution evidence](../../plans/evidence/four-pass-findings-corrections/execution-ledger.md).
- 2026-11-16 assessment — `inspected-absent` for ordinary artifact replacement between the locked hash and finalization on `079c38ece8687b24859db4f64d4f92bba67bdcee`. Both files are held with read sharing and the evidence writer checks the hashes before publication. [Audit][audit-2026-11-16]

## VF-0073

**A measured privacy detection can yield a passing v14 privacy audit.** An isolated measured worker detects forbidden diagnostic content and discards it, returning the fixed code `privacy`. Batch execution converts the resulting adapter exception to `generation-failed`; the summary then declares `audits.privacy = True` unconditionally. With valid independent cancellation trials and cleanup, an otherwise failed result can retain that false audit claim.

- Owners — [isolated detection](../../../services/tts/benchmarks/isolation.py#L228), [measured error conversion](../../../services/tts/benchmarks/batch_execution.py#L237), [summary audit](../../../services/tts/benchmarks/batch_result.py#L348) and [v14 validation/admission](../../../services/tts/benchmarks/v14_authority.py#L263).
- Historical disposition — `candidate`, P2 maintainer evidence integrity. `inspected-present` at `997cddff2a8658440324a87e44178a98018dea77` on 2026-11-15 for an otherwise derivable measured-call failure. This establishes a false audit field, not a demonstrated disclosure or global viability PASS.
- Lineage — Variant of unimported [H4](../../plans/completed/validated-audit-follow-up.md#L238), which corrected unconditional privacy/cleanup success in v8-v11 screen builders. H3 corrected diagnostic detection; the current batch controller and summary are different owners. Related to [VF-0070](#vf-0070), whose CPU admission requires this privacy flag.
- Next check — A harmless isolated worker prints a synthetic canary only during a measured batch. Verify the fixed privacy failure survives, captured text remains discarded, cleanup is verified, the summary cannot approve privacy, a contradictory direct summary is rejected and CPU admission remains closed. Keep generic generation failures and clean diagnostics as separate controls.
- Correction boundary — Preserve the closed adapter failure code at the measured boundary and derive/validate failure or unproved privacy, or stop without a derivable result. Do not turn private content back into logs, relax cleanup, or reinterpret frozen historical versions.
- Evidence — [Deep validation](audits/2026-11-15-deep-findings-validation.md#vf-0073--measured-privacy-detection-is-reported-as-a-passing-audit). Source inspection only, no executed reproduction.

- 2026-11-15 implementation closure — `fixed`, latest check `validated` on the R02-approved patch based on `df0109b0cefb50394e55eed10f2065140de837ec`. A spawned synthetic measured worker exercised closed privacy failure propagation, redacted diagnostics and verified process reap. The final and directly supplied summaries could not assert a passing privacy audit. [Execution evidence](../../plans/evidence/four-pass-findings-corrections/execution-ledger.md).

- 2026-11-17 second-pass assessment — `inspected-absent` on `50f3b9e` for a detected privacy failure during measured v14 synthesis. The [controller](../../../services/tts/benchmarks/batch_execution.py#L252) preserves the code for measured requests, and the [validator](../../../services/tts/benchmarks/v14_authority.py#L303) rejects a contradicting audit. Warm-up uses a separate branch tracked in [VF-0105](#vf-0105). [Second audit][audit-2026-11-17-pass-2]

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
- 2026-11-16 third-pass assessment — `inspected-absent` for the missing helper at the Node owner. The [spawn check](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L962) records no-spawn and the [finalizer](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1490) checks absence before restore. [VF-0085](#vf-0085) concerns cleanup after successful installation in another runner. [Third pass][audit-2026-11-16-pass-3]

- 2026-11-17 third-pass assessment — `inspected-absent` on `50f3b9e` for the original fresh-JSON artifact drift trigger. [PowerShell](../../../scripts/build-windows-release.ps1#L291) supplies locked hashes and [the writer](../../../apps/desktop/scripts/windows-release.mjs#L801) rechecks the pair before replacing JSON. [VF-0107](#vf-0107) concerns a later checksum failure after that guarded write. [Third audit][audit-2026-11-17-pass-3]

## VF-0074

**A passive viewport sample can overwrite a heard checkpoint after Stop.** Stop mid-segment after establishing an exact heard checkpoint. If a delayed layout or scroll observation later yields a different canonical visual locator without a measured user gesture, the passive-save path can persist it. Reopening can then skip unheard text or replay from an earlier passage.

- Owners — [position save admission](../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L225), through [the viewport callback](../../../apps/desktop/src/reader/ReaderPublication.tsx#L563) and [App](../../../apps/desktop/src/App.tsx#L717). [Heard-position contract](../../architecture/synchronization-authority-v1.md#heard-progress).
- Lineage — [VF-0029](#vf-0029) concerns restored progress and the dedicated reflow path. [NLC-02](../../plans/completed/narration-logic-corrections.md#user-visible-outcome) returns authority to genuine movement after completion. The [save regression](../../../apps/desktop/src/persistence/reader-position-save-coordinator.test.ts#L563) exercises the dedicated reflow guard and calls the unmarked passive API as its movement control.
- Disposition — `candidate`, P2 product persistence. `inspected-present` on the [2026-11-16 snapshot][audit-2026-11-16] given a different unmarked visual sample. High confidence in save admission under that ordering. Host delivery and incidence are unmeasured. Origin unknown.
- Next check — Use the mounted reader through audible start, Stop, a layout-triggered sample, save and same-EPUB reopen. Preserve the exact checkpoint through that sample, then verify that measured navigation can save a newer locator. Keep the no-heard and ordinary visual-reading controls.

- 2026-11-16 reconciliation — `inspected-present` at passive save admission for a distinct unmarked canonical sample after Stop. U3/5.1 still protects the original unchanged-geometry follow trigger. Ordinary delivery of the new ordering remains unobserved. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — Product proposition is now `inspected-inconclusive`; the sink accepts the stipulated distinct unmarked sample, but current tracker/reflow protections leave its mounted post-Stop delivery unproved. Keep P2 as conditional impact. Do not count a reproduced loss of reading progress. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — Inconclusive after bounded mounted Stop, resize, same-byte reopen and a real keyboard successor. No failing tracker → App → persistence delivery was established, so persistence was not changed. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

- 2026-11-16 authorized follow-up — The new mounted late-image case establishes the previously missing tracker → App → persistence delivery: pre-Stop offset 607 becomes 627 and that replacement survives same-byte reopen. The owner now rejects unmarked passive writes while heard protection remains active, and validated measured movement releases protection even when its first locator duplicates the checkpoint. Current desktop/browser controls pass; final acceptance is governed by the [follow-up ledger](../../plans/evidence/reader-stop-quality-follow-up/execution-ledger.md) and linked independent report. Earlier inconclusive assessments remain historical. Prior tests exercised unchanged geometry and mislabeled an unmarked save as manual; the precise human omission is unknown.

- 2026-11-16 closeout — `fixed`, latest check `validated` on `cafb59e`. R02 approved the mounted Stop, automatic layout and same-byte reopen regression together with the deliberate movement controls. [Approved closeout](../../plans/evidence/reader-stop-quality-follow-up/closeout-r02.md)

- 2026-11-16 PR #325 follow-up — CI exposed six older coordinator tests that labeled unmarked passive input as manual. The test callers now assert automatic rejection before supplying measured intent, preserving original storage/restore/next-Play assertions. Production VF-0074 remains unchanged. The previous focused selection omitted this coordinator file; review omission rationale is unknown. [CI evidence and independent assessment](../../plans/evidence/reader-stop-quality-follow-up/ci-follow-up.md).

- 2026-11-16 PR #325 browser follow-up — Full Windows CI exposed BNC-01's browser-side use of automatic `scrollIntoView()` as manual movement. Replacing that test input with a real wheel gesture preserves all saved-position and explicit-Play assertions. Local RED/GREEN and both mounted VF-0074 controls cover the correction; the production guard remains unchanged. [Browser follow-up and independent assessment](../../plans/evidence/reader-stop-quality-follow-up/ci-browser-follow-up.md).

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for the original Stop and delayed unmarked sample trigger. [Save admission](../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L225) rejects automatic samples while the heard checkpoint owns persistence. Validated manual movement, including an equal sample, releases protection. [Audit][audit-2026-11-17]

## VF-0075

**A nested explicit automatic direction is lost in the rendered reader.** In a chapter with `dir="auto"` on the XHTML root and an explicit `dir="auto"` on a later paragraph, an initial LTR paragraph can set the chapter's direction. The later RTL paragraph inherits that direction in the rendered DOM because its own attribute was dropped. Its text alignment and the reading-line caret's sampling side can differ from the source.

- Owners — [XHTML direction context](../../../packages/epub/src/document/xhtml-projector.ts#L334) and [renderer attribute selection](../../../apps/desktop/src/reader/SemanticDocument.tsx#L100), applied by the [paragraph renderer](../../../apps/desktop/src/reader/SemanticDocument.tsx#L546). [Reader preservation policy](../../architecture/decisions/ADR-0008-visual-reader-architecture.md#render-closed-semantic-values-directly-in-the-application-dom), [HTML directionality](https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute).
- Lineage — Variant of [VF-0064](#vf-0064) with an explicit nested attribute and a renderer decision. The [renderer direction test](../../../apps/desktop/src/reader/SemanticDocument.test.tsx#L407) covers Auto under a different inherited direction. Origin unknown.
- Disposition — `candidate`, P3 product rendering. `inspected-present` on the [2026-11-16 snapshot][audit-2026-11-16] for the missing attribute and resulting direction. A specific caret offset or saved-position failure remains unverified.
- Next check — Run public opening through computed direction for the explicit Auto paragraph and a sibling that inherits Auto. Check the actual caret side and preserve mirrored LTR/RTL, inline overrides and source offsets.

- 2026-11-16 reconciliation — `inspected-present` for the same-value nested explicit declaration. VF-0064 U3 considered the area, and its retained fixed-direction fixtures do not discriminate explicit Auto from inherited Auto. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — `inspected-present` for explicit nested Auto direction. Fixed-direction equality remains valid, while effective Auto lacks declaration provenance. No saved-offset failure is established. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — Controlled public reproduction and computed browser direction/reopen checks support the Auto-declaration-scope correction. Independent R01 additionally reproduced separate direction resolution under flattened containers. The revised reader shares a native result per scope with bounded, yielding and cancellable scanning; mixed unknown admission, neutral/late-strong text, exact logical/narration ranges, progressive replacement and same-byte reopen are checked. Inherited sibling direction, fixed RTL and VF-0064 remain controls. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for the nested explicit Auto classification trigger. [Projection and scope allocation](../../../packages/epub/src/document/xhtml-projector.ts#L802) distinguish inherited and explicitly declared Auto. The [renderer](../../../apps/desktop/src/reader/SemanticDocument.tsx#L128) uses each scope's resolved direction. Related visual-order and capacity cases are [VF-0096](#vf-0096) and [VF-0097](#vf-0097). [Audit][audit-2026-11-17]

## VF-0076

**The ordinary journey accepts Installed before download cleanup settles.** Successful promotion exposes Installed while the staging owner is still active. The installed release journey drops the Download result and accepts the first Installed snapshot, including during reacquisition. Later process teardown and uninstall can succeed without a successful Download acknowledgement, leaving the receipt able to report a passed reacquisition.

- Owners — [ordinary reinstall](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1407), reaching [receipt outcome](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L366). Native [promotion](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1591) exposes the state before [owned staging cleanup and acknowledgement](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2381).
- Lineage — Variant of [VF-0058](#vf-0058) at the same native commit boundary, with a different consumer and no Cancel prerequisite. [VF-0059](#vf-0059) concerns later smoke teardown and data restoration. The [native post-commit case](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs#L1571) exercises a held worker. Origin of the runner omission unknown.
- Disposition — `candidate`, P2 maintainer release evidence. `inspected-present` on the [2026-11-16 snapshot][audit-2026-11-16] for provisional admission and potential false receipt if later gates succeed. No current package journey or cleanup failure was observed.
- Next check — Hold successful promotion at the cleanup boundary, then settle Download with either success or a cleanup error. Require a successful terminal result before accepting the receipt, with staging absence and verified package state. Preserve available Cancel and owned process teardown.
- 2026-11-16 second-pass assessment — `inspected-present` at the existing success/reinstall snapshot gate. The cancellation stage has a separate filesystem evidence problem, [VF-0081](#vf-0081). [Second pass][audit-2026-11-16-pass-2]

- 2026-11-16 reconciliation — `inspected-present` for both retry and reinstall. `d9b2ea051d1caa5041bec5cce912bb535ae9e5af` changed the native ordering on which snapshot-only admission depended. B06/B07, VF-0058 and VF-0059 closed distinct handoffs. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — `inspected-present` in both successful acquisition phases. Download acknowledgement is discarded; later cleanup or teardown cannot recover the missed terminal error. The consequence is conditional false evidence, not a demonstrated corrupt install. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — Controlled ordinary journey reproductions demonstrated success from Installed before terminal Download acknowledgement in retry/reinstall. Per-attempt terminal ownership now gates receipts; failure cleanup/restoration and the next successful acquisition are checked. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for ordinary retry and reinstall crediting provisional Installed. Both await [terminal acquisition](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L683) before using the result. [Audit][audit-2026-11-17]

## VF-0077

**v14 reports restored sleep settings without observing restoration.** The official CLI accepts an operator assertion that sleep was disabled for preflight. Its raw journal always records restored sleep settings and the summary accepts this field as cleanup evidence. An otherwise qualifying result can pass cleanup while a temporarily changed sleep setting remains in place.

- Owners — [v14 preflight input](../../../services/tts/benchmarks/batch_cli.py#L235), [official journal](../../../services/tts/benchmarks/batch_official.py#L1188) and [summary gate](../../../services/tts/benchmarks/batch_result.py#L363). [Inherited cleanup rule](../../../benchmarks/tts/profile-v4.json#L251).
- Lineage — [VF-0065](#vf-0065) covers raw journal deletion and [VF-0073](#vf-0073) covers the privacy audit. [Historical measurements](../../plans/completed/M006-002-qwen-short-segment-batch-feasibility.md#final-validation-results) recorded sleep restoration separately. Earlier escape and origin unknown.
- Disposition — `candidate`, P3 maintainer benchmark evidence. `inspected-present` on the [2026-11-16 snapshot][audit-2026-11-16] for the unsupported assertion in the documented official v14 flow. No power settings or official v14 hardware results were inspected on a host.
- Next check — Separate preflight confirmation from cleanup proof. Compare a witnessed restoration with a missing or failed restoration at the journal and summary boundary, preserving measured cleanup, raw-session deletion and historical authorities.

- 2026-11-16 reconciliation — `inspected-present` for unconditional restoration evidence inherited from v4 (`32e18fb7`). Earlier operator restoration and v14 runtime/raw/privacy corrections establish separate facts. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — `inspected-present` as an unsupported positive cleanup assertion. The runner does not itself alter power settings, and zero worker resources do not prove operator restoration. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — Decision-blocked: a successor must bind original and final power-policy observations to the same run. Existing closed input/frozen cleanup evidence cannot prove the operator restored the prior setting. No success implementation or historical record was changed. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

- 2026-11-16 authorized successor execution — `reproduced`; Original unconditional restoration reproduced before edits. The authorized safety-v1 successor binds original/admitted/restored native observations, one-use admission, exact inputs and private cleanup. Failed/incomplete runs can restore without a derivable result; frozen historical bytes are preserved. Prior worker/resource cleanup coverage lacked power-state equality; the earlier review cause remains unknown. Current evidence and final R04 acceptance are in [case results][fsf-execution].

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for unconditional sleep restoration as official v14 acceptance. [Raw capture](../../../services/tts/benchmarks/batch_official.py#L1188) records false and [finalization](../../../services/tts/benchmarks/benchmark_safety.py#L335) compares original and restored native observations before derivation. [Audit][audit-2026-11-17]

## VF-0078

**An omitted formatting mark before a Spanish time duplicates the article.** In synthetic Spanish prose `Las \u200B14:30.`, the article matcher sees a space followed by U+200B and misses the combined form. The bare time matcher skips the mark in its lookbehind and adds its own article. Formatting omission then leaves `Las las catorce treinta.` in prepared text.

- Owners — [combined matcher](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1004), [logical lookbehind](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L484), [bare time](../../../packages/epub/src/narration/bilingual-spanish-normalization.ts#L139) and [formatting omission](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L2010).
- Lineage — Variant of [VF-0061](#vf-0061) at a different input class. That fix covers horizontal separators. [VF-0052](#vf-0052) involves packing a long initial run of omitted marks. The earlier [article matrix](../../../packages/epub/src/integration/narration-preparation-matrix.test.ts#L44) uses spacers on their own. Origin unknown.
- Disposition — `candidate`, P3 product preparation. `inspected-present` on the [2026-11-16 snapshot][audit-2026-11-16] for short, same-language, non-code input within ordinary lookahead. Static inference at the prepared-text boundary.
- Next check — Compare public Piper and Chatterbox preparation with and without the mark. Assert one article and exact range endpoints. Keep language and code barriers, semantic breaks, bare times, numeric compounds and deterministic continuation.

- 2026-11-16 reconciliation — `inspected-present` at prepared text. The earlier space fixes cover real spaces alone. BNC-02 addresses lookaround and leaves this internal lexical match outside its coverage. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — `inspected-present` for short prose article/mark/time input in both public profiles. Additional approved omitted marks in the same gap share this ID; source ranges and expansion protection must be preserved. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — Public Piper/Chatterbox regressions reproduced duplicate articles across admitted omitted marks. The bounded matcher and typed omissions now preserve one article, exact mapping and continuation; plain forms and limits remain controls. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for the short omitted-mark Spanish article/time trigger. The [combined matcher](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1016) accepts the omitted mark within bounded same-language prose context. [Audit][audit-2026-11-17]

## VF-0079

**Reordering custom NSIS language keys blocks release validation.** Reversing the two entries of `customLanguageFiles` with identical keys and values changes serialized key order. The release configuration check rejects the mapping before the build starts.

- Owners — [closed release validation](../../../apps/desktop/scripts/windows-release.mjs#L326), called [before the Windows build](../../../scripts/build-windows-release.ps1#L202). Tauri consumes the property as a [language-to-path map](https://github.com/tauri-apps/tauri/blob/tauri-utils-v2.9.3/crates/tauri-utils/src/config.rs#L838-L844).
- Lineage — Variant of [VF-0015](#vf-0015) for configuration validation. The [receipt test](../../../apps/desktop/scripts/windows-release.node-test.mjs#L1359) covers other serialized objects. Origin unknown.
- Disposition — `candidate`, P3 maintainer build reliability. `inspected-present` on the [2026-11-16 snapshot][audit-2026-11-16] when that JSON object is reordered. The ordered `languages` array and build-authority digest are independent checks.
- Next check — Verify the same configuration under both object orders. Require rejection for an altered file mapping, additional or missing keys, an incorrect language array, and stale byte-bound build authority.

- 2026-11-16 reconciliation — `inspected-present` in preflight. The comparator entered main in `b7f75fe4f9ec59ac5e949cb6986d07755a828834`. VF-0015 and U12/4.4 concern receipt records with different consumers. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — `inspected-present` for equivalent map reordering at fresh preflight. Ordered fallback languages and byte-bound attachment identity remain separate correct constraints. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — Reordered NSIS language-map keys reproduced false rejection. Exact unordered membership now passes while missing/extra/changed entries and reordered language arrays fail. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

## VF-0080

**Ordinary Chatterbox installation exposes actions while cleanup owns the download.** After promotion, native Installed can be observed before Download settles. Closing and reopening Settings drops local pending state. Activate and Remove ignore the client-owned download flag. Remove rejects before Stop and gives misleading Stop guidance. A compatible ready book can accept the cached Installed result for activation and proceed to narration containment and profile persistence during cleanup.

- Owners — [installed controls](../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L480), [profile selection and removal admission](../../../apps/desktop/src/settings/narration-settings-actions.ts#L101) and [cached Select](../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L277). [Native commit](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1591).
- Lineage — Variant of [U8 cases 2.1, 2.2 and ADD-01](../../plans/completed/five-pass-audit-revalidation-and-corrections.md#u8-optional-package-action-ownership--21-22-add-01). Earlier controls cover preflight remount and pending Cancel. [VF-0058](#vf-0058) concerns the completion event after Cancel. [VF-0076](#vf-0076) consumes the commit state in the release runner. First introduction unknown.
- Disposition — `candidate`, P2 product Settings, `inspected-present` on the [second-pass snapshot][audit-2026-11-16-pass-2]. The Remove outcome is determined by its busy guard. Activation requires an eligible profile, a current publication and successful remaining selection steps. Native integrity and removal containment retain their own guards.
- Next check — Keep ordinary Download unsettled after promotion, remount Settings and exercise both activation entry points and Remove. Ensure action admission during and after success/cleanup failure agrees with the owning download. Keep pending Cancel and busy removal before Stop.

- 2026-11-16 reconciliation — `inspected-present` after ordinary Download commit and Settings remount. B06/B07, U8 and VF-0058 establish native linearization, cleanup recovery and the separate late-Cancel handoff. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — Narrowed to P3, `inspected-present` for an enabled busy Remove and incorrect Stop-and-retry feedback. The earlier P2 activation claim is `inspected-inconclusive`: commit already establishes verified installed bytes, native discovery verifies them independently, and no inspected rule prohibits this explicit eligible activation during staging cleanup. Busy Remove remains protected before Stop/deletion. Do not mandate activation blocking without a violating contract or concrete adverse outcome. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — Controlled Settings remount reproduced Remove availability during owned Download cleanup. Persistent ownership now disables Remove with truthful busy guidance through both terminal outcomes; explicit eligible activation and the next Remove remain supported. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for the narrowed Remove presentation trigger while ordinary Download owns cleanup. [Installed and failed Settings actions](../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L480) consult client download ownership across remount. [Audit][audit-2026-11-17]

## VF-0081

**Cancellation evidence treats a failed staging lookup as absence.** After Cancel, the ordinary journey only rethrows its own staging-retained marker. Any error from the lookup satisfies this step. If retry and later gates succeed, the runner can issue `downloadCancellationCleanupPassed: true` without observing absence.

- Owners — [cancellation lookup](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1320) and [receipt creation](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L332). The same runner's [absence policy](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L679) uses `lstat` and only accepts `ENOENT`.
- Lineage — Variant of the release-evidence gap in [VF-0076](#vf-0076), with a different trigger and proof step before retry. [VF-0059](#vf-0059) concerns teardown and data restoration. Introduction unknown.
- Disposition — `candidate`, P3 maintainer evidence, `inspected-present` on the [second-pass snapshot][audit-2026-11-16-pass-2] for a staging lookup that rejects for a reason other than absence. No false receipt was observed.
- Next check — Exercise the ordinary cancellation predicate with absent, retained and lookup-error outcomes. Require evidence to fail for the last two and preserve owned teardown and restoration.

- 2026-11-16 reconciliation — `inspected-present` for the ordinary checkpoint. The broad catch originated in `ddd3cbc3b4f337f04ebb9dbdbb17f74ad42a5898`; strict checks in the bounded probe and later teardown cover separate stages. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — `inspected-present` at the full journey's non-ENOENT branch. Later retry may erase the missing cleanup observation. The bounded path's strict helper still protects its own checkpoint. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — Controlled ordinary cancellation reproduced retry after EACCES/EIO/unknown staging lookup. Strict absence now admits only ENOENT, rejects residue and preserves cleanup/restoration before the next acquisition. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for the staging lookup treating arbitrary I/O failure as absence. [The ordinary runner](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L708) accepts `ENOENT` only. [Audit][audit-2026-11-17]

## VF-0082

**Concurrent evaluator corrections can replace an accepted correction.** Two `correct` invocations for different marked cases of the same evaluator can both pass the missing-record check. If writes proceed in order afterwards, the second publish replaces the first. Both invocations report success. Later aggregation applies only the correction still present.

- Owners — [v6 correction admission](../../../services/tts/benchmarks/quality.py#L574), the [replacing JSON writer](../../../services/tts/benchmarks/quality.py#L83) and [aggregate correction loading](../../../services/tts/benchmarks/quality.py#L599). [Maintainer command](../../../package.json#L60).
- Lineage — [M010](../../plans/completed/M010-hardware-profiles-fallback-and-operational-resilience.md#L1211) requires a one-time immutable record. [VF-0014](#vf-0014) covers failure invalidating a stale aggregate. The [current regression](../../../services/tts/tests/test_benchmark_quality.py#L522) applies a correction sequentially. Introduction unknown.
- Disposition — `candidate`, P3 retained benchmark correctness, `inspected-present` on the [second-pass snapshot][audit-2026-11-16-pass-2] for the stated overlap with two valid inputs. The committed historical result was outside this assessment.
- Next check — Admit two invocations up to the same missing-record decision, let one publish, then resume the other. Keep one success and immutable accepted bytes. Apply the same check to duplicate completed-scorecard submission, preserving sequential validation and aggregate invalidation.

- 2026-11-16 reconciliation — `inspected-present` for overlap outside the supported sequential flow. CFR U7 explicitly retains sequential ownership; VF-0014 corrects invalidation/retry in that flow. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — Disposition is now `not-confirmed`; latest check `inspected-absent` as a defect of the explicitly supported sequential workflow. The source-supported two-process overwrite is retained as an unsupported concurrency condition, not a regression of CFR-14/VF-0014. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — NOT-APPLICABLE under the supported sequential correction contract. No concurrent publication feature or locking change was introduced. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

- 2026-11-16 authorized follow-up — The user approved defensive overlap rejection. Real child processes reproduce competing successes, stale aggregate publication and removal of an active session. Per-session nonblocking OS ownership now covers correction, submission, aggregation, cleanup and CPU-fallback derivation; rejected admission preserves the winner, and owner termination permits retry. The sequential contract, one immutable correction, original invalidation/retry protection and historical result files remain intact. [ADR-0077](../../architecture/decisions/ADR-0077-exclusive-ready-quality-operations.md) records the retained empty sibling. Current Python checks pass; exact-patch acceptance belongs to the [follow-up ledger](../../plans/evidence/reader-stop-quality-follow-up/execution-ledger.md) and independent report. The prior exclusion was an explicit scope decision, not a demonstrated earlier regression escape.

- 2026-11-16 closeout — `fixed` for the authorized overlap rejection, latest check `validated` on `cafb59e`. R02 approved the real-process controls, recovery after owner termination and the alternative evidence for unavailable native symlink setup. [Approved closeout](../../plans/evidence/reader-stop-quality-follow-up/closeout-r02.md)
- 2026-11-17 fourth-pass assessment — `inspected-absent` on `50f3b9e` for competing correction publication. [Per-session operation admission](../../../services/tts/benchmarks/quality.py#L549) precedes the write. [VF-0116](#vf-0116) concerns presentation of a correctly rejected overlap at the derivation CLI. [Fourth audit][audit-2026-11-17-pass-4]

- 2026-11-16 PR #325 native link follow-up — The privileged CI runner reached the two locally skipped link fixtures and exposed a literal path-spelling mismatch after successful lock rejection. The test now compares the link's post-operation destination with its actual pre-operation readback; target/session integrity and safe retry assertions remain. Local native execution is still privilege-blocked, and replacement Windows CI is required for native GREEN. [Evidence and independent review](../../plans/evidence/reader-stop-quality-follow-up/ci-symlink-follow-up.md).

- 2026-11-16 PR #325 lock-owner follow-up — Reopened the unsafe-entry subcase after native CI reached the formerly masked assertion: a dangling coordination link caused creation of its absent referent before `session-lock`. The prior model incorrectly forced exclusive creation on a link to fail. Updated real-target-I/O RED/GREEN supports pre-open `lstat` rejection, while descriptor checks, all five callers and sequential recovery remain covered. Native GREEN still requires replacement Windows CI. [Owner correction and evidence](../../plans/evidence/reader-stop-quality-follow-up/ci-lock-preflight-follow-up.md).

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for competing operations on the same ready quality session. The [ready-session owner](../../../services/tts/benchmarks/quality_operation.py#L28) serializes mutations and derivation under [ADR-0077](../../architecture/decisions/ADR-0077-exclusive-ready-quality-operations.md#decision). Admitted generation timeout is tracked in [VF-0098](#vf-0098). [Audit][audit-2026-11-17]

## VF-0083

**Quality generation retains both output pipes before enforcing the result limit.** The quality parent accumulates entire stdout and stderr with `capture_output=True`. The 16 KiB stdout check runs after accumulation and stderr has no length check. The adapter's bounded Python stream capture does not contain arbitrary worker process output.

- Owners — [quality generation launcher](../../../services/tts/benchmarks/quality_cli.py#L118) and [maintainer command](../../../package.json#L62). [Inner adapter capture](../../../services/tts/benchmarks/quality.py#L279) covers a smaller boundary.
- Lineage — Variant of [five-pass U9 case 1.5](../../plans/completed/five-pass-audit-revalidation-and-corrections.md#u9-benchmark-subprocess-result-containment--15) in a different launcher. The [measurement caller](../../../services/tts/benchmarks/cli.py#L530) bounds its transfer and discards stderr. Quality already rejects a nonzero child exit. Introduction unknown.
- Disposition — `candidate`, P3 retained benchmark resource usage, `inspected-present` on the [second-pass snapshot][audit-2026-11-16-pass-2] for a worker emitting large pipe output. No excess memory use was measured.
- Next check — Exercise oversized stdout and stderr separately with a disposable worker, plus a valid bounded response, nonzero exit and timeout. Verify bounded parent retention and the existing fixed failure result.

- 2026-11-16 reconciliation — `inspected-present` for child output beyond the limit. U9/1.5 corrected the measurement launcher, while the retained quality launcher and its inner Python capture own different boundaries. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — `inspected-present` for missing byte bounds during parent capture. Nonzero exit rejection already exists. Excess memory use in an ordinary run, malformed-output incidence and surviving descendants remain unobserved. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — Finite child-process controls reproduced unrestricted pipe reads. Quality generation now shares the existing bounded binary-pipe/Windows Job owner, discards stderr and reaps children; exact-size JSON, invalid output, timeout and inherited-pipe controls run locally. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for unbounded quality-launcher pipes. [The launcher](../../../services/tts/benchmarks/quality_cli.py#L129) uses the [bounded worker](../../../services/tts/benchmarks/cli.py#L530). A separate timeout staging route is [VF-0098](#vf-0098). [Audit][audit-2026-11-17]

## VF-0084

**An omitted mark can turn an ambiguous English street abbreviation into Saint.** A zero-width space after `Baker` resets the preceding capitalized-word summary. Given a later uppercase `Then`, `St.` is treated as a title. The invisible mark is omitted and the prepared text changes the street abbreviation and its punctuation.

- Owners — [preceding-word scan](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1262), [title guard](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1328) and [omission](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L2010).
- Lineage — [ADR-0067](../../architecture/decisions/ADR-0067-conservative-english-titles-and-unicode-marks.md#decision) and [RAC-09](../../plans/completed/revalidated-audit-corrections.md#L186) preserve ambiguous English titles and numeric street prefixes. The existing [plain sentence control](../../../packages/epub/src/narration/narration-normalizer.test.ts#L717) has no omitted mark. [VF-0078](#vf-0078) involves a different recognition rule for the Spanish article. Introduction unknown.
- Disposition — `candidate`, P3 narration correctness, `inspected-present` on the [third-pass snapshot][audit-2026-11-16-pass-3] in ordinary same-language non-code input. Engine pronunciation and incidence were not measured.
- Next check — Compare public English Piper and Chatterbox preparation for the sentence with and without U+200B, along with a legitimate title, numeric prefix, punctuation and language/code barriers. Check original locator ranges and continuation across a preparation window.

- 2026-11-16 reconciliation — `inspected-present` in the title predecessor summary. H6, RAC-09, SAF-10 and BNC-02 cover plain titles, numeric prefixes, continuation and lexical lookaround at separate boundaries. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — `inspected-present` for the left-context omission interaction. Other approved omitted marks and Dr. are same-predicate variants. The separate right-side code-whitespace traversal is VF-0092. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — Public omitted-mark predecessor cases reproduced unwanted Saint expansion. Logical predecessor provenance is retained, including profile-specific hard segmentation and cold continuation; ordinary title/numeric/barrier controls remain. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for the same-language omitted-mark predecessor trigger. [The title classifier](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1306) retains the preceding capitalized-word evidence before considering expansion. [Audit][audit-2026-11-17]

## VF-0085

**The lifecycle journal can prevent uninstall and application-data restoration.** The standalone PowerShell lifecycle runner tries to hash the original installer when it journals an uninstall of the test installation. If that source has become unreadable, the journal throws before the installed uninstaller launches. The attempted flag can then prevent retry and the original profile stays in its backup.

- Owners — [journal hash](../../../scripts/test-windows-package-lifecycle.ps1#L149), [uninstall admission](../../../scripts/test-windows-package-lifecycle.ps1#L191) and [finalization](../../../scripts/test-windows-package-lifecycle.ps1#L391). The [final installer check](../../../scripts/test-windows-package-lifecycle.ps1#L433) guards the receipt separately.
- Lineage — [H13](../../plans/completed/validated-audit-follow-up.md#L66) owns uninstall before restoration on failure and existing process/absence guards. [VF-0056](#vf-0056) concerns a proven missing helper before installation in the separate Node runner. Introduction unknown.
- Disposition — `candidate`, P2 maintainer recovery, `inspected-present` on the [third-pass snapshot][audit-2026-11-16-pass-3] for a source installer read failure after successful install. An inaccessible backup is a workflow consequence. Permanent data loss was not observed.
- Next check — Make only the source installer unreadable after a disposable installed fixture is owned. Confirm the terminal error and absence of an accepted receipt, successful owned uninstall and profile restoration when the installed uninstaller still works, and retention when containment or restore actually fails.

- 2026-11-16 reconciliation — `inspected-present` after installer unreadability. H13 introduced the current journal dependency; DCR-05 validates final artifact identity and VF-0056 treats a separate Node helper outcome. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — `inspected-present` when the original installer becomes unreadable before owned uninstall. The backup remains preserved; the claim is blocked cleanup/restoration, not deletion of the user's original data. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — A real exclusive lock on the synthetic installer reproduced abandoned owned installation during recovery journaling. The entry digest now permits owned uninstall/restoration while fresh final drift and uncertain-containment checks remain strict. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for failure to read the original installer during recovery journaling. The [journal](../../../scripts/test-windows-package-lifecycle.ps1#L149) uses the entry digest and the [terminal check](../../../scripts/test-windows-package-lifecycle.ps1#L433) rereads the current artifact separately. [Audit][audit-2026-11-17]

## VF-0086

**Failed CustomVoice staging creation leaves a session that blocks retry.** Retained screen generation creates its session directory before attempting the staging directory. That attempt is outside the failure cleanup block. The empty session left by a staging creation error rejects a repeat invocation for that ID.

- Owners — [screen generation admission and setup](../../../services/tts/benchmarks/customvoice_screen.py#L466) through the [maintainer CLI](../../../services/tts/benchmarks/customvoice_screen_cli.py#L55).
- Lineage — Variant of [VF-0021](#vf-0021) and [VF-0042](#vf-0042) in retained CustomVoice v2/v3 screening. The [screen fixture](../../../services/tts/tests/test_customvoice_screen.py#L81) creates staging successfully. Introduction unknown.
- Disposition — `candidate`, P3 maintainer retry, `inspected-present` on the [third-pass snapshot][audit-2026-11-16-pass-3] for an error after exclusive session creation and before staging. Historical scores and the product runtime are outside this outcome.
- Next check — Fail staging creation and retry the same ID after recovery. Preserve existing-session rejection, unrelated sessions and cleanup on admitted generation failure.

- 2026-11-16 reconciliation — `inspected-present` in both retained versions. VF-0021 and VF-0042 protect different setup owners, and U9 leaves the original staging order in place. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — `inspected-present` for staging creation outside rollback in both versions. Explicit cleanup permits recovery. Adapter construction and diagnostic setup are adjacent pre-rollback controls, not extra incidents. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — Both screen versions reproduced a stranded newly created session after staging mkdir failed. Empty-only rollback checks ownership identity; same-ID retry succeeds while competing/replacement/other-version data and failed rollback remain preserved. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

## VF-0087

**Optional-data cleanup accepts absence beneath an unsafe directory.** An existing reparse-point ancestor such as `tts\cb` stops the requested NSIS removals beneath it. The final checks query the descendant paths directly. If those queries return file/path not found and the other roots are absent or cleaned, the hook skips the optional-data failure warning and status without establishing absence within the owned directory tree.

- Owners — [deletion guard](../../../apps/desktop/src-tauri/windows/nsis-hooks.nsh#L38), [removal path](../../../apps/desktop/src-tauri/windows/nsis-hooks.nsh#L245) and [aggregate status](../../../apps/desktop/src-tauri/windows/nsis-hooks.nsh#L400).
- Lineage — [LCF-03](../../plans/completed/lifecycle-correctness-follow-up.md#L100) requires truthful status for unsafe retained roots. Its [leaf test](../../../apps/desktop/scripts/windows-release.node-test.mjs#L1000) and [access-denied ancestor test](../../../apps/desktop/scripts/windows-release.node-test.mjs#L1073) cover distinct branches. Preferences already check literal ancestors before admitting absence. Introduction unknown.
- Disposition — `candidate`, P3 Windows uninstall reporting, `inspected-present` on the [fourth-pass snapshot][audit-2026-11-16-pass-4] for an unsafe ancestor followed by missing descendant results. Confidence is high in the status branch given those results. An installed Windows run and retained bytes were outside this assessment.
- Next check — Use an existing unsafe intermediate directory in the compiled hook fixture and observe missing descendant results. Require incomplete-cleanup status and preserve the unsafe tree, safe sibling cleanup and the independent preferences choice. Keep ordinary absence and access-denied controls.

- 2026-11-16 reconciliation — `inspected-present` conditional on missing descendant lookups through unsafe ancestry. LCF-03's exact leaf and access-denied controls leave that branch untested. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — `inspected-present` for optional status given unsafe ancestry and missing descendant results. Safe deletion remains guarded, and the actual OS lookup sequence and retained package bytes were not observed. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — Compiled NSIS reproduced false success below a junction with absent descendants. Ancestor checks now reject that evidence without touching outside sentinels; existing locked/denied/update/preferences controls pass. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for the selected explicit-cleanup route under an unsafe ancestor. The [NSIS checks](../../../apps/desktop/src-tauri/windows/nsis-hooks.nsh#L417) record it before testing absent descendants. [Audit][audit-2026-11-17]

## VF-0088

**A download probe can accept an unrelated error as its injected file-create failure.** Once the barrier directory has been created, any failed first download with a non-null diagnostic satisfies the capture gate. A transient HTTP failure before file creation can supply that diagnostic. Export equality and a successful later cancellation can then produce a passing bounded probe without exercising the intended file-create error.

- Owners — [capture and fault setup](../../../apps/desktop/scripts/optional-download-probe.mjs#L84), [native response and file creation](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1757) and [bounded result admission](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1556).
- Lineage — The [original installed probe](../../plans/completed/optional-download-diagnostics.md#L144) reported the actual file-create stage and OS I/O error. [VF-0076](#vf-0076) and [VF-0081](#vf-0081) cover the separate full journey and different acceptance predicates. Introduction unknown.
- Disposition — `candidate`, P3 maintainer evidence, `inspected-present` on the [fourth-pass snapshot][audit-2026-11-16-pass-4] for a first transfer that fails before file creation after barrier placement, with later probe steps passing. No false installed receipt was observed.
- Next check — Compare an initial HTTP failure with the intended first runtime artifact's `create-file`/`io` diagnostic. Require the injected error before crediting that step and preserve export equality, cancellation, cleanup and restart checks.

- 2026-11-16 reconciliation — `inspected-present` at the local fault predicate. The historical exact-host diagnostic did show file creation failure. Current assertion can credit a different error originating before that operation. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — `inspected-present` only as a probe-specific assertion gap. The receipt retains the actual diagnostic and the historical installed result recorded the intended create-file failure; neither generic export nor that past observation is disproved. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — Controlled probe execution reproduced crediting a response-stage error. The injection now requires the intended first-artifact create-file/io OS error; exact export and post-Cancel retention remain checked. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

- 2026-11-16 PR #325 follow-up — The configured desktop Node phase exposed a test-only fixture-root assumption in VF-0088 controls. Test calls now resolve the root from their module, preserving probe assertions from both repository and package working directories. The production probe is unchanged; prior root-only execution missed the package-directory trigger. [CI evidence and independent assessment](../../plans/evidence/reader-stop-quality-follow-up/ci-follow-up.md).

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for crediting an unrelated HTTP response-stage failure. The [probe](../../../apps/desktop/scripts/optional-download-probe.mjs#L114) now fails closed on that mismatch. Its rejection of the intended diagnostic is tracked in [VF-0094](#vf-0094). [Audit][audit-2026-11-17]

## VF-0089

**v5 concurrent execution can start with a failed GPU baseline.** A GPU-solo run with a failed cancellation trial can derive a schema-valid summary that records fewer than two passed trials. Given its exact digest and an otherwise eligible concurrent request, the runner accepts its identity and starts the concurrent stage. The baseline admission branch checks neither the required trial count nor the other GPU-solo gates such as the minimum measured duration.

- Owners — [prerequisite admission](../../../services/tts/benchmarks/dual_worker_cli.py#L118) and [caller before worker creation](../../../services/tts/benchmarks/dual_worker_cli.py#L433), consuming a [derived summary](../../../services/tts/benchmarks/dual_worker_result.py#L406).
- Lineage — [Frozen GPU-solo prerequisites](../../../benchmarks/tts/profile-v5.json#L351) require all gates before concurrent execution. [VF-0070](#vf-0070) concerns a different v14 CPU admission. The [v5 command contract fixture](../../../services/tts/tests/test_benchmark_dual_worker_cli.py#L52) checks digest-field progression. Introduction unknown.
- Disposition — `candidate`, P3 retained benchmark evidence, `inspected-present` on the [fifth-pass snapshot][audit-2026-11-16-pass-5] given an exact GPU-solo summary with a failed trial and otherwise passing admission. Historical v5 results and product profile support were outside this assessment.
- Next check — Compare a successful GPU-solo summary with freshly derived summaries having one failed cancellation trial or fewer than 300 measured seconds. Bind each to its actual digest. Admit only the qualifying baseline and preserve digest mismatch, wrong-arm and CPU admission controls.

- 2026-11-16 reconciliation — `inspected-present` at automatic baseline qualification. The historical M006-002 GPU result itself qualified, and the subsequent concurrent attempt produced no accepted result. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — `inspected-present` at automatic qualification with otherwise eligible inputs. Exact hashes do not verify GPU gate success; manual qualification still prevents this route and the historical baseline qualified. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — Matching-digest but ineligible GPU summaries reached worker construction in both concurrent entry modes. Frozen count/duration/cancellation/audit/memory gates now block them; eligible boundary data reaches construction and CPU progression is preserved. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for official v5 pre-worker admission with a known failing GPU-solo summary. The [runner](../../../services/tts/benchmarks/dual_worker_cli.py#L467) validates the summaries before construction. Run authority identity has a separate unchecked input in [VF-0099](#vf-0099). [Audit][audit-2026-11-17]

## VF-0090

**v5 can skip explicit worker cleanup after a cold-load observation fails.** In an official solo arm, the cold worker has already loaded when GPU counters or placement can fail. The local runtime is transferred to the finalizer's variable only after the observation succeeds, and the earlier cold runtimes close only on the successful observation branch. A failure skips explicit close and leaves the adapter's best-effort destructor, which suppresses cleanup errors.

- Owners — [cold-load observation](../../../services/tts/benchmarks/dual_worker_cli.py#L218), [solo cold loop](../../../services/tts/benchmarks/dual_worker_cli.py#L467), [outer finalizer](../../../services/tts/benchmarks/dual_worker_cli.py#L682) and [adapter destructor](../../../services/tts/benchmarks/isolation.py#L892).
- Lineage — The [runtime close fixture](../../../services/tts/tests/test_benchmark_dual_worker_runtime.py#L532) covers closing across a load handoff when close is called. This failure occurs in the CLI before it transfers close ownership. The [original v5 execution flow](../../plans/completed/M006-002-qwen-short-segment-batch-feasibility.md#milestone-8-run-cpu-solo-admission-and-the-concurrent-matrix) requires cleanup on failure. Introduction unknown.
- Disposition — `candidate`, P3 retained benchmark cleanup, `inspected-present` on the [fifth-pass snapshot][audit-2026-11-16-pass-5] for an exception after load succeeds and before admission of its observation. No surviving process or destructor failure was observed.
- Next check — Fail the memory observation with a benign already-loaded worker in an early and final cold slot. Require explicit close before returning and an observable cleanup failure when containment cannot be confirmed. Preserve earlier successful cold closes and final-worker reuse for warm-up.

- 2026-11-16 reconciliation — `inspected-present` for failed post-load observation after the original solo-loop introduction in `dbd4bb09b62ed648fd74dde513975f03d85b562b`. Earlier containment work starts when close is actually invoked. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — `inspected-present` for skipped explicit close/error reporting. Destructor termination remains best effort; no live orphan is established. Early/final cold slots and pilot/concurrent ownership are distinct controls. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — First/second/third cold-load and early-close failures reproduced missing explicit ownership. Runtime ownership now precedes load; every created instance receives explicit close, including warmup failure and a final retry of a failed close. R01 additionally exposed primary-error replacement by cleanup failure. The corrected CLI preserves the primary stdout receipt and emits a fixed content-free secondary stderr diagnostic; combined, primary-only and cleanup-only controls pass. A failing close does not establish successful containment or a safe successor. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for lack of a retained handle at the selected v5 cold-load boundary. [The runner](../../../services/tts/benchmarks/dual_worker_cli.py#L496) assigns runtime ownership before observation and [closes in `finally`](../../../services/tts/benchmarks/dual_worker_cli.py#L726). [Audit][audit-2026-11-17]

## VF-0091

**The v5 queued cancellation trial can pass with no queued request.** The trial gives the concurrent controller one request per worker. Both are dispatched before the first completion. The `queued-after-invalidation` and `complete-before-ordered-release` cases then use the same completion hook and both can pass from invalidation and teardown timings, without a request waiting for dispatch or a later submission.

- Owners — [trial input and hook](../../../services/tts/benchmarks/dual_worker_cli.py#L324), [initial dispatch](../../../services/tts/benchmarks/dual_worker_controller.py#L210), [exit before release and redispatch](../../../services/tts/benchmarks/dual_worker_controller.py#L293) and [trial result](../../../services/tts/benchmarks/dual_worker_cli.py#L352).
- Lineage — [v5 trial order](../../../benchmarks/tts/profile-v5.json#L279) requires two distinct trials. [Five-pass U11](../../plans/completed/five-pass-audit-revalidation-and-corrections.md#u11-v13-cancellation-proof-and-memory-stop--23-add-02) addresses different cancellation phases and runner in v13. Introduction unknown.
- Disposition — `candidate`, P3 retained benchmark evidence, `inspected-present` on the [fifth-pass snapshot][audit-2026-11-16-pass-5] when timing and cleanup checks pass. This assesses the trial's coverage of queued work. No stale playback or historical concurrent pass was observed.
- Next check — Give the queued trial a witness for a still-queued unit at invalidation and check that it never reaches a worker or publication. Preserve the separate completed-but-unpublished case and the provable teardown gates.

- 2026-11-16 reconciliation — `inspected-present` as a duplicate official trial predicate. EFC-02 exercises real pending runtime work separately, and v5 history contains no successful concurrent result from this trial. [Case review][audit-2026-11-16-reconciliation].

- 2026-11-16 deep validation — `inspected-present` as duplicate phase evidence, not demonstrated broken cancellation. Adjacent concurrent gpu-active/cpu-active/both-active labels also share the initial-dispatch setup without separate active-phase witnesses. Keep this under the same ID and preserve historical results. [Deep assessment][audit-2026-11-16-deep].

- 2026-11-16 execution — Decision-blocked on a successor phase-witness contract: define queued/active/completed states and bind observed role/identity/phase to invalidation. Frozen v5 trials remain unchanged and are not newly certified. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

- 2026-11-16 authorized successor execution — `reproduced`; Original unwitnessed active trial acceptance reproduced before edits. Controller-admitted third work, concrete pre-release completion and actual child adapter entry now have distinct witnesses, paired queue control and simultaneous both-active barrier. Session/trial/worker/occurrence identities and recomputed acceptance preserve existing isolation/deadline/cleanup protections. The shared completion hook and dispatch-only checks explain the coverage gap; the earlier review cause remains unknown. Current evidence and final R04 acceptance are in [case results][fsf-execution].

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for the phase-alias trigger for new official v5 results. [Trial creation](../../../services/tts/benchmarks/dual_worker_trials.py#L165) requires the queued occurrence and [derivation](../../../services/tts/benchmarks/dual_worker_result.py#L194) consumes its distinct witness. [Audit][audit-2026-11-17]

## VF-0092

**English title lookahead can cross inline-code whitespace.** In an English paragraph with `St.<code> </code>James`, the code space survives projection within the same source leaf. The title lookahead skips it without checking prose/language context, finds an English uppercase letter and expands St. to Saint. Dr. has the same route. The code bytes remain unchanged; the abbreviation uses context across a semantic barrier.

- Owners — [successor-context loop](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1339), [immediate lexical boundary](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L506), [code whitespace projection](../../../packages/epub/src/document/xhtml-projector.ts#L475) and [source context](../../../packages/epub/src/narration/narration-source-projector.ts#L270). Both current Piper/Chatterbox public preparation profiles use the mutable normalizer.
- Lineage — Related to [VF-0084](#vf-0084), but the failing predicate is right-side whitespace traversal rather than loss of the preceding capitalized word. [ADR-0067](../../architecture/decisions/ADR-0067-conservative-english-titles-and-unicode-marks.md) and [BNC-02](../../plans/completed/narration-boundary-navigation-corrections.md#L171) require conservative context and semantic barriers. The loop is already present in H6 commit `ab6a609326d4169990207496d1693608e05b285f`; later RAC-09/SAF-10/classifier changes retain it. Those earlier controls do not exercise code only in the right gap. Exact review escape remains unknown.
- Disposition — `candidate`, P3 product preparation. `inspected-present` on `main` at `079c38ece8687b24859db4f64d4f92bba67bdcee`, with only prior audit documents dirty. [Deep source trace][audit-2026-11-16-deep]. No runtime reproduction, natural incidence or engine-pronunciation claim.
- Next check — Require each skipped right-gap token to be same-language prose. Compare public code-gap and retained foreign-gap inputs with plain accepted titles for both profiles, preserving the original abbreviation/period at barriers, code bytes, raw source endpoints, limit behavior, predecessor controls and warm/cold continuation.


- 2026-11-16 execution — Public code-gap and retained foreign-NBSP cases reproduced title expansion across a semantic barrier. Every skipped gap token must now be English prose; accepted plain titles, exact source ranges and both profiles remain controls. The [case results][fsf-execution] record the distinguishing assertions, earlier coverage limits and next action; exact-patch acceptance is governed by the linked execution review/closeout. HEAD is `6130e2fed61f5d632e3f31c69775d1fa60c97373` plus the identified task patch, not a new commit.

- 2026-11-17 assessment — `inspected-absent` on `50f3b9e` for the retained code-space and foreign-language NBSP cases. The [title lookahead](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1366) stops before crossing either context. [Audit][audit-2026-11-17]

## VF-0093

- PR #332 CI follow-up — The presentation matrix checks the cancellation message while the preparing service is stopping. [CI evidence](../../plans/evidence/november-23-findings/ci-follow-up.md)

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. Both pre-registration dispatch and a held packaged verifier were exercised. A denied Start now frees its exact retirement slot. The capacity check holds each of the two admission gates and proves a subsequent early Cancel remains effective. [Owner checks and limits](../../plans/evidence/november-23-findings/native-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the over-deadline cleanup failure, with an additional scheduling-dependent route before native Start registration. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0093)

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0093) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0093)

**Cancel start can miss in-flight native package verification.** On packaged Piper, press Cancel start after native startup takes its operation lock and begins verifying the installed package, before a child occupies the session slot. Shutdown finds no child or matching termination receipt. Native startup can still create and handshake the obsolete child. If the wait for verification and containment passes the five-second deadline, narration reports cleanup failure and ordinary Play stays blocked pending recovery.

- Owners — [Native startup and publication](../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1504), [empty-slot shutdown](../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1835), [installed Piper verification](../../../apps/desktop/src-tauri/src/tts_release_core.rs#L119), [typed-client shutdown](../../../apps/desktop/src/tts/process-client.ts#L567) and [coordinator cleanup](../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1568).
- Lineage — Variant of [CCF-C07](../../plans/completed/confirmed-chat-findings-minimal-corrections.md#L263), which covers pre-dispatch compatibility work. [ADR-0056](../../architecture/decisions/ADR-0056-bound-reader-narration-lifecycle-operations.md#decision) keeps exact-client containment for dispatch races and addresses already-published load/warm. The [dispatched-start test](../../../apps/desktop/src/tts/product-narration-coordinator.test.ts#L1258) uses a fake shutdown outside native verification. First introduction unknown.
- Disposition — `candidate`, P2 product startup given the cleanup-deadline overrun. `inspected-present` on `50f3b9e` for the ordered interleaving and its conditional outcome. The stale-run guard prevents obsolete synthesis. Host incidence and eventual termination timing remain unmeasured. [Audit][audit-2026-11-17]
- Next check — Hold native verification before slot publication, cancel the exact start, and release verification. Assert that the abandoned start creates no child and that the next Play can start after bounded cleanup. Preserve interruption after publication and exact-instance protection for replacements.

- 2026-11-17 second-pass assessment — `inspected-present` on `50f3b9e` for Cancel processed after a packaged Piper native startup begins verification and before child publication. The [busy shutdown](../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1835) records no cancellation for the pending start while the [client](../../../apps/desktop/src/tts/process-client.ts#L567) awaits settlement. The Play-blocking outcome still depends on exceeding the cleanup deadline. [Second audit][audit-2026-11-17-pass-2]

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. An empty native slot admits an obsolete spawn. Blocking the next Play additionally requires a cleanup timeout. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0093)

- 2026-11-23 assessment — Partial closure on `d9a0a72`. `inspected-absent` for the obsolete spawn after native retirement. `inspected-present` for the remaining P2 cleanup failure when installed Piper verification outlasts the five-second deadline. The client and coordinator still wait for the retired start to settle. After it settles, Diagnostics can retry cleanup. The earlier fixture releases its barrier before the next start and does not establish the over-budget UI outcome. [Trace and next check][audit-2026-11-23] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0093)

## VF-0094

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0094) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — Git traces the ordinal mismatch to the VF-0088 correction in `e85837d`. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0094)

**The download probe rejects the native first-artifact diagnostic.** On a compatible Windows host, the bounded probe's injected first-runtime-part file-create failure yields GitHub artifact index `1` with stage `create-file` and kind `io`. The runner requires index `0` and fails before checking export and cancellation.

- Owners — [Probe gate](../../../apps/desktop/scripts/optional-download-probe.mjs#L114) and [native producer](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2301). [ADR-0059](../../architecture/decisions/ADR-0059-optional-download-diagnostics.md#decision) defines one-based artifact indexes.
- Lineage — False rejection variant of [VF-0088](#vf-0088). `e85837d` introduced the index predicate. The [paired fixture](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs#L297) admits zero and uses one as a negative control, which explains the missed interface mismatch.
- Disposition — `candidate`, P2 maintainer release evidence, `inspected-present` on `50f3b9e`. All correctly indexed first-part failures fail this gate. No new installed transfer ran. [Audit][audit-2026-11-17]
- Next check — Use the native one-based diagnostic shape as the passing case. A later part, response-stage failure and invalid OS code should still fail. Continue the genuine diagnostic through export equality and subsequent cancellation.

- 2026-11-17 second-pass assessment — `inspected-present` on `50f3b9e` for the first runtime artifact's correct file-create diagnostic. Rechecked [native serialization input](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2301), the [zero-based probe gate](../../../apps/desktop/scripts/optional-download-probe.mjs#L114) and its [fixture](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs#L297). [Second audit][audit-2026-11-17-pass-2]

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. The native one-based first artifact fails the probe's zero comparison. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0094)

## VF-0095

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0095) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0095)

**Late Cancel can hide the post-commit Chatterbox cleanup action.** Settings still shows Verifying when native promotion commits and cleanup fails. Cancel reaches native after it has recorded `Failed` and returns `tts-optional-profile-invalid`. The client supersedes Download's terminal result and publishes a generic failed snapshot. With acquisition still eligible, Settings offers **Review Chatterbox download again**. Choosing Review can replace the retained cleanup receipt with a new confirmation. A fresh snapshot before Review can restore the cleanup action. A new Download still requires explicit consent.

- Owners — [Native terminal failure](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2384), [Cancel](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2448), [client action ownership](../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L329), [Settings failed-state actions](../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L511) and [native reselection](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2180).
- Lineage — Variant of [VF-0043](#vf-0043) and [VF-0058](#vf-0058). The [late-Cancel test](../../../apps/desktop/src/tts/optional-chatterbox-client.test.ts#L47) varies Download settlement while Cancel returns Installed. This ordering requires native `Failed` before Cancel and no later fresh poll. Introduction unknown.
- Disposition — `candidate`, P3 product recovery, `inspected-present` on `50f3b9e` given the described UI/native ordering. Host incidence remains unmeasured. [Audit][audit-2026-11-17]
- Next check — Hold the staging failure and Cancel response through the client, verify the mounted Settings offers **Check Chatterbox again**, and continue through successful cleanup. Keep late Installed and ordinary pre-commit cancellation controls.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. The late Cancel hides the cleanup receipt in the client. A fresh authoritative read still offers Check. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0095)

## VF-0096

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0096) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0096)

**Flattened inline direction scopes can scramble visual run order.** In an LTR paragraph, a single RTL span around text interrupted by inline emphasis has one bidi isolate in XHTML. Flattening the span and assigning RTL individually to bare text and the retained wrapper creates multiple sibling isolates, changing their display order within the LTR paragraph.

- Owners — [Flattened XHTML context](../../../packages/epub/src/document/xhtml-projector.ts#L967), [resolved scope direction](../../../apps/desktop/src/reader/semantic-auto-direction.ts#L195) and [inline attributes](../../../apps/desktop/src/reader/SemanticDocument.tsx#L244). [HTML bidirectional rendering](https://html.spec.whatwg.org/multipage/rendering.html#bidirectional-text) and [Unicode isolate rules](https://www.unicode.org/reports/tr9/#Explicit_Directional_Isolates) establish the inferred display order.
- Lineage — Variant of [VF-0075](#vf-0075). The [current browser control](../../../apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts#L64) checks direction and restoration. This case concerns grouping even when all computed directions match. Fixed-direction flattening uses the same mechanism. First introduction unknown.
- Disposition — `candidate`, P3 product rendering, `inspected-present` on `50f3b9e` for a single-line mixed-direction paragraph. The visual order follows from the projected DOM and the bidi rules. Actual WebView2 geometry remains unmeasured. [Audit][audit-2026-11-17]
- Next check — Compare the horizontal order of the same three code points in the reader and a native HTML reference. Preserve the mirrored case, logical offsets, and admission and reflow coverage.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. One authored scope becomes sibling isolates across formatting. Installed glyph geometry was unmeasured. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0096)

## VF-0097

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0097) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — Git traces the hidden-scope scratch charge to the VF-0075 correction in `e85837d`. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0097)

**Hidden Auto markup can push a chapter over the live-node limit.** The XHTML projector counts `dir="auto"` before discarding hidden content. With no retained Auto text and 79,999 projected live nodes, the renderer still adds two direction-probe nodes and rejects the chapter at 80,001.

- Owners — [Scope allocation](../../../packages/epub/src/document/xhtml-projector.ts#L802), [hidden omission](../../../packages/epub/src/document/xhtml-projector.ts#L860), [probing only surviving scoped text](../../../apps/desktop/src/reader/semantic-auto-direction.ts#L195) and [live-node admission](../../../apps/desktop/src/reader/large-chapter-rendering.ts#L195). [ADR-0007 hidden-content policy](../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md#content-handling-matrix) and [ADR-0008 cap](../../architecture/decisions/ADR-0008-visual-reader-architecture.md#L139) apply.
- Lineage — Regression introduced in `e85837d` alongside [VF-0075](#vf-0075). The [capacity test](../../../apps/desktop/src/reader/large-chapter-rendering.test.ts#L130) accounts for a visible scope. A projected document whose only declaration is discarded by ingestion exercises a different admission input.
- Disposition — `candidate`, P3 product availability, `inspected-present` on `50f3b9e` near the renderer cap. [Audit][audit-2026-11-17]
- Next check — Open equivalent synthetic chapters with and without the hidden declaration at the retained-node limit, and a separate chapter that needs a real direction probe. Verify equivalent visible markup and genuine cap enforcement.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. Hidden-only Auto can charge two nonexistent probe nodes and can also trigger a needless scan below capacity. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0097)

## VF-0098

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0098) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0098)

**Forced quality-generation timeout can strand private staging and block retry.** An admitted `quality:generate` worker can stall after creating candidate staging and writing a WAV. The parent terminates the worker when the watchdog expires and reports generation failure. Cleanup lives in the terminated worker. The same-ID retry reaches the existing candidate directory and aborts before generating, then attempts whole-session cleanup itself.

- Owners — [Parent timeout handling](../../../services/tts/benchmarks/quality_cli.py#L123), [owned worker termination](../../../services/tts/benchmarks/cli.py#L560), [staging and failure cleanup](../../../services/tts/benchmarks/quality.py#L242) and [generation-failure contract](../../../benchmarks/tts/README.md#L704).
- Lineage — Stranded-staging variant of [VF-0086](#vf-0086) in a different command, with [VF-0083](#vf-0083) as an adjacent worker-launch control and [VF-0006](#vf-0006) as a pre-admission control. The [timeout fixture](../../../services/tts/tests/test_benchmark_quality.py#L114) stalls without staging. The [worker cleanup fixture](../../../services/tts/tests/test_benchmark_quality.py#L494) throws inside the worker. Introduction of the ownership gap is unknown.
- Disposition — `candidate`, P3 maintainer workflow, `inspected-present` on `50f3b9e` when timeout precedes the terminal metadata update. Private residue is local. Worker containment can succeed and explicit session cleanup remains available. [Audit][audit-2026-11-17]
- Next check — Time out a disposable worker after its first WAV. Check for intact pre-existing sessions after rejection, zero partial data after an admitted timeout and successful same-ID retry following the specified cleanup.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. Forced exit after a WAV write skips rollback. The first same-ID retry can fail before it cleans staging. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0098)

## VF-0099

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0099) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0099)

**An invalid v5 authority commit reaches official execution.** A well-formed but stale `authorityCommitSha` can pass the official dual-worker request and prerequisite checks, consume a one-use reservation, and run model work. After a completed measurement and successful power restoration, the journal can report `eligibleForDerivation: true`. Derivation then rejects the recorded authority commit against the exact frozen commit and ancestry criteria.

- Owners — [Request decoder](../../../services/tts/benchmarks/dual_worker_command.py#L104), [pre-worker admission](../../../services/tts/benchmarks/dual_worker_cli.py#L467), [restoration receipt](../../../services/tts/benchmarks/benchmark_safety.py#L335) and [derivation authority](../../../services/tts/benchmarks/v5_authority.py#L470).
- Lineage — Prerequisite admission variant of [VF-0089](#vf-0089), which concerns the GPU baseline summary. The [original milestone](../../plans/completed/M006-002-qwen-short-segment-batch-feasibility.md#L1307) records the cost of discovering an ancestry mismatch after a run. The request shape check predates prospective safety. The precise earlier escape cause is unknown.
- Disposition — `candidate`, P3 maintainer workflow, `inspected-present` on `50f3b9e` with otherwise admissible official inputs. The committed authority is a strict ancestor of this HEAD. A stale authority can waste a run and reservation, while derivation still prevents publication. [Audit][audit-2026-11-17]
- Next check — Compare a wrong commit and a non-ancestral execution with the valid authority/ancestry pair. Reject invalid lineage before reservation claim or worker construction and retain claim/restoration behavior for valid requests.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. The strict frozen-commit and ancestry gate is downstream of official execution. Summary publication still rejects the result. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0099)

## VF-0100

2026-11-18 follow-up. Both real installer validators preserved the live custom installation, the stale-registration sentinel and the data in both failed-launch controls on a disposable Windows profile. Account, profile and staging cleanup were independently verified. The outer launcher returned exit 1 during receipt aggregation. [Executed host evidence](../../plans/evidence/november-17-findings/execution-gates.md#follow-up-for-vf-0100-and-vf-0114)

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0100) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0100)

**Windows validation can install in a remembered nondefault location.** The standalone lifecycle and ordinary Chatterbox runners check the default `%LOCALAPPDATA%\VoxLeaf` directory before launching the current-user installer with `/S`. Tauri can restore a remembered custom destination instead. A prior installation in that location may be modified. If a previous uninstall left only the remembered location, the new validation install can still land there and escape cleanup that checks the default directory. The standalone finalizer can restore the application's data with that redirected installation still present.

- Owners — [Standalone admission](../../../scripts/test-windows-package-lifecycle.ps1#L61), [ordinary admission](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1188), [shared installer invocation](../../../scripts/windows-package-lifecycle-installer.ps1#L99) and [standalone cleanup](../../../scripts/test-windows-package-lifecycle.ps1#L391). [Pinned Tauri destination initialization](https://github.com/tauri-apps/tauri/blob/tauri-cli-v2.12.3/crates/tauri-bundler/src/bundle/windows/nsis/installer.nsi#L474-L493), [remembered path lookup](https://github.com/tauri-apps/tauri/blob/tauri-cli-v2.12.3/crates/tauri-bundler/src/bundle/windows/nsis/installer.nsi#L851-L855) and [VoxLeaf uninstall hook](../../../apps/desktop/src-tauri/windows/nsis-hooks.nsh#L211).
- Lineage — [VF-0087](#vf-0087) concerns optional-data ancestry. [VF-0085](#vf-0085) concerns an already owned install and its recovery journal. This case concerns proof of the effective install destination at admission. [Testing contract](../testing.md#L261) requires blocking a pre-existing install. Introduction and prior escape beyond the default-root fixture scope are unknown.
- Disposition — `candidate`, P2 maintainer workflow, `inspected-present` on `50f3b9e` for the default root absent and a remembered nondefault destination. The override follows from the pinned template and the shared launch arguments. No installed host or user data was exercised. [Audit][audit-2026-11-17-pass-2]
- Next check — In a disposable Windows context, verify both runners reject a live nondefault installation before backup or launch. Exercise a stale remembered path and a genuinely clean default install, and require verified absence at the actual destination before restoration.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. Default-directory admission misses a remembered destination. The two finalizers differ in how they handle the missing default-root installation. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0100)

## VF-0101

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0101) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0101)

**The standalone lifecycle receipt can credit installer bytes it did not exercise.** The runner reads the original installer's identity at entry but launches each installer from the original path. If another compatible installer is present for a launch and the original file is back by the final identity check, the receipt can credit the exercised behavior to the original bytes. Receipt validation sees the expected original digest and timestamps.

- Owners — [Entry identity](../../../scripts/test-windows-package-lifecycle.ps1#L23), [shared runner invocation](../../../scripts/test-windows-package-lifecycle.ps1#L167), [terminal identity and receipt](../../../scripts/test-windows-package-lifecycle.ps1#L433) and [receipt consumer](../../../apps/desktop/scripts/windows-release.mjs#L487).
- Lineage — Standalone validator variant of [VF-0067](#vf-0067). Its ordinary runner uses a run-owned copy. [Standalone drift coverage](../../../apps/desktop/scripts/windows-release.node-test.mjs#L525) changes the source persistently, which the final reread catches. The [earlier reconciliation](audits/2026-11-15-findings-reconciliation.md#vf-0067--installer-bytes-attributed-to-the-ordinary-journey) noted the limit of two observations. First origin unknown.
- Disposition — `candidate`, P2 release evidence, `inspected-present` on `50f3b9e` conditional on temporary source drift and the other checks succeeding. No false receipt was produced in this pass. [Audit][audit-2026-11-17-pass-2]
- Next check — Use owned fixture artifacts and controlled launch. Require the receipt to identify the same artifact across every lifecycle invocation, including when the source changes and is later restored. Keep the final drift, containment and journal-read failure controls.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. Temporary installer substitution evades endpoint hashes. The ordinary runner's copied artifact is a control. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0101)

## VF-0102

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0102) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0102)

**Late rate failure after paused final audio can overwrite the saved speed.** Select a slow speed during the final direct-playback unit and Pause just before its end callback is delivered. The callback releases the unit while the scheduler stays paused. If future-rate preparation fails before Resume, the player treats the preparation as needed and falls back to 100%. The coordinator persists 100% even though the final unit has already ended and no successor can consume the prepared rate.

- Owners — [Paused device completion](../../../apps/desktop/src/tts/pcm-playback.ts#L447), [paused scheduler](../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1044), [future-rate retirement](../../../apps/desktop/src/tts/pcm-playback.ts#L860) and [fallback persistence](../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2252).
- Lineage — Paused-before-Resume variant of [VF-0048](#vf-0048). The [existing completion test](../../../apps/desktop/src/tts/product-narration-coordinator.test.ts#L544) resumes before rejecting preparation, so it exercises logical completion. Earlier origin unknown.
- Disposition — `candidate`, P3 product preference, `inspected-present` on `50f3b9e` for end delivery and preparation rejection in that order with a known complete range. Device timing and failure frequency remain unmeasured. [Audit][audit-2026-11-17-pass-2]
- Next check — Deliver final end while paused, reject future-rate preparation before Resume, and verify the saved speed and the next explicit Play. Keep paused runs with a real successor, unfinished preparation ranges and explicit rate fallback covered.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. End during Pause and future-rate rejection before Resume can save a fallback after the last unit. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0102)

## VF-0103

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0103) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0103)

**A short underrun can report zero buffering time.** Device end can exhaust the queued audio and increment the underrun counter. If the final short successor then becomes available before the next coordinator sample, the player can resume right away. The coordinator observes playing on both sides of the interval and adds no buffering duration, despite the recorded underrun.

- Owners — [Device-end accounting](../../../apps/desktop/src/tts/pcm-playback.ts#L487), [short complete tail admission](../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1084), [coordinator duration integration](../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2294) and [installed metric consumer](../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L1908).
- Lineage — [VF-0050](#vf-0050) addresses the precision of source frames observed during Stop. This case is wall-clock duration through a complete state transition between observations. The [coordinator control](../../../apps/desktop/src/tts/product-narration-coordinator.test.ts#L2587) samples during a longer gap. Earlier origin unknown.
- Disposition — `candidate`, P3 playback measurement, `inspected-present` on `50f3b9e` for a nonzero interruption bracketed by two playing samples. Scope is reported duration. Actual device timing and effect on a measured MVP result remain open. [Audit][audit-2026-11-17-pass-2]
- Next check — Use the existing device and clock seams to end a unit after a tick and admit an already-final successor before the next. Assert one underrun and the positive involuntary duration. Retain the long-gap, Stop, complete-tail and intentional-delay controls.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. Left-endpoint sampling can both miss a short refill and charge time after an early resumption. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0103)

## VF-0104

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0104) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0104)

**An interrupted safety journal write can block restoration retry.** With original power settings restored, finalization opens `restored.json` exclusively and writes the record in place. A short write or interruption after file creation can leave it undecodable. Retrying with the same valid request takes the existing-file branch and fails before it can publish restoration or permit derivation. The same writer serves claim and settlement records.

- Owners — [Exclusive writer](../../../services/tts/benchmarks/benchmark_safety.py#L95), [finalization and retry](../../../services/tts/benchmarks/benchmark_safety.py#L335) and [derivation input](../../../services/tts/benchmarks/benchmark_safety.py#L387). [ADR-0076 retry contract](../../architecture/decisions/ADR-0076-prospective-benchmark-safety-evidence.md#decision)
- Lineage — [VF-0077](#vf-0077) addresses an unsupported positive restoration assertion. [VF-0065](#vf-0065) concerns prior destructive derivation ordering. The new journal writer entered in `e85837d`. The [retry fixture](../../../services/tts/tests/test_benchmark_safety.py#L228) rejects wrong power values before opening the journal file.
- Disposition — `candidate`, P3 maintainer retry, `inspected-present` on `50f3b9e` for an interrupted write leaving a visible partial record. Restoration of actual Windows power settings and the journal's evidence are separate states. No disk or process fault was injected. [Audit][audit-2026-11-17-pass-2]
- Next check — Inject an incomplete write in disposable storage and retry finalization with unchanged evidence. Keep valid one-use claim, mismatch rejection and complete receipt immutability under the same ownership boundary.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. A partially written final journal file persists across retry even when settings actually match. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0104)

- 2026-11-23 second-pass assessment — Atomic record publication prevents the original partial `restored.json` from becoming visible on `d9a0a72`. The separate preparation problem in [VF-0147](#vf-0147) occurs before a reservation exists. [Audit][audit-2026-11-23-pass-2]

## VF-0105

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0105) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0105)

**A warm-up privacy detection can leave a passing v14 audit.** An official warm-up batch uses corpus text. If the isolated worker detects private output in this phase, it discards the diagnostics and raises `privacy`. The batch controller maps that failure to generic `generation-failed`. If the remaining evidence and derivation complete, the published privacy field can be `true` alongside failed machine conclusions.

- Owners — [Warm-up requests](../../../services/tts/benchmarks/batch_matrix.py#L90), [worker privacy detection](../../../services/tts/benchmarks/isolation.py#L228), [phase-specific failure mapping](../../../services/tts/benchmarks/batch_execution.py#L252), [audit projection](../../../services/tts/benchmarks/batch_result.py#L368) and [v14 receipt check](../../../services/tts/benchmarks/v14_authority.py#L303).
- Lineage — Warm-up variant of [VF-0073](#vf-0073). The [measured-path regression](../../../services/tts/tests/test_benchmark_batch_official.py#L275) injects a fault only after warm-up. The limited predicate accounts for the different outcome. Exact origin of the current warm-up behavior is unknown.
- Disposition — `candidate`, P3 benchmark evidence, `inspected-present` on `50f3b9e` given an isolated warm-up detection and otherwise sufficient evidence for failed-result derivation. The worker redaction path remains effective in the source trace. No disclosure or passing machine result was observed. [Audit][audit-2026-11-17-pass-2]
- Next check — Have a harmless fixture yield a privacy detection during warm-up and follow the actual safety-v1 flow through raw capture and derivation. Assert redacted diagnostics, a failed privacy audit and verified cleanup. Keep the measured and clean controls.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. The warm-up privacy error loses its typed code. The privacy field can pass while machine conclusions fail. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0105)

## VF-0106

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0106) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0106)

**Chatterbox can start while a newer compatibility check is pending.** Play passes the first fresh hardware check and awaits installed package/configuration availability. A hidden-to-visible transition begins a newer hardware check, setting status to `checking` while retaining the profile ID and language. If the package result returns while the new check is pending, the coordinator's final guard sees matching IDs and dispatches native startup using the earlier hardware decision. The newer check can later deny fresh startup.

- Owners — [Play admission](../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1969), [configuration wait and final guard](../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2011), [compatibility publication](../../../apps/desktop/src/tts/hardware-profile-compatibility.ts#L381), [visibility recheck](../../../apps/desktop/src/tts/hardware-compatibility-check-binding.ts#L22) and [native start command](../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L2104).
- Lineage — Variant of [NCC-02](../../plans/completed/narration-chatterbox-correctness.md#L18). The current visibility binding reconciles settled findings. This ordering occurs between the original gate and native dispatch during a second, unsettled observation. The [startup-gate test](../../../apps/desktop/src/tts/hardware-profile-compatibility.test.ts#L604) lowers capacity during the original fresh check. Earlier origin unknown.
- Disposition — `candidate`, P2 product admission, `inspected-present` on `50f3b9e` for the ordered window. The native configuration path still verifies the package and a later check can reconcile the current owner. No resource exhaustion, audible output or natural timing was measured. [Third audit][audit-2026-11-17-pass-3]
- Next check — Hold the package availability result after an admitted fresh check, start a real visibility-triggered recheck, and complete availability before the newer result. Verify that a denied newer result prevents native dispatch and that a valid result still permits the next explicit start. Keep already-loaded continuation distinct.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. The final Play dispatch can consume IDs retained by a newer pending hardware check. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0106)

## VF-0107

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0107) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — Git traces the current checksum publication order to `079c38e`. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0107)

**Windows evidence attachment can accept a missing or stale checksum.** Fresh build publication replaces the canonical evidence JSON and build-authority sidecar before writing the adjacent checksum. If that final write fails, the command reports failure while leaving new evidence beside an absent or older checksum. A later attachment with valid receipts for those new bytes verifies the installer and authority but can accept the package evidence with that checksum still absent or stale.

- Owners — [Fresh-build write order](../../../scripts/build-windows-release.ps1#L291), [attachment inputs](../../../scripts/build-windows-release.ps1#L169), [evidence checksum field](../../../apps/desktop/scripts/windows-release.mjs#L649) and [atomic JSON publication](../../../apps/desktop/scripts/windows-release.mjs#L801). [User checksum procedure](../../user/windows-release.md#L254)
- Lineage — Publication failure variant of [VF-0072](#vf-0072), whose original trigger is replacement of artifact bytes during build observations. The [fresh-build fixture](../../../apps/desktop/scripts/windows-release.node-test.mjs#L289) covers prepublication rejection and successful checksum output. The [attachment control](../../../apps/desktop/scripts/windows-release.node-test.mjs#L1486) verifies build-authority drift, then accepts restored authority with a synthetic checksum still present. No checksum-failure recovery is established by either check.
- Disposition — `candidate`, P2 release evidence, `inspected-present` on `50f3b9e` given a failed checksum write and otherwise valid later attachment. This leaves inconsistent on-disk release evidence. No artifact, signing or release operation ran in this audit. [Third audit][audit-2026-11-17-pass-3]
- Next check — Use disposable outputs, fail only the checksum write after successful JSON/authority staging, then attempt attachment with receipts for the exact new installer. Require a coherent checksum or rejection before positive evidence. Keep normal unsigned/signed hash binding and prior drift controls.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. A later attachment can credit otherwise matching evidence when checksum publication failed. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0107)

- 2026-11-23 second-pass assessment — Current attachment requires the exact checksum sidecar before writing evidence. The examined missing/stale checksum attachment is `inspected-absent` on `d9a0a72`. Fresh-build publication ordering remains a separate observation. [Audit][audit-2026-11-23-pass-2]

## VF-0108

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0108) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0108)

**Central-directory ordering can change ZIP compression admission.** Two individually grace-exempt compressed entries can put a central-directory prefix over the 1 MiB grace and 100:1 ratio, even though a later stored entry brings the complete archive under the limit. The inventory applies aggregate ratio during enumeration. Moving the stored entry earlier in the directory permits the otherwise identical EPUB, with the same physical entry order and initial decompression work.

- Owners — [Central enumeration](../../../packages/epub/src/archive/archive-inventory.ts#L598), [declared aggregate accounting](../../../packages/epub/src/security/processing-budget.ts#L150) and [public ingest](../../../packages/epub/src/public/open-epub-publication.ts#L137). [Budget authority](../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md#authoritative-security-budgets)
- Lineage — [M003](../../plans/completed/M003-secure-epub-ingestion-and-document-model.md#L719) distinguishes declared aggregate preflight from observed inflation. The [physical-order test](../../../packages/epub/src/archive/archive-inventory.test.ts#L171) uses small entries and the [aggregate limit test](../../../packages/epub/src/archive/archive-inventory.test.ts#L480) exceeds the complete ratio. First origin unknown.
- Disposition — `candidate`, P3 EPUB admission, `inspected-present` on `50f3b9e` for an over-limit prefix and an in-limit complete declaration. Unused compressible resources can stay out of actual inflation. This does not concern enforcement of the live decompression ratio. [Third audit][audit-2026-11-17-pass-3]
- Next check — Compare public opening for equivalent valid ZIP central record orders, keeping physical order and measured reads fixed. Require real per-entry, whole-archive and observed overflow to keep failing independently.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. Only the declaration order changes the prefix ratio. Actual read limits remain independently enforced. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0108)

## VF-0109

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0109) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — The adapter's current callback distinction dates to `86926596`. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0109)

**Empty CDATA can reject an XHTML document at its node limit.** The pinned XML parser emits an empty CDATA callback. The VoxLeaf CDATA handler charges a document node even when no text is present. Adding one empty section to a valid document at the documented exact maximum can therefore reject the EPUB while rendering and narration text are equivalent.

- Owners — [Text and CDATA event handlers](../../../packages/epub/src/xml/xml-event-reader.ts#L448), [node counter](../../../packages/epub/src/xml/xml-event-reader.ts#L313) and the [nonempty callback rule](../../plans/completed/M003-secure-epub-ingestion-and-document-model.md#L722).
- Lineage — An individual XML event-accounting case. The [exact-limit definition](../../../packages/epub/src/xml/xml-event-reader.test.ts#L426) covers elements, nonempty text, comments and processing instructions. The pinned `saxes` 6.0.0 implementation calls the CDATA handler unconditionally at section end. First origin unknown.
- Disposition — `candidate`, P3 EPUB admission at the node ceiling, `inspected-present` on `50f3b9e` against the current documented nonempty text/CDATA counting rule. No parser or browser execution supported the finding. [Third audit][audit-2026-11-17-pass-3]
- Next check — Compare exact-limit documents with and without empty CDATA. Include nonempty CDATA and the other counted event types as positive charges, and keep max-plus-one and byte/work limits enforced.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. The pinned parser emits empty CDATA and the adapter charges it against the exact ceiling. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0109)

## VF-0110

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0110) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0110)

**A warm batch boundary can lose an ampersand expansion.** The packer can finish the eighth segment immediately before an ampersand in ordinary English prose that normalized to “and.” The exact warm continuation starts at the symbol, with neither the left word nor its space available to the normalizer. It preserves `&` instead. A cold reconstruction of the same locator within the same paragraph retains that context and emits “and.”

- Owners — [Space and word recognition](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L647), [packing before symbols](../../../packages/epub/src/narration/narration-segment-packer.ts#L659), [warm source selection](../../../packages/epub/src/narration/narration-preparation.ts#L656), [returned context](../../../packages/epub/src/narration/narration-preparation.ts#L991) and [desktop batch caller](../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2110).
- Lineage — Variant of [VF-0054](#vf-0054) at a legal boundary before a lexical expansion. The earlier trigger split an expansion internally. [SAF-10](../../plans/completed/static-audit-follow-up.md#L76) preserves preceding English title context, and its [public test](../../../packages/epub/src/integration/narration-preparation-matrix.test.ts#L1182) exercises titles. Exact origin unknown.
- Disposition — `candidate`, P3 prepared-text consistency, `inspected-present` on `50f3b9e` for context-sensitive symbols at the stated cutoff. Prepared text can differ without changing the canonical source position. Model pronunciation and ordinary incidence remain open. [Third audit][audit-2026-11-17-pass-3]
- Next check — Compare one public warm batch with a fresh cold seek at its returned locator for each current profile. Preserve exact range endpoints, short/long runs, legal whitespace splits, and contexts where the symbol should remain literal.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. An eight-segment warm boundary discards left context that a cold preparation of the same locator reconstructs. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0110)

## VF-0111

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0111) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0111)

**A scene ornament can lose its silent classification across a source window.** A top-level scene paragraph starts with enough nonbreaking spaces to fill a source window, followed by `***`. The first slice advances as unspoken. The next starts at a nonzero offset, which prevents whole-paragraph scene recognition even though the preceding slice was whitespace only. Chatterbox receives the ornament as text. Piper skips it and can miss the scene pause when the following spoken unit is buffered.

- Owners — [Window progress](../../../packages/epub/src/narration/narration-preparation.ts#L945), [scene recognition](../../../packages/epub/src/narration/narration-segment-packer.ts#L768) and [Piper omission and pending scene metadata](../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2134). [Accepted normalized spacing](../../plans/completed/M005-narration-text-preparation.md#L1051)
- Lineage — Producer-side variant adjacent to [VF-0053](#vf-0053), which propagates an already classified boundary. The [SFA-01 control](../../../packages/epub/src/integration/narration-preparation-matrix.test.ts#L901) puts the large silent stretch in a separate preceding paragraph. Exact origin unknown.
- Disposition — `candidate`, P3 narration correctness, `inspected-present` on `50f3b9e` for the source-window split through a padded scene. Chatterbox pronunciation and actual pause timing were unobserved. [Third audit][audit-2026-11-17-pass-3]
- Next check — Compare short and window-spanning padding inside one scene paragraph through public preparation and the desktop caller. Preserve an ordinary paragraph, image/code/quote/list boundaries, source offsets and the absent-successor pause control.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. The source-window split defeats whole-paragraph scene recognition before profile-specific handling. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0111)

- 2026-11-23 assessment — The original whitespace-only padding trigger is `inspected-absent` on `d9a0a72`. The source guard misses a preceding omitted mark in [VF-0137](#vf-0137). [Audit][audit-2026-11-23]

## VF-0112

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0112) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0112)

**Chatterbox acquisition can follow a redirected staging directory.** If the staging parent is already a Windows junction, explicit Remove refuses it. Download setup and confirmation Cancel use a weaker cleanup guard. Cancellation can delete an existing directory reached through the junction inside the managed root. With an absent profile leaf and a junction resolving outside the root, an admitted Download can create staging outside the managed root before promotion checks containment.

- Owners — [Cleanup helper](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L823), [Download setup](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2266), [confirmation Cancel](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2440), and [Settings retry action](../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L511).
- Lineage — [DCR-19](../../plans/completed/deep-chat-audit-minimal-corrections.md#L101) guards explicit Remove with an ancestor walk. [VF-0005](#vf-0005) concerns startup and Check recovery. [VF-0087](#vf-0087) concerns installer cleanup. The [native fixture](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs#L2041) exercises Remove. Introduction unknown.
- Disposition — `candidate`, P2 filesystem ownership, `inspected-present` on `50f3b9e` for the two stated staging conditions. Existing Windows directory state and the supported Settings action are prerequisites. Host incidence and filesystem effects remain unmeasured. [Fourth audit][audit-2026-11-17-pass-4]
- Next check — With disposable directory fixtures, assert acquisition refuses invalid ancestry before deletion, creation or transfer. Cover both present and absent profile leaves, and preserve ordinary staging cleanup, explicit consent and successful retry.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. Download, confirmation Cancel and postcommit Check use the weaker staging helper. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0112)

- 2026-11-23 assessment — The examined staging paths now apply the ownership guard on `d9a0a72`. The original unsafe-path trigger is `inspected-absent`. Its distinct Check failure classification can hide cleanup, [VF-0141](#vf-0141). [Audit][audit-2026-11-23]

## VF-0113

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0113) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0113)

**An implicit paragraph can lose the language of its line break.** In a French-language chapter with Spanish normalization, the text in `<div lang="es">narra-<br/>ción.</div>` retains Spanish. Its synthesized paragraph carries French, so the line break is classified as unknown and the accepted join to `narración.` fails. An explicit Spanish paragraph supplies Spanish context for the break and the surrounding text.

- Owners — [Inherited language contract](../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md#L131), [implicit paragraph](../../../packages/epub/src/document/xhtml-projector.ts#L1411), [nearest block context](../../../packages/epub/src/document/xhtml-projector.ts#L1560), [line-break source token](../../../packages/epub/src/narration/narration-source-window.ts#L593), and [hyphenation guard](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1872).
- Lineage — Variant of [VF-0064](#vf-0064) with a different inherited property and a narration outcome. Its direction correction preserves the nearest block's direction. Normalization's accepted join is [explicitly allowlisted](../../../packages/epub/src/narration/bilingual-spanish-normalization.ts#L16). Introduction unknown.
- Disposition — `candidate`, P3 narration correctness, `inspected-present` on `50f3b9e` for the supported inherited-language case. Prepared text is the observable result. Voice pronunciation and how often a book uses this shape remain open. [Fourth audit][audit-2026-11-17-pass-4]
- Next check — Compare public preparation of implicit and explicit paragraphs with the same effective language. Preserve the source locator span, within-paragraph language overrides, code protection and a real language change across a line break.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. The frozen child erases a known provider-loss reason before verified cleanup and recovery selection. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0113)

## VF-0114

2026-11-18 follow-up. A verified local v8 package now identifies Torch-only CUDA loss during its owning Load. The native supervisor and real WebView2 reader verified containment and explicit profile recheck. Missing models retained the generic failure, and healthy Prepare reached Ready. Published v7 retains its historical protocol and distribution. [Exact host gates](../../plans/evidence/november-17-findings/execution-gates.md#follow-up-for-vf-0100-and-vf-0114) and [corrected-candidate review](../../plans/evidence/november-17-findings/implementation-review-r05.md).

2026-11-18 implementation — Partial correction for confirmed native CUDA loss. The frozen v7 producer cannot discriminate Torch-only loss. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0114) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0114)

**Chatterbox provider loss during load is reported as a warm-up failure.** After an eligible host check, the v7 child can find CUDA unavailable when it loads the model. Its generic engine failure reaches the combined Prepare operation. After successful containment, the renderer offers Restart for a warm-up failure. The recovery policy calls for profile selection or recheck for provider unavailability.

- Owners — [Frozen v7 source binding](../../../services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py#L97), [native engine failure mapping](../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1329), [native Prepare](../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1578), [renderer classification](../../../apps/desktop/src/tts/product-narration-coordinator.ts#L326), and [recovery policy](../../architecture/tts-support-matrix-v1.md#L61).
- Lineage — [CLB-03](../../plans/completed/confirmed-logic-bugfixes.md#L236) distinguishes valid operational responses from protocol rejection. The combined load/warm handling deliberately shares the restart path for generic engine failures. [VF-0106](#vf-0106) concerns a pending compatibility report before native startup. Exact origin unknown.
- Disposition — `candidate`, P3 recovery guidance, `inspected-present` on `50f3b9e` for a child reporting provider loss after admission and subsequent verified containment. Actual CUDA loss, the frequency of this transition and installed UI behavior remain unmeasured. [Fourth audit][audit-2026-11-17-pass-4]
- Next check — Through the packaged-equivalent service and desktop recovery boundary, distinguish provider loss during load from generic load/warm failure. Verify the correct explicit action after cleanup, zero automatic restarts and rejection of invalid protocol context.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. The first completed single-evaluator card can be immutable yet have no numeric evidence for one dimension. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0114)

## VF-0115

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0115) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0115)

**An accepted v6 quality scorecard can be impossible to aggregate.** The single evaluator can select `not-applicable` for an entire required dimension in the generated form. Submission returns success and writes the immutable completed card. Aggregation requires numeric data in every dimension and rejects the session. Resubmission is blocked and the supported correction changes only a meaning-change classification.

- Owners — [Evaluator form](../../../services/tts/benchmarks/quality_presentation.py#L45), [submission](../../../services/tts/benchmarks/quality.py#L524), [aggregation](../../../services/tts/benchmarks/quality_scoring.py#L75), [correction](../../../services/tts/benchmarks/quality.py#L567), and [frozen v6 scoring policy](../../../benchmarks/tts/profile-v6.json#L183).
- Lineage — [VF-0014](#vf-0014) concerns stale aggregate invalidation. [Missing-dimension coverage](../../../services/tts/tests/test_benchmark_quality.py#L1231) exercises aggregation directly. This case concerns acceptance before the completed record is locked. Introduction unknown.
- Disposition — `candidate`, P3 retained benchmark workflow, `inspected-present` on `50f3b9e` for an otherwise well-formed single-evaluator v6 card with an entirely unscored dimension. Existing published v6 evidence is outside this case. [Fourth audit][audit-2026-11-17-pass-4]
- Next check — Verify that an unscorable card is rejected before writing the completed record, then submit the corrected original evaluation and aggregate the same session. Preserve per-sample `not-applicable`, valid multi-evaluator rules and first-evaluation integrity.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. CPU derive masks lock contention in its public serializer. The quality CLI has its own intentional generic envelope. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0115)

- 2026-11-23 assessment — `inspected-absent` on `d9a0a72` for the single-evaluator v6 card with an all-N/A dimension. The retained two-candidate panel variant is [VF-0139](#vf-0139). [Audit][audit-2026-11-23]

## VF-0116

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0116) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0116)

**CPU fallback CLI loses the retryable `quality-busy` result.** The ready-session lock rejects overlapping derivation before mutation and reports `quality-busy` to the command. The CLI maps it to `invalid-request`. The documented wait-and-retry guidance is keyed to the lost result.

- Owners — [Derivation library](../../../services/tts/benchmarks/cpu_fallback_result.py#L452), [CLI serializer](../../../services/tts/benchmarks/cpu_fallback_result_cli.py#L100), and [public command](../../../package.json#L52). [ADR-0077](../../architecture/decisions/ADR-0077-exclusive-ready-quality-operations.md#L36) and the [operator procedure](../../../benchmarks/tts/README.md#L271) define the receipt.
- Lineage — Adjacent to [VF-0082](#vf-0082). The [real-process regression](../../../services/tts/tests/test_benchmark_quality.py#L815) verifies library-level rejection. The lock remains effective here. The failure is serialization above that guard.
- Disposition — `candidate`, P3 retained benchmark recovery, `inspected-present` on `50f3b9e` for an otherwise admitted derivation while the same session is busy. Runtime lock behavior was outside this pass. [Fourth audit][audit-2026-11-17-pass-4]
- Next check — Assert the documented command returns `quality-busy` and a nonzero exit while a disposable session is owned. Preserve `quality-stale`, content-free invalid-input output and winner bytes, then verify admission again after release.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. An unlink denial escapes the public command handler. The library retains aggregate ordering and supports retry. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0116)

## VF-0117

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0117) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0117)

**A failed quality correction can print a filesystem traceback.** A filesystem error while removing an existing aggregate propagates as `OSError`. The correction CLI's typed exception boundary misses it, so the command can print a traceback with a local path and fail to emit its content-free receipt. The aggregate and the opportunity to retry the correction remain intact.

- Owners — [Aggregate removal](../../../services/tts/benchmarks/quality.py#L589), [CLI dispatch and exception boundary](../../../services/tts/benchmarks/quality_cli.py#L244), and [public command](../../../package.json#L64). [Content-free CLI contract](../../architecture/decisions/ADR-0077-exclusive-ready-quality-operations.md#L36)
- Lineage — [VF-0014](#vf-0014) fixes ordering for this unlink failure. Its [library fault fixture](../../../services/tts/tests/test_benchmark_quality.py#L654) expects `OSError` and checks retained bytes. [VF-0042](#vf-0042) covers setup error handling under a different command. Introduction unknown.
- Disposition — `candidate`, P3 retained benchmark failure reporting, `inspected-present` on `50f3b9e` when unlink fails in a valid v6 correction. No actual path disclosure or external transfer was observed. [Fourth audit][audit-2026-11-17-pass-4]
- Next check — Inject a denied unlink at the command boundary in a disposable session. Assert a fixed failure receipt, no path in CLI output, intact aggregate and no published correction. Clear the fault and verify one successful correction and fresh aggregation.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. The diagnosed oversized profile value cannot be written after otherwise eligible activation stops Piper. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0117)

- 2026-11-23 assessment — `inspected-absent` on `d9a0a72` for the correction command's aggregate deletion error. The CLI catches `OSError` in that command. The separate cleanup command is [VF-0140](#vf-0140). [Audit][audit-2026-11-23]

## VF-0118

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0118) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — NSL-01's known-impossible preflight criterion applies to the omitted over-limit state. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0118)

**An over-limit saved profile can stop playback before Chatterbox activation fails.** Compatibility exposes the already-detected `over-limit` preference as writable. A host compatible with Piper and installed Chatterbox can use Piper and show an enabled Activate Chatterbox action. Selection verifies the package and contains Piper before the reversible preference write refuses the same oversized value. Playback stops and the profile change fails.

- Owners — [Compatibility state](../../../apps/desktop/src/tts/hardware-profile-compatibility.ts#L620), [Activate admission](../../../apps/desktop/src/settings/ReaderSettingsDialog.tsx#L250), [configuration action](../../../apps/desktop/src/settings/narration-settings-actions.ts#L82), and [reversible write](../../../apps/desktop/src/persistence/hardware-profile-preference.ts#L197).
- Lineage — [NSL-01](../../plans/completed/narration-settings-lifecycle-corrections.md#L47) requires known impossible activation to fail before teardown. The [existing rejection matrix](../../../apps/desktop/src/settings/narration-settings-actions.test.ts#L282) includes future-version and unavailable storage. The over-limit read and save decisions are exercised separately. Exact introduction unknown.
- Disposition — `candidate`, P2 playback interruption and profile admission, `inspected-present` on `50f3b9e` with protected oversized stored data, compatible profiles and working Piper. The current writer's normal production of such stored data and incidence on actual hosts remain unestablished. [Fifth audit][audit-2026-11-17-pass-5]
- Next check — Exercise installed Activate while Piper plays with an existing over-limit preference. Keep the oversized bytes and current playback intact. Check the rejection feedback, a valid activation and an intentionally recoverable stored value.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. Supported auxiliary and raster manifest paths also reach the rejecting projection, even when unvisited. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0118)

## VF-0119

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0119) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0119)

**A chapter filename containing `#` can prevent a book from opening.** The OCF parser maps `part%231.xhtml` to the local archive member `part#1.xhtml`. The manifest and spine accept this member, then the BookV1 projection passes the decoded path into a schema that rejects `#`. Opening reports a malformed package before building the reader's locators. EPUB 3.3 permits this filename and an escaped URL path.

- Owners — [OCF reference parsing](../../../packages/epub/src/paths/ocf-reference.ts#L85), [manifest lookup](../../../packages/epub/src/package/package-document.ts#L379), [BookV1 projection](../../../packages/epub/src/book/book-v1-projection.ts#L101), and [shared path schema](../../../packages/shared/schemas/book/v1.schema.json#L106). [EPUB 3.3 filename rules](https://www.w3.org/TR/epub-33/#sec-container-filenames)
- Lineage — [SAC-13 public coverage](../../../packages/epub/src/public/open-epub-publication.test.ts#L653) exercises encoded punctuation in fragments. [OCF path coverage](../../../packages/epub/src/paths/ocf-reference.test.ts#L14) exercises a different percent-encoded filename. This case concerns a supported archive member that cannot cross the BookV1 boundary. The precise review escape is unknown.
- Disposition — `candidate`, P2 EPUB opening failure, `inspected-present` on `50f3b9e` for a valid local member with a literal `#` and a percent-encoded package reference. Incidence in user books remains unknown. [Fifth audit][audit-2026-11-17-pass-5]
- Next check — Use the public opener with an escaped name and a separate chapter-fragment target. Verify navigation and exact-byte reopen, and preserve the published schema and rejection of real URL fragments, separators and unsafe paths at the appropriate boundaries.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. Raw XML ID spelling affects both fragment lookup and normalized duplicate detection. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0119)

- 2026-11-23 assessment — `inspected-absent` on `d9a0a72` for the examined percent-encoded hash filename. The BookV1 projection aliases decoded hashes. A filename beginning with a nonbreaking space follows [VF-0134](#vf-0134). [Audit][audit-2026-11-23]

## VF-0120

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0120) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0120)

**A padded `xml:id` can send navigation to chapter start.** The projector's supported `xml:id` path retains `xml:id=" note "` verbatim. A link to `#note` cannot find that raw key, so the reader uses the missing-fragment recovery to the first block instead of the later destination. XML ID processing normalizes surrounding space before assigning the ID.

- Owners — [XML attribute bridge](../../../packages/epub/src/xml/xml-event-reader.ts#L215), [source-ID comparison](../../../packages/epub/src/document/xhtml-projector.ts#L256), [fragment lookup](../../../packages/epub/src/locator/target-resolver.ts#L280), and [reader target handling](../../../apps/desktop/src/reader/reader-navigation.ts#L273). [XML ID processing](https://www.w3.org/TR/xml-id/#processing)
- Lineage — [ADR-0007](../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md#L167) admits unique `xml:id` values. Existing [projector fixtures](../../../packages/epub/src/document/xhtml-projector.test.ts#L498) exercise unpadded and conflicting source identities. SAC-13 covers the decoded link fragment. The review escape is unknown.
- Disposition — `candidate`, P3 EPUB navigation, `inspected-present` on `50f3b9e` for the repository's supported XML ID compatibility path. The resolved logical destination follows from source. Actual host positioning and natural occurrence remain open. [Fifth audit][audit-2026-11-17-pass-5]
- Next check — Compare an XML-space-padded ID with an unpadded one through public navigation and same-byte reopen. Preserve literal XHTML `id` behavior, duplicate IDs that become equal after normalization, and recovery for a genuinely missing target.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. The static handler gap is established. Routing of the next Escape after replacement in the installed WebView2 needs a keyboard-only witness. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0120)

## VF-0121

2026-11-18 implementation — `reproduced` on installed Windows. The same trusted Escape reached the page body on both artifacts. After the fix it closed Settings once and restored focus to the opener. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0121) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0121)

**Replacing a focused Settings action can leave Escape unhandled.** Activating Review Chatterbox download by keyboard can replace the focused button with a confirmation while Settings stays open. When the browser resets focus to the viewport, the modal has no focused descendant. Its outside-focus listener covers `focusin`, and its Escape handler is attached to the dialog. Escape can miss the dialog until focus returns.

- Owners — [Conditional package actions](../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L399), [modal focus containment](../../../apps/desktop/src/settings/ReaderSettingsDialog.tsx#L295), and [Escape handler](../../../apps/desktop/src/settings/ReaderSettingsDialog.tsx#L348). [Interaction requirement](../../product/reader-settings-and-playback-controls.md#L601) · [Browser focus behavior](https://developer.mozilla.org/en-US/docs/Web/API/Element/blur_event)
- Lineage — [R8-06](../../plans/completed/eight-revalidated-findings-minimal-corrections.md#L109) and its [component control](../../../apps/desktop/src/settings/ReaderSettingsDialog.test.tsx#L725) cover an outside element actively taking focus. [H7](../../plans/completed/validated-audit-follow-up.md#L60) covers Tab wrapping over `summary`. This case begins when the focused descendant is retired.
- Disposition — `candidate`, P3 keyboard accessibility, `inspected-present` on `50f3b9e` conditional on viewport focus reset during the documented action replacement. Exact WebView2 delivery and customer frequency remain unmeasured. [Fifth audit][audit-2026-11-17-pass-5]
- Next check — From an eligible Settings confirmation, observe focus after the action changes and press Escape without pressing Tab first. Check close and trigger focus, normal Tab wrapping, and the explicit narration-focus containment controls.

- 2026-11-17 deep review — `inspected-inconclusive` on `50f3b9e`. The settled failure can reissue the warning and save after a successful explicit 100% selection. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0121)

- 2026-11-23 assessment — Original Escape failure is `inspected-absent` on `d9a0a72` for the action-replacement sequence. The document handler receives Escape even when focus returns to the body. Focus containment waits for the next `focusin`, leaving the observed focus-loss scenario's next Tab outcome unresolved. [Audit][audit-2026-11-23]

## VF-0122

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0122) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0122)

**A stale fallback warning can follow an explicit selection of 1×.** A slow-rate preparation failure changes the player to 1× and increments its fallback count. The listener chooses 1× with the speed control before the coordinator consumes the count. The explicit selection clears the warning, but the next tick interprets the same numeric rate as proof that the older fallback still owns it. The coordinator shows the warning again and issues a duplicate save.

- Owners — [Speed control](../../../apps/desktop/src/tts/ProductNarrationControls.tsx#L205), [explicit selection](../../../apps/desktop/src/tts/product-narration-coordinator.ts#L758), and [fallback observation](../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2252).
- Lineage — [RCF-19](../../plans/completed/revalidated-chat-findings-minimal-corrections.md#L301) requires a newer 100% choice to win. The [existing player fixture](../../../apps/desktop/src/tts/pcm-playback.test.ts#L1554) changes the choice before the asynchronous failure settles. The [coordinator fixture](../../../apps/desktop/src/tts/product-narration-coordinator.test.ts#L700) consumes the failure before the later action. [VF-0102](#vf-0102) concerns a different paused-final state and the stored speed itself.
- Disposition — `candidate`, P3 stale playback feedback, `inspected-present` on `50f3b9e` for failure settlement followed by explicit selection before the next observation. The chosen rate remains 1×. The host timing window remains unmeasured. [Fifth audit][audit-2026-11-17-pass-5]
- Next check — Hold the observation until after the user's 1× selection. Verify uninterrupted current playback, one explicit preference write, and accurate feedback. Retain the genuine fallback and Stop/replacement controls.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. Refill during probes can vanish from the timing. Successive depletions may pair different intervals. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0122)

## VF-0123

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0123) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — The historical M010.1 measurement used this sample ordering. Its exact timing error is unknown. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0123)

**Native refill wall timing starts after resource sampling.** The native adaptive runner sees buffering, awaits process working-set and GPU observations, then marks the start of the refill interval. Playback may resume during those probes. The reported `refillMs` and `bufferingObservationWallMs` can omit most of the observed interval. The product's separate buffering counters are collected independently.

- Owners — [Depletion observation](../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L982), [resource probes and timer](../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L1882), and [published measurements](../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L2380). [Refill wall-time claim](../../plans/completed/M010-001-bilingual-narration-and-candidate-screening.md#L641)
- Lineage — [VF-0103](#vf-0103) concerns the product accumulator. The exact-host runner independently derives elapsed observation time. Its timing begins after recorded depletion. No prior reported value was revalidated.
- Disposition — `candidate`, P3 native evidence accuracy, `inspected-present` on `50f3b9e` when refill overlaps the resource probes. Timing and frequency on actual devices remain open. [Fifth audit][audit-2026-11-17-pass-5]
- Next check — In the runner, allow observed buffering to resolve while resource probes are outstanding. Assert the observation begins with depletion and ends at the resumption witness, keeping the stable/no-depletion and product-counter paths distinct.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. Completion before Stop still meets cleanup conditions and lacks a same-request active cancellation witness. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0123)

## VF-0124

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0124) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0124)

**Native active-cancellation evidence can credit a Stop after generation completes.** The runner polls `generating`, then separately locates and activates Stop. Generation can finish between those actions. The idle, zero-retention, highlight and checkpoint observations can pass even though no generation was active at Stop. The runner still publishes active-cancellation timing.

- Owners — [Native adaptive active-cancellation arm](../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L1942) and [command mapping](../../../apps/desktop/package.json#L19). [Exact-host evidence table](../../plans/completed/M010-001-bilingual-narration-and-candidate-screening.md#L632)
- Lineage — [VF-0091](#vf-0091) concerns a separate Python benchmark's queued request. The [model-free native probe](../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L3365) checks a terminal cancellation result. The adaptive arm currently checks post-Stop cleanup and intentionally accepts a safe preview or checkpoint.
- Disposition — `candidate`, P3 native evidence completeness, `inspected-present` on `50f3b9e` if natural completion wins before input delivery. The cleanup observations retain their meaning. No historical false pass or product Stop failure was established. [Fifth audit][audit-2026-11-17-pass-5]
- Next check — In a disposable evidence fixture, distinguish an owned request still in flight at Stop from completion first. Require request-owned cancellation evidence for the active arm and retain ordinary Stop and cleanup checks.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. The timers can pass an ignored or late scale change. Separate functional coverage has no same-run timestamp. [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0124)

## VF-0125

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0125) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

2026-11-17 reconciliation — `inspected-present` on `50f3b9e` under the stated trigger. [Prior scope, risks and proposed checks](audits/2026-11-17-findings-reconciliation.md#vf-0125)

**Reader reflow benchmarks time frame callbacks without observing realignment.** The packaged native benchmark dispatches a text scale change and records the time to three animation frames. The Chromium production benchmark uses two frames. Both can publish a passing timing if the preference was ignored, or if measured placement remained pending beyond those callbacks.

- Owners — [Native timer and threshold](../../../apps/desktop/scripts/native-smoke/reader-scenarios.mjs#L1182), [Chromium timer](../../../apps/desktop/tests/browser/reader-performance.benchmark.spec.ts#L898), and [reflow and realignment budget](../../architecture/performance-budget.md#L76).
- Lineage — [M004 Task 5.4](../../plans/completed/M004-reflowable-visual-reader-and-position-restoration.md#L1028) promises performance/resource observations. Separate reader interaction checks exercise functional reflow. The timers accept a fixed frame count without tying it to the measured operation's success.
- Disposition — `candidate`, P3 benchmark evidence completeness, `inspected-present` on `50f3b9e` for an ignored or late preference operation. Current renderer correctness and historical measurement values were outside this inference. [Fifth audit][audit-2026-11-17-pass-5]
- Next check — Establish a pre-change reading-line target. Time the applied change through observed placement at that target, using a bounded wait. The same check should reject a no-op and detect completion past the threshold.

- 2026-11-17 deep review — `inspected-present` on `50f3b9e`. undefined [Verdict and evidence](audits/2026-11-17-deep-findings-validation.md#vf-0125)

## VF-0126

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0126) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

**Chatterbox can fail before speech after a long silent prefix.** A supported current Chatterbox passage can begin with 320 nonbreaking spaces followed by one spoken character. The first candidate that contains speech spans 321 source positions. All the earlier candidates are silent and the profile's hard bound is 320. When no candidate fits, the packer drains safe leading omissions only for the Piper v2 policy. Public Chatterbox preparation therefore returns a resource-limit failure before synthesis.

- Disposition — `candidate`, P2. Latest check on 2026-11-17, `main` at `50f3b9e`, `inspected-present`. Current evidence is static. [Chatterbox limit](../../../packages/epub/src/narration/narration-chatterbox-policy.ts#L8) · [candidate selection](../../../packages/epub/src/narration/narration-segment-packer.ts#L597)
- Prior scope and next check — CFR-20 fixed this trigger for Piper in VF-0020. VF-0052 covers Piper formatting marks. Preserve both earlier controls and both profiles' hard limits. Compare 319 and 320 spaces before the same character, an entirely silent leaf, a substantive protected unit, and the returned source offset after draining. [Full assessment](audits/2026-11-17-deep-findings-validation.md#vf-0126)

## VF-0127

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0127) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

**A known oversized language preference can interrupt narration.** The language repository recognizes an over-limit value and supplies the default language. The hardware snapshot still calls language persistence available and the Settings fieldset remains enabled. Selecting another language stops active Piper before the writer rejects the same bytes. The old language survives and the user has to start narration again.

- Disposition — `candidate`, P3. Latest check on 2026-11-17, `main` at `50f3b9e`, `inspected-present`. Current evidence is static. [stored state](../../../apps/desktop/src/persistence/narration-language-preference.ts#L102) · [capability](../../../apps/desktop/src/tts/hardware-profile-compatibility.ts#L637)
- Prior scope and next check — This is a different key, control and action from VF-0118. The source proves avoidable teardown under an already-known rejection. Preserve the default language and existing stored bytes, valid language changes, contained teardown on a real change and the documented best-effort cross-key Reset. [Full assessment](audits/2026-11-17-deep-findings-validation.md#vf-0127)

## VF-0128

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0128) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

**An explicitly foreign line break can permit a Spanish word join.** In an explicit Spanish paragraph an author can put a different language on the break or on a flattened span surrounding just the break. The projector computes the new context but emits a contextless break. Narration gives that break the paragraph language. Two Spanish word fragments on either side can now pass the same-language guard and be incorrectly joined.

- Disposition — `candidate`, P3. Latest check on 2026-11-17, `main` at `50f3b9e`, `inspected-present`. Current evidence is static. [inheritance contract](../../../docs/architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md#L133) · [break construction](../../../packages/epub/src/document/xhtml-projector.ts#L959)
- Prior scope and next check — VF-0113 suppresses a valid join through the synthesized paragraph. This variant can create an invalid join even with an explicit paragraph. Preserve the break's effective language through projection and source traversal, its one-position width and locator ranges. Compare a break with inherited Spanish, an explicit foreign break and a flattened foreign span. [Full assessment](audits/2026-11-17-deep-findings-validation.md#vf-0128)

## VF-0129

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0129) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

**v6 calls a multi-evaluator quality session eligible.** The public finalizer accepts one through eight evaluators for a staged v6 session. It consumes staging, makes the session ready and reports promotion eligibility for any count of at least one. With two complete numeric cards the aggregator repeats that eligibility. The frozen v6 derivation requires exactly one and rejects the result. An operator who follows the documented one-evaluator instruction avoids the discrepancy.

- Disposition — `candidate`, P3. Latest check on 2026-11-17, `main` at `50f3b9e`, `inspected-present`. Current evidence is static. [v6 authority](../../../benchmarks/tts/profile-v6.json#L185) · [finalizer](../../../services/tts/benchmarks/quality.py#L372)
- Prior scope and next check — Distinct from VF-0115's score coverage. The mistaken input can be detected before moving any staged audio. Check a v6 count of two at finalization, a subsequent one-evaluator submission using the same staging, and a legitimate multi-evaluator legacy session. Existing frozen results are outside this trigger. [Full assessment](audits/2026-11-17-deep-findings-validation.md#vf-0129)

## VF-0130

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0130) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

**Malformed preflight fields can bypass the CLI failure receipt.** In an otherwise correctly shaped v6 assess or derive request, a non-string candidate ID raises the shared preflight parser's `CommandError` before host observation. The CPU CLI catches its own command/result error types and misses this one. Quality generate likewise calls the shared parser before its worker error boundary. These configured commands can emit a Python traceback and omit their fixed JSON error receipt.

- Disposition — `candidate`, P3. Latest check on 2026-11-17, `main` at `50f3b9e`, `inspected-present`. Current evidence is static. [configured entry points](../../../package.json#L51) · [shared exception](../../../services/tts/benchmarks/cli.py#L94)
- Prior scope and next check — VF-0116 concerns a valid busy result after admission. VF-0117 concerns filesystem denial during an admitted correction. This case needs neither a retained session nor a working model. Translate the known parser error at each public boundary, preserve `quality-stale` and busy semantics, and check the JSON, exit code and stderr for both valid outer shapes with the wrong inner type. [Full assessment](audits/2026-11-17-deep-findings-validation.md#vf-0130)

## VF-0131

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0131) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

**Quick-start lead is sampled after playback starts.** The host runner waits for Playing, separately waits for a highlight transition, then reads `data-narration-playable-ms`. The attribute exposes the scheduler's current effective listening duration. Consumption can lower it and newly accepted generation can raise it before the sample. The output labels that value `playableLeadAtStartMs`. A positive-value assertion cannot demonstrate the lead at start.

- Disposition — `candidate`, P3. Latest check on 2026-11-17, `main` at `50f3b9e`, `inspected-present`. Current evidence is static. [live duration](../../../apps/desktop/src/tts/adaptive-preparation.ts#L315) · [DOM value](../../../apps/desktop/src/tts/ProductNarrationControls.tsx#L88)
- Prior scope and next check — VF-0103 and VF-0123 measure refill duration. Define the intended start event, capture the same run's lead at that event or label the sample with its actual timing. Vary consumption and intervening generation independently. The existing start command-to-audible observation has a different owner. [Full assessment](audits/2026-11-17-deep-findings-validation.md#vf-0131)

## VF-0132

2026-11-18 implementation — `reproduced` for the scoped case, with the correction and current host checks recorded. [Case witness and limitations](../../plans/evidence/november-17-findings/implementation-cases.md#vf-0132) · [Current implementation review](../../plans/evidence/november-17-findings/implementation-review-r03.md)

**Graceful shutdown can accept invalid trailing protocol output.** Protocol v1 requires a whole active request to fail on extra or truncated records. Native graceful shutdown accepts the expected two state records, waits for process exit and returns those records without establishing that stdout ended cleanly. A faulty producer can therefore receive a successful graceful-shutdown result at the consumer. The ordinary pinned service produces the expected ending.

- Disposition — `candidate`, P3. Latest check on 2026-11-17, `main` at `50f3b9e`, `inspected-present`. Current evidence is static. [protocol rule](../../../docs/architecture/tts-service-protocol-v1.md#L76) · [shutdown command](../../../docs/architecture/tts-service-protocol-v1.md#L93)
- Prior scope and next check — Promoted from one of the six observations. DCR-12 checked the separate Node host. Keep graceful frame validation bounded by the shutdown deadline and record process containment independently. Compare clean EOF with a faulty terminal stream after the expected pair. Whether every nonzero exit must itself invalidate a valid pair is a separate contract question. [Full assessment](audits/2026-11-17-deep-findings-validation.md#vf-0132)

- 2026-11-23 third-pass assessment — `inspected-absent` on `d9a0a72` for the original trailing-frame shutdown trigger. Current graceful shutdown requires terminal output closure and sends invalid output through containment. Clean EOF with a nonzero process exit remains a separate policy question. [Audit][audit-2026-11-23-pass-3]

## VF-0133

- PR #332 CI follow-up — The B07 concurrent-cleanup regression exercises a Download carrying the confirmation that Cancel just retired. [CI evidence](../../plans/evidence/november-23-findings/ci-follow-up.md)

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. A stale Download now needs the native confirmation identity shown for that click. The replacement confirmation survives and a fresh click can transfer. [Owner checks and limits](../../plans/evidence/november-23-findings/native-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0133)

**A cancelled Download can borrow the next Chatterbox confirmation.** On a compatible host, if the first native Download waits before capturing confirmation identity, Cancel can clear the first confirmation and Review can create another. The old request can capture that new identity and begin the transfer without a second Download click.

- Owners — [Renderer request and cancellation](../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L309), [native blocking handoff](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2793), and [confirmation capture](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2282).
- Lineage — [RAF-16](../../plans/completed/residual-audit-corrections.md#L230) guards replacement after Download captures confirmation identity. [U8/2.1](../../plans/completed/five-pass-audit-revalidation-and-corrections.md#u8-optional-package-action-ownership--21-22-add-01) protects same-operation reselection, and [VF-0095](#vf-0095) covers Cancel after commit. The pre-capture ordering was already possible when RAF-16 landed in `5e4c44b`. First introduction and natural incidence are unknown.
- Disposition — `candidate`, P2, `inspected-present` on clean `main` at `d9a0a72` on 2026-11-23. [Audit and next check][audit-2026-11-23] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0133)

## VF-0134

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. The public opener assigns an alias to an admitted wire-incompatible archive key. A conflicting name, TOC activation and exact reopen are covered. [Owner checks and limits](../../plans/evidence/november-23-findings/epub-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0134)

**A leading nonbreaking space in a chapter filename can prevent opening.** The archive and manifest accept a root-level filename beginning with U+00A0 when referenced by its percent-encoded URL. The projection leaves the decoded filename unchanged. The BookV1 resource path rejects edge whitespace, and opening reports a malformed package.

- Owners — [BookV1 projection](../../../packages/epub/src/book/book-v1-projection.ts#L119), [resource-path contract](../../../packages/shared/schemas/book/v1.schema.json#L106), and [public opening](../../../packages/epub/src/public/open-epub-publication.ts#L155). [EPUB filename rules](https://www.w3.org/TR/epub-33/#sec-container-filenames)
- Lineage — [VF-0119](#vf-0119) aliases hash-bearing names and covers collision avoidance. This filename has no hash. [VF-0047](#vf-0047) concerns text labels. Introduction unknown.
- Disposition — `candidate`, P2, `inspected-present` on clean `main` at `d9a0a72` on 2026-11-23. [Audit and next check][audit-2026-11-23] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0134)

## VF-0135

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. The projector preserves a block-wrapping local link’s readable descendants and keeps its neighboring inline link interactive. Chromium exercised activation. [Owner checks and limits](../../plans/evidence/november-23-findings/epub-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0135)

**An internal link wrapping a paragraph can prevent opening.** A local anchor with a valid target can wrap a paragraph in XHTML. Its projector installs an inline collector, then rejects the paragraph because it needs a block collector. The public opener fails the publication.

- Owners — [Local-link collector](../../../packages/epub/src/document/xhtml-projector.ts#L1321), [block requirement](../../../packages/epub/src/document/xhtml-projector.ts#L1609), and [public projection](../../../packages/epub/src/public/open-epub-publication.ts#L82). [HTML anchor content model](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element)
- Lineage — [VF-0004](#vf-0004) covers external or no-href inert wrappers, which use the transparent path. The earlier correction explicitly excluded arbitrary active internal block anchors. The product should decide whether to preserve the wrapper as inert or support block-link interaction. Introduction unknown.
- Disposition — `candidate`, P2, `inspected-present` on clean `main` at `d9a0a72` on 2026-11-23. [Audit and next check][audit-2026-11-23] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0135)

## VF-0136

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. A focused publication link permits measured PageDown navigation after Stop. Chromium checked movement, the saved position after reopen and neighboring link activation. The native observer requires trusted movement and rejects a stationary event. [Owner checks and limits](../../plans/evidence/november-23-findings/reader-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0136)

**PageDown from a focused inline link can leave an old checkpoint.** After Stop, a focused in-book link is a button. When the browser scrolls the reading viewport on unmodified PageDown, the reader's button filter leaves that gesture unattributed. The measured-manual gate retains the heard checkpoint and reopening can return to that older location.

- Owners — [Link button](../../../apps/desktop/src/reader/SemanticDocument.tsx#L212), [reading-key filter](../../../apps/desktop/src/reader/ReaderPublication.tsx#L1341), and [save gate](../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L225).
- Lineage — [VF-0063](#vf-0063) covers keyboard modifiers. [VF-0003](#vf-0003) covers the general absent-placement recovery. The earlier button control covers Space activation. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` for the application-side sequence on clean `main` at `d9a0a72` on 2026-11-23, conditional on actual viewport movement in the host. [Audit and next check][audit-2026-11-23] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0136)

## VF-0137

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. Bounded long-ornament recognition handles the same omitted formatting marks as normalization. Both mutable profiles preserve the real next locator. [Owner checks and limits](../../plans/evidence/november-23-findings/epub-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0137)

**An omitted formatting mark can defeat long scene-break recognition.** U+200B before a window-spanning run of nonbreaking spaces and a scene ornament causes the raw whole-leaf scanner to reject the marker. Normalization discards U+200B. The later nonzero-offset suffix loses scene classification, so Chatterbox can receive the punctuation as narration and Piper can lose the scene transition.

- Owners — [Whole-leaf recognition](../../../packages/epub/src/narration/narration-preparation.ts#L636), [formatting omission](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L2071), and [normalized scene recognition](../../../packages/epub/src/narration/narration-segment-packer.ts#L768).
- Lineage — [VF-0111](#vf-0111) covers the plain whitespace-padded ornament. Its landed fixture lacks an omitted format character. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` on clean `main` at `d9a0a72` on 2026-11-23. Physical audio output is unmeasured. [Audit and next check][audit-2026-11-23] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0137)

## VF-0138

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. The refill interval stays open through rate preparation until matching rendered output. Rate fallback and successful selection preserve one correctly measured wait. [Owner checks and limits](../../plans/evidence/november-23-findings/playback-handoff-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0138)

**Refill timing can end while playback-rate preparation is pending.** After depletion at 1×, selecting an unprepared 0.75× can make 45 seconds of source audio meet the 60-second listening threshold. The scheduler records a completed refill before the player can start a successor. If the rate returns to 1× first, another refill index starts and the wait between thresholds is omitted from the playback buffering metric.

- Owners — [Scheduler timing](../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1077), [device start gate](../../../apps/desktop/src/tts/pcm-playback.ts#L220), and [published counters](../../../apps/desktop/src/tts/ProductNarrationControls.tsx#L94).
- Lineage — The [VF-0066](#vf-0066) fixture covers the order and absence of early allocation. [VF-0103](#vf-0103) covers skipped polling intervals. [VF-0123](#vf-0123) added the indexed receipt in `d9a0a72`, which ends before the delayed preparation completes. The rate fixture does not advance the clock during pending preparation or assert these metrics.
- Disposition — `candidate`, P3, `inspected-present` on clean `main` at `d9a0a72` on 2026-11-23. [Audit and next check][audit-2026-11-23] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0138)

## VF-0139

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. The last immutable evaluator card now passes the real per-candidate scoring rules before publication. Complementary scores, corrected retry, aggregate and duplicate rejection were exercised. [Owner checks and limits](../../plans/evidence/november-23-findings/tools-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the final incomplete panel in retained v2 and v3. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0139)

**Retained quality evaluation can accept an unaggregatable panel.** The scorecard form permits an evaluator to use `not-applicable` for an entire candidate dimension. In a retained two-candidate session, acceptance can lock every completed card even when one candidate has no numeric value for a required dimension. Aggregation rejects the resulting panel, resubmission is blocked and the correction command cannot change scores.

- Owners — [Scorecard form](../../../services/tts/benchmarks/quality_presentation.py#L45), [immutable submission](../../../services/tts/benchmarks/quality.py#L510), [per-candidate scoring](../../../services/tts/benchmarks/quality_scoring.py#L40), and [retained v2 workflow](../../../benchmarks/tts/README.md#L716).
- Lineage — [VF-0115](#vf-0115) now checks numeric coverage for the one-candidate v6 session. Retained comparison requires coverage by candidate across the panel. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` on clean `main` at `d9a0a72` on 2026-11-23. [Audit and next check][audit-2026-11-23] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0139)

## VF-0140

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. The quality cleanup CLI emitted its bounded JSON failure on early and partial deletion errors. The same session retried and the unrelated marker survived. [Owner checks and limits](../../plans/evidence/november-23-findings/tools-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0140)

**Failed quality cleanup can omit its JSON failure receipt.** If filesystem deletion of a disposable quality session raises `OSError`, the public cleanup command lets it escape the typed CLI handler. The operator can receive a traceback containing a local path and no structured failure. Private files can remain after a partial deletion.

- Owners — [Owned deletion](../../../services/tts/benchmarks/quality.py#L733), [cleanup command and envelope](../../../services/tts/benchmarks/quality_cli.py#L273), and [content-free CLI policy](../../architecture/decisions/ADR-0077-exclusive-ready-quality-operations.md#decision).
- Lineage — [VF-0117](#vf-0117) protects the correction command's aggregate invalidation. This failure is in the explicit session cleanup command. The similarly named R8-02 fixture covers adapter close. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` on clean `main` at `d9a0a72` on 2026-11-23 following a deletion error. Host error incidence is unmeasured. [Audit and next check][audit-2026-11-23] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0140)

## VF-0141

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. Settings can retry Check after a post-promotion staging fault. Controlled acquisition and mounted client tests retain the verified installation through recovery. [Owner checks and limits](../../plans/evidence/november-23-findings/native-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0141)

**A staging failure can hide verified Chatterbox cleanup.** During an explicit Check after promotion and cleanup failure, the installed package can verify while the staging ancestry check fails. Native preserves the cleanup receipt but returns generic `tts-optional-profile-invalid`. Settings presents Review Download as the next action. Choosing Review replaces the receipt, even if the staging issue has been resolved and Check could have finished cleanup.

- Owners — [Cleanup retry and classification](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2076), [consent replacement](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2237), and [Settings next action](../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L524).
- Lineage — [VF-0043](#vf-0043) classifies failed verification of the installed package itself. [VF-0112](#vf-0112) added shared staging-ancestry enforcement. Its [native guard fixture](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs#L2114) retries Check directly after removing the blocker, without exercising Settings. A fresh Download still requires consent. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` on clean `main` at `d9a0a72` on 2026-11-23. [Audit and next check][audit-2026-11-23] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0141)

## VF-0142

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. Deep destination identity survives appearance reflow while the target is unmounted. The mounted test covers settlement, fresh Play and the neighboring unavailable route. [Owner checks and limits](../../plans/evidence/november-23-findings/reader-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0142)

**Appearance changes can settle a chapter jump before its target renders.** Navigate to a late fragment in a progressively rendered chapter, then change appearance while its ref is absent. The appearance effect starts a 12-frame restoration budget immediately. If the ref is still absent when the budget expires, ordinary TOC navigation can report settled, save the target and release the Play gate before the reader displays it.

- Owners — [Appearance effect](../../../apps/desktop/src/reader/ReaderPublication.tsx#L1046), [geometry deadline](../../../apps/desktop/src/reader/reader-reflow-restoration.ts#L424), [settlement](../../../apps/desktop/src/reader/ReaderPublication.tsx#L728), and [save consumer](../../../apps/desktop/src/App.tsx#L731).
- Lineage — Adjacent to [VF-0026](#vf-0026) and [VF-0029](#vf-0029). The mounted-target reflow fixture misses a target that still needs more than 12 frames to materialize. Introduction unknown.
- Disposition — `candidate`, P2, `inspected-present` on `main` at `d9a0a72` on 2026-11-23, conditional on the appearance event during materialization. [Audit and next check][audit-2026-11-23-pass-2] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0142)

## VF-0143

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. A trusted wheel against the scroll boundary no longer gives later restoration scroll ownership. Chromium retained the exact saved offset and still records genuine manual movement. [Owner checks and limits](../../plans/evidence/november-23-findings/reader-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0143)

**A wheel gesture at the scroll boundary can misattribute restoration movement.** Wheel upward at the top while saved-position restoration is pending. If the gesture moves nothing and the app scrolls down to restore the target while the intent is still armed, the viewport marks the app's scroll as measured manual movement. The next caret sample can replace the saved interior offset.

- Owners — [Wheel intent](../../../apps/desktop/src/reader/ReaderPublication.tsx#L367), [restoration scroll](../../../apps/desktop/src/reader/reader-reflow-restoration.ts#L440), [movement admission](../../../apps/desktop/src/reader/active-visual-locator.ts#L429), and [protected placement](../../../apps/desktop/src/reader/active-visual-locator.ts#L649).
- Lineage — Adjacent to [VF-0017](#vf-0017), [VF-0029](#vf-0029) and [VF-0074](#vf-0074). [VF-0136](#vf-0136) loses a manual signal. Here an application-owned scroll gains one. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` for the code sequence on `main` at `d9a0a72` on 2026-11-23. Native timing and exact geometry remain open. [Audit and next check][audit-2026-11-23-pass-2] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0143)

## VF-0144

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. WSOLA terminal-overlap handling preserves the final source signal at all five slow rates. The user heard all three synthetic audition endings with no obvious click or pitch jump. [Owner checks and limits](../../plans/evidence/november-23-findings/playback-handoff-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0144)

**Slowed playback can drop the end of a PCM unit.** For valid 24,038-frame PCM at 0.95×, the last 135 source frames are outside the range of every output grain with nonzero weight. A signal confined to those frames is discarded while the completion message credits the full source unit.

- Owners — [Worklet grain selection](../../../apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.ts#L245), [completion](../../../apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.ts#L358), and [Web Audio consumer](../../../apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts#L500).
- Lineage — [NLC-01](../../plans/completed/narration-logic-corrections.md#2-nlc-01-preserve-source-progression-in-wsola) corrected cumulative backwards drift. The current late-signal fixture leaves the final 1,000 input frames silent. This case follows from grain bounds and target truncation. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` by arithmetic on `main` at `d9a0a72` on 2026-11-23. No audible speech loss or host incidence established. [Audit and next check][audit-2026-11-23-pass-2] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0144)

## VF-0145

- 2026-11-23 follow-up on `d9a0a72` plus the working patch — `fixed` under the newly approved policy. The EPUB 3 navigation parser prefers a usable title on a hidden label root and otherwise reads the bounded label text. A synthetic EPUB with a valid title previously failed to open. The public opener now preserves the group, link labels and exact target. The parser test distinguishes retained title bytes from the XML text charge. [Policy and verification](../../plans/completed/hidden-navigation-label-titles.md)

- 2026-11-23 execution — `deferred`, `inspected-inconclusive` as a product defect. The root-label policy and existing length cap remain in force. Revisit the opener and descendant, fallback and visible-label controls if product policy changes. [Execution plan](../../plans/completed/november-23-findings-corrections.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-inconclusive` for a product defect despite verified root-label handling and size-limit rejection. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0145)

**Text in a hidden TOC label can prevent opening.** EPUB 3 label construction does not check `hidden` on the label's own `a` or `span`. Its text counts toward the 1,024-code-point label limit and can abort public opening before the available `title` fallback is considered.

- Owners — [Label initialization](../../../packages/epub/src/navigation/navigation-document.ts#L303), [title fallback](../../../packages/epub/src/navigation/navigation-document.ts#L438), and [label limit](../../../packages/epub/src/navigation/navigation-document.ts#L548).
- Lineage — The earlier [RCF-15](../../plans/completed/revalidated-chat-findings-minimal-corrections.md#L257) fixture puts `hidden` on descendants within the label. EPUB 3.3 permits a dedicated navigation UI to ignore `hidden`. Applying the descendant exclusion to the label root is a product decision. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. The product outcome for the concealed label itself warrants confirmation. [Audit and next check][audit-2026-11-23-pass-2] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0145)

## VF-0146

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. Native acquisition checks the completeness of the compatibility report. Incomplete DirectML facts deny admission before transfer; valid same-owner retry remains available. [Owner checks and limits](../../plans/evidence/november-23-findings/native-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0146)

**Native Chatterbox Download can accept an incomplete compatibility report.** After a complete renderer check exposes confirmation, the fresh native check can observe a DirectML failure after the CUDA adapter has been identified. A partial or permission-denied report with CUDA, CPU and memory facts still passes the native predicate. Published acquisition rules say native repeats the host check, whose compatibility rule requires a complete report.

- Owners — [Windows probe](../../../apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs#L271), [native predicate](../../../apps/desktop/src-tauri/src/host_profile_detection.rs#L708), [renderer matcher](../../../apps/desktop/src/tts/hardware-profile-matcher.ts#L372), and [acquisition rule](../../architecture/chatterbox-official-acquisition-authority-v2.md#L143).
- Lineage — Adjacent to [VF-0106](#vf-0106), which uses an older renderer report while a check is pending. Here the fresh report reaches a different predicate. Explicit Download consent remains required. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` for the decision discrepancy on `main` at `d9a0a72` on 2026-11-23. The M011 plan summarizes narrower hardware dimensions, so verify intended parity before changing admission. [Audit and next check][audit-2026-11-23-pass-2] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0146)

## VF-0147

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. Initial reservation publication stages the entire observation, then publishes the nonempty session directory. Same-ID retry, committed winner preservation and one-use claim were exercised. [Owner checks and limits](../../plans/evidence/november-23-findings/tools-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0147)

**Interrupted preparation can strand a benchmark reservation ID.** `safety:prepare` creates an exclusive directory before publishing `reservation.json`. A filesystem failure publishing that record leaves the directory in place. The same request cannot prepare again because its directory exists, and it cannot claim or finalize because the reservation is absent.

- Owners — [Prepare](../../../services/tts/benchmarks/benchmark_safety.py#L208), [record writer](../../../services/tts/benchmarks/benchmark_safety.py#L103), and [operator recovery contract](../../development/benchmark-safety-v1.md#L15).
- Lineage — [VF-0104](#vf-0104) led to atomic publication and retry coverage for `consumed`, `settled` and `restored`. A failed prepare has a separate directory ownership boundary. Operators can use a new ID before changing power settings. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` on `main` at `d9a0a72` on 2026-11-23 after a publication failure. [Audit and next check][audit-2026-11-23-pass-2] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0147)

## VF-0148

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. The testing guide now attributes staged payload verification to the verified-core route. Source inspection distinguishes the standalone configuration and manifest check from the installer lifecycle. [Owner checks and limits](../../plans/evidence/november-23-findings/tools-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the standalone verification claim. Full payload verification belongs to the separate verified-core command. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0148)

**The Windows package check can pass with a damaged Piper payload.** `package:windows:check` requires the resource directory and matching manifest bytes. A missing, changed or extra payload file inside that directory can still yield `windows-release:current`. Native Piper rejects that tree. The separate `package:piper-core:check` and verified-core build command perform a full check.

- Owners — [Windows release check](../../../apps/desktop/scripts/windows-release.mjs#L351), [native verifier](../../../apps/desktop/src-tauri/src/tts_release_core.rs#L119), and [test guidance](../../development/testing.md#L1620).
- Lineage — Distinct from [VF-0068](#vf-0068) and [VF-0107](#vf-0107). This check's documentation credits payload verification even when manifest equality is its only payload identity test. Introduction unknown.
- Disposition — `candidate`, P3 maintainer evidence, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. No claim about an installer built through valid inputs. [Audit and next check][audit-2026-11-23-pass-2] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0148)

## VF-0149

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. Real Windows traversal resumed safely after an enumerated file or dequeued directory vanished. Reparse and persistent-lock refusals, hidden entries and restored originals were exercised. [Owner checks and limits](../../plans/evidence/november-23-findings/tools-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0149)

**A disappearing WebView2 file can abort the Windows lifecycle harness.** The harness enumerates an entry and then reads its attributes. The later read is outside the missing-entry handlers. A transient file disappearing in between can abort pre-fixture checks or bypass the cleanup loop's sharing-violation retry.

- Owners — [Traversal](../../../scripts/windows-package-lifecycle-data.ps1#L37) and [cleanup retry](../../../scripts/windows-package-lifecycle-data.ps1#L130).
- History — Previously reproduced as a harness failure in [five-search evidence](../../plans/evidence/five-search-findings/execution-ledger.md#L52); a later unchanged retry passed. [Windows privacy closeout](../../plans/completed/windows-build-privacy.md#L66) records another transient traversal failure and successful cleanup/retry. Newly indexed here. Introduction unknown.
- Disposition — Historically `confirmed`, P3 maintainer reliability. `inspected-present` on `main` at `d9a0a72` on 2026-11-23. No fresh execution. [Audit and next check][audit-2026-11-23-pass-2] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0149)

## VF-0150

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. Restoration notices report the active in-memory appearance with its storage warning. Mounted tests exercised failed persistence, replacement and successful recovery. [Owner checks and limits](../../plans/evidence/november-23-findings/reader-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0150)

**Reader says defaults are active while using a custom appearance.** After a preference write fails, App retains the selected appearance in memory and the restore cache records the failure status. Open another book that has an exact or missing saved position. The reader uses the custom appearance, but the notice sees only the status and reports “Default settings are active.”

- Owners — [Appearance update](../../../apps/desktop/src/App.tsx#L661), [restore cache](../../../apps/desktop/src/persistence/reader-position-restore-coordinator.ts#L213), [presentation projection](../../../apps/desktop/src/app-reader-restoration.ts#L65), and [notice](../../../apps/desktop/src/AppPresentation.tsx#L95).
- Lineage — [CAF-R6.2](../../plans/completed/chat-audit-minimal-follow-up.md#L107) correctly retains usable in-memory appearance and propagates the failed write. Its [replacement fixture](../../../apps/desktop/src/App.test.tsx#L3521) checks Settings feedback while the reader's separate notice can contradict it. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. [Audit and next check][audit-2026-11-23-pass-3] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0150)

## VF-0151

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. When focus enters the covered reader viewport, Contents closes and exposes the focused content. Forced-colors and normal-color Chromium journeys exercised Skip, PageDown and dismissal. [Owner checks and limits](../../plans/evidence/november-23-findings/reader-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0151)

**Focus can move behind the forced-colors table of contents.** The open Contents backdrop covers the workspace in opaque Canvas color. The reader remains in tab order after the panel. Tab from the last available TOC destination can send focus to a covered in-book button, and the reader skip link can focus the obscured article directly.

- Owners — [Reader DOM order](../../../apps/desktop/src/reader/ReaderPublication.tsx#L1294), [skip action](../../../apps/desktop/src/reader/ReaderPublication.tsx#L1068), [backdrop](../../../apps/desktop/src/styles/reader-shell-and-settings.css#L315), and [forced-colors rule](../../../apps/desktop/src/styles/reader-shell-and-settings.css#L405).
- Lineage — Separate from the Settings modal cases in [VF-0121](#vf-0121). The inspected keyboard fixture closes Contents before continuing, and its forced-colors arm starts with Contents closed. Preserve the product's no-nested-focus-trap rule. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` for the DOM/CSS sequence on `main` at `d9a0a72` on 2026-11-23. Actual WebView2 focus order and visibility remain unmeasured. [Audit and next check][audit-2026-11-23-pass-3] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0151)

## VF-0152

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. The EPUB projector and reader preserve item-level direction on the list item itself. Chromium compares marker placement; the opener preserves ordered values and locator offsets. [Owner checks and limits](../../plans/evidence/november-23-findings/epub-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0152)

**The reader drops an individual list item's direction.** The semantic projector propagates an authored `dir` into the item's paragraph but omits it from the list item. The emitted `<li>` inherits the surrounding list's direction, so an outside marker can appear on the opposite side from the authored item direction.

- Owners — [List item projection](../../../packages/epub/src/document/xhtml-projector.ts#L1432), [semantic model](../../../packages/epub/src/document/document-model.ts#L122), and [list item renderer](../../../apps/desktop/src/reader/SemanticDocument.tsx#L403). [CSS outside-marker rule](https://www.w3.org/TR/CSS22/generate.html#propdef-list-style-position)
- Lineage — [VF-0064](#vf-0064) covers implicit paragraph direction and [VF-0096](#vf-0096) covers bidi isolates. Individual list-item box direction is separate from either. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` for attribute loss on `main` at `d9a0a72` on 2026-11-23. Actual marker placement was not observed. [Audit and next check][audit-2026-11-23-pass-3] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0152)

## VF-0153

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. The controls announce a pending rate against a current section only while an unfinished unit owns the handle. Empty refill and paused unfinished-unit cases were exercised. [Owner checks and limits](../../plans/evidence/november-23-findings/playback-handoff-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0153)

**Refill speed feedback refers to an audio section that ended.** After an ordinary underrun at 1×, choose 0.75× while the buffer is still short of the refill threshold. The scheduler retains 1× as active after the last unit ended. The control announces that the new speed will apply after the current section, even though no unit is currently playing.

- Owners — [Scheduler at exhaustion](../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1107), [rate selection](../../../apps/desktop/src/tts/reader-settings-playback-authority-v3.ts#L308), and [feedback](../../../apps/desktop/src/tts/ProductNarrationControls.tsx#L188).
- Lineage — [VF-0048](#vf-0048) concerns logical completion. [VF-0138](#vf-0138) requires a met refill threshold and pending worklet. This case occurs before the threshold. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. Scope is status and timing copy. [Audit and next check][audit-2026-11-23-pass-3] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0153)

## VF-0154

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. A terminal exit flag is checked during admission and child publication. Held starts remain retired, and ordinary Stop still permits a new run. [Owner checks and limits](../../plans/evidence/november-23-findings/native-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0154)

**A pending TTS start remains eligible after application exit cleanup.** If the exit callback reaches `force_stop` during package verification, there is no child in the slot and cleanup can return with the pending request still admitted. Verification can then reach spawn before process termination.

- Owners — [Exit callback](../../../apps/desktop/src-tauri/src/main.rs#L58), [pending start and pre-spawn guard](../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1624), and [force stop](../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L2105).
- Lineage — [VF-0093](#vf-0093) covers explicit Cancel, which now retires the exact owner before spawn. LCF-04 preserves best-effort application exit for a failed termination. This case concerns admission of an additional child after a successful cleanup call. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` for the interleaving on `main` at `d9a0a72` on 2026-11-23. No process survival or orphaning claim. [Audit and next check][audit-2026-11-23-pass-3] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0154)

## VF-0155

- 2026-11-25 [CI audit][audit-ci-2026-11-25] on `28e157c` — `inspected-absent` for the original chrono case. The generator requests the locked Windows release graph and the tracked row records chrono outside it. The audit summary wording in VF-0183 has a different owner.

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. The generator distinguishes the selected Windows normal/build graph from lock-only records. Chrono keeps its licence and checksum. Reachable ZIP and missing or ambiguous graph controls passed. [Owner checks and limits](../../plans/evidence/november-23-findings/tools-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0155)

**The inventory labels an inactive crate as required on Windows.** The generator iterates Cargo package records and unconditionally gives them Windows runtime/build reachability. The tracked inventory labels `chrono` 0.4.45 required by the release graph while the release audit policy and retained Windows normal/build dependency-tree evidence identify it as inactive.

- Owners — [Inventory generator](../../../scripts/release_inventory.py#L471), [inventory row](../../../services/tts/release/component-inventory-v1.json#L1418), and [policy row](../../../services/tts/release/audit-policy.json#L69). [Retained Windows graph evidence](../../plans/evidence/codex-model-rollout/ci-audit-review.md#L50) · [Cargo metadata filtering](https://doc.rust-lang.org/cargo/commands/cargo-metadata.html#output-options)
- Lineage — The earlier [Python wheel selection correction](../../plans/completed/five-pass-audit-revalidation-and-corrections.md#L426) concerns artifact identity. This case concerns the release classification applied to Rust package metadata. The dependency evidence and inventory can retain locked package identity independently of production reachability. Introduction unknown.
- Disposition — `candidate`, P3 maintainer evidence, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. The release audit's own reachability check is separate. [Audit and next check][audit-2026-11-23-pass-3] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0155)

## VF-0156

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. A late output receipt can advance heard state during Pause without undoing measured viewport inspection. The reader record covers explicit Resume and subsequent follow. [Owner checks and limits](../../plans/evidence/november-23-findings/reader-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0156)

**A delayed audio receipt can move the reading viewport during Pause.** Pause before the current unit's first positive output receipt has been processed, then scroll elsewhere while paused. Manual inspection clears follow eligibility on the old projection. When the delayed receipt confirms that the unit already rendered, `segment-started` creates a new follow-eligible projection and can scroll or navigate before Resume.

- Owners — [Paused receipt](../../../apps/desktop/src/tts/pcm-playback.ts#L516), [manual inspection](../../../apps/desktop/src/reader/ReaderPublication.tsx#L563), and [highlight/follow owner](../../../apps/desktop/src/reader/segment-highlight-controller.ts#L330).
- Lineage — [VF-0017](#vf-0017) covers deliberate Resume following, and [VF-0028](#vf-0028) covers unavailable geometry. [DCR-06](../../../apps/desktop/src/tts/pcm-playback.test.ts#L1033) preserves confirmation during Pause. The inspected tests cover delayed receipt and manual inspection independently. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` for the ordered sequence on `main` at `d9a0a72` on 2026-11-23. Real device timing and rate of occurrence are unmeasured. [Audit and next check][audit-2026-11-23-pass-4] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0156)

## VF-0157

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. The Auto scan now retains the focused article through materialization. Subsequent keyboard navigation and independent focus ownership are addressed in the reader evidence. [Owner checks and limits](../../plans/evidence/november-23-findings/reader-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0157)

**Finishing automatic direction preparation can drop reader focus.** On a large admitted Auto-direction chapter, Skip to reader content can focus the temporary article. The ready fragment inserts the progressive status ahead of a new article in a different child slot. React replaces the focused article and the reader has no focus handoff at that boundary. Later reading keys can be directed outside the viewport.

- Owners — [Skip action](../../../apps/desktop/src/reader/ReaderPublication.tsx#L1068), [temporary and ready articles](../../../apps/desktop/src/reader/SemanticDocument.tsx#L763), and [bounded direction scan](../../../apps/desktop/src/reader/semantic-auto-direction.ts#L151).
- Lineage — Separate from [VF-0121](#vf-0121) Settings action replacement and [VF-0151](#vf-0151) Contents backdrop. Current Auto tests cover readiness/replacement and ordinary keyboard tests use an already-mounted reader. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` for the DOM replacement on `main` at `d9a0a72` on 2026-11-23. The exact focus landing and PageDown behavior in WebView2 are unmeasured. [Audit and next check][audit-2026-11-23-pass-4] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0157)

## VF-0158

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. Celsius preparation recognizes spaced binary Unicode minus in a range. The bilingual checks preserve unary and standalone temperatures and their source spans. [Owner checks and limits](../../plans/evidence/november-23-findings/epub-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0158)

**A spaced Unicode minus can allow partial Celsius normalization.** In short Spanish or English prose such as `20 °C − 25 °C`, the numeric continuation guard stops after seeing a spaced separator and the Celsius range guard recognizes only ASCII hyphen and en dash. The first Celsius form can expand independently while the other operand remains raw.

- Owners — [Numeric adjacency](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L524), [Celsius range guard](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L705), and [compound policy](../../architecture/decisions/ADR-0063-default-cuda-and-celsius-boundaries.md#2026-11-09-decimal-and-signed-celsius-range-endpoints).
- Lineage — Adjacent to [VF-0010](#vf-0010) and the Celsius guards for bounded signed or decimal endpoints. This is U+2212 as the binary separator, distinct from the sign on an endpoint. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. Prepared text is the observed contract in source. Speech was not measured. [Audit and next check][audit-2026-11-23-pass-4] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0158)

## VF-0159

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. The startup smoke reports phase-unverified when sampled states cannot identify the engine command at cancellation. Cleanup measurements remain independent. [Owner checks and limits](../../plans/evidence/november-23-findings/native-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0159)

**The startup witness can report model loading after it finishes.** The child constructs its `loading` frame, blocks in `engine.load()`, then passes the frame to the writer only after loading returns. Native lifecycle observation therefore cannot report `loading` during real engine load. The exact-host Cancel start arm can miss a long load, or attribute a later sample to loading that already finished.

- Owners — [Child Load handler](../../../services/tts/src/voxleaf_tts/service.py#L184), [wire publication](../../../services/tts/src/voxleaf_tts/service.py#L419), [native observer](../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1219), and [exact-host witness](../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L59).
- Lineage — [VF-0093](#vf-0093) concerns verification before a child exists. [VF-0124](#vf-0124) concerns mid-synthesis Stop evidence. The current service and the pinned v7 child both use delayed Load frame publication. This finding concerns phase attribution, with cancellation containment and genuine warm-up as separate controls. Introduction unknown.
- Disposition — `candidate`, P3 diagnostic/evidence, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. No fresh host execution. [Audit and next check][audit-2026-11-23-pass-4] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0159)

## VF-0160

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. A completed synthetic handoff with missing owned-tree samples no longer earns a measured zero. Ordered repeated phases, valid zero and failed-query controls were exercised. [Owner checks and limits](../../plans/evidence/november-23-findings/playback-handoff-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0160)

**The handoff benchmark can report zero network activity without sampling.** The observer initializes listener and external-connection counts to zero. It samples only when a phase explicitly asks and will publish a passing result without requiring any sampled phase. The inspected synthetic success fixture sends acknowledgements and result data but skips all network-phase records.

- Owners — [Observer counts and phase set](../../../services/tts/benchmarks/service_handoff_cli.py#L435), [phase handling and result admission](../../../services/tts/benchmarks/service_handoff_cli.py#L505), [native producer](../../../apps/desktop/src-tauri/src/tts_service_handoff.rs#L168), and [synthetic success fixture](../../../services/tts/tests/test_service_handoff_cli.py#L471).
- Lineage — DCR-11 covers effective outbound firewall configuration and DCR-22 covers the four process-tree cleanup witnesses. Neither requires the separate network observation. The normal producer emits network phases. Introduction unknown.
- Disposition — `candidate`, P3 maintainer evidence, `inspected-present` for the missing-witness sequence on `main` at `d9a0a72` on 2026-11-23. No claim of traffic or a false result on a live host. [Audit and next check][audit-2026-11-23-pass-4] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0160)

## VF-0161

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. Mixed-case direction keywords now follow the same bounded decode path as lowercase. Public fixtures verify nested Auto, inline direction and invalid values. [Owner checks and limits](../../plans/evidence/november-23-findings/epub-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0161)

**Valid mixed-case text direction can prevent opening.** An otherwise accepted EPUB 3 chapter with `dir="RTL"` or `dir="AuTo"` reaches a case-sensitive comparison in XHTML projection and fails as malformed. HTML's enumerated keywords match ASCII case-insensitively. The projector also reads the raw attribute independently for direction isolation and Auto scope assignment.

- Owners — [Text-context comparison](../../../packages/epub/src/document/xhtml-projector.ts#L379), [Auto scope logic](../../../packages/epub/src/document/xhtml-projector.ts#L859), and [public opener](../../../packages/epub/src/public/open-epub-publication.ts#L160). [HTML keyword rules](https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#keywords-and-enumerated-attributes)
- Lineage — [VF-0064](#vf-0064), [VF-0096](#vf-0096) and [VF-0152](#vf-0152) concern projection or rendering of already admitted direction values. This case rejects a valid spelling of the same state. Introduction unknown.
- Disposition — `candidate`, P2, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. [Audit and next check][audit-2026-11-23-pass-5] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0161)

## VF-0162

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. Expanded vocabulary identity determines OPF modification metadata. Equivalent duplicates, missing values, foreign bindings and normal opening were exercised. [Owner checks and limits](../../plans/evidence/november-23-findings/epub-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0162)

**A declared metadata prefix alias can prevent opening.** An EPUB 3 package can map `terms` to `http://purl.org/dc/terms/` and supply its required last-modified value as `terms:modified`. The parser recognizes only the literal reserved-prefix spelling, silently ignores the equivalent property, then rejects the package for missing a timestamp.

- Owners — [Package root capture](../../../packages/epub/src/package/package-document.ts#L600), [metadata dispatch](../../../packages/epub/src/package/package-document.ts#L775), and [required field check](../../../packages/epub/src/package/package-document.ts#L516). [EPUB property processing](https://www.w3.org/TR/epub-rs-33/#sec-property-processing)
- Lineage — Prior XML namespace prefix handling concerns XML element/attribute names. This case concerns the vocabulary mapping inside the `property` attribute's value. Adjacent rendition property lookups use the same literal dispatch, without a separate disposition here. Introduction unknown.
- Disposition — `candidate`, P2, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. [Audit and next check][audit-2026-11-23-pass-5] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0162)

## VF-0163

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. Default checkpointing waits for readable mounted placement. A real over-budget chapter did not evict an existing entry and the next readable chapter saved normally. [Owner checks and limits](../../plans/evidence/november-23-findings/reader-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0163)

**Closing an oversized first chapter can save an unread position.** A first open with no saved position arms the default locator for lifecycle flush. If the initial chapter exceeds the render cap, only fallback UI is shown, but replacement or close still persists its locator. The next same-byte open looks up that entry and can report failure to align a position the user never read. A full store can also evict a genuine older checkpoint to save this one.

- Owners — [Initial save admission](../../../apps/desktop/src/App.tsx#L492), [position flush](../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L361), [unavailable placement](../../../apps/desktop/src/reader/ReaderPublication.tsx#L1179), and [bounded repository write](../../../apps/desktop/src/persistence/reader-position-repository.ts#L320).
- Lineage — M004 introduced default flush admission at `27c875e` while gating restoration of a saved position. [VF-0044](#vf-0044) narrowed admission to confirmed missing state and [VF-0142](#vf-0142) covers false settlement during a pending jump. The remaining route is a first-open lifecycle write with no readable placement or navigation.
- Disposition — `candidate`, P3, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. [Audit and next check][audit-2026-11-23-pass-5] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0163)

## VF-0164

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. The mounted paragraph action exposes its unavailable state during a pending jump. The control enables after settlement and a fresh action starts the chosen paragraph. [Owner checks and limits](../../plans/evidence/november-23-findings/reader-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0164)

**Paragraph Play can be enabled before a jump settles.** When the target of a deep TOC jump is still materializing, early paragraphs can already show an enabled Start narration button. Pressing it returns false from the placement gate and the reader supplies no status or feedback. The main Play control already exposes placement admission.

- Owners — [Paragraph button](../../../apps/desktop/src/reader/ParagraphLeaf.tsx#L120), [click route](../../../apps/desktop/src/reader/ReaderPublication.tsx#L977), and [coordinator guard](../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1096).
- Lineage — Adjacent to [VF-0002](#vf-0002) and [VF-0003](#vf-0003) on placement admission. The guard still prevents premature playback. This case concerns a secondary control presented as available. Introduction unknown.
- Disposition — `candidate`, P3, `inspected-present` on `main` at `d9a0a72` on 2026-11-23 when interacted with before placement settles. Actual host timing remains open. [Audit and next check][audit-2026-11-23-pass-5] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0164)

## VF-0165

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. The stability observer requires a fresh same-run rendered minute. Controlled short completion, replacement and cumulative prior playback no longer supply stable credit. [Owner checks and limits](../../plans/evidence/november-23-findings/playback-handoff-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0165)

**Native stable-playback evidence can include earlier runs.** The exact-host journey replaces playback during navigation. Its later stable-playback poll checks whether the aggregate rendered-audio counter reaches 60 seconds, with no baseline or current-run binding. Audio from retired playback can satisfy the threshold early and shorten observation of the run under evaluation.

- Owners — [Stability poll](../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L996), [reported evidence](../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L2483), and [coordinator accumulator](../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2348).
- Lineage — The initial smoke threshold consumed a per-Play counter. F10 in `4942ac7` correctly made the product metric cumulative across the recovery episode and left the smoke threshold in place. [VF-0049](#vf-0049) preserves that accounting, and [VF-0123](#vf-0123) paired refill observations by playback identity. The stable branch still uses the cumulative counter.
- Disposition — `candidate`, P3 maintainer evidence, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. No actual earlier host result was reclassified. [Audit and next check][audit-2026-11-23-pass-5] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0165)

## VF-0166

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. Removal requires affirmative capability from an accepted snapshot. Unknown initial or failed candidate observations cannot stop Piper; the ordinary v7 flow remains available. [Owner checks and limits](../../plans/evidence/november-23-findings/native-execution.md)

- 2026-11-23 deep review on `d9a0a72` — `inspected-present` for the scoped trigger. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0166)

**The local Chatterbox candidate can offer unsupported removal and stop Piper.** Before the first authoritative optional snapshot on a local v8 candidate, a profile-selection rejection can publish `failed` with unknown removal capability. Settings treats unknown as available. Clicking Remove stops the current Piper narration, then native rejects the unsupported operation. A later successful snapshot supplies `removalSupported: false`.

- Owners — [Client failure snapshot](../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L417), [Settings control](../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L343), [pre-removal action](../../../apps/desktop/src/settings/narration-settings-actions.ts#L127), and [native denial](../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2836).
- Lineage — [VF-0114](#vf-0114) and [ADR-0078](../../architecture/decisions/ADR-0078-version-chatterbox-provider-loss.md#L19) cover known `false` capability. The pre-observation route was already possible in `d9a0a72` when the guard landed. Scope is the opt-in local v8 candidate.
- Disposition — `candidate`, P3, `inspected-present` for the ordered rejection/Remove path on `main` at `d9a0a72` on 2026-11-23. No package deletion is credited. [Audit and next check][audit-2026-11-23-pass-5] · [Reconciliation](audits/2026-11-23-findings-reconciliation.md#vf-0166)

## VF-0167

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. Package preselection and full OPF parsing use the same expanded rendition properties. Public opening selects the later reflowable rootfile and rejects all-fixed alternatives. [Owner checks and limits](../../plans/evidence/november-23-findings/epub-execution.md)

**An OPF vocabulary alias can admit a fixed-layout rendition.** In a valid EPUB 3 with a canonical modification timestamp, declare a package-local alias for the rendition vocabulary. Use it for global pre-paginated layout or a pre-paginated spine override. Preselection and full package parsing compare the literal rendition prefix. They can leave the first rootfile classified as reflowable, even when a later rootfile is the supported one.

- Disposition — `candidate`, P2, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. [container-resolver.ts L294](../../../packages/epub/src/container/container-resolver.ts#L294) · [package-document.ts L811](../../../packages/epub/src/package/package-document.ts#L811)
- Lineage and next check — VF-0162 concerns rejection for missing metadata. This path accepts the wrong layout and changes public rootfile selection. The literal fixed-layout fallback correction still runs for its original spelling. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0167)

## VF-0168

- PR #332 CI follow-up — When an appearance edit races the initial preferences read, the mounted App test checks the props passed to Settings and the reader, the initial restoration input, and the writes sent to the test repository. [CI evidence](../../plans/evidence/november-23-findings/ci-follow-up.md)

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. Global appearance persistence belongs to the latest preference write across book replacement. A stale completion cannot clear or replace the current write outcome. [Owner checks and limits](../../plans/evidence/november-23-findings/reader-execution.md)

**Replacing the book can suppress an appearance-save failure.** Change the appearance, then replace the book before its pending preference write reports failure. The old save owner flushes during close and suppresses its completion callback after close. App also drops callbacks from the old book owner. The new book reuses the custom in-memory preference with the earlier ready status, so the user can lose the persistence warning.

- Disposition — `candidate`, P3, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. [App.tsx L524](../../../apps/desktop/src/App.tsx#L524) · [reader-position-save-coordinator.ts L344](../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L344)
- Lineage and next check — VF-0150 needs a failure that has already reached the cache. Here the global appearance result never reaches it. The prior App fixture waits for the warning before selecting the new book. The default storage write is synchronous within an async API, so the production window includes a change still pending in the zero-delay save schedule at replacement. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0168)

## VF-0169

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. The speed harness uses observed predecessor output end and successor output start, including a delayed end callback. Missing or incomparable output clocks cannot pass. The controlled delayed, missing-clock and prompt-successor cases and actual installed speed result have distinct evidence scopes. [Owner checks and limits](../../plans/evidence/november-23-findings/playback-handoff-execution.md) · [Integrated results](../../plans/evidence/november-23-findings/integrated-gates.md)

**Playback-speed timing gates measure intentional pauses.** In the exact-host speed matrix, first activation uses the change in intentionalWaitMs. Recurring handoff uses the same change minus a fixed synthetic sentence pause. That counter measures scheduled semantic pauses. Holding asynchronous worklet preparation or delaying device activation after the intentional pause can increase the actual wait without increasing this counter. The harness can still report a passing timing check once the selected rate becomes active within the larger polling timeout.

- Disposition — `candidate`, P3, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. [tts-scenarios.mjs L960](../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L960) · [product-narration-coordinator.ts L2348](../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2348)
- Lineage and next check — VF-0165 concerns which run contributed rendered audio. This timing gate uses the wrong quantity even with one run and no navigation. The separately frozen historical candidate measurement is outside this finding. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0169)

## VF-0170

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. The Windows observer covers both address families. A synthetic IPv6-only owned endpoint is detected; non-owned, loopback, query failure and measured zero remain distinct. [Owner checks and limits](../../plans/evidence/november-23-findings/playback-handoff-execution.md)

**Successful network sampling omits IPv6 protocols.** The Windows handoff observer invokes netstat with only the tcp and udp protocol filters. Windows provides separate tcpv6 and udpv6 filters. An owned IPv6-only listener or external connection can therefore be absent even in a phase that was actually sampled. No real traffic or false historical result was observed.

- Disposition — `candidate`, P3, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. [service_handoff_cli.py L187](../../../services/tts/benchmarks/service_handoff_cli.py#L187) · [service_handoff_cli.py L211](../../../services/tts/benchmarks/service_handoff_cli.py#L211)
- Lineage and next check — VF-0160 concerns missing samples. This failure can occur with a nonempty owned process tree and a successful sample. The effective firewall and process cleanup are separate checks. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0170)

## VF-0171

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. The submit and aggregate CLI commands recover from failed metadata writes or replacements with a bounded response. Atomic destinations, immediate retry and unrelated files were checked. [Owner checks and limits](../../plans/evidence/november-23-findings/tools-execution.md)

**Scorecard or aggregate publication can bypass the CLI error response.** Submit a valid scorecard for a ready session or aggregate a complete one. A filesystem denial writing or replacing the destination propagates from the shared JSON writer as OSError. Neither route translates it at the CLI boundary, so the operator can receive a traceback with a local path instead of the structured failure response. The temporary file can remain after a failed replace.

- Disposition — `candidate`, P3, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. [quality.py L84](../../../services/tts/benchmarks/quality.py#L84) · [quality.py L544](../../../services/tts/benchmarks/quality.py#L544)
- Lineage and next check — VF-0117 handles correction-time unlink and VF-0140 concerns recursive cleanup. Submit and aggregate perform publication through a different writer, and may leave a retryable temporary file beside an intact final file. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0171)

## VF-0172

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. Left context is scanned through the complete bounded numeric endpoint so a dotted identifier cannot suppress a standalone Celsius expansion. Real numeric ranges remain protected. [Owner checks and limits](../../plans/evidence/november-23-findings/epub-execution.md)

**A dotted identifier can suppress a standalone Celsius expansion.** In the bilingual normalizer, `Firmware R8.5 – 20 °C` reaches the backward shared-unit range guard. It consumes the final 5 and stops at the period. That punctuation satisfies its non-word boundary test, so it mistakes the identifier suffix for a numeric left endpoint and suppresses expansion of 20 °C. The existing `R8 – 20 °C` control takes the attached-letter branch.

- Disposition — `candidate`, P3, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. [narration-bilingual-normalizer.ts L743](../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L743) · [narration-normalizer.test.ts L422](../../../packages/epub/src/narration/narration-normalizer.test.ts#L422)
- Lineage and next check — VF-0158 misses a real binary separator and expands too much. This case recognizes an en dash but invents a numeric endpoint and expands too little. The bounded same-prose rule already distinguishes editorial dashes from numeric ranges. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0172)

## VF-0173

- 2026-11-23 execution on `d9a0a72` plus the working patch — `fixed` for the reported trigger. Short code ornaments remain literal in the mutable narration profiles, matching the long-marker rule. Tests retain source ranges, the next scene break and frozen-profile behavior. [Owner checks and limits](../../plans/evidence/november-23-findings/epub-execution.md)

**Inline code markers get different scene classification across source windows.** A short top-level paragraph containing an inline code span of three asterisks can be consumed as a silent scene marker. The normalized short classifier counts code-role text. With enough neutral padding outside the same code span to cross the source window, the long classifier explicitly rejects code. Later slices cannot classify the whole paragraph. The same visible marker can produce different segment and boundary metadata.

- Disposition — `candidate`, P3, `inspected-present` on `main` at `d9a0a72` on 2026-11-23. [narration-preparation.ts L655](../../../packages/epub/src/narration/narration-preparation.ts#L655) · [narration-segment-packer.ts L783](../../../packages/epub/src/narration/narration-segment-packer.ts#L783)
- Lineage and next check — VF-0137 concerns omission handling. Here two owners disagree about code itself. M005 specifies the top-level normalized ornament rule and literal code treatment makes the intended behavior worth pinning down. The discrepancy is established either way. No missed audible word is claimed. [Deep validation](audits/2026-11-23-deep-findings-validation.md#vf-0173)

## VF-0174

- 2026-11-25 implementation — GitHub identified Actions integration 15368 as producer of all four contexts. The captured ruleset has three existing rules and no bypass actors. Live enforcement is pending. [Execution evidence](../../plans/evidence/ci-reliability-and-dependency-updates/implementation.md)

**Main permits a merge while CI is pending or failing.** On 2026-11-25 the effective rules required a PR and resolved conversations. The branch reported status-check enforcement off and zero required contexts. P1, confirmed by the live configuration. A merge with failing checks was not observed. The owner is the remote main branch ruleset. Require the three foundation jobs and the production dependency job to make their results merge prerequisites. [CI audit][audit-ci-2026-11-25] · [Effective rules](https://api.github.com/repos/mmjosedaniel/voxleaf/rules/branches/main)

## VF-0175

- 2026-11-25 implementation — The Windows candidate workflow proposed exact pins and a hash lock. A Linux-only msgpack wheel passed compile alone, then failed the added dry-run install planner. The Windows CUDA wheel pins and v7 authority stayed intact. [Execution evidence](../../plans/evidence/ci-reliability-and-dependency-updates/implementation.md)

**Weekly Chatterbox v7 dependency updates fail on a Windows wheel.** The configured pip updater runs its resolver on Linux. The exact CUDA Torch wheel is Windows-only. Five hosted jobs between October 27 and November 23 failed on that wheel. P2, confirmed by hosted executions with the same profile present at the audit HEAD. Check a Windows-compatible update path through the existing successor-lock and artifact review. [Configuration](../../../.github/dependabot.yml#L52) · [Wheel pins](../../../services/tts/release/profiles/chatterbox-v7/requirements.in#L80) · [Runs and scope][audit-ci-2026-11-25]

## VF-0176

- 2026-11-25 implementation — Both entries now select uv. In a disposable base project, Ruff 0.17.6 produced a lock diff and passed locked sync/export. The core manifest from #324 still correctly failed its October cutoff. Hosted updater outcomes remain pending. [Execution evidence](../../plans/evidence/ci-reliability-and-dependency-updates/implementation.md)

**The base and core Dependabot entries omit their uv lockfiles.** Both use the pip updater, whose pyproject fetcher omits `uv.lock`. Core PR #324 changed the ONNX Runtime pin in the manifest alone. Its locked core export could not resolve the proposed pin under project constraints. P2, confirmed on that PR and `inspected-present` for both updater configurations. Check the uv updater against each project's lock and the core version cutoff, local-path dependency and explicit release pins. [PR files](https://github.com/mmjosedaniel/voxleaf/pull/324/files) · [Configuration](../../../.github/dependabot.yml#L30) · [Upstream fetchers and limits][audit-ci-2026-11-25]

## VF-0177

- 2026-11-25 implementation — Both workflows now use PR number or event plus full ref. Hosted #335 updates cancelled obsolete #335 runs while #334 continued. Same-name fork and push keys were checked separately. [Execution evidence](../../plans/evidence/ci-reliability-and-dependency-updates/implementation.md)

**CI cancellation groups collide across distinct runs.** Both workflows derive their group from the short source branch name. Two fork PRs using the same name share a group. An eligible push and its PR merge-ref run also share a group. A later arrival can cancel the earlier validation. P2, `inspected-present`. Use PR identity and event/ref identity, retaining cancellation of obsolete runs within a PR. [Foundation](../../../.github/workflows/foundation-checks.yml#L17) · [Release](../../../.github/workflows/release-audit.yml#L17) · [CI audit][audit-ci-2026-11-25]

## VF-0178

- 2026-11-25 implementation — The new locked tree rejected a stale package before creating a target with identical lock hashes before and after. Matching Ubuntu and Windows setup reached native validation. [Execution evidence](../../plans/evidence/ci-reliability-and-dependency-updates/implementation.md)

**Rust foundation can validate a different resolution from the committed lock.** Its Clippy and test commands allow Cargo to update a stale lockfile. The first resolving command can change the checkout and the next command tests that graph. The release audit independently runs a locked tree on its fresh checkout. P2, `inspected-present`. Check stale-lock rejection before Windows and Ubuntu foundation build or test. [Root commands](../../../package.json#L118) · [Independent release guard](../../../scripts/release-audit.mjs#L88) · [CI audit][audit-ci-2026-11-25]

## VF-0179

- 2026-11-25 implementation — The original ignored scratch reproduced 3,748 errors. After correction the full local aggregate passed, and a disposable copy of a tracked source still rejected its deliberate unused variable. [Execution evidence](../../plans/evidence/ci-reliability-and-dependency-updates/implementation.md)

**The local foundation gate lints ignored package scratch files.** Root-relative ESLint ignores omit nested `tmp` and `temp` directories. The PR #333 candidate's local gate stopped with 3,748 errors in three ignored scratch files. The lint leaf passed in the verified source copy. P2, confirmed by that earlier execution and `inspected-present` at the audit HEAD. Check a nested scratch file alongside a tracked lint violation. [ESLint ignores](../../../eslint.config.js#L21) · [Original execution](../../plans/evidence/desktop-responsibility-refactors/package-01.md#L38) · [CI audit][audit-ci-2026-11-25]

## VF-0180

- 2026-11-25 implementation — The PowerShell setup raised immediately on native exit 19, returned 1 and skipped the next command. The normal hosted setup passed. [Execution evidence](../../plans/evidence/ci-reliability-and-dependency-updates/implementation.md)

**A successful second native command can hide a failed Windows setup command.** The Windows dependency step runs pnpm and uv in the same PowerShell script. With the standard native error preference, a successful uv invocation replaces pnpm's exit code before Actions checks it. P3, `inspected-present` for the setup step. Later consumers can still fail. Check each exit or split independent commands. [Windows step](../../../.github/workflows/foundation-checks.yml#L67) · [Shell behavior and limits][audit-ci-2026-11-25]

## VF-0181

- 2026-11-25 implementation — Synthetic Node/Rust scanner reports retained package, version and advisory identity. A controlled launcher failure exited 1 while independent checks reported their own results. [Execution evidence](../../plans/evidence/ci-reliability-and-dependency-updates/implementation.md)

**The audit wrapper discards actionable Node and Rust advisory details.** After a scanner reports findings, the wrapper throws a count without the affected packages, versions or advisory IDs. A prior Rust failure required a direct scan to identify the ZIP issue. P3, confirmed from hosted/retained evidence and `inspected-present` at the audit HEAD. Keep the failing status and report the actionable identifiers or the upstream error when scanning fails. [Audit wrapper](../../../scripts/release-audit.mjs#L63) · [Recorded diagnosis](../../plans/evidence/codex-model-rollout/ci-audit-review.md#L54) · [CI audit][audit-ci-2026-11-25]

## VF-0182

- 2026-11-25 implementation — The typed comparison accepted reversed property order and rejected changed values, missing or extra fields, duplicate records and incorrect types. The release-feature Windows tree retained five reachable warnings. [Execution evidence](../../plans/evidence/ci-reliability-and-dependency-updates/implementation.md)

**Reordering object keys in Rust warning policy fails the audit.** The wrapper sorts rows by advisory ID, then compares the serialized original policy objects to newly constructed objects. Reordering two fields changes their serialized bytes while all warning values agree. P3, `inspected-present`. Compare fields structurally and keep changed values and unknown fields detectable. A separate owner from the receipt/configuration cases [VF-0015](#vf-0015) and [VF-0079](#vf-0079). [Comparison](../../../scripts/release-audit.mjs#L105) · [CI audit][audit-ci-2026-11-25]

## VF-0183

- 2026-11-25 implementation — Regeneration changed only the dated scope wording. The current generator output matched; the four optional Python blind spots remain explicit. [Execution evidence](../../plans/evidence/ci-reliability-and-dependency-updates/implementation.md)

**The inventory generator makes a stronger audit claim than the release command checks.** It always emits “no known vulnerabilities” for its dated result. The Node production check accepts severities below high. A moderate Node advisory alone can therefore pass the gate while this wording persists. P3, `inspected-present` for the evidence mismatch. Express the threshold and blind spots in the inventory. Current advisory presence below the threshold was not evaluated. [Generator](../../../scripts/release_inventory.py#L864) · [Node command](../../../scripts/release-audit.mjs#L57) · [CI audit][audit-ci-2026-11-25]

## VF-0184

- 2026-11-25 implementation — The npm entry excludes TypeScript 7.x from version updates. The existing #329 head still has the former incompatible group. A hosted regenerated group remains pending. [Execution evidence](../../plans/evidence/ci-reliability-and-dependency-updates/implementation.md)

**A known incompatible TypeScript major is included in the grouped development update.** The updater groups all development dependencies, including TypeScript whose major upgrade was deferred pending parser support. In PR #329, typescript-eslint rejected TypeScript 7 at startup and blocked the bundle of 14 updates. P2, confirmed on the proposed versions. Exclude the deferred major or isolate its proposal until its parser supports it. Four browser assertions also failed on that PR. Their cause remains unresolved. [Grouping rule](../../../.github/dependabot.yml#L16) · [Recorded compatibility decision](../dependencies.md#L590) · [Failed lint](https://github.com/mmjosedaniel/voxleaf/actions/runs/45192204815/job/137753199113) · [CI audit][audit-ci-2026-11-25]

## VF-0185

- 2026-11-25 implementation — The installer now uses a fixed past mtime. Read-back precision, valid ordering, pre-installer start, reverse order and future completion were exercised in the Windows fixture. The original failing operand remains unknown. [Execution evidence](../../plans/evidence/ci-reliability-and-dependency-updates/implementation.md)

**A synthetic receipt expected to pass can fail its time checks on Windows.** The test uses the real installer file mtime and assigns current wall time to both receipt timestamps. A file timestamp ahead of that sample, or a subsequent backward wall-clock adjustment, makes the fixture fail. A docs-only main push failed at this guard on November 13. The logs identify the guard but omit the compared values. P3, confirmed historical fixture failure and `inspected-present` timing dependency. Set meaningful fixed past file and receipt times for this synthetic success path and preserve the invalid-time assertions. VF-0015 exercises a different invariant in the same test. [Fixture](../../../apps/desktop/scripts/windows-release.node-test.mjs#L1925) · [Guard](../../../apps/desktop/scripts/windows-release.mjs#L521) · [Windows job](https://github.com/mmjosedaniel/voxleaf/actions/runs/43491787816/job/132114567422)

[audit-ci-2026-11-25]: audits/2026-11-25-continuous-integration-review.md
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
[audit-2026-11-15]: audits/2026-11-15-static-logic-audit.md
[audit-2026-11-15-pass-2]: audits/2026-11-15-static-logic-audit-pass-2.md
[audit-2026-11-15-pass-3]: audits/2026-11-15-static-logic-audit-pass-3.md
[audit-2026-11-15-pass-4]: audits/2026-11-15-static-logic-audit-pass-4.md
[audit-2026-11-16]: audits/2026-11-16-repository-logic-audit.md
[audit-2026-11-16-pass-2]: audits/2026-11-16-repository-logic-audit-pass-2.md
[audit-2026-11-16-pass-3]: audits/2026-11-16-repository-logic-audit-pass-3.md
[audit-2026-11-16-pass-4]: audits/2026-11-16-repository-logic-audit-pass-4.md
[audit-2026-11-16-pass-5]: audits/2026-11-16-repository-logic-audit-pass-5.md
[audit-2026-11-16-reconciliation]: audits/2026-11-16-findings-reconciliation.md
[audit-2026-11-16-deep]: audits/2026-11-16-deep-findings-validation.md
[audit-2026-11-17]: audits/2026-11-17-repository-logic-audit.md
[audit-2026-11-17-pass-2]: audits/2026-11-17-repository-logic-audit-pass-2.md
[audit-2026-11-17-pass-3]: audits/2026-11-17-repository-logic-audit-pass-3.md
[audit-2026-11-17-pass-4]: audits/2026-11-17-repository-logic-audit-pass-4.md
[audit-2026-11-17-pass-5]: audits/2026-11-17-repository-logic-audit-pass-5.md
[audit-2026-11-23]: audits/2026-11-23-repository-logic-audit.md
[audit-2026-11-23-pass-2]: audits/2026-11-23-repository-logic-audit-pass-2.md
[audit-2026-11-23-pass-3]: audits/2026-11-23-repository-logic-audit-pass-3.md
[audit-2026-11-23-pass-4]: audits/2026-11-23-repository-logic-audit-pass-4.md
[audit-2026-11-23-pass-5]: audits/2026-11-23-repository-logic-audit-pass-5.md
[fsf-execution]: ../../plans/evidence/five-search-findings/case-results.md

- 2026-11-14 execution — `reproduced` on the original relevant owner: controlled production Reader/coordinator reentrancy with zero retired synthesis dispatch; no natural-incidence or stale-audio claim. Minimal correction is implemented on `fab1c9e186552515e828c33ce75e11628dda8300` plus the task patch; full integration, native artifact and independent approval are pending. Original failures, succeeding controls and input identities are in the [execution ledger](../../plans/evidence/deep-findings-minimal-corrections/execution-ledger.md). This is not yet a `validated` or `fixed` disposition.
