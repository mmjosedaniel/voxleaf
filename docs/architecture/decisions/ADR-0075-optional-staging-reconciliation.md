# ADR-0075: Optional Chatterbox staging reconciliation

Application startup and an explicit Check can reconcile abandoned Chatterbox
staging. Ordinary snapshots remain read-only. Reconciliation holds the runtime
and operation locks in that order, checks for active ownership and verifies the
managed directory chain before removal.

This operation removes only staging. The active package, versions, cache and
promotion backup keep their existing ownership. The separate post-commit
cleanup path still requires an exact runtime receipt. A lock or ambiguous path
reports a recoverable cleanup failure while the reader and Piper can start.
