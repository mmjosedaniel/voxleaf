# Change Review Report

**Review ID:** CAF-R2-20261103  
**Task ID:** CAF — chat-audit-minimal-follow-up  
**Verdict:** **APPROVE**

**Base commit and reviewed HEAD:** `840bf0a2cadf43849d380058b38da784174302db`  
**Branch:** `codex/chat-audit-minimal-follow-up-plan`

**Reviewed paths and identities**

Closed manifests and patch artifacts under `tmp/evidence/chat-audit-minimal-follow-up/20261103-01/`:

| Artifact | SHA-256 |
|---|---|
| `R2-reviewed-identities.json` — 60 changed paths | `F0A04FA07F69E77E0B15696B96E427460862A9C8F5180B035D2CE07F2E9ECA36` |
| `R2-all-source-identities.json` — 1,538 source paths | `5C336445F9D8DB8FCA01E0FB16B2FBA9C50B71FD9098EEB3E23CA864E7FFC105` |
| `R2-tracked.patch` | `32D1702BEBB6D87828A7B8BC5FF891755668B779D5769DBF055B866045B3E448` |
| `R2-new-files.json` | `BFE720DF5F2FFFEBADB4E5302F1978A6344C166389C02D686590F777A750DF85` |
| `R2-input-equivalence.json` | `E83B261A320F95251A8CE530AE0F34A4CE423009CA10154CACC90E7BBDE96B27` |

Review covers the complete CAF patch examined in R1, the three added App cases, revised documentation and completed evidence. Production source is unchanged from R1.

Unchanged supporting source examined remains the shared locator decoder, EPUB raster catalog/opened-publication owner, narration Settings actions, reader-position restore coordinator, optional Chatterbox client and product narration coordinator, at the identities recorded in the source manifest. Requirements, applicable ADRs and preservation boundaries remain those assessed in R1.

The report exclusion is `docs/plans/evidence/chat-audit-minimal-follow-up/review-R2.md`.

**Identity recheck: PASS**

Before and after R2 inspection, all 1,538 source SHA-256 identities matched. Final inspection verified all 60 changed-path blob identities, exact changed-path membership, unchanged HEAD/branch and an empty index. The 251 recorded package exports and native application executable also matched. No drift was observed.

**Acceptance review**

CAF-R1-F1 is resolved:

- `App.test.tsx:1018` exercises direct pre-book repository rejection, retained appearance, visible failure after opening, successful current-owner saving and subsequent restoration.
- The two cases beginning at `App.test.tsx:1070` settle deferred failures after pre-book-to-book and book-to-book replacement. They preserve the same appearance value across replacement, so semantic inequality cannot substitute for ownership protection.
- Both cases verify suppression of obsolete failure status and successful current-owner retry/restoration.

The tests use the existing committed-props harness without adding pre-book Settings UI or weakening existing assertions.

The 27 bounded corrections, including demonstrated R7.3, satisfy the reviewed acceptance criteria. Five intentional policies, two original deferred risks and additional N1 remain explicitly preserved/deferred. No broader model, live-delivery, physical-listening or performance guarantee is inferred.

**Test evidence reviewed**

These are attributed executor results from normal local PowerShell outside the sandbox; I did not run tests, builds or formatters.

| Evidence | Reviewed outcome |
|---|---|
| `G2-final` | Shared 56 and EPUB 455 tests passed |
| `G3-final` | Only its 14 passing suites/505 tests accepted; failed App suite and aggregate remain rejected |
| `G3-App-review-exact` | All 90 App tests passed on final R2 bytes |
| `G1-App-review-exact` | App test lint, desktop types and formatting passed |
| `G4-python-final`, `G4-node-final` | 147 Python and 52 Node tests passed |
| `G5-staging-controls` | 173 default and 172 release-locked Rust tests passed; eight ignored in each remain separate |
| `G6-exact` | Three CAF Chromium journeys passed |
| G7 | One Piper regeneration, offline ES/EN smokes and package check passed |
| G8 | Desktop build, Piper EN 1x host arm and fresh F08 passed |
| `G9-local-admission` | One exact optional admission test passed in 709.92 seconds; inference disabled |
| `G9-R2-guards` | Evidence and diff guards passed |

Literal commands and retained failure history are recorded in `validation-commands.md` and `execution-ledger.md`.

The completed equivalence proof covers 17 source/export input sets. I verified its recorded input-manifest hashes and source deltas against R2. The explicit exclusions are appropriate: renewed App-only coverage, native test-only changes absent from the release application, generated core outputs handled by their applicable gates, and documentation outside runtime inputs. This accepts only the identified unchanged results from this execution.

The repeated installed-input comparison covers 24,009 entries. Optional cleanup records zero new roots/processes, unchanged rehashed sources and restored environment. Piper resource restoration, executable identity and frozen-authority preservation are recorded and consistent.

**Findings:** None remaining.  
**Remaining uncertainty:** None preventing acceptance of this reviewed scope.  
**Required next action:** None for the R2 review gate.

Approval applies only to these immutable identities. Subsequent archival/documentation changes require their own assessment. This is neither a Validation Report nor permission to commit, push, publish or create a pull request.
