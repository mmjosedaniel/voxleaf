# Change Review Report

Review ID: **EFC-R3-20261030**  
Task ID: **EFC**  
Verdict: **APPROVE**

Base commit and reviewed HEAD: `f4e3b585114a1fda0e3bd9e72b8c31a007121d5a`  
Branch: `codex/eight-finding-minimal-corrections`

Reviewed paths and identities: the closed 81-path manifest at `docs/plans/evidence/eight-finding-minimal-corrections/review-R3-identities.md`, including the deleted active plan and new completed plan.

| Artifact | SHA-256 |
| --- | --- |
| Public R3 identity manifest | `df9aaf84b32b3e53a9d0bd8988c69bd7356288af884453f1657319f278754dfd` |
| `tmp/evidence/eight-finding-minimal-corrections/R3-identities.json` | `2e4bf1192fa69de0edfc78dc0b940519533f85f5d476c997ec1cdb3829f021ce` |
| `tmp/evidence/eight-finding-minimal-corrections/R3-complete.diff` | `3c585b35c74192420dd660666a01596e3109462552c31702a2be7cb762c895c5` |

**Identity recheck: PASS.** Before and after review, HEAD and branch remained unchanged and the index was empty. All existing files matched their supplied SHA-256, filter-aware blob and canonical status identities. The old active-plan path remained deleted and the completed-plan path matched its new identity. The stored tracked diff matched the current patch. Only the manifest itself was intentionally outside its closure.

## Acceptance review

**The complete current patch, including the actual documentary archive, is approved.**

The archive preserves the approved requirements, historical failures, correction history, test attribution and limitations. Maintained indexes and incoming testing/ADR links now resolve to the completed plan. R1's requested correction and R2's implementation approval remain distinct, immutable records.

| Criterion | Accepted outcome |
| --- | --- |
| EFC-01 | Bounded, unique visual registrations through same-node ref churn. |
| EFC-02 | Cancelled historical work cannot lazily reload; started work and startup handoffs retain cleanup ownership. |
| EFC-03 | Actual worker completion times and source-ordered waiting remain correct, including the resolved R1-F01 consumer defect. |
| EFC-04 | Pinned sampled-EOS evidence establishes completion; exhaustion or missing evidence fails closed without successful segment publication. |
| EFC-05 | Both internal path validators reject unpaired terminal surrogates while preserving valid pairs. |
| EFC-06 | Effective available-RAM admission/disclosure consistently requires derived 7,042 MiB, preserving the immutable 4,096-MiB package floor and continuation policy. |
| EFC-07 | Successful explicit compatibility recheck reconciles optional state without superseding newer actions or automatically acquiring/activating a model. |
| EFC-08 | Mutable service and regenerated Piper reject integer-conversion failures through bounded protocol cleanup; frozen Chatterbox remains explicitly excluded. |
| M0–M3 | Implementation, selected validation, independent correction review and documentary closeout are complete for the approved scope. |

Privacy, cancellation, bounded-memory, stable-location and persistence conclusions from R2 remain applicable. The archive does not expand implementation or support claims.

## Test evidence and retention decision

**Retain all runtime evidence accepted by EFC-R2-20261030.** This is an explicit current-task retention decision, not a fresh execution claim.

I compared the R2/R3 closed manifests and the complete 1,454-entry R2 documentary-check input inventory against current files. There were **no non-documentation input changes**. Newly discovered paths were confined to the completed plan and review documents. Source, tests, generated artifacts, dependencies and configuration remain unchanged.

Retained evidence comprises:

- 97 EPUB passes.
- 165 selected desktop tests across the disclosed original/corrected runs.
- Unaffected results from the initial 151-test Python selection, plus the fresh 57-test historical-controller/runtime/consumer run accepted in R2.
- One Piper regeneration with offline Spanish/English smokes and passing package/inventory checks.
- Both Rust modes' 25 host-profile and 60 optional-profile passes, preserving two ignored diagnostics per mode.
- Three browser scenarios across the disclosed runs.
- Final native build/smoke and recorded ownership cleanup.
- Applicable passing format, lint and type checks.

Original red and fixture-failure receipts retain their failed outcomes.

Fresh documentary evidence, attributed to the coordinator's **normal local PowerShell execution outside the managed sandbox**:

| Command | Outcome |
| --- | --- |
| `pnpm.cmd check:evidence` | Exit 0; evidence retention check passed. |
| `uv run --project services/tts --locked python tmp/evidence/eight-finding-minimal-corrections/check-doc-links.py` | Exit 0; 440 local targets checked, none missing. |
| `git diff --check` | Exit 0. |

Their receipt hashes match `host-receipts.md`, and their input-manifest hashes match the original receipts. I inspected evidence and identities; **I did not run tests, builds, linters or formatters**.

## Findings

**None.**

## Remaining uncertainty

**No blocking uncertainty within the approved scope.** Real Qwen/dual-worker model benchmarks, Qwen post-seek repair, support promotion, frozen Chatterbox decoder repair, hosted CI, installer lifecycle and live acquisition remain outside the established claims.

## Required next action

**No correction required.** Persist this immutable report outside its reviewed closure. Any subsequent change to reviewed content, paths or HEAD requires a new assessment; do not replace these hashes to renew approval.

This approval completes the independent review gate for the current implementation and archive. It is not a Validation Report and grants no authorization to commit, push, create a PR, merge or publish.
