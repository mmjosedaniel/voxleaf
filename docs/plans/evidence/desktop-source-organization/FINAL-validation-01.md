# Validation Report

Report ID: DESKTOP-SOURCE-ORGANIZATION-FINAL-01
Target ID: DESKTOP-SOURCE-ORGANIZATION
Mode: FINAL
Verdict: PASS
Environment: local PowerShell outside sandbox; all mandatory F commands and final identity/comparison checks ran through require_escalated host execution. PowerShell 7.6.5, Node v24.20.0, pinned cached pnpm 11.15.1, uv 0.11.29. Existing Corepack shim prepended process-locally; COREPACK_ENABLE_NETWORK=0. NODE_OPTIONS unset; all twelve model-profile variables removed by existing lifecycle policy. HF_HUB_OFFLINE=1, TRANSFORMERS_OFFLINE=1, UV_OFFLINE=1 and UV_NO_SYNC=1. Director explicitly approved uv offline/no-sync controls; repository command text remained unchanged. Existing matching EdgeDriver selected. No downloads, package sync, installations, source/configuration/Git edits or firewall mutations by validator. All writers idle.
Starting HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Ending HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Validated paths: the closed thirteen paths from FINAL-terms-01.md, enumerated below. All exact identities matched their accepted unit POST-CHANGE-02 reports before F.
Validated path identities: before-command exact porcelain, SHA256 and filter-aware expected index blob; identical after F.

```json
[
  {
    "path": "apps/desktop/src/tts/pcm-playback.ts",
    "status": " M apps/desktop/src/tts/pcm-playback.ts",
    "sha256": "9D73CB124A89B447EC69B2A850A9B14357121D0050FF5F86831CE7AB753974A2",
    "blob": "64d0bdb054401ade707d9cab2e9db2ba7d3d83d0"
  },
  {
    "path": "apps/desktop/src/tts/pcm-playback-contracts.ts",
    "status": "?? apps/desktop/src/tts/pcm-playback-contracts.ts",
    "sha256": "B45856D7F5DD8A5BBD0FE86DB8DAC2BFDA75E26B646BE2FD5CFC5B2316324418",
    "blob": "a5b74edad0c94581b5dc79baff33781f5f7a0130"
  },
  {
    "path": "apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts",
    "status": "?? apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts",
    "sha256": "A6CF4F3A7E727A23737EDCB4E898F6DFFEF98461F4959F52C9D83E4CDD408FB2",
    "blob": "fcc6fc5088d78ea4c5ff26249287aea818a85ffe"
  },
  {
    "path": "apps/desktop/src/reader/SemanticDocument.tsx",
    "status": " M apps/desktop/src/reader/SemanticDocument.tsx",
    "sha256": "6559C258CE1A2247897DCB131D6D5D4A5B79AED6F0CE8F94D6700189151FE8E2",
    "blob": "2461f6208cc6e1b082b1c7977143f37903d2e041"
  },
  {
    "path": "apps/desktop/src/reader/semantic-document-render-plan.ts",
    "status": "?? apps/desktop/src/reader/semantic-document-render-plan.ts",
    "sha256": "51E91A57D9ED9C6B9734434F8489AD150DE0E6D22DAE8888A3036263E1A247CB",
    "blob": "f7083cd49d14c17eaeefd898ed230da223042616"
  },
  {
    "path": "apps/desktop/src/reader/SemanticDocument.test.tsx",
    "status": " M apps/desktop/src/reader/SemanticDocument.test.tsx",
    "sha256": "C37C3437C433F8E73DEA95C36373D2C7A8842746D0A0FFD82B5C5555B06981A3",
    "blob": "26ba73dc3fb43d41f345ae852131ae2846e1d1ef"
  },
  {
    "path": "apps/desktop/src/styles.css",
    "status": " M apps/desktop/src/styles.css",
    "sha256": "FC52941B61627BF7156504B46704E2B55B204EAACCEE3405B36DA39C030516E9",
    "blob": "ddd37bc4ab0c7b19723892bd803fd35ce5c21a2a"
  },
  {
    "path": "apps/desktop/src/styles/shell-and-publication.css",
    "status": "?? apps/desktop/src/styles/shell-and-publication.css",
    "sha256": "5D53E49F2D931F81A7BE7EC2879246AB42217545F1B5F45F5AE91EE7B2204E4B",
    "blob": "da60d48ec0995644065587f5d1bb86845170e44c"
  },
  {
    "path": "apps/desktop/src/styles/reader.css",
    "status": "?? apps/desktop/src/styles/reader.css",
    "sha256": "0E3872D94ABB247A376D339454A86CE540750EE1FBEFBDB049629B16AA5F00EB",
    "blob": "37c06d4e4119615a843be05c57628fab312c39d9"
  },
  {
    "path": "apps/desktop/src/styles/narration-and-publication-states.css",
    "status": "?? apps/desktop/src/styles/narration-and-publication-states.css",
    "sha256": "714635ECD2ABE6E502E48CCD20D9E51B9A97B71AC56B679A8952D8A031639359",
    "blob": "a78d9211682ed9123a6e6a6d10713523b93ea21c"
  },
  {
    "path": "apps/desktop/src/styles/accessibility-and-responsive.css",
    "status": "?? apps/desktop/src/styles/accessibility-and-responsive.css",
    "sha256": "06F0769EA414FD81A7D9C0862999571C98B826138A8DC95311866CCD5AB0FBE2",
    "blob": "ab7b261f74e4a8076442f2bf2b230ffc7314d03a"
  },
  {
    "path": "apps/desktop/src/styles/reader-shell-and-settings.css",
    "status": "?? apps/desktop/src/styles/reader-shell-and-settings.css",
    "sha256": "27ECE15680AF0A2B194C1146B26DA722AB7973F9930B684E5655DD737458C8E9",
    "blob": "01dc0ed4c9e4d013601bbcebbae4daee1bbc8e7a"
  },
  {
    "path": "apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx",
    "status": " M apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx",
    "sha256": "147F5E7CD8D1A39A8788691181120CB6CF48103DFE763D26C533A3A79BD0343C",
    "blob": "8576768643fd172a393062ee64b0ca3aade761a4"
  }
]
```

Identity recheck: PASS. Full HEAD, branch codex/desktop-source-organization, thirteen accepted path identities, empty index, prior-unit identities, complete global porcelain, frozen/SKIP/configuration inputs, preserved runtime/harness sources and all 39 frozen director-owned documents match before/after. Ignored build output is supplemental, outside source manifest. The reused capture helper's console summary still says "seven-path"; the actual before/after manifests contain all thirteen paths and were independently counted and verified. No source evidence is missing.

Commands and outcomes:
1. pnpm.cmd check:portable -> exit 0. 2026-10-10T21:07:22.1996307Z through 21:08:19.4595697Z. Evidence retention passed; 13 evidence Node tests; TypeScript/CSS and Python format; TypeScript/Python lint; all TypeScript types; mypy 159 source files; 17 generated contracts verified; 209 shared tests in 20 files, 651 EPUB tests in 33 files, 588 desktop tests in 54 files (1448 Vitest total), 38 desktop Node tests, and 406 Python tests. Shared/EPUB, production frontend and Python sdist/wheel builds passed.
2. pnpm.cmd check -> exit 0. 2026-10-10T21:08:19.4625470Z through 21:10:03.8899575Z. Repeated repository evidence/format/lint/type/test/build chain passed, including the same 13 evidence Node + 1448 Vitest + 38 desktop Node + 406 Python tests. Additional native checks passed: cargo fmt; Clippy all targets with warnings denied in default and release-locked-runtime configurations; 87 default Rust tests and 88 release-locked-runtime Rust tests, zero failures/ignored; Tauri release build. Python and frontend build outputs passed.
3. git diff --check -> exit 0, no output.

Both F runs emitted one nonfatal PytestCacheWarning: the existing pytest nodeids cache path was not writable (Errno 13), while all 406 tests passed. The production build retained its nonfatal large-chunk warning. These are disclosed host/output warnings, not suppressed test failures. No repair or test rerun occurred.

Supplemental proof:
- Final exact stylesheet reconstruction again matches frozen baseline SHA256 FF3DEC8E9000AC8C547A37ED77AEFCDAD6C1B33705E94CC322B5FC726783D823. Five actual bare imports, exact slices, one terminal LF per leaf and original four separators verified with only allowed CRLF-to-LF treatment.
- Fresh post-F dist/index.html references exactly one local compiled CSS asset. Full compiled CSS bytes equal the frozen pre-split baseline; no unexpanded import remains. This establishes import expansion and complete declaration/media/cascade order, beyond file names alone.
- All fresh frontend JS/CSS/worklet names, byte lengths and SHA256 equal both STYLES baseline and PCM post02 after-H assets:

```json
[
  {
    "path": "apps/desktop/dist/assets/incremental-wsola-v3-worklet-C8gQhKHK.js",
    "length": 3306,
    "sha256": "B9C83DC4DF9F567355574011890985A727F0AA20B51C43EEF8721DDF9C782A52"
  },
  {
    "path": "apps/desktop/dist/assets/index-B0fx3AxN.js",
    "length": 1025324,
    "sha256": "90674E0969BC34A0E113E2A9A86B4595B9EB3E511B85452BC7181561207A7711"
  },
  {
    "path": "apps/desktop/dist/assets/index-N6B5ULJr.css",
    "length": 26840,
    "sha256": "56C75AD24E3919833B7FDA80F88CDE36833FADF9EE1A9A00ED7D562C99AF4743"
  }
]
```

Diff scope: PASS. Thirteen source/test paths, +2402/-2249 = 4651 combined lines (semantic 501, PCM 801, CSS 3349). Each matches its approved unit ceiling and exact acceptance identity. Separate documentation scope consists only of current indexes/active plan and concise campaign Markdown evidence. No unexpected non-document path exists in full porcelain status. No generated, frozen evaluation/release authority, benchmark data, completed plan, dependency/lock/configuration, Rust, EPUB/shared or Python source was modified. App.tsx, ReaderPublication.tsx, product-narration-coordinator.ts and adaptive-buffer-scheduler.ts remain SKIP with clean identities. Frozen WSOLA files, playback authority, render scheduler, native/model harnesses and canonical architecture documents remain unchanged.

Invariant review: PASS. Prior independently reviewed extraction invariants remain bound to exact current accepted files: semantic preorder/index/grouping/object identity, bounded 250-block yielding and React/DOM ownership; PCM error constructor identity, compatible exports, neutral contracts dependency, unchanged player/backend algorithms and resource/cancellation/rate behavior; exact stylesheet source and compiled cascade. Full combined deterministic/native repository validation passes. Fresh browser and native runtime gates from STYLES post02 remain applicable to the identical combined source and frontend assets; F does not itself invoke those scripts. Canonical system diagram still describes the same React reader, Tauri supervisor, bounded local TTS/playback/WSOLA, stable locator/persistence and trust boundaries. No architecture edit is warranted.

Test-integrity review: PASS. Semantic tests add the meaningful nested DOM batching regression (248/498/500 paragraph progression across resumes) without removing existing assertions. PCM tests and runtime harnesses remain unchanged. CSS test changes only actual-entry parsing/loading and ordered five-path/grammar/uniqueness assertions, preserving original reduced-motion, forced-color and focus assertions; the single correction was formatter layout only. No snapshot, timeout, acceptance threshold, frozen authority or unrelated test weakening. Full tests check behavior rather than relying only on the worker's claims.

Privacy/artifact review: PASS. No book text, generated audio, model weights, secrets, raw host logs or private-data artifacts entered the source/document diff. Validator only created ignored helpers/reports/logs and allowed bounded build/test outputs. Existing configured model roots were inspected, not downloaded or changed. No full process command lines collected. Final app/driver inventory is empty. Current installed Chatterbox v3 manifests/interpreter match prior identities; retained v2 was not touched.

Documentation/evidence review: PASS for the frozen pre-closure documents. All 248 local Markdown links across 39 documents resolve. Accepted SEMANTIC/PCM/STYLES post02 receipts and failed STYLES post01 copy match immutable raw report hashes. Current active plan/index correctly say three accepted units with F/archival pending as of this frozen input, preserve historical failures and their bounded resolutions, and do not claim Qwen MVP performance. Baseline-versus-post-change outcomes, source correction count (CSS one; semantic/PCM zero), authorized host preparation, no Git authorization and future cleanup are accurate. Final report insertion, status changes and archival remain director-owned follow-up with separate documentation closure review.

Prior H applicability: PASS for reasoned reuse of DESKTOP-PCM-01-POST-CHANGE-02 observations in this behavior-preserving campaign. This is an explicit source/runtime-input assessment, not an H rerun or relabeling of its measurements. That report executed the complete six-arm command with global exit 0, all four ADR-0051-required Piper/Chatterbox journeys and both Piper six-rate matrices (100/95/90/85/80/75) passing. Subsequent changes are only the verified stylesheet relocation and its test loader. Exact source reconstruction, fresh post-F compiled frontend byte equality, unchanged semantic/PCM/frozen-worklet/harness/native/TTS/configuration inputs, preserved installed manifests/interpreter and matching driver support continued applicability. Existing configured developer interpreter SHA256 values and exact enabled outbound Block rules were rechecked against H capture; model roots remain present. Interim and final host-input captures match. The approved original H recipe remains unchanged; final checks use model-free flags intentionally and do not manufacture a current model result. No affected input or new failing behavior invalidated the prior H evidence, so the expensive matrix was not replayed.

H limitations retained:
- Previous Qwen Spanish/English harness PASS measured 285.78/156.09 seconds of buffering per playback minute, respectively, with one underrun each. These exceed the MVP goal; ADR-0051 deferral remains unchanged.
- Required Piper/Chatterbox arms observed zero underruns/buffering in their exercised windows, but Chatterbox startup was approximately 44.4/41.1 seconds. No performance improvement or general audio-quality claim.
- No new hardware performance or model-weight inventory was measured by F. Prior H observations remain attributable to their original run/environment.
- Tauri rebuilds change executable bytes. Final executable SHA256 is 5C7EB0A1BB8D57A184C8B70FAF08842AD7C749C36359A63270D912364FFA6D87; no binary equality with H or STYLES native executable is claimed. Evidence rests on unchanged native source/configuration, frontend byte equality, prior fresh STYLES N and current full native checks/build.
- Finite tests do not establish arbitrary EPUBs, every scheduler trace, all hardware or subjective audio quality.

Temporary isolation: exact task-owned cb3 rule remains enabled Outbound Block / Any with original expected interpreter target, unchanged. Safety deadline remains 2026-10-10T23:15:44Z. Validator performed no firewall action. Director must remove only the task-owned rule via the existing helper and verify cleanup as authorized; no model run after removal without newly verified isolation.

Action required: no source correction. Combined implementation validation PASS for the exact thirteen paths and HEAD. Director must finish authorized rule cleanup, archive/update plan and indexes, and obtain separate documentation/closure verification before final delivery. No staging, commit, push, PR, installation or further model execution is authorized by this report.

Evidence root: tmp/evidence/desktop-source-organization/DESKTOP-SOURCE-ORGANIZATION-FINAL-01/
Raw files: before.json, after.json, identity-comparison.json, combined-scope.json, documentation-review.json, links.json, receipt-copies.json, host-inputs-interim.json, host-inputs-after.json, reconstruction.json, styles.reconstructed.css, compiled-proof.json, versions.json, outcomes.jsonl, 01-check-portable.log, 02-check.log, 03-diff-check.log and diff-check.json. Full raw command logs were captured while commands ran. Historical reports remain immutable.
