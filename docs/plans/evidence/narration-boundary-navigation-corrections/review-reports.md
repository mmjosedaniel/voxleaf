# BNC independent reviews

Reports are immutable and excluded from their own reviewed identity manifests.

## BNC-R1-20261101

Task ID: BNC-20261101. Verdict: **CHANGES_REQUESTED**.
Reviewer: independent `change_reviewer`, GPT-6 Astra high; no edits or tests.
Base/HEAD: `69de1d9e450f6602015175ac38ffeba7ab9d9440`.

Closed 416-path manifest:
`tmp/evidence/narration-boundary-navigation-corrections/run-01/BNC-R1-20261101-manifest.json`.
SHA-256: `5bd7cab99f53e33734bb1e84c0a61f7166784bcdb7ddc78bc63e9d50dafdc08b`.
Identity recheck: PASS for SHA-256, filter-aware blobs, statuses, HEAD, branch,
empty index and complete diff. All 136 evidence-file hashes match; no unexpected
changed paths. Both new evidence documents were examined; this file is excluded
from its own manifest.

Acceptance: BNC-01 correctly settles rejected navigation without autoplay,
preserves cleanup containment and successful paused semantics. BNC-03–05 have
relevant deterministic/public coverage. Source provenance, fixed lookaround,
profile routing and frozen historical owners remain intact. BNC-02 is incomplete.

Test evidence reviewed (coordinator's host execution, not reviewer execution):
original red attempts; G3 257/257; G4 194/194; G5 3/3; G6 format/lint/types exit 0;
G7/G8 integrity/build/native/resource-cycle exit 0; G9 pass with 57 links.
Cleanup records restored membership/hashes, no new processes/scratch, no retained
audio/files, six closed contexts; input comparisons establish the reported scope.

Findings:

1. P2, `packages/epub/src/narration/narration-bilingual-normalizer.ts:384`,
   `lexicalContext`: EN `1<span lang="fr">&#x2060;</span>8` treats an immediately
   adjacent foreign-language removable mark as a proven boundary. The `8`
   expands and later omission produces `1eight`. Existing whole-string foreign
   controls miss mixed spans. Required correction: preserve on this uncertain
   language barrier without scanning across it; regress both sides, mapping and
   public preparation, keeping code controls and the 128-point limit.
2. P2, same production file at line 705, `hasAttachedNumericSyntax`: ES
   `21 E\u2060UR` / `21 EU\u2060R` bypass suffix protection because U/R are read
   at raw offsets. The resulting `veintiuno EUR` partially expands an unsupported
   expression. Required correction: recognize only the existing fixed EUR suffix
   across approved marks within remaining lookaround, fail closed at barriers and
   limits; regress both positions, mapping and public preparation.

Remaining uncertainty at review: both findings established statically; exact
outputs not executed by reviewer. Required next action: focused host reproductions,
bounded corrections, renewed invalidated gates and a fresh immutable review.
No archival acceptance or Git authorization.

## BNC-R2-20261101

Task ID: BNC-20261101. Verdict: **APPROVE**.
Reviewer: independent `change_reviewer`, GPT-6 Astra high; no edits or tests.
Base/HEAD: `69de1d9e450f6602015175ac38ffeba7ab9d9440`.

Closed 416-path manifest:
`tmp/evidence/narration-boundary-navigation-corrections/run-02/BNC-R2-20261101-manifest.json`.
SHA-256: `1144f7080a05f6586835f8a27820b3ec077e90e75ed132a2f5b4a857976cc32b`.
Identity recheck: PASS for SHA-256, filter-aware blobs and statuses before/after
inspection; unchanged HEAD/branch, empty index, matching complete tracked diff.
All 74 evidence-file hashes match; no unexpected changes. Complete patch/new
evidence documents reviewed, with this report record excluded from its manifest.

Acceptance: BNC-01 settles inactive, releases manual persistence and requires
explicit Play while retaining successful paused semantics and cleanup containment.
Both BNC-R1 findings are resolved: immediate foreign removable prose marks fail
closed, and fixed EUR uses logical context within the remaining 128-point budget.
BNC-03–05 retain signed/compound/Celsius and ordinary-punctuation protections.
Regressions cover mixed-span directions, both EUR mark positions, source mapping,
current public profiles, batch equivalence and limits. Production stays within
the two owners; closed grammar, history, provenance, cancellation, bounded
retention and privacy remain preserved.

Host evidence reviewed, not executed by reviewer: eight intended red failures;
run-02 package rebuild PASS; EPUB 265/265; desktop 194/194; Chromium 3/3;
format/lint/EPUB types PASS; desktop build/Piper/native resource cycle PASS;
evidence/whitespace/58 links PASS.

Reuse accepted: run-01 desktop typecheck and Piper integrity. Complete comparisons
establish unchanged consumed desktop/configuration/fixture inputs, 83 declarations,
Python/release inputs, payload/archive identities, installed tools and environment.
Changed EPUB implementation/tests are not consumed by those checks.

Native executable:
`c6790abc9b27bae07ab4d56a819a7b17c58cfe25d4ad3921b8fb31c530b7e8a4`.
Zero underruns, 774 ms cancellation, valid synchronization, zero retained
audio/files/external requests, six closed contexts, restored resources and no new
owned processes/scratch. Measurements remain host-specific.

Findings: none; both R1 findings addressed. Remaining uncertainty: none blocking
the approved scope. Required next action: none for this patch; archival/index
amendments require the planned fresh assessment. This is not a refactor Validation
Report and grants no Git/publication permissions.

## BNC-R3-20261101

Task ID: BNC-20261101. Verdict: **APPROVE**.
Reviewer: independent `change_reviewer`, GPT-6 Astra high; no edits or tests.
Base/HEAD: `69de1d9e450f6602015175ac38ffeba7ab9d9440`.

Closed 419-path manifest:
`tmp/evidence/narration-boundary-navigation-corrections/run-02/BNC-R3-20261101-manifest.json`.
SHA-256: `ac5c8698eee1e2b3871b6ef3b40a9fc163011db321b6dc841efb5013a7d7813f`.
Includes the deleted active plan, completed plan and both indexes. New-file
contents and this excluded review-record document were examined.

Identity recheck: PASS. Before/after content hashes, filter-aware blobs, statuses
and deletion identities match; unchanged HEAD/branch, empty index and matching
complete tracked diff. All 81 recorded evidence hashes match; no unexpected paths.

Acceptance: changes since R2 are documentation only. The archive preserves
criteria, scope, failure history and authorization boundaries. Indexes, ledger
and R1/R2 dispositions accurately reflect the accepted implementation. Production,
tests, configuration and supporting code identities remain unchanged from R2.

Supplied host evidence reviewed, with no reviewer execution: fresh G9-archive
passes `pnpm.cmd check:evidence`, `git diff --check` and 155 links, exit 0,
with matching receipt input/environment digests. R2's 265 EPUB, 194 desktop and
three Chromium cases, static checks, current build, Piper/native integration and
verified cleanup remain applicable. The two accepted reused desktop-type/core
checks retain original receipts and dependency proof. The archival comparison
confirms unchanged artifacts, executable, tools/WebView and installed environment;
Markdown archival does not affect runtime-gate inputs.

Findings: none. Remaining uncertainty: none blocking the approved scope.
Required next action: none for acceptance; retain this report outside its own
manifest and perform final identity/status verification. This is not a refactor
Validation Report and does not authorize commit, push, PR, merge or publication.
