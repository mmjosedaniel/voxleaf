# APPROVED WORK ORDER

Order ID: TFR-05-WO-20261019-01. Target: TFR-05 / TFR-BATCH. Risk: high.
Goal: name the EPUB version-specific navigation decision while preserving secure
package validation, rejection precedence and immutable construction.

Allowed files (closed):

- `packages/epub/src/package/package-document.ts`
- `packages/epub/src/package/package-document.test.ts`

Required edits:

1. Introduce same-file private `resolvePackageNavigation(raw: RawPackageDocument,
   manifestById: ReadonlyMap<string, RawManifestItem>): PackageNavigationItem`.
   Move only the current navigation decision, returning validated kind,
   resourceId and path using existing types and narrowing. Call after fallback/
   media-overlay validation and before guide/spine validation. Keep freezing at
   final result assembly. Do not extract spine construction.
2. Add one four-case mixed-invalid table through existing public parsing helpers:
   missing nav plus missing fallback -> broken-reference; missing nav plus
   missing media overlay -> broken-reference; unsupported nav plus missing spine
   idref -> unsupported-resource; EPUB 2 wrong-type NCX plus inventory-present
   undeclared guide target -> unsupported-resource before guide broken-reference.
   Preserve every existing assertion. No exported testing API.

Behavior invariants: identical layout/identifier, manifest indexing, fallback,
overlay, navigation, guide, spine and final assembly order. EPUB 3 still needs
exactly one supported local XHTML nav; EPUB 2 requires spine toc, existing exact
NCX media type, local location and no fallback. Preserve exact error codes and
precedence, content support predicate, metadata/resource/spine ordering, freezing,
every checkpoint/archive/XML operation, bounds, cancellation/deadline, atomic
failure, content-free errors, cleanup and downstream narration/locator behavior.

Coverage map: full TFR-05-AUDIT-20261019-01 map is incorporated. Existing EPUB 2/3
immutable model, navigation rejection tables, no guide fallback, finite fallback
limits, cancellation/shared deadline, transactionality, public cleanup and M005
assertions remain intact. Only the four precedence gaps above justify new tests.

Forbidden: grammar/reference/profile/error-policy changes, guide fallback,
another extraction, casts/assertions bypassing narrowing, public exports or new
contracts/dependencies, checkpoint/limit/cancellation/normalization/locator changes,
generated/frozen/historical files, unrelated cleanup or any Git mutation.
Diff ceiling: two files, 180 added plus removed lines. Stop before exceeding it.

Baseline evidence: TFR-05-BASELINE-20261019-01 PASS, immutable report SHA256
`5ECE9DE3E558DCD31B49E54DB1838FC99167170A657CFFA939970812317F8149`.
Shared pre-edit baseline03 remains distinct. Branch
`codex/typescript-function-readability`, HEAD
`2648617f86fdfd7dddc8dc81fdeabd36942f3c3c`; empty index.

| Clean target | SHA256 | Blob |
| --- | --- | --- |
| `packages/epub/src/package/package-document.ts` | `5CFEB59C2E00C1CFCD9EB3E73C7756D6AA3452CE3B2D7AFC97FFF6889CD5C51D` | `025fb68f75128afecd0d74ef673c1b73e6380bfa` |
| `packages/epub/src/package/package-document.test.ts` | `207341F8CCC743665CBE895309DE08641C68B1E56A14922875B29404952DC141` | `1d558d4fffab0167cdc919d0a44f52d7f03d77cb` |

Carry accepted unstaged TFR-01 (POST-20261019-01 SHA256
`9AAE0BB230282FB16E430CDAAB8CD0C41CC0A71080BD1826EBC4330AF3FCD8C9`)
and TFR-02 (authoritative POST-20261019-02 SHA256
`AF5688054770002FB91173BD2CF696251E4487659BEE05A1426E6410A944A4E1`).
Their validated path identities are incorporated from those reports and the
current baseline manifest. Preserve both patches and director documentation.
TFR-03/04 are independently accepted SKIPs and remain untouched.

Worker checks in order, repository-root normal local PowerShell outside sandbox:
`pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`;
`pnpm.cmd build:packages`; `pnpm.cmd --filter @voxleaf/epub typecheck`;
`pnpm.cmd --filter @voxleaf/epub test`; `git diff --check`.
Use Node 24.18.0 and explicit Corepack shim
`C:/nvm4w/nodejs/node_modules/corepack/shims/pnpm.cmd` (11.15.1),
`COREPACK_ENABLE_NETWORK=0`, per-command paths without global changes.
Capture complete source/discovery/transitive/config/lock/library/tool/environment
and artifacts before/after, durations and outputs under unique ignored
`tmp/evidence/typescript-function-readability/TFR-05-worker-01/`, using existing
efficient capture patterns. Stop on failure, preserve receipts and return control.

Regeneration: existing `build:packages` only; ignored shared/EPUB dist and
tsbuildinfo, existing test caches/results and unique receipts. No package/runtime
rebuild or model/native/browser execution assigned to worker. No manual outputs.

Acceptance commands: the worker checks above plus `pnpm.cmd test:browser` and
`pnpm.cmd test:native-startup`, with existing configured frontend/native builders
and bounded ignored desktop dist, Rust target, browser/test outputs and receipts.
G-FAST precedes preparation; G-BUILD precedes dependent G-EPUB/G-BROWSER/G-NATIVE.
Use ordinary WMI PowerShell for browser/native host checks; capture exact browser,
WebView2/tool/artifact conditions and cleanup. Full consumed source/test/fixture/
config/discovery/lock/tool/environment drift invalidates relevant gates. Only the
independent validator can reuse a gate with complete immutable equivalence proof.
No new G-HOST model measurement applies under plan section 8's unchanged model/
runtime responsibility; do not represent prior runtime results as newly run.

Batch acceptance: after this final source edit, combined browser, G-CROSS
typecheck:typescript/test:typescript and G-FINAL check:portable/check remain
required. Expand current aggregate graphs and deduplicate only proven identical
leaves, retaining exclusive Python/Rust default+release/native/portable requirements.
G-DOCS and exact task-owned firewall restoration remain pending. Qwen model
deferral and all consumed retry budgets remain unchanged; no blind retries or
source correction beyond two bounded loops.

Completion output: frozen Change Packet with immutable receipts. You are not
alone; preserve other work and stop on overlap. Exactly one source writer,
validator idle until handoff, no delegation. No staging, commits, push or PR.
