# Chatterbox and profile selection: environmental recovery

Receipt ID `DESKTOP-UI-HOST-CONTEXT-RECOVERY-20261013-01`.
HEAD `5be831c23135ca00f94b2b3374f0330de2b658ce` throughout diagnosis.
The maintainer explicitly authorized resolving the blocker and resuming the
handlers. No production repair, package reinstall or policy relaxation resulted.

## Reproduction and root cause

The original [baseline failure](hardware-baseline.md) occurred before B edits.
Both Piper arms require switching to Chatterbox; Chatterbox itself failed its
optional-package readiness gate. An ignored WebDriver observation of the
existing status element reproduced the integrity-error copy without exposing
publication content or invoking another snapshot.

Read-only host comparison found the installed v3 manifest equal to the frozen
authority, all 13,083 manifested runtime files unchanged, no extra files, and
all six models equal in size/hash. No symlink/reparse point or pre-epoch timestamp
was found. A temporary Rust test called the current verifier directly. In the
tool-inherited execution context, the package directory canonicalized beneath
ordinary AppData, but its files canonicalized beneath Codex's MSIX
`LocalCache/Local` tree. Both tree stamping and verification rejected this
out-of-root resolution, correctly enforcing containment.

The identical compiled diagnostic, launched through a normal PowerShell process
created by WMI, resolved root and file into the same ordinary AppData tree.
Containment, manifest decoding, tree stamping and full runtime verification all
returned `Ok`; diagnostic exit 0 (190.25 seconds for debug verification).
The temporary native test was removed and its tracked diff returned to empty.
Only content-safe ignored probes/logs remained.

`require_escalated` alone did not remove the inherited AppData redirection.
`GetCurrentPackageFullName` returned 15700 in both contexts and therefore was
not sufficient to diagnose it. The decisive check was actual final-path
containment, independently repeated with `GetFinalPathNameByHandle` before
acceptance. This identifies an execution-context issue; it does not establish
a defective package or justify accepting files outside the canonical root.

## Recovery and acceptance

Use the existing commands in a supervised normal local PowerShell process,
with explicit repository working directory, existing Corepack shim, signed
matching EdgeDriver, documented process-local model/offline settings, existing
firewall policy and actual final-path checks. The generic native lifecycle
command needs its existing model-free environment; enable model triples only
for the exact-host model runs. No environment, registry or firewall setting
was changed persistently, and no scheduled task was installed.

Fresh independent report `SRC-HARDWARE-CONTROLS-02-BASELINE-20261013-02` passed
all twelve required commands and all four supported model/language arms.
Chatterbox reported `installed`; both Piper profile switches passed. Its
initial generic-native setup error and successful unchanged retry are retained
in the [baseline/order receipt](hardware-order.md).

Regression/fix scope: environmental launch and test preparation only. No
production source, contract, acceptance threshold or assertion was changed;
no new production regression test or `change_reviewer` gate was applicable.
The independent refactor validator reviewed the host evidence before B resumed.
Acquisition, reinstall and a new installer were not exercised or claimed.

Diagnostic commands included `Get-FileHash`, the temporary filtered
`cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml diagnostic_installed_runtime_read_only -- --ignored --nocapture`,
and the existing native runner with its synthetic fixture plus a read-only
ignored WebDriver preload. Those probes are diagnostic evidence, not substitutes
for the uninstrumented twelve-command baseline.
