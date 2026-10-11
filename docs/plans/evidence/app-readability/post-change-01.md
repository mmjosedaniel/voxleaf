# Validation Report

Report ID: APP-READABILITY-01-POST-CHANGE-01

Target ID: APP-READABILITY-01

Mode: POST-CHANGE

Verdict: FAIL

Environment: local PowerShell outside sandbox, independent GPT-6 Astra high
validator; all nine commands sequentially via `require_escalated`, repository
root, same process-only pnpm 11.15.1/Node 24.20.0 and matched EdgeDriver/WebView2
155.0.4283.45 adaptations as baseline. No configuration changes.

Starting HEAD SHA: `a1c2b467037e91c82aa0354d697704c967bfb5e6`

Ending HEAD SHA: `a1c2b467037e91c82aa0354d697704c967bfb5e6`

Validated paths and identities before commands:

| Path | Exact porcelain | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/src/App.tsx` | ` M apps/desktop/src/App.tsx` | `86196CD91158FB2D9DD190AB8242D3CF2C5CCD952613DB0055C622F7C6A77E5E` | `9b9df05a8c84d54fd7f0e6e88c5151555ad42547` |
| `apps/desktop/src/App.test.tsx` | ` M apps/desktop/src/App.test.tsx` | `57DB837B6D3E73F515AA1AC593E836EADB493897C9CF1104EAB137AA594C5EFB` | `cc13af2f54c4fd0dd062dff90764db6169acf449` |
| `apps/desktop/src/AppPresentation.tsx` | `?? apps/desktop/src/AppPresentation.tsx` | `7D4408711883C3E665569F984D7E43846F6586A8AC4925502006811CF32A3581` | `0bf8f7909c0a5e1104d0f1fa6097d1528514df19` |

Identity recheck: PASS; manifests match, HEAD/branch unchanged, index empty.
`git diff --check` exits 0; new-file whitespace inspection has no diagnostics
(no-index comparison exits 1 for added content).

Commands and outcomes:

| Exact command | Outcome |
| --- | --- |
| `pnpm.cmd run build:packages` | Exit 0 |
| `pnpm.cmd --filter @voxleaf/desktop test` | Exit 1; 596 passed/1 failed; Node phase not reached |
| `pnpm.cmd run format:check:typescript` | Exit 0 |
| `pnpm.cmd run lint:typescript` | Exit 0 |
| `pnpm.cmd run typecheck:typescript` | Exit 0 |
| `pnpm.cmd test:browser` | Exit 0; 7 Chromium tests |
| `pnpm.cmd test:native-startup` | Exit 0; release build and complete native smoke |
| `pnpm.cmd check:portable` | Exit 1; same picker fixture exception |
| `pnpm.cmd check` | Exit 1; same picker fixture exception |

New picker test throws `InvalidStateError: This input element accepts a filename,
which may only be programmatically set to the empty string.` Testing Library
uses the native setter for nonempty `fireEvent.change` target.value, bypassing
the test's own synthetic property. This is a new test-fixture defect, not a
pre-existing failure or demonstrated production defect.

Before aggregate failure, evidence guard/13 tests, applicable formatting/lint/
type stages, generated-contract verification, shared 209 tests and EPUB 651
tests pass. Full `check` also passes both Rust Clippy modes. Desktop Node,
Python/Rust tests and final aggregate builds are not reached (portable excludes
Rust by design). Do not claim those aggregate phases passed.

Diff scope: PASS; 645 changed lines over exactly three source paths; only
acknowledged director documentation outside the unit.

Invariant review: FAIL for complete acceptance because input proof aborts before
empty-selection/replacement/failure assertions. No production regression found:
component scope, stable input placement/DOM, messages/projections, identity,
dismissal, boundary/key/optional props, Settings, selection, preferences,
effects/StrictMode/cleanup/persistence/locators remain intact. Chromium/native
pass. No model/performance claim. Late startup-read completion untested.

Test-integrity review: FAIL; existing assertions intact, seven precedence cases
and later-publication dismissal pass, but picker fixture needs correction.

Privacy/artifact review: PASS; synthetic fixtures, no prohibited/unrelated data.
Raw logs and before/after identities in ignored
`tmp/evidence/app-readability/post-change-01/`, nine numbered command logs.
Non-failing Vite chunk/color warnings persist.

Action required: seed synthetic nonempty value through the existing own-property
mechanism, dispatch empty files without nonempty target.value, preserve all
assertions. Production unchanged. Rerun all nine commands with new Report ID.
This report is immutable; no staging authority.
