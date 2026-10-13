# Completed plans

Move finished ExecPlans here after their validation results and final decisions are recorded.

Completed plans are historical evidence. Do not edit them to describe a later implementation; create a new plan or ADR instead.

Use the [evidence retention policy](../../development/evidence-retention.md) for
supporting summaries, identities and archived raw captures. The
[PR #229 cleanup](pr-evidence-retention.md) is integrated in main.

This index is maintained navigation. Individual plans and acceptance receipts
remain historical: their Git/CI status and test counts describe their original
closeout, not the current checkout. Preserve those records and link subsequent
results here rather than rewriting them. Superseded proposals are listed
separately below and must not be scheduled for execution.

## Completed plans

- [`app-restoration-derivations.md`](app-restoration-derivations.md): extracted the shared publication-reference/sequence predicate, pending settlement transition and presentation mapper; 14 pure cases and two App characterization cases added. Independent baseline, post-change, browser/native, portable and full host acceptance pass; one fixture typing correction is separately recorded. Four source/test paths, 490 changed lines; App retains effects and resource ownership. Changes remain unstaged and uncommitted.

- [`apps-organization-follow-up.md`](apps-organization-follow-up.md): native resource/TTS/reader helper extraction, intact publication lifecycle move and byte-identical image/test grouping; separately reproduced and reviewed seek-observation repair. Fresh baselines, unit acceptance, combined portable/full, browser/native, benchmark and Piper/Chatterbox Spanish/English gates pass. Qwen remains deferred; changes are unstaged and uncommitted at closeout.
- [`desktop-state-subscription-hooks.md`](desktop-state-subscription-hooks.md): two typed snapshot observation hooks, all four controls/Settings migrations and twelve added lifecycle/characterization cases; independent baseline, checkpoint, post-change, browser, native, portable and full host gates pass. Same coordinator ownership and behavior; source/test scope is eight paths and 592 changed lines under the audited 600-line ceiling. Changes remained unstaged and uncommitted at closeout.
- [`app-conditional-presentation.md`](app-conditional-presentation.md): extracted ApplicationBar, ShellWelcome, EmptyPublicationNotice and ReadyPublicationSection, with typed reader props and three App characterization tests; independent baseline/post-change/browser/native/portable/full acceptance passed after correcting a local EdgeDriver mismatch. Public behavior and resource ownership are preserved; changes were unstaged and uncommitted at closeout.
- [`app-preference-effects-readability.md`](app-preference-effects-readability.md): extracted startup preference hydration and the narrator presentation binding after 28 App characterization cases; 16 module cases and independent browser/native/aggregate validation passed. The later [Windows child-reaping test repair](../evidence/native-child-reaping-test-repair/README.md) records its separate correction and evidence.
- [`piper-runtime-pr-218.md`](piper-runtime-pr-218.md): upgraded the current Piper runtime to 1.8.0 with ONNX Runtime 1.30.0, preserving both voice artifacts and recording independent bounded ES/EN host acceptance.
- [`piper-onnxruntime-pr-219.md`](piper-onnxruntime-pr-219.md): upgraded ONNX Runtime to 1.30.0 with independent Piper ES/EN validation; Piper 1.4.2 in this historical record precedes PR #218.

- [`app-hardware-effects-readability.md`](app-hardware-effects-readability.md): hardware visibility binding, five added unit/App cases, private preference types and named UI conditions; independent baseline/post-change and both aggregate gates PASS. Same coordinator ownership and behavior.

- [`app-readability.md`](app-readability.md): three stateless shell-presentation components and private messages, narrow readonly props, nine added integration cases and independent baseline/post-change/aggregate PASS. Preserved input identity, distinct preference handlers and publication lifecycle.

- [`tts-adapter-layout.md`](tts-adapter-layout.md): selective four-engine adapter layout, refreshed Piper and isolated local Chatterbox v4; preserved v2/v3 authorities and v3 admission. Independent three-baseline/22-gate PASS, bilingual candidate/desktop matrices, verified firewall cleanup and documentary closeout. Local v4 acceptance does not replace the admitted v3 package.

- [`tts-service-organization.md`](tts-service-organization.md): four independently accepted Python packaging-integrity, versioned release-authority, corpus and quality extractions; unchanged runtime/frozen authority, 457 Python tests and passing portable/native aggregate checks. Production runtime and frozen evaluation authority remain unchanged.

- [`desktop-source-organization.md`](desktop-source-organization.md): extracted semantic render planning and Web Audio contracts/backend, split the stylesheet with exact cascade reconstruction, and passed independent unit/model/portable/native validation. Publication and narration lifecycle ownership remain unchanged.

- [`pr-evidence-retention.md`](pr-evidence-retention.md): archived 276 original evidence files, retired 224 raw captures, retained immutable summaries/identities, added the tested retention guard and passed independent host acceptance; integrated in main with the native test-layout work.

- [`linux-rust-test-comparison.md`](linux-rust-test-comparison.md): repaired the pre-existing Linux compilation/lint blockers, passed independent paired 85/86 Rust suites and both Unix symlink cases, retained Windows 87/88 and native-startup success, and added the reviewed Ubuntu Rust CI job; remote execution was pending at original closeout; the later Ubuntu Rust foundation run passed on source HEAD `5401f899e3ffabfc8f3e79873bc0b5fa45b11155`.

- [`native-rust-test-layout.md`](native-rust-test-layout.md): completed six stages and ten private test-file moves, extracted the existing Windows probe, preserved assertions/fixtures/frozen authority and passed independent per-unit, portable, full and native-startup validation; production behavior and test assertions preserved.

- [`native-rust-module-organization.md`](native-rust-module-organization.md): completed all six stages with two diagnostic-only Rust extractions, ten independently audited SKIPs, unchanged runtime/contracts and passing Rust, WebView2, portable and full repository checks.
- [`development-toolchain-pr-222.md`](development-toolchain-pr-222.md): prepared 16 development dependency upgrades, deferred unsupported TypeScript 7, aligned Node requirements, and restored the benchmark's current UI interactions; local checks, browser/native benchmarks and independent review passed, with remote CI tracked in PR #222.
- [`legacy-runtime-cleanup.md`](legacy-runtime-cleanup.md): removed inactive Chatterbox v2 migration/repair and unused V1 preference metadata, preserved v3 cache-cleanup coverage and historical authority, and passed independent host validation.
- [`residual-code-cleanup.md`](residual-code-cleanup.md): removed unused reader styles and language options, retired the temporary narration bridge, and migrated its lifecycle tests to the public API; independent browser, package, portable, and native repository gates passed.
- [`bootstrap-test-cleanup.md`](bootstrap-test-cleanup.md): retired unused EPUB dependency probes and a shared-only test, transferred incremental XML coverage to the production reader, and strengthened isolated Python import verification; independent host validation passed.
- [`chatterbox-security-dependency-refresh.md`](chatterbox-security-dependency-refresh.md): admitted the security-refreshed v3 runtime, repaired validated cancellation containment, passed Piper/Chatterbox ES/EN installed journeys and independent review, and resolved all three integration CI gates.
- [`bounded-settings-and-chatterbox-modularization.md`](bounded-settings-and-chatterbox-modularization.md): extracted narration settings actions with independent acceptance, repaired bounded host-test profile synchronization, validated Piper/Chatterbox in Spanish and English, and closed the native Chatterbox audit as SKIP. Qwen3 work is deferred under ADR-0051.
- [`M001-engineering-foundation.md`](M001-engineering-foundation.md): established and validated roadmap Milestone 1.
- [`M002-shared-contracts-and-test-harness.md`](M002-shared-contracts-and-test-harness.md): established and validated the shared contract language and deterministic test harness for roadmap Milestone 2.
- [`M003-secure-epub-ingestion-and-document-model.md`](M003-secure-epub-ingestion-and-document-model.md): established and validated secure EPUB ingestion, immutable semantic documents, bounded local resources, and deterministic locator resolution for roadmap Milestone 3.
- [`M003-001-bounded-epub2-and-ncx-compatibility.md`](M003-001-bounded-epub2-and-ncx-compatibility.md): additively implemented and validated the bounded reflowable OPF 2.0/NCX profile, format-neutral reader/restoration/narration behavior, and affected browser/native package journeys for roadmap Milestone 3.1.
- [`M004-reflowable-visual-reader-and-position-restoration.md`](M004-reflowable-visual-reader-and-position-restoration.md): established and validated the reflowable visual reader, logical position tracking, bounded persistence, and restoration for roadmap Milestone 4.
- [`M004-001-native-webdriver-startup-smoke.md`](M004-001-native-webdriver-startup-smoke.md): replaced the native smoke transport with the supported Tauri WebDriver bridge and validated the packaged WebView2 harness.
- [`M005-narration-text-preparation.md`](M005-narration-text-preparation.md): established and validated deterministic, bounded, locator-linked narration normalization, segmentation, and the public preparation boundary for roadmap Milestone 5.
- [`M006-local-tts-feasibility-and-engine-profiles.md`](M006-local-tts-feasibility-and-engine-profiles.md): established and validated the privacy-safe local TTS feasibility protocol, rejected both exact profiles through the frozen matrix, and closed deterministic, hardware, privacy, artifact, and repository validation for roadmap Milestone 6.
- [`M006-001-local-tts-profile-blocker-resolution.md`](M006-001-local-tts-profile-blocker-resolution.md): evaluated the exact Qwen/Serena development candidate, retained the failed standard profile blocker, and closed Milestone 6.1 validation.
- [`M006-002-qwen-short-segment-batch-feasibility.md`](M006-002-qwen-short-segment-batch-feasibility.md): rejected shared batching, targeted placement, CPU-only generation, and dual-worker scheduling; retained one exact GPU worker only for the constrained demo; and closed Milestone 6.2 validation.
- [`M007-local-tts-service-and-process-protocol.md`](M007-local-tts-service-and-process-protocol.md): implemented and validated protocol v1, the bounded local Python service, native supervision, typed one-unit handoff, exact development-only Qwen/Serena integration, measured exact-host behavior, and repository/CI closeout for roadmap Milestone 7.
- [`M008-bounded-adaptive-prebuffering.md`](M008-bounded-adaptive-prebuffering.md): implemented and validated bounded adaptive preparation, sole-owner in-memory buffering, Web Audio playback, accessible controls, the exact-development coordinator, measured demo policy, and repository/CI closeout for roadmap Milestone 8.
- [`M008-001-boundary-aware-audio-transitions.md`](M008-001-boundary-aware-audio-transitions.md): implemented and validated bounded, interruptible semantic pauses between already-buffered generated units, stabilized the packaged synchronization proof, and passed replacement Ubuntu/Windows CI.
- [`M009-synchronized-reading-and-narration.md`](M009-synchronized-reading-and-narration.md): implemented and validated segment-level audible progress, reader highlighting and focus-safe following, identity-first synchronized navigation, non-skipping heard-position persistence, exact-host synchronization, and repository/CI closeout for roadmap Milestone 9.
- [`M009-001-reader-experience-stabilization.md`](M009-001-reader-experience-stabilization.md): repaired visible highlighting, implemented the fixed reader shell and locator-backed paragraph leaf, isolated passive scrolling, and closed exact-host and repository validation.
- [`M010-hardware-profiles-fallback-and-operational-resilience.md`](M010-hardware-profiles-fallback-and-operational-resilience.md): implemented privacy-safe host detection, measured profile matching, compatibility UI, identity-safe recovery, exact Piper CPU fallback integration, final support decisions, and passing repository/CI closeout for roadmap Milestone 10.
- [`M010-001-bilingual-narration-and-candidate-screening.md`](M010-001-bilingual-narration-and-candidate-screening.md): implemented explicit Spanish/English narration, admitted and integrated exact Piper, Chatterbox, and development-only Qwen language profiles, validated six packaged portfolio journeys, and passed repository/CI closeout for roadmap Milestone 10.1.
- [`M010-002-reader-settings-and-playback-controls.md`](M010-002-reader-settings-and-playback-controls.md): implemented bounded English-default narration preferences, the reader-first Settings shell, and six boundary-deferred repository-WSOLA playback rates; validated the six-arm packaged portfolio and maintainer all-rate journey; and passed required Ubuntu/Windows closeout for roadmap Milestone 10.2.
- [`M011-package-validate-and-release-mvp.md`](M011-package-validate-and-release-mvp.md): completed Windows/Piper local-portfolio release validation and optional Chatterbox acquisition; records the accepted unsigned candidate and renewed Milestone 7 evidence. Public signing remains a separate external authorization.
- [`typescript-maintainability-batch-20260803.md`](typescript-maintainability-batch-20260803.md): recovered durable scope and validation traceability for the small cross-package TypeScript/TSX maintainability batch, documented the independently found M011 cleanup correction, and closed repository plus installed-package validation.

## Superseded historical plans

- [`synchronized-reader-and-startup-buffer.md`](synchronized-reader-and-startup-buffer.md): original broad proposal, archived byte-for-byte. Focused M004, M008, M009 and M009.1 plans own the implemented reader, restoration, buffering and synchronization evidence. Its old pending statuses are historical, not unfinished work. Incoming links point directly to this archived copy.
