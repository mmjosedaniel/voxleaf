# ADR-0035: Reopen a reduced-range fee-free playback evaluation

Status: Accepted
Date: 2026-07-30

## Context

ADR-0034 correctly retained `1.00x` after neither candidate in the frozen v1
comparison passed every required machine and packaged-host gate. That evidence
must remain unchanged.

The maintainer subsequently reduced the desired product range from eleven
values ending at `0.50x` to six values ending at `0.75x`. This removes the
most aggressive time stretching, should improve speech quality, and creates a
credible path for algorithms whose documented quality target is moderate
tempo change.

VoxLeaf may become a paid application. The follow-up must not depend on buying
a commercial licence, paying royalties, taking a subscription, or obtaining a
commercial exception.

## Decision

Reopen backend evaluation under a new result-blind v2 authority. Do not amend
the frozen v1 authority, its executable constants, ADR-0033, ADR-0034, or the
completed Milestone 2 results.

The intended product values are exactly:

`1.00x`, `0.95x`, `0.90x`, `0.85x`, `0.80x`, and `0.75x`.

The new comparison may admit only:

1. `HTMLMediaElement.preservesPitch` with one bounded in-memory WAV and an
   exact candidate-specific CSP containing `media-src 'self' blob:`;
2. one exact locked Signalsmith Stretch Web Audio WASM/AudioWorklet package,
   only after its package, source, transitive dependency, and distribution
   licences are verified as permissive and fee-free; and
3. one materially optimized, incremental repository-owned WSOLA
   implementation. The rejected v1 JavaScript prototype cannot be relabelled
   as this candidate.

The initial v2 comparison admits only built-in platform functionality,
repository-owned code, or dependencies under reviewed permissive licences
such as MIT, BSD, ISC, 0BSD, or Apache-2.0. Copyleft, source-availability,
commercial-dual-licence, royalty, subscription, paid-seat, unknown, or
commercial-exception dependencies are outside this round even when a free
development build exists.

The CSP experiment may add only:

```text
media-src 'self' blob:
```

It cannot widen `connect-src`, add remote media origins, add `data:`, add a
wildcard, or grant a native shell/filesystem capability. At most one bounded
object URL may exist for the active audio unit, and it must be revoked on
teardown, stop, seek, replacement, failure, book close, and application exit.
The final CSP change remains only if that candidate is selected.

The v2 authority must freeze rates, candidates, package identities, exact CSP,
machine/listening gates, source-frame accounting, lifecycle, privacy,
resource, licence, and cleanup rules before candidate code or measurements.
Existing CPU, RAM, work-memory, external-request, persistence, and packaged
Windows WebView2 gates are not relaxed by this decision.

## Consequences

M010.2 is no longer waiting for a product-scope decision. Its next sequential
step is Milestone 2A, which freezes the v2 authority and executable
result-blind tests. Milestone 2B then evaluates the three candidates
sequentially and selects exactly one or none.

No non-default playback speed is implemented or exposed by this ADR. Runtime
remains `1.00x` until Milestones 2A, 2B, 3, 5, and final exact-host validation
pass.

At `0.75x`, a fixed amount of source PCM provides one third more effective
listening duration without changing model RTF or increasing the existing
source-frame/byte ceilings. The maximum 30 minutes of retained source audio
therefore represents at most 40 minutes of effective listening time.

## Alternatives considered

- Retaining the `0.50x` requirement was rejected because it sharply increases
  processing and artifact risk without being necessary for the desired
  portfolio demo.
- Enabling the rejected v1 WSOLA prototype as an optional switch was rejected
  because optional UI does not remove its measured CPU failure.
- SoundTouch is not admitted in this round because its LGPL/WASM distribution
  obligations would complicate the intended commercial path.
- FFmpeg `atempo` is not admitted because bundling another native binary and
  its distribution surface is disproportionate before M011.
- Rubber Band is not admitted because its proprietary-app path requires a
  paid commercial licence.
- Model-specific speaking-rate controls remain outside scope because they
  regenerate audio, differ by engine, and do not provide one playback
  implementation for Piper, Chatterbox, Qwen, and future engines.

## Licence references

These sources establish candidate intake only; the exact locked package and
its transitive/shipped artifacts still require the Milestone 2A-2B audit:

- Signalsmith Stretch's official repository and Web Audio package identify
  the project as MIT:
  <https://github.com/Signalsmith-Audio/signalsmith-stretch> and
  <https://git.signalsmith-audio.co.uk/Signalsmith-Audio/signalsmith-stretch/src/commit/5e50132c9601b360a816e60f1d10672a5d2933c3/web/release/package.json>.
- SoundTouch's official licence page identifies LGPL-2.1:
  <https://www.surina.net/soundtouch/license.html>.
- Rubber Band's official licence page identifies GPL-2.0-or-later and a
  separate commercial path:
  <https://breakfastquay.com/rubberband/license.html>.
- FFmpeg's official legal page explains its LGPL/GPL build-dependent
  obligations:
  <https://ffmpeg.org/legal.html>.

This is a project distribution policy, not legal advice.
