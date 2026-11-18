"""Nonblocking process ownership for one disposable quality session."""

from __future__ import annotations

import errno
import os
import stat
import sys
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

from benchmarks.quality_scoring import QualitySessionError


def _acquire(descriptor: int) -> None:
    if sys.platform == "win32":
        import msvcrt

        # Locking beyond EOF permits a content-free, zero-byte coordination file.
        msvcrt.locking(descriptor, msvcrt.LK_NBLCK, 1)
    else:
        import fcntl

        fcntl.flock(descriptor, fcntl.LOCK_EX | fcntl.LOCK_NB)


@contextmanager
def quality_operation(session: Path, *, require_session: bool = True) -> Iterator[None]:
    """Reject overlap; close/process exit releases ownership without a stale lock.

    Callers pass their validated session path. The zero-byte sibling is retained:
    unlinking it could let two processes lock different file identities. Keeping
    it outside the session also permits private-session removal while owned.
    """

    path = session.parent / f".{session.name}.operation.lock"
    flags = os.O_RDWR | getattr(os, "O_NOFOLLOW", 0)
    try:
        try:
            existing = path.lstat()
        except FileNotFoundError:
            existing = None
        # Windows CRT exclusive creation can still follow a dangling link.
        # Reject a preexisting unsafe entry before any potentially creating open.
        if existing is not None and (
            not stat.S_ISREG(existing.st_mode)
            or getattr(existing, "st_file_attributes", 0)
            & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0x400)
        ):
            raise QualitySessionError("session-lock")
        try:
            descriptor = os.open(path, flags | os.O_CREAT | os.O_EXCL, 0o600)
        except FileExistsError:
            # Never create a referent through an existing entry on Windows,
            # where O_NOFOLLOW is unavailable. Validate its identity below.
            descriptor = os.open(path, flags)
    except OSError:
        raise QualitySessionError("session-lock") from None
    try:
        try:
            opened = os.fstat(descriptor)
            current = path.lstat()
            if (
                not stat.S_ISREG(current.st_mode)
                or getattr(current, "st_file_attributes", 0)
                & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0x400)
                or opened.st_size != 0
                or opened.st_nlink != 1
                or not os.path.samestat(opened, current)
            ):
                raise QualitySessionError("session-lock")
            _acquire(descriptor)
        except OSError as error:
            code = "session-busy" if error.errno in (errno.EACCES, errno.EAGAIN) else "session-lock"
            raise QualitySessionError(code) from None
        if require_session and not session.is_dir():
            raise QualitySessionError("invalid-session")
        yield
    finally:
        os.close(descriptor)
