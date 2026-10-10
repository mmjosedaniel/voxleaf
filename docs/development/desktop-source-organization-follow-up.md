# Desktop source organization follow-up observations

Recorded: 2026-10-10, after the completed
[desktop source organization ExecPlan](../plans/completed/desktop-source-organization.md).

This is a follow-up register, not an approved implementation plan. The source
organization campaign and its independent closure passed; none of the items
below blocks that acceptance. The maintainer requested documentation of the
observations, not implementation, host changes or a delivery commitment.
Keep completed plans and immutable validation reports unchanged.

| ID | Observation | Follow-up status |
| --- | --- | --- |
| DSO-01 | Standalone model-free native test inherits real-model variables | Proposed test-runner improvement; not implemented |
| DSO-02 | Chatterbox command-to-audible startup took about 41-44 seconds | Proposed performance investigation; cause not established |
| DSO-03 | Qwen buffering exceeded the MVP goal despite harness PASS | Deferred under ADR-0051; no new work approved |
| DSO-04 | pytest could not write its existing cache | Non-blocking environment observation; low-priority investigation proposed |
| DSO-05 | Production build emitted the large-chunk warning | Non-blocking build observation; optimization not justified by the warning alone |

## DSO-01: isolate the standalone model-free native test environment

Observed: the first PCM post-change invocation of `pnpm.cmd test:native-startup`
inherited the real-model profile variables used for H. `ServiceChild::configured`
selected an exact runtime, while the model-free lifecycle probe expected the
fake service's exact 19,200-byte/4,800-sample response. That invocation failed with
`tts-service-lifecycle-probe-failed`; its original log did not expose the inner
failed predicate. The existing H runner already removes the twelve profile
variables through `modelFreeLifecycleEnvironment` for its lifecycle-only child.
The unchanged standalone N command subsequently passed in a fresh process with
those variables absent. No source-level environment fix was implemented.

Proposed follow-up: assess applying the existing environment policy automatically
at the standalone model-free invocation boundary. Preserve the exact-host paths
that deliberately activate real models, and retain driver, PATH and offline
controls. Do not indiscriminately clear configuration from every native runner.

Evidence needed before accepting a future change: a focused regression with
ambient real-model variables showing that the model-free child receives the
intended environment, preservation of exact-host configuration, and the relevant
host checks. A separate bounded change and independent review would be required.

Sources: [environment diagnosis](../plans/evidence/desktop-source-organization/PCM-native-environment-diagnosis-01.md),
[failed invocation](../plans/evidence/desktop-source-organization/PCM-post-change-01.md),
[successful subsequent validation](../plans/evidence/desktop-source-organization/PCM-post-change-02.md).

## DSO-02: investigate Chatterbox startup latency

Observed on the recorded host: post-change Chatterbox Spanish/English quick
command-to-audible startup was 44,414/41,119 ms. Both journeys passed and observed
zero underruns and zero buffering in their exercised windows. Pre-change startup
was 52,351/42,557 ms; these finite observations do not establish an improvement,
a regression caused by extraction, a hardware-independent limit or a root cause.

Proposed follow-up: if prioritized, reproduce startup on the supported exact
profile and separate cold/warm conditions, model loading, preparation, inference
and playable-audio readiness using content-free timing evidence. Decide whether
optimization is warranted only after locating the delay. Preserve cancellation,
bounded memory and the audio-lead threshold; do not reinterpret approximately
15 seconds of buffered audio as a fixed wall-clock startup wait.

Sources: [pre-change measurements](../plans/evidence/desktop-source-organization/PCM-baseline-03.md),
[post-change measurements](../plans/evidence/desktop-source-organization/PCM-post-change-02.md).

## DSO-03: retain Qwen's deferred performance investigation

Observed: the complete six-arm post-change command exited 0 and both Qwen journeys
passed its existing assertions. Nevertheless, Spanish/English recorded one
underrun each, 85.177/98.698 seconds of buffering wall time, and 285.78/156.09
buffering seconds per playback minute. Those measurements exceed the MVP goal.
Harness PASS therefore does not establish Qwen's MVP performance suitability.

Status remains deferred under
[ADR-0051](../architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md).
Retain development-only integration, tests, restrictions and historical failures.
Only a separately authorized future ExecPlan should reopen runtime/performance
investigation or support promotion, using fresh reproduction and host evidence.
This observation creates no new delivery date or current implementation task.

Sources: [post-change model report](../plans/evidence/desktop-source-organization/PCM-post-change-02.md),
[final acceptance and limitations](../plans/evidence/desktop-source-organization/FINAL-validation-01.md).

## DSO-04: investigate the pytest cache warning if it recurs

Observed: both final F runs emitted `PytestCacheWarning` because the existing
pytest nodeids cache path was not writable (`Errno 13`). All 406 Python tests
passed in each run. This did not invalidate their results; the underlying cache
permission/state cause was not investigated or repaired.

Proposed follow-up: inspect the specific cache location and ownership if the
warning recurs in ordinary local runs. No broad permission changes, cache deletion
or suppression of test warnings is prescribed by this record.

Source: [final command results](../plans/evidence/desktop-source-organization/FINAL-validation-01.md).

## DSO-05: retain the production bundle warning as an observation

Observed: Vite retained its nonfatal large-chunk warning. Production builds passed;
after the CSS split, renderer JS, CSS and worklet bytes matched the artifacts from
PCM acceptance. No bundle-size or loading-performance improvement was claimed.

Possible follow-up: inspect bundle composition and measured user impact only if
startup, memory or distribution requirements justify it. The warning alone is
not evidence that code splitting or a new dependency is necessary. Any future
change must preserve worklet loading, CSP and native packaging behavior.

Sources: [CSS source and compiled equivalence](../plans/evidence/desktop-source-organization/STYLES-post-change-02.md),
[final build observations](../plans/evidence/desktop-source-organization/FINAL-validation-01.md).

## Closure boundary

These items are observations and proposals outside the accepted refactor scope.
The [closure report](../plans/evidence/desktop-source-organization/closure-04.md)
records no mandatory source correction, completed archival and removal of the
authorized temporary firewall rule. No new model run, download, installation,
firewall action, staging, commit, push or PR is authorized by this register.
