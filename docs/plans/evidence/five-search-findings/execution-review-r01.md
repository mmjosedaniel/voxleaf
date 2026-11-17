# Change Review Report

Review ID: **FSF-EXEC-CR-R01-20261116**  
Task ID: **five-search-findings-minimal-corrections**  
Verdict: **CHANGES_REQUESTED**

Base commit and reviewed HEAD: `6130e2fed61f5d632e3f31c69775d1fa60c97373`  
Branch: `codex/revalidated-findings-execplan`

Reviewed paths and identities: Inherit the **entire closed 1,829-path set**, without delta, from `tmp/evidence/five-search-findings/execution-inputs-r01.json`, record `FSF-EXEC-INPUTS-R01-20261116`, SHA-256 `9d36fa8026e9b8946ba6f534880981e1c77887b95b7dacc79f0e63e2bb218039`. This binds all 32 candidate paths and unchanged supporting inputs by status, SHA-256 and filter-aware Git blob identity.

The complete tracked patch matches `tmp/evidence/five-search-findings/execution-r01.patch`, SHA-256 `42638d6a75da34faa601fb0bca0f75b9098469e3c343080e035ddb17868d5e57`. Both new Markdown files were inspected directly.

Identity recheck: **PASS.** Before and after review, every manifest identity matched; candidate membership was exact, no duplicate entries existed, base/HEAD and branch were unchanged, and the index was empty. Both reserved terminal output paths remained absent. Independent reconstruction also matched the retained Node and Python input inventories: 17,488 and 3,244 entries respectively, with no current differences.

Acceptance review:

- All 19 finding IDs are accounted for. The candidate implements 15 corrections; VF-0077/VF-0091 remain explicitly decision-blocked, VF-0074 remains inconclusive, and VF-0082 remains excluded under the supported sequential contract. The active-plan status accurately preserves those limits.
- The inspected normalization changes preserve typed omissions, source endpoints, conservative prose/language barriers and bounded continuation. The refined long-prefix expectation accommodates the existing profile-specific segment boundary; exact batch and cold-continuation equality remain asserted.
- Busy Remove uses persistent acquisition ownership and retains eligible explicit activation. Terminal Download acknowledgement, strict staging absence, language-map membership, recovery-journal identity, NSIS ancestor checks and diagnostic attribution have distinguishing assertions and relevant continuation controls.
- The shared quality launcher bounds binary output and owns Windows worker cleanup. CustomVoice rollback is limited to the newly owned empty session. GPU prerequisite qualification precedes worker construction and checks the frozen conjunctive gates.
- Two actionable gaps remain in Auto-direction inheritance and combined cold-load/cleanup error reporting, detailed below.
- No EPUB-network, generated-product-audio persistence, playback-contract or dependency expansion was found in the reviewed changes. Auto metadata remains local semantic data. The benchmark work does not establish support for retained development engines.

Test evidence reviewed:

These are **attributed coordinator executions**, not tests run by this reviewer. Exact command arguments, environments, exit statuses, logs and input inventories are retained in each named run’s `environment.json`, `receipt.json`, `output.log`, `before.txt` and `after.txt`. All inspected receipt references matched their files.

| Supplied run | Command family and observed result |
|---|---|
| `g-js-01` | Selected EPUB Vitest union: 534 passed, one new expectation failed. Selected desktop union: 302 passed. The failed composite run is not credited as PASS. |
| `g-epub-02` | Normalizer and public matrix: 424 passed, one profile-specific expectation failed. |
| `refined-final-01` | Public matrix `-t FSF-`: 13 passed, 126 intentionally unselected; full dual-worker command file: 61 passed. Python types/format/lint, EPUB types and TypeScript format/lint passed. |
| `g-node-01` | Three selected Node files: 112 passed, zero skipped. Includes compiled NSIS, actual source-file locking and owned lifecycle fixtures. |
| `g-py-01` | Eleven-file synthetic Python union: 265 passed. The retained pytest cache warning is not a test failure. |
| `g-browser-02` | Selected actual Chromium/reopen cases: four passed. These include the bounded VF-0074 investigation, not its original failing delivery. |
| `g-static-01` | Desktop types and other stated successful checks passed. Its test-import mypy failure was corrected and renewed in `refined-final-01`. |
| `g-package-03` | `package:windows:verified-core` and `package:windows:check` passed. Lifecycle failed on the retained disappearing WebView2 temporary-file race. |
| `g-lifecycle-01` | Unchanged installer: package check and lifecycle passed, including install, first start, repair, default uninstall and six option scenarios. |
| `g-docs-01` | TypeScript/JSON formatting, evidence guard and diff whitespace passed. The earlier evidence-test result remains attributed to the ledger. |

The retained RED attempts and fixture/environment failures were inspected as failed attempts, not acceptance results.

Evidence equivalence record `FSF-EQUIVALENCE-R02-20261116`, SHA-256 `51d7d1a8005ef139bad6d57987066c4e7eefbdde5c0ceb1823724aed2205bc2e`, reconstructs without discrepancy. The existing public-matrix tail is byte-equivalent after newline normalization, SHA-256 `e06ae353d395da135c118ca111389fd8d9509bc1bc8a53d0dc5c2143579bcd5d`. Successful unchanged selections can remain attributed to their original runs; this does not convert either failed whole EPUB run into PASS.

The current installer hash independently matches `6a917dfddd3e46b9a90dd9bbb9db6323cda838c9a14c6f42af2c47c7e1f5c7d0`; the application binary matches `51367e16cbad71a5db315fcb63a10f4c5ddf7d96c7796b3ca8e21771c0243422`. The installer-bound lifecycle receipt matches SHA-256 `a55d66c5eb88a6f2b44fbe880dc7c3bdfdf3ed79d96b534826f31f70cb3b3e96`.

Findings:

1. **P3 — VF-0075: Flattened Auto containers give inherited descendants independent direction.**

   **Owner:** `packages/epub/src/document/xhtml-projector.ts:804`, `consumeBodyElement`/`consumeText`; `apps/desktop/src/reader/SemanticDocument.tsx:117`, `textContextAttributes`.

   **Concrete trigger:** An admitted synthetic document contains:
   ```html
   <html dir="auto"><body><p>א <span dir="auto">א <em>English</em></span></p></body></html>
   ```
   The projector drops the inert `span` while retaining its descendants, as ADR-0007 specifies. Its text and inherited `em` receive the same new Auto scope. Both are then rendered against the paragraph’s older scope, so each receives its own `dir="auto"`.

   **Consequence:** The `em` resolves LTR independently instead of inheriting RTL from the enclosing Auto declaration. Before this patch it inherited the outer RTL direction in this example. An undeclared descendant has effectively become a new declaration. HTML distinguishes element-local Auto resolution from inherited parent direction. [HTML directionality rules](https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute)

   **Supporting evidence:** The default inert-container path retains context but emits no semantic wrapper; `consumeText` and retained inline nodes copy that context. The new renderer comparison recognizes scope differences only against the rendered parent. The added tests exercise retained paragraph/emphasis declarations, not inherited descendants of a flattened Auto container. This is a confirmed source trace; this reviewer did not execute the counterexample.

   **Bounded correction criterion:** Preserve a single logical Auto declaration across flattened admitted containers so inherited descendants retain its resolved direction. Add a public projection/rendering regression and computed-direction assertion for this trigger. Preserve nested explicit overrides, inherited siblings, fixed LTR/RTL, implicit paragraphs, source offsets and reopen behavior. Do not solve this by assigning Auto independently to every descendant.

2. **P3 — VF-0090: A cleanup exception replaces the primary cold-load failure at the CLI boundary.**

   **Owner:** `services/tts/benchmarks/dual_worker_cli.py:580`, `_run`; finalizer at line 791; `main` at line 804.

   **Concrete trigger:** An owned cold runtime fails loading or post-load observation—for example with `resource-limit`—and `runtime.close()` also raises `cleanup-failed`.

   **Consequence:** The finalizer replaces the exception reaching `main`. The CLI emits only the cleanup failure code, losing the original failure from its observable result. Python retains an implicit exception context internally, but `main` neither reports nor preserves that context in its content-free output. This misses the plan’s requirement to preserve the primary error and expose cleanup failure.

   **Supporting evidence:** `ThreadedDualWorkerRuntime.close()` explicitly raises `cleanup-failed` when containment cannot be confirmed. The new regression covers load failures with successful cleanup and an early-close failure followed by successful final cleanup. It does not cover simultaneous observation and cleanup failures, which the original deep assessment specifically requires.

   **Bounded correction criterion:** Preserve the primary failure while separately making unsuccessful cleanup observable through a bounded, content-free mechanism compatible with the existing command contract. Add combined load/observation-plus-cleanup failure coverage through the CLI boundary. Retain explicit ownership before loading, successful early-slot closes, final-worker reuse and failure status when cleanup is uncertain. Do not suppress cleanup failure or claim containment.

Remaining uncertainty:

- Neither new reviewer counterexample was executed during this read-only review.
- VF-0074’s original mounted failing delivery remains unproved.
- VF-0077 and VF-0091 require their prospective contract decisions.
- The earlier WebView2 temporary-file race remains a harness limitation despite the successful unchanged-artifact retry.
- GPU, acoustic, live optional-download, clean-host, interactive, signing and Defender acceptance remain unclaimed.

Required next action: Preserve this report unchanged, reproduce and correct the two findings within their bounded criteria, renew affected host checks and artifact evidence where inputs change, and request a new review with a new immutable identity. Do not refresh this report’s hashes to renew acceptance.

This report is not a Validation Report or permission to commit, push or create a pull request.
