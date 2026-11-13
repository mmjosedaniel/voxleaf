# Change Review Report

Review ID: **CFR-CR-CI314-R01-20261113**  
Task ID: **CFR-CI314-R01**  
Verdict: **APPROVE**  
Base commit and reviewed HEAD: **bc7451e2c1429833a2cea4bea9375a461e689d1c**  
Branch: **codex/chat-findings-20261112-plan**

**Reviewed paths and identities**

Scope: the five-path follow-up patch, all 18 entries in `tmp/evidence/chat-findings-recovery/ci314-review-r01/manifest.json`, and the two unchanged supporting paths below.

| Artifact | SHA-256 |
|---|---|
| `manifest.json` | `7f891baf63e72592117ae46b08be7e375b04e1a463f98c6ed1c92b8577cd7132` |
| `patch.diff` | `e423f5d1e88acccb7df4d6328065f60f6099b04c42bf53054a45244b088b81a8` |
| `evidence-hashes.json` | `8cc04572b336496c808be5e8ec25d83b641b3633a2aa83802611a9749a791ec7` |

Supplemental paths, both clean and matching HEAD:

```text
AGENTS.md
SHA-256: b2c6b7baca13b2345265410fe3947b4c20f2fc3064ba00e83e10c64895b0b424
Filtered blob: c06bfb24454caf9e9a7af6820425f627d9ff3b4e

apps/desktop/src/tts/product-narration-coordinator.ts
SHA-256: 22e7a863c4f1a48b970f2b3247219d7e7267c5bff7fad498b84016fc88b9f888
Filtered blob: cfc01930063a6b93d00a1e8edf6f5fa76605081c
```

**Identity recheck: PASS**

Initial and final checks matched HEAD, branch, empty index, and every reviewed status/SHA-256/filter-aware blob. No changed paths existed outside the manifest. The complete current diff and new documentary file matched the supplied copies. All 36 indexed evidence files matched their hashes.

**Acceptance review**

The correction addresses the demonstrated owner conflict: eligible trusted scroll intent cancels only pending `viewport` restoration. Cancellation removes its scheduled alignment and releases its visual-tracker suspension without publishing a restoration result or assigning a locator.

Explicit `preference` and `restoration` transactions retain their settlement. Subsequent viewport observation remains operational. Recovery still requires actual displacement, measured visible geometry and the existing placement/session guards; intent alone cannot enable unavailable playback. The narrator’s paused checkpoint and Resume behavior remain unchanged.

The three added unit cases discriminate cancellation from settlement and preserve both explicit transaction types. The original browser regression is byte-identical to base and still requires focused-article PageDown, actual scroll movement, enabled Play and preparation from a nonzero visible offset. Existing browser controls cover paused inspection/Resume, preferences, restoration and synthetic-scroll arbitration. No acceptance assertions were weakened.

**Host evidence reviewed**

Results are attributed to supplied normal-host PowerShell executions; I ran no tests or builds.

- Baseline: unchanged regression failed **1/5** repetitions.
- Diagnostic run: **4/10** failures, showing native movement opposed by programmatic alignment.
- Corrected regression: **10/10 passed**.
- Full browser suite: **92 passed**, retries unchanged at zero.
- Desktop Vitest: **1,318 passed** across 61 files; Node tooling: **240 passed**.
- TypeScript checks, lint and formatting: exit **0**.
- Evidence guard and diff whitespace check: exit **0**.

Exact commands and receipts are bound by the evidence index and documented in `ci-follow-up.md`. Runtime/test inputs match the reviewed patch. Subsequent product-document changes are covered by the documentary receipt.

Independent comparison of the full-browser captures found exactly one difference: Chromium’s generated `debug.log`. Executable, dependency and source inputs were unchanged; original captures remain intact.

**Findings: none.**

**Remaining uncertainty**

Fresh packaged WebView2 startup and the pushed revision’s foundation checks remain pending CI. No previous packaged executable result is reused for this UI change. This approval does not claim that the new remote CI run has passed.

**Required next action**

Persist this immutable report outside its manifest, recheck identities for the authorized Git handoff, and require fresh CI results before declaring the PR failure resolved. No additional code correction is required by this review.
