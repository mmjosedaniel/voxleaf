# U11 successor and ownership preparation

Read-only investigation, not implementation or acceptance. Reconfirm identities
and next authority/ADR numbers when U11 starts. At this inspection v14 and
ADR-0072 are available. The active plan already authorizes a required successor.

## Authority decision to freeze before edits

v13 raw cancellation rows inherit v4's closed shape and its derivation counts
passed booleans. Accepted-work phase, actual invalidation and publication proof
therefore need v14. Preserve v4/v13 profile/schema/authority and results, corpus,
selection, candidate locks and product TTS IPC/service. Preserve original load
counts, measured window, thresholds and read compatibility. v14 CPU admission
must accept only its own schema-valid committed qualifying GPU evidence, never
a v13 or partial receipt. No hardware recertification is implied by model-free
tests. Use the v13 authority's hash/checkout/base-environment/schema pattern.

Initial proposed source allowlist under services/tts/benchmarks:
batch_official.py, batch_execution.py, isolation.py, batch_result.py,
batch_cli.py, batch_result_cli.py and new v14_authority.py. Add profile-v14.json
and schemas/short-segment-batch-{raw,summary}-v14.schema.json under benchmarks/tts,
the durable ADR and relevant README. No fixture generator was found; existing
synthetic v13 tests compose the v4 raw fixture and temporary Git authority.
Configured package entries can retain their existing invocation route.

## Case 2.3 proof boundary

Use the real BatchIdentityGate/controller and exact BatchWorkIdentity. Before
dispatch activates then invalidates the gate before an actual candidate call.
During-work proof requires an opt-in private child acceptance/entry handshake
bound to owned _BatchAttempt and call index, under one absolute deadline. Worker
acceptance and candidate method entry are distinct; termination is neither.
Claim adapter entry only unless the qwen3.generate_custom_voice seam is explicitly
added to scope. Expected typed cancellation, matching identity and invalidation
must all hold; unrelated errors, invalid-request, timeout or completion winning
the race cannot become PASS.

After-first-output belongs inside actual publication, after full pair validation
and first append/sequence advancement. Invalidate before the second release
check; retain evidence of first published and second suppressed on stale exit.
The after-complete control uses the existing prepublication seam. Raw evidence
can be closed content-free enums/counters and run-local attempt index; transient
private pipe identifiers need not be persisted. Derive acceptance from validated
proof, not an asserted passed flag or an empty output collection.

The read-only seam inspection identified `Qwen3TtsAdapter.generate_batch` after
request/model/settings validation and immediately before `generate_custom_voice`
as the narrow adapter callback. Name that witness `adapter-entry`; it does not
prove inference entered the engine. Keep the generic candidate signature intact
through an opt-in diagnostic interface and a matching synthetic candidate.
Child-local callbacks must not be pickled or added to product IPC. The worker
first emits accepted identity/call index, then the matching entry witness, with
bounded ordered exchange and rejection of wrong, duplicate or premature phases.

`BoundedOrderedBatchController.execute` already validates the complete pair
before appending units and advancing `_published_sequence`. An opt-in diagnostic
release can append the first unit to the actual published collection, invalidate
through the diagnostic callback, then check the existing identity gate before
the second append. Its partial observation must retain the first published unit;
the existing all-empty failure observation cannot prove this boundary. Ordinary
v4/v13 publication remains atomic. These are implementation directions, not
executed evidence or permission to weaken the unchanged completion controls.

The proposed successor rows replace asserted `passed` with derived proof:
trial/call index, witnessed phase, exact invalidation, typed outcome, observed
publication counts, gate suppression when applicable, and measured timings.
Before dispatch the real dispatch gate rejects the invalidated identity without
a candidate call. Accepted/adapter-entry trials require exact owned cancellation
and reap with no stale publication; they prove containment, not a publication
gate inspecting an output. Their suppression field is null. Pre-publication
and first-publication trials instead witness two and one actual gate rejections,
respectively, with zero and one units published before invalidation. Unobserved
or inapplicable timing/worker fields are null, not fabricated zero measurements.

v14 derivation must require all five ordered cases, reject malformed identities
and phases, and never count unexpected failure, timeout or completion winning
as success. A truthful failed summary can retain a nonzero stale-publication
count. No `not-run` success substitute is needed while incomplete execution
fails closed. Preserve explicit legacy read/derive routes; only prospective
official execution selects v14. CPU admission remains closed until its own
complete qualifying GPU summary is schema/authority valid and hash-identical
in the committed HEAD and worktree. Model-free synthetic admission fixtures do
not establish a real qualifying hardware result.

## ADD-02 memory safety and active load

Start one safety sampler before the first cold factory. Preserve its latched
stop reason while starting/resetting comparable measured accumulators and
framework peak after fifth cold cleanup. Serialize this boundary with sampling
so an in-flight cold sample cannot enter the measured window. Preserve measured
coverage through cancellation and final sample. Check stop before/after factory
handoff, before load/send and every dispatch.

An exact _LoadAttempt(connection) registered under _worker_lock owns load receive
and its completion validation. A narrow owned abort invalidates/reaps that exact
load through _terminate_owned_worker; failed cleanup stays available for exact
retry. Admission must cover launch versus stop so idle abort cannot permit a
late launch. Do not concurrently close the adapter or use generic idle cancel.
Reap the load thread before candidate close, then monitor shutdown; close outer
GPU sampler handles only after shutdown finishes. Existing cleanup aggregation
must retain primary and cleanup failures.

Missing cold rows fail as non-derivable before session output creation. Later
stops retain only genuine completed proof, with explicit skipped outcomes if
the successor admits them, otherwise fail closed. Never fabricate successful
cancellation or automatic CPU eligibility.

## Focused validation and review sequence

Extend tests/test_benchmark_batch_execution.py, test_benchmark_isolation.py,
test_benchmark_batch_official.py, test_benchmark_batch_cli.py and new
test_benchmark_v14_authority.py. Keep existing v4/v13 authority tests unchanged
as compatibility gates. Synthetic child barriers cover accepted/entered phases,
first cold load, measured load, later cancellation load, inter-trial stop,
unexpected exceptions, simultaneous cleanup failures and exactly-once ownership.

ADD-02 can be implemented/reviewed first with safety and load ownership while
preserving measurement authority, followed by 2.3 and exact combined review.
If 2.3 precedes it, keep canonical official v14 routing pending until ADD-02
passes. Each case still needs its own attributed RED/GREEN and independent review.
