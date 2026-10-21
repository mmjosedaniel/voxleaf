# Documentation consistency and historical tooling

Created: 2026-10-21.
Status: complete; all three authorized documentation stages accepted on 2026-10-21.
Planning base: `d9b2ea051d1caa5041bec5cce912bb535ae9e5af` (`main`).
Planning branch: `codex/documentation-consistency-and-historical-tooling`.

## Goal

Reconcile maintained documentation with the implemented Piper and Chatterbox
release boundaries, and make current instructions distinguishable from
historical evaluation and campaign tooling. Preserve reproducible historical
evidence and the behavior of every existing command.

This is cross-milestone documentation maintenance, not a new product milestone
or a source-code refactor. The original planning authorization covered this
ExecPlan, its active-index entry, a dedicated local branch and one planning
commit. The subsequent 2026-10-21 execution request authorizes all three
documentation stages and closeout, while requiring changes to remain unstaged
and uncommitted. It does not authorize a new branch, push or pull request.

## User-visible outcome

A contributor can identify the supported runtime, the applicable build or
validation command, and the evidence behind its status without treating a
historical profile name or campaign receipt as the current executable version.
Maintained indexes route readers to current work and dated historical results.
Reader, narration, acquisition and playback behavior stay unchanged.

## Current state

Execution base: `5b93ced7db3c3b382ae670a173a619bcdaf61d0e`, the planning
commit, on `codex/documentation-consistency-and-historical-tooling`.
Initial local PowerShell inspection found an empty index and clean worktree;
there are no commits or differences after the planning commit to reconcile.
The planning observations and earlier test results below remain historical.

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

### Bounded allowlist extensions recorded before editing

The execution review confirmed these additional editorial inconsistencies.
ADR-0058, the v5 source/acquisition manifests and native
`tts_optional_chatterbox.rs` bind the current runtime to v5. Add only the
following paths/sections to the edit allowlist:

| Path and section | Evidence and bounded correction |
| --- | --- |
| `docs/architecture/system-diagram.md`: Component and trust-boundary map; Evidence and decision authority | The runtime-origin node still says v3 and the current runtime-evidence link selects v3. Change only that label and current evidence link to v5; retain graph nodes, edges, historical M011 checkpoints and all architecture. |
| `docs/architecture/overview.md`: Status, M011 distribution paragraphs | The text calls runtime evidence v3 current and the ordinary manifest v2 despite the v5 status paragraph. Identify the v2 sizes/publication as the original M011 checkpoint and link current v5 authority; preserve all historical numbers and topology. |
| `docs/product/mvp.md`: Implementation status, M011 runtime publication paragraph | Present-tense publication names v2. Identify that publication as historical and point to ADR-0058 for current v5; change no requirements or support gates. |
| `docs/product/project-brief.md`: Status and purpose, M011 runtime publication paragraph | The same v2 publication is presented as current. Distinguish the M011 checkpoint from current v5 via ADR-0058; change no product direction. |

Roadmap: SKIP. Its opening explicitly identifies milestone descriptions as
historical implementation/evidence status; retained v2 M011 checkpoints need
no rewrite. No additional document, runtime or CI edit is authorized here.

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

Status: complete. D01-D05 revalidated and corrected; see execution results below.

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

Status: complete. Maintained summaries and navigation reconciled; history retained.

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

Status: complete. Current documentary checks pass; no runtime acceptance is claimed.

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
| Whitespace | `git diff --check`; for an authorized commit, `git diff --cached --check` | Before acceptance; exit 0. Staging is not authorized for execution. |
| Evidence retention | `pnpm.cmd check:evidence` | At planning closeout and final implementation closeout; exit 0. It reads the Git index. Execution authorization requires no staging: run it against the unchanged index and inspect unstaged/new files separately. It is not a semantic documentation check. |
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
- 2026-10-21: the subsequent user request explicitly authorized all three
  documentation stages, execution-state recording and completed-plan closeout.
  Verified the existing branch and execution base above in local PowerShell.
  No inherited changes exist. Rechecked scripts/CLI defaults, native v5
  admission, current Piper pins, stable profile IDs and frozen-source consumers.
  Recorded the four bounded allowlist extensions above before editing them.

- 2026-10-21: Milestone 1 completed. Local PowerShell `git status --short`,
  `git diff --name-status` and `git diff --check` show only allowlisted Markdown
  edits and no whitespace errors. `pnpm.cmd check:evidence` passes with
  configured pnpm 11.15.1 selected through existing Corepack shims. The index
  remains unchanged; this guard does not review unstaged prose.
- 2026-10-21: Milestone 2 completed. Reduced repeated introductory history,
  retained direct history/evidence routes, cleaned transient maintained-index
  summaries and distinguished the adapter campaign's then-admitted v3 from v5.
  Proceeding to current documentary validation; no historical suite is reused.

- 2026-10-21: Milestone 3 completed after current local documentation checks,
  raw-byte preservation, command/version review and full diff inspection.
  Moved this plan to completed and updated both plan indexes plus the
  documentation index. Final location/link and unstaged-file checks pass.

## Discoveries and decisions

Execution dispositions:

- D01-D05: corrected current v5 admission, Piper 1.8.0/ONNX Runtime 1.31.0,
  stable IDs, generic v2 defaults, historical v3 checks and local v4 tooling.
  The optional builder CLI accepts no model-root argument and builds runtime
  only; setup's old model-root/model-copy requirement was removed after source
  inspection. No command or argument was changed.
- D06: removed transient unstaged/uncommitted wording only from maintained
  indexes. Historical plans retain their original Git state and test counts.
  Setup/testing remote-CI-pending prose now identifies the original checkpoint
  and the subsequent pass recorded by the Linux repair evidence index; no new
  CI run is inferred from that historical result.
- D07: replaced the documentation-index and setup introductory milestone
  narratives with current entry points and retained source links. The roadmap
  and completed M010/M010.1/M010.2/M011 plans retain the detailed history;
  selection-v3/v4/v5 retain rejected Qwen alternatives; the release security
  guide retains the static-scan limitations. Testing now routes the v3 security
  repair narrative to its completed plan while distinguishing v5 acceptance.
- SKIP broader guide/plan consolidation: unique commands, prerequisites,
  historical failures, audit caveats and tooling policy remain in place.
  No historical file, authority, receipt or pre-existing completed plan moves.
- SKIP normalization/segmentation changes: M005 is complete in the roadmap;
  its package-only boundary and glossary terms remain unchanged. Only obsolete
  playback/profile implementation status was corrected.
- D08: SKIP workflow edits. Both workflows retain main/agent push filters,
  main-target pull requests and manual dispatch. No CI acceptance is claimed.
- The diagram change is only a stale version label and evidence link; all
  nodes, edges, ownership, requirements and support gates are preserved.
- No runtime defect requiring implementation was identified in this review.

Original planning decisions retained:

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

The original planning-only commit instructions required confirming the exact
two staged paths and repeating
`git diff --cached --check` and `pnpm.cmd check:evidence` against that index.
Application suites were not rerun for this planning-only change.

### Execution acceptance on 2026-10-21

All three documentation stages are complete. This subsequent authorization and
validation do not change the planning-only context above. Execution remained on
`codex/documentation-consistency-and-historical-tooling` at
`5b93ced7db3c3b382ae670a173a619bcdaf61d0e` with no staged changes, commit,
push, PR, branch reconstruction or host/runtime mutation.

All acceptance commands and inspections ran through local PowerShell outside
the managed sandbox, from the repository root. Selected the existing Corepack
shims with the process-local command
`$env:PATH = 'C:\nvm4w\nodejs\node_modules\corepack\shims;' + $env:PATH`;
`pnpm.cmd --version` returned `11.15.1`. The inherited pnpm location was the
bundled fallback; it was not used for acceptance and no repository metadata
changed. Node reported `v24.20.0`, within `engines.node` but different from the
`.nvmrc` reference; this documentary guard does not establish application
acceptance with that toolchain.

| Executed command or inspection | Current result |
| --- | --- |
| `git status --short` | Exit 0 before work, after stages and at closeout; initially clean, finally only the allowlisted documentation edits and plan relocation. |
| `git diff --name-status` | Exit 0; only allowed tracked Markdown paths. The new completed plan is inspected separately because it is untracked. |
| `git diff --check` | Exit 0 after corrections and at closeout. |
| `pnpm.cmd check:evidence` | Exit 0 with pnpm 11.15.1; evidence retention check passed. The index remains unchanged. |
| `git diff 5b93ced7db3c3b382ae670a173a619bcdaf61d0e -- <reviewed-paths>` | Full tracked diff reviewed in bounded groups, including historical material replaced by references; no unrelated changes. The relocated plan is separately compared with its baseline content. |
| `git diff --cached --name-status`; `git rev-parse HEAD`; `git branch --show-current` | Empty staged diff; unchanged execution HEAD and requested branch. |
| Read-only inline Python inspection via PowerShell | Final pass after relocation: 516 local links, 17 fragments and 205 affected incoming links (16 fragments) resolve. Scope and documented pnpm.cmd aliases match package manifests. The untracked plan's whitespace and final newline also pass. |
| Raw-byte preservation inspection | All 1,330 tracked files outside the allowlist match the execution base's Git blob identities, computed from raw file bytes without clean filters. This includes code, scripts, tests, aliases/defaults, locks, generated files, frozen authorities, prior completed plans, receipts and both CI workflows. |
| `git cat-file -e <commit>:services/tts/src/voxleaf_tts/chatterbox_adapter.py` for frozen commits `814fd2f70bd3588d31022207eb976c0ff93712a3` and `998c7b24cda7e969e9ed0344f348506bf38af3b0` | Exit 0 for both historical source blobs; retained history remains accessible. |

Static command review checked `release_chatterbox.py` package-version default
2, explicit 3/4/5 arguments, v5 no-sync rejection, output-root constraints and
publication readback; it also checked the adapter-layout runner's modes and
contained overrides. No builder was executed to discover command names.
Version review matched the core source manifest/uv lock and Piper adapter,
native package version 5/cleanup roots, frozen-module resolver and ADR-0053,
0054, 0055 and 0058. V8/V11/V12 authority consumers still hash their retained
historical inputs. The system diagram's graph topology is unchanged.

Two post-relocation inspections stopped because the auxiliary command extractor
misclassified prose about package-manager versions, locations and aliases as
script names. Restricting extraction to shell command lines and inline-code
invocations resolved those false positives. Package scripts and application
code were unchanged; these were inspection-tool failures, not runtime failures.

The retained M011 plan and release security guide still contain the installer
hash and static-scan ID formerly repeated in the documentation-index summary.
Rejected Qwen and playback comparisons remain reachable through retained
selection records, the roadmap and completed-plan index. No authority hash or
historical result was regenerated or reinterpreted.

Limitations: `check:evidence` reads the index and is not semantic validation of
unstaged prose or the new completed plan. Separate content, links, whitespace
and scope inspection covers those files. Application lint/type/build suites,
GPU/model tests, installers, network audits and CI were not run for this
Markdown-only batch, as required by the proportional strategy. No historical
suite is reused as current acceptance. D08 remains a separate decision, trusted
public signing remains external, and this batch introduces no new support or
runtime claim. No required documentation validation remains blocked.

Final document inventory: `docs/README.md`; the four maintained development
guides (`setup.md`, `testing.md`, `dependencies.md`, `tts-service-organization.md`);
`docs/product/glossary.md`, `mvp.md` and `project-brief.md`;
`docs/architecture/tts-support-matrix-v2.md`, `overview.md` and
`system-diagram.md`; both plan indexes; and this plan moved from `active/` to
`completed/`. These are 14 logical documents; Git reports the unstaged move as
a tracked deletion plus one untracked completed plan. All other files retain
their bytes. No blanket consolidation or file-count target was applied.
