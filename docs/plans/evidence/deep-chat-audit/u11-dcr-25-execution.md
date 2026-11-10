# U11 execution evidence

- Receipt: `DCR-U11-EXEC-20261109-01`
- Plan: [Deep Chat Audit Minimal Corrections](../../active/deep-chat-audit-minimal-corrections.md)
- Finding: DCR-25
- Base and tested HEAD: `d375ecc84261c404e855c055e0ecc8949a97caaf`
- Host: Windows NT 10.0.26200.0, PowerShell 7.6.9, Node v24.20.0,
  Git 2.53.0.windows.1, repository-pinned pnpm 11.15.1 through offline Corepack.
- Raw receipts: ignored `tmp/evidence/deep-chat-audit/U11/`.

## Reproduction and correction

In isolated synthetic Git repositories, commit a historical raw evidence file,
stage a changed blob or executable mode, and delete the worktree copy. Both
changes should be rejected. The unchanged guard passed both cases because its
deletion exemption used the HEAD-to-worktree result alone. The corrected guard
also compares cached index entries against HEAD by exact path, with rename
pairing disabled. The exemption now requires no staged change at that path.

## Host commands

| Phase | Command | Result |
| --- | --- | --- |
| RED | `pnpm.cmd test:evidence` | Exit 1. 32 passed and two failed with `Missing expected exception` on the staged blob and mode cases. The production checker was unchanged. |
| GREEN | `pnpm.cmd test:evidence` | Exit 0. All 34 passed, including unstaged historical cleanup, staged deletion, staged-new local deletion, neighboring paths, mode-only changes with identical blobs, and Git and Markdown read failures. |
| GREEN | `pnpm.cmd check:evidence` | Exit 0. Repository guard passed on the then-current worktree and unchanged index. |
| GREEN | `git diff --check -- scripts/check-evidence.mjs scripts/check-evidence.test.mjs docs/development/evidence-retention.md` | Exit 0. |

RED and GREEN snapshots matched before and after their commands. The test
source was identical between phases. Raw snapshots record actual command
times, resolved executable identities, configuration inputs and index entries.
No historical PASS was reused. The plan's G7 repository formatting and lint
gates apply to the MJS files and are pending on the final integration inputs.
The final G11 guard, full diff whitespace check and changed-link inspection
are also pending. Independent review is pending.

## Closed unit patch identity

The first porcelain status column is blank for all three paths (` M`). The
index had no staged changes. The table records the exact GREEN worktree bytes
and the filter-aware blob Git would stage for each file.

| Path | Porcelain status | Worktree SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| `scripts/check-evidence.mjs` | ` M` | `a6e942d6a55262790d4e101d888562249a4ba3e8c0d9d0b64147ce62de1fae0d` | `47e1e4ecdde2bda6cf15b50ce41ee45569819ae0` |
| `scripts/check-evidence.test.mjs` | ` M` | `62e0e7554ef0e5954c305013ca398c5dd25aced5cec96adafda4852676a9dd9f` | `abbc93570fa566e5eef81d4d2b943feb1584f70f` |
| `docs/development/evidence-retention.md` | ` M` | `5b5c1af58a90612736c9e195f1b12e9d6add01098befae708ccb58ab7f29db58` | `010a798e0f6d4237e9f0eaa98dd3079d1bbf1db2` |

RED production SHA-256 was
`8590b7e8ace7b3161d653a99f15c713b6dc01f091f0cfb148b016bb95f80b3c0`
with HEAD blob `cab0189539e23758ba443da0e07c76d20cac77ad`.
