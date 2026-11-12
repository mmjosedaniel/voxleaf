# U14 authority transaction preparation

Read-only preparation, not implementation or executed acceptance. Proposed
allowlist is chatterbox_v7_authority.py and test_chatterbox_v7_authority.py;
the CLI caller stays unchanged unless a concrete dependency requires expansion.
Never regenerate the accepted v7 authority to test this case.

Render and validate all three canonical candidates before replacing a target.
Use an owned unique same-volume staging directory, preserving exact originals
and original absence independently. Unreadable originals are not absent.
Register each attempted replacement before making it so catchable interruption
can enter rollback. Restore attempted targets independently in reverse order,
continue peer restoration after a failure, and retain the primary error together
with rollback/cleanup information and the recovery material. An originally absent
target is removed only as owned output. Do not remove the sole original backup.

A successfully committed set is not rolled back merely because cleanup of its
owned stage fails; report that cleanup failure separately. Keep this a bounded
three-file transaction, not a generic framework or claim of power-loss/concurrent
publication atomicity. The core directory-promotion helper is a precedent for
preserving errors and peer rollback, not a compatible abstraction to import.

Meaningful RED uses temporary fixture destinations and intercepts the exact
second/third canonical write, both for the old direct-write implementation and
the new staged replacement. Assert original bytes and presence across the closed
set. First-replacement failure, staging failure, mixed present/absent states,
failed restoration with continued peer rollback, retained recovery, unchanged
neighbor authorities and exact successful canonical bytes are controls.
Existing invalid-publication, drift and CLI tests remain intact.

The focused v7 authority suite is the primary G3 gate. The configured
`pnpm.cmd package:chatterbox-optional:v7:check-acquisition` may verify accepted
authority read-only; it must not rewrite it. Broader caller tests require actual
consumed-input drift or the final integration responsibility. Final core
generation remains scheduled once after this unit's acceptance.
