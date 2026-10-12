# Validation Report: isolated repeatability diagnostic

Report ID: APPS-NATIVE-01-DIAGNOSTIC-01

Target ID: APPS-NATIVE-01. Mode: POST-CHANGE. Verdict: BLOCKED for full acceptance.
Environment: local PowerShell outside sandbox; PowerShell 7.6.5, Node 24.20.0,
existing models and unchanged process-only offline configuration.

Starting and ending HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`.
Validated paths: the exact closed six-file manifest in
[APPS-NATIVE-01-POST-02](APPS-NATIVE-01-post-02.md). Fresh before/after porcelain,
SHA-256 and filter-aware blob identities matched that immutable manifest
exactly; index remained empty. Identity recheck: PASS.

Command:

`node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en`

Result: exit 0, 2026-10-12 19:13:50Z through 19:16:49Z. Seek restart 10,276 ms;
quick audible 4,776 ms / 27,589 ms lead; stable playback 60,092 ms; cancellation
795 ms; prepared start 5,592 ms / 61,215 ms lead. Profile switching and all six
rates passed. Zero underruns, buffering, stale playback, generated audio files,
external requests and retained/discarded cleanup units.

Diff scope, diagnostic invariant, test-integrity and privacy/artifact reviews:
PASS. No source, test, instrumentation, assertion, threshold, timeout, retry,
configuration or Git change. Exactly one isolated invocation. No Chatterbox or
other acceptance command was executed. Raw evidence remains ignored under
`tmp/evidence/apps-organization-follow-up/APPS-NATIVE-01-DIAGNOSTIC-01/`.

The failed POST-02 and this success establish an intermittent outcome on the
same patch. They do not identify its cause or demonstrate a repair. This
diagnostic cannot override POST-02 FAIL or accept the unit.

Action required: a new complete eleven-command acceptance attempt with fresh
before/after identities. Director authorizes that bounded attempt without source
changes; retain all prior failures. A repeat native failure must be reported
as a concrete unresolved acceptance blocker, not retried until green.
