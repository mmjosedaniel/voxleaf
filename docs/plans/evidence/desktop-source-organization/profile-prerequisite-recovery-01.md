# Profile prerequisite recovery assessment

Date: 2026-10-10. Director summary of independent read-only auditor findings
and [PIPER-ES-PROFILE-DIAG-01](PIPER-ES-profile-diagnosis-01.md).
HEAD: `ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5`.
This is a recovery decision record, not installation or acceptance evidence.

The authorized host diagnosis confirms that the existing Piper Spanish arm
first clicks Chatterbox, which enters `confirming` instead of activating.
Current optional package `cb/3` is absent; retained `cb/2` is present.
No claim is made about the retained package's integrity or why it remains.

## Supported boundary

- `tts_optional_chatterbox.rs::configure_application_data_root` derives the root
  from Tauri's `app_local_data_dir()/tts`; app identifier is `com.voxleaf.desktop`.
  Current `package_root` appends `cb/3`. There is no supported current
  process-local optional-root override.
- The retired `VOXLEAF_CHATTERBOX_VALIDATION_PACKAGE_ROOT` hook is explicitly
  stripped by the supervisor. The ordinary harness's `--installed-root`
  selects the application executable location, not optional-package data.
- Development interpreter/model variables select a service fallback; they do
  not satisfy `createNarrationSettingsActions(false).selectProfile`, which
  requires `optional.select()` to return `installed` before activation.
- The existing optional-profile consent, acquisition, verification and activation
  workflow is the supported preparation route. Its downloader cleans staging
  and downloads the frozen runtime/model artifacts; no supported local-cache
  import or alternate-root option was found. The documented maintainer builder
  creates release artifacts and is not an end-user installation command.

The auditor observed existing runtime-v3 artifacts at the exact mirror identified
by `tmp/chatterbox-security-refresh/mirror-path.txt`, but not the six model files
under its assembled package root. Those were sandbox presence observations only,
not host integrity/completeness validation. They do not establish a usable
installed package or authorize copying files into application data.

The current tracked `optional-package-manifest-v3.json` declares:

| Quantity | Bytes |
| --- | ---: |
| Download | 8,239,933,601 |
| Installed | 8,236,377,725 |
| Temporary | 13,270,915,278 |
| Minimum free space | 20,000,000,000 |

These are manifest declarations, not newly measured transfer/disk usage.

## Decision

Diagnosis is complete. Preserve the failed baseline and accepted Unit 1.
No source/harness correction is justified by the observed prerequisite failure.
The existing prohibition on downloads and installation changes prevents the
supported recovery. Obtain a separate preparation authorization before any such
action; do not weaken activation assertions, extend deadlines, skip the switch,
or activate retained v2. No firewall change is proposed.

After valid current package preparation, repeat the unchanged required D/H
baseline independently. A prepared installation does not itself prove any model
journey or authorize Unit 2 implementation without that passing evidence.
Unit 3, group F and plan archival remain pending.

Read-only investigation has no patch requiring behavioral change review;
`agentic-change-review.md` explicitly exempts an investigation with no patch.
All actual host diagnostic evidence and limitations are in the linked immutable
report. Temporary logs and scripts remain under ignored `tmp/evidence/`.
