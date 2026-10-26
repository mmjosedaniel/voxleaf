# Change Review Report

**Review ID:** `CB-V6-INTEGRATION-R2-ASTRA-20261024`
**Task ID:** PR #272 — Chatterbox v6 production integration
**Verdict:** **BLOCKED** — required acceptance evidence remains missing.
**Base commit and reviewed HEAD:** `e46eb99c542b27a891aae6ee20d68c525d79f5f1`

**Reviewed paths and identities**

Closed scope: all **79 paths**, including **41 changed paths**, recorded in the supplied R2 manifest.

| Evidence artifact | SHA-256 |
|---|---|
| `integration-review-r2-inputs.json` | `770c13b0025ee23b6ebca93d21f52eb6bcdcf72eda778fa9f008205e0ffcf8ed` |
| `integration-review-r2.patch` | `d21770e3bd456c45f160e229d2ede5b990dbeeb9703ea295c04a41c4d426f79c` |
| `integration-review-r2-new-files.json` | `da23cb9e558ec9b380e378830ca0eced650c762d2b3dd45a1f3c8b3d3455606e` |
| `package-r4/foundation-inputs.json` | `0db062de8eeef306ef91a740d29f90a9c0909b96932b915d2c6bb4252a12c1af` |

**Identity recheck: PASS.** Before/after HEAD, path sets, statuses, SHA-256 hashes and filter-aware blobs match. The index remains empty. All **797 R4 foundation/package inputs**, including the final bundled guide, match current files.

The persisted R1 report faithfully preserves its substantive verdict, findings, identities and requirements. Its verified filesystem SHA-256 is `c844124a975defa95c74aeb077305571173587fb9b6c141fa4bd04fcad49d129`.

**Acceptance review**

**R1 F1 is resolved.** In `tts_optional_chatterbox.rs::remove_with_manifest`, retained-v5 cleanup now uses `owned_path_present`, validates the contained non-reparse directory, and propagates deletion errors. Only explicit `NotFound` establishes absence. A dangling link therefore cannot produce successful `Absent`.

The added regression creates a real Windows junction or Unix symlink, makes its target absent, and asserts rejected removal, retained discovery, external-marker preservation and successful retry after removing the synthetic link. Existing normal-directory removal and containment coverage remains intact.

The remaining integration source retains the reviewed v6 publication authority, consistent selectors, cleanup-only historical versions, compatibility gates, transfer bounds and cancellation ownership. No new actionable defect was identified.

**Test evidence reviewed**

All execution results below are supplied host evidence; this reviewer ran no tests.

- F1 red reproduction, `pnpm.cmd test:rust`: exit **101**, 117 passed / 1 failed / 2 ignored. The failure shows successful `Absent` for the dangling junction.
- Corrected `pnpm.cmd test:rust`: exit **0**, 118/117 passed, two ignored helpers per mode. The Windows junction regression passes; the Unix variant remains unexecuted locally.
- Post-correction `pnpm.cmd check`: exit **0**; shared 209, EPUB 674, desktop 818 Vitest plus 97 Node, Rust 118/117, Python 645; quality checks and builds pass.
- R4 `pnpm.cmd package:windows:verified-core` and `pnpm.cmd package:windows:check`: both exit **0**. Recorded inputs match; the historical receipt was restored.
- Earlier passing browser, acquisition-authority and release-audit evidence remains applicable to their unchanged inputs. It does not establish installed execution.
- Pre-F1 native startup: exit **0**, with verified original-data restoration. This is historical evidence for the earlier native source. No completed corrected-source native result existed at this report’s cutoff.

Independently rehashed immutable R4 copies:

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| Installer | 203,962,549 | `34e90ffad5a1990807753f2f7b9eaa8db13584ab5a0854d36efa80a1e05b1f09` |
| Packaged application | 11,946,496 | `1d85038c023e4756b0e48a76ceff84effa737fe94737b53dc9d83758089ee67c` |

**Findings:** None outstanding. R1 F1 is closed for this exact patch.

**Remaining uncertainty / required next action**

Supply the missing current-source/current-artifact evidence:

- Corrected-source native startup completion and verified data restoration.
- Installed v6 B06/B07, recovery and acquisition journeys.
- Required four bilingual native/installed reader and speed arms.
- Installed integrity and lifecycle checks against the immutable R4 artifact.
- Required firewall-enforced offline validation, followed by firewall and user-data restoration.
- Fresh integrated-head hosted CI at the authorized publication stage, including the Unix regression.

The cancelled UAC request created no firewall rules and supplies no offline acceptance evidence. Historical v5/CLB results cannot fill these gaps.

Request a new immutable review when the missing evidence is available. This report is neither final acceptance, a Validation Report, nor authorization for Git mutations.
