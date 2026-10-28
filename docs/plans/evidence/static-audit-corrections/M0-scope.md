# SAC M0 scope and evidence decisions

Recorded 2026-10-28 before implementation. Task: SAC-01 through SAC-15.
Base and current HEAD: `7c00f2f633ffd0c79043ab694f29b7defb46941a`.
Branch: `codex/static-audit-corrections`. Worktree and index were empty.
The implementation instruction supersedes the plan's planning-only permission.
No commit, push, pull request, merge, dependency or frozen-authority edit is authorized.

## Ownership and path allowlist

One integration batch; each production owner has one writer. Independent
investigations precede writing. Cross-owner harness edits belong to the director.

- A: `apps/desktop/src/tts/product-narration-coordinator.ts`, `pcm-playback.ts`
  and their adjacent tests; `apps/desktop/src/reader/segment-highlight-controller.ts`
  and its test, `ReaderPublication.tsx` and its test;
  `apps/desktop/src/tts/ProductNarrationControls.test.tsx`.
- B: `apps/desktop/src/persistence/hardware-profile-preference.ts` and its test,
  `reader-position-restore-coordinator.ts` and its test;
  `apps/desktop/src/settings/app-preference-effects.ts` and its test;
  `apps/desktop/src/App.test.tsx`, `apps/desktop/src/tts/hardware-profile-compatibility.test.ts`.
- C: `packages/epub/src/narration/narration-bilingual-normalizer.ts`,
  `narration-segment-packer.ts`, and conditionally `narration-prepared-segment.ts`;
  existing normalizer, packer, prepared-segment and resource-bounds tests;
  `packages/epub/src/integration/narration-preparation-matrix.test.ts`;
  `packages/epub/src/document/xhtml-projector.ts` and its test;
  `packages/epub/src/paths/ocf-reference.test.ts`;
  `packages/epub/src/public/open-epub-publication.test.ts`.
- D: `apps/desktop/src/reader/images/raster-image-policy.ts`,
  `raster-image-source.ts` and their tests. A small synthetic JPEG test fixture
  helper may be added if shared by the existing browser/native harnesses.
- E: `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`, its existing tests;
  `apps/desktop/src-tauri/src/tts_service_supervisor.rs`, its existing tests/fake child;
  `scripts/test-windows-package-lifecycle.ps1`;
  `apps/desktop/scripts/ordinary-chatterbox-release-host.mjs`, its Node test and
  `apps/desktop/scripts/windows-release.node-test.mjs`.
- Integration: `apps/desktop/tests/browser/foundation.smoke.spec.ts`,
  `reader-narration-bugfixes.smoke.spec.ts`, `apps/desktop/scripts/native-startup-smoke.mjs`
  and directly consumed synthetic fixture owners, identified before editing.
- Documentation: active ExecPlan, this evidence directory, maintained behavior
  documentation and a bounded new ADR if required. Completed plans and frozen
  authorities remain immutable. Additional paths require a recorded scope amendment.

## Evidence decisions before execution

The plan's historical receipts were located. The #280 Python aggregate log
contains 42 failures; it is not a PASS. Successful continuation receipts and
their input manifests are being compared per leaf. No historical result reuse
has been approved. Unknown closure, tool or environment evidence means rerun.

Changes invalidate dependent desktop, EPUB, browser, native and model-runtime
results. Existing runtime/model payloads and installers may be reused only as
verified artifacts. A new executable requires fresh runtime acceptance.
The retained installer choice for L1 and release-locked P1 prerequisites must
be resolved before expensive preparation. L1 must not remove an existing install.

No full baseline is selected. New regression assertions run against original
owners first; intended failures and exact input snapshots are retained locally.
Final applicable leaves, B1, N1, H-CPU, H-GPU, P1 and L1 remain mandatory as
specified in the plan. Full TS/Rust suites run once after integration, not per
finding. No aggregate PASS is inferred from selected leaves.

Every test, build, formatter and validation command runs in normal local
PowerShell outside the managed sandbox. Local receipts under ignored
`tmp/evidence/static-audit-corrections/` record command, outcome, time, source
membership/hashes, tool/environment identities, artifacts and cleanup.
This is a scope record, not implementation or acceptance evidence.
