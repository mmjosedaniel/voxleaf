# Deep findings correction execution

Execution intake on 2026-11-14: branch `codex/deep-findings-minimal-corrections`,
HEAD `fab1c9e186552515e828c33ce75e11628dda8300`, clean worktree, empty index.
Implementation and host validation are authorized; Git mutations are not.
The [ExecPlan](../../completed/deep-findings-minimal-corrections.md) retains the
per-case invariants, adjacent controls and final acceptance requirements.

Raw command receipts and captures belong in ignored
`tmp/evidence/deep-findings-minimal-corrections/`. Historical receipts remain
unchanged. No historical runtime PASS is yet reused on this patch.

## M1 / U10 / VF-0042

Decision before execution: **RUN** focused model-free RED for directory creation
faults through `finalize_session` and its CLI. Existing fixtures provide valid
synthetic staged samples. A broad baseline is unnecessary; the new assertions
discriminate the uncovered path. Expected failure on the original implementation
is an unwrapped filesystem error and/or retained empty audio directory. Preserve
staging bytes, existing/concurrent data, the primary failure and successful retry.

Command:

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py -k vf0042
```

Host results `u10-red-01` and `u10-red-02`: six expected failures from unwrapped
filesystem errors, no setup failures. Both captures retained matching before/after
inputs. R02 corrects the assertion's existing error-message prefix and formats
the test before the production edit. The same R02 assertions are retained for GREEN.
The pre-existing pytest-cache permission warning does not explain the failures.

Minimal correction guards only the two exclusive mkdir calls, removes the audio
directory only when created by this invocation and still empty, and returns the
existing typed error family. The later destructive finalization handler is unchanged.

Decision before GREEN: **RUN** the final G-PY union because quality and its
CustomVoice helper consumers are affected. No model or acoustic gate is needed.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py services/tts/tests/test_customvoice_screen.py services/tts/tests/test_customvoice_screen_authority.py
```

Host `g-py-u10-green-01`: **58 passed**, exit 0, matching before/after inputs.
The pre-existing pytest-cache warning remains. Reuse on the final patch requires
unchanged consumed inputs. U10 awaits final static checks and independent review.

## M1 / U9 / VF-0040

Decision before execution: **RUN** the ordinary wrapper's actual installer and
uninstaller functions against finite synthetic Windows executables, with hanging
parents, early-exiting parents/remaining descendants, successful completion and
an unrelated live sentinel. Existing functions are exported for direct harness
access without altering their execution before RED. The new timeout argument is
ignored by the original implementation. No real installation/profile is touched.

```powershell
node --test --test-name-pattern=VF-0040 apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs
```

Expected RED: the original waits complete naturally instead of enforcing a
deadline, or return while a descendant remains. The finite fixture children are
allowed to exit before owned test scratch is removed. Final G-NODE will include
release consumers and existing spawn/cleanup protections.

Host `u9-red-01`: four expected missing-timeout failures, two successful controls,
matching before/after inputs. The correction invokes the existing Windows Job
primitive through a small PowerShell receipt wrapper. It leaves the shared Job
implementation unchanged. A missing/invalid containment receipt retains recovery
ownership and prevents a potentially overlapping uninstall/restoration.

Decision before GREEN: **RUN** the focused real-process cases first, then the
ordinary/release union including prior no-spawn and uncertain-cleanup controls.
No old release Node result is reused because it imports this changed wrapper.

Host `u9-green-01`: all six real-process cases passed, matching input captures.
Added one public-journey missing-containment-receipt control: no overlapping
uninstall/restoration, retained backup and explicit owned recovery followed by
the real no-spawn retry route. Final union pending on these final inputs.

Host `g-node-u9-green-01`: **86 passed**, exit 0, matching before/after inputs,
including the new uncertain-containment control and previous lifecycle protections.
U9 still requires static checks, current-artifact smoke and independent review.

## M2 / U3 / VF-0036, VF-0047

Decision before execution: **RUN** focused public opening regressions for inline
inert anchors, exact target/locator and same-byte reopen, XHTML/NCX edge NBSP,
internal NBSP preservation and title fallback. Include the existing exact-byte
attribute-budget table's new trimmed-NBSP control. Original implementations remain
unchanged. Low-level NCX owns its collector in `ncx-navigation-parser.ts`; include
its existing test file in the final G-EPUB union when that owner changes.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/public/open-epub-publication.test.ts src/navigation/navigation-document.test.ts -t 'VF-00[34][67]'
```

Expected RED: wrong block count/target or rejected publication and retained
attribute-byte mismatch. Source text and generated-anchor recovery remain within
the plan's explicit unversioned-history limitation.

`u3-red-01` is a command-launch failure, not reproduction: the local `.cmd` shim
interpreted the regex alternation pipe. Use the equivalent character-class filter
for these two files and verify the selected case names; production remains unchanged.

Host `u3-red-02`: nine expected assertion failures, 70 deselected, matching input
captures. Inert inline anchors no longer create paragraph boundaries; actual
block descendants retain their existing boundaries. Both navigation collectors
trim Unicode edge whitespace while preserving interior NBSP. XHTML accounts only
retained attribute bytes. Final U3 GREEN is grouped with U4/U5 in G-EPUB.

## M2 / U4 / VF-0037, VF-0039, VF-0054

Decision before execution: **RUN** new public preparation cases on original U4
owners with `pnpm.cmd --filter @voxleaf/epub exec vitest run
src/integration/narration-preparation-matrix.test.ts -t VF-`.
Paired/unpaired quotes, code/foreign spans, supported article casing/spaces,
seconds, and ordinal hard cuts include subsequent paragraphs and batch sizes
1/2/8 with cold reconstruction. No historical result is reused. The closed
article forms in the current normalizer are `las`, `Las`, `LAS`; the plan's
singular `la` wording is not authority to add a new lexical form.

`u4-red-01`: 13 failures / 16 controls passed, identical inputs. Eleven failures
are the expected quote/article/atomic-cut witnesses. Two additional expectations
were overbroad: the existing closed policy expands the cardinal in `21.º` and
preserves slash-connected ordinals. Correct those controls before implementation;
add independent hash-separated expansions. Neither discrepancy authorizes changing
the lexical vocabulary.

## M2 / U5 / VF-0051, VF-0052

Decision before execution: **RUN** the same focused public file with the corrected
U4 assertions plus dense 1,364/1,365-leaf list drains (1/8 segment requests, cold
deep start) and U+200B/U+2060 prefix/interior/tail boundary cases. U4/U5 production
owners remain unchanged. Preserve the original full-event ceiling for its callers.

`u4-u5-red-02`: 15 failures / 19 controls passed, identical captures. The dense
1,365-leaf case and formatting-prefix cases fail with resource-limit results;
the 1,364-leaf control completes. Corrected multidigit/slash controls pass.
U4 now reuses proven quote pairing (including straight-quote parity), admits only
the two additional inline spaces and records private weak match identities for
packing. U5's preparation consumer retains leaves only, still debiting structural
work; only unprotected formatting omissions join the existing silent-prefix drain.

Decision before GREEN: **RUN** the final selected G-EPUB union, including the NCX
collector and boundary scanner now consumed by the atomic-cut check. Format only
changed TypeScript files first. Historical EPUB acceptance is invalidated by these
shared owners. Failures or missing adjacent coverage require a bounded follow-up.

`g-epub-green-01`: 607 passed / 45 failed, matching captures. U4/U5 public cases
still consumed the original package `dist` because direct Vitest bypasses the
package's `pretest` build. This attempt is not post-change public acceptance.
Other failures exposed an incorrectly placed NCX finalization statement (at XML
event dispatch) and the new reopen assertion's wrong locator field `offset`.
Move trimming to NCX label finalization
and use the existing typed `textOffsetCodePoints`; retain the original block-count
and navigation assertions that discriminated RED. The failed union is not PASS.
An attempted `oxfmt` invocation was unavailable and made no edits; the repository's
existing Prettier executable then formatted the changed TypeScript paths.

Decision before retry: **RUN** `pnpm.cmd build:packages` before the public tests,
capture the generated outputs, then repeat the selected union. Compilation is
required whenever its consumed package exports change, including EPUB's own
public integration file. It is also the later desktop prerequisite.

`g-prep-01`: package build passed. `g-epub-green-02`: 652 passed / three failures
limited to the newly expanded dense fixture: its extra ZIP member used `path`
instead of the fixture contract's `name`. Correct that test input and its typed
cancellation assertion; no production change. **RUN** the final selected union
again on the already rebuilt package. Added quote continuation across a source
window, quoted/later-window dense traversal, cancellation/retry and next spine.

## M3 / U6 / VF-0041, VF-0048

Decision before execution: **RUN** small original-code regressions through mounted
adaptive controls and the public coordinator. The refill label must show the
one-minute scheduler threshold while preserving selected production targets.
Completion must retire an in-flight rate preparation; late success/failure and
selection/reset after completion must preserve the preference used by Stop/Play.
Command: `pnpm.cmd --filter @voxleaf/desktop exec vitest run
src/tts/AdaptivePreparationControls.test.tsx src/tts/product-narration-coordinator.test.ts -t VF-`.
No historical desktop result is reused. The final desktop union follows U1/U2/U7/U8.

`g-epub-green-03`: **655 passed**, 13 files, exit 0, matching captures and current
package build. All U3/U4/U5 public and selected adjacent gates pass; final static
checks and independent review remain. Keep this receipt immutable and prove its
EPUB/runtime closure before final reuse after desktop-only work.

`u6-red-01`: seven expected failures, 228 deselected, matching captures. U6 now
uses the scheduler's existing refill threshold in the shared loaded-audio label,
clears active/pending speed at completion, and releases the old rate preparation
token on the completed device handoff. Selected preference remains intact.
**RUN** the focused regressions after this correction; broader desktop/PCM
acceptance is grouped after the related ownership changes.

`u6-green-01`: seven passed, matching inputs. Final desktop union still pending.

## M3 / U7-U8 / VF-0045, VF-0055, VF-0053

Decision before execution: **RUN** focused public coordinator regressions with
real EPUB opening/preparation and mounted Reader callbacks. U7 uses a controlled
device clock plus a scheduler-reservation hook; the oversized chapter triggers
the actual synchronous reader Stop. The dispatch witness keeps outer consumed
frames at zero. It asserts zero synthesis calls after invalidation and next Play.
U8 covers same/next batch scene transitions, omitted-only batches, audible versus
omitted ellipsis, no successor and Stop/restart. No GPU/audio rendering is claimed.
Command: `pnpm.cmd --filter @voxleaf/desktop exec vitest run
src/tts/product-narration-coordinator.test.ts -t VF-00[45][35]`.
These behavior owners are unchanged except the separately reproduced U6 terminal
rate cleanup, which does not govern these triggers.

`u7-u8-red-01`: four expected behavioral failures and one fixture sequencing
timeout; two controls passed. Pause enters spurious recovery; dispatch makes one
late synthesis call; scene gaps become 600 instead of 1,200 ms. The eight-segment
test must load its finite range before advancing its manual device rapidly; use
the existing Prepared target for that control. Fix its next-Play assertion to
inspect the synthesis source range (PCM requests intentionally contain no locator).
**RUN** that corrected RED selection before changing these owners.

`u7-u8-red-02`: five expected failures, two controls passed; the eighth-segment
case now reaches the same 600-versus-1,200 ms assertion. `u7-publication-red-03`
additionally observes an obsolete playing snapshot after synchronous Stop in the
dispatch path. The outer publication now retains the nested current snapshot.
Pause uses its original token/player, synthesis rechecks after publication, and
PCM rechecks the handle after the started callback. The adjacent preparation
controller installation was inspected but this trigger does not reach it; no
speculative change was made there.

U8 carries one run-owned scene fact to the next speakable segment and uses private
scheduler metadata at the actual buffered handoff. Audible ellipsis keeps its
900 ms precedence. No silent PCM or wire-contract change. **RUN** the focused
U6/U7/U8 selection before the final grouped desktop checks.

`u6-u7-u8-green-01`: **14 passed**, 228 deselected, matching captures. The mounted
Stop paths now suppress stale publication/dispatch and successfully restart on a
valid chapter. Larger desktop, browser/native and independent gates remain.

## M1 / U11 / VF-0050

Disposition: document precision as authorized. Inspection confirms Stop freezes
the last accepted cumulative receipt; periodic cadence is not a delivery bound.
Updated testing guidance to distinguish this lower bound from natural-end
accounting. No runtime change or new test is needed for this documentation-only
decision. Existing CCF rendered-frame controls stay in the final desktop union.

## M4 / U1 / VF-0035, VF-0044

Decision before execution: **RUN** original-owner completion tests extending PN-04
through the heard end, plus missing/lost/recovered geometry controls. Mounted App
uses the real Web Storage repository with a single read failure or malformed v1
bytes, a passive fallback sample, lifecycle flush, same-book reopen and explicit
save repair. Command: `pnpm.cmd --filter @voxleaf/desktop exec vitest run
src/App.test.tsx src/reader/segment-highlight-controller.test.tsx
src/tts/product-narration-coordinator.test.ts -t VF-00[34][45]`.
VF-0034 requires a separate real scrollbar input witness before correction.

`u1-red-01`: four expected VF-0035 failures and one invalid VF-0044 fixture failure;
the latter supplied a function instead of the repository's `{ storage }` option,
so it did not inject the intended storage. Correct that option and explicit reopen
settlement before changing App/save behavior. **RUN** the two VF-0044 cases again.

`u1-storage-red-02`: both correct App/storage witnesses fail at preservation of
original bytes, matching captures. Completion now requires measured follow for
the current segment/refresh. Failed restoration initializes no write and defers
passive saves until a validated immediate/audible checkpoint or a measured manual
movement. The existing reader callback carries that optional provenance, including
movement at the same locator; ordinary passive callbacks retain their old shape.
**RUN** the directed U1 controls with save-coordinator admission/retry negatives.

### U1 continuation and U2 / scrollbar RED selection

`u1-green-01`: 12 passed, four PN-04 fixture assertions failed because jsdom's
synthetic PageDown is intentionally untrusted; its passive measured locator
callback retains the one-argument form. Correct the assertion, preserving the
completion/Stop/Play invariant. The new storage guards passed.

Next run U2 native retained-receipt RED (both invalid-byte disclosure and Check
route in the existing RCF-13 Windows fault fixture); U2 App direct Check and
failed-poll-before-success RED plus ownership controls; browser VF-0049 real
checked control with nonzero counters and VF-0034 actual scrollbar drag/event
observation on unchanged admission. Reuse existing fixtures only, no historical
PASS. Rust captures the established dependency/tool roots afresh; JS captures
installed dependencies and current package exports. A browser run does not
substitute for the required WebView2 observation.

`u2-rust-red-01` reproduced both VF-0038/VF-0043: failed Check returned the
acquisition-invalid route and the next poll still disclosed 3,208,952,948 installed
bytes. The fixture deletes/restores a synthetic required runtime file, retaining
root-specific cleanup authority. Minimal correction separates the validity bit
from that authority and returns the existing installed-package-invalid snapshot.

`u1-u2-js-red-01`: 16 U1 controls pass; five U2 setup failures used a nonconfigurable
ESM spy. Use Tauri's supplied mockIPC port instead. `u1-u2-browser-red-01`: checked
Chatterbox accepted-unit count did not reset (wrong metric); Chromium scrollbar
was hidden by Playwright's default launch flag (no movement). Neither establishes
RED. Repeat with positive played duration and a visible native scrollbar.

Next also RUN existing native-startup script against the currently built artifact
before changing scrollbar admission, adding content-free real CDP pointer/event
observation to its existing reader scenario. This is provenance/interaction
observation, not acceptance of the future artifact. Preserve the native harness's
owned disposable profile and teardown. The final native build still runs in M5.

`u2-js-red-02` confirms VF-0046 (two expected failures, three stale-owner controls
pass). Explicit action completion now carries the existing client generation to
App, whose initiating unavailable profile/language/publication must still own it.
Passive polls cannot reset diagnostics. CAF-R3.1's mock now publishes the matching
real client action boundaries while preserving its same/replaced-book assertions.

`u1-u2-browser-red-02` is a Playwright setup rejection: launch options must be at
file scope. Keep the scrollbar visible for the existing reader-browser file.
`u1-native-observe-01` failed session creation before the probe: PATH selected the
older Edge driver, unlike historical native readiness. Retry with the verified
157 driver and existing host-state restoration helpers, retaining the failure.

Chromium `u1-u2-browser-red-03` now confirms VF-0034: real trusted pointerdown,
mousedown and repeated scroll events move the visible native scrollbar but Play
stays disabled. The Chatterbox metric assertion reaches cleanup with Settings
open; preserve it as a soft assertion so cleanup does not mask the diagnostic.

Native observation attempts 02/03 failed inventory-helper setup (missing tool
context); 04 verified driver/artifact identities and host restoration but the
existing binary is release-locked and rejects the default fake-service lifecycle
probe. Add a bounded scrollbar-probe-only arm to the existing native script: it
runs the same real reader interaction matrix and teardown, skipping unrelated
fake-service admission, and does not claim full native acceptance. M5 retains
its full default-build startup and actual Piper arm.

`u2-browser-red-04` confirms VF-0049: clicking the healthy selected Chatterbox
radio preserves the service owner but resets positive played duration. Extend
only the Settings no-op guard, using the existing loaded-profile/language health
proof; keep the action-level MAF-10 barrier unchanged. `u1-native-observe-05`
also reaches the separate in-WebView fake-service probe; narrow the new observer
arm before both unrelated probes, retaining ordinary full-startup behavior.
Host restoration was verified on attempts 04 and 05.

Native attempts 06/07 reached the real reader; the original narrow 320x640 fixture
leaves only 64 px of reader height, placing the attempted thumb target at its
bottom/outside useful drag range. Keep the narrow-layout assertions, then expand
only height for the gesture and restore it afterward. These no-movement attempts
are observation setup failures, not evidence about product admission. Next RUN
that observation and U2 targeted App/client/controls GREEN; no reuse of failures.

`u1-native-observe-08`: actual WebView2 thumb movement observed trusted
pointerdown/mousedown on the scroll owner, followed by measured scrolling; host
state restored exactly. This establishes the signal before the product edit.
VF-0034 now admits only a trusted primary mouse gesture in the vertical gutter,
retains ownership until pointer release/cancel/blur, and still requires measured
displacement. Release clears unused intent; passive/programmatic movement and a
motionless click remain negative controls. A held-thumb regression exceeds the
old 500-ms wheel/key deadline. Existing wheel/key behavior remains unchanged.

`u2-js-green-01`: all five App recovery/owner cases pass. The controls test looked
for disclosure copy used only in Absent; the actual Failed presentation hides
its storage paragraph, which is now asserted directly. Add the same invalid Check /
repair / cleanup sequence to the existing exact-local V7 admission arm, retaining
its nine-artifact local source allowlist and sentinel/removal controls.

Next RUN targeted browser VF-0034/VF-0049 GREEN, the full U2 App/client/controls
files, and final source formatting before consolidated static/desktop/Rust gates.
Existing U1 directed and EPUB/Python receipts remain scoped candidates for reuse;
no old acceptance is promoted. All checks continue on local host PowerShell.

### Consolidated deterministic checks

`u1-u2-browser-green-01`: both real Chromium regressions pass, including passive
scroll, motionless thumb, held gesture and continued Play; Chatterbox preserves
nonzero played duration and its original admitted service owner.
`g-rust-green-01`: **80 passed / 3 ignored in each feature mode**; the ignored
exact-local arm remains separately required. Inputs match before/after.
`g-desktop-green-01`: **810 passed / 2 failed**. CCF-C08's positive fixture completed
before its queued follow measurement; flush that existing measurement before
asserting completion settlement, retaining every later decoration/no-follow
assertion. The PCM test explicitly expected the VF-0048 terminal bug (active 75,
pending 100 after completion); update only those terminal expectations to null.
All live-successor, selected preference, release and timing assertions remain.

`g-static-ts-01`: format passed; lint found missing explicit Node timer imports
in U9 and a test hook dependency warning. Fix imports/destructure the callback.
`g-static-py-01`: format passed; Ruff requires contextlib.suppress for the same
bounded empty-directory rollback. Replace only that syntax, preserving behavior.
No failure is relabeled as acceptance. Next RUN affected desktop leaves, renewed
Python union/static, TS lint/types, Rust format/Clippy both modes and native-harness
preflight. Retain unaffected desktop-file results only after final closure proof.

`g-desktop-green-02`: all 178 tests in the three corrected fixture files pass.
`g-static-ts-02` lint/type checks pass; `g-static-rust-01` format and both Clippy
modes pass. `g-native-harness-01` passes the WebDriver/portfolio Node union and
all 59 native-smoke tests. `g-py-final-02` format/lint pass, but mypy rejects a
test's implicit `quality_cli.sys` reexport. Import `sys` directly in that test.

Next RUN renewed Python format/lint/mypy and the 58-test union; no historical
Python PASS is reused. Extend existing Chromium coverage for transient storage
read failure then reopen, completed speed selection and exact measured recovery
locator; add a real-audio completion with injected unavailable follow geometry.
RUN the plan's selected browser union using the configured Playwright CLI directly
with `--config apps/desktop/playwright.config.ts` so Windows cmd cannot split the
grep expression at pipes. This is the same runner/configuration as test:browser.
RUN formatting of changed harness/test files before that gate.

Native M5 adds a short final scene to the existing synthetic second chapter and
uses the current Piper arm to exercise omission-only handoff, natural completion,
terminal rate selection and the next explicit start. Existing speed transitions,
prepared-mode, cancellation and privacy/resource controls stay intact. This
invalidates the native-smoke harness leaf; rerun that leaf and portfolio import
consumers once with final TS static checks before the native build. Reuse local
verified model inputs and caches, not historical playback or installer PASS.

`g-py-final-03`: format/lint/mypy and 58 tests pass (one nonfatal pytest cache
write warning). `g-static-native-harness-02`: TS format/lint/types and 76 combined
portfolio/native-smoke Node tests pass. `g-browser-final-01`: 13 pass, three new
fixture assertions fail: VF-0035 incorrectly expected manual visual movement to
replace the protected heard checkpoint during Pause; two manual recovery variants
incorrectly expected a semantic segment to begin exactly at an interior caret.
Correct the browser assertions to separate heard/visual position and to require
the first synthesized semantic range to contain the measured recovery locator.
RUN only these three cases plus the modified scrollbar sibling, retaining the
other 12 results with a final consumed-input comparison. No production edit.

The native input capturer is adapted to this task's passed G-EPUB exports receipt
and its own helper identities. RUN G7 preflight, default build/startup and Piper ES
arm; then G8 preflight/local V7 admission on verified local assets, serializing
host mutations. G7's result explicitly leaves EN runtime unselected. Host/profile,
adjacent-core and owned-temp restoration are mandatory for both receipts.

`g-browser-final-02`: VF-0035 completion/next Play and wheel/scrollbar recovery
pass; the PageDown fixture sampled storage before the browser's smooth scroll
finished. Wait for bounded stable scroll geometry before freezing its checkpoint,
then RUN only the three recovery siblings whose shared assertion changed.
`native-final-deep-g7-01` read-only preflight passed; renew its readiness under a
new ID after this browser-test edit because the conservative native manifest also
captures browser test files. Its completed receipts remain immutable.

`g-browser-final-03`: three recovery siblings pass. The final browser acceptance
will nevertheless RUN the selected 16-case union once on the final test file:
its bytes changed across the partial receipts, and the initial generic JS capture
did not bind browser executable/resource bytes. Add the actual configured Chromium
and matching headless-shell trees to a `browser` capture. Earlier results document
behavioral progress, not reused final acceptance. This resolves the stricter full
consumed-input requirement instead of treating isolated assertions as file identity.

`native-final-deep-g7-02`: current default build/startup passed, actual trusted
scrollbar movement observed and host restored. Piper passed live speed transitions
and cancellation but the new terminal harness arm failed with webdriver-command-
failed. Replace the sibling-only paragraph selector with the actual paragraph
collection and await the asynchronous Stop before finding the next Play; add
content-free substages so any further failure identifies its operation. No product
change. The portfolio's generic failure sentence triggered the conservative outer
cleanup guard. `recovery.json` separately verifies stable original host state,
held-tree bytes/metadata and exact restoration; preserve the failure receipt.

Next RUN final TS checks plus the combined 162 ordinary-wrapper/release/portfolio/
native-smoke Node cases (the modified native harness invalidates its consumer
results). RUN a new G7 readiness/build/runtime receipt after those corrections.
G8/current release artifact and actual ordinary-wrapper smoke remain required.

`g-static-node-final-03`: all TS static leaves and 162 Node cases pass.
`g-browser-final-04`: 15 pass; the scrollbar fixture reused pre-click coordinates
after cancellation changed layout, so its later press was not a verified thumb
drag. Recompute the thumb after the negative case settles and require >100 px
displacement relative to the actual drag start (the old comparison included the
earlier passive movement). Retain its trace/error context in the gate's failure
directory. Browser capture drift is solely Chromium's generated `debug.log`;
exclude that explicit output, while retaining all executable/resource bytes.
RUN the final browser union and renewed TS static leaves after this fixture fix.

Prepare current-package build with the established G9 ownership/backup helper,
adapted only to this branch and evidence root. Preserve the tracked historical
package receipt and original adjacent core. The later ordinary smoke calls real
`runJourney`/`runInstaller`/`runUninstaller`; its injected preflight ends after
installed-artifact verification and before network/model work, then the existing
journey finally uninstalls/restores. Compare complete host state afterward.
G8 disables Node's optional compile cache in its process to avoid the previously
observed compile-cache residue inside the disposable TEMP; no historical receipt
is changed and current local admission/removal still runs in full.

`g-browser-final-05`: all **16 selected Chromium cases pass**, with identical
complete input captures including browser binaries/resources. `g-static-ts-final-04`
passes formatting/lint/type checks after the final browser fixture change. Native
G7 is running under `native-final-deep-g7-04`; no runtime owner changed during the
harness corrections. The G9 finish wrapper will bind package:windows:check and
the actual ordinary install/uninstall smoke to the built installer/application
hashes, then retain the newly generated adjacent core in ignored evidence and
restore the original adjacent directory by verified identity. No six-case lifecycle
rerun is selected: its shared primitive and package lifecycle behavior are unchanged;
the modified ordinary wrappers have direct descendant tests and current-artifact smoke.

G7-04 startup passes and restores the host. Its native Piper arm reaches genuine
completion with retired rates, then times out on the attempted Play from the
absolute end of the publication. The content-free live observation records that
terminal state. Use the existing saved-paragraph leaf for the subsequent explicit
restart; keep ordinary Stop/Play rate behavior in the deterministic and Chromium
controls. Enlarge the terminal test viewport and await the preview leaf at the
short final paragraph before activating it, then require exactly two accepted
units and the bounded 1200-ms scene wait. This prevents an offscreen target from
silently activating a preceding long paragraph. G7-04's separate recovery receipt
again verifies unchanged host and original adjacent-core restoration. RUN only
invalidated native harness/static leaves and a fresh G7 attempt; browser source
and its final runtime receipt remain unchanged.

`g-static-native-final-04`: formatting/lint and all 76 portfolio/native-smoke
Node cases pass with identical inputs. G7-05 startup passes; Piper reaches the
terminal placement wait, where the fixture compared a CSS-transformed host box
against an untransformed paragraph. A read-only observation and the existing
`translateY(-0.15rem)` rule explain the 2.4-px difference. Account for the actual
computed transform and require preview state; retain exact two-unit, short duration
and 1200-ms scene assertions. This is a fixture failure, not accepted native
terminal evidence. Preserve the receipt and independently verify restoration.
RUN the invalidated format/lint/76 Node leaves and fresh G7 after the correction.

Final reuse audit found one tool-provenance gap: early generic receipts bound the
pnpm shim and reported 11.15.1, but did not retain the complete installed pnpm
runtime tree. Do not infer its former bytes from version or source equality.
RUN the affected EPUB/desktop unions, TS static leaves, Python/Rust static leaves
and Chromium union under expanded tool capture. Retain direct Cargo/Pytest/Node
results only after their own consumed-input/environment comparison. This renewal
is caused by missing proof, not by elapsed time or another product change.
For native/package commands, capture the full pnpm runtime before/after the
remaining acceptance interval, in addition to each gate's existing tool/asset
manifest. Original incomplete-provenance receipts remain unchanged.

G7-06 passed startup and reached terminal completion, then failed its combined
terminal assertion without retaining the individual counters. It is not accepted.
Its separate recovery verifies unchanged host and original adjacent-core identity.
Replace the fragile long-chapter tail navigation in this added scenario with a
four-paragraph synthetic EPUB opened through the same native file ingress. Keep
its two spoken entries, omitted dash, scene marker, completion/rate assertions and
saved-paragraph next start. Record the bounded terminal counters before asserting.
The original long adaptive fixture and existing speed/cancellation matrix remain.
RUN the changed harness consumers/static checks, then a new native attempt.

## Independent review R01 and bounded follow-up

`g-native-node-closure-01`: 76 Node cases and format/lint pass. Expanded-tool
`g-js-closure-final-01`: TS static PASS, 655 EPUB and 812 desktop tests pass;
`g-python-static-closure-01`: Python static leaves pass. Captures are identical.

[DFM-CR-R01-20261114](review-r01.md) returned BLOCKED with two statically
supported residuals: VF-0048 late rate preparation after empty-tail/paused-end
completion; VF-0055 local preparation after publication synchronously invokes
Stop. Identity recheck passed. Acceptance evidence was also still incomplete.
RUN discriminating RED on these two public sequences before modifying the owners,
then renew their desktop/browser/native consumers and TS checks. The newly
complete EPUB union is reusable only with unchanged package inputs/tools/exports;
do not repeat it merely for a player/coordinator correction. Preserve R01 and all
existing receipts. G8 remains serialized and its captured source is frozen until
the exact-local run settles.

G8's actual Cargo selection passed (one exact-local test, 918.13 s), including
invalid Check, repaired retry without reacquisition, fresh rediscovery, integrity
and owned removal. Host and disposable TEMP restoration passed. Its outer wrapper
retains a failure because concurrent noEmit typechecking added only the declared
`apps/desktop/dist/tsconfig.tsbuildinfo` output. Separate `g8-closure.json` verifies
the original command/log, unchanged source/crate/JS/export/core/model captures,
unchanged four runtime frontend files, the compiled test identity/dependency file,
and current stable host restoration. The Rust debug test does not consume that
incremental output or frontend assets. The supplemental verifier's first attempt
encountered PowerShell date auto-parsing; preserving JSON timestamp strings fixed
that verifier before its receipt was written. No original receipt is rewritten.

`r01-residual-red-01`: seven discriminating failures and five controls pass on
unchanged production owners. Six terminal-rate variants do not release their
preparation; the mounted preparation variant starts real public preparation with
an unaborted signal after Stop. Strengthen the rate result observation with the
next ordinary interval tick after the late promise settles; RUN that same focused
RED selection before the minimal corrections, then GREEN and affected consumers.

`r01-residual-red-02` retains the seven failures; terminal completion has already
stopped the ordinary ticker, so that tick did not expose the late scheduler
mutation. `r01-residual-red-03` uses the public volume action to republish after
the late result: the two rejection routes additionally expose selected 100% in
completed state versus the saved 75% preference. This final RED fixture is retained.
The correction retires pending/future rate ownership on observed completion and
before late promise outcomes; live successor/paused work remains eligible. The
preparation owner gets the same post-publication run-token guard as synthesis.
RUN focused GREEN, then the affected desktop union and TS static leaves; renew
Chromium and current native/package artifacts. G8's native manager inputs remain
unchanged; its captured debug-test dependency graph excludes these TS owners.

`r01-residual-green-01`: all 12 selected regressions/controls pass. The final
desktop attempt `g-desktop-closure-final-02` passed static checks and 818 tests,
but SAC-11 detected that an extra early scheduler observation moved a controlled
clock read across the Pause transition boundary and started its successor.
Retain that adjacent assertion unchanged. Reuse the existing post-transition
observation for completion retirement; only a real future-preparation failure
needs an earlier terminal check. RUN the affected desktop/static union again.
`g-rust-static-closure-01` passed fmt and Clippy in both configured feature modes.

`g-desktop-closure-final-03`: all 819 desktop tests and TS static checks pass;
the original SAC-11 assertion is unchanged. `g-browser-closure-final-01`: all
16 selected Chromium cases pass on the resulting source. Both complete captures
match. `g-reuse-final-01` independently compares original receipts, commands,
consumed file membership/bytes, installed dependencies, exports, tool/runtime
trees and host versions for ten retained gate scopes. `reuse-final-01.json`
reports no additions, missing inputs, changes or during-run drift in any scope.
Only direct pytest/Cargo/Node leaves are retained from the earlier composites
with incomplete pnpm-runtime provenance; all pnpm-invoked final leaves were renewed.
Task documentation and receipt helpers are excluded as non-consumers, not silently
treated as unchanged runtime input. The checked proof records every scoped exclusion.

RUN G7-07 on the corrected final player/coordinator with the dedicated short
terminal EPUB. After verified host/adjacent restoration, RUN the prepared G9
current release-locked build, package check and actual ordinary wrapper smoke.
Reuse verified core/models and build caches as inputs only. Do not reuse old
playback or installer acceptance for the current artifact.

G7-07 passes both actual commands: startup includes trusted WebView2 gutter
movement; the Piper ES matrix preserves speed, preparation, synchronization,
seek/chapter, pause/resume and cancellation controls. The final short scene
records two accepted entries, 1200 ms intentional wait, 3006.96 ms playback and
no active/pending rate. Saved-paragraph restart reaches playing at 75%. Cancellation
is 208 ms; all eight created AudioContexts close; generated audio files and
external requests remain zero. Source/dependency/export/core/model identities
match. Original adjacent-core bytes/metadata and exact host state are restored.
Earlier G7 fixture failures remain failed; none supplies the final terminal PASS.

G9 current release-locked build and package check pass; historical package receipt
bytes/metadata are restored. `g-ordinary-deep-01` actually installs/uninstalls and
restores the host, but its added identity assertion incorrectly requires the
installed executable to equal the loose executable. The original failure remains.
The established Tauri NSIS bundler changes its unique UNK bundle marker to NSS;
the historical native-refactor acceptance documents this distinction. Preserve
the original smoke helper and require the current installed bytes to equal the
current loose bytes with exactly that three-byte transformation. RUN only the
corrected bounded installer smoke and its enclosing package/identity/restoration
check under new receipts; no product change or suite rerun is needed.

`g-ordinary-deep-02` passes actual production install/uninstall/restoration in
18.10 s. The entire installed executable equals the current loose executable
with only the unique UNK-to-NSS marker at offset 9200930 changed. G9 check02
passes with identical source/tool/JS/export inputs. Original profile/process
state, historical package evidence and original adjacent-core bytes/metadata
are restored; the temporary hold is absent. Current installer/loose/installed
identities are recorded in Commands and evidence reuse. The G7 default executable
was already superseded by the intentional release-locked build when an optional
archive was attempted; no archive or renewed G7 result was fabricated. Its
original command, source, binary and frontend receipts remain intact and scoped
to that actual default-feature execution.

RUN final source/tool/model closure comparisons and `pnpm.cmd check:evidence`
plus `git diff --check`. No product input changed after the final runtime gates.
Reuse the matched deterministic leaves; do not rerun them for documentation.
Then freeze all task/support paths and submit R02 to the independent reviewer.

`native-closure-01.json` passes final native input reconciliation: all G7 consumed
sources/tools/crates match; G8 differs only in the three later R01 TS owner/test
paths excluded by its actual compiled dependency graph. All 15 captured local
model/runtime assets match by complete bytes; the G8 executable/dependency file
remain exact. The complete pnpm runtime matches across the acceptance interval,
and default/release-locked builds emit identical frontend resources. No previous
native result is silently promoted to a different feature-mode artifact.

`g-evidence-r02-01` passes evidence retention and diff whitespace checks.
[DFM-CR-R02-20261114](review-r02.md) confirms both R01 corrections and all required
runtime/reuse/restoration evidence, with no additional runtime finding. It requests
one scope correction: the bounded journey's intentional sentinel exit generated
root-level `undefined.failure.json` because the helper omitted a receipt option.
Relocate that output byte for byte to ignored `g-ordinary-deep-02.failure.json`;
`r02-diagnostic-relocation.json` records preservation and exclusion from the patch.
The current helper and original runtime receipts remain intact; any future helper
reuse must first supply an explicit ignored receipt path. No further smoke run is
needed for this nonconsumed-output relocation. RUN only current evidence/diff
checks and submit a new frozen R03; reuse the independently inspected runtime gates.

`g-evidence-r03-01` passes the renewed evidence/diff checks. Independent
[DFM-CR-R03-20261114](review-r03.md) returns APPROVE with matching identities,
no finding and no remaining implementation blocker. Runtime input identities
remain unchanged from R02; no runtime rerun was needed for output relocation.
Close M0-M5/U1-U11, mark the 21 corrections fixed/validated and VF-0050 intentional,
archive the plan and update maintained indexes/incoming links. Preserve all prior
reports and historical authorities. RUN only the final documentation/evidence
checks and confirm the exact archived patch with R04; no Git mutation is authorized.
