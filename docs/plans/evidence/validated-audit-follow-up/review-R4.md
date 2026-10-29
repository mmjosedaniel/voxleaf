# Change Review Report

Review ID: **VAF-R4-20261028**  
Task ID: **validated-audit-follow-up**  
Verdict: **APPROVE**

Base commit and reviewed HEAD: `beb1093447a9bd75ee3eee9c28575e4a902b55d7`  
Branch: `codex/validated-audit-follow-up`

## Reviewed paths and identities

Closed manifest: `tmp/evidence/validated-audit-follow-up/VAF-R4-20261028-manifest.json`, containing **101 reviewed identities, including 46 task-owned changed paths**. The report target `docs/plans/evidence/validated-audit-follow-up/review-R4.md` is excluded.

Artifacts under `tmp/evidence/validated-audit-follow-up/`:

| Artifact | SHA-256 |
| --- | --- |
| `VAF-R4-20261028-manifest.json` | `418cd5b2d117f629ba33d019d7e5a732821e29d82f8e4568030ea8b32879d740` |
| `VAF-R4-20261028-tracked.patch` | `544f08dea0e94f7d7cf349d69c7c0d52f95acf679b2b790f1ea80d2522f09b31` |
| `VAF-R4-20261028-new-files.json` | `950861b86b5d06d69fb98991a76711adad882c80c7cccccad43b87223116627c` |
| `VAF-R4-20261028-receipts.json` | `ffc8e235785a1f35a70f49700a06ad323f457a8b0f1c3f7040df7715bad61fec` |
| `VAF-R4-20261028-gate-deltas.json` | `fac79154cd12b4ed87fef490a6270dec0ad917dbb1c8b6d5dac53fcd228b9cb6` |

Identity recheck: **PASS**. Opening and closing checks matched every reviewed porcelain status, SHA-256 hash and filter-aware blob ID. HEAD and branch remained unchanged, the index remained empty, and no extra changed paths appeared. All **245 receipt entries** matched their recorded hashes. R1–R3 manifests retain their original identities.

Product source, tests and build inputs remain unchanged from R3. The continuation adds host evidence and reviewed orchestration support, updates maintained documentation and preserves the R3 report.

## Acceptance review

All twelve retained findings have implementation and applicable evidence:

- **H1/H7:** Awaited compatibility recheck reconciles the existing session; pending controls preserve accessible focus containment.
- **H8:** Complete nonempty sub-millisecond PCM becomes playable using sample-frame truth, with completion and release coverage.
- **H10:** Completed highlighting retains decoration without follow, navigation or settlement authority.
- **H6/H11:** Conservative title handling and Unicode Mark classification preserve ambiguous forms, source mapping, boundaries and public batching behavior.
- **H3/H4/H12:** Diagnostic matching remains bounded across writes; privacy/cleanup claims require successful observation; presentation shuffling preserves synthesis order and sample correspondence.
- **H2:** Cancellation wins at the request-error boundary without replacing prior diagnostics or suppressing ordinary failures.
- **H9:** Requested preference cleanup independently reports retained, unsafe or inaccessible data.
- **H13:** Owned installation cleanup precedes restoration, failures preserve recovery material, and uninstallation has a finite deadline.

H5 remains excluded. Frozen authorities, corpus/history, public contracts, production dependencies and architectural boundaries remain preserved. No actionable regression affecting privacy, cancellation, bounded memory, stable locations, synchronization or persistence remains identified.

**VAF-R1-F1 is resolved.** The bounded uninstaller correction and hanging-process regression remain unchanged. The preparatory orchestration finding is also resolved in revision 02: protected handle capture, primary-error preservation and verified process exit gate restoration and recovery deletion.

The previously missing **L1 gate now passes** after explicit user authorization. Personal data was protected outside the lifecycle test’s deletion scope; synthetic pre-existing data exercised the real harness’s restoration path. The retained installer is an identified H13 fixture and restores the original installation. It does not establish a newly packaged release or H9 behavior inside that older installer; H9 retains its compiled-NSIS evidence.

## Test evidence reviewed

All executions are attributed to the executor’s recorded **normal local PowerShell sessions outside the sandbox**. This reviewer ran no tests, builds or formatters. Exact compound commands and input identities are retained in the identified receipts and gate-delta artifact.

| Evidence | Result |
| --- | --- |
| `L1-lifecycle-authorized-01` | `pnpm.cmd package:windows:lifecycle`, with the verified process-local Windows PowerShell module prefix: **PASS**, exit 0, 146.54 seconds; install, first start, repair, six silent scenarios, sentinel preservation and synthetic pre-existing data restoration |
| `Host-L1-prepare-01` | Verified program backup and fresh private data inventory before mutation |
| `Host-L1-orchestration-check-02` | Four isolated mocked process/journal failure cases passed; no native process launched |
| `Host-L1-authorized-01` | Hash-checked revision-02 wrapper: personal uninstall, L1, reinstall and measured restoration passed |
| `Host-L1-cleanup-01` | Exact owned recovery directory removed after verified restoration |
| `Host-L1-final-inspection-01` | Restoration flags verified; no owned/native processes or run-owned recovery roots; historical named temporary-root inventory unchanged |
| `F-documents-04` | `pnpm.cmd check:evidence` and `git diff --check`: passed |
| `N1-native-replanned-03` | `node apps/desktop/scripts/native-startup-smoke.mjs`: passed with all original assertions |
| `F-Native-fixture-03` | Scoped formatting/lint and native Node leaf: **23 passed** |
| `B1-browser-final-03` | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts`: **14 passed** |
| `F-Windows-tests-03` | Windows Node leaf: **31 passed** |
| Retained Python evidence | **722 tests**, formatting, lint, type checks and build passed |
| Retained Rust evidence | Formatting/lint passed; **140 default / 139 release-locked tests**, seven ignored per configuration |
| Retained TypeScript evidence | Static checks passed; shared **210**, EPUB **720**, desktop **913** passed |
| Retained build/evidence checks | Default desktop build passed; evidence tests **31 passed** |

The composed Node coverage remains **110 tests**, assembled from matching leaf evidence rather than represented as a newly executed aggregate.

I independently compared L1’s before/after snapshots: no recorded input changed during execution. The lifecycle harness, data helper and registered command configuration match current identities. The wrapper checked its reviewed hash before execution and checked the installer identity at execution boundaries; the installer’s current hash also matches.

Changes since those runs are maintained documentation only. Final document checks have no recorded subsequent input changes. Reusing the unaffected R3 test/build leaves is justified by matching consumed inputs; no previous approval is reused.

## Findings

**None outstanding.**

## Remaining uncertainty and limits

The resumed operation’s evidence establishes:

- Original program-file bytes, application registry values and shortcut bytes match.
- Personal-data membership, main-stream file bytes, sizes, last-write times and attributes match the fresh pre-uninstall inventory.
- Owned process exit and recovery cleanup were verified.

The earlier coarse metadata discrepancy remains unexplained. This approval does **not** establish complete historical host equality, attribute that discrepancy to a cause or assert corruption. The fresh authorized boundary establishes the resumed operation’s measured restoration. It does not measure every Windows metadata field or alternate stream.

The successful native readiness correction does not independently prove the timing hypothesis behind earlier N1 failures. Synthetic H8 coverage does not establish occurrence in real model output. Release-specific clean-host/manual checks, model-quality evaluations and a newly packaged patched release are outside this acceptance.

These limits are explicitly preserved and do not leave a required development acceptance gate unresolved.

## Required next action

No corrective implementation or missing execution gate remains for this frozen patch.

Complete the plan-required documentation archive, renew its documentation checks and obtain the separate final archive identity review. Do not update this report’s hashes to cover those later changes.

Review inspection is complete; the review write freeze may end. This immutable approval applies only to the identified patch. It is not a Validation Report and authorizes no staging, commit, push, PR, merge or publication.
