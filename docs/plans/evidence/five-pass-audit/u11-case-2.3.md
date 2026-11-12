# U11 case 2.3: observed cancellation proof and v14 authority

Status: [R2](review-U11-2.3-R2.md) APPROVE for2.3 and renewed ADD-02;
[R1](review-U11-2.3-R1.md) finding F1 resolved. Final integration pending. HEAD remains
`a3241571944530d468e2f4f2d37a0a2394a8df84`, index empty. Scope is eight benchmark
Python production files, six owning tests, three new v14 authority JSON files,
README and ADR-0072. No product-service Qwen code, public TTS IPC, dependency,
model/corpus configuration or frozen v4/v13 authority is changed.

The real controller gates dispatch and, in opt-in diagnostic mode, each unit's
publication. The ordinary atomic batch path remains intact. After-first-output
proof retains one actually published unit and observes rejection of the second
by the same stale-identity gate. Malformed/stale output rejected by shape
validation cannot be reported as a witnessed publication-gate rejection.

The child exchange binds accepted work to full BatchWorkIdentity, call index
and exact owned connection/attempt. Ordered bounded phase exchange separates
worker acceptance from adapter entry. The Qwen callback runs inside its benchmark
adapter after validation and before the model call; it proves adapter entry,
not model inference. Synthetic tests exercise this seam without model weights.
Typed owned cancellation and verified reap are distinct from unexpected failure,
idle cancellation, timeout or completion winning the race.

v14 rows carry closed phases/outcomes, trial/call indexes, observed candidate
calls, invalidation timing, publication/suppression counts and applicable worker
timings. Derivation computes success from these observations; there is no
standalone asserted passed flag. In-flight containment has null gate suppression
because no output reached that gate. Publication trials require actual rejection
counts. Failed evidence can truthfully retain nonzero stale publication counts.
Worker-accepted has zero adapter calls; adapter-entry has one. Unobserved or
inapplicable fields are null rather than invented zero timings.

Prospective official CLI execution requires explicit v14 before acquisition.
The v4 pilot and legacy v4/v13 derivation remain available. CPU admission requires
its own complete qualifying, schema/authority-valid v14 GPU result with identical
committed/worktree bytes; no such hardware result is created by this task.
ADD-02 safety/measurement/cleanup protections remain in force and incomplete
work stays non-derivable. The canonical diagram retains its existing topology;
ADR-0072 records the private benchmark boundary and unchanged historical decisions.

## Reproduction and checks

All checks use normal local PowerShell outside the sandbox, uv0.11.29,
Python3.12.10 and pytest9.1.1. Raw logs and paired expanded manifests are retained
under ignored `tmp/evidence/five-pass-audit/`.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_batch_official.py -k five_pass_2_3
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_batch_official.py services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_batch_cli.py services/tts/tests/test_benchmark_batch_execution.py services/tts/tests/test_benchmark_candidate_adapters.py services/tts/tests/test_benchmark_v14_authority.py services/tts/tests/test_benchmark_v4_authority.py services/tts/tests/test_benchmark_v13_authority.py
```

RED01: three intended failures, nineteen deselected. Existing execution did not
invalidate the actual dispatch gate, could count invalid-request before admission
as successful cancellation, and bypassed actual first-publication/gate behavior.
Before/after449-row SHA-256:
`CCA1811ED0AF50ED577406EA0FDEC328AE7461B268C661DC32B24A374E85CF2D`.
These are behavior assertions on the existing executor, not missing-new-API tests.
The unexpected-error RED used runtime BatchBenchmarkError("invalid-request"),
whose static enum does not include that string. The final regression instead
uses the correctly typed AdapterOperationError("invalid-request"). The defect
was the catch-all treating an arbitrary exception as cancellation success; this
fixture detail is retained rather than describing the old injection as type-valid.

GREEN03, 2026-11-11 23:57:56.971–23:58:18.120 UTC: **126/126 pass**, exit0,
eight suites. Unchanged v4/v13 authority tests protect legacy interpretation;
new v14 authority, real spawned child, controller and adapter tests cover proof
validation. ADD-02 cases additionally run through v14 for cold/measured/trial
load stops and dispatch/inter-trial stops.

Static02, 23:58:21.741–23:58:23.167 UTC: Ruff format/check, mypy across all14
Python paths and the scoped tracked diff check all exit0. The exact expanded
commands are retained in `u11-2.3-static-02.log`; the frozen review manifest
binds every selected path. New JSON formatting occurs before schema/profile
digest pinning, followed by the final authority test rerun.

Preserved diagnostics:

- GREEN01:111/117. Five failures from a misplaced fake-monitor method after
  test insertion; one expectation still named the retired v13 receipt. Restored
  the method and changed only the active receipt version, preserving primary
  and cleanup assertions.
- GREEN02:123/124. One synthetic complete-run fixture passed tuple cold-load
  observations directly to derivation instead of the real CLI's decoded list.
  Corrected the fixture representation.
- Static01: nested-if formatting/lint and four type inference/import errors;
  corrected before the unchanged configured checks passed.
- JSON formatter diagnostics and the preexisting pytest cache-write warning
  remain retained. No accepted historical result is rewritten.

No hardware performance, model inference, physical audio or new viability claim
is established. Final Python/static and integrated plan acceptance remain pending.

## Exact review binding

Final GREEN03/static02 use identical456-row input manifests, SHA-256
`479F38FB35917F97CD8E4923525C7A675505CD7F428CEBD571D9CA3ECFCD21AA`.
GREEN03 log SHA-256:
`C9F671DA068B16BF8F5CAACFE4F7BA236B9670BE4A69F82C7E7A2D97A056B136`.
Static02 log SHA-256:
`13CB5D157F5D9BCCAA2C4E2617B3F17989244C25C42F196D330A20A86F5A9B1A`.

```powershell
pnpm exec prettier --check benchmarks/tts/profile-v14.json benchmarks/tts/schemas/short-segment-batch-raw-v14.schema.json benchmarks/tts/schemas/short-segment-batch-summary-v14.schema.json
```

Host Prettier check, 23:58:58.528–23:58:59.160 UTC, exit0; paired input SHA-256
`EB69D468799CADD9EE94DBEE7043F62FCC2A9116E9324D46BE6C429D52767156`.
The first formatting wrapper failed before formatting because of incompatible
Tee-Object parameters; format02 succeeded before digest repinning and GREEN03.

Frozen comparison, 23:59:21.263–23:59:21.642 UTC, exit0: all107 original files
and membership unchanged, plus exactly the three authorized v14 JSON additions.
Original frozen SHA-256 remains
`FDA5C5050EA7B7CBFF269AFABDADE5F5234AB94C37887B207A76DFCE73F46680`.
The legacy authority tests are unchanged in Git. Five new-file no-index whitespace
checks produced no diagnostics; their difference exit1 is expected, and is not
presented as an ordinary no-difference exit0.

`u11-2.3-review-inputs.txt` binds36 current paths plus evidence, SHA-256
`CA726968841A1FB3B78CE30E308B266FD773D6C9BDF07C55271DCCAC227ADE30`.
`u11-2.3-review.diff` includes the tracked cumulative U11 patch and full five
new-file content, SHA-256
`53F8A88E5F306240E9C2E1FE47C0000C6660BD3D8270D2341BE7B74C9427FAC5`.

## R1 finding F1 and R2 correction

R1 identified a concrete race not covered by GREEN03. The parent checked the
deadline and pipe before invalidation, but could then invalidate after expiry
and kill a child still alive during timeout unwinding. Signal/reap alone did
not prove that the child remained within the witnessed phase.

R2 RED01 uses a real spawned child: it reaches adapter-entry, expires at the
shared deadline, records expiry and remains alive during controlled unwinding.
The parent invalidation callback observes this; old code returns successful
proof instead of raising. Normal-host 00:05:53.859–00:05:55.835 UTC on2026-11-12,
exit1, one intended failure. Its456-row before/after input SHA-256 is
`9FBF3BA8CC590F3B056CFF7BB3D2A037E072966194BAC254E0DAA836E23A86AB`.
RED02 additionally holds actual reap completion beyond the same deadline;
both boundary regressions fail with DID NOT RAISE before production correction.

Only isolation.py and its owning test change for F1. The parent revalidates the
exact parked attempt, deadline and absence of a terminal response before phase
advance and after invalidation before signalling. Successful proof also requires
signal and reap to finish before the unchanged absolute deadline. Late cleanup
remains bounded and cannot become cancellation success. No timeout threshold,
authority meaning or model behavior is relaxed.

R2 GREEN01 passes128/128 across the same eight suites. The prior126-test result
and R1 report remain immutable; they do not claim coverage of the new regression.

R2 RED02, 00:06:30.037–00:06:33.070 UTC: two intended failures,35 deselected,
exit1. Input SHA-256 `2D65195F600B070CA6B9458241ED5C8BFD7FA8C2035FFE41813545000F9B15A6`;
log SHA-256 `088F44D43E0427E9F9E8EF446C5FF120DED4C1E750C726B2DF1D8CB55811330F`.
GREEN, 00:07:16.193–00:07:37.073 UTC, exit0, log SHA-256
`6A6A49239FA07FB539D4FFAF3B81C9B0F783D84908E73F326A56A9428307F5B8`.
Static, 00:07:40.678–00:07:41.697 UTC, all four commands exit0, log SHA-256
`142E0D49492D6C07BCF36EAA5F219C1CD42CAFA60A0A1F16367F5450C1F512CC`.
The456-row final GREEN/static manifests match before/after:
`EFF4E9A547915553282DA3479BE6937B50B99B5ECF2995394DFCB6892DC5A3C1`.

Fresh frozen comparison at00:08:31.564–00:08:31.736 UTC passes107 originals plus
three allowed JSON additions. The legacy authority tests remain Git-clean.
New JSON and formatter inputs are unchanged from R1's final Prettier check;
that exact artifact is supplied for independent reuse assessment.

Closed36-path R2 manifest `u11-2.3-r2-review-inputs.txt` SHA-256:
`DA9B05FC8B77303F7B1757040704985F2F6B8BB7BDA423AD44139011A3FD029D`.
R2 cumulative diff `u11-2.3-r2-review.diff` SHA-256:
`E6FC8A7A2C5993274CDC090D0C85EDD5847D8D001CC1E3754B11C4DBBE262161`.
The R1-to-R2 path comparison finds only the two authorized file changes.
