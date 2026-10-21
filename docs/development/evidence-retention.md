# Evidence retention

Commit concise acceptance summaries and the exact source identities needed to
review them: commands, outcomes, environment, report ID, tested HEAD, hashes,
invariants, and material limitations. Preserve failed baselines and later
successful repairs as distinct outcomes. Do not rewrite accepted receipts or
completed plans to describe later work.

Public summaries must omit conversation excerpts, personal availability or
network ownership, private account identifiers, and local-data inventory values or
digests. Record restoration outcomes and receipt IDs publicly; retain the
underlying host-specific evidence privately. Source and distributable-artifact
identities remain public when needed to reproduce or verify the result.
An explicitly authorized privacy redaction may remove personal details from
a completed plan without changing its technical requirements or historical
outcomes. Mark the redaction, preserve the original locally, and do not link
readers to the unredacted version as an evidence shortcut. A new commit does
not remove information from earlier Git history.

Keep raw logs, command captures, before/after dumps, temporary scripts and
screenshots in ignored `tmp/evidence/<run>/`, or in CI artifacts. Before retiring
an existing capture, verify a byte-preserving archive and record its SHA-256,
entry manifest and recovery location. Do not rename raw output to `.txt`,
`.log.txt`, `.json.txt` or another extension to bypass retention rules.

CI artifact uploads must state an explicit `retention-days` value and the
summary must record that expiry. Expired CI artifacts and local archives are
not permanent public references. This policy does not add artifact uploads or
change existing workflow YAML.

## Repository guard

`pnpm check:evidence` reads the entire NUL-delimited Git index, including ignored
files added with `git add -f`. Under `docs/plans/evidence/`, it permits only
Markdown and these four reviewed, curated identity records:

- `native-rust-test-layout/initial-inventory.json.txt`
- `linux-rust-test-repair/review-input.json.txt`
- `chatterbox-security-refresh/review-identities-01.txt`
- `chatterbox-security-refresh/integration-review-identities-01.txt`

These exceptions identify bounded review inputs; they do not authorize new raw
bundles. Fixture JSON elsewhere in the repository is outside this rule.
The scoped `.gitignore` rules discourage new raw captures; the guard catches
forced additions. `pnpm test:evidence` exercises the guard in isolated temporary
Git repositories. Both commands start `check` and `check:portable`, so existing
CI jobs run them without a workflow edit.

Before staging an authorized cleanup, the guard excludes only exact paths
reported as deletions relative to HEAD. A newly staged raw file remains rejected
even if it is subsequently removed from the worktree. Git execution/index read
failures stop the check; a missing Git installation is not a passing result.

## PR #229 archive

The three new collections were archived at source commit
`5401f899e3ffabfc8f3e79873bc0b5fa45b11155`: 276 files, 5,416,967 bytes.
The cleanup retains 50 Markdown records and two identity manifests, retiring
224 raw captures. All 47 immutable Markdown receipts, both manifests, 60 older
evidence files and the two original completed plans retain their bytes.

Local recovery location:
`Documents/Codex/artifacts/voxleaf/pr-229-evidence-5401f899/original-evidence.zip`.
SHA-256: `80f9b59a9d38730f1046b01a5dac3cb5e8f3f0a599807759242a51a95ecc30fc`.
The adjacent `manifest.json` records original repository paths, sizes and hashes.
Extract selected entries to ignored scratch, verify them against the manifest,
and avoid overwriting unrelated work. This archive is local only.

Reviewers with repository access can use the original commit's
[native layout collection](https://github.com/mmjosedaniel/voxleaf/tree/5401f899e3ffabfc8f3e79873bc0b5fa45b11155/docs/plans/evidence/native-rust-test-layout),
[failed Linux comparison](https://github.com/mmjosedaniel/voxleaf/tree/5401f899e3ffabfc8f3e79873bc0b5fa45b11155/docs/plans/evidence/linux-rust-test-comparison),
and [Linux repair collection](https://github.com/mmjosedaniel/voxleaf/tree/5401f899e3ffabfc8f3e79873bc0b5fa45b11155/docs/plans/evidence/linux-rust-test-repair).
The retained indexes distinguish these historical captures from current files;
local paths in unchanged reports remain historical execution provenance.
