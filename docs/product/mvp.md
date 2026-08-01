# Minimum viable product

## Implementation status

The visual-reading portion of this MVP is implemented and roadmap Milestone 4 is complete: a user can open a supported local EPUB, read and navigate its bounded semantic text and static raster images in one continuous reflowable layout, adjust closed display preferences, and restore an exact or nearest-valid logical passage after reselecting the same exact bytes. Milestones 5 through 7 implement bounded narration preparation and the constrained local service while retaining the historical no-standard-profile decision. M008's six implementation milestones connect that work into an exact-development audible demo. Quick mode is the default; prepared mode is explicit and initially selects one minute; refill remains one minute; the low-water warning is 10 seconds; the optional low-buffer throughput wait remains disabled; and the simultaneous 30-minute ceiling is never a startup target. M008.1 now applies a separate bounded semantic transition pause between independently generated units when the next unit is already buffered. M010.2 later supersedes only M008's fixed playback-rate policy with six validated boundary-deferred values from `1.00x` through `0.75x`. Artificial hard/token splits remain continuous, genuine buffering replaces rather than compounds the pause, and no silent PCM is created. Deterministic and packaged tests cover ownership, cancellation, stale suppression, lifecycle cleanup, pause continuation, truthful buffering, privacy, and all four prepared options. M008's historical Qwen policy run measured 41.312 seconds to first audible output and 19.49 buffering seconds per playback minute; that constrained profile exceeded the MVP target and is not the M011 baseline Piper release family.

Completed M009 connects audible segments to highlighting, focus-safe following,
identity-first navigation, and bounded non-skipping heard-position persistence.
M009.1 stabilizes the dedicated reader viewport, compact narration surface,
truthful loaded-duration text, paragraph leaf, and passive-scroll isolation.
M010 Milestones 1-3 add the privacy-safe host report, bounded native detector,
immutable measured registry, fail-closed matcher, bounded profile preference,
compatibility UI, and immediate pre-start recheck. Milestone 4 implements the
desktop-local recovery controller: failure invalidates identity first,
releases preparation and audio, contains the service, verifies zero ownership,
and only then permits one explicit restart from the latest heard checkpoint.
Protocol, cancellation-timeout, cleanup, and repeated-recovery failures are
terminal for the episode. Milestone 5 selects exact Piper/davefx as the
supported speed-focused CPU fallback after all frozen v6 gates passed. The
exact Qwen/Serena profile remains development-only. Milestone 6 now integrates
both admitted identities through one active service tree, exposes explicit
profile choice, and adds the exact Piper CPU adapter with bounded 22.05-to-24
kHz conversion. Piper alone uses text-complete, locator-safe,
spoken-expansion-aware `narration-piper-v2` segments so ordinary prose and
compact speech-expanding forms are bounded before protocol v1's 20-second
unit ceiling. A punctuation-only Piper unit that cannot produce a waveform is
omitted before synthesis without inserted silence or locator discontinuity;
other engines retain `narration-v1`. Its corrective packaged Piper resilience
arm passes. Qwen's offline service arm passes. When its exact native
configuration, generic `7,196`-MiB total-VRAM requirement, and corrective
`6,508`-MiB currently available development reserve pass, the packaged host
offers Qwen/Serena as an optional development-only profile. The latest
packaged run executed Qwen but later stopped at the depletion synchronization
assertion; it remains neither supported nor automatically recommended. No
automatic retry or uninterrupted-playback promise exists. Milestone 7 accepts
the final
[`tts-support-matrix-v1`](../architecture/tts-support-matrix-v1.md):
Piper/davefx is the sole supported CPU fallback and only automatically
recommendable profile when compatible and configured; Qwen/Serena remains
development-only; Qwen/Aiden and Supertonic/F1 remain unsupported. “Fallback”
does not authorize automatic engine failover. Replacement Ubuntu/Windows
closeout checks pass, so M010 is complete and archived.

M010.1 Milestone 6 now layers the bilingual runtime over that historical
matrix. The user can select Spanish or English and only exact language-bound
profiles are eligible: Piper davefx/Spanish and Piper joe/English are supported
CPU profiles; Chatterbox is supported for Spanish and English; Qwen
Serena/Spanish and Aiden/English are development-only constrained-buffer
profiles. Native supervision retains one child tree, protocol v1 remains
unchanged, and language/profile switches invalidate identity before cleanup.
Model-free validation and a sequential six-arm exact-host service matrix pass.
Milestone 7's packaged EPUB portfolio journeys also pass locally. Piper and
Chatterbox sustain the one-minute quick observation without underruns; both
development-only Qwen arms deplete once and refill safely on this host.
Pull request #159 passed the required Ubuntu and Windows checks and merged the
M010.1 closeout.

M010.2 is complete. Its early milestones froze the exact authorities,
closed the result-blind comparisons, and selected repository WSOLA v3 after
v1 and v2 selected no backend. Milestone 4 reorganizes the ready reader around
one fixed app bar,
accessible Settings, compact narration, a collapsible contents overlay, and
the sole publication scroll viewport. Milestone 3 makes English the fallback
only for missing/invalid/reset language
state; and, under ADR-0035, evaluate a separate fee-free six-rate v2 ending at
`0.75x`. V2 selected none; ADR-0038 authorizes a new boundary-deferred v3 in
which the current unit completes unchanged and the pending rate applies to the
next unit without restarting TTS or discarding queued PCM. ADR-0039 and the v3
architecture/executable authority now freeze that comparison before candidate
work. ADR-0040 selects repository WSOLA after every v3 machine and listening
gate passes. Milestone 5 integrates repository WSOLA at all six admitted rates.
Milestone 3 implements the bounded preference subset: valid saved Spanish or
English survives upgrade; missing, invalid, unavailable, over-limit, future,
or explicitly reset language state uses English; Quick/Prepared startup and
its closed target are separately persisted; and reset follows identity-first
cleanup. Applicable Piper, Chatterbox, and development-only Qwen presentation
remains gate-correct in the new Settings surface. The six-arm packaged
portfolio exposes the engine-neutral rate control on every profile, exercises
Piper Spanish/English at every rate, and runs Chatterbox Spanish/English plus
development-only Qwen Serena/Aiden. The maintainer confirms the full admitted
rate range, and pull request #170 passes the required Ubuntu and Windows checks.

M011 is in progress with Milestones 1 through 3 and the fail-closed Milestones
4A-4B deterministic foundation complete. Its implemented
standalone core payload targets Windows x64 with the measured Piper
davefx/Spanish and Piper joe/English CPU profiles. Chatterbox Spanish/English
is a separately gated optional GPU quality download, not part of
the core installer; Qwen remains development-only. This keeps the portfolio
MVP small while permitting a higher-quality demonstration after Chatterbox's
exact dependency, advisory, licence, artifact, integrity, size, hardware,
installation/removal, and clean-host gates pass. A portfolio-ready local build
may close without a signing certificate; a general public installer may not.
The deterministic core contains a private CPython/Piper runtime, both voices,
notices/model cards, and exact GPL source, and is verified natively before use.
It is not yet integrated into an end-user installer. Milestone 4B obtains only
the six approved model-data files from the official
`ResembleAI/chatterbox` Hugging Face repository at a full frozen revision and
verify every file's expected name, byte size, and SHA-256. It will not execute
model-repository code. The exact reviewed Chatterbox runtime has reproducible
three-part identity and is published under `chatterbox-runtime-v2`, but clean-
host acquisition has not passed; therefore the product manifest remains
withheld and the application does not expose Download.
Chatterbox's measured `3,644`-MiB VRAM peak no longer inherits the evaluated
host's 8-GB capacity as an absolute minimum. ADR-0044 admits at `5,632` MiB
total and `4,668` MiB currently available, keeps nominal 8-GB hardware as the
evaluated recommendation, and requires all three quantities to be disclosed
before download consent.

## Current implemented flow

1. The user opens VoxLeaf. VoxLeaf performs one bounded local compatibility
   check and shows only closed content-free status and rejection reasons.
2. The user selects a local EPUB.
3. VoxLeaf validates and loads the book.
4. VoxLeaf opens at the user's last saved passage, or the beginning for a new book.
5. The user reads and navigates the EPUB in a continuous reflowable reader, adjusts closed display preferences, and can close or replace the publication.
6. On an exact configured admitted host, the user can select a
   language-applicable supported Piper or Chatterbox profile, or an explicitly
   gated development-only Qwen Serena/Spanish or Aiden/English profile, then
   start quick or prepared local narration from the active narration leaf or
   visible target and hear complete units through the bounded in-memory
   player.
7. The reader highlights and follows the audible stable segment. Ordinary
   viewport movement may inspect the book without changing narration. An
   explicit paragraph leaf, visible-passage, chapter, or previous/next passage
   action invalidates obsolete audio before a bounded restart from its
   canonical target.
8. Between independently generated buffered units, the desktop player applies
   the frozen M008.1 semantic pause for the completed sentence, dialogue,
   paragraph, heading, scene, or terminal-ellipsis boundary. The next segment
   becomes active only when its audio actually starts. If the queue is empty,
   ordinary buffering supplies the separation and no extra pause follows.
9. When exact-development narration is available, one contextual leaf can
   replace obsolete narration and start at its canonical paragraph. The leaf
   defaults to the paragraph at the active visual line and temporarily moves
   beside an eligible heading or paragraph when the pointer hovers it. It
   reinforces preparing, audible, and saved states when they match that
   paragraph, otherwise it becomes a selectable preview without restarting
   narration. The gutter control remains icon-only so state wording cannot
   cover publication text; its full action/state name remains accessible.
   Ordinary text clicks remain inert.
10. VoxLeaf saves the canonical heard segment start/end checkpoint while
    narration owns position, otherwise saves the canonical visual locator, and
    retains display preferences on the approved bounded lifecycle.
11. Immediately before starting the exact model child, VoxLeaf rechecks the
    selected profile and fails closed if host compatibility or the applicable
    native development gate changed. Switching profiles first invalidates and
    stops the old narration; the two engines never run simultaneously.
12. After a classified operational failure, VoxLeaf contains obsolete work
    and verifies zero service/audio ownership before offering at most one
    explicit restart. Restart uses fresh identities and the latest heard
    checkpoint; terminal failures direct the user to compatibility recheck or
    application restart.
13. The compact narration bar applies `1.00x` through `0.75x` after synthesis.
    The currently audible complete unit keeps its rate and the newest pending
    choice starts at the next unit without restarting TTS or discarding queued
    source PCM.

The narration path is deliberately hidden when no exact local admitted
configuration is available. Piper is the supported CPU fallback, Chatterbox
is the supported bilingual GPU profile, and Qwen remains constrained and
development-only. M011 keeps Piper in the core distribution and will expose
Chatterbox only as an explicit verified optional download. Piper payload and
licence/source fulfillment are implemented; installer delivery and optional
acquisition remain M011 work, so no current local artifact setup is yet a
general end-user distribution.

The highlight/follow path above passed repository-authored synthetic,
Chromium, packaged WebView2, exact-host, M009.1 clean-host, and ephemeral
private-publication validation. M009.1 reproduced and repaired the
same-chapter materialization condition that could leave an accepted audible
range without a DOM target, then corrected passive-scroll retargeting without
committing the user's EPUB or weakening the completed M009 synchronization
authority.

## Remaining target user flow

1. M011 has frozen the exact Piper core, optional Chatterbox package, threat
   model, acquisition, dependency, and licence authority before packaging
   results.
2. M011 has created the integrity-checked standalone Piper Spanish/English
   runtime and voice payload. Installer integration must still prove use
   without a developer shell or manual firewall rule.
3. M011 Milestone 4B freezes and implements the split Chatterbox acquisition:
   exact reviewed runtime delivery plus exactly six model-data
   files from the official full-revision Hugging Face source. It adds explicit
   consent, bounded native download/cache, per-file digest verification, safe
   model loading, atomic installation, separate activation, offline use, and
   application-owned removal. Runtime publication is complete; clean-host
   acquisition, offline bilingual narration, removal, reinstall, and final
   audit validation remain, so the download action and end-user claim stay
   absent while the Piper core can continue.
4. M011 packages and validates a versioned Windows x64 installation, repair,
   manual update, and uninstall lifecycle on a clean normal-user host.
5. M011 decides Piper-core portfolio readiness, optional Chatterbox readiness,
   and signed public-installer publication independently.

M010.1 is a deliberately narrow pre-M011 exception to the earlier post-MVP
candidate order because English narration and a stronger portfolio demo are
now active requirements. Its historical resultless v7 authority is preserved;
v8 adds exact local Qwen/Serena Spanish and native-English Qwen/Aiden controls,
then sequentially screens Chatterbox Multilingual V3 and MOSS-TTS-Nano ONNX.
The corrective screens select Chatterbox for the next full matrix and defer
MOSS after dialogue-tail omission; they do not create a support claim.
Exact intake rejected CosyVoice before execution because no non-personal
default voice path was frozen. The cycle may integrate at most one passing new
engine. Pocket TTS, Chatterbox's Spanish-only
regional profile, Kokoro, and additional voices remain in the
[post-MVP candidate backlog](post-mvp-tts-candidate-backlog.md).

## MVP capability status

Implemented and validated:

- Open a bounded supported EPUB from local storage without retaining a path.
- Extract ordered safe semantic content, table of contents, and supported local raster images.
- Render title, author, chapter navigation, text, and images as a continuous reflowable reader.
- Reconstruct the visible passage from a stable logical locator across viewport or typography changes.
- Restore an exact or nearest-valid passage after the user reselects the same exact EPUB bytes.
- Persist bounded logical reading state and closed display preferences.
- Prepare deterministic bounded narration text and locator-linked segments through the package API.
- Run the candidate-neutral local TTS feasibility harness and retain the explicit no-viable-profile decision for both exact evaluated profiles.
- Run the exact development-only Qwen/Serena adapter through the native
  supervisor with frozen identity/artifact checks, bounded complete-unit
  delivery, identity-first termination, stale suppression, and clean reload.
- Own complete 24-kHz mono float32 units in one bounded desktop FIFO outside
  React, consume them through a dedicated low-level Web Audio player, account
  underruns, and release played or invalidated originals exactly once.
- Preserve natural separation between generated units with one bounded,
  interruptible semantic transition timer. Retain only the numeric delay with
  the audio unit, create no silent PCM, and report its elapsed time separately
  from playback and involuntary buffering.
- Connect the active narration locator or explicit visible target to bounded narration preparation, the M007
  client, and audible quick/prepared playback under the exact-development
  availability gate.
- Keep ready-publication application, book, and compact narration chrome
  stable around exactly one EPUB scroll viewport; allow narration detail to
  collapse without hiding required state or recovery, and report loaded audio
  with exact text rather than a progress bar.
- Highlight and follow the active prepared segment without mutating publication
  DOM or moving keyboard focus.
- Let passive visual movement inspect the publication without replacing active
  narration; route only explicit leaf, visible-passage, chapter, and stable
  prepared-segment navigation through identity-first cancellation, preserve
  paused intent until an explicit target is selected, and expose fixed
  content-free keyboard controls.
- Persist the audible segment start when playback begins, advance only after
  matching completion, flush the latest heard checkpoint on interruption and
  lifecycle boundaries, and replay from the segment start after a mid-segment
  restart.
- Reject stale work before cancellation, abort preparation, keep sensitive
  prompts and PCM outside React state, and expose only content-free status.
- Display actionable reader loading, opening, restoration, and error states.
- Detect privacy-safe bounded host facts, match the closed immutable executable
  profile registry with fixed safety margins, expose accessible compatibility
  state, persist only a bounded profile ID, and recheck immediately before
  starting the exact child.
- Classify operational failures without dynamic details, invalidate identity
  before cleanup, verify zero service/audio ownership, retain at most eight
  content-free diagnostic entries, and offer no more than one explicit restart
  from the latest heard checkpoint.
- Provide documented local setup plus deterministic reader/package validation.

Remaining:

- Provide compliant minimal Piper runtime/voice distribution, exact shipped
  dependency and licence closure, installer packaging, and a validated
  normal-user Windows path in M011.
- Provide the separately gated optional Chatterbox download only after its
  minimal graph, advisory/licence/provenance, integrity, size, GPU,
  install/remove, offline, and clean-host evidence passes.

## Target acceptance criteria

### Privacy

- Book contents are not sent over the network.
- TTS inference runs on the local device.
- Generated audio is not persisted by default.
- Logs contain no book text or generated audio.
- Derived narration text does not enter logs, analytics, benchmark summaries, snapshots, or persisted reading progress.

### Playback

- Playback can start without synthesizing the complete chapter.
- Narration starts from the current visual reading location.
- Playback begins when the initial playable-audio threshold is met rather than after a fixed timer.
- The initial threshold is measured in playable audio seconds and targets approximately 15 seconds.
- Prepared playback is an explicit user choice with 1-, 2-, 5-, or 10-minute
  playable-audio targets, exact loaded/target duration text, and a content-free
  estimate; the presentation does not use a growing bar that can be mistaken
  for book or playback progress.
- The visible reading passage follows narration across layout or chapter boundaries without losing the logical reading position.
- Playback-only pause may continue bounded generation for the same active
  identity; explicit stop and invalidating actions cancel obsolete work.
- Seeking invalidates stale queued audio.
- Changing chapters cannot play audio from the previous chapter.
- Changing the active book, model, or voice cannot play audio from the previous generation.
- Buffer exhaustion is represented as buffering, not as an application freeze.
- A low-buffer warning appears before predictable frontier exhaustion when
  available lead crosses from above to at or below 10 playable seconds.
- Already-buffered generated units use the frozen boundary-specific transition
  delay; hard/token splits remain immediate, terminal ellipses receive the
  explicit override, real buffering substitutes for the delay, and final
  completion receives no trailing wait.
- M010.2 playback speed is applied after synthesis, offers only `1.00x`,
  `0.95x`, `0.90x`, `0.85x`, `0.80x`, and `0.75x`, preserves pitch, and
  neither regenerates audio nor changes model RTF. It may use only an admitted
  fee-free permissive backend.
- A speed selected during one audible generated unit becomes active at the next
  unit. The current unit, TTS process, generation identity, and queued source
  PCM remain unchanged; first non-default activation is prospectively bounded
  to 1,000 ms p95 and 200 MiB additional process RAM, and `1.00x` bypasses
  time stretching.
- Source frames remain memory and heard-progress authority; effective
  listening duration governs startup, low-water, and underrun promises.

### Accessibility

- Core reading and playback controls are operable with a keyboard.
- Controls expose meaningful names and state to assistive technologies.
- Focus and playback or buffering state are visible.

### Performance

- No transition pause is added before the first audible unit after the initial
  playable-audio threshold is met.
- Wall-clock startup latency and playable audio depth at startup are measured separately.
- The MVP may buffer for up to 5 seconds per minute.
- Queues and buffers have explicit maximum sizes.
- The constrained demo retains or reserves at most 43,200,000 24-kHz mono
  sample frames, 172,800,000 logical PCM bytes, and 256 complete
  units/metadata entries simultaneously; 30 playable minutes is a ceiling, not
  a startup target or uninterrupted-playback promise.
- Semantic transition pauses and the separately disabled adaptive low-buffer
  wait are reported separately from involuntary buffering and cannot be used
  to claim real-time generation.
- Startup latency, real-time factor, buffer depth, underruns, and cancellation latency can be measured.

### Reliability

- Unsupported or malformed EPUBs produce a recoverable error.
- A saved reading locator that no longer resolves falls back to the nearest valid location and reports the recovery without exposing book text.
- Reflowing after viewport or typography changes preserves the logical reading location even when the visible layout changes.
- Closing a book releases its reading and generation resources.
- Model-loading failure does not corrupt saved reading progress.
- Unsupported acceleration falls back safely or produces an actionable compatibility message.

### Distribution and release security

- The first Windows x64 package includes only frozen, required components and
  excludes benchmark tools, private artifacts, generated audio, model caches,
  and optional TTS profiles that have not passed exact distribution gates.
- Chatterbox weights and GPU runtime do not enter the core installer. A
  compatible-but-absent selection may open an accessible confirmation that
  discloses measured download, installed/staging storage, hardware, cold-load,
  and licence information. Decline/cancel causes no network request or profile
  change; verified installation completes before separate explicit activation.
- Chatterbox requires `5,632` MiB total and `4,668` MiB available dedicated
  VRAM under the current measured-capacity policy. A nominal 8-GB GPU remains
  recommended and is the evaluated class. Admission of an otherwise compatible
  6-GB-class host is conditional on the live available-memory check and is not
  represented as separate clean-host validation evidence.
- Optional model acquisition is fixed to the official
  `ResembleAI/chatterbox` repository, one full commit, and six approved data
  files with frozen expected byte sizes and SHA-256 values. VoxLeaf never
  resolves `main`, downloads arbitrary snapshot contents, executes Hub code, or
  accepts repository/revision/file/URL input from the renderer. Hub security
  scanning is defense-in-depth and does not replace local integrity checks.
- The Chatterbox runtime is not supplied by the model repository. It retains a
  separate exact dependency/source manifest and reproducible three-part
  delivery identity. Those exact parts are published and must pass clean-host
  acquisition before the profile becomes downloadable. A completed model
  download without the verified runtime is never treated as installed.
- Every bundled or deliberately acquired runtime/model/voice artifact is
  pinned and integrity-checked before use; normal reading and narration make
  no external request and no silent download occurs.
- Exact shipped Node, Rust, Python, native, model, and voice components have a
  versioned content-safe inventory with source, licence, reason, and hash.
- No known high or critical reachable vulnerability is silently shipped;
  advisory-tool blind spots and any narrow time-bounded exception are stated.
- Piper/phonemizer GPL obligations, applicable corresponding-source mechanics,
  davefx/joe voice provenance/model cards, CC0 terms, and the root MIT notice
  are fulfilled before distribution.
- A clean normal-user Windows host can install, run, repair/reinstall, replace
  a version manually, and uninstall VoxLeaf without a repository, build tools,
  administrator-created firewall rule, or deletion of user books.
- A compatible clean GPU host can decline, cancel, retry, install, use offline,
  restart, and remove the optional Chatterbox package. Corrupt, truncated,
  oversized, stale, insufficient-space, or incompatible packages fail closed
  and leave Piper usable.
- Portfolio-ready local evidence may use an unsigned maintainer build with an
  explicit label. A general public installer additionally requires protected
  external signing credentials, signature verification, and a published
  checksum.

## Non-goals for the first version

- Producing or exporting complete audiobook files.
- Guaranteeing uninterrupted or real-time narration on the constrained Qwen
  development profile.
- Cloud synchronization.
- Online TTS providers.
- DRM circumvention.
- Supporting every ebook format.
- Automatic multi-character voice casting.
- User voice cloning or reference-voice enrollment without a separate accepted consent, privacy, persistence, deletion, and abuse-safeguard decision.
- Mobile applications.
- A plugin marketplace.
- Automatic updates, enterprise process sandboxing, external penetration
  certification, formal reproducible-build guarantees, and non-Windows
  installers; these are deferred unless M011 finds one is required to prevent
  a concrete release-blocking risk.
