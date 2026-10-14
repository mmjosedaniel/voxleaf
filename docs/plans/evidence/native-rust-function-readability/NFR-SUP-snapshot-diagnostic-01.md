# Diagnostic report

> **Sanitized publication copy.** Local identifiers and paths are redacted;
> report IDs, outcomes and validation hashes describe the original execution.
> Original SHA-256: `723b4e3d14adf41119299d673e5a0601b4db272f8981cde9f0af5c3d556b9a28`.
> See [publication and original retention](README.md).

Report ID: NFR-SUP-SNAPSHOT-DIAGNOSTIC-20261013-01  
Verdict: BLOCKED before application launch. This is prerequisite investigation,
not a baseline or implementation acceptance report.

The independent validator's cleanup-target backup preparation rejected
canonical containment. A regular runtime file, without a reparse flag, resolved
under `<CODEX_PRIVATE_LOCAL_APP_DATA>/com.voxleaf.desktop`,
while its parent directories retained the ordinary Local AppData spelling.
Logical and explicit physical directory references shared file IDs. No guard
was relaxed. This is consistent with a merged packaged-app filesystem view;
the exact host-context cause still requires a separate diagnostic.

The earlier `NFR-CB-INTEGRITY-20261013-01` receipt established matching sizes and
hashes for 13,089 expected files, including six models, and no observed extra or
reparse entries. It did not canonicalize each file against its root and therefore
does **not** establish native canonical containment. Its original bytes remain
unchanged; this new report records the limitation.

No app session, native invocation, cleanup, uninstall or restoration ran.
No backup files were created. The staging target was absent. Investigation
recorded only bounded metadata, not EPUB, audio or file contents.

The correct current native diagnostic executable is
`apps/desktop/src-tauri/target/release/voxleaf-desktop.exe`, SHA-256
`e5451cbb209126b2c7662375d79dc6e0074c2e10375d99260ae164d1b0e0c14e`,
matching the accepted partial PACKAGE native-startup build. The inspected debug
executable was stale and was not run.

The host PowerShell ancestry passed through Codex and its WindowsApps desktop
package. A Python child returned Windows code 15700 (no package identity), so
that check alone cannot establish an unvirtualized filesystem view. Original
and Codex LocalCache data must both remain protected during further diagnosis.

Raw receipts under
`tmp/evidence/native-rust-function-readability/NFR-SUP-SNAPSHOT-DIAGNOSTIC-20261013-01/`:

| Receipt | SHA-256 |
| --- | --- |
| `containment-preflight.json` | `48327b6d0d1584720aa208f903224f7258c494409c84ae9325e764d850f72e15` |
| `host-context-readonly.json` | `46a1f67a4e770072238aac500f36ebb2628a426c8c8db1a54480adf906acad88` |

Next action requires the Astra advisor's host-context assessment. Do not widen
the containment root or relocate data merely to bypass the check.
