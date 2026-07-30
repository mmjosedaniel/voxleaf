# Reader settings and playback authority v2

## Status

Accepted and frozen before v2 candidate implementation or result-bearing work
on 2026-07-30 for M010.2 Milestone 2A. The matching executable authority is
[`reader-settings-playback-authority-v2.ts`](../../apps/desktop/src/tts/reader-settings-playback-authority-v2.ts).

This authority changes no production behavior. VoxLeaf still plays at
`1.00x`, exposes no speed selector, uses no time-stretch dependency, and keeps
the existing Content Security Policy (CSP). Milestone 2B may implement and
measure only the candidates and gates frozen here.

## Relationship to v1

The completed
[`reader-settings-playback-authority-v1.md`](reader-settings-playback-authority-v1.md)
and its failed comparison evidence remain immutable. V2 supersedes only the
future playback-rate range and candidate comparison target. It does not
reinterpret, delete, or tune the v1 result.

V2 retains the v1:

- CPU, process-RAM, work-memory, pitch, duration, frame-drift, startup,
  rate-change, and teardown limits;
- Chromium and packaged Windows WebView2 hosts;
- bilingual repository-authored speech input and synthetic signal input;
- source-frame accounting and all PCM, unit, metadata, and service-tree
  ceilings;
- cancellation, privacy, zero-network, and zero-persistence requirements; and
- fail-closed `1.00x` outcome when no candidate passes.

## Closed playback-rate set

Only these exact rational rates are admitted:

| Percent | Label   | Rational rate |
| ------- | ------- | ------------- |
| 100     | `1.00x` | `100/100`     |
| 95      | `0.95x` | `95/100`      |
| 90      | `0.90x` | `90/100`      |
| 85      | `0.85x` | `85/100`      |
| 80      | `0.80x` | `80/100`      |
| 75      | `0.75x` | `75/100`      |

Every other persisted or runtime value is invalid. The source-media and
effective-listening arithmetic remains:

```text
sourceMediaMs = floor(sourceFrames * 1000 / 24000)
effectiveListeningMs =
  floor(sourceFrames * 1000 * 100 / (24000 * ratePercent))
minimumSourceFrames =
  ceil(effectiveListeningMs * 24000 * ratePercent / (1000 * 100))
```

Pitch preservation is mandatory. The rate is applied after synthesis to
bounded in-memory audio; it does not alter prepared text, TTS requests, model
generation, source PCM, or work identity.

## Exact candidate set

No candidate outside this table may be implemented or measured as v2
evidence.

| Candidate ID                                       | Exact source identity                                                                                                                                                                                               | Runtime copy bound                                    | Admission state                                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `html-media-element-preserves-pitch-wav-v2`        | Host `HTMLMediaElement.playbackRate`, `HTMLMediaElement.preservesPitch`, `URL.createObjectURL`, and `URL.revokeObjectURL` APIs                                                                                      | one service unit plus one WAV copy and one object URL | eligible                                                                           |
| `signalsmith-stretch-web-audio-wasm-worklet-1-3-2` | Published `signalsmith-stretch@1.3.2`, pinned below                                                                                                                                                                 | one service unit and one stretcher                    | full package/source/transitive/shipped-artifact audit required before installation |
| `repository-incremental-audio-worklet-wsola-v2`    | New controller `apps/desktop/src/tts/playback-backends/incremental-wsola-v2.ts` and worklet `apps/desktop/src/tts/playback-backends/incremental-wsola-v2-worklet.ts` in a strict descendant of the authority commit | one service unit and one stretcher                    | eligible                                                                           |

The repository candidate must be a materially optimized incremental
implementation. Reusing or relabelling the rejected
`repository-audio-worklet-wsola-v1` prototype is prohibited.

### Signalsmith package identity

Registry metadata observed before the freeze is:

| Field                 | Frozen value                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| package               | `signalsmith-stretch`                                                                             |
| version               | `1.3.2`                                                                                           |
| published licence     | `MIT`                                                                                             |
| integrity             | `sha512-tJqRbwPCoWLSHXwO29UQ75u72IwPsHns3RG+TKzuOAp7OduJiJMzEtz32JEFbPFQcTR7aiKCIVc+/Kzw8bMZUw==` |
| tarball               | `https://registry.npmjs.org/signalsmith-stretch/-/signalsmith-stretch-1.3.2.tgz`                  |
| repository            | `https://signalsmith-audio.co.uk/code/stretch.git`                                                |
| published Git head    | `222093b4cc13ddb4d07c826bc3c1559326091731`                                                        |
| import/require entry  | `./SignalsmithStretch.mjs` / `./SignalsmithStretch.js`                                            |
| declared dependencies | none                                                                                              |
| unpacked package      | 232,286 bytes, 4 files                                                                            |

This metadata is identity evidence, not final distribution clearance.
Milestone 2B must inspect the exact tarball, source, embedded or generated
artifacts, and all transitive obligations before adding the dependency. Any
ambiguity stops that candidate.

## Fee-free licence authority

An admitted candidate must be:

1. a host platform API;
2. repository-owned code covered by the repository's MIT licence; or
3. exact reviewed fee-free code under `0BSD`, `Apache-2.0`, `BSD-2-Clause`,
   `BSD-3-Clause`, `ISC`, or `MIT`.

The candidate is rejected before installation or evaluation if it requires a
purchase, subscription, royalty, paid seat, commercial exception, copyleft,
source-availability obligation, or has an unknown or ambiguous licence.
M011 still owns final distribution and third-party-notice review.

The frozen manifest is:

| Candidate        | Licence basis                              | Fee            |
| ---------------- | ------------------------------------------ | -------------- |
| media element    | host platform API                          | none           |
| Signalsmith      | published MIT metadata; full audit pending | none indicated |
| repository WSOLA | repository root MIT licence                | none           |

## Candidate-specific CSP authority

The current CSP remains:

```text
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src ipc: http://ipc.localhost
```

Only the media candidate may propose this one additional directive:

```text
media-src 'self' blob:
```

The exact prospective CSP is:

```text
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src ipc: http://ipc.localhost; media-src 'self' blob:
```

`connect-src` must remain unchanged. `data:`, remote `http:` or `https:`
media, wildcards, and new native capabilities are prohibited. The delta is not
applied unless the media candidate advances after both required-host tests.

## Lifecycle, memory, and privacy

At most one candidate comparison, one time stretcher, one object URL, and one
TTS service tree may be active. Source sample frames remain the progress,
release, and memory authority. The existing ceilings remain 43,200,000 source
frames, 172,800,000 logical PCM bytes, 256 complete units, and 256 metadata
entries.

Pause, stop, seek, chapter change, profile change, language change, book close,
session replacement, candidate failure, and app exit must promptly cancel or
tear down work. Object URLs are deterministically revoked before replacement
or exit. No external request and no persisted generated-audio byte is allowed.

## Result-blind evaluation

Deterministic tests run at every non-default rate: `0.95x`, `0.90x`, `0.85x`,
`0.80x`, and `0.75x`. One fluent maintainer per language listens to the frozen
Spanish and English cases at `1.00x`, `0.85x`, and `0.75x`.

The exact v1 machine thresholds remain authoritative:

| Gate                                    |              Maximum |
| --------------------------------------- | -------------------: |
| pitch deviation                         |             20 cents |
| rendered-duration error                 |                50 ms |
| source-frame drift                      |                    0 |
| backend-start p95                       |               250 ms |
| rate-change settlement p95              |               250 ms |
| pause/stop teardown p95                 |               250 ms |
| additional work memory                  |      7,680,000 bytes |
| additional process RAM                  |              128 MiB |
| CPU increase while local inference runs | 20 percentage points |
| active stretchers                       |                    1 |
| external requests                       |                    0 |
| persisted generated audio               |              0 bytes |

Listening requires at least 4/5 intelligibility, 3/5 naturalness, and 3/5
artifact score, with no omitted or repeated words. Both production Chromium
and packaged Windows WebView2 must pass.

The authority must be committed before any implementation or result. Every
result must name that authority commit and an execution commit that is its
strict descendant. Gates may not be tuned after results.

## Current outcome

This milestone freezes evaluation authority only. It admits no backend,
installs no package, changes no CSP, and enables no non-default speed. If
Milestone 2B finds no passing candidate, VoxLeaf retains `1.00x` without a
speed selector.
