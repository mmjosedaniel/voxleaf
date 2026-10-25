# Chatterbox v6 integration: current host validation

This records partial integration evidence on base
`e46eb99c542b27a891aae6ee20d68c525d79f5f1`. The
[active ExecPlan](../../active/chatterbox-filelock-setuptools-security-refresh.md)
remains incomplete: full acquisition/recovery and final integration acceptance
are pending. Earlier v5 and CLB completion do not establish v6 acceptance.

All checks below ran in normal local PowerShell outside the managed sandbox.
Raw logs, environment snapshots and restoration inventories remain private.

## Completed checks

| Command or configured scenario | Current result |
| --- | --- |
| `pnpm.cmd check` | Exit 0: shared 209, EPUB 674, desktop 818 Vitest + 100 Node, Rust 119/118 with two ignored per mode, Python 645; quality checks/builds passed. |
| `pnpm.cmd test:browser` | Exit 0; ten scenarios passed. |
| `pnpm.cmd audit:release` | Exit 0; seven existing Rust notices and four explicit Python URL/CUDA blind spots remain disclosed. |
| `pnpm.cmd package:windows:verified-core` and `pnpm.cmd package:windows:check` | Exit 0 for the exact R6 artifact. |
| `pnpm.cmd test:native-startup` | Exit 0 in R12. |
| `pnpm.cmd test:tts:reader-corrections-host` | Exit 0; native Piper/Chatterbox ES/EN, both Pause/ended rates and six playback rates passed. |
| Configured native reader harness against the installed R6 executable | All four Piper/Chatterbox ES/EN arms exited 0. |
| `pnpm.cmd test:chatterbox:installed-integrity` | Exit 0 before and after the R12 matrices. |
| `pnpm.cmd package:windows:ordinary-chatterbox:preflight --installer <R6>` | Exit 0. |
| Configured Windows package Lifecycle script against R6 | Exit 0 after the bounded sharing-lock repair; six retention/removal cases and complete restoration passed. |

Native cancellation measured 248/452 ms for Piper ES/EN and 295/294 ms for
Chatterbox ES/EN. Installed cancellation measured 675/563 ms and 300/297 ms,
respectively. Every arm reported zero external requests and generated-audio
files, released retained/discarded units and closed all created audio contexts.
Offline execution used three interpreter-specific outbound firewall rules;
their eventual removal and absence were verified.

R6 installer SHA-256:
`e7afec29fd561912a9155c9f7bc4070f6ac7833175f7f6cd7b91097163fdf6d7`.
Installed executable SHA-256:
`429ecde61f3f0de695d8cb8ff6c1cee6a209853500281af4dad975b3e85adb4f`.
Native startup and reader commands build their own respective executables;
their recorded hashes are distinct from this installed binary.

The two changed lifecycle tooling files do not alter shipped R6 bytes.
`CB-V6-LIFECYCLE-HANDLE-REPAIR-R1-ASTRA-20261025` approved that prepared-artifact
reuse. `CB-V6-R12-GATE-REUSE-JOURNEY-RETRY-R1-ASTRA-20261025` verified all 797
execution inputs and the contemporaneous environment/executable snapshots and
approved retaining R12's nine completed inner gates. Neither report is global
integration acceptance.

The four actual R5 NSIS UI/default-checkbox/marker observations are retained
only under `CB-V6-NSIS-EVIDENCE-REUSE-R1-ASTRA-20261025`: the R6 uninstaller is
byte-identical. This is explicitly reused interactive evidence, separate from
the fresh R6 automated Lifecycle result; it is not a new interactive execution.

## Acquisition remains blocked

Both full configured `pnpm.cmd package:windows:reader-corrections` executions
failed during the download preceding verification cancellation:

| Attempt | Diagnostic | Bytes received | Elapsed |
| --- | --- | ---: | ---: |
| R12 | First runtime part, HTTP 200, read timeout | 78,836,178 | 50,244 ms |
| One independently reviewed explicit retry | First runtime part, HTTP 200, read timeout | 30,962,525 | 46,767 ms |

Expected/content length was 1,900,000,000 bytes in both cases; no numeric OS
error was exposed. Acquisition staging was cleaned. Both complete wrappers
verified unchanged original data and restored installation/metadata with no
restoration errors. The failures remain failed; no full acquisition/recovery
pass is inferred from the completed reader gates.

The typed diagnostic correction exposes the wrapped timeout without changing
transport behavior. The pinned blocking client applies a 30-second read timeout.
A subsequent bounded curl range request transferred 128 MiB successfully, and
a separate HTTP 200 request transferred 170,180,169 bytes before its intentional
90-second deadline. These observations do not prove the cause of VoxLeaf's
stalls or substitute for actual acquisition. Further work requires diagnosis
and an explicitly revised experiment, not repeated full downloads until green.

## Review and privacy status

The public R1/R2 integration-report copies omit redundant trailing blank lines.
Their complete original bytes remain in private evidence; historical report
hashes identify those originals. No verdict, finding or technical text changed.

Behavioral corrections have scoped independent Astra reports, including the
sharing-lock regression and timeout classification. Final integration approval
and fresh integrated-head CI remain pending. The PR remains a draft.

A targeted scan of added source/documentation and new files found no private
host paths or credential-pattern matches; generic NSIS `$LOCALAPPDATA` variables
were the only path-pattern matches. Public summaries omit user-data inventories,
fingerprints, host paths and raw logs. Source/distributable hashes above identify
reviewable artifacts, not private user data. No VoxLeaf installer or model asset
was published.
