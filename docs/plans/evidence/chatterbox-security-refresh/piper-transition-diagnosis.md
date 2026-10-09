# Piper transition diagnosis

Date: 2026-10-07. Reviewed HEAD:
`998c7b24cda7e969e9ed0344f348506bf38af3b0`.
This is diagnosis, not final integration approval.

## Evidence and separation of failures

The security integration's production audit passes locally. GitHub still checks
the preceding preparation commit. The pending installed journey is a separate
acceptance gap, not evidence that the dependency remediation failed.

The installed Piper English leaf replacement reached preparation and highlight
clearing, then reported failed narration, `protocol-failed`, stopped service and
zero accepted units after its existing 360-second wait. An undelivered key or a
short startup allowance does not explain that terminal state. The WebDriver
retry label concerns stale/non-interactable element actions, not automatic
retries of failed narration.

A plain isolated Piper English run subsequently timed out during chapter
transition. That stage waits separately for highlight clearing, a transient
settling/non-playing state, and playback in the next document. Its log does not
identify which predicate failed. Missing a transient state is a possible harness
observation race; no such cause is yet established.

Two isolated observed runs passed all adaptive assertions. The first observer
was ineffective because Tauri defines its invoke function as nonwritable. The
corrected observer uses Windows custom IPC fetch without changing the request
or returned promise, reading only bounded fixed codes from explicit errors.
It observed 108 recognized requests, no fetch failures, and only an expected
`tts-service-cancelled` synthesis rejection. It does not observe postMessage
fallback and can affect scheduling through diagnostic WebDriver roundtrips.
These passes neither erase prior failures nor identify their cause.

The corrected run recorded Quick start 4,236 ms, Prepared 5,606 ms, 60,265 ms
stable playback, leaf replacement 5,078 ms and cancellation 1,059 ms, with zero
underruns, external requests, generated-audio files and stale playback. Every
completed diagnostic restored the 13,011 original application-data files by
hash, with no restoration errors. No Chatterbox download was needed.

## Global read-only analysis

The reused auditor inspected the client/native/Python lifecycle. Independent
`change_reviewer` report `CB-V3-GLOBAL-DIAGNOSIS-01-20261007` examined the harness,
resource selection, patch scope and host evidence. Its verdict is BLOCKED for
final acceptance, diagnosis only: no installed journey or complete patch
approval is claimed.

The current integration changes neither Piper's adapter/service nor the process
client, coordinator, supervisor or reader settlement implementation. Piper's
bundled manifest matches its historical identity. This makes direct breakage by
Chatterbox's three dependency updates poorly supported, without ruling out
surrounding timing or packaging effects.

The strongest concrete cancellation hypothesis is:

1. Native synthesis clears its active identity before renderer delivery.
2. The renderer still considers synthesis active and requests cancellation.
3. Native cancellation rejects because no active identity remains.
4. The client stays `cancelling`; the coordinator contains the stop error.
5. The replacement start rejects locally before a new native start invocation.

Alternative explanations remain a native synthesis/protocol failure, renderer
response validation, or chapter placement/settlement. Only a failing execution
trace can select among these for the earlier host runs. The current evidence
does not justify changing the coordinator, normalizers, timeouts or model data.

## Deterministic boundary reproduction

The ignored probe imports the real unchanged TypeScript process client with
Node 24 and injects only its native invoke port. Synthetic valid controls and
audio reproduce the completion/cancellation ordering without models or user
data. The race case leaves `cancelling`, rejects cancellation and restart with
`tts-service-invalid-state`, and issues no second native start. Late audio is
zeroed and discarded. A normal cancellation control reaches stopped and accepts
a fresh start. This proves the client defect under the simulated boundary;
it does not attribute the prior installed failures to that defect.

These probe results belong to the pre-repair client SHA-256
`e960b249e7a7a8ad167021e75274ebecf0184c871b85e2cd767fcab1951266be`.
The original probe's mock does not model the later shutdown fallback and is not
a current-patch acceptance command. The meaningful regression suite and exact
post-change identities are recorded in [containment validation](piper-containment-validation.md).

Host PowerShell checks: harmless native TypeScript import, `node --check` and
`node tmp/chatterbox-security-refresh/probe-cancel-completion-race.mjs`, all exit 0.
Probe SHA-256:
`cffcdec908229253fca3ca308ce5e9623b55552ebcb4553f1296c4914aeeafc5`.

The auditor recommends the two-file client containment unit frozen in the
active ExecPlan. Validated shutdown may establish a legitimate restart boundary;
merely changing local state would falsely claim process containment. Preserve
the original cancellation rejection, and refuse restart if shutdown is busy,
fails or returns invalid controls. Initial validation, regression tests,
independent change review and rebuilt installed acceptance remain required.

Ignored host logs: `piper-en-plain.log` and `piper-en-fetch-observed.log` under
`tmp/chatterbox-security-refresh/`. Effective observer SHA-256:
`f32f9e845e357e60b1c38da087ade1a31e28edfb6627d9ce8ab90d2f67d9fe76`.
