# RPI implementation review request

Task: reader-position-and-image-lifecycle, M0-M3. Base and HEAD:
`26f92365eed3d30cbcb57eb2867b848d3beb28c4`; branch
`codex/reader-position-image-execplan`. Starting worktree/index were clean.
All current changed/new paths belong to this task. No implementation commit,
push or PR is authorized. Required role: `change_reviewer`, GPT-6 Astra high,
read-only, without test execution or delegation.

## Requested behavior and preservation constraints

Review the [ExecPlan](../../completed/reader-position-and-image-lifecycle.md),
[ADR-0071](../../../architecture/decisions/ADR-0071-reader-checkpoint-and-image-lifetime.md),
and [execution ledger](execution-ledger.md), including P1-P5, I1-I5 and C1.

- Preserve a canonical interior checkpoint through temporary block fallback,
  appearance changes, layout-only observations, lifecycle flush and reopen.
  Keep package recovery, genuine manual/explicit progress, heard precedence,
  actual visible narration placement and StrictMode ownership.
- Reuse image capacity by viewport visibility, with fixed eight live sources,
  eight active-plus-queued loads, one decode and 16,777,216 aggregate pixels.
  Differentiate transient pressure from permanent rejection; retry only eligible
  work on capacity/visibility change; preserve geometry, cancellation and cleanup.
- Check their combined behavior. Ordinary and delayed local decode exposed a
  second path from a settled interior offset to the first caret on the same line.
  The final patch adds a bounded transient settled-placement guard in the visual
  tracker. No production reflow/ReaderPublication rewrite is included.
- Preserve local-only publication processing, safe format admission, explicit
  source ownership and the current persistence schema/dependencies/CSP.

Historical DCR-02 remains withdrawn. RPI-02 extends the former deliberate
CAF R7.2 saturation policy. Historical C15 is still modeled-only; this task's
natural image observation is separately evidenced. Do not equate acceptance
with universal absence of future findings.

## Evidence and review identity

The execution ledger attributes every host check, initial failure and correction.
The curated `review-identities.md` records status, raw SHA-256 and filter-aware
blob identity for the complete changed code/documentation scope plus supporting
paths. Its own file and the review request/report are review metadata outside
the manifest, avoiding self-reference. New-file contents are available in the
worktree; use `git diff` for tracked changes. The ignored test-input snapshot
listed in the ledger supplements the curated review closure.

Snapshot base/HEAD and all reviewed identities before and after review. If an
additional supporting path is required, include its identity in the final
closed reviewed set. Review the exact current patch and matching host evidence,
report concrete findings and any material uncertainty, and return a unique
Change Review Report under `docs/development/agentic-change-review.md`.
Use repository-relative paths and content-safe counts/identities in the report.
Do not edit files or run tests. The coordinator will preserve the report.
