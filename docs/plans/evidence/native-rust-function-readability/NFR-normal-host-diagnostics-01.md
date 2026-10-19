# Normal-host diagnostics

Report IDs: NFR-CB-HOST-INTEGRITY-20261013-01 and
NFR-SUP-SNAPSHOT-DIAGNOSTIC-20261013-02.  
Independent validator outcome: PASS within diagnostic scope only.

These results do not replace required baseline commands. HEAD remained
`d5ad0427dc58d71bdb678df17454d9412c8488c8`. No source edit, Git mutation,
uninstall, installation repair, root relocation or merge occurred.

Both scripts ran through the verified existing Explorer desktop broker:

```powershell
$nfrShell = New-Object -ComObject Shell.Application
$nfrHwnd = 0
$nfrDesktop = $nfrShell.Windows().FindWindowSW(0,0,8,[ref]$nfrHwnd,1)
$nfrDesktop.Document.Application.ShellExecute(
  'C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe',
  ('-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -File "'+$nfrScript+'"'),
  $PWD.Path,
  'open',
  0
)
```

`$nfrScript` was the corresponding report directory's `launch.ps1`, beneath
`tmp/evidence/native-rust-function-readability/`. Receipts establish actual
Explorer parentage. Protection, snapshot, restoration check and after-integrity
commands all returned zero.

## Ordinary installed-tree integrity

All 13,089 expected files, including six models, matched declared sizes/hashes.
Per-file final handle paths remained canonically contained. The closed file
set matched; no reparse points or observation drift occurred. Current runtime
manifest SHA-256:
`470ec7e8a6fa1e91f9831e42de7988249220b51d4ecd4352452f3c70b2b6084a`.

## Same-process snapshot

Settings was observed first and reported `installed`, with no failure status
text. A direct native snapshot afterward reported `installed`, `failure: null`,
the expected profile and numeric fields. The license summary was a string of
length 80. `release_locked_runtime_enabled` returned `false`.

Executable SHA-256 remained
`e5451cbb209126b2c7662375d79dc6e0074c2e10375d99260ae164d1b0e0c14e`;
driver identities were unchanged. Protected staging, undeclared bytecode and
Numba cleanup targets were absent before and after; no restoration was needed.
The complete after-scan matched every installed file/directory/root/manifest
identity from the preceding scan. Owned application, driver and WebView
processes exited and the owned profile was removed. Final inspection found no
VoxLeaf or driver process.

| Raw receipt | SHA-256 |
| --- | --- |
| Host integrity `integrity.json` | `e55c948ed7919029edb3eb72e20daf772c8b22c3db5865d4f369c8d59d9a8d0c` |
| Snapshot `snapshot.json` | `b63f638982e9413053425b20b02bde47aeaafe0c5e2642548fd544723f8350c8` |
| Snapshot `launcher.json` | `bee8e96a752221ff44dae765649032224e2f20a440777c4b66ea96f89f5c8fab` |
| Snapshot after-scan `integrity.json` | `2fb8a001996c8f29f1ba9a3759d0fd77fa0ee5a3770b328b00be444326f46fd4` |

The inherited-process and Explorer host views differ materially. A complete
fresh SUP baseline in the verified Explorer context is the next acceptance
step. No production correction is indicated by these diagnostic results.
