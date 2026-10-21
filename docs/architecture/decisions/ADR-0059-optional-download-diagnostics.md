# ADR-0059: Keep the last optional-download error in memory

## Status

Accepted on 2026-10-20 with host validation and independent approval in the
[completed diagnostic plan](../../plans/completed/optional-download-diagnostics.md).

## Context

Installed Chatterbox acquisition returned a generic download failure while
Chrome and later native-function probes could start the same download. Native
code discarded the error stage and cause, preventing retrospective diagnosis.
The user authorized a minimal diagnostic improvement and a bounded installed
probe, without repeating the multi-GB acquisition.

## Decision

The acquisition manager retains exactly one typed report independently of its
operation state. Artifact failures replace it; cleanup, retry, successful
transfer and cancellation preserve it. Process exit discards it. Report fields
are schema/app/package version, source and one-based artifact index, stage,
kind, elapsed milliseconds, received/expected bytes, HTTP status, content length
and numeric OS error. Content length is a decimal string to preserve all u64
values across JavaScript IPC. A bounded source-chain walk inspects typed error
metadata only; source strings, URLs, paths and response bodies are never stored.

`optional_chatterbox_download_diagnostic` returns a nullable report through
read-only IPC. Existing operation snapshots/error codes are unchanged. The
renderer validates fields and constructs a closed object before export. Settings
requires an explicit user action to create the JSON download, and reports the
absence of a recorded failure or an export error without altering acquisition.

## Consequences and alternatives

This supports installed troubleshooting without a console, new dependency,
automatic logging, filesystem-write IPC or telemetry. It loses diagnostics on
exit/crash; durable rotating logs would require a separate retention decision.
The report is bounded, not an event history. Typed metadata may identify only
a connection category when the underlying library exposes no numeric OS code;
it must not invent DNS/TLS specificity. Persistent free-form logs and automatic
retry/resume changes are outside this correction.
