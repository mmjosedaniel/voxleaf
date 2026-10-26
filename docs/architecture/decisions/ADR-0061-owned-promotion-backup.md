# ADR-0061: Own the abandoned Chatterbox promotion backup

## Status

Accepted for implementation on 2026-10-21; implemented and validated on
2026-10-22. Acceptance evidence is in the
[completed correction plan](../../plans/completed/confirmed-logic-bugfixes.md).

## Decision

Extend ADR-0047/0058's exact optional-data ownership to the literal
`tts/cb/.previous` under the validated VoxLeaf product data root. This is a
promotion residue, never an admitted runtime or inference fallback. Discovery
must expose backup-only residue as retained/unavailable optional data. Explicit
in-app removal and optional-data uninstall choices include this one root.

Default silent uninstall and update/repair retain it. Interactive optional
removal remains selected by default, independently of unchecked preferences
removal. No broad `cb` deletion or unrelated version ownership is authorized.

Removal and promotion-time backup cleanup validate containment, ancestors,
root and nested reparse points, retain busy/shutdown/runtime-lock discipline,
and propagate cleanup failure. Missing paths alone are absent; access errors,
unsafe trees and failed deletions cannot establish absence. A failed cleanup
remains discoverable for explicit retry after restart. Promotion retains the
existing transaction/rollback intent and never executes the backup.

The native backup-tree validation uses a maximum nesting depth of 128 and
retains deeper trees with a cleanup error rather than risking unbounded recursion.

## Alternatives and consequences

Ignoring the backup leaves owned data without a removal route. Deleting the
entire parent would affect unrelated versions. Exact residual ownership keeps
cleanup bounded and truthful without adding persistence or a service.
