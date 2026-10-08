# ADR-0047: Separate Chatterbox retention during uninstall

## Status

Accepted on 2026-08-03.

## Context

[ADR-0042](ADR-0042-freeze-mvp-release-authority.md) and
[`mvp-release-authority-v1`](../mvp-release-authority-v1.md) froze one explicit
application-data choice for Windows uninstall. When this additive decision was
accepted, the implemented NSIS hook therefore preserved all application data by
default and, during interactive uninstall, offered one combined choice that
removed preferences, recovery state, staging, and optional profiles together.

Installed-product review found two problems with that combined choice. A user
cannot remove the large optional Chatterbox package while retaining ordinary
reader state, and intentionally preserved Chatterbox data loses its in-product
management surface after the desktop application is removed. The current
recovery requires reinstalling the same product identity before **Remove
Chatterbox** is available again.

Changing the default of an interactive destructive operation after packaging
results exist requires an additive decision before implementation or new
result-bearing lifecycle measurement. The decision must preserve the frozen
owned-root, privacy, containment, and unrelated-file boundaries.

## Decision

Additively supersede only the combined Windows application-data uninstall
choice in `mvp-release-authority-v1`. All other ADR-0042 release, storage,
cleanup, integrity, privilege, optional-profile, and claim authority remains in
force.

Interactive Windows uninstall presents two independent data classes:

1. **Optional Chatterbox data.** Removal is selected by default. The choice
   appears when exact application-owned optional data exists and covers only the
   Chatterbox runtime/model package, its approved historical package root,
   removable Chatterbox cache, and Chatterbox acquisition staging. The prompt
   explains that removal can reclaim the measured optional-package storage and
   that reinstalling Chatterbox later requires the approved acquisition again.
2. **Preferences and recovery state.** Removal is not selected by default. The
   choice covers only bounded VoxLeaf-owned reader preferences, stable reading
   position, and content-free recovery state. It never discovers or deletes an
   EPUB, generated audio, or unrelated user file.

The user may change either interactive choice independently before confirming
uninstall. If optional data is intentionally retained, the uninstaller explains
that its supported management route is to reinstall the same VoxLeaf product
identity and then use **Remove Chatterbox**. VoxLeaf does not leave a residual
model-manager executable or background service.

Silent uninstall remains non-destructive for both data classes when no removal
option is supplied. `/REMOVE_CHATTERBOX_DATA=1` selects only the optional
Chatterbox class, and `/REMOVE_PREFERENCES_AND_RECOVERY=1` selects only the
preferences/recovery class. Supplying both composes the two exact removals. The
existing explicit `/REMOVE_APP_DATA=1` compatibility option continues to mean
removal of both exact data classes; it must not broaden either deletion root.
An absent option, or a value other than exact `1`, does not authorize removal.

Every mode removes the installer-owned program root. Data removal stays limited
to the exact per-product-identity VoxLeaf roots, preserves unrelated entries,
and must pass automated silent-option coverage plus manual interactive NSIS
validation. This decision does not implement the UI, authorize profile-selection
cancellation, enable Chatterbox for public users, or close any clean-host or
signing gate.

## Consequences

- The ordinary interactive path avoids leaving a multi-gigabyte optional
  package without its management UI, while still allowing deliberate retention.
- Reader preferences and recovery survive ordinary interactive uninstall unless
  the user separately chooses to remove them.
- Unattended uninstall retains its current non-destructive default, and existing
  explicit full-data-removal automation remains compatible.
- NSIS hooks and lifecycle validation must distinguish the two data classes for
  both ordinary VoxLeaf and the separately identified Chatterbox validation
  product.
- Release documentation must distinguish the implemented development-host
  behavior from clean-host interactive acceptance until the remaining manual
  Milestone 6 arm passes.

## Implementation status

M011 Milestone 6A implements the two choices for both the ordinary and isolated
validation identities. Focused desktop tests, static package authority, and an
automated development-host matrix prove repair-time preservation plus six
silent option outcomes. The manual interactive NSIS journey on a normal-user
clean host remains open, so this result does not enable Chatterbox or close the
clean-host and signing gates.

## Alternatives considered

- **Keep one combined data choice.** Rejected because it forces users to choose
  between retaining reader state and reclaiming optional-package storage.
- **Preserve Chatterbox by default during interactive uninstall.** Rejected
  because the application that manages the retained package is being removed;
  deliberate retention remains available as an explicit opt-out.
- **Remove all application data by default.** Rejected because preferences,
  reading position, and recovery state are small, useful across reinstall, and
  logically independent from the optional package.
- **Leave a separate model manager after uninstall.** Rejected because it adds
  another executable and lifecycle surface solely to manage intentionally
  retained data.
