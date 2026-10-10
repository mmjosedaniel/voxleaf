# Publication-safe derivative

Original record: driver-diagnosis-01.md.
Original SHA-256: 6491414CEFDD6E737F511B73E74827D1D25CB362EAA2B952512F5A2CCEF4EA07.
Prepared 2026-10-10 for the user-authorized public pull request.
The original issued record remains byte-for-byte in ignored local evidence:
tmp/evidence/desktop-source-organization/PUBLICATION-REDACTION-01/originals/driver-diagnosis-01.md.
Only the user-specific WebDriver installation/workspace paths below are replaced
with symbolic user-profile/repository tokens. All commands, outcomes, source
identities, timestamps and original report metadata remain unchanged.
This is a labeled derivative, not the original byte-identical report or a new
validation result. See [publication provenance](publication-provenance-01.md).

---

# Separate read-only host diagnosis

This note follows, and does not revise, immutable Validation Report DESKTOP-SEMANTIC-DOCUMENT-01-POST-CHANGE-01 (BLOCKED).

- Native failure occurred before application assertions: webdriver-session-not-created.
- Inherited VOXLEAF_EDGE_DRIVER_PATH selects <user-profile>/.cargo/bin/msedgedriver.exe, version 150.0.4078.83. PATH selects the same binary.
- Installed WebView2 runtime is 155.0.4283.45 at C:\Program Files (x86)\Microsoft\EdgeWebView\Application\155.0.4283.45\msedgewebview2.exe.
- No VOXLEAF_TAURI_DRIVER_PATH or WEBVIEW2_BROWSER_EXECUTABLE_FOLDER override is present.
- An already-present candidate matches the runtime: <repository>/tmp/native-rust-module-organization/webdriver-155.0.4283.45/msedgedriver.exe.
- Candidate --version returns Microsoft Edge WebDriver 155.0.4283.45 (50f24ef2aa5369a074b8888b7db82d9c0652d642).
- Candidate Authenticode status is Valid; signer CN=Microsoft Corporation, O=Microsoft Corporation, L=Redmond, S=Washington, C=US.
- Candidate SHA-256: DC99C208C10A5364E61C4E5B1341BE492F3224DE753ADB23E973BE97875B1892; size 23,857,024 bytes.
- tauri-driver --version is unsupported and returned usage; no driver version is inferred from that command.

The driver/runtime version mismatch is a concrete host prerequisite defect and a plausible explanation for session creation failure; a successful corrected run is still required. No rerun, download, installation, firewall change, source/harness change, or persistent environment change was performed. The smallest proposed correction is a director-approved process-local VOXLEAF_EDGE_DRIVER_PATH override to this existing signed matching candidate, followed by a fresh full eight-command post-change report and source identity checks.
