# Revalidated chat findings execution ledger

Date: 2026-11-03. Base and HEAD: `887c5898d0712cf4053e845bbf286e8dadd3cf80`.
Branch: `codex/revalidated-chat-findings-plan`. Initial worktree/index clean.
Implementation and verification authorized; Git delivery is not authorized.
Implementation accepted by [RCF-R3-20261103](review-R3.md). Final archival
disposition: [RCF-R4-20261103](review-R4.md). No historical behavioral PASS is reused.
Exact current commands and intervals: [validation register](validation-commands.md).

## Decisions

The user delegated the grouped 03/06/17/legacy-08 decisions to the implementer.
Selected the plan's four bounded proposals: validated layout-only fallback;
known immediate predecessor for Previous; preserve manual inspection through
paused appearance changes; correct legacy numeric admission without changing
normalized output or frozen corpora. These reduce surprising navigation and
close an admission bypass while preserving the existing security boundaries.
RCF-19's explicit 100% recovery decision remains authoritative.
RCF-15 preserves aria-hidden visual text in navigation labels.

## M0 source revalidation

All cases remain relevant at this HEAD; these are source observations, not
runtime reproductions or accepted fixes. Regression evidence follows per unit.

| Case | Current owner and reachable residual |
| --- | --- |
| 01 | xhtml-projector.convertNormalText splits and emits each whitespace-delimited word. |
| 02/09 | beginExternalNavigation returns for inactive intent; startAtVisibleLocator lacks placement intent barrier; App restoration is separately pending. |
| 03 | package-document rejects pre-paginated items before later spine validation; container selection precedes that parse. |
| 04 | _recover_outputs restores every missing target backup after checking only target conflicts. |
| 05 | stopForConfigurationChange swallows shutdown failure and returns void; settings callers continue. |
| 06 | boundary navigation selects adjacent sorted retained ranges without provenance of continuity. |
| 07 | SemanticListBlock/Item and projector omit ordinal attributes and empty item effects. |
| 08 | Both normalizers suppress numeric-run entry based on predecessor text without checking prose context. |
| 10 | complete in coordinator tick clears play intent but still publishes and requests pump; timer remains. |
| 11 | ParagraphLeaf checkpoint label promises resume at checkpoint despite paragraph-start activation. |
| 12/22 | isolated adapter accepts cancelled IDs; iterator/cancel consult mutable owner connection rather than a concrete attempt. |
| 13 | optional operation snapshot preserves failed state ahead of idle verification; cleanup retry lacks verified post-commit transition. |
| 14 | core/optional manifest verification and retained cleanup call unbounded fs::read. |
| 15 | nav label collector appends descendant text/alt regardless of hidden state. |
| 16/17 | segment controller terminal and preference refresh settlement reaches reader visible/tracker owner without manual-revision protection. |
| 18 | optional Cancel includes unrelated disabled state and shares pending finalization. |
| 19 | future rate preparation rejection reaches fatal player path; prepared idle processor faults need the same ownership distinction. |
| 20 | scheduler sums individually truncated effective unit durations. |
| 21 | lowBuffer checks duration threshold without exhausted-positive-tail distinction. |

No OOM, universal latency impact, invalid benchmark result, or already accepted
policy regression is inferred from these source paths. Prior corrections remain
regression controls. New work is limited to the five plan units and their tests,
maintained documentation, this ledger and active plan.

## Readiness and evidence

Host PowerShell tool observation (exit 0): Node v24.20.0, pnpm 11.15.1,
uv 0.11.29, cargo/rustc 1.97.1; workspace dependencies and Python venv present.
Original RAF receipts are present. Their runtime results are not accepted for
changed inputs. Core/model artifact reuse requires fresh identity proof.

Raw immutable per-command receipts, logs and complete repository input manifests
belong under ignored `tmp/evidence/revalidated-chat-findings/20261103-01/`.
The existing RAF runner is reused as tooling with only its evidence destination
changed. Every test/validation command uses local PowerShell outside sandbox.
Native mutations use isolated roots or the recorded preserve/restore journal.
Final host and review acceptance remains pending.


## In-progress verification and refinements

All receipts below are local PowerShell outside the sandbox. Full commands,
start/end times, input manifests, tools and output are in the immutable raw
receipts; the gate commands are also registered in the active plan.

- G0-exports and U1-exports: package exports built successfully.
- U1-red: six expected failures for projection, ordinals, labels and numeric
  admission. U1-green-initial: six passed. U1-layout-red: both layout cases
  failed at the original early rejection; U1-layout-green: both passed.
- G2-epub-first: all 514 selected tests passed. Later U1 test/ordinal additions
  require the final combined gate again.
- U5-isolation-red/corrected: rejected-ID and obsolete-channel failures
  reproduced. The first obsolete-channel setup stopped at graceful close;
  the corrected abort setup reached the intended stale read.
- U5-isolation-green exposed pre-dispatch dual-worker cancellation. Preserve
  that explicit idle-owner cancellation through cancel_idle; this directly
  coupled caller is included in the existing dual-worker gate.
- U5-package-red: retired fourth-part recovery failed as expected; genuine
  missing-part recovery passed. U5-combined-first: 117 passed. Later historical
  and failed-restoration variants require the final gate again.
- U2-red: inactive Play and real settings containment failures reproduced.
- U2-types-first passed. U2-U3-first: 483 passed, one old SPM expectation
  assumed a boolean after failed containment. The new explicit rejection is
  checked while retaining all no-write and preference-preservation assertions.
- U2-U3-regressions: 250 passed. U2-U3-regressions-second exposed two navigation
  regressions after history eviction. Continuity is now recovered from the
  current bounded audio FIFO; no edge is inferred across an in-flight synthesis
  gap. U2-continuity: all 18 selected regression/control cases passed.
- U2-U3-types-second found two test-only Testing Library options unsupported
  by its API; removed those Playwright-only options.
- U4-first: compiler requested an explicit Result error type. U4-typed:
  164 passed and one old automatic-staging-cleanup assertion failed. Updated
  it to the approved read-only polling policy, with explicit removal cleanup.
  U4-readonly: default 165 passed/7 ignored; release-locked 164 passed/7 ignored.
- G6-browser-first: eight passed, two assertions failed. The list destination
  mounted synchronously, so the revised test injects Play inside real placement
  instead of expecting an artificial delay. Final controls changed scrollTop
  by 13 pixels while retaining the inspected passage: assert passage visibility,
  not an exact rendered pixel. Screenshots and traces are preserved separately.

Historical package-manifest sizing proof for RCF-14: the immutable
static-audit-corrections user-data-before.json records the exact admitted
hashes and sizes below. The pre-correction v2 and current v7 local manifest
bytes were independently inspected. The optional read cap is the maximum,
2,662,009 bytes, with one additional byte only for oversize rejection. Core
uses the embedded trusted byte length plus one. No payload/model cap changes.

| Authority | Bytes | SHA-256 |
| --- | ---: | --- |
| v2 pre-correction cleanup | 2569804 | cb5055580a28a0c97e50535a8317ea506081230b70e0099d8fe0194591e1c635 |
| v2 corrected cleanup | 2570207 | 1bca3c4e5706771877ad837398e7930206c8f74eb03e9804a093a4c78f0b6262 |
| v3 cleanup | 2660350 | 470ec7e8a6fa1e91f9831e42de7988249220b51d4ecd4352452f3c70b2b6084a |
| v5 cleanup | 2660166 | cffe626cc14fa259b2deaf9da7b7662bd51f5627d0ac7784d9ceea3fb9169418 |
| v6 cleanup | 2662009 | bb902682e366e119e3a7cdc992440b017bd6bd96cf328c3b0863a4eb1eb024e0 |
| v7 current | 2662009 | 48b392d82e9937e369170fd5c816b7a4ad766009f8816739441dddbd076c5d8a |

The local maintainer v4 build has a different hash and is not an admitted
current or cleanup authority; it is not used to justify compatibility.
Python pytest emits an existing cache-write permission warning; test outcomes
are recorded independently and the unrelated cache is preserved.

## Implemented scope and current gate results

RCF-01–22 and all registered variants are implemented. No case is excluded or
awaiting a policy answer. Native gates and independent acceptance are recorded below.
ADR-0070 records the durable policies; M005, frozen corpora and the canonical
system diagram retain their existing boundaries.

| Cases | Implementation and discriminating coverage |
| --- | --- |
| 01 | Coalesced normal-text leaf per semantic run; 20,000-word projection with exact text/identity, existing source mapping and chapter-size controls. |
| 02/09 | Pending placement gates start/resume; inactive/incremental navigation, initial restoration and late narrator attachment. Late attachment exposed a callback-ref identity bug, fixed at its reader owner. |
| 03 | Fully validated layout-only rootfile fallback; exhaustion, later malformed spine and unsafe fixed-layout candidate remain fail-closed. |
| 04 | Coherent missing-output restoration only; retired part 2/3/4 across v2/v3/v6, receiptless ambiguity, archive/tree checks and rollback of failed restoration. |
| 05/18 | Verified containment before settings mutation; Cancel independent of unrelated pending settings and obsolete finalizers. Real coordinator failure and combined failed Reset/download browser journey. |
| 06 | Proven predecessor edges bounded by retained ranges; gaps disable Previous, FIFO evidence restores continuity after history eviction. |
| 07 | Signed 32-bit list start/value and empty visible item effects; hidden/nested controls and distant incremental DOM numbering. |
| 08 | Prose-context guards in all four profiles including legacy; code digit/sign predecessors at 128/129, normalizer/source-window controls. |
| 10/11 | Complete stops ticker; restart owns one ticker. Checkpoint action explicitly promises paragraph-start narration. |
| 12/22 | Cancelled IDs rejected before spawn; generation-bound connection/abort/cancel, stale iterator deadline and explicit pre-dispatch idle cancellation. |
| 13 | Explicit Check retries only verified post-commit cleanup with matching provenance; polling read-only, locked cleanup stays failed and replacement ownership survives. |
| 14 | Core reads trusted length plus one; optional reads admitted maximum plus one, including retained cleanup. Oversize/truncated/malformed/current and cancellation controls. |
| 15 | Hidden descendants excluded from nav text/alt; aria-hidden remains visual, hidden forbidden markup still rejected. |
| 16/17 | Manual inspection suspends visual follow through terminal settlement and paused typography; heard checkpoint stays separate, Resume follows. Browser direct/worklet completion controls. |
| 19 | Future preparation rejection/idle processor error restores 100% with explanation, preserves direct audio, ignores stale choices and reports preference-write failure separately. |
| 20/21 | Aggregate fractional durations before rounding; exact threshold neighbors and mixed active/future rate. Exhausted positive sub-millisecond tail avoids low-buffer warning. |

Current local PowerShell receipts (commands use the plan's registered runners):

| Receipt | Result |
| --- | --- |
| G1-exports-final; G1-epub-types | PASS, rebuilt exports and EPUB types. |
| G1-current-format-check-typescript; G1-current-lint-typescript; G1-current-desktop-types | PASS, Prettier/ESLint and desktop TypeScript. Later browser-only assertion receives closeout checks. |
| G1-current-format-check-python; G1-current-lint-python; G1-current-typecheck-python | PASS, 186 formatted files, Ruff and mypy (182 files). Earlier redundant cast/test-private-attribute failures corrected. |
| G1-current-format-check-rust; G1-current-lint-rust | PASS, fmt and Clippy default/release-locked. |
| G2-epub-final | PASS, 516 tests / 13 suites. |
| G3-desktop-current | PASS, 625 tests / 18 suites including optional retry bridge. Previous G3-desktop-final had 624 PASS and one late-attachment failure; owner fixed. |
| G4-native-current | PASS, default 165 and release-locked 164; eight explicit host tests ignored in each. G9 selects admission separately. |
| G5-python-final | PASS, 126 tests / four files, including dual-worker and package variants. |
| G6-browser-current plus G6-placement-final | PASS across all ten journeys. Nine passed in grouped run; list expected item index 450 instead of anchor 451 (list owns anchor 0). Only that assertion changed; isolated rerun passed. Traces retained. |
| G7 | Not applicable: production native smoke harness unchanged. Exact-local Rust fixture admission-only entry covered by G4/G9; original inference entry preserved. |
| G8-core-check; G8-build | PASS, current core checker and one release build. Playback/cleanup recorded when complete. |

Current-session reuse is scoped by input closure. G2 EPUB source/fixtures/locks
and G5 Python source/fixtures/locks remain identical; later desktop/Rust/docs
edits do not enter those gates. G6's nine passed tests and shared fixture are
unchanged after the isolated list assertion correction. Final source and
installed-dependency comparisons accompany review. No historical behavioral
result is substituted.

Piper payload: fresh full membership, sizes and SHA-256 match all 2,024 files
and all 26 runtime inputs from the original SPM artifact closure. Maintainer
release builders are outside the runtime closure. Current integrity checker
executed; older checker PASS not reused. Optional v7 admission formerly selected
ES/EN GPU inference too; the new admission-only entry matches this plan's scope.
The original full ignored journey retains its behavior.

G8 native Piper EN passed on executable SHA-256
`c8e969995528d177bb0523cb247386d88be29a4e4ee6154e78d22b7043ddefac`.
Quick start 5,744 ms, Prepared 7,004 ms, warm RTF 0.11, cancellation 347 ms;
zero observed underruns, external requests or generated audio files. All six
rates (100/95/90/85/80/75) were exercised with boundary-deferred activation and
latest-selection ownership. Six AudioContexts created/closed; retained/discarded
units zero at cleanup. Original complete Piper resources restored byte-for-byte,
no new owned process or scratch root, preserved sibling absent. Existing two
scratch roots were observed before the test and preserved. These are measured
host observations, not a physical listening assessment or a general performance
guarantee. Browser fault injection supplies the future-worklet failure branch.

The strict installed before/after comparator failed and its failure is retained.
Diagnosis found two derived files: Chromium debug.log and pnpm workspace
validation metadata; every installed library/tool/browser byte and symlink
outside those files remains equal, with complete membership. The pnpm metadata
contains project names/versions, settings and validation timestamp; no installed
dependency change accompanies it. PATH differs only by the runner's explicit
two-directory Node/corepack prefix; resolved Node binary/version is identical.
The final consumed-input comparison documents these exact exclusions and checks
all other environment fields. This is an explained equivalence, not an erased
comparison failure.

G9-local-admission passed: one explicit exact-local test, 712.87 seconds,
171 unrelated tests filtered. All nine existing v7 sources matched the current
authority (three runtime parts and six models). The real local download hook,
reassembly, extraction, promotion, rediscovery, integrity preparation and owned
removal passed with `inference=false`. Afterward all nine source hashes still
matched, prior environment values were restored and no new owned process/root
remained. No network or GPU evaluation was requested.

G10-pre-review-evidence and G10-pre-review-diff pass. R1-closeout-inspection
verifies 161 local Markdown links, no final native-unit leftovers and an empty
Git index. G10-browser-static passes the final browser assertion's Prettier and
ESLint checks. All required runtime gates now have current evidence; acceptance
awaits the independent review of the exact patch. No Git delivery occurred.

R1-evidence-equivalence.json verifies complete relevant source membership and
hashes for every runtime gate, all consumed installed dependencies, unchanged
current binary and renderer/export artifacts. The initial comparison omitted
the runner's separately recorded Python pyvenv.cfg from current membership;
including that same unchanged file on both sides resolves the diagnostic.

## R1 review and R2 correction

[RCF-R1-20261103](review-R1.md) returned CHANGES_REQUESTED with one confirmed
finding, F1. Its identities and results remain immutable. Repeated/slower
selections shared the same pending preparation, but the player incorrectly
treated a selection-revision change as a replacement attempt. The original
regression also asserted that incorrect behavior; passing it did not establish
RCF-19 acceptance.

The bounded correction removes that selection-revision suppression. Preparation
tokens remain authoritative: a still-shared failed attempt falls back once to
100%; releasing/replacing its token through 100%, Stop, close, seek or a new
independent attempt makes its late failure obsolete. Healthy audio is retained.
Corrected tests cover 85→75, repeated 85, and superseding 100 while playing,
paused and after A ends awaiting B; B starts at 100%, A releases/completes once,
and no silent second preparation occurs. Additional controls preserve a newer
independent 75% attempt and suppress old failures after Stop/close/seek.
Coordinator coverage uses 85→75→75 with both saved/unavailable outcomes and
checks one fallback write, visible fallback state and current-handle identity.

R2-F1-focused passes nine tests (including the internal phase variants).
R2-G3-desktop passes all 629 tests / 18 suites. R2-G1-typescript passes final
format, repository ESLint and desktop types. R2-G6-browser passes all ten
journeys together. R2-G8-build creates the corrected app; its native host arm
and cleanup are renewed rather than inheriting R1's binary acceptance.
EPUB, native/Rust, Python and exact optional admission source closures remain
unchanged and are independently compared again for R2. No repeated model copy
or unchanged admission replay is needed when that proof holds.

R2-G8-Piper passes on current executable SHA-256
`2150697b820cfea19900d2ef27f32c6d4c50a87efe58ecfc239b783ba6245d94`:
Quick 5,936 ms, Prepared 6,751 ms, warm RTF 0.11, cancellation 610 ms.
All six rates and latest-selection behavior passed; zero underruns, external
requests or generated audio files. Six contexts closed; retained/discarded
units zero. The complete original resource tree is restored, no new owned
process/root remains and the preserved sibling is absent. Full WebView
membership/hashes were rechecked against readiness before this arm.
R2-evidence-equivalence.json confirms final code/artifact/installed-input
identity, including unchanged G2/G4/G5/G9 closures. R1 native playback results
are historical to that candidate; R2 supplies current acceptance evidence.

## R2 review and R3 correction

[RCF-R2-20261103](review-R2.md) confirms F1 is resolved but requests F2:
the real WebAudio backend retained a released preparation promise, allowing a
later player attempt to adopt its obsolete failure. The manual backend's
independent-attempt control did not reproduce this coalescing.

The backend now records the pending creation's owning token. Same-owner requests
still share it. A post-release request joins that retired creation for cleanup,
ignores its obsolete outcome, rechecks its own token/close state and only then
admits a fresh creation. It never starts simultaneous creations. Close continues
to join the retained creation; a queued replacement cannot start after close.
Real-backend tests control old rejection and old success, repeated 100/slower
alternation, fresh successful preparation, preserved direct audio, node disposal
and final close/join. The corrected shared-attempt fallback controls remain.

R3-F2-focused passes ten tests. R3-G3-desktop passes 632 tests / 18 suites;
final static, Chromium and native playback evidence is renewed for this backend
change. The unrelated EPUB/Python/native-admission evidence remains subject to
the same complete closure comparison. R1/R2 reports and host receipts are retained.

R3-G1-typescript and all ten R3-G6-browser journeys pass. R3-G8-build and
R3-G8-Piper pass on executable SHA-256
`fad859144f391967886da3acf44657b2d2ef63087aed45a4cfce9df3d6ea121e`.
Quick 6,001 ms, Prepared 6,501 ms, warm RTF 0.11, cancellation 213 ms;
six-rate matrix and latest-selection checks pass. Zero observed underruns,
external requests, retained/discarded units or generated audio files at cleanup;
five contexts created/closed. Original full resource tree restored, preserved
sibling absent and no new owned process/root. R3 rechecks WebView membership
and installed dependencies; R3-evidence-equivalence.json confirms the final
closures, current binary/exports and the unchanged G2/G4/G5/G9 inputs.

## Archival closeout

RCF-R3-20261103 approves all 22 cases and variants without remaining findings;
F1 and F2 are resolved. The plan moves to completed with active/completed/docs
indexes updated. The final archival report is RCF-R4-20261103, outside its own
identity manifest; its verdict governs acceptance of that exact documentation
patch. R4 compares the unchanged production/test/host closures rather than
repeating runtime checks. No staging, commit, push, PR, merge or publication.

Remaining limitations are host-specific measurements without human listening
assessment, the disclosed existing pytest cache warning, and explicitly excluded
unrelated GPU/model/security campaigns. No decision or runtime gate is outstanding.
