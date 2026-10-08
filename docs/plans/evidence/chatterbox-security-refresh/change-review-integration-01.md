# Change Review Report

Review ID: **CB-V3-INTEGRATION-REVIEW-01-20261007**
Task IDs: `CB-V3-INTEGRATION-01`, `PIPER-CANCEL-CONTAINMENT-01`
Verdict: **APPROVE**

Base commit and reviewed HEAD: `998c7b24cda7e969e9ed0344f348506bf38af3b0`

Reviewed paths and identities: the closed 108-path manifest at
`tmp/chatterbox-security-refresh/integration-review-identities-01.txt`, retained
without byte changes as [integration-review-identities-01.txt](integration-review-identities-01.txt),
including 38 task-owned paths and relevant unchanged support/evidence. Manifest
SHA-256: `b1465aa4ee8bb7f0f5235f948876af4b751b5f67474a001c883ec434145c6db2`.

Identity recheck: **PASS**. Before/after inspection, HEAD and all 108 status,
SHA-256 and filter-aware blob identities matched. The complete worktree status
matched the 38 task-owned paths; the index remained empty. No drift or additional
changes were found.

Acceptance review:

- Production Chatterbox admission, acquisition, installer resources, audit policy,
  inventory and license evidence consistently select v3. Generated authority
  binds the three published parts to their exact identities. The accepted
  dependency graph retains the three intended upgrades and the remaining
  dependency pins, models and runtime modules.
- Native discovery admits `cb/3`. Retained `cb/2` and historical profile roots
  remain cleanup-only: ordinary observation does not migrate, activate or execute
  them. Explicit removal covers the supported retained roots while preserving
  containment, operation guards and unrelated storage. Tests cover retained-only,
  withheld, active-v3 and busy-operation cases.
- The client containment fix handles the demonstrated completion/cancellation
  boundary: an invalid-state cancellation rejection attempts the existing
  validated shutdown and rethrows the original error. Restart remains blocked
  until shutdown is confirmed. Failed, malformed or mismatched shutdown cannot
  establish a stopped state. Late synthesis audio remains invalidated and discarded.
- Six additional client regression cases meaningfully exercise recovery, restart
  refusal and unaffected error paths. Existing cancellation success coverage
  remains intact. Coordinator, native protocol and normalization behavior were
  not broadened.
- Acquisition and installed-journey assertions and deadlines were preserved.
  Documentation distinguishes current v3 evidence, historical v2 measurements,
  failed diagnostic attempts and remaining distribution limits.

Test evidence reviewed:

Results below are attributed to the normal local PowerShell executions documented
in `CB-V3-INTEGRATION-HOST-01-20261007` and the immutable Piper containment
validation reports; the reviewer did not execute tests, builds or formatters.

- Focused containment validation: 45 baseline tests and 51 post-change tests
  passed with type checking. Four new assertions failed before the repair,
  demonstrating the missing shutdown behavior.
- `pnpm.cmd check`: exit 0; 209 shared, 653 EPUB, 587 desktop, 38 Node, 82 normal
  Rust, 83 release-locked Rust and 402 Python tests, plus applicable formatting,
  linting, types and builds.
- `pnpm.cmd audit:release`: exit 0 across active graphs. The four explicit
  Chatterbox URL-package blind spots remain disclosed; no new advisory suppression
  was introduced.
- Fresh `pnpm.cmd package:windows`, `package:windows:check`,
  `package:windows:lifecycle`, `package:windows:ordinary-chatterbox` and
  `package:windows:ordinary-chatterbox:evidence`: exit 0 for the rebuilt candidate.
- The complete installed journey passed real acquisition, cancellation cleanup,
  Chatterbox ES/EN narration, restart discovery, explicit removal, Piper ES/EN
  narration, reinstallation and uninstall. The host evidence records restoration
  of application data, all 2,018 original installation files and relevant
  registry/shortcut state without restoration errors.
- Final package, inventory, v3 acquisition, TypeScript-format and diff checks
  passed on unchanged source.

Artifact matching: read-only inspection confirmed the 181,602,965-byte installer
SHA-256 `8bc8d5a54e82a113b9ed2bb727c64742a2d7bd5ba9558d7aab1fd417bc77711d`
and build-executable SHA-256
`fb81330b856cae0d15b28da861409ffbe0e1cba6f8b376360c5cda5d137cdb06`.
Replacing only the Tauri bundle marker at offset 9,047,802 in memory reproduced
recorded installed-executable SHA-256
`b2c7b1e1729b2b7bf05ed6b4b9014a931c42aa5d2c3aad36cf5d1ad91b6e9b67`.
This is consistent with the existing receipt policy, which binds the exact
installer and separately records the installed executable.

Findings: **none**.

Remaining uncertainty:

- The deterministic client defect does not establish the cause of every earlier
  host failure.
- Direct adapter smoke cancellation measures queued-work cleanup. Installed-journey
  evidence separately covers runtime cancellation. Neither sampled resource
  measurements nor socket interception establish guarantees for every host.
- Four advisory blind spots remain; Unix-only symlink branches were not executed
  on Windows.
- Updated remote CI remains a post-push gate. The unsigned candidate remains
  outside public installer publication approval.

Required next action: no corrective change is required for this reviewed patch.
Preserve this report and its identities for the authorized handoff, then inspect
CI for the resulting pushed commit.

This approval satisfies the independent change-review gate only. It does not
authorize Git mutations, merging or public installer publication, and it is not
a refactor Validation Report.

## Director handoff note

The reused Git steward reported that its role accepts only immutable refactor
POST-CHANGE PASS reports for an ACCEPTED-CHANGE order. This behavioral/security
unit instead follows the independent change-review workflow above. The director
therefore performs the ordinary authorized Git handoff, preserving exact-path
staging, identity verification and staged-diff inspection. No refactor approval
is fabricated. The user previously authorized commit, push and PR publication.

The manifest's reviewed raw snapshot uses CRLF; repository text normalization
stores the same JSON and identity values with LF. The normalized committed
representation has SHA-256
`834b696efa63b94b065f7b16952ea003d86738f0c98f412598a742731acabdcd`.
This transport-only distinction does not refresh any approved source identity.
