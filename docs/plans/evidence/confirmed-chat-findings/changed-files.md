# Confirmed chat findings: changed files

Snapshot of the task-owned worktree against planning HEAD
`4b10dc0a7cc400b5b3c1a9ac2010ceb1e801afef`. The initial worktree/index were clean;
no changes are staged. Generated core authority and bindings were regenerated
through their configured generators. Ignored raw evidence and build payloads are
not Git changes. See the [execution ledger](execution-ledger.md).

This snapshot precedes the final archival report. That additional immutable file,
`docs/plans/evidence/confirmed-chat-findings/review-CCF-R3-20261104.md`, is retained
outside its own reviewed manifest and this frozen inventory.

```text
 M apps/desktop/scripts/native-smoke/tts-scenarios.mjs
 M apps/desktop/scripts/ordinary-chatterbox-release-host.mjs
 M apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs
 M apps/desktop/scripts/windows-release.node-test.mjs
 M apps/desktop/src-tauri/src/tts_optional_chatterbox.rs
 M apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs
 M apps/desktop/src-tauri/src/tts_protocol_contract.rs
 M apps/desktop/src-tauri/src/tts_protocol_contract/tests.rs
 M apps/desktop/src/App.test.tsx
 M apps/desktop/src/App.tsx
 M apps/desktop/src/persistence/narration-position-save-bridge.test.ts
 M apps/desktop/src/reader/ReaderPublication.test.tsx
 M apps/desktop/src/reader/ReaderPublication.tsx
 M apps/desktop/src/reader/segment-highlight-controller.test.tsx
 M apps/desktop/src/reader/segment-highlight-controller.ts
 M apps/desktop/src/tts/ProductNarrationControls.test.tsx
 M apps/desktop/src/tts/ProductNarrationControls.tsx
 M apps/desktop/src/tts/pcm-playback-contracts.ts
 M apps/desktop/src/tts/pcm-playback.test.ts
 M apps/desktop/src/tts/pcm-playback.ts
 M apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.test.ts
 M apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.ts
 M apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts
 M apps/desktop/src/tts/playback-transition-policy.test.ts
 M apps/desktop/src/tts/playback-transition-policy.ts
 M apps/desktop/src/tts/product-narration-coordinator.test.ts
 M apps/desktop/src/tts/product-narration-coordinator.ts
 M apps/desktop/src/tts/product-narration-presentation.test.ts
 M apps/desktop/src/tts/product-narration-presentation.ts
 M apps/desktop/src/tts/snapshot-subscription-hooks.test.tsx
 M apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts
 M apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts
 M docs/README.md
 M docs/architecture/decisions/ADR-0006-json-schema-contract-authority.md
 M docs/architecture/decisions/ADR-0063-default-cuda-and-celsius-boundaries.md
 M docs/development/setup.md
 M docs/development/testing.md
 M docs/plans/active/README.md
 D docs/plans/active/confirmed-chat-findings-minimal-corrections.md
 M docs/plans/completed/README.md
 M docs/product/mvp.md
 M docs/product/reader-settings-and-playback-controls.md
 M packages/epub/src/integration/narration-preparation-matrix.test.ts
 M packages/epub/src/narration/narration-bilingual-normalizer.ts
 M packages/epub/src/narration/narration-normalizer.test.ts
 M packages/epub/src/narration/narration-preparation.ts
 M packages/epub/src/narration/narration-prepared-segment.ts
 M packages/epub/src/narration/narration-resource-bounds.test.ts
 M packages/epub/src/narration/narration-work-controller.ts
 M packages/shared/schemas/primitives/v1.schema.json
 M packages/shared/src/contracts/serialized-conformance.test.ts
 M packages/shared/src/generated/validators/standalone.ts
 M scripts/build-windows-release.ps1
 M services/tts/benchmarks/dual_worker_runtime.py
 M services/tts/release/core/core-package-evidence-v1.json
 M services/tts/release/core/runtime-manifest-v1.json
 M services/tts/src/voxleaf_tts/generated/protocol_schemas.py
 M services/tts/tests/test_benchmark_dual_worker_runtime.py
 M services/tts/tests/test_protocol.py
?? docs/plans/completed/confirmed-chat-findings-minimal-corrections.md
?? docs/plans/evidence/confirmed-chat-findings/changed-files.md
?? docs/plans/evidence/confirmed-chat-findings/execution-ledger.md
?? docs/plans/evidence/confirmed-chat-findings/review-CCF-R1-20261104.md
?? docs/plans/evidence/confirmed-chat-findings/review-CCF-R2-20261104.md
?? docs/plans/evidence/confirmed-chat-findings/validation-commands.md
?? packages/shared/fixtures/contracts/tts-protocol-control/v1/ccf-identifier-vectors.json
```
