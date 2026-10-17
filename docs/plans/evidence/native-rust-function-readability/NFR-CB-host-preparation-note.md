# NFR-CB host preparation correction

The director initially confused the desktop installation in Codex's private
filesystem view with the ordinary Explorer-host installation. The ordinary
program and shortcuts are absent; the private installation exists and must
remain untouched. Ordinary Chatterbox runtime data also exists: its earlier
[integrity/snapshot checks](NFR-normal-host-diagnostics-01.md) do not establish
that the desktop application is installed there.

This mistaken premise caused unnecessary uninstall/restoration preparation.
One attempt stopped on `private-backup-acl-too-broad`; another rejected the
absent ordinary program. Neither attempt copied or moved original data,
uninstalled an application or changed existing permissions. The corrected
procedure preserves program absence, existing registry state and data.

At the maintainer's request, five redundant operational review/preparation
notes were replaced by this summary. Raw local evidence remains retained.
All unit baseline/post reports and actual test results remain unchanged,
including the successful [package/preflight phase](NFR-CB-baseline-03-preparation.md).
Preparatory approvals are not execution evidence; the required installed
journey and complete NFR-CB acceptance remain separate gates.
