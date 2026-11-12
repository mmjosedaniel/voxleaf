# Read-only preparation notes

These are source/test investigation notes, not executed reproductions or
acceptance. Reconfirm current source before each unit. The coordinator uses one
implementation writer; preparation involved no source edits or tests.

Further bounded preparation is recorded for the
[directed Chromium batch](browser-preparation.md) and
[U11 authority/load ownership](u11-preparation.md) and
[U15 installer ownership](u15-preparation.md). These are not test evidence.

## U2: initial admission

Scheduler test helpers support Prepared 60,000 ms at 75%, four segments and three
15,000-ms units with preparation incomplete. Expected before allocation: 45,000
source/60,000 effective, no active rate. Select 100% before allocation: expect
preparing with 45,000 effective, three retained units and fourth synthesis allowed.
After the fourth unit, allocation can begin. Current refresh latches initial
playback before allocation and returns playing on later rate changes.

Preserve Quick's existing early production/refill behavior, Pause before
allocation, explicit Play available, completed short tails, after-allocation
deferred speed and simulation consumers using consumeSampleFrames directly.
Simply moving all startup latch assignments to activation can break these.
PCM B08 tests have a deferred preparePlaybackRate seam. Hold it before changing
rate, assert no backend starts at 100% until enough lead exists, then exactly one
start. The browser fixture in reader-narration-bugfixes has a real worklet-load
barrier; its current held synthesis rejects only and needs bounded controlled
success to demonstrate the fourth result enabling playback.

## U3: reader provenance and placement

5.1: segment-highlight-controller issues instant scrollBy before its two-frame
settlement. Stop cancels settlement and resumes the tracker without admitting a
settled guard. RPI's current guard is installed by setCurrentLocator at settlement,
so it cannot classify that late event. Capture actual automatic displacement at
both follow scroll sites and retain it through follow cancellation; retire it on
real displacement, explicit placement or root/document replacement. Do not admit
an unsettled destination as saved progress or suppress all post-Stop reading.

Modeled unit recipe: ManualSegmentHighlightEnvironment plus manual tracker,
heard interior A, offscreen automatic movement, hold settle, Stop, notify delayed
scroll with different caret sample. No passive save should replace A; changed
geometry then permits real manual sampling. Final controlled real-DOM recipe
adapts VUC-01 in reader-narration-bugfixes: inspect B while paused, resume real
scrollBy to A, Stop before settlement, deliver retained root scroll notification,
then full-locator save/reopen assertion. Prove real viewport displacement and a
differing potential caret sample. A genuine wheel and reopen control must persist
the new location. Reuse RPI synthetic image fixture/storage checks where needed.
Label this controlled real-DOM ordering, not natural occurrence or modeled geometry.

5.2: ReaderPublication's active-locator layout effect unconditionally projects
the default leaf target. Extend the existing hover test: hover B while A is in
comfort, deliver a distinct audible range inside A without viewport movement,
verify active location advances but preview/click remains B. Focused leaf must
retain its element/focus/target across another boundary; leaving/blur restores
current A. Bound explicit placement ownership to the current spine occurrence;
clear on leave, document replacement and disposal. Preserve existing behavior
for movement over reader content and the leaf host. Do not freeze visible state.

## U4: image priority and coalesced observations

1.3: hold FakeSourcePreparer's first prepare, then admit one or seven near
requests, then visible demand with a distinct resource ID. At capacity, assert
eight outstanding before release and visible still waiting outside the queue.
The next read must be the visible image, with retained bounds and one decode.
Test dynamic visibility inversion before dispatch and FIFO at equal priority.
Current startNext shifts FIFO. A bounded dispatch selection must consider current
queued visibility and admit waiting visible demand at a freed slot before near
FIFO, preserving blockedRevision/preempted retry controls and active ownership.
Do not bypass SemanticRasterImage tests' existing loader.load seam silently.

2.4: capture observer callbacks by rootMargin (visible 0px, near 256px 0px).
Submit matching intersecting/nonintersecting entries in both orders plus unrelated
target entries. Choose the newest matching entry for each observer independently;
retain visible-over-near precedence. A single pass comparing entry.time and using
the later array entry for ties is ES2022-compatible. Preserve active/unmount guards,
missing-observer fallback and intersectionRatio behavior. Assert stale callbacks
cannot report after disposal. Resource policy remains one decode, eight live
sources and 16,777,216 aggregate pixels.

## U5/U6: normalization and empty fragments

1.4: test both ES/EN `18–20 °C` and `18 - 20 °C`, plus English
`8 – 20 °C` and Spanish `21 - 20 °C`: the left endpoint can independently
match a lexical form. Protect both endpoints via bounded same-prose/language
context. Current reverse range recognition requires a unit on the left.
Preserve accepted standalone temperatures, negative literal values, editorial
dashes, two-unit signed/decimal DCR-09 ranges, display text and exact source
ranges. Extend public preparation matrix for current Piper/Chatterbox/bilingual
profiles. Do not change frozen normalizers.

2.5: the incremental scanner must enforce structural language ordering and
case-insensitive duplicate variant/singleton rejection. Reference syntax:
[RFC 5646 sections 2.1 and 2.2.9](https://www.rfc-editor.org/rfc/rfc5646.html#section-2.1).
For en/es: up to three immediate three-letter extlangs, optional four-letter
script, optional two-letter or three-digit region, variants (5-8 alphanumeric
or four starting with digit), extensions (non-x singleton plus 2-8-character
payload), then optional x with 1-8-character opaque private-use subtags.
Keep exact case-insensitive `en-GB-oed` as the admitted irregular grandfathered
exception, with no added suffix. This is syntax, not IANA validity checking.
Preserve incremental bounded work and cancellation, avoid whole-tag split or
lowercasing, retain existing long-private-use resource tests.

RED examples include en-12, en-US-US, en-ab12, reversed script/region order,
duplicate script and mixed-case duplicate variant. Controls include es-419,
EN-gb-OED, en-Latn-US-1901-u-ca-x-a and opaque private-use data. Public
preparation must keep canonical locator mapping and invalid-tag literal text.

4.2: target-resolver currently treats only undefined as document start; the
parser intentionally retains empty string. Treat empty fragment identically,
without touching URL parsing or unsupported target policy. Direct RED must
assert exact/document-start, because recovered/fragment-unresolved currently
shares the locator. Extend R8-07 EPUB2/3 public fixtures with href ending #,
alias and repeated-spine controls; preserve missing nonempty fragments.

## U7/U8: settings and optional acquisition

3.3: Reset currently refreshes narrator after resetLanguage selects against old
hardware profiles; selectLanguage already waits for explicit-recheck. Hold that
check in the fixture, assert reset retains the configuration barrier and does not
refresh until the final English/Aiden result. Preserve failed Stop and unsuccessful
reset ordering. Use supported synthetic development-host/Aiden browser control,
never real Qwen inference for a selection regression.

2.1: native select_at must preserve Confirming's token already bound by Download
before host preflight. Extend RAF-16 with same-acquisition ordinary reselection,
plus existing canceled-token rejection. Frontend Select during active acquisition
must not replace its generation or detach terminal outcome, including Settings
remount. Preserve genuine newer-action stale suppression; explain any expectation
change in old same-acquisition Select tests instead of weakening broad protections.

2.2: renderer can reject busy Remove using existing App-owned downloadPending and
known busy states before configuration/Stop, without adding a snapshot IPC field.
Native worker_active intentionally remains true during Installed cleanup. Reserve
Removing under the operation mutex before supervisor Stop, release that mutex
before awaiting, retain supervisor admission guard through deletion, and restore
the entire previous operation on Stop failure. Preserve runtime-to-operation lock
order; never acquire runtime lock under the manager mutex or hold it over Stop.
RED post-commit busy removal must reject Busy before a supervisor that would fail;
assert bytes remain, duplicate admission is excluded, and rollback permits retry.

ADD-01: hold Download, Cancel and a stale precommit poll. In both completion orders,
Cancel returns Installed and later cleanup fails. Join the paired acquisition,
then obtain exactly one fresh read-only snapshot if Cancel is still current,
bypassing stale coalesced poll. Never republish stale download result. Keep native
committed bytes, no retryCleanup request, precommit cancellation behavior, remount
polling and newer-action suppression. Retaining acquisition ownership requires
distinct bounded Cancel-pending presentation so repeated Cancel is not accidentally
enabled. Existing native cleanup-failure tests establish installed-byte survival;
extend only missing assertions.

## U9/U10: subprocess capture and memory monitor

1.5: current cli.py communicate retains both streams, applies stdout limit only
after exit and ignores returncode for parsed PASS. RED schema-valid official PASS
with exit1 must yield generic content-free failure/2; preserve PASS/0 and legitimate
typed FAIL/2. Real synthetic child writes cap+1 stdout and remains alive: detect
overflow before absolute deadline and reap through existing Job ownership. A
child writing large stderr before reading stdin proves no stderr accumulation or
pipe deadlock. Bound stdout while reading, discard stderr, and share one monotonic
deadline across bounded stdin/read/exit; retain separate existing cleanup deadline.
Preserve suspended spawn, Job assignment before resume, owned descendants/handles,
and VCA08 cleanup-failure/interruption tests. Do not close a buffered pipe from
another thread while blocked I/O retains its lock. Leave pilot case1.6 untouched.

1.7: v5 finish currently samples from caller before signaling, ignores live
thread after bounded join and closes probes while background sampling can own
them. Use Event-gated fake samplers with a real thread: block background sample,
finish must report timeout without caller sample/close, then release and finish
again, with one final sample/one close per probe. Thread can own periodic/final
sample and both closes after successful startup handoff; caller signals/joins
and reads settled result. Keep pre-handoff initial/start failure cleanup with
caller; retain sampling/close failures and attempt both probe closes. Cover final
sample failure, blocked final sample, repeated finish and normal boundary timing.
Reuse DCR-18 fixture design, not its v13 PASS as v5 evidence.

## U11: authority decision to freeze before edits

Current v13 raw schema inherits v4's closed cancellation trial fields and the
deriver trusts passed booleans. Current benchmark cancellation lacks observed
worker acceptance and actual publication-gate proof. A v14 successor is the
currently available bounded route for new content-free proof/derivation; do not
rewrite v4/v13 schemas or historical results. Existing isolated worker responses
only return final batches/errors; parent thread start is not acceptance evidence.
After-first proof should observe the first eligible unit through publication then
reject its successor after invalidation, without claiming streamed engine output.

ADD-02 safety observation must start before cold loads but remain separate from
the comparable measurement window. Check stop before every factory/load/dispatch
and cancellation trial. Active isolated load has no generation request ID; normal
close shares its receive channel and cannot be used concurrently without ownership
coordination. Contain/reap that owned load, retain candidate-before-monitor cleanup,
and classify incomplete cold trials as non-derivable. Model-free tests do not
recertify hardware performance or establish CPU admission.

## U12-U16: release and harness follow-through

1.8: reject legacy LifecycleStatus during PowerShell parameter validation,
before canonical-layout, Node, checksum or Tauri work. A temporary wrapper with
harmless command sentinels can demonstrate the early boundary; preserve default
and explicit not-run compatibility and genuine receipt validation.

4.4 requires actual revalidation before any disposition. Current
validateLifecycleReceipt already calls matchesRecord/hasFields for exact key sets
and values, preserving step-array order. Characterize reordered root/nested keys,
and rejection of missing/extra keys, changed values and reordered steps. Do not
silently substitute ordinary Chatterbox receipts, whose separate stringify
comparison is outside this retained lifecycle case.

3.4: _uv_components picks sdist else wheels[0]. Preserve explicit sdist provenance
and editable none; select wheel fallback using target CPython3.12/win_amd64 tags,
not host sys_tags. Existing locked packaging provides wheel/tag parsing. Test
exact ONNX URL/hash/size against core lock, universal/ABI3 compatibility,
unsupported/ambiguous choices and permutation. Changed embedded core inventory
requires configured write-manifest rebuild plus core check, final installer and
lifecycle; preserve historical Windows v3 evidence through journaled restoration.

4.3: stage validated receipt/manifest/evidence bytes plus originals before the
first replacement, on the same volume. Inject failure at each replacement and
rollback with present/absent original files. Restore remaining peers even if one
rollback fails; retain recovery bytes and truthful failure. Successful output must
equal canonical authority bytes. Use temporary fixture only; do not regenerate
accepted v7 authority or claim power-loss/concurrent atomicity.

5.3: current Start-Process -Wait waits descendants without a deadline. A Windows
Job owner assigned before resuming an exact suspended hidden installer can wait
for the full tree with a monotonic deadline, terminate only owned work, and prove
zero active processes before restoration. Handle assignment failure by exact
suspended-process cleanup; no broad process-name/PID scans. Test benign parent
that exits while descendant blocks, unrelated sentinel survival, and restoration
only after verified cleanup. Preserve backups/journal if cleanup fails. Adapt
existing VAF H13 mocks without dropping assertions. One final real lifecycle must
bind final artifact and separately report outer host restoration.

5.4: body-read catch currently checks user cancellation then reports invalid JSON.
Apply user-abort precedence then timeout signal before malformed response, matching
fetch-side semantics. Public Node test uses loopback headers/partial body held to
deadline, plus prompt invalid JSON, explicit user cancel and independent DELETE
cleanup. Source and its Node test only, but dependent native harness and G7/G10
evidence must follow this final harness edit.
