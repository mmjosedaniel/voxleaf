# Chatterbox v6 integration: current host validation

This records accepted integration evidence under the explicitly revised scope
for implementation commit
`9073ad4b1a54b9dc86e811526cbcdb6dea2ee56d`, based on
`e46eb99c542b27a891aae6ee20d68c525d79f5f1`. The
[completed ExecPlan](../../completed/chatterbox-filelock-setuptools-security-refresh.md)
records reviewer-approved reuse plus exact local v6 artifact admission. Earlier
v5 and CLB completion alone do not establish v6 acceptance. Full live delivery
remains unverified; the two failed attempts and unknown cause are retained below.

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

## Historical live acquisition failures

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

The following isolated diagnostics used exact production inputs, a private test
addition and unchanged `download_artifact`. Each process closed, removed its
owned partial and verified all 797 primary source inputs unchanged. No user-data
or network-setting changes were made by these probes.

| Diagnostic | Observed outcome | Interpretation limit |
| --- | --- | --- |
| R14 bounded native transfer | Request/connection error 11001 (`HostNotFound`), zero bytes, 11,077 ms. | No HTTP/body observation; not the same failure as either installed read timeout. |
| R15 Rust resolver operation | Three allowed public hosts resolved without errors, 27/0/0 ms. | Later process/time; does not identify R14's failed host or cause. |
| R16 bounded native transfer | Intentional cancellation after 134,233,617 bytes in 18,770 ms; DNS succeeded before/after. | No complete part or installed-context acceptance. |
| R17 sustained bounded transfer | Intentional cancellation after 536,883,638 bytes in 82,143 ms; maximum inter-callback interval 177 ms; DNS succeeded before/after. | Byte cap arrived before the 90-second threshold. Callback intervals include read/write/callback work. Longer and full installed transfers remain untested. |

R17 did not reproduce the read stall. It supplies no evidence for changing
production timeout, resolver or retry/resume policy, and does not renew the
exhausted full-acquisition retry budget. The remaining investigation must
distinguish installed process/callback context from time-varying transport;
neither cause has been established. The user's subsequent reuse request and
independent review explicitly replaced the full-live-journey closeout gate with
the complementary evidence below; this does not resolve transport reliability.

## Exact local v6 admission and evidence reuse

`CB-V6-RISK-BASED-REUSE-PLAN-R1-ASTRA-20261025` rejected wholesale reuse of
v5 transport acceptance: the authority, archive and Tokio version differ.
It approved exact unchanged model/module identities and the current v6 gates
listed above. Current B06/B07 regressions cover cancellation, commit and failure
cleanup; byte-identical candidate uninstallers support only the scoped NSIS UI
reuse. V5's complete real journey remains historical evidence.

R18 filled the archive-specific gap using a private ignored Rust test in an
isolated copy, with unchanged authority and all 797 execution inputs verified.
Offline compilation exited 0; the exact test exited 0 with one pass, no failures
and 120 filtered tests in 750.98 seconds. All nine local artifacts passed the
production verifier. Current acquisition code reassembled, extracted, verified
and promoted v6; a fresh manager in the same process rediscovered it. Full
runtime/model verification and explicit owned removal passed, preserving the
unrelated sentinel. Retained-v5 survived acquisition until explicit removal.
The process closed and scratch cleanup passed without source drift or watchdog
intervention. User installation and original data were untouched.

The hook supplied local bytes and rejected unexpected requests; it did not
exercise HTTP or a new installed-process restart. No package/model body was
downloaded. Fresh GitHub API metadata matched all three published part identities.
The completed plan records exact commands, artifact hashes and private receipts.
`CB-V6-LOCAL-REPLAY-R18-RESULT-R1-ASTRA-20261026` approved revised functional
acceptance with no findings. No additional complete transfer, GPU matrix or
installer cycle is required while those inputs remain unchanged.

## Hosted CI

All required jobs succeeded on implementation head `9073ad4`:

- [Foundation checks](https://github.com/mmjosedaniel/voxleaf/actions/runs/40238341429): Windows native, Ubuntu portable and Ubuntu Rust; Windows completed at 2026-10-25 22:21:41 UTC.
- [Production dependency graphs](https://github.com/mmjosedaniel/voxleaf/actions/runs/40238341460): completed successfully at 2026-10-25 22:04:48 UTC.

The dependency-audit CI failure is resolved on this head. These jobs do not run
the missing full installed Chatterbox acquisition/recovery acceptance journey.

## Review and privacy status

The public R1/R2 integration-report copies omit redundant trailing blank lines.
Their complete original bytes remain in private evidence; historical report
hashes identify those originals. No verdict, finding or technical text changed.

Behavioral corrections have scoped independent Astra reports, including the
sharing-lock regression and timeout classification. Fresh integrated-head CI
passed; revised functional acceptance is approved by the R18 result review.
The final archive/index/documentation patch has its own exact review gate,
`CB-V6-REUSE-CLOSEOUT-R1-ASTRA-20261026`; its actual verdict is authoritative.
The PR remains a draft. R15, R16 and R17 each had a distinct exact-helper Astra
approval for one diagnostic execution; none was global acceptance.

A targeted scan of added source/documentation and new files found no private
host paths or credential-pattern matches; generic NSIS `$LOCALAPPDATA` variables
were the only path-pattern matches. Public summaries omit user-data inventories,
fingerprints, host paths and raw logs. Source/distributable hashes above identify
reviewable artifacts, not private user data. No VoxLeaf installer or model asset
was published.
