# Host-view diagnostic

> **Sanitized publication copy.** Local identifiers and paths are redacted;
> report IDs, outcomes and validation hashes describe the original execution.
> Original SHA-256: `bec39bc9b5a73132a8fec120fff4976974e10240f365e27ebb731a68b69c6dc0`.
> See [publication and original retention](README.md).

Report ID: NFR-HOST-VIEW-DIAGNOSTIC-20261013-01  
Outcome: PASS for the bounded read-only host-view probe, not runtime acceptance.

Normal PowerShell was launched through the existing Explorer desktop broker,
using `Shell.Application.Windows().FindWindowSW(0,0,8,[ref]$hwnd,1)` and its
`Document.Application.ShellExecute` method with a reviewed script, hidden window,
`-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -File` arguments.
The script wrote only its new ignored diagnostic receipt. It launched no
VoxLeaf process and changed no application data, registration or configuration.

PowerShell ancestry was independently verified as Explorer-launched; concrete process IDs remain in the local original.
The probe completed in 0.85 seconds. PowerShell and its Python child both saw
distinct ordinary and explicit Codex LocalCache trees. Five requested samples
per tree (tts root, cb/3, runtime manifest, one runtime extension and one model)
resolved within their respective physical roots, with matching volume/file IDs
between PowerShell and Python and no reparse flags or missing samples.

Ordinary and private-cache file identities were verified; concrete file IDs remain in the local original. Both processes reported no package identity (15700);
the conclusion depends on final handle paths and volume/file identity, not
that package result alone.

Raw evidence under
`tmp/evidence/native-rust-function-readability/NFR-HOST-VIEW-DIAGNOSTIC-20261013-01/`:

| File | SHA-256 |
| --- | --- |
| `probe.ps1` | `6b46057abcffe1a03c5b025e9340029e8788c881cf577803e72353d4cd40f2b7` |
| `receipt.json` | `a8fc7a1bca367706d6db1f2b6d6173414e8de3eaa776edf270cb98fb5e9a0e2f` |

This sample supports a complete ordinary-tree integrity and containment scan
from the same broker context. It does not prove the entire tree is valid or
authorize merging, moving or deleting either installation-data tree.
