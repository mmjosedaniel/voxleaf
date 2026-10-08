# Piper cancellation containment validation

These immutable reports were issued by the reused independent validator.
They establish the bounded unit's initial and focused post-change evidence,
not final integration approval or attribution of earlier host failures.

## Initial Validation Report

Report ID: `PIPER-CANCEL-CONTAINMENT-01-BASELINE-01-20261007`.
Target: `PIPER-CANCEL-CONTAINMENT-01`. Mode: BASELINE. Verdict: PASS.
Starting and ending HEAD: `998c7b24cda7e969e9ed0344f348506bf38af3b0`.
Environment: local PowerShell outside sandbox, `login:false`,
`require_escalated`, process-local Corepack shim PATH.

| Path | Exact porcelain | SHA-256 | Filter-aware expected index blob |
|---|---|---|---|
| `apps/desktop/src/tts/process-client.ts` | `""` | `e960b249e7a7a8ad167021e75274ebecf0184c871b85e2cd767fcab1951266be` | `e896a97d70017213293efd4610717d4847219be8` |
| `apps/desktop/src/tts/process-client.test.ts` | `""` | `7b6fab15b664c82109798cd98e32b49661aa224ad180f15036b78a958133fa95` | `49f6e3e79fdba090a53d7ce2c7efe9ee3bd5df1e` |

Identity recheck: PASS; both paths and HEAD unchanged, index empty before/after.

Commands and results:

1. `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/process-client.test.ts src/tts/product-narration-coordinator.test.ts`: exit 0, two files, 45 tests passed, 13.85 seconds.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`: exit 0.
3. `git diff --cached --quiet`: exit 0, empty index.
4. `git diff --check -- apps/desktop/src/tts/process-client.ts apps/desktop/src/tts/process-client.test.ts`: exit 0.
5. HEAD, exact-path porcelain, SHA-256 and filter-aware Git blob checks matched before/after.

Scope: PASS. Both implementation paths were clean; existing integration edits
elsewhere were preserved. The director's new diagnosis document was outside
this source manifest.

Invariant readiness: PASS. Existing cancellation invalidates work identity,
releases retained audio, and enters cancelling before native invocation;
rejection previously propagated without containment. Existing shutdown validates
control sequence and service identity before establishing stopped state. The
new unit must retain original cancellation errors and refuse restart after
failed containment. The intended repair was not yet implemented or accepted.

Test integrity: PASS. Existing tests passed unchanged, including cancellation
invalidation, late-byte suppression and shutdown/audio handling. Their passing
result does not disprove the separately reproduced interleaving. The validator
did not rerun the ignored probe.

Privacy/artifacts: PASS. No files edited, Git mutations, model execution or
private-data collection. Action: bounded implementation may begin; new
regressions, fresh validation and independent change review remain required.

## Post-change Validation Report

Report ID: `PIPER-CANCEL-CONTAINMENT-01-HOSTVALIDATION-01-20261007`.
Target: `PIPER-CANCEL-CONTAINMENT-01`. Mode: POST-CHANGE. Verdict: PASS.
Starting and ending HEAD: `998c7b24cda7e969e9ed0344f348506bf38af3b0`.
Environment: local PowerShell outside sandbox, `login:false`,
`require_escalated`, process-local Corepack shim PATH. This is focused behavioral
validation, not behavior-preserving refactor acceptance or release approval.

| Path | Exact porcelain | SHA-256 | Filter-aware expected index blob |
|---|---|---|---|
| `apps/desktop/src/tts/process-client.ts` | ` M apps/desktop/src/tts/process-client.ts` | `0c15b34e2035aaafa6816c070d6be36042c2d577373ad4986fd6d8f8380cc493` | `8918e5e0ba238b814c1bdd254ed1af2947f3614e` |
| `apps/desktop/src/tts/process-client.test.ts` | ` M apps/desktop/src/tts/process-client.test.ts` | `e9c78e4038becbe99706e8c7b42f919984c7d61474e2c2f43f4a19ea109e02d2` | `b1676bfc32aa80eb372bbe6d6b08805bffbc0fc9` |

Identity recheck: PASS; both identities match the frozen request, HEAD unchanged,
index empty throughout.

Commands and results:

1. `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/process-client.test.ts src/tts/product-narration-coordinator.test.ts`: exit 0, two files, 51 tests passed, 1.60 seconds.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`: exit 0.
3. `git diff --cached --quiet`: exit 0 before/after.
4. `git diff --check -- apps/desktop/src/tts/process-client.ts apps/desktop/src/tts/process-client.test.ts`: exit 0.
5. HEAD, exact porcelain, SHA-256 and filter-aware blob checks matched before/after.
6. Exact-path numstat: production 18 added/3 deleted, tests 122 added/0 deleted; 143 changed lines, within the 150-line ceiling.

Scope: PASS. Only the two authorized files changed for this unit. Existing
integration edits elsewhere remain preserved and outside this report's scope.

Invariant review: PASS for the bounded repair:

- Scope validation and identity/audio invalidation precede the new handling.
- Only mapped native invalid-state cancellation rejection triggers shutdown.
- The original cancellation error is rethrown, including after shutdown failure.
- Pending, rejected, malformed or wrong-service shutdown cannot authorize restart.
- Successful cancellation, other rejection codes and invalid scopes retain behavior.
- No retries, timers, contract/coordinator changes or speculative stopped assignment.

Test integrity: PASS. Six additional cases cover deferred confirmed containment,
restart refusal while pending, late-audio rejection/zeroing, failed/malformed/
mismatched shutdown, original-error identity, unrelated errors and invalid
scopes. Existing success coverage also prohibits unnecessary shutdown. No
existing assertion was removed. The worker's red run was not repeated or counted
as independent execution evidence.

Privacy/artifacts: PASS. No private content, persisted audio, models, generated
files or dependencies enter the patch. The validator changed no source or Git
state. Action: complete full gates and rebuilt installed journey, then obtain
independent change-review approval for the combined current patch. This report
does not identify the cause of the previous installed failures.
