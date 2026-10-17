# Validation policy for refactor campaigns

This is the canonical policy for gate selection, evidence reuse, preparation
and retries. The [validation matrix](validation-matrix.md) supplies commands;
the [agent contracts](../../orchestrate-safe-refactor/references/refactor-contracts.md)
own report identity and Git authority. A work order may add required gates,
but cannot silently weaken this policy or an existing acceptance authority.

## Select gates before editing

Separate the **implementation unit** (a cohesive, reviewable change) from the
**integration batch** (bounded units sharing a package or runtime). Record the
batch boundary and a gate table in the ExecPlan or Work Order before edits:

| Field | Required meaning |
| --- | --- |
| Gate ID / invariant | What failure this check can detect |
| Command / environment | Exact existing command, cwd, arguments, runtime and host conditions |
| Timing | Before edits, after each affected unit, or batch/final acceptance |
| Inputs | Source and transitive dependencies, tests/fixtures, config, locks, runner and generated/build inputs |
| Invalidation | Changes or environmental conditions requiring a new execution |
| Evidence | Immutable report/receipt ID, result, duration and reuse decision |

Inspect callers and runtime reachability; directory names, file length and a
"refactor" label do not establish risk. The independent validator approves the
selection. Missing dependency knowledge requires broader coverage.

Before the first baseline, inspect planned mutable source, test and generated
output paths across units. Group shared source, test and versioned generated
deliverable paths (including approved new tracked files) into one cohesive
bounded unit within its ceiling; otherwise stop for a revised scope. Shared
ignored scratch output names alone do not require grouping: isolate mutable
outputs and capture gate/artifact identities under the rules below. This does
not relax clean-path baselines or authorize commits. Unresolved overlap found
after work starts blocks affected units for replanning; preserve existing work
and never construct a retrospective baseline.

Map each invariant to existing tests and assertions, then identify any concrete
coverage gap before proposing new tests. Prefer tests at the public boundary
over tests coupled to private helpers. Extraction alone does not require a new
test when existing assertions cover the invariant. Preserve failure cases,
bounds and contracts; a gap requires an explicit test decision in the order.

| Risk | Typical scope | Minimum evidence |
| --- | --- | --- |
| Low | Pure helper, deterministic maintainer tool, or documentation/configuration | Relevant format/lint/types and focused behavior tests; documentation/configuration parsing and consistency review when no code changes |
| Medium | Shared internal logic or multiple module callers | Low-risk gates plus affected integration/contract tests |
| High | Cancellation, process lifecycle, privacy/security, queue/buffer bounds, synchronization, persistence, protocol, native packaging or runtime/profile selection | Focused gates plus the applicable native, packaged, exact-host, security and/or performance acceptance required by the affected path |

Risk is the highest affected responsibility, not an average. Public-contract or
product behavior changes leave refactor scope and follow their own approved
plan and independent change review. Pure tooling does not trigger real-model
benchmarks solely because it lives under services/tts. Tooling that changes a
runtime, package, verification or cleanup boundary still triggers its gates.

## Unit and batch acceptance

Every unit needs independent pre-change baseline and post-change review, fast
checks and affected behavior tests outside the sandbox. Worker checks catch
cheap failures before handoff; they do not replace independent acceptance.

A shared expensive baseline may cover several declared units only when taken
before the first relevant edit, with identities and coverage for the entire
batch. Reuse it by reference; never label it a newly executed baseline. A later
unit still needs its focused baseline on the state it actually starts from.

For bounded low/medium-risk units, the validator may schedule shared expensive
integration gates once on the combined batch. Declare them pending from the
start and preserve attribution through per-unit tests. High-risk unit gates
must pass before accepting that unit; batching cannot defer those obligations.
A unit PASS means only its declared unit gates passed. It is not batch/final
acceptance. Do not call the campaign complete, offer final approval, or push/open
a PR under final-acceptance authority while required integration or host cleanup
remains pending. User authorization for any Git action remains separate.

## Revalidate changed evidence, not everything by default

Before executing a gate, identify and capture the source, toolchain/library and
environment identities its receipt needs under the proof below. Check receipt
completeness at capture time, not only when later reuse is requested. Do not
invent missing execution-time identities afterwards.

Any HEAD, allowlist or validated-path change invalidates the old report for
staging. The validator must independently review the current diff and issue a
**new immutable report with current identities**. The old PASS is never edited
or rebound. Inside the new report, an individual passing gate may be reused only
when all of the following are demonstrated:

1. Its original host receipt is retrievable and immutable, with exact command,
   outcome, scope and input identities captured at execution time.
2. Every consumed input remains identical: source plus transitive imports,
   tests/fixtures, configuration, lockfiles, tool versions, scripts/runners,
   build inputs and tested artifact bytes. Include directory membership for
   globbed/discovered inputs; a newly added file can invalidate a gate.
3. Relevant environment and isolation assumptions still hold. Treat HEAD as an
   input when version stamping, Git discovery or a runner consumes it.
4. The gate proves the same invariant on the current patch. Record which changed
   paths it does not consume and why; absence from a hand-written list alone
   is not proof of independence.
5. The validator records the original Report ID/gate ID and the current
   dependency comparison. No unknown inputs, failed or missing receipts,
   sandbox-only passes, or unexplained environment drift are allowed.

Rerun affected gates; rerun when independence cannot be established. A change
to tests or the execution harness invalidates the gates they implement even if
production bytes are identical. A documentation edit may retain code evidence
only if that documentation is not a generated/runtime/test input. It still
needs current documentation review and a new report before staging.

Complete worker fast-check receipts from local PowerShell may be reused under
the same proof above. The validator independently reviews their inputs,
environment and results and records the decision in a new immutable report.
A worker receipt alone is not an independent acceptance PASS.

Performance, GPU/model and exact-host evidence must satisfy their original
host/load/driver/cache conditions and freshness requirements. Evidence from
another host or an unrelated campaign does not qualify. Unknown or changed
conditions require a fresh run. Reusing immutable prepared artifacts is a
separate decision from reusing a runtime measurement.

## Preparation and execution

Before launching a gate or after recovering context, inspect its ledger entry.
For RUNNING work, retain the run/attempt ID, active session/job identity, receipt
path and, when applicable, process PID, creation time and executable identity.
Resume or observe a verified active execution; do not duplicate or interrupt it
to obtain another receipt. RUNNING is not passing evidence. If its state or
identity cannot be established, block the affected gate for diagnosis rather
than retrying blindly. Reuse a completed, uninvalidated PASS only through the
validator and the evidence rules above.

For long or interactive stages, record the existing timeout or a diagnostic
threshold, an observable progress signal and its last observation. At the
threshold, inspect the stage and retain process identity, available exit/error
evidence and any pending interaction. A live process alone is not progress.
Continue monitoring only with a recorded reason and next diagnostic point;
unresolved stalls block the gate. Do not automatically relaunch or interrupt
valid work. Any cancellation follows existing ownership and restoration rules;
retry budgets remain unchanged.

Before a costly build or model run, perform the cheap relevant readiness checks:
tool versions and locks, driver/browser compatibility, exact voice/model
artifacts, available disk space, short writable scratch paths, and required
process/firewall permissions. Use existing repository preflight commands when
they cover the gate. Preflight is readiness evidence, never a behavior PASS.

Run assigned format, lint, types and deterministic tests before preparing or
rebuilding expensive packages. Record preparation and execution as separate
phases, with start/end times, elapsed duration and the stage that failed.

Generated outputs may be regenerated only by existing builder commands named
in the approved work order, with a closed output-path list and assigned
post-generation validation. Versioned generated deliverables, including
approved new tracked files, belong to the unit's closed allowlist and baseline
scope. Bounded ignored build outputs instead use declared gate/artifact evidence
paths with content identities for acceptance and reuse; exclude them from the
Git validated-source manifest. Never edit generated files manually or alter
frozen authority, historical evidence or completed plans. Unexpected output
paths block handoff for replanning; preserve unrelated work.

Reuse verified immutable downloads and package payloads only against content
manifests and full build inputs. Keep each candidate's mutable environment,
outputs and receipts isolated. Do not share editable virtual environments,
hard-linked mutable files, or a writable runtime between baseline and candidate.
A matching filename, size or mtime is not integrity evidence. Rebuild only
invalidated artifacts, while still running every required current-state gate.

Use the versioned repository runner for repeated preparation, supervision and
cleanup. If a recurring missing capability is found, approve a bounded runner
change with focused failure-path tests before using it for acceptance. Do not
grow an untested temporary orchestration script during an expensive run.
This policy does not itself implement new runner capabilities.

Keep a recovery journal before any host mutation: run ID, owned resource,
original state, intended change, restoration action and verification. Process
ownership requires PID plus creation time and the relevant executable identity;
a numeric PID alone cannot justify terminating a process. Record task-owned
firewall rules separately and preserve pre-existing user rules. Verify cleanup
after success, failure and interruption. Unverified restoration blocks host
acceptance even if runtime assertions passed.

Use unique run/attempt/gate receipt names and retain failed receipts. Diagnostics
identify the stage and sanitized exception/exit code without book text, audio,
secrets or private data. Put raw captures in ignored tmp/evidence; retain concise
Markdown summaries under the [evidence policy](../../../../docs/development/evidence-retention.md).
Before handing off validation or Git work, retain the full original immutable
report and its receipt references in the declared evidence location outside
validated paths, and confirm the receiving agent can retrieve them. Validators
may create these new evidence files without editing evaluated files or earlier
reports; publication/staging still needs its own authorization. A summary or
assumed chat inheritance is insufficient. For an access-only problem, retrieve
the original first rather than restarting validation; missing proof or input
drift still requires the affected checks under the reuse rules.

## Bounded failure handling

Classify each failure as product regression, pre-existing baseline failure,
environment/preflight, or harness/cleanup failure; retain uncertainty explicitly.
Do not accept an environment or harness failure as a product PASS or silently
discard a real assertion failure.

An infrastructure retry needs a concrete hypothesis and a recorded changed
condition. Allow at most one retry per failed stage in the batch; a second
failure stops that stage for diagnosis and an explicitly revised execution plan.
Never reset the retry budget by renaming the run. Source corrections retain the
orchestrator's maximum of two correction loops before redesign. No "until green"
loops. Time budgets trigger diagnosis, not skipped mandatory gates.

## Aggregate checks and closeout

For production campaigns, retain the applicable package and final gates from
the matrix. Run the final combined gate once after the last relevant edit.
When both check:portable and check are selected, expand their current script
graphs before running them. Deduplicate only identical leaf commands with the
same arguments, inputs, environment and satisfied build dependencies, applying
the reuse rules above. Preserve all exclusive leaves (including native builds,
Rust feature variants and portable build checks) and their dependency order.
If equivalence is uncertain, run the original aggregate commands.

A report using deduplicated leaves lists them individually and maps every
aggregate requirement to its receipt; it must not claim the aggregate command
was executed. CI and protected-branch requirements are not bypassed by local
deduplication. Documentation-only work selects documentation/configuration gates
rather than building the application.

Close with current identities, all applicable gates resolved, cleanup verified,
exact commands actually executed, reused receipt references, and phase timings.
Record observed costs and retry causes; do not claim a measured speedup before
comparing real batches.
