# Reader Stop and evaluator correction follow-up

Task base/HEAD: `c407cfa45ddb050d1e51ebc2f043fd498fea0393`, branch
`codex/revalidated-findings-execplan`. The user's new authorization reopened
VF-0074 and VF-0082 after the prior accepted plan. Commit `c407cfa` contains the
previous 17 corrections; its R04 review and every historical plan remain intact.
No push or PR is part of this follow-up.

## Scope, triggers and next actions

**VF-0074.** A last-heard locator was vulnerable to a distinct unmarked visual
sample delivered after Stop. The original unchanged-geometry tracker guard and
dedicated reflow guard remained effective, so a direct artificial save was not
proof. The new mounted case uses the existing EPUB/PNG fixture builders, native
image decode (held completion), bounded synthetic silent PCM and controlled
audio-completion callbacks. It hears seven segment starts, captures offset 607
before Stop, then releases an inline image in that paragraph: placeholder 96 px
becomes a 1 px image. Real geometry/observer delivery reaches ReaderPublication,
App and the save coordinator. No callback injection, artificial save or synthetic
scroll notification is used in this variant. `pagehide` only flushes admitted
state. On the original owner, 627 replaced 607 and survived same-byte reopening.

The save coordinator now extends its existing heard protection to passive save
admission. Validated measured movement returns authority; a duplicate first
locator releases protection without another write. Invalid locators do not
release it. Tests retain active narration, no-heard/ordinary reading, canonical
identity, coalescing, close, recovery, dedicated reflow and stale-placement
controls. Real PageDown and another same-byte reopen establish the legitimate
next user action. R7-04 and CCF-C08 preserve typography/advancement behavior.
Silent PCM and completion controls do not establish physical audibility.

Earlier coverage checked unchanged geometry and took its reference after Stop;
the unit movement control also called an unmarked passive save. Those omissions
are demonstrated. The precise prior human review rationale is unknown. The
earlier inconclusive disposition was correct for its recorded evidence.

**VF-0082.** Two valid corrections for different marked cases of one evaluator
could pass the missing-file check and both publish success. Ready-session
operations now acquire one nonblocking OS lock before mutable reads,
invalidation and publication. The same ownership encloses submission,
aggregation, cleanup and CPU-fallback derivation through private removal/output.
Overlapping correction/correction, submit/submit, correction/aggregate,
aggregate/correction, correction/cleanup and correction/derive are rejected in
finite real child processes; accepted private bytes stay unchanged. Terminating
the paused owner releases ownership and permits sequential correction,
aggregation and cleanup. Nonempty lock files fail closed unchanged. Existing
invalidation failure/retry and stale-aggregate consumer controls still pass.

The legitimate next action is to finish/stop the current command and retry
sequentially, then aggregate/derive and clean up. A second accepted correction
remains forbidden. One empty sibling coordination file remains per session;
see [ADR-0077](../../../architecture/decisions/ADR-0077-exclusive-ready-quality-operations.md).
The previous exclusion was an explicit supported-contract decision, not a
demonstrated regression of VF-0014. New authorization adds defensive rejection,
not parallel successful generation/finalization or a transaction protocol.

## Commands and evidence selection

Every result below ran in normal local PowerShell outside the sandbox. Raw
attempts are retained under ignored `tmp/evidence/five-search-findings/<id>/`.
Each complete receipt binds commands, exit codes, timestamps, HEAD, environment,
input/dependency snapshots and output SHA-256. Node 24.18.0, pnpm 11.15.1 and
uv 0.11.29 were offline with the existing installed dependencies/browser.
Final component runs used Windows PowerShell 5.1; the package runner used
PowerShell 7.6.9 and invoked Windows PowerShell with its built-in module path.
Native stderr rendered as PowerShell `NativeCommandError` records in the 5.1
capture; command exit statuses and assertions determine the recorded outcomes.

- Desktop final: `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/persistence src/reader/active-visual-locator.test.ts src/App.test.tsx`.
- Browser final: `pnpm.cmd --% --filter @voxleaf/desktop test:browser reader-reflow-restoration.smoke.spec.ts --grep "R7-04|CCF-C08|FSF-VF-0074|preserves one canonical|operates reader landmarks"`, via retained `followup74-final-browser.ps1`.
- Python final: `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py -q --tb=short -p no:cacheprovider`. CPU-fallback coverage is in this suite; there is no separate CPU-fallback test file.
- Current static checks: `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:typescript`, `pnpm.cmd typecheck:typescript`, `pnpm.cmd format:check:python`, `pnpm.cmd lint:python`, `pnpm.cmd typecheck:python`. TypeScript includes shared/EPUB build and types; Python checks 199 formatted and 195 typed files.
- Package: `pnpm.cmd package:windows:verified-core`, `pnpm.cmd package:windows:check`, `pnpm.cmd package:windows:lifecycle -LifecycleReceipt tmp/evidence/five-search-findings/<id>/windows-lifecycle-receipt-v1.json`.

**REUSE:** no historical behavioral PASS covers either new assertion or modified
owner. Existing fixture builders, inputs and neighboring tests are reused, then
executed. R02 renews Python evidence after the link-admission change. Desktop and
package evidence retain the same owners, tests, configs, tools and installed
dependencies; only unbundled benchmark ownership/tests and prose change. The R02
equivalence receipt lists every difference and its consumer boundary. Package build
and integrity are retained from the same installer while only failed lifecycle
is repeated. No old package PASS substitutes for this new frontend.

**NOT-APPLICABLE:** unmodified EPUB normalization, shared contracts, Rust owner
unit/lint campaigns, GPU/model/quality benchmarks, live downloads, signing,
Defender and physical listening. Native packaging/lifecycle still runs as
required. No performance or POSIX execution claim is made.

## Attempt ledger

All complete attempts below are RUN, including failed/intermediate attempts.
`followup74-manual-red-01` additionally retains partial files: Windows PowerShell
5.1 stopped the original runner on native stderr before producing a receipt.
The unchanged test was rerun with the existing `run-windows.ps1` capture as
`followup74-manual-red-02`; no owner edit intervened.

| Attempt | Outcome and purpose | Receipt SHA-256 |
| --- | --- | --- |
| `followup74-before-stop-01` | RUN: 1 PASS; pre-Stop reference alone did not reproduce delivery. Exit 0. | `9626d0d5f54e3432b133bca57eba4c022e9fa10ce4df58d4e36ca567d04f4aff` |
| `followup74-image-01` | RUN: 2 PASS; early image with the prior typography flow, no product reproduction. Exit 0. | `a5fd23aecbbfe912a282c8081da7cdce97cf2e9d2baaef617f4fc02b60606f10` |
| `followup74-image-02` | RUN: 2 PASS; delayed image without advancement, no reproduction. Exit 0. | `8d20a8716bb73bcc6522628895691305af5b94d192b21e028345eb20e4bad67b` |
| `followup74-image-interior-01` | RUN: 1 PASS / 1 FAIL; invalid fixture assumption: Play starts the segment at 0, not the requested offset 37. Not product RED. Exit 1. | `295f5ea82c4c18733a4b668c2b608d5330429b6bb3e5a2bbe488ffe8a5cb8bd0` |
| `followup74-image-interior-02` | RUN: 2 PASS; actual interior heard advancement, image in the preceding paragraph. Exit 0. | `10c1fc9c21230b5a12a1a15a76410e8637027f6ca4fbb633274abae802beefff` |
| `followup74-image-follow-01` | RUN: 2 PASS; seven segment starts in a shorter viewport, preceding image. Exit 0. | `4ee515f2efbdc87a133d8cbf6836260d73e8860876bad48a512935e57e3aaecb` |
| `followup74-image-observation-01` | RUN: 2 PASS; observed image 96→1 px and root geometry change, checkpoint still stable. Exit 0. | `16f40804299eae31d765c914068b197e60218f5680e75a62350e64fbb5df7cad` |
| `followup74-image-settled-01` | RUN: 1 PASS / 1 FAIL; inline image in the heard paragraph, after settling Stop. Includes synthetic scroll notification; superseded by the natural-delivery witness. Exit 1. | `56a433c73886e55b4f5e33706140c5a82fea09676ca20945f96936871b084f7f` |
| `followup74-red-reopen-01` | RUN: 1 PASS / 1 FAIL; soft assertions observed replacement surviving reopen. The manual comparator was then corrected to compare its actual prior saved state. Exit 1. | `80d8f235567d78e6cf4176b9602c5b06a3c7065fe3df66c2ae10e446dccc85b9` |
| `followup74-red-natural-01` | RUN: 1 PASS / 1 FAIL; authoritative mounted RED, no synthetic scroll: heard 607 becomes 627 and reopens at 627; real manual successor remains available. Exit 1. | `545323439cc24e4606f7e7a40661ccdbb4bd333748714b6054db152fe1b4e188` |
| `followup74-unit-red-01` | RUN: 21 PASS / 2 FAIL; original passive admission violates the new assertion and existing heard/coalescing control. Exit 1. | `b3be45cdc76602b058f677ecd377fdd834442d68e2dc3c568b2feeb518febe98` |
| `followup74-green-01` | RUN: 246 desktop tests and 2 browser cases PASS; intermediate guard, superseded by the manual-duplicate control. Exit 0. | `1da9887074248435347785bdd111dbdcca4bbac323ba83bc3b26c87e561fd49b` |
| `followup74-manual-red-02` | RUN: 23 PASS / 1 FAIL; a measured same-locator gesture failed to release protection for its next sample. Exit 1. | `3d7f5c2be309d187a99814bcdeddfe31dac0e2db567aec0833f7fce1add56329` |
| `followup82-red-01` | RUN: 5 FAIL; original owners permit competing success/aggregate publication, or cleanup removes the paused owner session. Exit 1. | `7cc2414b49189d201f51b53d4328bb28cff05e7db0eb79caea43752dc2c7e49c` |
| `followup82-green-01` | RUN: 62 tests PASS, format/types PASS; lint FAIL for import placement and one long test line. Retained; not final static acceptance. Exit 1. | `66964b55226911cf2a6c3b59b34eff8faa6506d46ac5aefe7088e04d4bc8d9f0` |
| `followup74-final-01` | RUN: 247 tests / 10 files, 6 browser journeys and TypeScript format/lint/types PASS. Exit 0. | `3d386f41c65a59e4187372be89a01f96437e3a52a12c981a13ddf4a53ddff5f9` |
| `followup82-final-01` | RUN: 62 tests, Python format/lint/types PASS. Exit 0. | `cd80111fb45fcbd896a245f46c0ad163a1a20307af157fe0ed04e375049c9b9f` |
| `followup-package-01` | RUN: build and package check PASS; lifecycle FAIL when a WebView2 temporary file disappeared during reparse inspection. Generated package evidence is the only source-snapshot delta. Exit 1. | `7c8d28fd3a2e28db9ef8bbda898339086575b5894da89dadaab883bda3a06aa8` |
| `followup-lifecycle-02` | RUN: package check and lifecycle result recorded below; unchanged installer, no rebuild. Exit 0. | `e28e9d2285bda74a5a5a18929e847df97fd8b78f73cb532f37e3ac35778b98b3` |

## Binding records

| Attempt | Input before / after SHA-256 | Environment SHA-256 | Output SHA-256 |
| --- | --- | --- | --- |
| `followup74-red-natural-01` | `FCE0781684AB5BD20797268FF02DE08E75E95E5012B56D7D4F3CB1155FF141F3` | `BF1D71A954BE4F2DCEA6439CAD2117189F2AD6123BDF626BB2454B1AB0630F25` | `4E5781BAFB0D4484BFD54D64D1546EEDCCAFA5AC315705009366F9B9330CF7A8` |
| `followup82-red-01` | `3C3D1EC0C2EE1F9C42A300E7231FC7D85427E58C77511AB3A242FCDA6829B346` | `A3F498137E5B07B4D8B7EA48B5101030D31D51BE0197FDE0E7D57779D39B4984` | `E23EBD82CCBFC7A4586216F79427934DB126D0C130D288B884F0B37BC670D890` |
| `followup74-final-01` | `151A83C05CB82B692FF1D5F1DCBA49DF094789C6B337F4DB3C77239A9A2C8CE4` | `E543FCCBA5E8A9791C2E970C190A420E34D476A23A3F43E2C839D30923D022BA` | `5589289F3E80732BF6CF382A4245604F635A44BCC1205DD8323BBC983EA2F72C` |
| `followup82-final-01` | `FD8327FE896D1E9A9D1A7A066B912863FCB1D9164D8FB90EF84B375279060445` | `ED2DD99D6E340457739E6BEDC2FEDA85A0FE2CC5082BC05DE800563E6818C3EC` | `53C93D5A3E143FCD48D846B2F2BA6AA1299B0B4EFD1128D87635C29AA61FEF6F` |
| `followup-package-01` | `224349ACD4CBF659020227418014F2F20A3385D203E90EDA8C4F6AC8500EB84D` / `0F22D0FF9A455BA42D598BBA2602282021209F3BA0BCC807A984D013535D9DA7` | `E4115021D1C1BF3D4D31D785918F2774C8F412956EC575A088F2F78AEE68C98D` | `F7F001D131B037E647B687DC858857344683F2D830A4F99EC71B1AC12533B855` |
| `followup-lifecycle-02` | `0F22D0FF9A455BA42D598BBA2602282021209F3BA0BCC807A984D013535D9DA7` | `767720621BA45AF1FD851811622B89BF50ABDC182CD027773559F6105BAB2AC6` | `BDC61CEF23B76D0CD033E859928A91830060696CA5780BACA6AEC64DA7FB093F` |

## Package and acceptance

`followup-lifecycle-02` passed install, first start, repair, default uninstall
after repair, all six option-matrix arms and verified cleanup. Its stdout also
records restoration of the preexisting data root. Final artifact identities:

| Record | SHA-256 |
| --- | --- |
| Installer, 203,987,591 bytes | `a32a11e393a6605c95c3c0035e21d56715dbca2e21d0a32202deed86361d9152` |
| Application binary | `1ff0b562c4a0143f16ede777882857f1ab9318093b9fa2f55001b7d6fc292961` |
| Generated package evidence | `187b37dfbb4a5934929f2b299cdd24a2e9580129e089f2c93dde74afc10fc99c` |
| Exact-installer lifecycle receipt | `2f5f026ad298e46a10fe60ed9849881d023cc18a3bc1a7d1b2a02033d2dec5af` |
| R01 component/package equivalence record | `c162439fac8ae33138b47c9fd7d25fb88a09ecb16395ee196a99d53e381419f2` |

The last record is `tmp/evidence/reader-stop-quality-follow-up/equivalence.json`.
It compares 17,491 unchanged desktop/tool/dependency entries, 3,247 unchanged
Python entries, and 17,498 unchanged package entries against their final runs.
Every difference is documented: eight prose/generated-manifest changes for the
component captures and one documentation-index change for lifecycle. No runtime
owner, regression, configuration, installed dependency or tool changed. The
generated JSON is covered by final formatting and package checks, not inferred
from the earlier TypeScript formatting run. Host Python is 3.12.10.

Final pre-review document/format checks are retained in `followup-docs-01`;
the independent report binds their results and the complete reviewed manifest.

The first lifecycle attempt failed on a disappearing WebView2 temporary entry.
Its build/check remain PASS; no lifecycle PASS is inferred. Post-attempt host
inspection found no VoxLeaf/owned WebView2 process or installation. Existing
empty data/recovery directories predated this task; a creation-time guard
aborted an attempted empty-directory cleanup before any mutation, and both were
preserved. `host-follow-up.json` and `retained-existing-roots.json` retain that
distinction. An earlier sandbox preflight did not expose those roots and is not
host acceptance evidence. Lifecycle retry uses normal backup/restoration of the
preexisting data root; no ownership is inferred from an empty directory.

The package is unsigned local validation. Clean-machine prerequisite bootstrap,
manual interactive acceptance, signing, Defender and a live optional download
remain outside this task. The generated package manifest's built-in lifecycle
field is not manually changed; the separate exact-installer lifecycle receipt
is the lifecycle authority.

The [final plan](../../completed/reader-stop-quality-follow-up.md) and
[R02 independent report](review-r02.md) define scope and acceptance. The
[reserved closeout](closeout-r02.md) records post-persistence checks only.
Historical R01–R04 five-search reports and frozen benchmark results are intact.

## R01 correction and R02 evidence

The authentic [R01 report](review-r01.md), SHA-256
`04c48c0926d8cc4152422d4b3e7448c17a0b5bf9ec04205bb202272be55cfe22`, requested
RSQ-R01-01. A preexisting Windows file link could create an absent referent when
opened with `O_CREAT` before reparse inspection. The minimal correction uses
exclusive first creation, then opens an existing entry without creation or
truncation, retaining descriptor/path, zero-size, regular-file and link-count
validation before locking. No product source or packaged payload changed.

`followup82-link-red-01` is **BLOCKED setup**, two WinError 1314 failures before
the owner was reached. It is not behavioral RED. The reviewer separately
[accepted the evidence strategy](review-r01-evidence-scope.md), without changing
R01 or issuing approval: model only Windows link resolution, use actual I/O on
synthetic referents, demonstrate the old creation effect, and retain real OS
controls. The substituted seam does not force the quality result.

`followup82-modeled-red-01` records **2 FAIL / 2 PASS**: the original admission
creates the absent target; the existing-target control also detects the creating
opening flags. Real hardlink and descriptor-mismatch rejection already pass.
Both failures precede the production correction. The final
`followup82-r02-final-01` records **66 PASS / 2 SKIP**, with format/lint/types PASS.
Skipped native-link cases require unavailable Windows privilege; no native-link
or POSIX execution is claimed. Native contention, process termination/retry,
hardlink rejection, nonempty-file rejection, sequential invalidation, derivation
freshness and unchanged complete session state remain exercised.

R02's exact receipt hashes, current snapshots, package identities and the final
review manifest are retained under `tmp/evidence/reader-stop-quality-follow-up/r02/`.
`RSQ-EQUIVALENCE-R02-20261116`, SHA-256
`72bc8331a11e2a63358ab8e00d771eb1d6b6fc7706a1129ea2f69750644eff02`,
compares 17,489 unchanged desktop entries, 3,253 unchanged current Python entries
and 17,494 unchanged package entries. Its 10/2/5 respective differences are
explicit prose, generated package metadata or the two unbundled benchmark/test
paths. All four package artifact/receipt identities above still match. The
current Python union supersedes R01's 62-case result; its input before/after hash
is `E09767EBD170B38817ED776479F0FCF60F9107900F86C429CB6BD11BBCB661E3`,
and output hash is `5B789F002420F96437D84AC9D151133102BAE4405BC13FE4FA4816AC39B5B69F`.
Current document/evidence/whitespace checks are recorded in
`followup-docs-r02-01`. The independent R02 verdict governs whether this evidence
closes the finding; the R01 strategy response alone is not acceptance.
