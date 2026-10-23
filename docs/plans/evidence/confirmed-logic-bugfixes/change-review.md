# Change Review Report

**Review ID:** `CLB-R3-ASTRA-20261022T023548Z`  
**Task ID:** Confirmed logic bugfixes, CLB-01 through CLB-05  
**Verdict:** **BLOCKED** — required host acceptance evidence remains incomplete. No unresolved code defect was identified.

**Base commit and reviewed HEAD:** `a9f60ed2ef8be53141391260985aeabcd237140c`  
**Branch:** `codex/confirmed-logic-bugfixes`  
**Reviewer:** Independent `change_reviewer`, GPT-6 Astra high. Read-only inspection; no tests, builds, edits, delegation, or Git mutations performed.

## Reviewed paths and identities

The closed task manifest is the 45-entry `temp/clb-review/revision3-inputs.json`, incorporating each path’s SHA-256, filter-aware Git blob identity, and porcelain status.

| Artifact | SHA-256 |
|---|---|
| `temp/clb-review/revision3-inputs.json` | `0548ad3fbaa8c0ca1398358d1bfed8ddb6dd1e2462aade1b1cb0a580ddd778d4` |
| `temp/clb-review/revision3.diff` | `473020a74ddbcc3cd8325960a784a2f89736280719c51b810de49f123c7687d7` |

The 36-entry supporting-path identity manifest recorded in immutable report `CLB-R1-ASTRA-20261022T020505Z` is incorporated unchanged. Its exact paths, SHA-256 values, filter-aware blob IDs, and clean statuses were rechecked for R2 and again before and after R3. These include the review policy, product authorities, applicable ADRs, direct desktop/native/service callers, shared protocol schema, locator implementation, package scripts, and installer lifecycle helper.

**Identity recheck: PASS.** All 81 reviewed source/documentation identities, HEAD, empty index, and R3 manifest/diff hashes matched before and after this review. R3 changes only the active ExecPlan relative to R2; executable inputs remain identical to the final `check6` inputs.

The resulting `docs/plans/evidence/confirmed-logic-bugfixes/change-review.md` report is excluded from its own manifest, as required by review policy.

## Acceptance review

Source review covered the requested behavior and preservation requirements:

- **CLB-01:** Exact-directory detection uses explicit branches. Compiled NSIS regression coverage exercises real directories, ordinary files, missing paths, retention/removal, and junction cases.
- **CLB-02:** Ended callbacks delivered after Pause release remaining PCM once, preserve paused intent, and allow subsequent resume/buffering/completion behavior. Cancellation, stale callbacks, queue bounds, and ephemeral audio remain covered.
- **CLB-03:** Valid identity-bound operational errors are distinguished from invalid protocol input. Verified containment now supports the actual client’s shutdown acknowledgement and explicit recovery sequence.
- **CLB-04:** Primary publication start selection preserves auxiliary EPUB identities and navigation, explicit saved locations, and stable locators.
- **CLB-05:** Discovery and cleanup recognize the exact owned `.previous` backup, report failures truthfully, and fail closed around filesystem errors and unsafe paths.

The active plan accurately distinguishes passing checks, historical evidence, superseded diagnostic artifacts, failed host attempts, and incomplete installed-product acceptance. It appropriately remains active.

## Findings

**No unresolved actionable findings.**

**R1 F01 — resolved in R2 and unchanged in R3.** Previously, verified native containment removed the session before the real `TtsProcessClient` issued shutdown, causing `InvalidState` and preventing recovery.

The correction retains one contained service identity only after verified termination. Shutdown acknowledges the matching explicit identity without an active session; missing, foreign, invalidated, and unverified identities do not receive that acknowledgement. Replacement and force-stop clear the receipt.

Evidence includes:

- A regression that failed against the earlier implementation with actual `InvalidState`.
- Rust coverage for matching, unspecified, foreign, busy-operation, force-stop, and failed-termination cases.
- Coordinator coverage using the actual `TtsProcessClient` through an invoke adapter, asserting identity-bound shutdown records, no automatic retry, one explicit retry, and terminal repeated failure.
- Real supervised-child diagnostics requiring matching shutdown before replacement and rejecting stale identities afterward.

These checks address the concrete failed boundary identified by F01.

## Test evidence reviewed

Results below are attributed to the coordinator’s normal local PowerShell execution outside the managed sandbox.

| Command | Reviewed result and limits |
|---|---|
| `pnpm.cmd check` | Attempt 6, exit 0 (`temp/clb-check6.log`): shared 209, EPUB 674, desktop 818 Vitest plus 97 Node, Rust 117/116 passing with two ignored per helper, Python 619, evidence 13; configured formatting, lint, types, and builds passed. Only the plan changed afterward. |
| `pnpm.cmd test:browser` | Exit 0, 10/10 (`temp/clb-browser1.log`). Explicitly reused for unchanged browser/renderer/EPUB inputs. |
| `pnpm.cmd test:native-startup` | Attempt 2, exit 0 (`temp/clb-native2.log`), including corrected real-child shutdown/replacement diagnostics and native WebView smoke. |
| `pnpm.cmd test:tts:reader-corrections-host` | Attempt 2, exit 1 overall (`temp/clb-profiles2.log`). Piper ES and EN passed, including direct/WSOLA ended-after-Pause scenarios at 100%/75%, synchronization, and zero retained/generated/external audio residue. Both Chatterbox arms failed before audio because installed v5 was unavailable. |
| `pnpm.cmd test:chatterbox:installed-integrity` | Exit 101 (`temp/clb-chatterbox-integrity1.log`), canonical-root verification failure; required installed v5 absent. |
| `pnpm.cmd package:piper-core:check` | Exit 0 (`temp/clb-core1.log`). |
| `pnpm.cmd package:windows:verified-core` | Attempt 2, exit 0 (`temp/clb-package2.log`). Attempt 1 failed during PowerShell Security-module loading; the unchanged command passed after a process-local module-path correction. |
| `pnpm.cmd package:windows:check` | Exit 0 (`temp/clb-package-check.log`). |
| `pnpm.cmd package:windows:lifecycle` | Exit 1 (`temp/clb-lifecycle1.log`), pre-existing-install safety guard before mutation. This is not lifecycle acceptance evidence. |
| `pnpm.cmd check:evidence`; `git diff --check` | Coordinator reports exit 0 after final documentation updates. |

Current package artifact hashes were independently inspected:

- Release-locked NSIS-patched executable: `ba5dca615375255763e249f9e6a6b4f415130efc2b1e856ef15d4fbb2f171ac8`
- Installer: `53be8afdafc6b40d434b49b31e64f58d0049ba2edf9d4d0ef8a4caefb44e7434`

These match `temp/clb-package-artifacts.json`. They are unsigned local artifacts. Diagnostic runs used their separately recorded binaries; those results do not establish installed acceptance for this final installer.

The accepted historical package receipt was restored byte-for-byte, SHA-256 `7fd9db70e4964bd3ecbded94e2861f48c02bc49ec1949cf49d787077f91ac30c`. The fresh ignored receipt, `temp/clb-review/current-windows-package-evidence.json`, correctly records lifecycle and publication gates as incomplete.

## Remaining uncertainty and required next action

Acceptance remains blocked pending:

1. Successful Chatterbox ES and EN host-profile journeys with the required installed v5 prerequisite.
2. The final installer’s installed lifecycle matrix on an isolated host/account, preserving the existing ordinary installation.
3. Actual interactive NSIS acceptance for existing-data and backup-only states, default retention, explicit removal, and independent preferences.
4. Installed in-app backup discovery/removal, failure/retry/restart, and unrelated-root preservation scenarios.

Compiled synthetic NSIS tests and successful local packaging do not replace these gates. Obtain the missing evidence, bind it to the applicable exact inputs/artifacts, and request a fresh immutable review. No additional source correction is required by this report.

This report does not authorize acceptance, commit, push, publication, or other Git mutations.
