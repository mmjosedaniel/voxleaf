# Change Review Report

Review ID: **DFM-CI-CR-R01-20261114**

Task ID: **DFM-CI**

Reviewer: independent `change_reviewer`, GPT-6 Astra high.

Verdict: **APPROVE**

Base commit and reviewed HEAD: `1058d991cfc78cb3fdbadc6526059b04f783735f`

Branch: `codex/deep-findings-minimal-corrections`

## Reviewed scope and identities

The five-path patch contains the installer-helper error classification, its
regression tests, and three documentation paths. The closed manifest covers 33
changed/supporting paths. No supporting-path addendum is required.

Frozen artifacts under `tmp/evidence/deep-findings-ci-follow-up/review-r01/`:

| Artifact | SHA-256 |
| --- | --- |
| `manifest.json` | `e157de47fd320a247640050fff3a1cbc68264490ae6b5a76afe025b6031e767f` |
| `patch.diff` | `f93ceff97b640438505d51809b92f53e84e47a7451f57c97ffd383d9d5d581dd` |
| `new-files.json` | `384900e238cf757b5f3805b577d55b433dbe5ee41cf4b07de7cb3b08b54cd04a` |

**Identity recheck: PASS.** Before and after review, all 33 paths matched their
recorded status, SHA-256, filter-aware blob and HEAD identity. HEAD and branch
remained unchanged; the index remained empty. The actual tracked diff matched
the frozen patch byte-for-byte. No unrelated worktree changes appeared.

## Acceptance review

The correction satisfies the original CCF-C04 no-spawn recovery contract and
VF-0056's concrete trigger:

- `runOwnedInstaller` preserves the actual Node error only when the actual child lacks a PID and reports a spawn syscall. Its private error identity admits the existing safe prelaunch cleanup path.
- `runJourney` skips uninstall, preserves the original launch error and restores the backup only through the retained session, installation-root and destination-absence guards.
- Injected `ENOENT` errors cannot forge the private no-spawn identity. Started or uncertain execution continues to require verified containment and protected recovery.
- The new regression checks two attempts, original error fields, zero uninstall calls, restored sentinel and absent backup.
- The revised uncertainty fixture launches a real executable that exits without a valid receipt. Its backup-retention assertions distinguish that condition from failure to create the helper.
- Job ownership, process/output bounds, cleanup-error preservation and unrelated-process protections remain intact.

VF-0056's lineage and coverage-gap explanation agree with the historical contract
and inspected implementation. The patch does not change application playback,
EPUB handling, inference, dependencies or architectural boundaries.

## Test evidence reviewed

These are supplied normal-host results, not commands executed by this reviewer:

| Receipt and command | Result |
| --- | --- |
| `red-missing-helper`: `node --test --test-name-pattern="CCF-C04 missing installer helper" apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs` | Exit 1; discriminating missing-`ENOENT` assertion failed against the original production owner. |
| `green-ordinary-host`: `node --test apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs` | Exit 0; **39 passed, none failed or skipped**, including real Windows containment controls. |
| `static-format-lint`: `pnpm.cmd run format:check:typescript`, then `pnpm.cmd run lint:typescript` | Exit 0; both passed. |
| `final-evidence`: `pnpm.cmd check:evidence`, then `git diff --check` | Exit 0; both passed. |

Receipt-bound environment, log and before/after hashes matched. GREEN
production/test inputs match the reviewed patch. RED production bytes match
HEAD; its test bytes were independently reconciled by reversing one
formatting-only `copyFile` change, confirming unchanged regression assertions.

The static dependency capture contains **6,042 entries: 6,005 hashed files and
37 absent optional-dependency markers**. All captured file hashes matched.
Subsequent documentation changes do not affect the Node or JavaScript static
inputs; the final evidence capture matches current inputs.

**Findings:** None actionable.

**Remaining uncertainty:** The corrected patch has not yet executed in hosted
Ubuntu CI. Controlled Windows reproduction establishes the corrected failure
path, not Linux execution or complete PR integration success.

**Required next action:** Preserve this report, recheck exact identities before
the authorized Git handoff, then inspect the new PR #316 hosted checks through
completion. Do not report CI recovery as complete until those checks pass.

This approval completes the independent local review gate only. I ran no tests,
formatters or builds, edited no files and performed no Git mutations. It is not
a Validation Report or permission to commit, push, merge or release.
