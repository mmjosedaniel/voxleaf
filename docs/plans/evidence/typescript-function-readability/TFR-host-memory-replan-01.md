# Host-memory diagnosis and bounded execution revision

Record ID: TFR-HOST-MEMORY-20261019-01.
HEAD: `2648617f86fdfd7dddc8dc81fdeabd36942f3c3c`.
Candidate: frozen TFR-01-WO-20261019-01, two source/test files, 123 changed lines.
This is an explicit execution revision after diagnosis, not a retry-budget reset
or unit acceptance. No source, runner, frozen authority or threshold change.

## Observed failure

The TFR-01 candidate passed worker checks, independent diff/test review, current
preflights, native startup (60.958 seconds) and lifecycle (15.068 seconds).
Its first Piper Spanish command then exited 1 after 18.741 seconds at profile
selection, before inference: `synchronized-narration-proof-failed`. The requested
Piper profile was compatible, but the required alternate Chatterbox profile was
unavailable for `available-ram`; only Piper appeared selectable for Spanish.
The versioned journey requires the alternate-profile switch, so this is not a
successful partial gate. English and Chatterbox arms did not start.

Registry Chatterbox measured peak RAM is 4,994 MiB. Frozen authority adds the
larger of 25 percent (1,249 MiB rounded up) and 2,048 MiB: the exact requirement
is 7,042 MiB, exceeding its separate 4,096 MiB minimum. The 6,474 MiB registry
values belong to Qwen and do not apply. Current measurements after failure were
approximately 6,420-6,432 MiB available RAM. Available GPU memory was 7,042 MiB,
above Chatterbox's separate 4,668 MiB GPU requirement.

The validator recorded no task native/driver/Python processes or new disposable
profiles after failure. Observed large allocations belong to unrelated running
applications; the director neither terminated them nor changed OS memory policy.
Source/HEAD/index identities remain frozen. Raw failure, cleanup and identity
receipts are in ignored `TFR-01-POST-20261019-01/` under the campaign evidence root.

## Conditional continuation

The user has been asked to close unused applications/tabs and confirm memory
release. That response and actual capacity are prerequisites, not assumed by
elapsed time. No model retry is authorized by an unanswered question.

After confirmation, the validator must record three read-only Windows capacity
observations spaced ten seconds apart, each at least 8,192 MiB available RAM,
with ordinary-host memory semantics and unchanged frozen product requirements.
The extra headroom is a preparation guard, not a product admission change.
Also recheck native/runtime/source identities, process cleanup, isolation and
the actual relevant host conditions. Insufficient capacity keeps the gate blocked.

With those changed conditions demonstrated, the director permits one bounded
recovery execution of the original failed Piper Spanish command, followed by
the original English/Chatterbox commands only on success. No skip, filter change,
alternate-profile bypass, harness rewrite or automatic loop is allowed. Any
further failure stops for diagnosis; preserve all prior attempts and budgets.
The prior baseline's Piper availability retry remains consumed and visible.
This revision addresses a separately diagnosed post-change host-load failure;
it does not relabel earlier failures or grant a fresh general retry allowance.

Only the validator may reuse current native/lifecycle/fast receipts after proving
complete unchanged inputs and that changed free-memory headroom does not invalidate
their required conditions. Repeat affected gates when that proof is unavailable.
Do not rebuild unchanged packages or launch parallel model workloads.

The source worker remains idle; no subsequent unit may start before TFR-01
acceptance. The journaled Chatterbox rule remains retained solely for bounded
campaign continuation. Final or blocked handoff still requires owned-rule removal
and independent verification that all prior rules remain unchanged.
