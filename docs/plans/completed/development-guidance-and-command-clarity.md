# Development guidance and Chatterbox command clarity

Created: 2026-11-14.
Status: implementation accepted under DGC-CR-R1-20261114; archival assessment is recorded separately in review-final.md.
Planning base: `fa2ff5d63515a0c8eae43996a59897466cdb73ab` on `main`.
Initial index and worktree: clean.

## Goal

Correct verified inconsistencies in maintained development guidance, make the
existing workflow easier to select, and make historical Chatterbox command
selection explicit without changing its defaults or packaged runtimes.

This is a cross-milestone contributor-documentation and maintainer-CLI change,
not a systematic source refactor or a new runtime release. The execution request authorizes implementation, testing and independent review.
Git delivery and runtime publication remain excluded.

## User-visible outcome

Contributors can find the relevant current requirements, distinguish an isolated
change from a refactor campaign, and identify which Chatterbox package a command
selects. Existing command consumers retain their stdout and exit behavior.
The next runtime maintainer can find C05's pending compatibility criterion.
Reading, narration, installation and playback behavior remain unchanged.

## Current state

An independent Astra maximum-effort static review checked the six original
observations on the planning base. It confirmed the facts below while rejecting
claims of measured delay, inevitable review loops or a general runtime failure.
That assessment is planning context, not acceptance of the future patch.

| Case | Verified state and source | Disposition |
| --- | --- | --- |
| 1: named models | [Change review](../../development/agentic-change-review.md#roles-and-permissions) requires Astra; [refactor guidance](../../development/agentic-refactoring.md#model-selection-and-delegation) already allows an explicit model decision when a role is unavailable. No availability block was observed. | Preserve roles, models and independence. Link existing guidance where useful; add no automatic fallback. |
| 2: host validation | [AGENTS](../../../AGENTS.md#testing-expectations) requires normal local PowerShell outside the sandbox. The maintainer's environment experience supports that decision. The [validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md) already supports risk selection and evidence reuse. | Preserve host execution, coverage, reuse proof and CI requirements. Apply existing rules rather than introduce another validation policy. |
| 3: workflow cost | Campaign units require packets and independent validation, but [isolated units](../../development/agentic-refactoring.md#durable-traceability) and [small fixes](../../../.agents/PLANS.md) already have narrower planning requirements. No actual productivity loss was established. | Clarify routing and examples; do not weaken campaign gates or introduce a new approval layer. |
| 4: current guidance | The CCF summary in [the index](../../README.md#current-project-status) says changes remain uncommitted. Ancestor `426ec7df2aa5d67d0aacfd2654035547985cdccd` includes the plan and source fixes. [Setup](../../development/setup.md#selection-rationale) retains an unqualified statement that TTS compatibility is deferred despite its current support summary. | Correct maintained wording and add bounded reading routes. Historical receipts remain historical. |
| 5: command selection | Root aliases omit `--package-version`; `release_chatterbox.main` defaults to `2`. [Historical tooling guidance](../../development/tts-service-organization.md#historical-v2v3-checks-and-local-v4-campaign-tooling) already documents this, while native admission selects v7. Generic source/acquisition success messages omit the selected version. | Add explicit v2 aliases and a separate version-selection diagnostic, preserving existing semantics. This command improvement was selected during planning. |
| 6: frozen runtime | `packaging/chatterbox_sources.py` maps v5/v6/v7 to frozen v3 modules. [C05's handoff](../completed/epub-budget-cancellation-and-reflow-follow-up.md#scope-and-non-goals) already requires a successor and tests against its packaged decoder. | Make that existing criterion discoverable in maintained runtime guidance; do not implement or claim to close C05 here. |

The three generally required index/architecture documents total 2,269 lines and
274,772 bytes at this base. This motivates navigation, not a deletion quota or a
claim that length causes defects. The previous
[documentation consistency plan](../completed/documentation-consistency-and-historical-tooling.md)
already addressed historical aliases and transient status wording; this work
corrects current drift without rewriting its accepted record.

C05 is the original CCF case alias, not a newly discovered issue. The
[findings registry](../../development/findings/registry.md) and
[import coverage](../../development/findings/history-import.md) were consulted;
the seed does not import the CCF batch, and the scoped identifier/C05 search
found no matching entry. No new VF ID or fresh runtime validation is claimed.
Preserve the original links; reconcile any later registry import before execution.

## Scope and non-goals

Planning writes are limited to this file and `docs/plans/active/README.md`.
After an execution request, the bounded implementation paths are:

- `AGENTS.md`: required-reading routing only.
- `docs/README.md`: maintained status correction and concise task-navigation links.
- `docs/development/setup.md`: the compatibility sentence and command guidance.
- `docs/development/agentic-refactoring.md`: workflow-selection clarification.
- `docs/development/tts-service-organization.md`: command purpose/output guidance
  and the C05 successor criterion.
- `docs/development/testing.md`: only the new CLI boundary coverage and its commands.
- `package.json`: three additive v2 aliases; dependencies and existing scripts stay intact.
- `services/tts/src/voxleaf_tts/release_chatterbox.py`: CLI selection diagnostics only.
- `services/tts/tests/test_release_chatterbox_cli.py`: new, focused CLI tests.
- This plan and active/completed indexes, including its eventual archival move.

An implementation review receipt may be added under
`docs/plans/evidence/development-guidance-and-command-clarity/`; record its exact
path before writing, keep it outside its own identity manifest, and retain only
the concise report rather than raw logs. Any additional implementation path
requires a concrete scope explanation in this plan before editing.

Excluded: changing models or role configurations; reducing validation or review
requirements; modifying existing stdout, exit codes, default version or builder
arguments; package source, integrity, acquisition or publication algorithms;
schemas, generated modules, dependency locks, frozen authorities or existing
completed plans/receipts; a new Chatterbox runtime; broad documentation rewrites;
new dependencies; model downloads, GPU runs, installers, signing or publication.
No commit, branch, push or PR is authorized by this planning request.

## Relevant files and documentation

Read the [documentation index](../../README.md),
[MVP requirements](../../product/mvp.md),
[canonical diagram](../../architecture/system-diagram.md),
[architecture overview](../../architecture/overview.md),
[roadmap](../roadmap.md), [plan rules](../../../.agents/PLANS.md),
[change-review workflow](../../development/agentic-change-review.md), and
[evidence retention](../../development/evidence-retention.md).

Inspect these owners and existing tests before implementing the CLI change:

- `package.json`, `services/tts/pyproject.toml` and
  `services/tts/src/voxleaf_tts/release_chatterbox.py` (`main`, `measurement_json`).
- `services/tts/tests/test_release_chatterbox.py`, `test_chatterbox_sources.py`,
  `test_chatterbox_v7_preparation.py` and `test_chatterbox_v7_authority.py`.
- `services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py` and
  `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs` as unchanged boundaries.
- [ADR-0006](../../architecture/decisions/ADR-0006-json-schema-contract-authority.md),
  [ADR-0064](../../architecture/decisions/ADR-0064-admit-msgpack-chatterbox-v7.md),
  the [CCF plan](../completed/confirmed-chat-findings-minimal-corrections.md), and
  its [C05 follow-up](../completed/epub-budget-cancellation-and-reflow-follow-up.md).

The [compact diagram](../../architecture/system-diagram-compact.md) is an
orientation aid, not a replacement for canonical limits or status authority.
Search actual consumers before changing command presentation or moving guidance.

## Architecture and constraints

Preserve EPUB privacy, local inference, bounded work/audio, cancellation,
stable locators and generated-audio non-persistence. The new diagnostic contains
only the selected numeric package version, with no paths, input content or host
data. It identifies a target; it does not assert validation success or admission.

All acceptance commands continue to run in normal local PowerShell outside the
managed sandbox. GitHub access, if later needed and authorized, uses an accessible
permitted environment; access does not authorize a Git mutation.

The CLI is maintainer tooling. Its diagnostic does not alter the product data
flow or packaged Python closure. Review the canonical diagram for this conclusion
at closeout; no topology edit or new ADR is expected. No narration-preparation
boundary is changed. Any contrary discovery requires replanning before edits.

## Milestones

### Milestone 1: Correct current claims and make reading task-directed

Status: complete; implementation accepted under DGC-CR-R1-20261114.

Recheck the CCF commit ancestry and owners, then replace the transient
uncommitted claim with durable, attributed wording. Explain setup's deferred
compatibility sentence as a historical foundation constraint or replace it with
the current support reference. Do not infer current CI or runtime acceptance
from an old commit.

In existing guidance, add concise routes for isolated fixes, maintainer CLI work,
and multi-component/refactor campaigns. Amend only AGENTS' reading instructions
to select the relevant canonical sections and applicable ADRs after consulting
the index and product constraints. Retain full boundary review when components,
contracts or data flows change, and retain the special M005 reading requirement.
The compact diagram must not replace detailed architecture where it is needed.

Link the existing isolated-change and campaign procedures without redefining
their eligibility or gates. Preserve all model, host-validation, independence,
identity and authorization rules. Consolidate only demonstrated repetition in
touched sections; no new umbrella document or file-size target is required.

Acceptance: each corrected current claim has source evidence; an isolated fix,
a CLI change and a cross-component campaign each have an unambiguous reading and
review route. Their applicable checks and safety obligations remain intact.

### Milestone 2: Add explicit historical aliases and version diagnostics

Status: complete; implementation accepted under DGC-CR-R1-20261114.

Add these proposed aliases to `package.json` using the existing CLI and an
explicit `--package-version 2` (they do not exist at the planning base):

- `package:chatterbox-optional:v2` -> `build`.
- `package:chatterbox-optional:v2:check-source` -> `check-source`.
- `package:chatterbox-optional:v2:check-acquisition` -> `check-acquisition`.

Keep every existing alias, the default `2`, and all builder arguments unchanged.
For `build`, `check-source` and `check-acquisition`, emit one bounded selection
line to **stderr**, such as `Chatterbox package selection: v2`, after argument
validation and before dispatch. Derive it from the parsed version, for default
and explicit selections alike. Do not hardcode a second "latest version" policy.
Preserve stdout byte-for-byte for existing success messages and build JSON;
preserve failures and exit codes. Other subcommands remain outside this change.

Trace consumers and retain controls for default/explicit v2, explicit v7,
invalid arguments and a failing checker. Tests call the real CLI entry point,
substituting the expensive build boundary with a controlled result. Assert
selected handler/version, unchanged stdout, isolated stderr, failure propagation
and absence of unrequested dispatch. Exercise proposed aliases against the same
configured command contract. Never build/download a historical runtime merely
to test its alias. Reuse existing builder/integrity tests as adjacent controls.

Acceptance: the default and explicit-v2 routes remain equivalent; version
visibility cannot contaminate JSON/stdout, convert failure into success, or
select another runtime. Current v7 checks and frozen-source protections pass.
Document the diagnostic and the new aliases beside the existing historical warning.

### Milestone 3: Make the C05 successor criterion durable and discoverable

Status: complete; implementation accepted under DGC-CR-R1-20261114.

Add a concise pending-maintenance entry to the existing TTS organization guide
and link it from the appropriate current index summary. Retain its original CCF
alias, ADR and follow-up links, affected packaged decoder, known ASCII-produced
identity boundary and deferred status. Do not invent a delivery date or VF ID.

The next separately versioned runtime must port only the required identifier
validation correction and run existing valid/invalid Unicode and ASCII vectors
against its actual packaged decoder, alongside that successor's normal
acceptance. Current-checkout tests alone cannot close this criterion.

Acceptance here is the verified handoff, not C05's implementation. The pending
runtime work must remain visible after this plan closes; no claim of universal
Unicode parity, new support or changed package authority is allowed.

### Milestone 4: Validate the combined patch and close the plan

Status: complete; implementation accepted under DGC-CR-R1-20261114.

Run the applicable gates below; inspect the complete diff and protected paths.
Obtain `change_reviewer` approval for the exact CLI/documentation patch under the
existing Astra-high workflow, including the realistic routing scenarios from
Milestone 1. Resolve actionable findings and rerun only invalidated checks with
properly attributed evidence. The earlier Astra-max case assessment does not
replace implementation review. Do not apply the refactor campaign machinery to
this bounded CLI behavior change.

Freeze final documentation before its review. Record exact commands, outcomes
and limitations; archive this plan only when its work and review are accepted.
Update both plan indexes and the documentation index, with the closing edits
covered by current review. C05 remains a separately deferred runtime criterion.

## Testing and benchmark strategy

Commands below already exist unless explicitly labeled as new in Milestone 2.
Use the repository root as cwd and normal local PowerShell outside the sandbox.
Record pre-existing failures separately and capture execution identities/results;
the planning inspection supplies no reusable runtime PASS.

| Gate | Command or review | Timing and evidence |
| --- | --- | --- |
| Documentary integrity | `git diff --check`; `pnpm.cmd check:evidence`; inspect all new/untracked content and local link targets | Planning and final changed documentation; verify the 12 plan sections and protected-history boundary. |
| Python fast checks | `pnpm.cmd format:check:python`; `pnpm.cmd lint:python`; `pnpm.cmd typecheck:python` | Before behavioral tests after the relevant source/test edits. |
| Script formatting | `pnpm.cmd format:check:typescript` | After `package.json` changes; this configured command does not validate Markdown. |
| CLI and adjacent regressions | `pnpm.cmd test:python` | Baseline before CLI edits and once on the final relevant Python inputs; the model-free suite discovers the new CLI test file and existing release/version guards. |
| Current source/acquisition authority | `pnpm.cmd package:chatterbox-optional:v7:check-source`; `pnpm.cmd package:chatterbox-optional:v7:check-acquisition` | After CLI edits; successful checks do not prove installed runtime behavior. |
| Historical alias equivalence | Existing generic source/acquisition checks and the corresponding new explicit `:v2` checks | Execute only after the aliases exist; compare exit status, legacy stdout and the version-selection stderr line. Do not run either `build` alias. |
| Independent acceptance | Current Change Review Report and routing scenarios | After the combined patch and host evidence are ready; no writer or Git mutation during review. |

For historical equivalence, the existing commands are
`pnpm.cmd package:chatterbox-optional:check-source` and
`pnpm.cmd package:chatterbox-optional:check-acquisition`. The future explicit
counterparts are named in Milestone 2 and become executable only after that edit.

This scope needs no new model, performance, WebView2, installer or package-build
experiment: it does not change runtime payloads, packaging algorithms or native
integration. Applicable CI requirements remain unchanged. If inspection discovers
an affected build/verification/runtime boundary beyond CLI presentation, stop,
record the changed scope and select that boundary's existing gates before editing.
Reuse evidence only under the existing complete input/environment proof; do not
rerun unchanged expensive checks merely to create another receipt.

## Risks and rollback

- Consumers may treat stderr as significant. Inspect known consumers and test
  success/failure behavior; do not silently change stdout or select a new default.
- Narrower reading language could be misread as an exemption from requirements.
  Validate the three routing scenarios and retain canonical authority and all gates.
- Further status drift may be found. Correct only attributable claims in the
  touched sections; unrelated uncertainty is a recorded follow-up, not a rewrite.
- The C05 handoff could be mistaken for a shipped fix. Keep it explicitly deferred
  and identify the future packaged-decoder evidence required for closure.
- Revert only task-owned source/documentation hunks if a change is rejected,
  preserving pre-existing or concurrent edits. No installed data, firewall rule,
  published artifact or model state should be modified by this work.

## Progress log

- 2026-11-14: rechecked clean `main` at the planning base; read project/plan rules,
  prior documentary work, current guidance, CLI routing, manifests and tests.
- 2026-11-14: retained the independent review's qualifications: host validation is
  justified, excessive repeated checks are not established, and model/workflow
  costs are conditional rather than demonstrated defects.
- 2026-11-14: scope clarified to include explicit v2 aliases and selected-version
  visibility while preserving existing command behavior. Milestones remain pending.
- 2026-11-14: created this ExecPlan and its active-index entry. Planning checks are
  recorded below; no implementation, branch, commit, push or PR has occurred.

## Discoveries and decisions

- Keep named models, independent review and outside-sandbox acceptance unchanged.
- Use the existing documentation and workflow owners; add no parallel rulebook,
  review ceremony or automatic model fallback.
- Preserve machine-consumed stdout and expose CLI selection separately on stderr.
  Version visibility is not proof of validity, current admission or runtime health.
- C05 already has a correction strategy. This plan makes its handoff durable;
  a new runtime and its acceptance remain a separate implementation decision.
- No further product or model decision is needed to execute this bounded scope.
  Recheck the checkout and any overlapping work before implementation.

## Final validation results

Planning results are historical below; current execution and acceptance follow in the execution checkpoint.

- Repository inspection: `main`, planning HEAD above, clean before planning edits.
- Planning structure/link review outside sandbox: PASS; all 12 required sections
  occur once, the two planning files have no trailing whitespace, and all 31
  relative file/directory link targets exist. Section anchors were also inspected.
- `git diff --check` outside sandbox: PASS. The new, untracked plan was inspected
  separately because an unstaged Git diff alone does not include its contents.
- `pnpm.cmd check:evidence` outside sandbox: first attempt stopped before the
  guard because the environment selected pnpm 11.25.0 instead of required
  11.15.1. Selecting the existing Corepack shims on the command process's PATH
  resolved the mismatch; the unchanged command then exited 0 with
  `Evidence retention check passed`. No global tool installation was required.
- Planning-only review boundary: these two files define future work; they do
  not change runtime behavior or current acceptance rules. The implementation
  review required by Milestone 4 remains pending.
- At planning time, implementation tests/review were pending; see the execution checkpoint for their completed results.
- Runtime, installed-package and C05 compatibility acceptance: not claimed.

### Execution checkpoint — 2026-11-14

The initial two planning changes were expected task inputs. No other user changes
were present; HEAD remains the planning base. Milestones 1-3 are implemented.
Named roles, host validation and all acceptance obligations remain unchanged.
C05 is documented under pending runtime maintenance and remains deferred.
Canonical topology was reviewed: only maintainer CLI presentation changes, so
no system-diagram, runtime, generated authority or dependency edit is required.

All commands below ran outside the sandbox with the existing Corepack shims:

- Baseline `pnpm.cmd test:python`: 1098 passed in 101.14 seconds; one existing
  pytest nodeids-cache permission warning. No behavior failure.
- `pnpm.cmd format:check:python` and `pnpm.cmd lint:python`: PASS.
- First `pnpm.cmd typecheck:python`: FAIL on a non-exported test import. Corrected
  the test to import the authority module directly; all three Python fast checks
  then PASS. `pnpm.cmd format:check:typescript`: PASS.
- Current v7 `check-source` and `check-acquisition` aliases: PASS.
- Generic and explicit-v2 `check-source` and `check-acquisition` aliases: PASS;
  legacy stdout and selected-version stderr are covered by the CLI tests.
- `git diff --check` and `pnpm.cmd check:evidence`: PASS before final closeout.
- Post-change `pnpm.cmd test:python`: 1114 passed in 94.53 seconds, including 16 new CLI cases; the same pre-existing cache warning remains. No historical test result was reused.

Local raw logs are ignored `tmp/evidence/development-guidance/*.log` captures. The new
immutable review receipt paths are
`docs/plans/evidence/development-guidance-and-command-clarity/review-r1.md` and,
if archival changes require another assessment, `review-final.md` in that folder.
These receipts stay outside their own identity manifests. No source evidence
from the preceding case review substitutes for implementation acceptance.
### Accepted implementation and archival handoff

DGC-CR-R1-20261114 returned APPROVE with no findings for the exact implementation
and host evidence. All four milestones are complete at the implementation boundary.
The plan is archived after that approval; closing indexes/links receive a separate
[final documentary assessment](../evidence/development-guidance-and-command-clarity/review-final.md).
The [implementation receipt](../evidence/development-guidance-and-command-clarity/review-r1.md)
retains original reviewed identities. No source, test, package or environment
change follows the accepted runs, so their results are attributed to R1 rather
than claimed as rerun for archival. Final doc guards are executed again.
C05 remains deferred. No commit, push, PR, publication, runtime build/download,
installer or host configuration change was performed.