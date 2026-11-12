# Change Review Report

Review ID: **FPA-CI-CR-R1-20261112**  
Task ID: PR #312 audit-policy and native image-harness CI repair  
Verdict: **APPROVE**

Base commit and reviewed HEAD: `e859c64b4f6880ca13119af82fea73368d8b252c`  
Branch: `codex/five-pass-audit-plan`  
Index: empty.

**Reviewed paths and identities**

This report incorporates the closed 18-path manifest:

`tmp/evidence/five-pass-audit/ci-follow-up/review-input-r1.json`  
SHA-256: `FCE24B864792CF97D28040BAF3E9E436B68AB32E160E84F96F4891C18A05B235`

The five task-owned paths are:

- `services/tts/release/audit-policy.json`
- `apps/desktop/scripts/native-smoke/reader-scenarios.mjs`
- `apps/desktop/scripts/native-smoke.node-test.mjs`
- `docs/development/dependencies.md`
- `docs/plans/evidence/five-pass-audit/ci-follow-up.md`

The complete tracked diff matches `review-r1.diff`, SHA-256 `993AD2C564E3E0BD1B2809718FC9F48DD2C98E5D2C9D2C41D2A5576728BABB5E`. The manifest binds the new receipt’s complete contents separately.

**Identity recheck: PASS**

Initial comparison completed at `2026-11-12T13:18:22.6803901Z`; final path comparison completed at `2026-11-12T13:22:47.9749031Z`.

HEAD, branch, empty index, exact five-path change membership, all reviewed SHA-256/filter-aware blob identities and tracked diff matched. The 96 inspected evidence artifacts remained unchanged during review.

**Acceptance review**

The audit correction adds exactly the new `rustix 1.1.4` informational warning. The seven preceding tuples, vulnerability rejection, complete warning/reachability equality and Python blind spots remain unchanged.

I independently compared the retained RustSec output, Windows dependency tree and policy. They agree: zero vulnerability-category findings, eight informational notices, five Windows-reachable, and no rustix in the selected locked Windows normal/build graph. The upstream notice describes genuine unsoundness; non-reachability does not establish safety for other targets. [RustSec advisory](https://rustsec.org/advisories/RUSTSEC-2026-0486.html)

Keeping the existing inventory checkpoint date is justified: the generator consumes that date and tool versions, while the current advisory assessment is separately dated. Inventory verification passes without changing locks, dependency versions or packaged authorities.

The native correction establishes the missing harness precondition: a ready reader, target placement through its scroll owner, and positive viewport intersection before decoding. Placement and decoding share the existing per-visit deadline. No timeout increase, retry or product-source change is introduced.

All twelve visits, the eight-source capacity bound, offscreen retirement, fresh-source revisit and zero-resource cleanup assertions remain. Failure diagnostics preserve the original exception and exclude publication text and source URLs.

The original CI geometry establishes an offscreen target at failure. It does not establish whether initial scrolling or later movement caused that condition, nor a production image-loader defect.

**Evidence reviewed**

These are attributed normal-host executions; this reviewer ran no tests.

| Command/check | Result |
|---|---|
| `pnpm.cmd audit:release` | Original warning-set failure preserved; corrected run passes Node, Rust and all three Python graphs |
| `pnpm.cmd inventory:release:check` | Pass; inventory remains current |
| `uv run --project services/tts --locked pytest services/tts/tests/test_release_dependency_graphs.py` | 26 passed; cache-write warning retained |
| Policy JSON Prettier check | Pass |
| `node --test --test-name-pattern=RPI-CI.*image apps/desktop/scripts/native-smoke.node-test.mjs` | Four retained regression cases fail before correction and pass afterward |
| `pnpm.cmd test:native-smoke-harness` | 57 passed |
| Scoped harness Prettier, ESLint and diff checks | Pass |
| `pnpm.cmd check:evidence` and final `git diff --check` | Pass |
| `pnpm.cmd test:native-startup` | Pass, `13:16:07–13:17:03Z`, including full startup, image/navigation, protocol/cancellation, restart and cleanup coverage |

The RED and GREEN test bytes differ. After RED, the implementer added readiness/root-membership and shared-budget assertions and formatted the test file. The original discriminating assertions remain. The retained RED failures support those four original cases; they are not represented as a run of the final test bytes. Final focused GREEN, full harness and native startup bind the final source.

I checked matching native source/dependency/export/core-environment captures and current consumed-file identities, including optional-dependency absence records. The harness input/export pairs also match. Declared host restoration and adjacent-core restoration are separately verified; their private inventories are not reproduced here.

**Findings:** None.

**Remaining uncertainty and required next action**

The exact local patch is approved. **Fresh remote Windows CI remains required before declaring the CI follow-up complete.** Local WebView2 differs from the original runner, so the local pass does not establish a remote pass.

No fresh model-inference or installer-lifecycle result is claimed. Piper preflight was configuration-only.

This report is not a Validation Report and grants no staging, commit, push, PR, merge, signing or publication permission.
