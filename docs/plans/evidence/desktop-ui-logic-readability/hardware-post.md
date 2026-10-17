# Hardware handlers independent acceptance

Report ID `SRC-HARDWARE-CONTROLS-02-POST-CHANGE-20261013-01`.
Target `SRC-HARDWARE-CONTROLS-02`, POST-CHANGE, PASS. Starting/ending HEAD
`5be831c23135ca00f94b2b3374f0330de2b658ce`. Director accepted the report and
reviewed the complete two-file diff. All changes remain unstaged.

All twelve exact commands in [the frozen order](hardware-order.md) exited 0
on their first post-change invocation. Desktop: 727 Vitest / 59 files and
70 Node tests. Browser: seven cases. Preflight: 39 Vitest / 17 driver Node /
five portfolio Node. Native startup rebuilt Tauri and passed binary delivery,
service lifecycle, cancellation, crash recovery, file ingress/replacement,
accessibility, synchronization, images, restart restoration and cleanup, with
zero errors/external requests. Existing Vite chunk warnings were nonfatal.

Environment: supervised WMI-created local PowerShell 7.6.5 outside sandbox
(PID 38420), Node 24.20.0, Corepack pnpm 11.15.1, signed matching EdgeDriver
155.0.4283.45. Actual package/model final paths shared the ordinary AppData
tree. Generic native used the model-free environment; only exact-host arms
enabled documented model/offline variables. No persistent machine or firewall
changes. See [context diagnosis](host-context-recovery.md).

| Validated path under `apps/desktop/src/tts/` | Porcelain prefix | SHA-256 | Filtered blob |
| --- | --- | --- | --- |
| `HardwareCompatibilityControls.tsx` | ` M` | `556FCC93B73ADB855470A12DAB950E31FF09A77D03ACB20E54AADDCEFCAE8AFE` | `678159162bd003f851dc1dce9468c1f8c033da37` |
| `HardwareCompatibilityControls.test.tsx` | ` M` | `24761C1DB64D4A767EF6CFAC854785DA3C41ADE6FDF97E6B51259D363AC32FF3` | `70fdc5f17f9b7dc38a65788aa2a970c9250063a2` |

Exact porcelain is the prefix, one space and the full path. HEAD, identities
and empty index matched before/after all checks; A/C/D supplemental identities
also matched their accepted reports. The temporary native diagnostic remained
absent. Whitespace, scope, invariants, test-integrity and privacy reviews PASS.

The patch is 200/260 lines: production +22/-29, tests +149/-0. One local
sequence retains pending true outside try, invocation/await inside try,
truthy-only recovery and pending false in finally. Explicit closures preserve
callback choice, arguments and coordinator receiver. Recheck, effects, JSX,
copy, accessibility, filters, permissions, cancellation and ownership are
unchanged. Exact source comparison establishes operation/recovery rejection
and notification-exception equivalence; those exceptional paths are not claimed
as exhaustive runtime test coverage.

Four added reported cases exercise twelve deferred combinations (three actions,
callback/fallback, false/true) and a separate deferred recheck. All prior tests
and assertions remain. The worker first ran the current tests against original
production SHA `A28EC3D1369A9AD21DFF24CAFB820605F8157018D53EE1862189E4F931482B92`:
727 Vitest / 70 Node PASS; original production identity remained unchanged.

| Arm | Quick audible ms | Playable lead ms | Prepared audible ms | Warm RTF | Cancellation ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| Piper ES | 4600 | 26215 | 5803 | 0.09 | 741 |
| Piper EN | 4245 | 23639 | 5858 | 0.10 | 460 |
| Chatterbox ES | 35899 | 21600 | 59857 | 0.89 | 278 |
| Chatterbox EN | 33778 | 19160 | 57847 | 0.87 | 295 |

All four arms passed unchanged selection, playback, synchronization and
cleanup gates: zero observed underruns/external requests/stale playback and
final retained units/discarded units/generated-audio files. Piper exercised
six rates; both Chatterbox languages reported installed. No performance
improvement, general hardware guarantee or acquisition journey is claimed.

Ignored raw evidence: `hardware-post-01.*`, including launch, context,
before/after identities, command results, summary, exit and individual logs.
Worker evidence: `hardware-worker-characterization-01.*` and
`hardware-worker-format-01.*`. Earlier failed baseline attempts remain intact.
