# Change Review Report

Review ID: **FPA-U11-2.3-CR-R1-20261111**  
Task ID: U11 / 2.3, with renewed ADD-02 assessment  
Verdict: **CHANGES_REQUESTED**  
Base commit and reviewed HEAD: `a3241571944530d468e2f4f2d37a0a2394a8df84`

**Reviewed paths and identities**

The complete 36-path status/SHA-256/blob closure is incorporated from:

`tmp/evidence/five-pass-audit/u11-2.3-review-inputs.txt`

SHA-256: `CA726968841A1FB3B78CE30E308B266FD773D6C9BDF07C55271DCCAC227ADE30`

Exact cumulative diff:

`tmp/evidence/five-pass-audit/u11-2.3-review.diff`

SHA-256: `53F8A88E5F306240E9C2E1FE47C0000C6660BD3D8270D2341BE7B74C9427FAC5`

This contains 3,957 lines across 13 tracked files and five complete new files. New ADR/preparation contents are separately bound by the manifest.

**Identity recheck: PASS**

Snapshots at `2026-11-12T00:01:58.8641807Z` and `00:04:19.5845835Z` matched all 36 reviewed paths and 21 evidence artifacts. HEAD remained unchanged and the index empty. The saved patch matches the current tracked diff and five new-file diffs exactly.

All 456 final test/static inputs match current files. The four paired manifests share SHA-256:

`479F38FB35917F97CD8E4923525C7A675505CD7F428CEBD571D9CA3ECFCD21AA`

All 107 preserved authority identities also match current files and the original frozen manifest.

**Finding F1 — P2: Expired witness can become successful cancellation proof**

File/symbol: `services/tts/benchmarks/isolation.py`, `_witness_batch.announce`, `cancel_witnessed_batch` lines 704–718, and `_terminate_owned_worker`.

Trigger: After the parent’s final deadline/empty-pipe checks, scheduling or invalidation delays cross the shared deadline. The child’s `announce()` then raises `timeout` and leaves the witnessed barrier. If that child remains alive while unwinding or exiting, the parent can still successfully signal and reap it.

Consequence: `_terminate_owned_worker(parked=True)` returns `signalled=True`, and `cancel_witnessed_batch` returns `WitnessedBatchCancellation` without checking whether the deadline or terminal response won during that interval. The runner records `worker-cancelled`; derivation can count this as a passing trial even though the witnessed phase had already timed out. This contradicts ADR-0072’s requirement that timeout cannot manufacture successful cancellation.

Supporting evidence:

- Child barrier expiry raises at lines 127–129.
- Parent checks deadline and pending response only before `invalidate()` at lines 708–712.
- The termination helper establishes that a process was signalled and reaped, not that its witnessed work remained parked.
- Existing tests reject timeout before observing entry and exit before signalling. They do not cover expiry after the final admission check while the child remains alive.

This is a source-established race; its occurrence frequency on the target hardware has not been measured.

Bounded correction criterion: Preserve exact witnessed-phase ownership through cancellation, and reject proof if deadline expiry or a terminal outcome wins. Add a deterministic spawned-child regression that crosses the deadline after the last admission check, retains a live child during timeout unwinding, and verifies that subsequent signal/reap cannot produce successful cancellation proof. Preserve the absolute phase deadline and bounded cleanup.

**Acceptance review**

- **Case 2.3: CHANGES_REQUESTED** for F1.
- **ADD-02: APPROVE for the renewed bounded scope.** Current code and fresh v13/v14 controls preserve early safety observation, exact load ownership, receiver reaping before candidate closure, candidate-before-monitor cleanup, serialized measurement transition and rejection of incomplete output.

Other inspected 2.3 behavior is supported: actual dispatch and publication gates, full private request identity matching, ordered phase/token validation, adapter-entry wording, malformed-output rejection, derived success counters, truthful failed stale-publication evidence, version-owned CPU admission, and preserved legacy derivation/pilot routes.

**Test evidence reviewed**

Attributed normal-host evidence, not checks executed by this reviewer:

- RED01: three behavioral failures. The disclosed out-of-enum runtime error injection does not establish static type validity; the final regression uses valid `AdapterOperationError("invalid-request")`.
- GREEN03: **126/126 passed** across eight suites, including unchanged v4/v13 authority tests and expanded ADD-02 controls.
- Scoped Ruff format/check, mypy, tracked diff check and JSON Prettier checks passed.
- Frozen comparison preserved all 107 original files, with exactly three authorized JSON additions.

Exact commands, timestamps and retained failed attempts are bound by the receipt and evidence manifest. These passing checks do not cover F1.

**Remaining uncertainty**

No hardware performance, model inference or physical-audio acceptance is established. Final Python/static and integrated plan acceptance remain pending. Other campaign units are not renewed by this report.

**Required next action**

Correct F1, supply its normal-host regression evidence and affected passing checks, then request a new review of the exact resulting patch. This report grants no Git authorization.
