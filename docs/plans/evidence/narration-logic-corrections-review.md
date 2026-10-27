# Narration logic corrections: independent review record

Task: `NLC-2026-10-26`. Reviewer: independent `change_reviewer`, GPT-6 Astra high,
read-only; no tests or edits executed by the reviewer. Base and HEAD:
`afa2e0f6ec5541499c20b3862656a5bb4c5ac318` on
`codex/narration-logic-corrections`. The initial worktree and index were clean;
all changes are task-owned and remain unstaged. This report is outside its own
review manifest. The [ExecPlan](../completed/narration-logic-corrections.md)
contains command provenance, before/after regressions and gate outcomes.

## Immutable review R01

- Review ID: **NLC-2026-10-26-R01-ASTRA-01**.
- Verdict: **BLOCKED**. Not approved.
- Identity recheck: **PASS**, 59 inspected paths (37 supplied plus 22 unchanged
  supporting paths), unchanged base/HEAD, empty index, no content/blob/status drift.
- Supplied identity manifest: `tmp/evidence/narration-logic-corrections/review-identities-01.json`,
  SHA-256 `8ef71f5c588328e7263a034a170ec2c9a61e283580af4f415abb3b01a025c96a`.
- Complete tracked diff: `tmp/evidence/narration-logic-corrections/review-01.diff`,
  SHA-256 `e67fa1ffb173de38fe0cb495f522c7a6fe3c8ad5ae649e531c716c1b3d93039d`.
  Both new files were read in full. Raw evidence stays in ignored local scratch.

**NLC-R01-F01, P2:** Stop while a compatibility response is pending changes the
run token; discarding that response without renewing availability leaves the
surviving coordinator permanently `checking` and rejects subsequent Start.
The finding is in `ProductNarrationCoordinator.checkAvailability`, with evidence
from `resetRecoveryEpisode`, `#performStopActiveRun`, `start`, and the mounted
controls' coordinator-keyed availability effect. Required correction: settle or
renew availability while retaining closed/replaced-run and revision guards,
without automatic playback; prove delayed response -> Stop -> settled availability
-> successful explicit Start. This was a static finding, not a reviewer-run test.

Other reviewed boundaries: nominal WSOLA progression, final audible checkpoint
before persistence handoff, default-visible CUDA admission with unchanged DirectML,
and mutable Celsius correction/current profile routing. No other confirmed defect
was reported. No new dependency, schema, process, persistence surface, queue or PCM
buffer was introduced; existing locator/cancellation/memory constraints remain.
Neutral Piper requests preserve neutral/English/foreign spans; explicitly Spanish
spans also receive the Celsius correction. No broader neutral-route regression
was established.

Reviewed host evidence: F1 47, F2 90, F3a/F3b 17 each, F4 124, B1 1 passing;
I1 exit 0 with Vitest 209/680/837, Node 100, Rust 120/119 (two explicit ignores
each), Python 645, and passing format/lint/types/build. I1's executable SHA-256
was `e1369be434d87955566631605315f041553b7dea84188d1c47722c61ee42d01b`.
H1 passed all six rates and cleanup with zero generated-audio files/external
requests; human listening was maintainer-confirmed. H2 failed before inference
at installed-profile selection with `tts-optional-profile-unavailable`, consistent
with absent admitted v6 and retained cleanup-only packages. Physical multi-GPU
behavior is unverified and not inferred from synthetic tests.

Required next actions were a new review after fixing NLC-R01-F01, plus mandatory
H2 evidence when its admitted runtime is available. The report authorizes no
installation, download or Git mutation.

## Correction evidence after R01

The implementer reproduced NLC-R01-F01 in two host regressions (same/changed
profile): two failures, 90 passes. Renewing only the still-owned availability
request after run invalidation repaired both: F2 92/92. Playback still requires
an explicit Start. Scoped ESLint, desktop typecheck and B1 pass on the correction.
Final review remains a separate immutable report; this paragraph does not alter
R01's verdict or grant approval.

## Immutable review R02

- Review ID: **NLC-2026-10-26-R02-ASTRA-01**.
- Verdict: **BLOCKED**, solely for mandatory missing H2 evidence.
- **Findings: none. NLC-R01-F01 is resolved.** Deterministic implementation
  criteria are satisfied; complete batch acceptance is not claimed.
- Identity recheck: **PASS**, all 59 paths, unchanged HEAD/base/branch and empty
  index. The 37-entry supplied manifest plus the same 22 unchanged supporting
  paths from R01 were independently rechecked before/after review.
- Manifest: `tmp/evidence/narration-logic-corrections/review-identities-02.json`,
  SHA-256 `efbe2fcf1f774981b3f0a5a04fc86601d81e4363df9d190521af94057de1bc99`.
- Diff: `tmp/evidence/narration-logic-corrections/review-02.diff`,
  SHA-256 `82251171f11f664b4b8e387b790a94c97e7896659c4cbaddb32d43acb5b4376c`.

Only three manifest identities changed from R01:

| Path | SHA-256 | Filter-aware Git blob |
| --- | --- | --- |
| `apps/desktop/src/tts/product-narration-coordinator.ts` | `0f6693d755508f85e37d1eec29f3d3e4ba26fbdb2f64b2842a1a91049a519626` | `6a17e84c13e60ef06c32135475aab3491150b361` |
| `apps/desktop/src/tts/product-narration-coordinator.test.ts` | `82c43c249906b6dc6a13073c918c75453f712cc61d74b5c55262e032b399cb34` | `95500b85ea606e6765501443742e3509f9bb8409` |
| `docs/plans/active/narration-logic-corrections.md` | `bcd5733e8ce5a95e6b94d9745541c580618a9e896bb0ea0b143685d7bacc6217` | `5687f8574d48d65148a650637890f794a3cc162a` |

The reviewer confirmed that renewal remains behind open-owner/current-revision
guards and performs no playback restart. Same/changed-profile delayed Stop
regressions now prove settled availability and subsequent explicit Start;
existing containment, paused-run, unchanged-profile and completion/persistence
controls remain intact. Other NLC assessments from R01 remain applicable.

Fresh host evidence reviewed:

| Command / gate | Result |
| --- | --- |
| Exact F2 coordinator/bridge/save command in the plan | 92 passed, following the two correct pre-fix failures |
| `pnpm.cmd exec eslint apps/desktop/src/tts/product-narration-coordinator.ts apps/desktop/src/tts/product-narration-coordinator.test.ts` | Exit 0 |
| `pnpm.cmd --filter @voxleaf/desktop typecheck` | Exit 0 |
| `pnpm.cmd exec prettier --check apps/desktop/src/tts/product-narration-coordinator.ts apps/desktop/src/tts/product-narration-coordinator.test.ts` | Exit 0 |
| `git diff --check` | Exit 0 |
| `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep NLC` | 1 passed, 23.9 seconds; `B1-R02.log` |
| `pnpm.cmd build:desktop` | Exit 0; `build-R02.log` |
| `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --exercise-playback-speeds --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` | Exit 0; `H1-R02.log` |

Final executable SHA-256:
`4c60a4ee9829983b6f6340c0df50def6513bc0723e93561b43e9dddbe614ecd8`.
H1-R02 passed all six rates, with 5,127 ms quick startup, zero observed underruns
or buffering, 188 ms cancellation, five created/five closed audio contexts,
no stale playback, zero retained/discarded units at cleanup, zero generated
audio files and zero external requests. The executable hash was independently
rechecked by the reviewer.

**Reuse accepted:** F1, F3a/F3b and F4 retain matching source/test inputs.
I1's unchanged shared/EPUB/Rust/Python/schema/dependency/tooling responsibilities
remain applicable. The affected coordinator has fresh F2, lint, type, format,
browser, build and native evidence. The full I1 command was not rerun on R02.
H1-R02 supersedes the original H1 for binary integration; the earlier human
listening confirmation applies only to unchanged WSOLA/runtime behavior.

**Remaining uncertainty and next action:** H2 failed before inference on the
earlier binary and was not blindly repeated on the final binary because its
admitted v6 prerequisite remains absent. H1 and native unit tests cannot replace
Chatterbox startup, synchronization/cancellation, cleanup and privacy evidence.
Physical multi-GPU behavior remains unverified. Keep acceptance blocked; when
the prerequisite is available, execute the exact planned H2 against the reviewed
binary and obtain a new immutable review of that evidence. This report authorizes
no installation, download or Git mutation. Final report-only closeout checks are
separate from the reviewed runtime evidence.

## Immutable review R03

- Review ID: **NLC-2026-10-26-R03-ASTRA-01**.
- Verdict: **APPROVE**. **Findings: none.** NLC-R01-F01 remains resolved;
  the mandatory H2 evidence gap is resolved.
- Base/HEAD and branch remain the planning commit and branch stated above;
  the index is empty. Identity recheck before/after: **PASS**.
- Closed scope: 43 entries in `review-identities-03.json`, plus the unchanged
  22 supporting path/status/SHA-256/blob tuples independently checked in R01/R02
  (no overlaps), and the ignored preparation helper as execution evidence.
- Manifest SHA-256: `e174ba9d6ff2484b2c668941a010a3d387274532e997d29a48976dd872fc027d`.
- Tracked diff `review-03.diff` SHA-256:
  `7e57a8c3d53ef1d36eee0572ca8deed41bd14d7c03968931ebb3b49a395f6271`.
- `prepare-runtime-v6.ps1`: status `!!`, SHA-256
  `784887ee9e2f8c140ccfcff9c77eab7dd989acc74256e723bd9d842010fd55a0`,
  filter-aware blob `59b8f4555c0d0cffb8b54b94a3b5497565c4e334`.

Relative to R02, only the plan, active index and MVP documentation changed.
Runtime source/tests, dependencies, authorities and executable retained their
identities. Both original new files were reread in full; all five corrections
satisfy the reviewed acceptance criteria and preserve privacy, cancellation,
bounded resources, persistence, locators and public contracts.

The reviewer accepted the newly authorized exact-local v6 preparation: occupied
target/active app guards, containment/reparse checks, exact manifests, payload
and six model identities, staging and promotion without deleting prior packages.
The corrected extended-path `check-local` passed, and the existing native
integrity diagnostic passed 1/1 (121 filtered, 142.90 seconds). These do not
establish HTTP acquisition success.

The exact planned H2 command passed outside the sandbox in **403.8935 seconds**.
`H2-R03.log` SHA-256:
`1e2b942404704d78e6e9daff33d8f5383fcbdddaaa1cf8513abca789fdf295cf`.
`H2-R03-result.json` SHA-256:
`d20a46de397bed9353c8f6b45a8801c4035ad6f116ca76df1e891a16f562801b`.
The selected Chatterbox Spanish arm completed: quick startup 47,185 ms with
19,240 ms lead; prepared startup 63,671 ms with 61,040 ms audio; zero observed
underruns/buffering over 60,083 ms; cancellation 292 ms, startup cancellation
235 ms and child shutdown 220 ms. Twelve transitions retained valid ranges and
focus with no stale playback. Five contexts were created/closed; cleanup left
zero retained/discarded units and generated-audio files. The WebView harness
observed zero external requests. Before/after executable SHA-256 matches H1-R02:
`4c60a4ee9829983b6f6340c0df50def6513bc0723e93561b43e9dddbe614ecd8`.

R02's scoped evidence reuse is approved again after identity checks. Fresh
integrity/H2 covers the changed installed-runtime state; no full I1 rerun or
additional human listening is implied. Supplied `check:evidence` and
`git diff --check` closeout results pass. The reviewer ran no tests or mutations.

Physical multi-GPU operation, Chatterbox human listening, HTTP acquisition and
whole-host network traffic remain unverified; they are documented limits, not
missing requirements for this batch. No correction or acceptance evidence is
missing for the exact R03 state. Required next action: archive/link closeout and
a fresh identity-bound review of that saved state. R03 grants no Git mutation,
merge or publication authorization and is not silently extended to later edits.

## Immutable final review R04

- Review ID: **NLC-2026-10-26-R04-ASTRA-01**.
- Verdict: **APPROVE**. **Findings: none.** No mandatory implementation,
  host evidence or archive/link correction remains pending.
- Base/HEAD: `afa2e0f6ec5541499c20b3862656a5bb4c5ac318`; branch
  `codex/narration-logic-corrections`; index empty.
- Identity recheck: **PASS**, before/after, no content/status/blob drift.
- Closed scope: the 46-entry `review-identities-04.json`, the reviewer's 22
  supporting tuples retained in ignored `review-supporting-identities-04.txt`,
  and the unchanged preparation helper from R03. `docs/README.md` overlaps
  both lists: **68 unique reviewed paths**. This record is excluded from itself.
- Manifest SHA-256:
  `b642b0d17f9bb987fee0aefa0903a9d7226dff869dcc100f5b6f94bc77528730`.
- Tracked diff `review-04.diff` SHA-256:
  `941e39a24642ea75b29d143dc39ff65842424e213f6caf28dd33ef6b2defc3ae`.

Both archive sides were reviewed: the active plan is `DELETED`; the completed
plan is an untracked new file with SHA-256
`b529e9e292351031333b182eab7f491c5458c40a5d238e1c5e1c2a811905ad80`
and filter-aware blob `46a4237b4b09f9f564f41083cc2c6d3c074673a3`.
The helper retains its R03 identity. Runtime source, tests, dependencies,
authorities and the final executable remain identical to R03; executable
SHA-256 is `4c60a4ee9829983b6f6340c0df50def6513bc0723e93561b43e9dddbe614ecd8`.

The reviewer read the archived plan in full and confirmed preserved criteria,
results, scoped reuse, failure history, authorization and limitations. Maintained
indexes, MVP/testing documentation and ADR-0063 resolve to the completed plan;
the active directory contains only its index. During review the excluded R02
identity row was restored to its historical active path, preserving the original
hash/blob. This was an archival transcription repair, not renewed approval or a
change to any R04 manifest-covered file.

R03 acceptance and evidence reuse remain applicable. H2 log/receipt identities
still match and the executable remains the one validated by H1-R02. Normal-host
`closeout-R04.log` records `pnpm.cmd check:evidence` and `git diff --check` exit 0,
six valid incoming plan links, and absence of the old active-plan path. No new
behavioral tests are required for this documentation-only closeout. The reviewer
ran no tests, builds, formatters or mutations.

Remaining limitations are unchanged: no physical multi-GPU, Chatterbox human
listening, HTTP acquisition or whole-host traffic claim. They are outside the
required acceptance scope. No correction or acceptance gate remains. Only saving
this excluded report, its ordinary evidence/diff checks and the coordinator's
final identity recheck remain administrative closeout steps; unchanged approved
paths do not require another review. No Git mutation, merge or publication is
authorized by this report.
