# Real-model validation: reader/narration fixes

Receipt: **RNB-MODELS-20261020-04**. Task RNB.
Base/HEAD: `8fd0c54e93705009e6070cb97105c8a1032002d6`.
Branch: `codex/reader-narration-bugfixes`; no staging or Git mutation.

## Execution and provenance

`pnpm.cmd test:tts:bilingual-portfolio-exact-host` exited **0** in supervised
ordinary local PowerShell outside the sandbox, from the repository root.
Start/end: 2026-10-20 03:57:26–04:32:36 UTC. All six prescribed arms passed,
including the preceding preflight, build and synthetic native lifecycle.

The 723-entry source/configuration/fixture manifest is
`final-code-inputs-03.json`, SHA-256
`2625d3f76e31f62d5f01d77c6719226b1bc6099e6e3757b7fd70c7b01473db4b`.
Only the native smoke harness and its Node tests differ from the previous
723-entry manifest. `pnpm.cmd check` was repeated successfully after that
correction (`check-04.log`). No source changed during the model matrix.

Existing local interpreters, model roots, matching drivers, offline flags and
interpreter-bound outbound firewall blocks were used. Actual package/file final
paths were checked in the ordinary PowerShell context. Neither installation,
download, model update, firewall mutation nor package-verification bypass was
needed. See [host-context recovery](host-context-recovery.md).

Full captures remain ignored: `models-04.log`, `models-04.json`,
`models-04-results.json`, `models-04-running.json` and launch/final-path receipts
under `tmp/evidence/reader-narration-bugfixes/`. The runner's final process
observation is empty. These are local captures, not public attachments.

## Measured results

All durations below are milliseconds. Startup shutdown measures from the Cancel
start keyboard action until native stopped/no-instance is observed; final startup
cleanup uses the same start time. Both Chatterbox arms observed the same captured
native instance in **warming** immediately before cancellation. Explicit restart
and subsequent playback/navigation/cleanup passed. Deterministic native tests
separately cover blocked loading and warming; this real run observed warming.

| Profile/language                        | First audible | Startup shutdown / final cleanup | Playback cancel | Contexts created / closed | Final resource release |
| --------------------------------------- | ------------: | -------------------------------: | --------------: | ------------------------: | ---------------------: |
| Piper davefx / Spanish                  |         5,119 |                    Not exercised |             795 |                     6 / 6 |                  1,023 |
| Piper joe / English                     |         4,719 |                    Not exercised |             647 |                     6 / 6 |                    818 |
| Chatterbox / Spanish                    |        35,535 |                        183 / 201 |             296 |                     5 / 5 |                    916 |
| Chatterbox / English                    |        34,372 |                        204 / 219 |             295 |                     5 / 5 |                    550 |
| Qwen Serena / Spanish, development only |        67,957 |                    Not exercised |             172 |                     5 / 5 |                    961 |
| Qwen Aiden / English, development only  |        58,518 |                    Not exercised |             174 |                     5 / 5 |                    868 |

Every arm ended with zero retained/discarded audio units, zero generated audio
files, zero external requests and no stale playback. All 32 created AudioContexts
closed. Piper additionally exercised all six playback speeds; every arm exercised
synchronized reader navigation, pause/resume, replacement and prepared playback
through the existing matrix. All runner resource and cleanup assertions passed.

These are real local model/GPU results on this configured host, distinct from
synthetic native and Chromium inference. Qwen remains development-only. Context
counts and bounded process-resource observations do not establish long-term RAM
behavior or general performance on other hardware. The first-audio timings are
measured model/startup costs, not a fixed 15-second wall-clock wait.

## Retained failed attempts

`models-01/02` failed before inference because the inherited MSIX context caused
package final-path containment rejection. `models-03` recovered that environment
and passed Piper, then failed the new phase instrumentation. The scoped
`chatterbox-phase-01` diagnostic proved native playback worked while a wrapper
assigned to Tauri's non-writable `invoke` never ran. A permanent red/green test
and direct native observation corrected the harness before this complete run.
No failed attempt is counted as acceptance or erased by the successful retry.
