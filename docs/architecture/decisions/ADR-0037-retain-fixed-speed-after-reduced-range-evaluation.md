# ADR-0037: Retain fixed speed after the reduced-range evaluation

## Status

Accepted on 2026-07-30.

## Context

ADR-0035 authorized a separate fee-free comparison for six playback rates
ending at `0.75x`. ADR-0036 froze the exact v2 candidates, licence policy,
performance and resource gates, host matrix, privacy rules, and result lineage
before implementation or measurement.

The comparison had to select exactly one candidate or none. A candidate could
advance to listening only after passing synthetic Chromium, packaged Windows
WebView2, and local-inference-contention gates without changing the frozen
limits after results.

## Decision

Select no v2 pitch-preserving playback backend and retain production playback
at `1.00x`.

- `signalsmith-stretch@1.3.2` failed closed before its first Chromium trial.
  Its exact package and compiled source were fee-free MIT, but the published
  package omitted both upstream licence texts. Because it was not selected,
  the package and all candidate code were removed. A later isolated rerun from
  the historical implementation commit reproduced the same pre-trial failure
  outside the sandbox after the 15-second initialization boundary, so this was
  not the WebView2 sandbox false negative. The adapter initialization cause
  remains unresolved.
- `HTMLMediaElement.preservesPitch` passed synthetic Chromium and packaged
  WebView2, but exceeded the frozen 128 MiB additional-process-RAM limit under
  one active local Piper inference process: 180.973 MiB.
- The incremental repository WSOLA candidate passed synthetic Chromium and
  packaged WebView2, but its start p95 rose to 821.6 ms under the same
  inference contention, above the frozen 250 ms limit.

Neither machine-passing candidate reached the listening gate. VoxLeaf does not
retain the prospective `media-src 'self' blob:` CSP change, Signalsmith
dependency, experimental adapters, generated speech, WAVs, or evaluation
runners. The comparison made zero external requests and persisted zero
generated audio bytes.

Milestones 3 and 4 may implement the reader-first Settings experience and
English fallback independently. Milestone 5's non-default speed integration
is not applicable under this decision. Milestone 6 must validate the resulting
portfolio reader with fixed `1.00x` playback.

## Consequences

The application gains no playback-speed selector in M010.2. Existing
source-frame progress, buffering, synchronization, and memory authority remain
unchanged.

The 128 MiB RAM and 250 ms start limits are historical v2 acceptance rules,
not claims that 180.973 MiB or 821.6 ms are inherently unusable. A later
product decision may freeze different activation-scoped limits—especially
when time stretching is disabled at `1.00x`—but it must create new authority
before new measurements rather than rewriting this result.

The failed v2 evidence remains historical and reproducible through its
authority and implementation commits, while the final tree carries no
unselected runtime dependency or security-policy expansion. Any future
non-default playback-rate attempt requires a new result-blind decision and
authority rather than relaxing these gates after observing results.

## Alternatives considered

- **Select the media candidate despite its contention RAM result.** Rejected
  because it failed a frozen exact-host resource gate.
- **Select repository WSOLA despite its contention start latency.** Rejected
  because it failed a frozen user-visible latency gate.
- **Open listening for either failed candidate.** Rejected because the frozen
  gate order admits listening only after every machine gate passes.
- **Tune the gates or implementation after results.** Rejected because that
  would invalidate the result-blind comparison.
