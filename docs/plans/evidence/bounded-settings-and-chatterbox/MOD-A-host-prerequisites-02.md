# Host prerequisite inspection addendum

Report ID: MOD-A-HOST-PREREQUISITES-02
Read-only inspector: refactor_validator, local PowerShell outside sandbox.
This clarifies the resolution of [inspection 01](MOD-A-host-prerequisites-01.md)
without changing that immutable evidence.

The user authorizes plan checks and routine reversible test setup. A temporary
outbound block scoped to the actual interpreter, with a unique rule Name and
finally cleanup of only that rule, would be an appropriate test prerequisite;
it need not alter any existing developer rule, installation or source file.

The actual interpreter is app-local-data/tts/cb/2/runtime/python.exe. Read-only
WindowsPrincipal inspection reports IsInRole(Administrator)=false for this host
PowerShell token. require_escalated escapes the automation sandbox but does not
grant Windows administrator privileges. The documented setup at
[setup.md](../../../development/setup.md) lines 667-685 requires administrator
PowerShell for New-NetFirewallRule. No rule creation or UAC was attempted, no
automatic approval rejection occurred, and no firewall was changed.

Thus the concrete unresolved prerequisite is a privileged local test-setup
session providing the actual installed-interpreter block. The required portfolio
gate remains unrun and blocked. Do not use the documented broad DisplayName
cleanup here: preserve all existing rules and delete only a unique temporary rule.
