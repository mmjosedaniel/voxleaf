# Final Windows packaging and lifecycle

> Authorized privacy redaction (2026-11-11): local-state details and private
> evidence shortcuts are omitted from this public copy. The original is
> preserved privately. Historical technical outcomes are unchanged; this
> redaction does not renew prior approval. See [privacy follow-up](privacy-follow-up.md).

Status: final unsigned build, exact-installer lifecycle, declared host restoration
and package check pass; final integrated review remains pending. All execution
uses normal local PowerShell outside the sandbox,
with a single owner for build/native/installer work. No signing, publication or
ordinary Chatterbox acquisition GO is claimed.

## Build preparation and exact artifact

The final ignored wrapper reserves each attempt before capture, journals the
clean historical Windows evidence, and binds source, tools, NSIS, checked core
and generated outputs. Catchable interruption without a verified terminal build
result preserves backups and blocks restoration writes. A successful build keeps
the new verified adjacent runtime beside its matching executable. Its original
generated runtime is retained separately as a journaled backup; this is an
intentional build-output update, distinct from original user profile restoration.

Read-only preflight on2026-11-12 UTC02:33:14.638–02:33:36.967 exits0.
Receipt ID: `g9-final-build-a01/preflight.json`. Its mixed local-inventory
digest remains private.
The unexecuted wrapper was inspected and corrected before release; no failed
canonical build or installer attempt was used for that preparation.

```powershell
pnpm.cmd package:windows:verified-core
```

Runs at02:34:02.349–02:36:27.044, exit0; outer wrapper also exits0. The command
uses the already verified core, builds the release-locked native executable and
generates one unsigned installer. It does not regenerate the core package.

| Generated artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `VoxLeaf_0.1.0_x64-setup.exe` | 203,981,570 | `06F1F5120465D6193797C77C42E0C4F39B43D35879DD7C37F193BD6F39911A9D` |
| `voxleaf-desktop.exe` | 12,007,936 | `68C1BCE8684AACA36C246703D9DD744A5D37F375E1A8CE7792C790C5114E981D` |
| Installer checksum sidecar | 94 | `EF06DC3DD8491424C841ADA89344D280DA54D3570E13DFB5A3C00F19C4ED1DAF` |
| Generated `installer.nsi` | 984,510 | `43BC04CCB0F5A735C35BB466DBDB17D8B8774763953C9DAB76D08264DD07BE68` |

The13,317 source/tool rows,1,494 JavaScript rows,251 exports,2,024 checked-core
rows,442 NSIS rows and2,164 core-environment rows match across execution. Source
manifest SHA-256 is
`1DC4376FEE1EA21556DE0E05E9969C258F127709F2C252A0110C420A8312E9B9`;
core tree `9A7B600E03AD59943394379D4722A8551A0AB73B6A4560E32FC4A9FF9D4E4856`;
NSIS tree `5B6A3E6B4D33BFE4AA530148B1F2489011CE22684F1A28EA545286F34CFDFBB9`.
The fresh canonical adjacent runtime exactly matches the checked core. The prior
generated tree and its original directory identity remain preserved in
the run's unique sibling hold, named in its private journal.

The freshly generated private Windows evidence binds the actual installer,
executable and four release authorities. Its SHA-256 is
`24233749290709EDCB2892463A363C5310AD647E8A1AE01A640139CC4C6D0906`.
The tracked historical `windows-package-evidence-v3.json` was restored to its
exact original bytes, metadata and clean Git state; original SHA-256:
`7FD9DB70E4964BD3ECBDED94E2861F48C02BC49EC1949CF49D787077F91AC30C`.
No historical evidence is replaced by the new result.

Ignored build log SHA-256:
`A94D5317FCFDC10C86D1013D1551E073BC123CE6209E9600FEEBA45BCAF338D9`.
Command receipt:
`A041324D244D98D677783548CF4A9FA3ADC31183D1AA5B63F77D66B7BF469917`.
Build result:
`7F68E307F7C60BE1A5A4D08B7AD6D8D2FDF4C2A5E1B8EAE74B59AFC43A89AF0E`.

## Final generated installer inspection

The coordinator inspected the actual generated template before permitting
lifecycle preflight. It selects current-user execution, the exact two VoxLeaf
HKCU leaves, target-checked Start Menu/Desktop shortcuts and the named VoxLeaf
Run value. The included hook suppresses Tauri's broad data-removal checkbox and
uses the existing owned selective cleanup paths. Registry/link holds therefore
cover those exact prior objects, with fresh identity checks and no parent-key or
unknown-occupant deletion. The generated vendor leaf may be removed only after
proof of this installer's successful lifecycle, exact expected content and its
write interval; original held leaves are then renamed back.

The template's AppUserModelID cleanup also invokes Windows jump-list APIs.
The outer journal observes pinned-link identities and opaque Taskband digests
without modifying them. It does not claim global opaque shell-history restoration.
Actual canonical lifecycle and declared outer restoration remain separate results.

## Canonical lifecycle and outer restoration

Fresh preflight binds the exact final installer/executable/template and original
historical evidence. Its13,320 source rows project exactly to all13,317 build
rows after excluding only the lifecycle helper files and reg.exe. It privately
records the declared restoration baseline and checks owned-process and recovery
preconditions. Local inventory values, counts and digests are omitted here.
Receipt ID: `g9-final-lifecycle-a01/preflight.json`. Its mixed local-inventory
digest remains private.

```powershell
pnpm.cmd package:windows:lifecycle -Installer <absolute-final-installer> -LifecycleReceipt <new-run-directory/windows-lifecycle-receipt-v1.json>
```

The private command receipt records the concrete absolute arguments. Canonical
execution at02:41:16.295–02:43:33.044 UTC exits0; outer wrapper also exits0.
Installation, first start, repair, default uninstall after repair and verified
cleanup all pass. The exact six scenario outcomes are:

| Scenario | Chatterbox removed | Preferences/recovery removed | Unrelated preserved |
| --- | --- | --- | --- |
| default-preserve | No | No | Yes |
| chatterbox-only | Yes | No | Yes |
| preferences-only | No | Yes | Yes |
| both-explicit | Yes | Yes | Yes |
| legacy-both | Yes | Yes | Yes |
| invalid-values-preserve | No | No | Yes |

The remaining installer-created vendor default value was exported and journaled,
then removed only after its exact shape, successful lifecycle and write-window
proof. The declared restoration comparison passed for the original registry,
shortcut, profile, installation, temporary and observed shell state. Exact
local values and identities remain private. Outer cleanup reports no errors. The original
generated-runtime backup remains intentional ignored build recovery material.

The existing `windows-release.mjs evidence` CLI, without `--write`, validates the
new lifecycle receipt against the exact installer and executable at
02:43:40.331–02:43:40.522, exit0. Ordinary optional acquisition remains unrun;
this does not manufacture a full release GO or clean-host/interactively observed
acceptance from the lifecycle result.

| Ignored artifact | SHA-256 |
| --- | --- |
| `lifecycle.log` | `43BE58D3A1923A523B0944730C3DAC0FF170751AE413094936A7CED43C5E6B68` |
| `windows-lifecycle-receipt-v1.json` | `5F28AAA5DADF33B14A7FC9E513B35D400B611523E10D426A1386CCA14BC46B4A` |
| `lifecycle-result.json` | `98E7EAEC7A43FC3E68B869E522E852CFA127474F7830A0BB0C3DAC7ED61A3A3F` |
| `installer-bound-evidence.json` | `C39ECC8845C0E235B272A2C2AE8E5BDDDA3B9B0BB8F1EEAE03C14102F24F5336` |

## Final package check

`pnpm.cmd package:windows:check` runs02:44:23.601–02:44:23.997 UTC, exit0,
reporting `windows-release:current`. It performs no evidence write. Its13,322
source/tool/artifact rows remain stable, SHA-256
`015300C412BE34188E279289C0C2DBC795052E37AEFC6E860EDAB4AB2DB45CEE`,
with matching JavaScript,251 exports and2,024 core rows; exact host state matches.
`g9-final-check-a01/check-result.json` SHA-256:
`20FB59DE27AB383A0B5E3CE7386B4D99A245FBAA75E7DABCF1AD280854D1C0F6`.
Check log SHA-256:
`ED3AEF5471EDF6764AC63B4D20C13FC9A4E28F168930D037648F33980BB7BA50`.
