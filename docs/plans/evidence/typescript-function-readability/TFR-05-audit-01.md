# Audit Packet

Record ID: TFR-05-AUDIT-20261019-01

Target ID: TFR-05 / TFR-BATCH.
Decision: CHANGE. Risk: high (secure EPUB parsing).
Auditor: configured `clean_code_auditor`, GPT-6.1 Sol high, read-only.
Source HEAD: `2648617f86fdfd7dddc8dc81fdeabd36942f3c3c`.

Primary target: `packages/epub/src/package/package-document.ts`,
`buildParsedPackage` navigation selection, lines 1245-1279 at this HEAD.
Related context: complete paired test file; raw/parsed package/navigation types;
package parser, fallback/media validators and content resolver; processing budget;
navigation parser/public opener and integration assertions; ADR-0007/0048 and
completed M005's excluded normalization/locator boundary.

Concrete evidence: package validation/assembly embeds a separate version-specific
navigation decision between named fallback/media-overlay validators and guide/
spine assembly. EPUB 3 chooses one supported local XHTML nav; EPUB 2 resolves
spine toc to exact-type local NCX without fallback. A private resolver returning
the existing navigation type groups its validated fields and names that boundary.
No current parsing defect, unsafe admission or budget violation was demonstrated.

Behavior invariants: preserve layout/identifier, manifest indexing, fallback,
overlay, navigation, guide, spine and immutable-assembly order. Preserve EPUB 3
nav cardinality and malformed/unsupported classification; EPUB 2 required toc,
exact NCX media type, local manifest match and absent fallback. No guide/fallback
substitution or supported-profile expansion. Preserve content support predicate,
metadata/resource/spine ordering, freezing, every checkpoint/archive read/XML
step, cancellation/deadline, transactional failure, content-free errors, cleanup,
exact-byte identity and downstream semantic/locator/narration behavior.

## Coverage map

| Invariant | Existing assertions | Concrete gap / decision |
| --- | --- | --- |
| EPUB 3 immutable result | Deterministic model test asserts XHTML resource/path, spine order, frozen output, no network/worker | Retain. |
| EPUB 2 result/metadata | Both metadata-form cases assert NCX fields and immutable model | Retain. |
| EPUB 3 relationship | Duplicate nav and missing/wrong-media/remote/scripted table | Retain codes. |
| EPUB 2 relationship | Missing toc/ID, wrong/parameterized type, remote/fallback NCX table | Retain exact codes. |
| Earlier fallback/overlay failure | Broken relationships and finite graph tested separately | Add missing nav plus missing fallback and missing nav plus missing overlay; both must remain broken-reference. |
| Navigation before spine | Unsupported spine and broken idref separately | Add unsupported nav plus missing spine idref; unsupported-resource must win. |
| Navigation before guide | Undeclared/non-content guide separately | Add wrong-type EPUB 2 NCX plus inventory-present undeclared guide target; unsupported-resource must win over guide broken-reference. |
| No guide fallback | Missing NCX/valid ignored guide cases | Retain. |
| Bounds/checkpoints | Exact fallback depth, manifest/spine bounds, EPUB 2 cancel, exact shared deadline | No new tests when iterations/checkpoints stay unchanged. |
| Transactionality/protection | Malformed-after-resolution and protected-package cases; helper asserts fixed errors/no cause | Retain. |
| Public cleanup/downstream | Public NCX open/no private paths, malformed NCX close/no publication, frozen navigation/locator/narration | Full EPUB suite retains integration coverage; no normalization expansion. |

Allowed files (closed):

- `packages/epub/src/package/package-document.ts`
- `packages/epub/src/package/package-document.test.ts`

Proposed edits: same-file private
`resolvePackageNavigation(raw: RawPackageDocument, manifestById: ReadonlyMap<string, RawManifestItem>): PackageNavigationItem`.
Move only current navigation decision and return validated kind/resourceId/path.
Call after media-overlay validation and before guide/spine. Keep navigation
freezing at final result assembly. Add one small four-case mixed-invalid table
through existing parsing helpers, not a private-helper API.

Forbidden edits: grammar/reference/profile/error-policy changes, guide fallback,
spine extraction, casts/assertions bypassing narrowing, public exports/contracts,
checkpoint/limit/cancellation/XML/archive/normalization/locator/cleanup changes,
dependencies, generated/frozen/historical edits, unrelated cleanup or Git actions.
Diff ceiling: two files/180 added plus removed lines; expected production
movement 95-110 lines. Stop before exceeding ceiling. No work order issued.

Baseline/post commands: ExecPlan section 8 G-FAST (`pnpm.cmd
format:check:typescript`, `pnpm.cmd lint:typescript`), G-BUILD (`pnpm.cmd
build:packages`), G-EPUB (`pnpm.cmd --filter @voxleaf/epub typecheck`,
`pnpm.cmd --filter @voxleaf/epub test`), G-BROWSER (`pnpm.cmd test:browser`)
and G-NATIVE (`pnpm.cmd test:native-startup`). No G-HOST/model benchmark for
this unit under the declared unchanged model/runtime boundary.

Gate ledger: fast before preparation, package outputs before dependent checks;
EPUB/security/downstream synthetic corpus, browser and native gates before unit
acceptance. G-CROSS/G-FINAL/G-DOCS plus combined browser remain pending. Capture
source/discovery/transitive/fixture/config/lock/tool/artifact/browser/native
environment identities and cleanup; before/after HEAD/path checks and clean unit
paths/index required. Only validator may reuse fully proven identical receipts.
Prior accepted patches are explicit context, no retrospective baseline. Preserve
declared ignored outputs and bounded retries.

Documentation impact: active plan/evidence only; no diagram or completed M005
change. Decision required: none for extraction; mandatory baseline environment
must be resolved before implementation. Auditor ran no tests.
