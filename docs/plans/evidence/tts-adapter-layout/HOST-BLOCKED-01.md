# Host prerequisite blocker

Target: `TTS-ADAPTER-LAYOUT-01`. Outcome: **BLOCKED before source moves**.
The independent auditor's follow-up target is
`TTS-ADAPTER-LAYOUT-01-FIREWALL-PREREQUISITE` (BLOCKED, zero implementation paths).
The independent deterministic baseline remains PASS.
The independent [host report](HOST-VALIDATION-02.md) separately records the
BLOCKED prerequisite and passing read-only v3 runtime/model integrity.

The [setup instructions](../../../development/setup.md#local-tts-feasibility-preflight)
require an "administrator PowerShell terminal" to create one application-scoped
outbound Block rule for the exact interpreter. Existing host probes also require
that rule to be enabled with display name `VoxLeaf TTS Benchmark Offline`.
Offline environment variables alone do not satisfy the check. The accepted
Audit Packet requires these host prerequisites before moving sources, and the
active plan states: "Missing roles or required host evidence means BLOCKED."

Independent host inspection found enabled Windows Firewall profiles and running
MpsSvc, but no qualifying rule for the current copied Piper runtime, installed
Chatterbox v3 runtime or proposed isolated v4 interpreter. Existing rules for
development interpreters and the release-resource Piper path do not cover those
executables. The host token is not Administrator.

The director attempted the documented narrow creation operation from normal
local PowerShell outside the managed sandbox (`require_escalated`):

```powershell
$taskProgram = (Resolve-Path -LiteralPath 'services/tts/release/core/dist/voxleaf-piper-core-v1/runtime/python.exe').Path
New-NetFirewallRule -Name 'VoxLeaf-TTS-Adapter-Layout-Prerequisite-01a1287d' -DisplayName 'VoxLeaf TTS Benchmark Offline' -Direction Outbound -Action Block -Program $taskProgram -Profile Any -ErrorAction Stop
```

Result: exit 1, `Windows System Error 5,New-NetFirewallRule`, `Acceso denegado.`
The unique-name precheck found no existing task rule; creation failed and
`created=false`. No rule was changed or removed. The attempted operation had
an exact-name cleanup in `finally` for successful creation; it was unnecessary.
Raw result: ignored
`tmp/evidence/tts-adapter-layout/firewall-preparation-capability.json`.
This is a Windows administrator-permission failure, not a sandbox failure or
an automatic approval-review rejection.

## Required recovery

Use an administrator-capable PowerShell session or a prepared validation host.
Create narrowly scoped, enabled, outbound Block rules with the required display
name and `-Profile Any` for these exact interpreter locations:

- Repository `services/tts/release/core/dist/voxleaf-piper-core-v1/runtime/python.exe`.
- The current user's `%LOCALAPPDATA%/com.voxleaf.desktop/tts/cb/3/runtime/python.exe`.
- Repository `services/tts/release/optional/chatterbox/dist/v4/voxleaf-chatterbox-v4/runtime/python.exe`.
- Any separately frozen desktop-runtime copy's exact Piper interpreter, once
  its final location is selected and recorded.

Expand each target to an absolute path. Assign a unique `-Name` to each new
task-owned rule and retain those identities for exact cleanup. Reuse an existing
qualifying exact-program rule without duplicating it. Never remove rules by the
shared display name: unrelated pre-existing rules already use that name. Remove
only rules created for this run after host validation or on failure. Preserve
the existing user installation and data.

The independent validator must recheck rule/program binding, model and payload
prerequisites outside the sandbox. Resolve any further required evidence gaps
before the director issues the approved source order. Do not weaken network
isolation, redirect v4 into a development environment or change published v3
authority to bypass this blocker.

No source worker was started, no adapter moved, no runtime authority refreshed,
and no user installation or firewall state was altered by this execution.

## Follow-up: unattended preparation

The user subsequently authorized the assistant to prepare the three rules while
away from the PC. A read-only host query outside the sandbox confirmed
`EnableLUA=1`, `ConsentPromptBehaviorAdmin=5`, `ConsentPromptBehaviorUser=3`,
`PromptOnSecureDesktop=1` and a non-administrator token. Elevating PowerShell
therefore requires interactive Windows consent or credentials on the secure
desktop; the available session cannot complete that confirmation unattended.
No UAC prompt was left open, no firewall rule was created, and UAC policy was
not changed. The blocker is host privilege, not missing user authorization.
Raw observation: ignored
`tmp/evidence/tts-adapter-layout/unattended-elevation-prerequisite.json`.

## Subsequent elevated preparation

After the user reported difficulty pasting the commands, the director saved
`tmp/evidence/tts-adapter-layout/firewall-setup-02/prepare-firewall.ps1`, checked
its syntax on the host and launched it through `Start-Process -Verb RunAs
-WindowStyle Hidden`. This execution completed successfully. The earlier policy
inspection did not prove that this later interactive elevation would fail.
The script's SHA-256 is
`aa8aac12efd4f6529760729a9e938d8c4fa06f4ed09b0f6715e34668a00be583`.

The adjacent `result.json` records exactly three newly created rules:
`VoxLeaf-Adapter-Layout-Test-0`, `VoxLeaf-Adapter-Layout-Test-1` and
`VoxLeaf-Adapter-Layout-Test-2`, bound respectively to the exact copied Piper,
installed Chatterbox v3 and proposed isolated v4 interpreters. Independent
director host readback confirmed enabled Outbound Block with Profile Any.
No existing rule was replaced. These names must be retained for exact cleanup.
The validator has been asked to issue a new prerequisite report; this historical
BLOCKED receipt and the earlier immutable reports remain unchanged in outcome.
