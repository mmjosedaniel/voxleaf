# Deep chat audit execution ledger

Privacy redaction (2026-11-09): local-profile inventory details were generalized
at the user's request. Original documents are retained privately. Technical
requirements, execution outcomes and limitations are unchanged; earlier review
manifests identify the pre-redaction document snapshots.

Base and reviewed HEAD for local unit work
`d375ecc84261c404e855c055e0ecc8949a97caaf`. Worktree execution with an empty
index. This ledger records local scope, integrated host evidence and the
independently accepted implementation in the
[completed plan](../../completed/deep-chat-audit-minimal-corrections.md).

## Dispositions

| Case | Current disposition | Local acceptance |
| --- | --- | --- |
| DCR-01 | Recovery startup can be cancelled through its existing owned containment. | [U1 R1](review-U1-R1.md) |
| DCR-02 | Withdrawn. Preserve the precise saved checkpoint and test visual fallback separately. | [U2 R1](review-U2-R1.md), [U3 browser interaction](review-U3-R1.md) |
| DCR-03 | Pending placement rearms when StrictMode reattaches the cancelled viewport. | [U2 R1](review-U2-R1.md) |
| DCR-04 | Windows CUDA observes ordinal 0 only, with the default and report guards retained. | [U12 R2](review-U12-R2.md) |
| DCR-05 | Lifecycle PASS requires an exact-installer receipt emitted after verified cleanup. | [U8 R1](review-U8-R1.md) |
| DCR-06 | A positive current paused output receipt confirms segment startup without restarting the clock. | [U1 R1](review-U1-R1.md) |
| DCR-07 | Retained EPUB3 TOC attribute text consumes the shared decoded-text budget. | [U13 R1](review-U13-R1.md) |
| DCR-08 | Batch cancellation and receive share exact attempt ownership and teardown. | [U7 R2](review-U7-R2.md) |
| DCR-09 | Decimal or signed Celsius ranges retain source text and locator mapping. | [U4 R1](review-U4-R1.md) |
| DCR-10 | First and successor audio allocation failures reach playback containment. | [U1 R1](review-U1-R1.md) |
| DCR-11 | All three callers require effective unrestricted outbound Windows firewall policy. | [U9 R1](review-U9-R1.md), [U10 R2](review-U10-R2.md) |
| DCR-12 | Adapter shutdown requires clean framing and EOF after the stopped record. | [U9 R1](review-U9-R1.md) |
| DCR-13 | Controller acquisition failure releases its own identity and permits retry. | [U7 R2](review-U7-R2.md) |
| DCR-14 | Asynchronous port reservation failure enters owned host restoration. | [U8 R1](review-U8-R1.md) |
| DCR-15 | Early WebP animation evidence rejects before an object URL or decoder is used. | [U5 R1](review-U5-R1.md) |
| DCR-16 | Mutable-adapter shape hardening before CPU transfer. Frozen installed v7 remains unchanged. | [U14 R1](review-U14-R1.md) |
| DCR-17 | Successor v13 reports cleanup failure independently and blocks further trials/derivation as appropriate. | [U15 R2](review-U15-R2.md) |
| DCR-18 | Successor v13 owns and bounds monitor shutdown across all candidate stages. | [U15 R2](review-U15-R2.md) |
| DCR-19 | Removal verifies all managed ancestor chains before deleting any package. | [U6 R1](review-U6-R1.md) |
| DCR-20 | Replacement waits for the explicit verified close outcome, independent of prior diagnostic. | [U1 R1](review-U1-R1.md) |
| DCR-21 | Handoff v2 bounds the absolute watchdog, output and owner cleanup. | [U10 R2](review-U10-R2.md) |
| DCR-22 | Handoff v2 holds ordered native boundaries for a current exact zero-resource observer acknowledgement. | [U10 R2](review-U10-R2.md) |
| DCR-23 | Language Settings reconciles the eligible saved profile before Play. | [U3 R1](review-U3-R1.md) |
| DCR-24 | Remaining integer frame groups combine before one duration floor. | [U1 R1](review-U1-R1.md) |
| DCR-25 | The historical deletion exemption requires an unchanged index entry. | [U11 R1](review-U11-R1.md) |

DCR-16 is preventive hardening. The model-free v13 and handoff-v2 receipts
verify successor behavior and authority routing while preserving the earlier
frozen results. They supply no new model measurements. The U7 R1 review was
withdrawn and superseded by R2. The U10 and U15 correction reports and receipts
remain historical records. The U12 R2 report binds the test-only relocation
required by final Clippy.

## Integrated host gates

Exact commands, discovered source/configuration memberships and tool/artifact
identities, timestamps, exits and logs are in the private
`tmp/evidence/deep-chat-audit/M2/` directory. Current commands ran in normal
local PowerShell, outside the automation sandbox, using Node v24.20.0,
offline Corepack pnpm 11.15.1, uv 0.11.29, Python 3.12.10, cargo/rustc 1.97.1.
All successful grouped snapshots agree before/after on recorded inputs.

| Gate | Current execution |
| --- | --- |
| G0 | `pnpm.cmd build:packages` exit 0. Both workspace exports built; full emitted digest inventory retained. The earlier U5 build is not reused because it lacked a bound root base config and compiler. |
| G1 | All 15 units have linked per-unit reproduction and acceptance. DCR-02 is an unchanged checkpoint control. U12 RED explicitly used a behavior-preserving FFI seam on the original enumeration rather than an unmodified binary on multiple GPUs. |
| G2 | Planned six-file EPUB Vitest selection, exit 0, 406 passed. |
| G3 | Planned 14-file desktop Vitest selection, exit 0, 648 passed. |
| G4 | Planned Python selection with v13 and v2 authority tests, exit 0, 171 passed. Planned four-file Node selection, exit 0, 148 passed. After the supplemental harness change, the affected Node callers plus native WebDriver client reran together, exit 0, 125 passed. Windows release tests have no import of the revised harness. |
| G5 | `pnpm.cmd test:rust` after U12 R2, exit 0. Default 187 passed and nine ignored; release-locked 186 passed and nine ignored. Earlier G5 remains a prior-input result. |
| G6 | Planned Playwright selection across both reader specs, exit 0, nine Chromium journeys passed. Included the combined restore/language journey, output/recovery, A→B→C and raster rejection. |
| G7 | Configured TypeScript format/lint, EPUB and desktop typecheck, Python format/lint/types, Rust format and both Clippy modes exit 0. Initial Clippy exited 101 on test module position; bounded U12 R2 correction and affected Rust reruns passed. Other configured gates do not consume the test module. TypeScript format and lint were renewed after the G8 harness change and exited 0. |
| G8 | Core check and default build passed. Renewed startup and Piper each exited 0 and restored the normal host. Earlier driver, availability and cleanup failures are retained below. [Supplemental Astra review](review-G8-CLEANUP-R1.md) approved the harness change. |
| G9 | `pnpm.cmd test:chatterbox:v7:local-admission` exit 0, one release-locked native test passed in 684.57 seconds. All nine local artifacts verified before, during and after admission. Host restored. |
| G10 | Verified-core build retry and canonical exact-installer lifecycle exited 0. The outer restoration wrapper exited 1, then a separate recovery restored original profile objects exactly. The six-case receipt binds the verified installer. |
| G11 | `pnpm.cmd test:evidence` exit 0, 34 passed. Final evidence guard, whitespace and changed relative-link results are in the frozen candidate receipts. The earlier pre-closeout results remain separate. |
| G12 | [DCR-G12-R2-ASTRA-20261110-01](review-G12-R2.md) approved the exact integrated patch and restoration after the ADR-0063 history correction. |

Prepared payload bytes are distinguished from command results. Historical
test PASS results were not substituted for current execution. The working
tree uses the same base and has no staged content.

## Safe pause checkpoint

The user requested a pause while the configured Piper command was already
running. It completed under the existing native owner watchdog and finalizer.
No subsequent gate started. No test, build, reviewer or owned process remains
active. The active ExecPlan, source patch and local reviews remain in place.

The default executable used for both WebView2 startup and Piper had SHA-256
`aba446fe9be029a3c199b0c6f56d96c5195101a334aa9dc86ab3f38a6f26e296`.
Initial startup exited 1 at session creation with PATH EdgeDriver 155.0.4283.45
and WebView2 157.0.4341.42. The matching 157.0.4341.42 x64 driver was downloaded
from Microsoft, verified as Authenticode-valid with Microsoft Corporation as
signer, and used only through the process-local override. Driver SHA-256
`b95a8fdfbd2f7f71e38e105b1828ae698beec3ea4422f0cbf87340da85a3a9a8`.
The previous driver was retained. [Microsoft's download page](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver?form=+).

The first retry wrapper stopped before launching the application because
cleanup from the initial failed run was incomplete. Ownership, emptiness,
absence of reparse points and exited owners were verified before removing
only run-created state nonrecursively. The one
actual WebView2 retry passed on the unchanged default executable with exit 0.
The same wrapper had already started the exact English Piper leaf when the
pause was requested. Piper was selected by the host compatibility gate, but
the leaf exited 1 after 94.93 seconds at
`adaptive exact-host availability [webdriver-condition-timeout]`. Its root
cause remains unresolved. No six-rate PASS is recorded.

For the successful startup and failed Piper runs, normal-host before/after
process, temporary-root and app-data inventories matched after verified
cleanup. Run-created state was removed only after ownership and process-exit
verification.
The effective exact-Piper outbound block preflight passed read-only. No
firewall rule was changed. G10 did not run and the historical tracked v3
Windows evidence is still clean.

### Resume after explicit authorization

1. Recheck the checkout, empty index and private `M2/pause-manifest.json`.
   Preserve current receipts and rerun only inputs invalidated by drift.
2. Diagnose the G8 exact availability timeout with the existing host commands
   and logs. Retry the planned exact Piper command only after a concrete changed
   condition and according to the retry limit. Keep the same stamped default
   executable unless its current input identities require a rebuild. Resolve
   G8 before the release installer build overwrites the canonical executable.
3. Run `pnpm.cmd test:chatterbox:v7:local-admission` using the verified parts
   and model inputs and the owned temporary root. Recheck artifact hashes if
   the recorded identities have drifted. The preflight itself is not a G9 PASS.
4. Run `pnpm.cmd package:windows:verified-core`, then
   `pnpm.cmd package:windows:lifecycle` with the exact installer, original
   host journal and final restoration proof. The build alias writes historical
   v3 evidence at a fixed path; preserve the generated output privately and
   restore the clean original bytes in the approved finally path.
5. Run `pnpm.cmd check:evidence`, `git diff --check` and inspect changed relative
   links. The 34 evidence tests already passed on the recorded inputs. Freeze
   the final exact manifest and request integrated G12 review through the
   coordinator. Archive only after final approval and closure checks.

The private prepared host wrapper is
`tmp/evidence/deep-chat-audit/M2/run-gates.ps1`; `optional` and `installer`
groups have not been invoked. No Git delivery was performed.

## Resumption and G8 outcome

All 114 checkpoint paths matched their original status, SHA-256 and
filter-aware blob. The branch, HEAD, empty index and normal-host process/data
inventory matched the safe pause.

The first Piper run found a stale ignored package beside the default
executable. Its runtime manifest SHA-256 was
`0da4a9c3fe15abae39c260de79f3b75c08afbca5b1ab9cac9b868bdf77b87b77`
instead of the embedded current authority
`2bf445cda652fa91d8b23a7d34db8adde4bba02e195aabf912cbc305e9bc714b`.
Native discovery rejects an existing invalid package before the development
environment fallback. An atomic same-parent hold of that exact generated
tree, with original bytes journaled and the same executable/driver verified,
was the concrete condition changed for the single Piper retry. The original
tree was restored in finally and its manifest identity rechecked. The
effective interpreter outbound block was reconfirmed without rule changes.

The retry passed the availability boundary and exercised the complete
six-rate playback and cancellation assertions. Its native runner then reported
`native-cleanup-failed,native-process-ownership-unverified` and exited 1. The
intermediate playback summary is not a passing gate. The error class can be
emitted by multiple ownership operations, so the exact failed internal branch
has not been established.

Normal-host recovery identified the remaining Tauri and Edge driver processes
by parent chain, executable hashes and full creation ticks. Only those two
verified processes were stopped. The command and Windows console helper exited.
The only retained synthetic profile was moved into private evidence after
verifying its creation interval, resolved path, no reparse points and no
remaining matching process. The final host inventory matches its pre-run
state. Restoration
does not change the native runner's failing exit. No further Piper attempt
ran under the existing retry budget.

The [read-only G8 diagnosis](review-G8-DIAG-R1.md) confirms a distinct
cleanup-control-flow weakness. It does not establish which helper branch
caused the observed native failure or approve a source change. The exact
default executable was retained by byte identity before the installer build
can replace the canonical output. It is a prepared artifact.

## G9 exact local admission

The configured release-locked command passed one exact test and filtered 194
other tests. The test verified nine local copies, admitted and rediscovered
the installed runtime, checked its integrity and removed the owned current
and retained packages while preserving the unrelated sentinel. Inference was
disabled. The before/after raw source/configuration snapshots matched, and all
nine artifact size/SHA-256 identities remained exact.

The outer validation wrapper exited 1 because the process-local temporary
directory contained a Node compile cache after the native test removed its
own synthetic root. The sole cache was identified and moved into ignored
private evidence after confirming no owner remained and no reparse point was
present. The normal-host inventory matches the original, the test temporary
root is absent, and the source artifacts are unchanged. The wrapper exit,
successful configured command and separate verified restoration remain
distinct in the receipts.

## G10 preflight and first build

The lifecycle preflight stopped before installation to establish a recovery
plan for the pre-run host state. Its inventory was recorded privately for
exact restoration. The installer can also unpin shortcuts and clear the
application's shell destinations; those effects are outside the exact
restoration proof. No lifecycle command or host-state mutation ran during
this preflight.

The independent configured verified-core build produced an unsigned NSIS
artifact, then exited 1 when Windows PowerShell could not autoload its security
module for signature inspection. The original generated artifacts, before and
after source identities and failing log are preserved privately. The tracked
historical v3 evidence was restored byte-for-byte and remained clean. A
lightweight probe through pinned pnpm reproduced the same Windows PowerShell
5.1 autoload error with inherited PowerShell 7 module paths. Restricting the
process-local path to Windows PowerShell modules made the real signature
command return NotSigned. That verified condition was used for one build-only
retry. Neither probe accepts the failed build or exercises installation.

The configured build-only retry exited 0 at 23:54:00 UTC, with matching
before/after input identities. The unsigned-local NSIS installer SHA-256 is
`abc4d8248b971b5733e5c61745d63a1a3d783f331532dd50564c150318b22918`.
The release-locked executable SHA-256 is
`d9d293820625302430a6925f4474dd6fd304597ce91e93e3f8508c388113cf7c`.
The generated evidence was retained privately. The original tracked v3
evidence was restored and verified against its original SHA-256, Git blob,
clean status, HEAD and index. Lifecycle, signing and antivirus were not
validated by this build.
## Renewed G8 and second safe pause

The [supplemental execution receipt](g8-cleanup-execution.md),
DCR-G8-CLEANUP-EXEC-20261110-01, records the real model-free RED and
the exact 53-test harness and 125-test caller results. Independent
DCR-G8-CLEANUP-R1-ASTRA-20261110-01 approved the exact 21-input manifest
and found no actionable findings. The original 25 dispositions are unchanged.

The retained default executable SHA-256 matched its prior build. Its
isolated directory contained only that executable, so there was no
adjacent generated Piper package to interfere with configured runtime
discovery. The prior exact inputs matched after substituting the retained
executable path and three approved harness file identities. The signed
matching EdgeDriver and WebView2 bytes were verified again. The read-only
effective firewall check passed for the configured English interpreter.

The renewed native startup exited 0 in 17.61 seconds. The single authorized
post-correction Piper run exited 0 in 100.52 seconds, exercised all six
rates and observed cancellation in 470 ms. Both input snapshots matched.
The process, native scratch and application data inventory was restored
after each command. The wrapper exited 0, and a separate normal-host
observation matched the same baseline. Raw receipts are
`G8-startup-r3-*`, `G8-piper-r3-*` and `closeout-pause-host.json` in the
ignored M2 evidence directory. No additional native run is required for
this checkpoint unless a consumed input changes.

At the user's safe pause request, no lifecycle process or registration
hold existed. Its current-profile authorization remains available, with
possible Start/taskbar unpinning accepted and exact pre-run state restoration
required. The verified-core installer build remains passed, and the
historical v3 evidence remains byte-identical and clean. Resume with the
prepared G10 recovery wrapper's read-only preflight, then its one
canonical lifecycle command. Final G11 needs refresh after the new
harness and documentation changes. G12 remains pending. No process or
validation session remains active, and the Git index is empty.
## G10 exact installer lifecycle and restoration

After the second pause, 119 SHA-256, filter-aware blob and status
identities matched. The installer remained unsigned-local at SHA-256
`abc4d8248b971b5733e5c61745d63a1a3d783f331532dd50564c150318b22918`.
The only differing paths in its prior build input inventory were the
three separately approved native-smoke harness files, outside the build
graph. The G8 Piper R3 runtime and source inputs still matched entirely.
No executable, model, runtime payload or installer was rebuilt.

The pre-run host state was recorded privately and backed up. The canonical
command ran once using explicit installer and ignored receipt
paths. It exited 0 in 142.38 seconds with identical before/after inputs.
Install, first start, repair, default uninstall, and six ordered option
cases passed. The receipt's installer name, size, SHA-256 and timestamp
matched the prepared artifact. Canonical cleanup passed. The private
receipt SHA-256 is
`b07c0625133c112e16c97ec59bbc7b5f1048546212499f771ba45c20b7dd4013`.

The outer wrapper exited 1 because installer-generated state occupied a
restoration destination and pre-run metadata differed. The first recovery
refused to overwrite uncertain state. Read-only ownership checks distinguished
run-generated state from the preserved originals and confirmed that no
installer owners remained. The detailed inventory and ownership evidence
are retained privately.

After a recovery bootstrap invocation stopped before mutation, the
corrected recovery preserved evidence of the generated state, restored the
pre-run host state and removed only verified run-owned residue. The final
before/after comparison confirmed exact restoration. Historical v3 evidence
remained byte-identical with its original Git blob and clean status.
The user accepted possible shell unpinning, and exact Start/taskbar
pin or jump-list history restoration is not asserted. No lifecycle
rerun, signing, antivirus, release publication or new Chatterbox
inference occurred.

## G12 revision 1 and the ADR correction

[G12 R1](review-G12-R1.md) requested one documentation correction. ADR-0063
now retains the October 26 enumeration rule in its historical section and
adds the ordinal-0-only rule in a dated November 9 amendment with current
DCR-04 validation links. The completed narration-logic plan remains distinct.
This revision changes only documentation. R1 remains immutable, including
its historical reference to the U11-era package configuration. The frozen
R1 and R2 manifests bind the current U8 package configuration separately.

G11 guard, whitespace and relative-link results are refreshed on the revised
snapshot. Existing runtime results are carried forward only with the normal-host
input, tool and artifact comparison. Earlier receipts and failed attempts
remain distinct. [G12 revision 2](review-G12-R2.md) approved the corrected
snapshot, with no actionable findings.

## Documentary closeout

The completed plan and indexes record the integrated approval. The accepted
source, tests, configuration, tool and runtime artifact evidence are carried
forward under the reviewed identity proof. The closeout refreshes the evidence
guard, whitespace and relative links. The earlier G11 results, failed
wrappers and separate host recovery receipts remain distinct.

The old active-plan path holds only a relocation notice. This narrow
exception preserves links in eight immutable unit receipts and their
accepted hashes. The active index lists no active plan, and the completed
plan is the canonical record.
