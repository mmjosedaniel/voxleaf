# Audit Packet

Record ID: TFR-04-AUDIT-20261019-01

Target ID: TFR-04 / TFR-BATCH.
Decision: CHANGE. Risk: high (service lifecycle/cancellation).
Auditor: configured `clean_code_auditor`, GPT-6.1 Sol high, read-only.
Source HEAD: `2648617f86fdfd7dddc8dc81fdeabd36942f3c3c`.

Primary target: `ProductNarrationCoordinator.#execute` in
`apps/desktop/src/tts/product-narration-coordinator.ts`, `start-service` and
`prepare-service` cases.
Related context: complete paired test file, private narration/synthesis phase
methods, pump/run/stop/failure/containment/publication owners, adaptive scheduler
transitions, recovery controller, service interface and concrete process client.

Concrete evidence: the dispatcher owns shared catch and final publication but
also embeds detailed service admission/startup and prepare/recovery phases.
Its two other actions already delegate to private phase methods. Applying that
existing responsibility boundary clarifies dispatch without a new module/API.

Important limitation: both unavailable-start branches return from the dispatcher
before final publication. Preserve that control flow explicitly. A naive void
extraction was not demonstrated to add a notification: ordinary failure
containment synchronously advances runToken and already suppresses many final
publications. This is a preservation requirement, not an observed runtime bug.

Behavior invariants: capture scheduler once; preserve selected profile/language;
hardware before configuration with denial short-circuit; existing unavailable
state/failure/token checks and dispatcher exits; start sequence admission,
begin, publish, profile/language assignment, await client, token-guarded mark;
prepare sequence begin, publish, await client, token-guarded ready and recovery
success/failure clearing. Keep final publication and shared stale/action-specific
catch in dispatcher. Preserve every existing await, runToken guard, cleanup,
ownership, bound, locator, privacy and persistence boundary.

## Coverage map

| Invariant | Existing assertions | Concrete gap / proposed test decision |
| --- | --- | --- |
| Profile/language | Admitted profile plus English/Chatterbox cases assert IDs/languages/profiles | Retain. |
| Hardware-before-start | Failed preflight case asserts arguments, unavailable/no child/preparation | Add no extra configuration lookup after hardware denial. |
| Configuration unavailable at start | Available-then-unavailable runtime recheck case asserts no child | Characterize public notification trail through settled containment, including duplicates/order. |
| Profile disappears after availability | Existing missing-profile case exits during availability, not dispatch | Add availability succeeds then profile disappears; no child/configuration/preparation and existing failure behavior. |
| Early-exit publication | Eventual observations only | Characterize subscription trail on unchanged production before extraction. |
| Successful phase ordering | Normal flow reaches preparation/playback | Add concise public subscriber/client-call ordering in existing admitted case; avoid arbitrary microtask-count assertions. |
| Stale start/prepare completion | Existing tests cover stale narration/synthesis, not these moved phases | Small parameterized start/prepare by resolve/reject case: hold phase, stop, settle, verify stopped/no revived work/failure/recovery. |
| Prepare failure/recovery | Warm-failure restart case asserts cleanup, one restart, new identity and cleared failure | Retain; covers moved recovery block. |
| Shared catch | Protocol, warm-failure and repeated-recovery cases | Retain classifications. |
| Stop/cancel/close | Waveform cancel, prepare abort, old-session close, delayed containment, preparation-failure cleanup | Retain; add only deferred service-phase gap above. |
| Bounds/privacy/locators | Request/ownership, semantic transition, navigation, language and redacted observations | No additions to untouched responsibilities. |

Allowed files (closed):

- `apps/desktop/src/tts/product-narration-coordinator.ts`
- `apps/desktop/src/tts/product-narration-coordinator.test.ts`

Proposed edits: private `#startService(scheduler, runToken)` returns false at
existing exits and true on normal completion; dispatcher uses descriptive
`serviceStartCompleted` to retain its early return. Private
`#prepareService(scheduler, runToken)` moves only existing prepare body. Shared
catch/publication and scheduler capture stay in `#execute`. Characterize the
listed touched boundaries before extraction through public APIs only.

Forbidden edits: recapture scheduler; move/add guards, catches or retries;
change pump/stop/failure/recovery semantics, other phase methods, scheduling,
timing, audio, profiles/preferences, dependencies/contracts; weaken tests; expose
private methods; generated/frozen/historical changes or unrelated formatting.
An independently discovered behavioral bug requires a separate decision.

Diff ceiling: two files/320 added plus removed lines. Expected production
movement 150-170 lines; keep characterization within remaining budget or revise
the order before edits. No implementation order has been issued.

Baseline/post commands: current ExecPlan section 8 G-FAST, G-BUILD, G-DESKTOP,
configured/filtered G-HOST readiness, G-NATIVE and sequential lifecycle plus
four supported G-HOST arms. G-DESKTOP includes pre-extraction characterization
and post-change tests. No new timing benchmark; Qwen inference stays deferred.

Gate ledger: cheap checks precede build/native/model work; native prepares
current executable before model arms; all high-risk unit gates precede unit
acceptance. G-BROWSER/G-CROSS/G-FINAL/G-DOCS remain pending combined gates.
Use local PowerShell outside sandbox, clean unit paths and index, immutable
before/after HEAD/path manifests, transitive/discovered inputs, tools/config/
locks/artifact/environment identity and cleanup. Only validator-proven unchanged
receipts may be reused. Preserve retry limits and declared ignored outputs.

Documentation impact: plan/evidence only, including the early-exit nuance; no
product/architecture/diagram change. Decision required: none for extraction;
unresolved mandatory baseline/host readiness blocks work. Audit ran no tests.
