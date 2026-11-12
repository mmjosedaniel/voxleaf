# ADR-0072: Version batch cancellation proof and separate memory safety observation

## Status

Implemented under U11 of the
[five-pass plan](../../plans/completed/five-pass-audit-revalidation-and-corrections.md).
Independent unit review `FPA-U11-2.3-CR-R2-20261111` approved case 2.3 and
renewed ADD-02 after 128 model-free tests passed. Final integrated review
`FPA-INTEGRATED-CR-R1-20261111` approved the implementation and current host
evidence; the unit receipts and immutable reports are linked from the plan.
No v14 hardware measurement or engine-viability result is claimed.

## Context

The frozen v13 raw schema inherits v4's cancellation-trial shape. Current
derivation counts asserted `passed` flags; that shape cannot express the new
requirement to witness accepted work, invalidate its exact identity and observe
the publication gate suppressing obsolete output. Reinterpreting old rows would
change the meaning of historical evidence.

The current official runner also needs safety observation before cold loading
and while later loads are active. Its comparable memory measurement window
must remain distinct from that wider safety window. A stop before required cold
trials finish cannot be represented as a completed measurement.

At this decision, v14 and ADR-0072 are available. The pre-change 107-path frozen
manifest is `tmp/evidence/five-pass-audit/u11-frozen-before.txt`, SHA-256
`FDA5C5050EA7B7CBFF269AFABDADE5F5234AB94C37887B207A76DFCE73F46680`.

## Decision

Create a v14 profile, raw schema, summary schema and version-bound authority for
prospective cancellation-proof semantics. Preserve v4/v13 authorities, profiles,
schemas, results, corpus and candidate locks byte-for-byte. Their existing read
and derivation behavior remains available. New official execution will explicitly
select v14 after both U11 corrections pass; retired official versions must be
rejected before model/preflight acquisition. The v4 mechanics pilot is unchanged.

Cancellation evidence must bind the full existing BatchWorkIdentity, owned
attempt and call index. A private, bounded acceptance/phase exchange may be
added to the existing benchmark child connection. Thread start, elapsed time,
idle acknowledgement and process termination alone are not accepted-work proof.
State only the phase actually witnessed; candidate/adapter entry must not be
reported as entry into the model engine. Product TTS IPC remains unchanged.

Expected typed cancellation, identity invalidation and publication suppression
must agree. Unexpected exceptions, invalid requests, timeout, completion winning
the race or an empty output collection cannot manufacture a successful trial.
After-first-output proof observes a genuinely published first unit and a second
unit suppressed by the actual stale-identity gate. Closed content-free fields
and counters carry proof; no prompt, audio or private path enters public output.
Derivation validates proof instead of trusting a standalone success flag.

Start safety observation before the first cold factory/load and retain its
latched stop reason. Preserve the inherited comparable measurement start after
five cold-load cleanups, thresholds, load counts and finite matrix. Serialize the
transition so a cold sample cannot enter measured accumulators. Check safety
before each new factory, load and dispatch and throughout cancellation trials.

Active load containment must own the exact connection/attempt. Abort and reap
that load before candidate closure; do not race two receivers or use an idle
generation cancellation as load ownership. Candidate cleanup still precedes
monitor shutdown in this runner, retaining primary and cleanup failures. This
does not change v5's different final-sample-before-runtime-close order.

Missing required cold observations are non-derivable before output-session
creation. Never invent successful trials or substitute zero resource values for
missing evidence. Future v14 CPU admission requires its own schema-valid,
committed qualifying GPU result, not v13 or partial evidence. Deterministic tests
may use synthetic authorities and children; they do not recertify hardware.

## Consequences and validation

ADD-02 safety ownership and case 2.3 cancellation proof receive separate RED/GREEN
evidence and independent review. The successor's official route is accepted only
after both are complete. Model-free tests cover cold/measured/cancellation loads,
accepted-work phases, publication boundaries, unexpected failures and exactly-once
cleanup, while unchanged legacy authority tests protect compatibility.

No production dependency, model configuration, benchmark corpus, model-quality
claim, new product process or audio-persistence policy is introduced. Review the
canonical diagram when the private benchmark exchange is implemented and record
its actual boundary without extending product-service claims.

U11 implementation review maps the acceptance/adapter-entry exchange to the
existing isolated benchmark worker connection within `BATCH_PROBE`. It adds no
process, product-service edge, network interaction or persistence owner. The
canonical diagram's feasibility node and rejected historical alternatives remain
accurate, so its topology is unchanged. The new profile/schema version records
prospective proof semantics; it does not reopen the completed feasibility result.
Model-free verification and final acceptance are tracked by the active plan.
