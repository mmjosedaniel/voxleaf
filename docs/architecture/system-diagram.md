# Canonical system diagram

## Purpose and evidence rule

This is VoxLeaf's canonical high-level system map. It distinguishes running product behavior from repository foundations and approved or deferred work. A type, fake, scaffold, ADR, or plan is not implementation evidence by itself. Statuses here are based on production code plus the validation recorded in completed plans; future nodes appear only when accepted architecture or the roadmap supports them.

For detailed rationale and invariants, see the [architecture overview](overview.md). For milestone authority, see the [roadmap](../plans/roadmap.md) and [completed plans](../plans/completed/README.md).

## Status legend

| Status               | Meaning                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Implemented**      | Production code exists for the stated boundary and repository validation covers it.                               |
| **In progress**      | Active implementation evidence exists, but the approved boundary is not complete.                                 |
| **Approved planned** | An accepted decision or approved roadmap milestone authorizes the work; production implementation is not claimed. |
| **Blocked**          | A required decision or prerequisite is missing or failed, so implementation is not authorized.                    |
| **Deferred**         | The roadmap places the work after the next approved milestone or its design remains intentionally unresolved.     |
| **Foundation only**  | A scaffold, contract, fake, or shell exists without the runtime behavior its area will eventually own.            |
| **External**         | A user-, operating-system-, or hardware-owned boundary outside the repository.                                    |

Solid arrows are implemented runtime or package relationships. Dashed arrows are approved planned, blocked, or deferred relationships and must not be read as working data flow.

## Current status snapshot

| Area                                               | Status                                  | Repository-backed boundary                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Desktop visual reader                              | **Implemented**                         | Local byte selection, publication lifecycle, safe semantic React rendering, navigation, reflow, preferences, logical-locator tracking, and bounded restoration.                                                                                                                                                                                                          |
| EPUB ingestion                                     | **Implemented**                         | Bounded in-memory open, archive/package/navigation validation, immutable safe semantics, lazy bounded raster access, and deterministic locators.                                                                                                                                                                                                                         |
| Narration preparation                              | **Implemented**                         | `@voxleaf/epub` exposes bounded, cancellable, locator-linked `OpenedPublication.prepareNarration` batches. The exact-development coordinator calls it from the active or settled navigation locator.                                                                                                                                                                  |
| Shared contracts and fakes                         | **Implemented**                         | Versioned contracts, runtime decoders, conformance fixtures, deterministic fakes, and the closed protocol-v1 control family exist. They do not implement real TTS, playback, or synchronization.                                                                                                                                                                         |
| Tauri native shell                                 | **Implemented**                         | Completed M007 implements and validates the narrow binary-response boundary, persistent child supervision, framed standard streams, fixed timeouts, process-tree termination, zero automatic restart, typed commands, native-only exact-service activation, measured handoff diagnostics, and exit cleanup. No plugin, general shell capability, or listener is granted. |
| Python TTS area                                    | **Implemented**                         | Completed M007 implements and validates the offline framed service, bounded fake engine, common one-active adapter boundary, exact development-only Qwen/Serena adapter, and content-safe exact-host measurement runner. Default tests remain model-free.                                                                                                                |
| TTS feasibility and profile decision               | **Implemented**                         | The bounded candidate-neutral `v2` harness measured both exact profiles. The license/offline/packaging audit is complete; limited one-evaluator quality remains non-promotable; ADR-0013 selects neither profile. This is development evidence, not runtime behavior.                                                                                                    |
| TTS profile blocker resolution                     | **Complete; standard blocker retained** | The exact Serena `v3` matrix failed startup, throughput, zero-failure, and mid-generation cancellation. `selection-v5` retains the standard blocker and ADR-0015 permits one exact GPU worker only for a bounded adaptive development demo. No passing standard or general hardware profile exists.                                                                      |
| Short-unit and dual-worker feasibility             | **Complete; alternatives rejected**     | Milestone 6.2 rejects shared batching, targeted tokenizer placement, CPU-only generation, and dual-worker scheduling. The official concurrent arm stopped at `resource-limit`; a later low-load diagnostic completed but improved aggregate RTF by only about 2.6% while substantially slowing the GPU worker. Local and required PR validation pass.                    |
| Constrained local TTS service and process protocol | **Implemented**                         | Completed M007 validates frozen transport limits, canonical contracts, bounded Python service, native supervision, typed desktop consumption, one-unit ownership, exact Qwen/Serena integration, model-free packaged evidence, and measured exact-host handoff/cancellation/cleanup. Completed M008 consumes that boundary for bounded product narration and playback.   |
| Standard production TTS profile and distribution   | **Blocked**                             | ADR-0013 still selects no passing standard profile. Continuous playback, CPU fallback, general hardware support, model/runtime distribution, and production graduation require later evidence and decisions.                                                                                                                                                             |
| Adaptive audio scheduling and playback             | **Implemented and validated**           | Completed M008 provides the frozen authority, scheduler, sole-owner payload FIFO, Web Audio player, preparation presenter, controls, exact-development application coordinator, measured packaged quick/prepared matrix, final demo policy, and passing required CI. M009 Milestone 2 adds bounded source-range projection without changing PCM ownership.               |
| Reader/narration synchronization                   | **Implemented and validated**           | Completed M009 implements the frozen segment authority, bounded content-free audible projection, one reader-owned Custom Highlight, focus-safe following, identity-first navigation, non-skipping heard-position persistence, passing exact-host proof, and repository/CI closeout.                                                                                         |
| Reader experience stabilization                    | **In progress**                         | M009.1 Milestones 1-2 freeze paint-aware authority and repair same-chapter active-range materialization while retaining one focus-safe Custom Highlight. Deterministic and Chromium evidence pass; clean-host packaged validation is pending. The dedicated reader scroll owner, bounded leaf, compact narration, and text-only loaded duration remain planned.        |
| Hardware profiles, fallback, and resilience        | **Approved planned**                    | The active M010 ExecPlan follows M009.1. No general hardware inventory, measured product profile, validated CPU fallback, automatic recovery policy, production dependency, or support claim exists yet.                                                                                                                                                                    |
| Release packaging                                  | **Deferred**                            | M011 remains future work; installer bundling, signing, model/runtime distribution, updater policy, and complete-MVP validation are not implemented.                                                                                                                                                                                                                          |

## Component and trust-boundary map

```mermaid
flowchart LR
    classDef implemented fill:#d9f2e6,stroke:#247a52,color:#102a20
    classDef progress fill:#dcecff,stroke:#356aa0,color:#13253a,stroke-dasharray: 3 3
    classDef planned fill:#fff0c7,stroke:#9a6b00,color:#332400,stroke-dasharray: 5 5
    classDef blocked fill:#fde2e2,stroke:#b42318,color:#3a0d0d,stroke-dasharray: 5 5
    classDef deferred fill:#eceff3,stroke:#667085,color:#20242a,stroke-dasharray: 5 5
    classDef foundation fill:#e8e0f7,stroke:#6f4aa8,color:#241735
    classDef external fill:#dcecff,stroke:#356aa0,color:#13253a

    EPUB["Local EPUB selected by user<br/>External"]:::external
    AUDIO["OS audio device<br/>External; exact demo connected"]:::external
    GPU["Exact configured CUDA GPU<br/>External development host"]:::external
    HOST["Local OS, CPU, RAM, GPU, and providers<br/>External host facts"]:::external

    subgraph DEVICE["User device / local-only trust boundary"]
        subgraph DESKTOP["apps/desktop"]
            PICKER["Browser file input + FileReader<br/>Implemented"]:::implemented
            SESSION["Publication session owner<br/>Implemented"]:::implemented
            READER["Semantic React reader<br/>navigation, reflow, locator tracking<br/>Implemented"]:::implemented
            STORE["WebView localStorage<br/>locator + display preferences only<br/>Implemented"]:::implemented
            SHELL["Tauri native supervisor<br/>model-free default or native-configured exact child<br/>M7 complete"]:::implemented
            CLIENT["Typed TTS client + one-unit handoff sink<br/>M7 complete<br/>consumed outside React"]:::implemented
            PLAYBACK["Product narration coordinator + adaptive scheduler<br/>payload FIFO, Web Audio player, controls<br/>M8 Milestones 1-6 exact demo + policy"]:::implemented
            PROJECTION["Bounded audible range projection<br/>exact start/completion + played frames<br/>M9 complete"]:::implemented
            SYNC["Reader segment projection, following,<br/>and synchronized user navigation<br/>M9 complete; M9.1 M2 materialization repair"]:::implemented
            HEARD_STORE["Heard-position persistence bridge<br/>exact boundaries + lifecycle flush<br/>M9 complete"]:::implemented
            STABILIZE["Reader experience stabilization<br/>highlight proof + materialization repair;<br/>reader viewport, leaf + compact narration remain<br/>M9.1 in progress"]:::progress
            COMPAT["Privacy-safe host report +<br/>evidence-backed profile matcher<br/>M10 approved planned"]:::planned
            RECOVERY["Identity-safe recovery controller<br/>M10 approved planned"]:::planned
        end

        subgraph PACKAGES["TypeScript packages"]
            EPUBCORE["@voxleaf/epub<br/>ingestion, safe semantics, rasters, locators<br/>Implemented"]:::implemented
            PREP["@voxleaf/epub narration preparation<br/>bounded locator-linked batches<br/>Exact-demo caller implemented"]:::implemented
            SHARED["@voxleaf/shared<br/>contracts, protocol-v1 control schema,<br/>generated validators and fixtures"]:::implemented
        end

        subgraph TTSAREA["services/tts and later local runtime"]
            PYTHON["Bounded Python protocol service<br/>fake + common one-active adapter boundary<br/>M7 complete"]:::implemented
            FAKE_CHILD["Supervised model-free Rust child<br/>framed stdio + synthetic complete unit<br/>M7 complete"]:::implemented
            QWEN["Exact Qwen/Serena adapter<br/>verified local artifacts + complete unit<br/>M7 Milestone 4 implemented; dev-only"]:::implemented
            FEASIBILITY["TTS feasibility harness + profile decision<br/>Implemented development evidence:<br/>both v2 roles rejected"]:::implemented
            PROFILE_CYCLE["TTS profile blocker resolution<br/>Complete: M6.1<br/>batch-one v3 failed; demo exception"]:::implemented
            BATCH_PROBE["Short-unit and dual-worker probe<br/>Complete: M6.2<br/>CPU + dual worker rejected"]:::implemented
            TTS["Constrained local TTS service + protocol<br/>M7 complete and exact-host measured"]:::implemented
            PROD_TTS["Standard production TTS profile<br/>Blocked: no passing profile"]:::blocked
            CPU_FALLBACK["CPU-compatible fallback<br/>Blocked: no admitted candidate"]:::blocked
        end
    end

    EPUB -->|"user grants bytes; no retained path"| PICKER
    PICKER -->|"bounded ArrayBuffer"| SESSION
    SESSION -->|"open/close"| EPUBCORE
    EPUBCORE -->|"safe semantic documents + resources"| READER
    READER -->|"validated locator + closed preferences"| STORE
    STORE -->|"same-byte identity restoration"| READER
    EPUBCORE -->|"package-internal safe source model"| PREP
    EPUBCORE -->|"locator and narration contracts"| SHARED
    SHELL --> READER
    CLIENT -->|"narrow typed invoke + binary response"| SHELL
    SHELL -->|"model-free default child"| FAKE_CHILD
    SHELL -->|"native-only exact configuration"| PYTHON
    SHARED -->|"typed control decoding"| CLIENT
    HOST -.->|"bounded content-free facts"| COMPAT
    COMPAT -.->|"compatible admitted profile only"| SHELL
    PLAYBACK -.->|"classified failure + invalidated identity"| RECOVERY
    RECOVERY -.->|"explicit bounded restart after cleanup"| SHELL

    PYTHON -.-> FEASIBILITY
    FEASIBILITY -.-> PROFILE_CYCLE
    PROFILE_CYCLE -.-> BATCH_PROBE
    BATCH_PROBE -.->|"selection-v5 + ADR-0015:<br/>one GPU demo only"| TTS
    TTS -.->|"does not establish production viability"| PROD_TTS
    CPU_FALLBACK -.->|"requires frozen passing evaluation"| TTS
    PREP -->|"ephemeral prepared text;<br/>exact demo only"| PLAYBACK
    SHARED -->|"generated protocol contracts"| PYTHON
    PYTHON -->|"model-free service evidence"| TTS
    PYTHON -->|"one active exact request"| QWEN
    QWEN -->|"local CUDA bfloat16/SDPA"| GPU
    QWEN -->|"validated complete unit"| TTS
    FAKE_CHILD -->|"supervised lifecycle evidence"| TTS
    CLIENT -->|"validated one-unit handoff"| TTS
    PLAYBACK -->|"one typed request at a time"| CLIENT
    TTS -->|"validated takeAudioUnit transfer"| PLAYBACK
    PLAYBACK -->|"bounded Web Audio playback"| AUDIO
    PLAYBACK -->|"content-free identities,<br/>source range + played frames"| PROJECTION
    PROJECTION --> SYNC
    SYNC -->|"semantic range highlight +<br/>focus-safe placement"| READER
    READER -->|"passive/chapter/passage intent"| SYNC
    SYNC -->|"identity-first cancel + restart"| PLAYBACK
    SYNC -.->|"existing range + locator authority"| STABILIZE
    PLAYBACK -.->|"existing content-free status"| STABILIZE
    STABILIZE -.->|"planned reader presentation"| READER
    PROJECTION -->|"exact segment checkpoints"| HEARD_STORE
    HEARD_STORE -->|"bounded locator state only"| STORE
```

M008 Milestone 5 adds the solid exact-demo path from active publication
preparation through the application coordinator, M007 client/service, bounded
FIFO, and Web Audio device. Native configuration must explicitly select the
exact Qwen/Serena child; the model-free default cannot expose a fake
user-facing narration path. M009 Milestone 2 adds the solid playback-to-
projection edge: source ranges remain immutable and eligible only with their
FIFO units, and exact/bounded observations contain no narration text or PCM.
M009 Milestone 3 makes the projection-to-reader edge solid: the reader maps
the active source range, owns one production Custom Highlight entry, and
performs focus-safe placement without creating passive-seek feedback. The
M009 Milestone 4 makes the reader-to-synchronization-to-playback loop solid:
the first passive canonical change invalidates the old identity, trailing
movement settles for 500 ms, explicit chapter and stable-boundary placement
waits for containment, and only prior active play intent restarts. The overall
M009 Milestone 5 makes the projection-to-persistence path solid: exact starts
save segment starts, matching completions advance to range ends, and bounded
interruption/lifecycle flushes retain the latest heard checkpoint without
periodic writes or reflow regression. M009 Milestone 6 validates the packaged
loop on the exact host and distinguishes bounded user wheel/touch/pointer/key
intent from late programmatic samples. Milestone 7 closes repository, privacy,
documentation, and required pull-request validation. The synchronization area
is complete within the constrained exact-development boundary.

M009.1 Milestones 1-2 strengthen the implemented synchronization-to-reader
path: paint-aware proof now distinguishes registry acceptance from visible
rendering, and a missing same-chapter DOM range issues the existing one-shot
canonical materialization request before mapper refresh. The dashed M009.1
edges remain approved presentation work, not runtime behavior. They will reuse
the implemented range, locator, cancellation, and content-free status
boundaries to establish one reader scroll owner, expose a bounded paragraph
leaf, and compact the narration surface. They do not add a protocol field,
change buffer policy, or replace the exact segment text-range authority.

The dashed M010 edges are approved planning boundaries, not runtime behavior.
They separate native-owned privacy-safe host facts and deterministic profile
matching from engine `CapabilityReportV1`, preserve one supervised service
tree, and allow explicit recovery only after identity-first cleanup. The
CPU-fallback node remains blocked until a new result-blind candidate
evaluation passes every mandatory gate.

## EPUB-to-audio flow

```mermaid
flowchart TD
    classDef implemented fill:#d9f2e6,stroke:#247a52,color:#102a20
    classDef progress fill:#dcecff,stroke:#356aa0,color:#13253a,stroke-dasharray: 3 3
    classDef planned fill:#fff0c7,stroke:#9a6b00,color:#332400,stroke-dasharray: 5 5
    classDef blocked fill:#fde2e2,stroke:#b42318,color:#3a0d0d,stroke-dasharray: 5 5
    classDef deferred fill:#eceff3,stroke:#667085,color:#20242a,stroke-dasharray: 5 5
    classDef external fill:#dcecff,stroke:#356aa0,color:#13253a

    FILE["User-selected local EPUB<br/>External"]:::external
    READ["Bounded browser byte read<br/>Implemented"]:::implemented
    OPEN["EPUB validation and open<br/>Implemented"]:::implemented
    SAFE["Immutable safe semantic document<br/>Implemented"]:::implemented
    VISUAL["Visual reader + logical-locator persistence<br/>Implemented"]:::implemented
    PREP["Source-mapped normalization and<br/>bounded prepared narration batches<br/>Implemented package API"]:::implemented
    PROFILE["Engine feasibility + profile decision<br/>Implemented evidence:<br/>both exact v2 profiles rejected"]:::implemented
    NEXT_PROFILE["Profile blocker resolution<br/>Complete: M6.1<br/>batch-one v3 failed; demo exception"]:::implemented
    BATCH_PROBE["Short-unit and dual-worker probe<br/>Complete: M6.2<br/>CPU + dual worker rejected"]:::implemented
    INFER["Constrained local inference + protocol<br/>M7 complete and exact-host measured"]:::implemented
    PROD["Standard production TTS<br/>Blocked: no passing profile"]:::blocked
    BUFFER["Exact-demo product coordinator<br/>bounded scheduler/FIFO, Web Audio player,<br/>accessible controls implemented"]:::implemented
    AUDIBLE["Bounded source-range audible progress<br/>M9 Milestone 2 implemented"]:::implemented
    FOLLOW["Segment highlight + focus-safe following<br/>M9 Milestone 3 implemented"]:::implemented
    INTERACTION["Synchronized user navigation<br/>M9 Milestone 4 implemented"]:::implemented
    HEARD["Heard-position persistence<br/>M9 Milestone 5 implemented"]:::implemented
    DEVICE["OS audio device<br/>External"]:::external

    FILE --> READ --> OPEN --> SAFE --> VISUAL
    SAFE --> PREP
    PREP -->|"ephemeral prepared text<br/>exact demo"| BUFFER
    PROFILE -.-> NEXT_PROFILE
    NEXT_PROFILE -.-> BATCH_PROBE
    BATCH_PROBE -.->|"selection-v5 + ADR-0015:<br/>one GPU demo only"| INFER
    INFER -.->|"no production promotion"| PROD
    BUFFER -->|"one active request"| INFER
    INFER -->|"validated complete unit"| BUFFER
    BUFFER --> AUDIBLE
    AUDIBLE --> FOLLOW
    FOLLOW --> VISUAL
    VISUAL -->|"passive/chapter/passage intent"| INTERACTION
    INTERACTION -->|"identity-first restart"| BUFFER
    AUDIBLE --> HEARD
    HEARD --> VISUAL
    BUFFER -->|"bounded playback"| DEVICE
```

The exact-development user flow now continues from `VISUAL` through `PREP`,
`BUFFER`, `INFER`, and `DEVICE`. The application coordinator starts at the
active visual locator, retains at most one bounded prepared batch, dispatches
one synthesis at a time, and transfers sole complete-unit ownership into the
player. The M009 packaged matrix proves synchronized quick and one-minute
prepared audio while measuring six segment transitions, one natural
underrun/refill, 190 ms cancellation, and 378.46 buffering seconds per playback
minute.
The solid edges include the content-free audible projection, its segment-level
reader highlight/follow consumer, and the user-originated synchronized
seek/restart loop. Exact audible boundary persistence and bounded lifecycle
flushes are now solid as well. Exact-host synchronization and required
repository/pull-request evidence pass. The
path remains a constrained exact-host demo, not a standard engine,
continuous-playback guarantee, or general hardware profile. The 30-minute
value remains a simultaneous ceiling, not a startup target.

## Privacy, persistence, cancellation, and bounds

- EPUB bytes, safe semantic content, and derived narration text remain inside the local-device trust boundary.
- Only versioned logical reading locators, exact-byte publication identity, and closed display preferences are persisted. EPUB bytes, narration text, model output, and generated audio are not persisted by default.
- The durable reading position is a stable EPUB logical locator, never a rendered page number.
- Implemented ingestion, raster access, reader rendering, and persistence limits are documented in the [architecture overview](overview.md) and their accepted ADRs. Narration preparation has a separate [accepted limits profile](narration-preparation-limits-v1.md).
- Implemented publication, preparation, constrained inference, and low-level playback work supports cancellation and close within each current boundary. M009 Milestone 4 now propagates identity-first invalidation from user navigation through playback stop, preparation abort, queued-unit release, active-synthesis containment, settled placement, and authorized restart. Playback-only pause may continue bounded same-identity generation; navigation preserves paused intent at its target, while explicit stop and replacement cancel obsolete work.
- The frozen M008 authority bounds the implemented FIFO by 43,200,000 sample frames, 172,800,000 logical payload bytes, 256 complete units/metadata entries, one prepared batch, 16 prepared segments, inherited narration-v1 text totals, one active synthesis, and zero service-queued synthesis. The Web Audio backend adds only one transient active-unit device buffer bounded by the 20-second service-unit maximum. Underruns, intentional boundary waits, startup latency, preparation progress, playable depth, real-time factor, memory, and cancellation latency remain content-free measurements.
- Network TTS and remote book processing remain outside the product boundary.

## Evidence and decision authority

| Boundary                                               | Primary evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workspace foundation                                   | [Milestone 1 completed plan](../plans/completed/M001-engineering-foundation.md), [ADR-0005](decisions/ADR-0005-engineering-workspace-and-quality-tooling.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Contracts and fakes                                    | [Milestone 2 completed plan](../plans/completed/M002-shared-contracts-and-test-harness.md), [ADR-0006](decisions/ADR-0006-json-schema-contract-authority.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Secure EPUB ingestion and locator model                | [Milestone 3 completed plan](../plans/completed/M003-secure-epub-ingestion-and-document-model.md), [ADR-0007](decisions/ADR-0007-secure-epub-ingestion-boundary.md), [ADR-0003](decisions/ADR-0003-stable-reading-locators.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Visual reader and local restoration                    | [Milestone 4 completed plan](../plans/completed/M004-reflowable-visual-reader-and-position-restoration.md), [ADR-0008](decisions/ADR-0008-visual-reader-architecture.md), [ADR-0011](decisions/ADR-0011-bounded-web-storage-reader-state.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Native Windows startup evidence                        | [Milestone 4 native smoke closeout](../plans/completed/M004-001-native-webdriver-startup-smoke.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Narration preparation                                  | [Milestone 5 completed plan](../plans/completed/M005-narration-text-preparation.md), [ADR-0012](decisions/ADR-0012-bounded-narration-preparation.md), [narration normalization](narration-normalization-v1.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Playable-audio startup and adaptive buffering policy   | [ADR-0004](decisions/ADR-0004-start-after-audio-lead.md), [ADR-0015](decisions/ADR-0015-bounded-adaptive-qwen-demo-buffering.md), frozen [adaptive buffer v1 authority](adaptive-buffer-authority-v1.md), and [completed M008](../plans/completed/M008-bounded-adaptive-prebuffering.md). M008 provides authority, scheduler, sole-owner payload buffering, Web Audio playback, estimates/wait decisions, controls, the exact-development application caller, measured packaged quick/prepared evidence, and final validation.                                                                                                                                                                  |
| Local TTS feasibility authority                        | [Milestone 6 completed plan](../plans/completed/M006-local-tts-feasibility-and-engine-profiles.md), [current v2 feasibility profile](tts-feasibility-profile-v2.md), [selection matrix](../../benchmarks/tts/selection-v2.md), and [ADR-0013](decisions/ADR-0013-no-viable-local-tts-engine-profile.md); both exact roles rejected and no production profile selected                                                                                                                                                                                                                                                                                                                           |
| Local TTS profile blocker resolution                   | [Milestone 6.1 completed plan](../plans/completed/M006-001-local-tts-profile-blocker-resolution.md), [Serena intake result](../../benchmarks/tts/customvoice-spanish-screen-result-v2.json), machine-readable [`profile-v3.json`](../../benchmarks/tts/profile-v3.json), [v3 authority](tts-feasibility-profile-v3.md), [passing exact-host prototype result](../../benchmarks/tts/incremental-cancellation-prototype-result-v1.json), [candidate-neutral `selection-v3`](../../benchmarks/tts/selection-v3.md), historical [ADR-0014](decisions/ADR-0014-constrained-qwen-development-demo.md), and superseding [ADR-0015](decisions/ADR-0015-bounded-adaptive-qwen-demo-buffering.md)         |
| Short-unit and dual-worker feasibility                 | [Milestone 6.2 completed plan](../plans/completed/M006-002-qwen-short-segment-batch-feasibility.md), [v4 authority](tts-feasibility-profile-v4.md), both stopped `v4` results, accepted [`selection-v4`](../../benchmarks/tts/selection-v4.md), frozen [v5 authority](tts-feasibility-profile-v5.md), schema-valid [`v5` CPU admission](../../benchmarks/tts/dual-worker-result-v5-cpu-solo.json), schema-valid [`v5` GPU baseline](../../benchmarks/tts/dual-worker-result-v5-gpu-solo.json), the completed-plan diagnostic record, and accepted [`selection-v5`](../../benchmarks/tts/selection-v5.md). CPU and dual-worker scheduling are rejected; no standard product runtime is selected. |
| Constrained local TTS service and process protocol     | [M007 completed ExecPlan](../plans/completed/M007-local-tts-service-and-process-protocol.md), accepted frozen [protocol v1 authority](tts-service-protocol-v1.md), accepted [ADR-0016](decisions/ADR-0016-rust-owned-stdio-tts-protocol.md), and the schema-valid [exact-host handoff result](../../benchmarks/tts/service-handoff-result-v1-exact-host.json). M007 validates transport, canonical contracts, Python service, native supervision, typed client, exact Qwen/Serena integration, model-free packaged evidence, and measured exact-host delivery/backpressure/invalidation/termination/cleanup/reload evidence.                                                                    |
| Reader/narration synchronization                       | [M009 completed ExecPlan](../plans/completed/M009-synchronized-reading-and-narration.md), frozen [synchronization authority v1](synchronization-authority-v1.md), and accepted [ADR-0017](decisions/ADR-0017-segment-level-reader-narration-synchronization.md). Milestones 1-7 implement and validate the authority/proof, bounded audible projection, reader highlight/follow consumer, identity-first synchronized navigation, non-skipping heard persistence, exact-host packaged proof, and repository/CI closeout.                                                 |
| Reader experience stabilization                       | [M009.1 active ExecPlan](../plans/active/M009-001-reader-experience-stabilization.md), frozen [reader-experience authority v1](reader-experience-authority-v1.md), and accepted [ADR-0018](decisions/ADR-0018-reader-experience-stabilization.md). Milestone 1 distinguishes accepted ranges from paint-aware perceivability and freezes one reader scroll owner, compact/collapsible narration, text-only loaded duration, and one bounded locator-backed leaf. Milestone 2 repairs same-chapter materialization with deterministic and Chromium evidence; clean-host packaged validation and Milestones 3-6 remain. |
| Hardware profiles, fallback, and operational resilience | [M010 active ExecPlan](../plans/active/M010-hardware-profiles-fallback-and-operational-resilience.md). Sequenced after M009.1, the plan separates model-independent capability, privacy-safe host compatibility, evidence-backed profile admission, conditional CPU fallback, and identity-safe recovery; it is planning authority, not implementation evidence.                                                                                |
| Local-first desktop and future local process direction | [ADR-0001](decisions/ADR-0001-local-first-desktop.md); ADR-0015 permits a constrained one-GPU development demo while the production profile and distribution boundary remain unresolved                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Roadmap status                                         | [Roadmap](../plans/roadmap.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

## Remaining gates

1. **Milestone 9 — Complete:** all seven M009 milestones are implemented, exact-host validated, and covered by passing required Ubuntu and Windows pull-request checks.
2. **Milestone 9.1 — In progress:** Milestone 1 freezes the [reader-experience authority v1](reader-experience-authority-v1.md) and paint-aware browser/packaged proof. Milestone 2 repairs the proven same-chapter highlight materialization gap; deterministic and Chromium evidence pass and clean-host packaged validation remains pending. Continue with Milestones 3-6 to implement the reader-first shell without changing completed synchronization, protocol, segmentation, or buffer authority.
3. **Milestone 10 — Approved planned after M009.1:** follow the [M010 ExecPlan](../plans/active/M010-hardware-profiles-fallback-and-operational-resilience.md) to freeze and implement privacy-safe hardware reporting, measured profile selection, fallback admission, and identity-safe operational recovery without promoting the current exact-development profile.
4. **Milestone 11 — Deferred:** complete installer/signing/distribution and full MVP closeout only after M010 establishes supportable hardware and recovery claims.

Update this document whenever a major component boundary, process/package dependency, trust boundary, persistence owner, external interaction, runtime flow, or roadmap implementation status changes. A completed plan may advance a node or arrow only when its definition of done and validation evidence are present.
