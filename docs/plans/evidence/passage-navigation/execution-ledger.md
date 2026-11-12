# Passage navigation execution ledger

Execution authorized 2026-11-12. Initial HEAD is
`6dd694b815bf52b34e4644487067ec2ba3a8956d`, branch
`codex/passage-navigation-execplan`; worktree and index were clean. No Git
delivery is part of this execution.

## M0 baseline

Normal host PowerShell 7.6.9, Node 24.18.0, pnpm 11.15.1. Original FPA receipts
and their before/after manifests were compared again before source/test edits.
All recorded rows, source/output membership, selected tool binaries and captured
environment match the original independent review. G1:614, G2:457, G6:633,
G11:637 rows; all 251 package output files match. Historical desktop evidence is
a baseline only, never acceptance of this patch. Original G2 and package outputs
are reuse candidates for the final independent review; no package inputs change.

Ignored baseline receipt: `tmp/evidence/passage-navigation/baseline-reuse.json`.
The comparison helper is copied into the new evidence directory and writes no
historical receipt. All subsequent gates use `run-host.ps1`, recording the exact
expanded command, environment, before/after input identities and original log.

## Reproduction records

- `red-01`: no selected tests, not RED evidence. A test-edit helper failed UTF-8
  decoding before writing; the command therefore selected zero existing PN cases.
- `red-02`/`red-03`/`red-04`: preserved development diagnostics. The real opened
  publication is frozen and uses prototype methods; observation must bind those
  methods without replacing their behavior. Preparation also needs its existing
  asynchronous scheduling, not a microtask-only wait. These harness failures do
  not establish PN-02.
- `red-04`: PN-01 paused navigation enables and emits the distant successor
  across separate batch windows with genuine continuations. The preparing arm
  remains a control; adjacency can already be supplied by current preparation.
- `red-05`: eight real EPUB/App/Reader/coordinator/save cases, four expected
  failures (approximate/unavailable placement in playing and paused intent) and
  four passing controls (exact and clamped-visible). Production unchanged.
  Exact command: `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t 'PN-02'`.
  Log SHA-256: `BE5489FFE309C4EBFA6978975AFCF0D5D4B5B625F88F44165EB639F26D4F1D13`.

## Additional reproductions and corrections

- `pn04-red-02`: two integrated failures after actual measured manual inspection.
  With missing follow geometry, Resume and the next audible segment changed the
  next ordinary Play preparation input from offset1200 to0/135. No completion
  projection or successful-follow control was removed. `pn04-red-01` used a
  nonexistent snapshot property and is a discarded observation, not evidence.
- `pn03-red-original`: the revised existing resolver-failure assertion fails
  against the original ReaderPublication source. The helper restored the task's
  file byte-for-byte in `finally`. The injected missing-spine exception remains
  distinct from real EPUB nearest-valid recovery.
- `focused-02`:17 discriminating checks pass after the first corrections.
- `pn03-supersede-red`: injected rejection of a newer intent allowed the older
  pending restoration to admit offset5. Admission now cancels that restoration
  and its save revision immediately. Reflow created during awaited containment
  is also cancelled immediately before committing the new document.
- `late-attachment-red`: a narrator attached during an explicit pending request
  stayed busy because attachment omitted its identity. Passing the same request
  through the existing attachment callback fixes this. `reader-late-final-05`
  passes all70 reader cases, including initial restoration and availability.

## Earlier deterministic and browser selection

All receipts below were executed in normal host PowerShell. Raw `.json`, `.log`
and `.before`/`.after` files are under ignored `tmp/evidence/passage-navigation/`.
Every passing validation receipt has identical before/after recorded source,
configuration, package output and tool rows. Formatting writes are mutations,
not behavioral validation, and intentionally have differing input identities.

| Receipt                                            | Result                 | Reuse/invalidation disposition                                                                             |
| -------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| `desktop-02`                                       | 456/456, ten suites    | Original current union; later changes invalidate reader consumers only.                                    |
| `highlight-final-01`                               | 9/9                    | Renewed after removing an unused import; controller and test unchanged since.                              |
| `desktop-final-04`                                 | 380/380, four suites   | Coordinator/App/package-reader/Reader renewed for intervening reflow cancellation.                         |
| `reader-late-final-05`                             | 70/70                  | Adds late-attachment regression and renews the one affected reader lifecycle gate.                         |
| `desktop-consumers-final-06`                       | 311/311                | Renews coordinator/App/package-reader after the late-attachment correction.                                |
| `types-final-06`                                   | pass                   | Current complete desktop type check.                                                                       |
| `lint-02`, `lint-final-03`, `reader-lint-final-06` | pass                   | Scope is the11 changed JS/TS files, with changed files renewed.                                            |
| `format-final-02`, `reader-format-final-06`        | pass                   | All11 changed JS/TS files, with the two reader files renewed.                                              |
| `harness-01`                                       | 57/57                  | Current native harness; its package rebuild emits the same251 artifacts. No separate package build needed. |
| `browser-final-03`                                 | 12 pass, BNC-01 failed | Preserved failure: reflow created during containment suppressed the later manual save.                     |
| `browser-bnc-04`                                   | 1/1                    | BNC-01 passes after restoring pre-commit reflow cancellation.                                              |
| `browser-navigation-final-05`                      | 6/6                    | Renews PN geometry, VCA, initial recovery and both delayed-request cases.                                  |
| `epub-final-01`                                    | 482/482, nine suites   | Renewed original selection; no historical EPUB behavioral PASS claimed.                                    |

At this stage the selected desktop total was458 distinct checks. The other68 checks in five
unchanged suites remain attributable to `desktop-02`; nine highlight checks use
`highlight-final-01`. Four-suite renewal plus the additional reader case covers
the remaining381; the final reader and three-consumer receipts supersede the
earlier four-suite receipt. Reuse is subject to independent review of each input scope.

The intermediate Chromium coverage totaled13 distinct cases. Six unaffected cases from
`browser-final-03` cover image/initial checkpoint behavior, paused manual inspection,
terminal projection and late automatic-scroll delivery. Their paths do not execute
the changed `continueNavigation` branch. The other seven use `browser-bnc-04` and
`browser-navigation-final-05`. The latest attachment edit will be assessed separately.

`browser-01` preserved a test observation failure: old paused preparation advanced
between the initial sample and navigation containment. The corrected assertion
checks service starts (no new run), inactive intent and unchanged checkpoint,
rather than forbidding existing paused preparation. `browser-02` then passed4/4.
The original escaped-dot filter omitted three five-pass cases under Windows command
forwarding; `[.]` selects them explicitly. The original screenshot/trace folders
are copied into ignored `browser-01-artifacts` and `browser-03-artifacts`.

The unchanged EPUB historical manifest lacks the complete Vitest dependency graph,
so behavioral reuse was declined. `epub-final-01` captures6,042 installed dependency
rows before/after with identical SHA-256
`7EC365793CBACF83E96166481FCB45999FC6018E28F6C28A5F0346C1640F19E1`.
Its log SHA-256 is
`48D0C12D1613CA041D6425B5D21D9918F6B9908DEA8E68CE52C8073D06ECD992`.
Source fixtures, earlier controls,251 identical generated package artifacts,
installed model payloads and build caches are reused separately from test results.

## Exact acceptance commands

The ten-suite desktop command and nine-suite EPUB fallback command are the selections
in the ExecPlan and original FPA receipt. Renewed desktop subset:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/integration/package-reader-matrix.test.tsx src/reader/ReaderPublication.test.tsx src/App.test.tsx
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/segment-highlight-controller.test.tsx
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/integration/package-reader-matrix.test.tsx src/App.test.tsx
pnpm.cmd --filter @voxleaf/desktop run typecheck
pnpm.cmd test:native-smoke-harness
pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts reader-image-lifecycle.smoke.spec.ts --grep 'PN-|five-pass 1[.]1|five-pass 5[.]1|VCA-06/09|BNC-01|RCF-17|final RCF-16|DCR-03/23|RPI-01/C1'
pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts --grep 'BNC-01'
pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts --grep 'PN-|five-pass 1[.]1|VCA-06/09|DCR-03/23'
```

Scoped Prettier and ESLint use the exact11-file argument list in `format-final-02.json`
and `lint-02.json`; changed-file renewals have their own exact command receipts.
Earlier failed type/format/lint attempts are preserved: one optional-request
narrowing error, one unused import and a line-wrap correction, all addressed.

## Native preparation

Read-only `native-final-passage-a01` preflight verified drivers, Piper assets,
available host state and private recovery journal inputs. It captured13,317
source/tool/Cargo rows,1,494 runtime/build JS dependency rows and2,164 core-interpreter
rows, stable before/after. Runtime/build JS matches the historical native receipt
exactly. No host resource was moved in preflight. The subsequent reader attachment
edit invalidates that source binding; renew preflight before starting native gates.

The existing native seek scenario now checks that the first new highlighted range
follows the prior end with only whitespace in this synthetic fixture. It retains
only a boolean, not text, and supplements existing visibility/cancellation checks.
Python/Rust full suites, GPU/ES portfolios, installer and broad performance matrices
remain omitted by the bounded desktop scope. Acceptance, native host restoration
and independent APPROVE were pending at this stage.

## Independent review correction and renewed acceptance

[PN-20261112-R1](review-r1.md) returned BLOCKED with PN-R1-F1: unavailable
preference reflow could falsely enable Play after a failed passage placement.
`review-f1-red` first failed because Settings had not been opened; that is a
test-harness diagnostic. `review-f1-red-02` then reproduced the actual erroneous
`canStart=true` in both playing and paused cases on unchanged production.
The preference callback now admits only aligned or measured visible placement.
The integrated cases retain gating through unavailable and offscreen reflow,
preserve the admitted checkpoint, then recover after measured geometry and
explicit Play. Initial restoration and successful reflow remain covered.

The review also declined earlier desktop/lint/format reuse because their original
receipts did not capture the full installed JS closure. `final-dependencies.before`
and `.after` bracket the renewed gates with6,042 identical rows, SHA-256
`7EC365793CBACF83E96166481FCB45999FC6018E28F6C28A5F0346C1640F19E1`.
The new host helper includes docs, repository scripts, its own identity and the
dependency snapshot, closing the earlier documentation-manifest gap.

Current deterministic acceptance is458 distinct desktop tests: `desktop-final-07`
passed all458; following a React ref-declaration move and typed test cleanup,
`desktop-affected-final-08` renewed the381 reader/App/coordinator/integration cases.
The other77 cases in six unchanged suites reuse `desktop-final-07` within the same
dependency bracket. No result from the earlier unbracketed desktop runs is needed
for final acceptance. `types-final-09`, `lint-final-09` and `format-final-09` pass.
`browser-final-09` passes all13 selected Chromium cases, replacing earlier browser
reuse. `epub-final-01` remains482/482 under its own complete dependency bracket;
`harness-final-02` renews57/57 with a fresh complete dependency bracket. Exact commands and source identities
are in [current acceptance bindings](acceptance-bindings.md).

Development diagnostics remain preserved: `types-final-07` rejected unsupported
Testing Library `exact` options and access through an unknown locator;
`lint-final-07` rejected forward ref declarations; `changed-format-final-08`
requested a test line-wrap adjustment. Corrected current checks pass. These
were not suppressed or reclassified as successful checks.

`native-final-passage-a02` passed startup/build and Piper EN; host process/firewall
state, original resource identity and contents were restored, with no hold left.
PN-R1-F1 changed the renderer afterwards, so A02 is prior-revision evidence only.
`native-final-passage-a03` passed both gates for the corrected renderer, with
matching source/tool/output identities and verified restoration. Both gates used
the same executable and frontend. Its original adjacent resource was restored,
no hold remained, and post-harness host comparison also matched preflight.
No production dependencies, Python/Rust source, package contracts or model
payloads changed.

## Closeout

[PN-20261112-R2](review-r2.md) accepted the runtime and evidence but requested
PN-R2-F1: correct local timestamps mislabeled as UTC in the curated digest.
The digest now preserves original ISO UTC strings, without changing raw receipts.
R2 also requested the renewed57-case harness because its earlier jsdom identity
was missing; `harness-final-02` and its6,042-row before/after closure supply it.
The final documentation and exact current-patch acceptance are recorded in
[PN-20261112-R3](review-r3.md), outside that report's own identity manifest.

Final outcomes: PN-01 corrected symmetrically; PN-02/03 corrected with attributable
outcomes and safe recovery; PN-04 confirmed under controlled geometry and narrowly
corrected. Natural missing-geometry frequency remains unmeasured. No guarantee
of absence of every possible future navigation defect is implied.

Reused evidence is limited to the independently accepted77 unaffected desktop
checks within this execution and the current EPUB receipt after later desktop-only
edits. Original fixtures,251 byte-identical package outputs, installed model
payloads and build caches were reused. No historical PASS accepts changed code.
Native A02 was superseded by A03 after F1. Unrelated Python/Rust, ES/GPU, installer
and broad performance matrices remain omitted by scope. No Git delivery occurred.
