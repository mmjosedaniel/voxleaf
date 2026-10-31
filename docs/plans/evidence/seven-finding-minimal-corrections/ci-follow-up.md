# PR #289 historical v6 fixture correction

Base and tested HEAD: `68d8667e7421732bba5a8d6b16c621760f49c7fb`.
This follow-up preserves the completed ExecPlan and R7-R1/R2/R3 evidence.

## Failure and bounded correction

The [Ubuntu portable job](https://github.com/mmjosedaniel/voxleaf/actions/runs/41148280632/job/124378424037)
failed five Python tests: three v6 authority/adapter cases and two quality-session
cases. Its result was 5 failed, 810 passed and 7 skipped. The frozen v6 profile
correctly rejected the current normalizer after R7-05 changed that implementation.
Local reproduction returned the same five failures and 37 passes.

Tests now materialize the historical authorities in a temporary repository using
the real strict loader. Only the changed normalizer needs an archived fixture;
its 41,860 bytes match authority commit
`9a2f74845853e84635b419a4e65170c9a2c207ee` and SHA-256
`8bee1b480a81a96b105df32cf85eaf65f6e42bae382e152e89adbaa02353db74`.
Other authorities are copied and hash-checked against the unchanged profile.
The fixture is never executed, and tests need no Git history, model or network.
Three negative controls require the loader to reject current, tampered and
missing normalizer bytes. Production code, frozen hashes and historical results
remain unchanged; this does not admit the current normalizer to the v6 evaluation.

## Fresh host checks

All commands below ran in normal local PowerShell outside the managed sandbox
on 2026-10-31 UTC (2026-10-30 local), using Python 3.12.10, uv 0.11.29,
Node 24.18.0 and pnpm 11.15.1. Original logs, input manifests and receipts remain
under ignored `tmp/evidence/seven-finding-minimal-corrections/`.

| Receipt | Exact command | Result |
| --- | --- | --- |
| CI01-before | `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_v6_authority.py services/tts/tests/test_benchmark_quality.py -q` | Exit 1: 5 failed, 37 passed before correction |
| CI02-focused | Same exact command as CI01-before | Exit 0: 45 passed after correction |
| CI03-static | `pnpm.cmd format:check:python && pnpm.cmd lint:python && pnpm.cmd typecheck:python` | Exit 0: 186 files formatted, lint clean, 182 files type-checked |
| CI04-python | `pnpm.cmd test:python` | Exit 0: 825 passed |

The baseline emitted two pytest cache-write warnings; successful runs emitted
one. The existing cache could not update its metadata; collected tests ran and
passed. No retry or environment preparation was used to change a test outcome.
The complete Python run was selected because the shared fixture is loaded from
`conftest.py`; unrelated model, browser, native and build gates were not repeated
locally for this test-only correction. No earlier test result was substituted
for these fresh checks. Existing locked dependencies were used without reinstall.

The original decoded Ubuntu CI log is retained as `CI00-ubuntu-connector.log`.
A separate `gh run view --job ... --log` download could not run while the overall
workflow was still active; the connector's completed-job log supplied the evidence.

## Independent review and hosted status

The immutable CI review report and its closed identities accompany this
follow-up. Review is required because the change corrects historical test input
selection. The report records the exact verdict and evidence independently.
Fresh hosted results for the eventual follow-up commit are reported in
[PR #289](https://github.com/mmjosedaniel/voxleaf/pull/289); this document does not
claim an unexecuted hosted pass. The earlier Piper host-resource limitation in
the completed plan remains outside this test-fixture correction.
