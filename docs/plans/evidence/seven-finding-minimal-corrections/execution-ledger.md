# Seven-finding corrections: execution ledger

Execution date: 2026-10-30. Branch `codex/seven-finding-minimal-corrections-plan`;
base and HEAD `79bcb814d57c3b8016c1c1315684c1eb158e2a59`. The worktree and index
were initially clean. All listed edits are task-owned; no Git mutation or
publication is authorized. All tests/validation ran in normal local PowerShell
outside the managed sandbox. [Original receipts and exact commands](host-receipts.md)
identify inputs, tool versions, UTC times, exit codes and output digests.

## Findings and implemented boundaries

| Finding | Pre-fix evidence | Correction and current disposition |
| --- | --- | --- |
| R7-01 | Five corrected manual-ticker regressions fail on cleanup/recheck ownership in G1-desktop-ticker-fixed. | Retain failed scheduler/player owners; reset joins containment and retries cleanup, keeping admission unavailable on failure. No automatic Play. Implemented. |
| R7-02 | Header and body loopback cancellation exceed the two-second fixture budget in both modes; original cancellation waits about three seconds for the fixture server. | One bounded async request/body task, cancellation handle publication under its registry lock, abort plus joined settlement before staging cleanup. Existing manager/disk/promotion owners retained. Implemented. |
| R7-03 | Three injected join/close/survival outcomes lose `_process` in G1-python-owner. | Invalidate eligibility immediately; retain the process until verified termination and handle release, reject replacement while cleanup is pending, allow repeated close. Implemented; benchmark tooling only. |
| R7-04 | Start/completion observations allow stale A to settle after B in G1-desktop. | Cancel pending preference reflow when the authoritative audible locator advances, before updating the existing tracker/navigation owner. Equal-locator projection preserves ordinary reflow. Implemented; no claim that the guarded durable position was always overwritten. |
| R7-05 | Four of five profile branches change complete text/ranges across batch sizes in G1-epub-fixture; the Piper fixture already passes and remains a control. | Private fixed-shape quote parity/counters at exact returned/internal continuations, cold reconstruction and incremental work accounting; no retained prose, scanner/packer/schema/limit change. Implemented. |
| R7-06 | Four microtask/immediate-write regressions strand B or let close miss it in G1-desktop. | Publish drain ownership before synchronous work, clear ownership with empty-queue observation, join successive drains until quiescent. Implemented. |
| R7-07 | Both native feature modes deterministically bind A's ES start to B's EN configuration. | Configure selected profile and publish child under one admission/operation scope; release admission before handshake. Implemented for native concurrency; ordinary UI occurrence is not established. |

## Selected consolidated checks

| Gate | Current result / receipt |
| --- | --- |
| G0 | Workspace exports built; existing Piper core integrity check passes. No regeneration/download. |
| G2 | TypeScript format/lint and EPUB/desktop types pass (`R1-G2`, preceding runner format/lint). Python format/lint/mypy pass (`G2-python`: 184 format files, 181 mypy sources). Rust fmt/clippy both modes pass (`G2-rust-final`). |
| G3 | 251 tests in six selected EPUB files pass (`R1-G3`), including all three quote types crossing source windows in all five profile/language branches. |
| G4 | 217 tests in seven selected desktop files pass (`R1-G4`) after the quotation policy correction. |
| G5 | 17 isolation/dual-worker tests pass (`G5-python`). Host pytest cache permission warning is retained; assertions and owned-child cleanup pass. |
| G6 | Optional module: 64 passed, two explicitly ignored in each mode. Supervisor: 33 default / 32 release-locked passed, five explicitly ignored per mode. Final `*-r2` receipts bind current native code. |
| G7 | Two selected Chromium scenarios pass again (`R1-G7-browser`); final rebuilt model-free native smoke passes (`R1-G7-native`) with zero external requests/new retained roots/processes. |
| G8 | `R1-G8` passes on the final G7 binary using the verified staged current package. Complete cleanup and original pre-existing directory restored. Earlier failure/diagnostic and superseded pre-review pass remain recorded. |
| G9 | One supervised bilingual test passes; 13,091 runtime files verified. ES/EN cancellation 242/224 ms, zero network attempts/audio files, no retained child; scratch removed. |
| G10 | Evidence/whitespace/local links pass; implementation APPROVE R7-R2-20261030. Documentary archival has separate current-identity assessment R7-R3-20261030. |

The final native R1-G7 executable is SHA-256
`d29ab5bfc6706a713c6528c50d5c6dc882963d7e9f7e36c01907f43cceb22ce3`,
12,452,864 bytes. R1-G8 checks this identity before and after, without rebuilding.
G7's configured browser hook repeats only the incremental workspace export build;
no separate native build or model preparation was added.

## Failures, corrections and rerun causes

- G1-desktop's R7-01 cases initially omitted the manual failure ticker. A failed
  text-edit command left the first ticker rerun unchanged; that redundant run is
  retained, not counted as evidence. Correcting the fixture produced five
  discriminating failures before the coordinator fix. R7-04 and R7-06 already
  failed their intended assertions in the original grouped run.
- G1-EPUB's first fixture exceeded its test timeout; the next exceeded the
  bounded request count. Reducing only fixture size while retaining a source
  window cut produced four semantic mismatches and one passing Piper control.
  Final coverage rotates all three quote types through the long paragraph.
- G1-Python initially stopped on failure classification; the corrected test
  first checks retained process ownership and demonstrates all three losses.
- G1-native's combined stalled-transfer case stopped at the header failure.
  Body cancellation was split and run in both modes before the production fix.
- Initial Rust clippy caught helper-call adaptations and argument count; the
  transfer context tuple restored the bound. Initial optional module runs found
  an incorrect expected fixture payload hash; fixing that test value justified
  the final module runs in both modes. No production timeout was weakened.
- Initial G4's two reader failures inspected a passive callback for an audible
  update. The next case exposed unconditional reflow cancellation on duplicate
  projection. The correction preserves equal-locator restoration and checks the
  actual navigation state. G4-reader-r3 passed; a later TS check required an
  explicit spy-context type, followed by final consolidated G4.
- Formatting and type failures remain in original receipts. They prompted
  affected checks only. G3 expanded after inspection found curly/guillemet
  window cuts were missing; this is an acceptance-coverage correction.
- G8 first timed out after roughly 95 seconds in its saved-0.75x scenario.
  Binary identity and cleanup passed. The generic stage lacked predicate/state
  evidence. The plan explicitly expanded only runner diagnostics and their
  configured Node leaf: 45 tests pass, including preservation of the original
  error and cleanup when diagnostic observation itself fails. A diagnostic
  replay is separate from a corrected-condition acceptance attempt.

G8 diagnostic replay reproduced the first availability wait: selected rate 75,
service stopped, zero audio contexts, availability unavailable. Read-only host
inspection found the adjacent resource manifest was stale (`0da4a9c3...`) while
the embedded authority/current package is `526447762...`. Native discovery
rejects unequal manifests. One corrected-condition run preserves the original
directory at an exact sibling, temporarily stages and hashes all 2,023 current
files, then restores the original directory in finally. No admission condition
or test assertion is weakened; this is the sole infrastructure retry.

## Reuse and exclusions

No previous-task test result is reused. EFC/SFA/MAF counts are historical context.
Existing Piper package bytes were reverified by a new package check. Chatterbox's
retained manifest matches
`48b392d82e9937e369170fd5c816b7a4ad766009f8816739441dddbd076c5d8a`;
six model file sizes/SHA-256 were freshly checked before use. The selected G9
fixture verifies every manifest-owned runtime file. Existing supported Node,
pnpm, Python, Rust and matching WebDriver are reused without installations.

Current-task retained checks are Python after its last edit, Rust format/clippy
and module tests after the final native-source edit, the unchanged Node runner
leaf and G9. R2 independently verifies their relevant inputs and responsibilities
are unaffected by the later EPUB correction. G2 TypeScript/exports, G3/G4,
Chromium, G7 native and G8 Piper were renewed for the final EPUB bytes; their
original R1-prefixed receipts match the final reviewed source. No historical
PASS or superseded executable result accepts this final binary.

The initial G3-expanded command formatted its test before execution; its bytes
were captured during G7-native and after by G2-ts-expanded. R1 accepted that
attribution. It is now superseded by R1-G3, whose captured inputs already contain
the final formatted regression, including the independent-review correction.

Out of scope: aggregate portable/full suites, unchanged standalone player/guard
suites, full speed/listening/performance portfolios, historical dual-worker
model benchmarks, Qwen, full optional acquisition, package regeneration,
installer/uninstaller/firewall journeys and hosted CI. None is marked PASS.

## Resource ownership and limits

Raw resource journal and before/after process/root identities remain local.
G7/G8 preserve the two pre-existing native smoke temporary roots and create no
new retained roots/processes. Existing user runtime/model directories are read
only. G9 has a fresh short task-owned scratch root, verified before use and
eligible for deletion only after no owned runtime process remains. No broad
process termination or user package/settings cleanup is authorized.

The canonical diagram was reviewed: ownership/topology is unchanged. Current
overview/testing documentation records the restored invariants. Frozen M005
plans, corpus, schemas, profile IDs, dependencies and runtime packages are intact.
No new support, speed, listening-quality or universal performance claim follows
from these bounded correctness checks.

## Independent review

[R7-R1-20261030](review-R1.md): CHANGES_REQUESTED, one P2 classification
mismatch in R7-05; no actionable findings in the other six corrections.
`R1-red` (three passes) used too short a tail to expose the selected packing
boundary. `R1-red-boundary` extends that tail: neutral/Spanish fail complete
segment/range equality; bilingual passes. The owner was unchanged for both runs.
The summary now invokes the selected normalizer's existing apostrophe predicate
instead of duplicating its classification. Original malformed punctuation and
bilingual Unicode semantics are preserved; no public package export changes.

Relevant format/lint/types and G3/G4/G7/G8 are renewed after the EPUB production
change. Earlier same-task G7/G8 pass is historical for R1, not acceptance of the
new binary. Python/Rust/G9 and runner-specific checks retain original receipts
with unchanged inputs. [R7-R2-20261030](review-R2.md) APPROVES the implementation with F1 resolved and no remaining findings. The plan is archived and indexes updated. Final archival assessment is R7-R3-20261030; its own report/identity transcription are excluded from its manifest to avoid recursion.


## Final host limitation

The adjacent Piper resource directory predates this task and remains at its
original obsolete manifest after both verified runs. It was preserved, not
silently replaced. Final acceptance uses the current verified package temporarily;
future local use must also supply current resources. No source-acceptance blocker
remains, but the restored old runtime root is not asserted to work with this binary.
