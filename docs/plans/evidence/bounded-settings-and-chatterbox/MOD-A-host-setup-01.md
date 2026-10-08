# Scoped validation environment setup order

Order ID: MOD-A-HOST-SETUP-01
Purpose: resolve the observed driver/runtime mismatch without source edits or
global tooling replacement, then rerun the unchanged required portfolio command.

Read-only diagnosis after report POST-CHANGE-04 found WebView2 154.0.4258.62 and
configured/PATH EdgeDriver 150.0.4078.83, consistent with failed WebView session
creation. The harness retains only its fixed failure code, not detailed driver
messages. No alternate matching driver was found in existing candidate locations.

The repository CI `.github/workflows/foundation-checks.yml` lines 130-159 documents
msedgedriver-tool at revision 8c4b34f51b45f5cf08013366d703de464ab871d1, download into
a dedicated directory, Microsoft Authenticode verification and process driver
selection. The installed Cargo registry identifies that exact tool revision
(version 0.2.2); no Cargo install or production dependency change is needed.

Authorized validation setup, in local PowerShell outside sandbox:

1. Create a uniquely named temporary test-tool directory under the OS temp root.
2. Run the existing pinned msedgedriver-tool.exe with that directory as cwd.
3. Verify downloaded EdgeDriver exists, matches the installed runtime's required
   version, and has Valid Authenticode with Microsoft Corporation signer; record
   version and SHA-256. Reject an unsigned or mismatched result without executing it.
4. Select that exact driver only through process-local VOXLEAF_EDGE_DRIVER_PATH.
   Preserve the original configured driver, PATH and machine/user environment.
5. Recheck the user-created offline rule and source identities; run unchanged
   `pnpm.cmd test:tts:bilingual-portfolio-exact-host` under a new immutable report.
6. Retain bounded tool output while subsequent gates may need it. Remove only
   verified task-owned temporary tooling after the last dependent gate, checking
   its resolved path before any recursive cleanup. Never delete unrelated temp data.

No WebView2/Windows installation, global driver replacement, firewall mutation,
source/test/harness edit, model download, Git mutation or third source-correction
loop is authorized. This is routine reversible test setup within the user's plan
execution request, not a new product dependency or altered acceptance criterion.
