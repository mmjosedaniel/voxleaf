# Native host prerequisite diagnosis

Independent validator performed read-only diagnosis after POST-CHANGE-001.

- PATH EdgeDriver: 150.0.4078.83.
- Installed WebView2: 155.0.4283.45.
- Existing matched driver:
  `tmp/native-rust-module-organization/webdriver-155.0.4283.45/msedgedriver.exe`.
- Matched driver's live reported version: 155.0.4283.45.
- Authenticode: Valid; Microsoft Corporation.
- SHA-256: DC99C208C10A5364E61C4E5B1341BE492F3224DE753ADB23E973BE97875B1892.
- tauri-driver v2.0.6 verified through Cargo installation metadata;
  `tauri-driver --version` is unsupported (read-only diagnostic, not a gate).
- No remaining voxleaf-desktop, tauri-driver or msedgedriver processes observed.

Director authorized the documented process-local `VOXLEAF_EDGE_DRIVER_PATH`
override to the existing exact driver. No installation, global setting,
repository dependency/source edit or process termination was required.
POST-CHANGE-002 must rerun all seven unchanged commands with new before/after
identities; the prior blocked report remains immutable. Historical hardware
plan evidence supplied a path to inspect, not runtime acceptance for this patch.
