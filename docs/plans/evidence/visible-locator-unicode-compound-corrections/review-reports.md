# Immutable VUC change review reports

Reports are outside their own closed identity manifests to avoid self-hashing.
They grant no Git or publication authority.

## VUC-R1-20261101

Task ID: **VUC-20261101**. Verdict: **APPROVE**.

Base commit and reviewed HEAD: both `353d0bf5534b428e716f228795fc84e63e7158d9`.
Branch: `codex/visible-locator-unicode-compound-plan`.

### Reviewed paths and identities

The closed identity manifest is
`tmp/evidence/visible-locator-unicode-compound-corrections/run-01/VUC-R1-20261101-manifest.json`.
SHA-256: `de675f73ca8adeeb3d42f0cd2055391c5d938d80e1414b1662fbf25da7aa5681`.

Its 418 entries, including nine task-owned paths and unchanged supporting paths,
are incorporated into this report with their recorded porcelain status, SHA-256
and filter-aware blob identity. Its 124 receipt entries bind the evidence cited
below. The adjacent complete tracked patch `VUC-R1-20261101.diff` has SHA-256
`780f2f1468297da7273195986bc3be6ec23d554968a4398185f4542d7c18fa91`.
The reviewer compared it with the live diff and read the full untracked ledger.

### Identity recheck: PASS

Before and after review, all 418 path identities and all 124 receipt digests
matched. Base/HEAD and branch remained unchanged, the index remained empty, and
there were no unexpected changed paths. No approval hashes were replaced.

### Acceptance review

- VUC-01 forwards the settled locator through the existing optional interface
  and includes the current narration source in the callback effect dependencies.
  This repairs the product's visible start even when the reader locator already
  equals it. The call does not enter App's passive-save callback, generate an
  audible event, start playback or replace the heard checkpoint. Suspension,
  reflow cancellation and cleanup remain intact.
- The browser regression establishes sampled B, resumes the same audio context,
  waits for visible A, stops before a successor boundary, verifies heard
  persistence and checks the first fresh preparation's exact source range.
  PSC-03, RAC-07 and R7-04 remain unchanged and passed.
- VUC-02 changes exactly three guards to recognize one complete Unicode `N`
  code point. Separator sets, context distances, accepted forms, languages and
  unrelated ASCII-digit callers remain unchanged. Supplementary-plane and
  non-decimal numbers and ordinary punctuation controls are covered.
- Public assertions cover all three current profiles, multiple segments,
  one/many batching, exact endpoints and immutable displayed documents. Existing
  mapping, cancellation, resource-bound and frozen-profile controls remain.
- No persistence, network, dependency, schema or process boundary is added.
  The canonical diagram and M005 boundary remain accurate.

### Test evidence reviewed

The reviewer did not execute tests, builds or validation commands. The exact
commands are recorded in the [execution ledger](execution-ledger.md); results
are attributed to implementer execution in normal local PowerShell outside the
managed sandbox:

| Receipt | Reviewed outcome |
| --- | --- |
| G1-red | 16 intended failures; three punctuation controls passed on unchanged production |
| G2-red-retry | Intended range failure after preconditions; original fixture failure retained |
| G3-epub | exit 0, 232 tests |
| G4-reader | exit 0, 50 tests |
| G5-browser-artifact-bound | exit 0, exactly four intended cases |
| G6-format-r2, G6-lint-r2 | each exit 0 |
| G6-epub-types, G6-desktop-types-r2 | each exit 0; original type failure retained |
| G7-core-bound, G7-build | each exit 0; current core and one executable build |
| G8-Piper | exit 0, one Piper EN arm |
| G9-documents-review | exit 0, evidence guard, whitespace and 82 links; current document inputs match |

### Evidence retention and preparation decisions

The reviewer independently approves the following for this assessment:

- G3, G4 and EPUB type evidence remain applicable: the later browser-only type
  annotation lies outside those suites and EPUB TS projects, as current
  configuration confirms. Documentation changes do not enter retained runtime
  or static gates; final documentation receipt inputs match.
- Original capture-wrapper bytes were recovered in memory and matched the
  already-recorded SHA-256
  `6a1a37866afa806c797aac0b2b6da96afa3802b2cf9703af1bf899009fe878c0`.
  Later edits add evidence inventories/artifact capture, preserving dispatch,
  logging and exit handling. This retrieves known content rather than inventing
  missing execution-time identities.
- Incomplete original G5/core receipts do not supply acceptance; their renewed
  receipts supply artifact/tool binding. No uncaptured tracked/untracked source
  paths were found. All 255 generated artifacts match membership/hashes. All
  24,009 installed before/after entries and environment fields match.
- Existing core/voice reuse has current integrity/staging proof. No historical
  behavioral PASS is reused. The executable remains
  `69fb556d2ddeb9b2b0f72d1fb026b779df31196e53c7a52755928e06d340ea5a`.
- Native evidence records zero generated audio, retained/discarded units,
  external requests or stale playback; six of six contexts closed. Original
  resources are fully restored and no new process/scratch remains.
- Broader models/languages, DSP, Rust/Python, installers and full browser
  matrices are outside affected responsibilities; exclusion claims no new result.

Findings: **none**. Remaining uncertainty: none blocking this bounded change;
native timings apply only to this host/arm, without a broad performance guarantee.
Required next action: none for this exact patch's acceptance. Archival documents
require a new immutable assessment and Review ID. Approval is not a refactor
Validation Report and authorizes no commit, push, PR, merge or publication.

The full original reviewer response is retained locally as
`VUC-R1-20261101-report.md`; this tracked record is its curated summary.

## VUC-R2-20261101 — final archival assessment

Task ID: **VUC-20261101**. Verdict: **APPROVE**. Findings: **none**.
Base/HEAD remain `353d0bf5534b428e716f228795fc84e63e7158d9` on
`codex/visible-locator-unicode-compound-plan`; index empty.

Closed manifest: `tmp/evidence/visible-locator-unicode-compound-corrections/run-01/VUC-R2-20261101-manifest.json`.
SHA-256: `915732d2de2b689ea90c875472327d209a2bef4ab48d2c18b4ae641afea4aaab`.
All 422 path identities and 130 receipt digests match before/after review, including
the deleted active plan and new completed plan. The adjacent diff matches live
bytes, SHA-256 `8c5ecb497fd64e64147a8983f13465a96e8da44c81a883c39fd0a614dc5db4c0`.
The report collection remains excluded from its own manifest. Its R1 summary
accurately preserves the original; the full R1 report has SHA-256
`3d525293bae7526ff3c4cefcbc2ef2830fcbf95d9ca409913bef48433f6429f6`.

The reviewer confirms documentation-only archival, index/link updates and
retention of already-identified evidence. Production, tests, configuration and
runtime runners retain their R1 identities. The original failures and constraints
remain accurately described; no architectural/public-contract expansion is claimed.

Retention approved: R1's 232 EPUB cases, 50 reader/persistence cases, exactly four
Chromium cases, four static gates, core integrity, one executable build, one
Piper EN arm and native cleanup. Archival Markdown is not consumed by those
gates; relevant source/configuration and all 255 generated artifact identities
remain unchanged. R1 installed-input, asset and cleanup evidence applies. No
historical behavioral PASS or incomplete superseded receipt supplies acceptance.
Recovered wrapper bytes retain their original `6a1a3786...` identity.

New host receipt `G9-archival` runs `pnpm.cmd check:evidence`, `git diff --check`
and the retained local Markdown-link inspector: exit 0, 377 links resolved,
matching captured input digest and zero current input changes. Receipt SHA-256:
`6bd72d641adbb4d545736b1507ce79882e18e4339c4ccfe04ea1dd7595047395`.
The reviewer performed read-only inspection and ran no tests or builds.

Remaining uncertainty: none blocking acceptance; native timing remains specific
to the recorded host and Piper EN arm. Required next action: none for acceptance
of this final reviewed state. No Git/publication permission is granted.
Full original response: local `VUC-R2-20261101-report.md`.
