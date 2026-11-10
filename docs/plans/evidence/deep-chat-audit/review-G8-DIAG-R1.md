# G8 read-only diagnostic report

Review ID: DCR-G8-DIAG-R1-ASTRA-20261109-01
G8 readiness: BLOCKED
Base and reviewed HEAD: d375ecc84261c404e855c055e0ecc8949a97caaf

This is a read-only diagnosis. It does not accept a new patch or replace G12.
No tests, edits or delegation performed by the reviewer. The index was empty;
the inspected runner, helper, tests and client were clean and stable against HEAD.

Observed: G8-piper-r2-result.json records exit 1 after 243.313 seconds, matching
inputs. The log records six-rate behavioral success followed by
`native-cleanup-failed,native-process-ownership-unverified`. Recovery evidence
establishes remaining exact-owned Tauri and Edge drivers and subsequent host
restoration. The intermediate summary preceded runNativeOperation cleanup.
Manual recovery does not turn that run into PASS. The stale adjacent resource
correction explains the authorized retry, not the cleanup failure.

Confirmed code weakness, medium severity: cleanupNativeRun in
native-startup-smoke.mjs puts terminateOwnedProcesses and stopChild in the same
try. A termination-helper rejection skips the independent child stop.
terminateOwnedProcesses in resource-observation.mjs stops its depth-ordered
loop on the first process exception. Its helper has a 15-second outer timeout
while individual waits can consume five seconds each. An exceptional descendant
can prevent attempts on other already-owned processes and the root. The
retained run cannot establish which helper or operation initiated failure.
Timeout, process-exit race, PID reuse and access denial remain unproven.

Evidence gap: inspectOwnedProcesses maps execution failure and invalid output
to the same generic error. Both cleanup captures, termination and child-exit
assertion map to native-process-ownership-unverified. nativeSmokeFailureCodes
intentionally exposes only fixed codes. Existing SAF-13 tests cover DELETE
failure and capture uncertainty, but do not force termination rejection and
assert independent cleanup continues.

Proposed bounded correction, subject to director authorization and replanning:
own native-startup-smoke.mjs, native-smoke/resource-observation.mjs and
native-smoke.node-test.mjs, plus a new immutable execution receipt and plan
update. First reproduce the confirmed failure path model-free by injecting a
termination failure after capturing a synthetic owned tree and verifying
independent root cleanup is skipped, while preserving error and recovery
directory. Add bounded content-free phase/category diagnostics for pre-DELETE
capture, post-DELETE capture, termination and root stop. Preserve existing
top-level failure codes. Never publish raw stderr, command lines, paths or
arbitrary error text. Continue attempts on independently verified owners after
individual failure within one overall cleanup budget, retaining every failure.
Leave the run failed and retain recovery material whenever ownership or
completion is uncertain. Distinguish absent/exited processes from access and
identity uncertainty. Preserve full creation-tick/executable/ancestry checks.
Do not use process-name/global-PID kill or broad temporary deletion.

Required focused evidence: a real synthetic Windows tree plus unrelated
sentinel, forced termination rejection, one descendant failure while later
verified owners still receive cleanup, no kill on identity mismatch or PID
reuse, sticky capture failure despite successful best-effort cleanup, distinct
bounded diagnostics for helper timeout and malformed output, preservation of
primary and cleanup failures, and retention of uncertain scratch data. Run
the configured native-smoke harness and affected existing client/harness checks
from normal local PowerShell with exact input receipts. These harness checks
need no Piper/model/GPU run. Obtain independent review of any exact patch before
a costly gate attempt.

Retry boundary: no additional Piper run is authorized by this diagnosis. G8
remains failed until a separately approved plan yields a new exact-current
passing aggregate with cleanup and restoration. Independent G9 and G10 can
proceed. G12 stays pending.

Inspected SHA-256 identities:

| Input | SHA-256 |
| --- | --- |
| native-startup-smoke.mjs | 140b62773a50c424ab3b49d2e2d9aee57c3eeb4dff7bd3d3fab08ec9c5a3adf0 |
| resource-observation.mjs | b9bf7956fd6f232c537bc36dfda3260cc505f3c88e6abc8978bec6253ec096b1 |
| native-smoke.node-test.mjs | 6e20171825c5f3f7118088d29975c47859229553f6aa4806a19a408a0c5a38dc |
| native-webdriver-client.mjs | 1e5bb9d331902a09df3540cf5a58ac70c474c2aaf5985fe57d2d4ca0f7beacad |
| G8-piper-r2.log | 6a98023dced811004f6cc4db9f9ffdf7cdd2625561a67ee6a789060120fdba01 |
| G8-piper-r2-result.json | 5892403b00a84d56b4dd52efb82cb6c844cd8692e347e278b1ce83976f59a414 |

Private execution receipts are in `tmp/evidence/deep-chat-audit/M2/`.
This report authorizes neither implementation nor Git mutation.
