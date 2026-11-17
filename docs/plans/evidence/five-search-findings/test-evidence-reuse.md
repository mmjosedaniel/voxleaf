# Test evidence reuse for the five-search correction plan

This assessment supports the [ExecPlan](../../completed/five-search-findings-minimal-corrections.md). It was prepared on 2026-11-16 at source HEAD `079c38ece8687b24859db4f64d4f92bba67bdcee`, before implementation. No tests, models, installers or benchmarks were executed.

## What was actually checked

Read the [four-pass execution ledger](../four-pass-findings-corrections/execution-ledger.md), the retained receipt bundles below, the [earlier deep-findings command/reuse register](../deep-findings-minimal-corrections/commands-and-reuse.md), the [confirmed-chat command register](../confirmed-chat-findings/validation-commands.md) and the [revalidated-chat register](../revalidated-chat-findings/validation-commands.md). Historical outcomes remain attributed to those records.

For each of the four #321 bundles, read `receipt.json`, recompute its SHA-256, and compare every hash reference it supplies with the retained before/after inventory, log and environment or command file. All referenced parts matched and each recorded exit was zero. This proves receipt integrity, not that today's complete dependency/environment graph matches. Current planning did not re-run the old commands or the old reuse verifier.

Also compared these **13 unique current production owners** with their explicit rows in the old inventories: XHTML projector, bilingual normalizer, semantic renderer, optional controls, ordinary release runner, release verifier, download probe, lifecycle PowerShell, NSIS hooks, batch official runner, quality CLI, CustomVoice screen and dual-worker CLI. All matched. The first inventory lookup used absolute keys and returned no source rows because repository entries are relative; it supplied no equivalence evidence. The corrected relative-key comparison found the rows above. No receipt was rewritten.

| Retained bundle under `tmp/evidence/four-pass-findings-corrections/` | Receipt SHA-256 | Historical passing scope | Planning decision |
| --- | --- | --- | --- |
| `r02-epub/receipt.json` | `d64506f1862eec636af7dccde8e0cde11f45939d823b4c88df0bffb429c79dab` | 574 tests in eight EPUB files; exact command in the ledger | Retain as baseline context and reuse fixtures. U1 changes projector/normalizer and adds missing assertions, so the old PASS cannot replace final G-EPUB. |
| `g-desktop-final/receipt.json` | `b2cf8b662f6032e1f348eb15a780f0bf5f59a54fc73d87f191cb84b278fed9d5` | 626 tests in eleven desktop files | Preserve earlier behavior expectations. Renderer, optional controls and EPUB inputs will change; run the smaller relevant final desktop union. |
| `r02-b1/receipt.json` | `9e94506ee31e97061bb8d24c8aab2e52b20aa66353d46c58dc7815dd978830cf` | 93 ordinary/release Node tests | Reuse finite process, PowerShell and compiled NSIS fixtures. Their owners and assertions will change; renew G-NODE. This receipt binds a command file, not a complete newly verified current host environment. |
| `r02-final-python/receipt.json` | `8a5c3a16cf9097d4c25b827d77ab83f10b7087203eec39071f7f5dfa033f142e` | 130 tests in the eight-file batch/authority/isolation union | Reuse synthetic batch adapters and existing evidence gates. It is not a quality/CustomVoice/v5 trial acceptance result merely because those source files appear in the inventory. Renew affected Python assertions in the selected union. |

The #316 deep-findings record separately reports 58 quality/CustomVoice tests, 80 optional native tests plus three deliberate ignores in each feature mode, 655 EPUB tests, 819 desktop tests and 16 selected browser cases. Its original reuse proof applies to its own closing candidate only. Planning sampled the current native optional owner and Cargo manifest/lock against `g-rust-green-01.before.repository`; those three bytes match. This does **not** establish all native inputs, installed crates, feature modes, host environment or build outputs match now.

## Recycling decisions by evidence type

| Evidence or work | May be recycled? | Boundary |
| --- | --- | --- |
| Synthetic EPUBs, quality sessions, finite process fixtures, NSIS harness, deterministic worker barriers and expected neighboring behavior | Yes, as test assets/design | Extend the existing assertions to discriminate the current trigger. They do not become a new passing result until executed where affected. |
| Historical broad baseline runs | Yes, as historical baseline context | Avoid repeating entire old suites before editing. Run only new focused witnesses on original owners; save those outcomes separately. |
| Existing regression assertions in the affected file union | Yes, inside one final run | Avoid per-finding full-file reruns. A single final combined run can cover several VF IDs when their original trigger, adjacent protection and next action are explicit. |
| Old PASS for modified owner, test, consumer, runner, schema or authority | No | Each affected gate is renewed once on final inputs. Same test name, count or nearby scenario is insufficient. |
| An unaffected leaf from a composite receipt | Conditional | Its outcome must be separately attributable, with complete consumed membership/bytes, generated exports, tools, installed dependencies and relevant environment. Exclude unrelated files only with a supported dependency argument. Obtain current independent review of the decision. |
| Native Rust optional-unit results | Not selected as a fresh gate under this plan | Rust ownership/protocol is unchanged. This is scope exclusion, not a claim that three matching source files recycle the full native PASS. If Rust or consumed inputs change, reassess and run the smallest affected command. |
| Verified local core/model/runtime assets and build caches | Conditional input reuse | Check the existing manifest/integrity prerequisite when consumed. Do not redownload/regenerate unchanged assets. A cache is not an accepted new binary or benchmark result. |
| Previous NSIS build, lifecycle and installed-startup PASS | No for the new artifact | NSIS hooks, lifecycle owner and frontend inputs change. Build one final canonical unsigned package; run its existing lifecycle once. Preserve original host data/containment gates. |
| Previous model timing, voice quality, optional live download or v7 local-admission replay | Historical only; no rerun selected | These do not discriminate the new source/tooling bugs. No new hardware, acoustic, delivery or package-admission claim is made. A later scope change may make a specific gate necessary. |
| Previous queued/active cancellation or sleep-restoration flags | No for the corrected assertion | VF-0077 and VF-0091 concern missing evidence itself. A successful old summary cannot supply the absent observation retrospectively. |

## Minimum new evidence

The ExecPlan groups corrections into EPUB, desktop, selected Chromium, Node/Windows and Python families. Each receives focused pre-edit witnesses and one final affected union. Shared-input changes are settled before those final runs. One canonical unsigned package replaces separate default-feature and release builds. No full-repository baseline, full browser matrix, model/GPU matrix or live optional download is scheduled.

The two conditional cases are deliberately different:

- VF-0074 needs a bounded mounted event-provenance investigation before any fix. A unit test manually injecting the alleged input is insufficient. If a supported route remains unproved, retain that limitation and omit speculative behavior changes.
- VF-0082 receives no new implementation or concurrency test requirement under the current sequential contract.

New runs must preserve the original trigger and an observable failure/success assertion, bounded neighboring protections and the next legitimate user/tool action. Do not inflate the count with additional marks, cleanup entry points or duplicate phase labels.

## Execution-time reuse protocol

Before a candidate result substitutes for a planned gate, identify its exact receipt/leaf and verify receipt integrity, original command and outcome, complete input membership, before/after equality, current dependency/tool bytes, exports and relevant host conditions. Changes, omissions, missing local artifacts or unknown equivalence mean **RUN the affected gate**, not inferred PASS. No prior approval is inherited.

Record each gate as RUN, REUSE-with-proof, NOT-APPLICABLE-with-boundary or BLOCKED. Retain failed attempts and fixture corrections. Do not run unchanged checks again merely to update hashes, create a commit or repeat a review. If an after-test edit changes a consumed input, renew that gate only.

At planning closeout, **zero historical behavioral PASS results have been accepted as current/future implementation acceptance**. Four historical receipt bundles are intact and the sampled production bytes match; the concrete saving is fixture reuse, no broad baseline, grouped final gates and omission of unrelated hardware campaigns. Final implementation equivalence cannot be certified before its patch exists.

