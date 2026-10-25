# NSIS language and interactive acceptance follow-up

This is a new v6 integration checkpoint, not a rewrite of the completed CLB
acceptance. HEAD is `e46eb99c542b27a891aae6ee20d68c525d79f5f1`; the integration
changes remain uncommitted. Global v6 acceptance remains pending in the
[active plan](../../active/chatterbox-filelock-setuptools-security-refresh.md).

## Reproduction and correction

Computer Use observed R4's Spanish optional-data page with an initially checked
checkbox but empty title, explanation and checkbox label. That attempt was
cancelled before uninstalling. Tauri includes `nsis-hooks.nsh` before its
`MUI_LANGUAGE` declarations, so the hook used `LANG_ENGLISH` and `LANG_SPANISH`
before those macros were defined.

A new compiled regression uses that same ordering and executes the generated
uninstaller for both languages. Before the correction, English resolved the
Spanish title: 97 Node cases passed and the new case failed. Binding the eight
strings to the explicit language IDs 1033 and 1034 fixes their resolution.
Removal policy, default checkbox states and path ownership are unchanged.

## Executed checks

All commands ran in local PowerShell outside the managed sandbox.

| Command | Result |
| --- | --- |
| `pnpm.cmd --filter @voxleaf/desktop test`, regression first | Exit 1: 818 Vitest passed; 97 Node passed, 1 failed. |
| Same command after correction, including final formatted source | Exit 0: 818 Vitest and 98 Node passed. |
| `pnpm.cmd format:check:typescript` | Initial style warning corrected; final exit 0. |
| `pnpm.cmd lint:typescript` | Exit 0. |
| `pnpm.cmd package:windows:verified-core` | Exit 0; historical package receipt restored byte-for-byte. |
| `pnpm.cmd package:windows:check` | Exit 0. |
| `pnpm.cmd check:evidence` and `git diff --check` | Exit 0. |

R5 installer: 203,957,507 bytes, SHA-256
`b9069e837ba8198f9ac016b3668589fc1c444f33edef1d8cc3ee2a6c945cb440`.
Installed executable: SHA-256
`dae5564bf76165facd121833f03127dab404a82685ec2d39258957eb6af101e1`.
The fixture verified that identity after each installation and before exposing
the interactive phase. This is distinct from R4; earlier binary-specific
results are not relabeled as R5 runs.

## Actual interactive behavior

Computer Use operated the real R5 wizard against protected synthetic data.
It observed the title, explanation and checkbox label in Spanish and English.
Optional Chatterbox removal was checked initially; preferences removal was
unchecked initially in every phase.

| Synthetic data | Choices | Verified result |
| --- | --- | --- |
| `.previous` | Keep Chatterbox and preferences | Both retained. |
| `.previous` | Remove Chatterbox, keep preferences | Backup removed; preferences retained. |
| `cb/6` | Keep Chatterbox, remove preferences | Current package retained; preferences removed. |
| `cb/6` and `.previous` | Remove Chatterbox and preferences | Both optional roots and preferences removed. |

Every phase completed and closed, with an identity-bound process-tree receipt.
Unrelated and external markers survived all four scenarios. The complete
wrapper exited 0, and the original installation, metadata and full user-data
comparison passed with no restoration errors. Observations are attributed to
Computer Use, not to a human operator.

## Failed attempt and recovery

The cancelled R4 attempt separately exposed a private launcher defect: writing
its process-completion receipt exceeded the host's legacy path limit. The
wrappers failed closed and preserved backups. Independent review
`CB-V6-MANUAL-RECOVERY-HELPER-R1-ASTRA-20261025` approved a separate recovery
after host preflight; recovery restored and verified the original state.
The missing original receipt was never fabricated, and that attempt remains
cancelled rather than passed.

The revised launcher preserves its one-shot gate and process-tree wait while
using extended paths for evidence IO. Actual Windows PowerShell 5.1 probes
passed read/write/rename operations for all four phase lengths. Independent
review `CB-V6-OBSERVED-NSIS-HELPERS-R5-ASTRA-20261025` approved the exact helper
set before the R5 matrix. These helper approvals do not constitute global
integration approval.

Raw logs, process identities, user-data fingerprints and observations remain
private. A targeted scan of the changed source/documentation found no private
host paths, data fingerprints or credential patterns. No installer or user
data was published. Acquisition still lacks a passing end-to-end result after
the separately recorded response-read I/O failure; final integration review
and fresh PR CI remain pending. The system diagram needs no additional change
for this correction to installer text.
