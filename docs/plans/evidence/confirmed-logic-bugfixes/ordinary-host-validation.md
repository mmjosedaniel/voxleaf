# Confirmed logic corrections: ordinary Windows acceptance

> Privacy redaction authorized on 2026-10-23: internal assistant metadata and
> unnecessary host inventory/capture identities were omitted. Originals are
> retained privately. Technical outcomes are unchanged; historical source
> hashes identify the original reviewed snapshots, not these redacted copies.

Recorded 2026-10-22, America/Bogota; the final UTC logs end on 2026-10-23.
Branch `codex/confirmed-logic-bugfixes`, HEAD
`a9f60ed2ef8be53141391260985aeabcd237140c`. No staging or commit.

This record supplements the immutable R3/R5 reports. It records observed
behavior and test execution, not independent approval. Raw evidence and helper
scripts remain ignored under `temp/clb-review/`; they contain no book text or
generated audio. Their identities are bound by the subsequent review.

## Environment and scope

The first attempted manual handoff exposed Windows AppData redirection: the
agent's escalated PowerShell saw VoxLeaf under the ordinary path, while the
user's Explorer could not open it. Explicit inspection located the installation
and data in the Codex package's `LocalCache/Local`. Earlier successful silent
lifecycle and installed-app lock/restart/retry observations remain evidence for
that profile and those unchanged release bytes, not proof of an ordinary-profile
rerun. They exercised real Windows file locks and actual app behavior.

The user then installed the exact final package manually from Explorer. A
read-only script launched by the user from Windows Run recorded ordinary
System32 PowerShell, matching installed hashes, no ordinary app data and no
running reader. All interactive scenarios below were operated manually by the
user in that session, with synthetic data prepared and inspected there.
Computer Use could not control the uninstaller; no alternate automation was
used to bypass that restriction. Page observations are attributed to the user
and their screenshots; filesystem outcomes come from saved PowerShell snapshots.

## Interactive NSIS matrix

| Scenario | Observed result |
| --- | --- |
| No optional data | User confirmed no Chatterbox page appeared. Screenshot of final confirmation shows preferences/positions/recovery unchecked. Back closed the wizard; uninstall was not confirmed. |
| Only owned `.previous` exists | Screenshot shows the Chatterbox page and optional removal initially checked. No admitted package/current-version root was present. |
| Both removal choices unchecked | Program removed; `.previous`, preferences, unrelated and external sentinel hashes unchanged. |
| Chatterbox checked, preferences unchecked | Program and `.previous` removed; preferences, unrelated and external sentinel hashes unchanged. |
| Synthetic current version retained, preferences checked | Program and preferences removed; synthetic current-version, unrelated and external sentinel hashes unchanged. |
| Both choices checked | Program, current-version and preferences roots removed; unrelated and external sentinel hashes unchanged. |

The `.previous` marker SHA-256 was
`1736cc69644065c76da1b353ea7efb916418c2e1421ab77026825bdbde95b46e`;
current-version marker `719bfd4ef3a98b3754faa5a1e099959e8b08d3a9b577f1c06f81c611ffe26618`;
preferences marker `81c0e29942b6ae627cc84caa4554d512b0f7abdefab74480237e0b9363a9589b`;
unrelated marker `50050cd53c789f8935b7403f5efc63894ea5c78ef42f157f9e1dd51daae89ce6`;
external sentinel `3882fa51669f155508b5c165afb7e0a2713fa69b6b2f5e4f1692b5520c6137f7`.

Each reinstall used the same installer with `/S`, exited 0, verified installed
hashes and unchanged markers, and did not open the reader. The user manually
opened and completed each uninstall. Snapshots use the prefixes
`ordinary-nsis-backup-retention`, `ordinary-nsis-backup-removal`,
`ordinary-nsis-current-retention-preferences-removal` and
`ordinary-nsis-both-removal`. These scenarios do not claim a downloaded model
was deleted; their optional payloads were deliberately synthetic.

## Final restoration

`finish-ordinary-nsis.ps1` verified exact source/target containment, non-reparse
ancestors and trees, and that only the expected synthetic unrelated marker
remained in the test root. It reinstalled the final package and used the existing
lifecycle ownership helper to remove only the owned synthetic root. It revoked
deletion authority before an exact non-overwriting same-volume directory rename
moved the original cached app data into the absent ordinary data root.

`ordinary-nsis-final-restoration.json` confirms retained original optional-package data and original
preferences, old cache source absent, backup/quarantine absent and external
sentinel unchanged. No model download was repeated. The final validation then
confirmed original optional-package data still present, zero reader processes and an empty Git index.

## Fresh normal-PowerShell validation

The user launched `validate-ordinary-restoration.ps1` from their normal session.
The wrapper invokes only existing repository commands, sequentially, from the
repository root. It verifies R6 non-documentation inputs and release hashes
before and after execution. It does not rebuild the installer.

Host tools: Node 24.20.0, pnpm 11.15.1, cargo 1.97.1, uv 0.11.29,
Microsoft Edge WebDriver 155.0.4283.45. Corepack shims/Node/cargo paths were
prepended; standard Windows PowerShell module paths and the explicit existing
EdgeDriver path were selected. This was System32 Windows PowerShell, outside
managed automation and with the old cached app-data root absent.

| Command | Result |
| --- | --- |
| `pnpm.cmd check:evidence` | PASS, exit 0. |
| `pnpm.cmd test:chatterbox:installed-integrity` | PASS, exit 0; canonical root, tree stamp, bytecode authority and runtime verification; 1 passed, 0 failed, 118 filtered; 151.02 s test time. |
| `pnpm.cmd test:tts:reader-corrections-host` | PASS, exit 0; Piper ES/EN and Chatterbox ES/EN all exit 0; all eight controlled Pause/ended cases at 100%/75% paused, resumed and cleaned correctly. All six supported playback rates passed in each arm. |

Raw logs and before/after/result snapshots are in
`temp/clb-review/ordinary-restoration-validation/`. Windows PowerShell decorates
ordinary native stderr with `NativeCommandError`; the captured native exit codes
and explicit successful test summaries establish these results. That formatting
is not suppressed or mistaken for an actual failed test.

| Profile | Audible startup ms | Playable lead ms | Steady observation ms | Underruns | Cancellation ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| Piper ES | 4604 | 20862 | 60164 | 0 | 645 |
| Piper EN | 4545 | 22649 | 60096 | 0 | 170 |
| Chatterbox ES | 31561 | 17320 | 60252 | 0 | 283 |
| Chatterbox EN | 30103 | 16200 | 60100 | 0 | 283 |

Every arm recorded zero external requests, generated audio files and retained
units after cleanup. These are bounded local observations, not a startup SLA or
universal performance guarantee. Approximately 15 seconds means playable audio
lead, not a fixed elapsed delay; no wait policy changed in this continuation.

## Artifact identities and remaining gate

| Artifact | SHA-256 |
| --- | --- |
| Final NSIS installer | `53be8afdafc6b40d434b49b31e64f58d0049ba2edf9d4d0ef8a4caefb44e7434` |
| Ordinary installed executable | `3be12a8e0cee3141297827734450bbb15c6faa97a24f52bc6aa681a7e6aa19f3` |
| Ordinary uninstaller | `0fd7c99aa236f24ad6e085b164c54d1cc127a55d06c316a704a7128fe1485607` |
| Post-restoration diagnostic executable | `dfc27248386e44957ba23477d89e149dc45b561a37c986f8fac7c5e45c260fe1` |

The diagnostic runner builds with the existing default configuration. Its binary
is distinct from the installed release binary; neither evidence set is silently
transferred to the other. No runtime/test/config source changed after R6.
Existing deterministic, browser, native recovery and installer evidence remains
bound to unchanged inputs and its recorded environment in the earlier reports.
Independent implementation approval was issued in
[R7](change-review-ordinary-host.md), `CLB-R7-ASTRA-20261023T025408Z`, with no
actionable findings. The [closeout review](change-review-closeout.md) separately
binds the completed-plan path and final maintained documentation.
