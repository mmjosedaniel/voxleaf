# Host cleanup record

Record ID: MOD-HOST-CLEANUP-02-20261006. Director, 2026-10-06.

All cleanup ran in local PowerShell outside the sandbox after model acceptance
and MOD-B SKIP, with no further model-backed gate needed.

- Resolved `tmp/mod-a-host-observer` inside the repository; verified exactly the
  two expected files and their previously recorded SHA-256 identities. Verified
  no Node process used the observer. Removed only this task-owned directory.
- Resolved the exact task-owned driver directory immediately under OS temp;
  verified its recorded driver SHA-256 and absence of processes using that driver.
  Removed only this directory. The global EdgeDriver installation was preserved.
- Invoked an elevated, hidden PowerShell through Windows UAC to remove only
  firewall rule Name `VoxLeaf-MOD-A-Offline`, after checking its exact installed
  interpreter application filter and Outbound/Block identity. The child exited 0.
  A separate parent `Get-NetFirewallRule -Name 'VoxLeaf-MOD-A-Offline'` readback
  confirmed absence. Rules sharing its display name were not targeted.

Commands: `Resolve-Path`, `Get-ChildItem`, `Get-FileHash`, `Get-CimInstance`,
path-scoped `Remove-Item -LiteralPath ... -Recurse -Force`, `Test-Path`,
`Get-NetFirewallRule`, `Get-NetFirewallApplicationFilter`,
`Remove-NetFirewallRule -Name 'VoxLeaf-MOD-A-Offline'`. All completed with exit 0.
No private absolute path or model payload is included in this record.

Repository source, global tools, installed TTS packages/models and user firewall
rules were not changed. No commit, staging, push or PR was performed.
