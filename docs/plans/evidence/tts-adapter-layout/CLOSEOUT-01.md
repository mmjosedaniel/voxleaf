# Local execution closeout: blocked acceptance

The implementation is prepared, but the ExecPlan remains active and unaccepted.
Independent [POST-CHANGE-03](POST-CHANGE-03.md), Report ID
`TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-03`, is **FAIL**: all 22 required
commands ran outside the sandbox, 21 passed and the fresh-v4 candidate failed.
Raw report SHA256:
`5816b64b3a2d9e83ba425e68788f415cc1aac79789f2eeaf3805bb882c0edef4`.
The linked report lists every exact command, environment, outcome and receipt.

Prepared changes are the four selective engine moves into `adapters/`, direct
imports, immutable historical v2/v3 source resolution, generated Piper refresh,
isolated local-only v4, explicit host runners and the implemented service map.
Contracts, protocol, root service owners and entrypoints remain in place. V3
remains admitted; v4 is neither published nor admitted. No generated source,
historical evidence, dependency lock or completed plan was manually rewritten.
The sole writer's final packet is [CHANGE-PACKET-03](CHANGE-PACKET-03.md):
35 paths, 2,983/3,000 additional lines, 151/300 generated lines.

The accepted baseline preceded implementation. Independent final checks pass
format/lint/types/build, Python 485 tests, desktop 588 Vitest plus 47 Node tests,
shared 209 and EPUB 651 tests, Rust 87 default plus 88 release-locked tests,
both aggregates, history/package/inventory/audit/security and native startup.
Audit-policy informational findings and optional Python blind spots remain as
reported; no claim of zero audit blind spots is made.

The frozen desktop-02 completed all four exact-host arms:

| Runtime/language | Start ms | Playable lead ms | Prepared RTF | Cancel ms |
| --- | --- | --- | --- | --- |
| Refreshed packaged Piper ES | 5203 | 16763 | 0.11 | 728 |
| Refreshed packaged Piper EN | 5124 | 18481 | 0.11 | 935 |
| Admitted installed Chatterbox v3 ES | 47952 | 21880 | 1.09 | 296 |
| Admitted installed Chatterbox v3 EN | 85033 | 18360 | 1.06 | 298 |

These are actual observations, not performance-improvement claims. Each arm
reported zero underruns, stale playback, generated audio files and external
requests, with synchronization and cleanup assertions passing. Slow Chatterbox
startup remains explicit. The route did not install/uninstall or change the
existing ordinary installation. Installer signing, antivirus and installation
lifecycle remain unrun; the generated package is unsigned-local.

## Concrete blocker and next decision

`test:tts:adapter-layout:candidate` fails `service-lifecycle` when importing the
copied Chatterbox provider. NumPy's optional `check_support_sve` calls local
`subprocess.run('lscpu')` and catches `OSError`. The new runner's audit bootstrap
denies `subprocess.Popen` with `RuntimeError`, aborting import, and incorrectly
counts that denied local launch as `networkDenied`. The independent import-only
diagnostic records a denied launch, not a network event or inference acceptance.
Changing only the exception would still fail the audit counter checks.

Both permitted source correction loops are exhausted. The director stops here
under [orchestrate-safe-refactor](../../../../.agents/skills/orchestrate-safe-refactor/SKILL.md):
"Permit at most two correction loops; after that, stop and redesign the work order
instead of accumulating patches."

The reused auditor independently confirmed the diagnosis without editing or
running tests. A future redesigned order must cover `bootstrap`, `startService`
and audit/shutdown acceptance plus focused runner tests. Preserve unconditional
subprocess denial, distinguish denied process attempts from socket events, and
explicitly define admission of the denied optional probe. Do not modify NumPy,
allow process execution, weaken networking checks or call an exception-only
patch sufficient. This recommendation authorizes no third patch or new order.

## Recovery, host cleanup and Git

All failed preparations and reports remain immutable. The preparation timing
lapse involving the nested Piper writer is recorded in Change Packet 03; it
was not relabeled compliant. Complete unchanged-core proof, the original nine
recovery captures and subsequent pre-retry captures were independently checked.
The validator rehashed 27/27 recovery copies. The final 2,031 frozen resources
and fresh NSIS inputs match exactly; old desktop-01 remains failed evidence.

Final validator identities held: HEAD/index, 35 source paths, 260 protected
paths, 25 artifact files, 2,031 new and 2,037 old frozen resource records. No
relevant model/native/driver/test processes survived. After report issuance,
the director ran the saved `firewall-cleanup-01/cleanup.ps1` in elevated local
PowerShell: only exact task names 0 through 5 were removed, after program
identity checks. `result.json` says `cleaned`; separate readback confirms zero
task rules and eight original benchmark rules. Both receipts remain under
`tmp/evidence/tts-adapter-layout/firewall-cleanup-01/`. Future host runs require
fresh exact offline preparation and validation, not reuse of removed rules.

Source/artifact writing is idle. Branch remains `codex/tts-adapter-layout` at
`7bbad9d5bef3a83c913ea5d7b948213a05bb0362`; changes remain unstaged with an empty
index. No commit, push, PR, installation or package publication occurred.
The canonical system diagram was reviewed: process/data flow and active v3
admission are unchanged, so no diagram edit was justified. The plan stays in
`active/`; archival is prohibited until its remaining acceptance is satisfied.

Final local-host closeout checks: `pnpm.cmd check:evidence`, `git diff --check`
and `git diff --cached --quiet` all exited 0. A separate read-only comparison
matched all 35 source identities to the frozen packet and all eight original
firewall rule names/programs/enabled/direction/action/profile values to the
validator's pre-cleanup capture. Receipts and final Git status are retained in
`tmp/evidence/tts-adapter-layout/final-closeout-01/`. The evidence guard checks
the index; the new retained evidence directory was also inspected as Markdown
summaries only, with raw logs and payloads kept in ignored storage.

The reused `clean_code_auditor` approved this documentary checkpoint with no
findings after comparing report 03, its normalized copy and cleanup receipts.
It confirmed the FAIL status, slow startup observations, recovery timing lapse,
exhausted correction limit and active/unaccepted plan. This is documentary
approval only, not acceptance of the source unit. Final host local-link,
whitespace and empty-index checks also passed.
