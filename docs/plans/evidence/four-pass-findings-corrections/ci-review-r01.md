# Change Review Report

Report ID: **FPFC-CI321-CR-R01**  
Task ID: **PR 321 Windows browser smoke follow-up**  
Verdict: **APPROVE**

Base commit and reviewed HEAD: `2fe68f471c692484cb2c132a7f5f651b88994d18`  
Branch: `codex/four-pass-findings-corrections-plan`  
Index: empty.

## Reviewed identities

Closed candidate directory: `tmp/evidence/four-pass-findings-corrections/ci-321/implementation-review/`.

| Artifact | SHA256 |
| --- | --- |
| `manifest.json` | `e121f6c2fa31489037f2e58061aa053729ddb11585996fe551a16411c4dbc197` |
| `patch.diff` | `91c397e42e7b6a52d3f55860d77096b96f03ccae64b8c0f85cb8b8351b3ecd16` |
| `new-files.json` | `9eaee2fcca103b974d0cdb570cc495c65dfbba83dab5f850911960503720647a` |
| `gate-artifacts.json` | `31c3ad5102c8ddec671e3214aae405576fed5dbdc58fb5f7463bccf9d6dd1a29` |

The manifest binds 1,814 paths. The four changed paths are the two browser specifications, findings registry and new `ci-follow-up.md`. The evidence manifest binds 52 artifacts.

Identity recheck: **PASS**. Before/after file hashes, Git blobs, complete changed-path/status set, patch bytes and evidence hashes match. New-file contents match the supplied artifact. HEAD and branch remain unchanged; the index remains empty. Reserved `ci-review-r01.md` and `ci-closeout.md` remain absent.

## Acceptance review

**VF-0066:** The original specification reproduces the missing `releaseRefill5` callback error. Worklet registration and synthesis reach independent barriers; completion of registration does not establish callback availability. The correction explicitly waits for each callback before invoking it. It preserves the real Worklet path, original underrun, rate transition and source-start observations. With the fifth response held, the test requires buffering, 45 seconds of playable audio and exactly one source start. Releasing the next 15-second response must produce a second start and resumed playback without another underrun. The correction strengthens the insufficient-refill checkpoint.

**VF-0064:** The original unmodified case passed in its first local reproduction. The retained diagnostic delays animation-frame sampling around a trusted End gesture and reproduces maximum scrolling with all text above the viewport and a zero saved anchor. This supports the identified fixture assumption: positive scroll displacement alone does not establish a visible passage for the locator sampler.

The correction uses trusted Page Down to reach visible content and waits for the product’s actual noninitial save. Trusted Home must then produce the start locator before the lifecycle event. Reload/reopen still requires the restoration status, exact persisted locator, equal implicit/explicit RTL caret geometry and the inline-only LTR control. It neither injects saved positions nor changes product sampling. The diagnostic is controlled reproduction evidence, not proof of the hosted runner’s exact scheduling.

No production, contract or frozen-authority changes are present. Historical reports remain unchanged. Registry additions preserve the earlier acceptance history and describe this test follow-up separately.

## Test evidence reviewed

Results are attributed to the coordinator’s **normal local Windows PowerShell 7.6.9**, Node 24.18.0 and pnpm 11.15.1 runs. The reviewer ran no tests, builds, formatters or linters.

- Original hosted Windows output retains **97 passes and two failures**. Original local specifications match the base commit; the diagnostic fixture and failing logs retain their identities.
- `focused-final/` is an **interim one-pass/one-fail invocation**, not a successful final two-case gate. The subsequent RTL focused invocation passed. Both corrected cases pass in the final affected selection.
- The invocation selecting `reader-narration-bugfixes.smoke.spec.ts` and `reader-reflow-restoration.smoke.spec.ts` reports **83 passed**, Playwright exit 0.
- The complementary five-specification invocation reports **16 passed**, exit 0. Together the selections cover the seven configured browser smoke specifications; they are **two invocations**, not one 99-test run.
- Selected Prettier, ESLint and desktop typecheck passed. The supplied evidence-retention, diff and documentary checks passed, including **269 local links**.

The 83-case capture wrapper’s exit 1 remains a recorded failure. Independent comparison confirms its sole inventory difference is Chromium’s generated `debug.log`. Excluding that exact output leaves **17,857 identical input identities**, matching before/after, the complementary invocation and current files. Generated renderer identities also match both invocations and current artifacts. This supports accepting the Playwright result without relabeling the original wrapper outcome.

The inspected closeout helpers restrict verification modes to the frozen candidate and exact reserved additions. Persisted report authenticity still requires comparison against this issued report.

Findings: **None.**

Remaining uncertainty: The updated candidate’s hosted Windows result is not established by this review. Local evidence supports acceptance of the bounded fixture corrections; it does not guarantee every future scheduling outcome.

Required next action: Persist this report unchanged, verify authenticity, and complete the reserved closeout checks and final identity comparison.

**This approval accepts the reviewed test and documentation changes. It is not a Validation Report or authorization to commit, push, publish or create a pull request.**
