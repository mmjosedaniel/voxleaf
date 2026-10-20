# Installed Chatterbox: host-context recovery

Task RNB, follow-up 2026-10-20. The maintainer authorized investigating the
existing installation, making the minimum necessary correction, and resuming
the original six-stage plan.

## Cause and correction

The existing package was not proven corrupt. A temporary read-only Rust probe
reproduced the current native verifier's failure: the package directory resolved
to ordinary AppData, while a contained model file resolved to the hosting Codex
MSIX LocalCache tree. The native canonical-path containment guard rejected it.
File counts, manifest/runtime/model hashes, sizes and modification dates did
not explain the rejection.

This repeats the documented
[host-context issue](../desktop-ui-logic-readability/host-context-recovery.md).
An escalated tool process can still inherit this path redirection. A hidden,
supervised ordinary local PowerShell process created through WMI resolves the
manifest, interpreter and model beneath the same canonical package directory.
Its final-path observations are captured before the model gate. No production
verification rule, model, package installation or persistent setting is changed.
No fallback to retained v2, download or scheduled task is introduced.

## Evidence and scope

Raw diagnostics remain in ignored `tmp/evidence/reader-narration-bugfixes/`:
`installed-probe-01.log` isolates tree stamping; `installed-probe-02.log` identifies
the differing canonical roots. `final-path-ordinary-context.json` records the
fresh ordinary-host containment proof. The temporary diagnostic is not a
permanent regression or acceptance substitute; it is removed before final gates.

The recovery itself changes only execution context. Existing package-integrity
regressions and containment rules remain authoritative. Fresh model results and
final independent acceptance must be recorded separately after execution.

The ordinary-host native probe passed full verification (exit 0, 209.78 seconds)
in `installed-probe-ordinary-01.log`. After removing only its added block, the
native test file has no Git diff and all 723 identities in
`final-code-inputs-02.json` match. The previously reviewed production code is
unchanged. `models-03.log` is the fresh unchanged prescribed full-matrix run.

## Separate harness correction after recovery

`models-03.log` accepted the installed optional profile and passed both Piper
language arms. It then failed the new startup-phase observation. The scoped
`chatterbox-phase-01.log` showed native `ready` and UI `playing` while interception
reported no start/preparation. Tauri defines its native `invoke` property as
non-writable; assigning a wrapper silently failed. This was a validation defect,
not an installation or model failure.

The permanent `native-smoke.node-test.mjs` regression uses that same read-only
property descriptor. Before correction it failed with `Native observation
missed: loading` (19 controls pass); after correction all 20 pass. The harness
now reads the native lifecycle directly, requires the same non-null identity in
loading/warming immediately before cancellation, then observes stopped/no-owner
within two seconds and UI cleanup within the shared five-second deadline. It
does not replace native functions. AudioContext creation/closure counting stays
independent. Production source and package-integrity checks are unchanged.

Captures: `readonly-invoke-red.log`, `readonly-invoke-green.log`, `check-04.log`
(exit 0). The updated 723-entry manifest is `final-code-inputs-03.json`; exactly
the native harness and its Node test differ from the previous manifest. The
fresh full acceptance matrix `models-04.log` passed all six arms, exit 0;
see the [real-model receipt](real-model-validation.md).
