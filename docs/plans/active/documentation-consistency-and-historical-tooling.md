# Documentation consistency and historical tooling

Created: 2026-10-21.
Status: planned; implementation has not started and is not authorized by the planning request.
Planning base: `d9b2ea051d1caa5041bec5cce912bb535ae9e5af` (`main`).
Planning branch: `codex/documentation-consistency-and-historical-tooling`.

## Goal

Reconcile maintained documentation with the implemented Piper and Chatterbox
release boundaries, and make current instructions distinguishable from
historical evaluation and campaign tooling. Preserve reproducible historical
evidence and the behavior of every existing command.

This is cross-milestone documentation maintenance, not a new product milestone
or a source-code refactor. The current authorization covers this ExecPlan,
its active-index entry, a dedicated local branch and one planning commit.
Implementation, push and pull-request creation require later authorization.

## User-visible outcome

A contributor can identify the supported runtime, the applicable build or
validation command, and the evidence behind its status without treating a
historical profile name or campaign receipt as the current executable version.
Maintained indexes route readers to current work and dated historical results.
Reader, narration, acquisition and playback behavior stay unchanged.

## Current state

The audit and verification used the planning base above. The checkout was clean
before plan creation. Recheck HEAD, the worktree and relevant consumers before
execution; these observations are not a permanent statement about later code.

| ID | Verified observation | Decision for this plan |
| --- | --- | --- |
| D01 | `docs/development/tts-service-organization.md` calls v3 current and says native acquisition/discovery remain on v3. ADR-0058 and the native admission code select package v5. | Correct the maintained guide; distinguish the admitted v5 runtime from historical v3 and the local v4 adapter-layout candidate. |
| D02 | `docs/product/glossary.md` describes the audio queue as not yet production-supported and a supported profile as later work. Current product and release records support Piper and compatible-host Chatterbox. | Keep definitions and invariants; replace obsolete implementation-status prose with accurate terminology and links to current status. |
| D03 | `docs/architecture/tts-support-matrix-v2.md` labels current Piper rows 1.4.2, while the core source manifest identifies 1.8.0. Stable profile preference IDs intentionally survive executable updates under ADR-0053/0054. | Separate stable profile identity, current engine/package versions and historical evaluation versions. Preserve profile IDs, support decisions and hardware gates. |
| D04 | Unversioned Chatterbox package aliases default to v2 by design; explicit v5 scripts exist. Setup instructions still present generic aliases without a clear historical label. | Correct guidance to select explicit v5 commands for current work. Keep legacy command names, defaults and historical regression use unchanged. |
| D05 | `tts-adapter-layout-host.mjs` targets installed v3 and an isolated local v4 candidate. Its 19 tests cover meaningful process, containment and identity behavior. | Label this campaign tooling as historical in maintained guidance. Preserve its runner, tests and aliases; do not present it as v5 acceptance. |
| D06 | Maintained documentation and completed-plan indexes repeat transient states such as "unstaged/uncommitted". Their historical-status disclaimer already explains the original context. | Editorial cleanup of maintained index summaries only. Remove transient wording or attach its original checkpoint; do not rewrite completed plans or receipts. |
| D07 | Large maintained guides repeatedly narrate milestone history. The audit found no exact whole-document duplicates or missing local file-link targets in its scan. | Consolidate only demonstrated repetition into references to retained records. File size, age and historical status alone do not justify deletion. |
| D08 | Two workflows run push checks for `main` and `agent/**`; they also run for pull requests targeting `main` and support manual dispatch. | No demonstrated CI defect. Leave workflow filters unchanged; pre-PR checks for other prefixes remain a separate decision. |

Earlier verification in this conversation, at the same source HEAD, ran
`pnpm.cmd test:python` outside the sandbox: 611 passed, with a nonblocking
pytest-cache permission warning. It also ran
`node --test scripts/tts-adapter-layout-host.node-test.mjs` from `apps/desktop`:
19 passed. The first Python invocation stopped at a pnpm version mismatch;
selecting the configured Corepack shims allowed the unchanged command to run.
These are audit context, not fresh acceptance of future edits or a new
installed-v5, GPU, model-quality or release validation. No immutable receipt
from those runs is claimed as a reusable gate for this plan.

## Scope and non-goals

The planning commit may change exactly:

- `docs/plans/active/documentation-consistency-and-historical-tooling.md`.
- `docs/plans/active/README.md`, solely to register this planned work.

After explicit execution authorization, the documentation edit allowlist is:

- `docs/development/tts-service-organization.md`.
- `docs/development/setup.md`.
- `docs/development/testing.md`.
- `docs/development/dependencies.md`.
- `docs/product/glossary.md`.
- `docs/architecture/tts-support-matrix-v2.md`.
- `docs/README.md`.
- `docs/plans/active/README.md` and `docs/plans/completed/README.md`.
- This plan, including its eventual move to the corresponding completed path.

Review `docs/architecture/overview.md`, `docs/architecture/system-diagram.md`,
`docs/plans/roadmap.md`, `docs/product/mvp.md` and
`docs/product/project-brief.md` for consistency. Their wholesale rewrite is
not part of this batch. If correcting one of them is necessary, first record
the exact section, verified inconsistency, bounded edit and expanded path
allowlist in this plan. A change to requirements or architecture requires
separate scope; it cannot be justified as editorial simplification.

Excluded work:

- Editing or removing runtime source, scripts, tests, package aliases, CLI
  defaults, schemas, dependency locks, generated manifests or package evidence.
- Renaming stable profile IDs, migrating preferences, admitting v4, changing
  v5 acquisition/discovery, or reopening deferred Qwen production work.
- Changing frozen evaluation authorities, their hashes, historical benchmark
  inputs, accepted ADR decisions, completed ExecPlans or immutable receipts.
  The maintained completed-plan index is distinct from completed plans.
- Bulk deletion of historical documents, retiring command aliases, removing
  the adapter-layout harness or its tests, and changing CI workflow filters.
- New application behavior, performance claims, dependencies, benchmarks,
  release publication, installers, model downloads or host configuration.

## Relevant files and documentation

Read the [documentation index](../../README.md),
[plan format](../../../.agents/PLANS.md),
[evidence retention policy](../../development/evidence-retention.md),
[system diagram](../../architecture/system-diagram.md),
[architecture overview](../../architecture/overview.md) and relevant product
requirements before execution. Use the [roadmap](../roadmap.md) for product
status; an index entry is not evidence of implemented behavior.

Sources for the disputed version and tooling claims:

- [ADR-0053](../../architecture/decisions/ADR-0053-refresh-piper-onnxruntime.md),
  [ADR-0054](../../architecture/decisions/ADR-0054-refresh-piper-engine-and-phonemizer.md)
  and [ADR-0055](../../architecture/decisions/ADR-0055-onnx-131-offline-runtime.md):
  profile identity and successive Piper/ONNX executable updates.
- [ADR-0058](../../architecture/decisions/ADR-0058-admit-certifi-pillow-chatterbox-v5.md):
  admitted v5, frozen v3 runtime modules, cleanup-only old installations and
  unpublished/unadmitted v4.
- `package.json`, `apps/desktop/package.json`,
  `services/tts/src/voxleaf_tts/release_chatterbox.py`,
  `services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py`,
  `services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py`,
  `services/tts/release/core/source-manifest-v1.json` and
  `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`.
- `apps/desktop/scripts/tts-adapter-layout-host.mjs`, its adjacent
  `tts-adapter-layout-host.node-test.mjs`, and the
  [completed adapter-layout plan](../completed/tts-adapter-layout.md).
- `services/tts/benchmarks/v8_authority.py` and its successor authority chain:
  examples of live consumers that hash historical documents. Inspect actual
  references before deciding a document is editable or unnecessary.
- `.github/workflows/foundation-checks.yml` and
  `.github/workflows/release-audit.yml`, for D08's deferred decision only.

## Architecture and constraints

Preserve local EPUB processing and inference, bounded queues and PCM memory,
memory-only generated audio, cancellation ownership and stable EPUB locators.
Keep the distinction between approximately 15 seconds of playable audio lead
and elapsed startup time. Glossary edits must not alter normalization,
segmentation, narration contracts or the safe-document-to-narration boundary.
Consult the completed [M005 plan](../completed/M005-narration-text-preparation.md)
when reconciling those terms, without changing its historical content.

Current manifest/lock identities and implemented admission code determine
executable versions; stable profile names are not package version selectors.
Historical measurements remain bound to the artifacts originally tested.
V5 intentionally reuses frozen v3 source modules; that fact is not permission
to substitute the local v4 candidate or regenerate historical authority.

The architecture diagram is a consistency check. Update it only if an actual
architectural change is separately authorized; this plan introduces none.
Do not weaken repository review, validation or retention rules to reduce
documentation volume. If execution reveals a runtime defect or public-contract
change, record it separately and apply the existing feature/bug review policy.

## Milestones

### Milestone 1: Correct confirmed documentation inconsistencies

Status: not started.

Recheck D01-D05 against the execution HEAD and search consumers before editing.
Correct the six maintained guides/matrix listed first in the allowlist. Mark
current v5 commands, intentional historical v2/v3 checks and local v4 campaign
commands by purpose. Keep the historical runner available through a clearly
labeled reference. Describe stable profile identity separately from executable
engine/package versions and dated evaluation evidence.

Acceptance: each changed status/version claim has a repository source; all
documented aliases and arguments exist; legacy semantics and support gates are
unchanged. No historical command is advertised as current release acceptance.

### Milestone 2: Simplify navigation and maintained summaries

Status: not started; depends on Milestone 1's terminology.

Address D06-D07 in maintained indexes and the in-scope guides. Remove transient
Git state from current summaries, or date it when the checkpoint matters.
Replace repeated historical narratives with links to the retained plan, ADR or
receipt while keeping prerequisites, limitations and actionable commands near
their instructions. Preserve both historical failures and later outcomes.
Do not infer that a commit, merge or old passing CI establishes fresh acceptance.

Acceptance: an unfamiliar contributor can find current setup, supported
runtimes, current validation instructions and historical tooling; every removed
narrative still has a reachable retained source. No authority, completed plan
or receipt is deleted or edited. Record SKIP when no concrete improvement is
justified; there is no file-count or line-reduction target.

### Milestone 3: Verify consistency and close the documentation batch

Status: not started; depends on Milestones 1 and 2.

Review the complete diff, changed Markdown links and command examples. Compare
version claims against current manifests, native admission and ADRs. Confirm
that changed paths stay within the recorded allowlist and protected files have
no diff from the execution baseline. Resolve obsolete present-tense claims in
the touched sections without relabeling quoted historical evidence.

Run the applicable checks below outside the sandbox. Record exact outcomes and
limitations, then move this plan to `docs/plans/completed/`, update both plan
indexes and the documentation index, and repair incoming links. Keep it active
while implementation or any required documentation check remains pending.
Closing the plan does not authorize a commit, push or PR beyond the user's
then-current Git instructions.

## Testing and benchmark strategy

This batch changes Markdown only. Repository formatter globs omit Markdown;
application lint, type checks, builds and runtime suites do not validate these
prose corrections. Do not add tests that mirror text or run GPU/installer work
to accept documentation. Escalate the validation plan if scope changes.

Run every validation command from normal local PowerShell outside the managed
automation sandbox. Use the repository's configured pnpm version, currently
11.15.1, and record a toolchain mismatch instead of changing package metadata.

| Gate | Command or review, from repository root unless stated | Timing and expected result |
| --- | --- | --- |
| Scope and protected paths | `git status --short`; `git diff --name-status`; inspect the full diff against the recorded baseline | Before and after each milestone; only allowlisted Markdown paths change. Include untracked files in review. |
| Whitespace | `git diff --check`; for an authorized commit, `git diff --cached --check` | Before acceptance and after final staging; exit 0. |
| Evidence retention | `pnpm.cmd check:evidence` | At planning closeout and final implementation closeout; exit 0. It reads the Git index, so run after the exact paths are staged when a commit is authorized. It is not a semantic documentation check. |
| Link integrity | Inspect changed relative file links and any changed fragment targets | Before acceptance; each target exists and each fragment resolves. No new repository link-check command is assumed. |
| Commands and identities | Compare examples with actual package scripts/CLI arguments; compare version claims with the listed manifests, native code and ADRs | Milestones 1 and 3; no fabricated command, changed default or unsupported runtime claim. Do not execute builders to verify their names. |
| Historical preservation | Review path/content diffs against the execution baseline and search incoming references/authority consumers | Milestones 2 and 3; frozen files, generated files and completed evidence retain their bytes; retained history remains reachable. |

These checks provide documentation acceptance only. No new hardware benchmark,
model-quality, fresh CI or exact-artifact release result is required or claimed.
Historical suite results in Current state are not substituted for any gate.

## Risks and rollback

The principal risks are confusing profile IDs with installed package versions,
silently changing legacy command semantics, deleting apparently old files that
still have consumers, and presenting historical success as current validation.
The closed documentation scope, source comparisons and preservation review
address these risks. D08 remains unresolved by design, not an acceptance gate.

Keep changes small and review each milestone before proceeding. If a correction
would change behavior, a frozen authority or a requirement, leave that edit
pending and define separate work. Recover a mistaken prose edit with a focused
reverse patch; preserve unrelated changes and do not use broad reset, clean or
stash operations. No host or user-data mutation needs rollback in this batch.

## Progress log

- 2026-10-21: recorded the reverified findings and three-stage documentation
  scope. Created the planning branch from clean `main` at the stated base.
  Implementation remains unstarted; the current request permits only the plan,
  active-index registration and local planning commit.

## Discoveries and decisions

- Generic Chatterbox aliases and the adapter-layout harness are intentional
  historical tooling. Correct their presentation; preserve their semantics
  and tests. A future deprecation or harness migration is separate work.
- Preserve frozen authorities, historical source blobs, benchmark inputs,
  completed plans and receipts even when newer versions exist.
- Current profile IDs intentionally retain older version-looking text. Explain
  that distinction instead of renaming IDs or altering stored preferences.
- Existing historical disclaimers make transient index wording an editorial
  improvement, not proof of a functional defect. Historical volume alone is
  insufficient evidence for deletion.
- CI branch-prefix changes remain a product/workflow preference requiring a
  separate decision; existing PR checks mean a validation bypass was not shown.

## Final validation results

Planning-only validation on 2026-10-21, from local PowerShell outside the
managed automation sandbox:

- Required-section inspection: all 12 sections present.
- Relative-link inspection: all 19 local targets in the plan and active index
  exist; neither file introduces fragment links.
- `git diff --check`: exit 0.
- `pnpm.cmd check:evidence`: exit 0 with configured pnpm 11.15.1.
- Full content and scope review: only this plan and its active-index entry
  changed; no implementation or protected historical files changed.

Commit preparation must also confirm the exact two staged paths and repeat
`git diff --cached --check` and `pnpm.cmd check:evidence` against that index.
Application suites were not rerun for this planning-only change.

Implementation acceptance: pending. All three milestones remain not started.
The creation or commit of this plan does not mark any recommendation implemented.
