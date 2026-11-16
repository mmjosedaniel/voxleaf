# ADR-0077: Exclusive operations on ready quality sessions

## Status

Accepted for the authorized VF-0082 follow-up. Implementation acceptance is
recorded in the [follow-up plan](../../plans/completed/reader-stop-quality-follow-up.md).

## Context

Quality commands support a sequential maintainer workflow. Overlapping two
corrections can nevertheless pass the same missing-record check and replace an
accepted correction. Locking only publication leaves submission, aggregation,
CPU-fallback derivation and cleanup able to observe or remove partial state.

## Decision

Use one nonblocking OS lock per validated quality session for submission,
correction, aggregation, cleanup and CPU-fallback derivation. Acquire before
reading mutable quality state and retain ownership through invalidation,
publication or removal. Reject competing admission; do not queue or retry it
automatically. Existing sequential validation and immutable result schemas stay
unchanged. Generation and finalization still require sequential operation.

`quality_operation.py` owns a zero-byte sibling named
`.<session-id>.operation.lock` under the existing ignored quality root. It uses
Windows byte-range locking or POSIX `flock`, without a new dependency. Closing
the descriptor, including process termination, releases ownership. The sibling
must remain in place when a session is removed: unlinking a live lock can split
ownership across two file identities. Reject nonempty, linked or reparse lock
files rather than overwriting them. Session IDs already have closed validation.
First creation is exclusive; opening an already-existing entry omits both
creation and truncation flags before the descriptor/path identity checks.
This prevents a preexisting dangling link from creating its unrelated referent
on Windows, where `O_NOFOLLOW` is unavailable.

The library reports `session-busy` for contention and `session-lock` for unsafe
or unavailable coordination. The quality CLI retains its content-free
`invalid-request` envelope and nonzero exit. CPU-fallback derivation reports
`quality-busy` on contention. Finish or stop the current command, then retry the
same operation sequentially; a second accepted correction is still rejected.

## Consequences

Failed admission cannot invalidate the aggregate or replace the winner. Cleanup
still removes private audio and scorecards; one empty coordination file remains
per used session. Do not delete it while any command might own that session.
This adds neither product audio persistence nor a background worker. Native
locking fails closed on unsupported storage. Windows child-process overlap and
termination recovery are locally exercised; POSIX execution is not claimed by
that evidence. Native file-link setup was blocked by the host's privilege;
the accepted [replacement evidence strategy](../../plans/evidence/reader-stop-quality-follow-up/review-r01-evidence-scope.md)
uses controlled link resolution with real target I/O, plus native hardlink and
ordinary-lock controls. Available native link tests remain explicit skips on
this host. Hostile filesystem replacement is not a new supported workflow.

## Alternatives considered

- Exclusive creation alone leaves stale ownership after process death and needs
  a separate recovery protocol.
- Nonreplacing correction publication alone does not protect aggregate reads,
  invalidation, derivation or cleanup.
- Supporting simultaneous successful mutations would expand the sequential
  contract and require a transaction protocol unrelated to this correction.

Native API references: [Windows locking](https://docs.python.org/3/library/msvcrt.html#msvcrt.locking)
and [POSIX flock](https://docs.python.org/3/library/fcntl.html#fcntl.flock).
Creation flags follow the [Windows C runtime contract](https://learn.microsoft.com/en-us/cpp/c-runtime-library/file-constants?view=msvc-170).
