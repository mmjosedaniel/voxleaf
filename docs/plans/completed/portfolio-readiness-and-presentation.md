# Portfolio readiness and presentation

Created: 2026-11-14.
Status: implementation accepted under PORTFOLIO-READINESS-CR-R2-20261114; final archival assessment is recorded separately.
Base: `97d36c213e16ea015c24b1589454d61dab4379ea`, clean `main`, empty index.

## Goal

Make VoxLeaf easy to evaluate as a full-stack local-AI application developed
through agentic workflows, while resolving the observed Windows CI uncertainty.

## User-visible outcome

Visitors see the real application, can use the existing demo video, understand
the available evaluation paths, and distinguish the maintainer's contribution
from agent implementation. Technical evidence and limitations remain accessible.

## Current state

The existing README has a working presentation-video reference but no product
screenshot. Product access requires a controlled unsigned Windows package or
development setup; GitHub runtime releases are not application installers.
The README has 294 lines and links detailed architecture and historical evidence.
The author originated the idea, selected some tools and chose agentic workflows;
the agentic workflow performed development. Do not attribute manual code authorship,
model training, unconfirmed testing or all architecture decisions to the author.

Foundation run `43625830795` failed on the Windows SAC12 blocked-stdin cancellation
test at its Busy assertion. Current main run `43642787754` and PR #317 checks pass.
That success does not establish the earlier failure's cause. Inspect the test's
thread-start assumption, real pipe backpressure, cancellation and cleanup before
classifying the issue. Consult findings history and retain failed evidence.

## Scope and non-goals

First delivery: CI diagnosis and a bounded correction if justified; README and
portfolio documentation; a real screenshot using self-authored content; an
existing-video link; reproducible sample/evaluation instructions; concise case
study, agentic-development attribution and navigation to current technical docs.
Permitted support paths include a sample generator and its focused tests if an
existing fixture facility cannot supply a portable sample safely.

The separate maintainability plan owns App, ReaderPublication and narration
coordinator audits. No runtime publication, signing purchase, model download,
new engine, cloud inference, broad source refactor or external deployment belongs
to this delivery. Prior Git authorization covered #317; this delivery leaves
changes unstaged unless separately authorized. Existing frozen authorities,
runtime releases and historical evidence remain unchanged.

## Relevant files and documentation

- `AGENTS.md`, `.agents/PLANS.md`, `docs/README.md`.
- `docs/product/mvp.md`, `docs/architecture/system-diagram.md`,
  `docs/architecture/overview.md`, `docs/architecture/system-diagram-compact.md`.
- `README.md`, `docs/user/windows-release.md`, development setup/testing.
- `apps/desktop/src-tauri/src/tts_service_supervisor.rs` and its `tests.rs`.
- `.github/workflows/foundation-checks.yml`, `package.json`.
- Findings workflow/registry/import coverage and independent change review.
- `docs/portfolio/` for the new public evaluator path and case study.

## Architecture and constraints

The product remains a Windows Tauri/React reader with Rust supervision, typed
contracts and local Python TTS. Browser reader demonstration cannot claim native
narration. Preserve EPUB privacy, local inference, cancellation, bounded memory,
stable positions and generated-audio non-persistence. Use only authored sample
text in public images. Label visual-reader screenshots truthfully; do not simulate
speech, infer audio success from highlighting or present a mockup as a screenshot.

## Milestones

1. Diagnose CI: inspect old failure/current code, reproduce a discriminating
   ordering where possible, correct only the responsible boundary, validate and
   obtain independent review for test/behavior changes.
2. Present the product: shorten the README, retain existing video, add a real
   product capture and obvious links for demo, evaluation and technical decisions.
3. Make evaluation practical: provide an authored sample and reproducible path;
   distinguish browser reading, controlled desktop evaluation and runtime assets.
4. Explain engineering and authorship: local-AI architecture, three concrete
   tradeoffs, attributed measurements, agent roles and limitations; improve entry
   navigation without rewriting historical receipts.
5. Validate all changed paths, review required behavior/tooling, archive this plan
   only after its acceptance. Carry separate maintainability status honestly.

## Testing and benchmark strategy

All commands run in normal local PowerShell outside the sandbox, using existing
Corepack shims and repository-pinned pnpm. Raw logs belong in ignored
`tmp/evidence/portfolio-readiness/`; concise reports belong under
`docs/plans/evidence/portfolio-readiness/` outside their own identity manifests.

| Gate | Command / inspection | Timing and invalidation |
| --- | --- | --- |
| Rust test diagnosis | Existing Cargo test runner narrowed to the SAC12 test and adjacent tests | Before/after any test or supervisor edit; runtime/compiler/test changes invalidate |
| Rust acceptance | `pnpm.cmd format:check:rust`, `pnpm.cmd lint:rust`, `pnpm.cmd test:rust` | After final Rust edit, default and release-locked variants as configured |
| Sample tooling | Existing Node test runner for any added generator test; configured format/lint gates | Only if generator introduced; exact final source and sample bytes |
| Visual evaluation | Existing desktop `dev` command, actual browser inspection with authored EPUB | After sample creation; separate from native/audio acceptance |
| Documentation | `git diff --check`, `pnpm.cmd check:evidence`, local target and claim inspection | Final docs including untracked files; preserve failures |
| Independent review | `change_reviewer`, Astra high | Exact patch and host evidence; no edits during review |

No new performance benchmark is required for presentation alone. Historical
measurements retain profile/hardware/version attribution and are not fresh
results. Diagnostic ordering injection must be identified as such, not natural
CI reproduction. Add gates only for actual affected responsibilities.

## Risks and rollback

Keep uncertainty in the CI root cause explicit; never weaken Busy/cancellation
assertions to turn a race green. Do not expose private books, host paths or data
in screenshots/logs. Do not imply a public installer exists. Roll back only
task-owned edits; preserve user work. Restore task-owned demo processes and any
temporary diagnostic edit before acceptance. Publication remains a separate act.

## Progress log

- 2026-11-14: clean base inspected; user accepted the three-delivery approach,
  retained the current video and clarified author/agent contributions.
- 2026-11-14: current main CI and #317 are green; previous Windows Busy assertion
  failure retained for investigation rather than treated as a current red build.
- 2026-11-14: VF-0057's delayed caller reproduces the earlier Busy assertion.
  A test-only correction synchronously admits the write, keeps real backpressure
  and requires a delivered cancellation error. Production Rust is unchanged.
- 2026-11-14: replaced the 294-line README with a 106-line presentation, retained
  the video, added an attributed case study and practical evaluation guide.
- 2026-11-14: authored bilingual sample XML and a generator using the existing
  deterministic fixture builder; two public-boundary checks pass. The sample
  test joins the existing TypeScript aggregate so CI discovers it.
- 2026-11-14: inspected the real browser reader with the sample, English/Spanish
  TOC navigation, Settings and Light theme. Saved the deliberate curated portfolio
  asset `docs/portfolio/assets/reader.jpg`; it is a public product illustration,
  not a raw acceptance screenshot. No narration or restoration rerun is claimed
  for that visual session. The task tab and development server were closed;
  port 5173 no longer had a listener.
- 2026-11-14: PORTFOLIO-READINESS-CR-R1-20261114 requested one correction: a
  historical Chatterbox latency pair had been mislabeled as Piper in the new
  case study. Removed that purported Piper measurement, retaining only the
  correctly attributed historical Chatterbox v2 observation and its limits.
  R1 confirmed code/sample coverage and reported no other actionable finding.
  The original report and identities are retained; renewed review is pending.
- 2026-11-14: PORTFOLIO-READINESS-CR-R2-20261114 returned APPROVE, with F1 resolved
  and implementation evidence reuse explicitly justified for the documentary
  correction. Milestones 1-4 and implementation review are complete. Archive,
  navigation and the VF-0057 closeout are covered by the separate final assessment.

## Discoveries and decisions

- Present full stack as React + Rust + Python local processing, without implying
  a hosted backend or personally written implementation.
- The README is the short entry point; detailed guidance stays under docs.
- A separately hosted browser demo is optional future publication, not needed
  to claim completion of the local evaluation route.

## Final validation results

Implementation accepted. This archived closeout preserves exact commands,
failed diagnostic evidence and the independent reports.

- See [VF-0057 diagnosis](../evidence/portfolio-readiness/ci-diagnosis.md) for
  retained baseline PASS, intended diagnostic failure and final Rust evidence.
- `pnpm.cmd format:check:rust`, `pnpm.cmd lint:rust`, `pnpm.cmd test:rust`: PASS;
  191 default / 190 release-locked tests pass, with 9 explicit ignores in each.
- `pnpm.cmd test:portfolio-sample`: PASS, 2 tests; `pnpm.cmd demo:sample`: PASS.
- `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:typescript`: PASS.
- `pnpm.cmd test:typescript`: PASS, 212 shared + 1,072 EPUB + 1,358 desktop Vitest
  cases, 248 desktop Node cases and 2 sample cases. Receipt: `ts-tests.log`.
- `pnpm.cmd typecheck:typescript`: PASS, all three packages; `ts-types.log`.
- `git diff --check`, `pnpm.cmd check:evidence`, changed-Markdown local targets
  (446) and trailing-whitespace inspection: PASS before review.
- Host tools: pnpm 11.15.1 through existing Corepack shims, Node 24.20.0 (within
  declared engines; `.nvmrc`/CI pin 24.18.0), Cargo 1.97.1. No global install or
  toolchain switch. Hosted CI on the base is context, not new-patch acceptance.
- Independent implementation review: [R2 APPROVE](../evidence/portfolio-readiness/review-r2.md),
  after [R1 CHANGES_REQUESTED](../evidence/portfolio-readiness/review-r1.md).
  The [final archival assessment](../evidence/portfolio-readiness/review-final.md)
  covers closing documentation and indexes; its reserved receipt is outside its
  own identity manifest. Source/test/configuration and environment are unchanged
  after accepted checks; reuse is attributed rather than described as reruns.
- No Python/runtime/model/installer edit or public deployment was performed.
- No branch, commit, push or PR was created. C05 remains deferred to the next
  runtime; public signing, hosted demo publication and optional refactor proposals
  remain separate work. The current video is intentionally retained.
