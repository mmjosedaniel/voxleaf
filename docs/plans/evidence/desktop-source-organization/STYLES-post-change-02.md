# Validation Report

Report ID: DESKTOP-STYLES-01-POST-CHANGE-02
Target ID: DESKTOP-STYLES-01
Mode: POST-CHANGE
Verdict: PASS
Environment: local PowerShell outside sandbox. All eight acceptance commands, identity capture and final comparison/diff checks executed through require_escalated host PowerShell. PowerShell 7.6.5; Node 24.20.0; cached pinned pnpm 11.15.1 through existing Corepack shim, COREPACK_ENABLE_NETWORK=0. NODE_OPTIONS unset. All twelve exact model-profile keys removed using existing modelFreeLifecycleEnvironment policy for every command, including N. HF_HUB_OFFLINE=1 and TRANSFORMERS_OFFLINE=1 retained. Existing matching driver SHA256 DC99C208C10A5364E61C4E5B1341BE492F3224DE753ADB23E973BE97875B1892. No source, test, documentation, configuration or Git edits by validator; no installation, download, firewall mutation, runtime retry or weakened assertions.
Starting HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Ending HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Validated paths: closed seven paths in the following manifest, matching DESKTOP-STYLES-WORK-01 and bounded correction cycle 1.
Validated path identities: exact before-command porcelain status, SHA256 and filter-aware expected Git blob; all identical after commands.

```json
[
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

Identity recheck: PASS. HEAD and branch codex/desktop-source-organization unchanged; index empty before/after. All seven path identities, accepted Units1/2 six-path status/SHA/blob identities, preserved runtime/harness/frozen-source identities, main.tsx, installed Chatterbox manifests/interpreter, driver, temporary rule, model-free environment and full global porcelain status match before/after. No source-writing or Git activity occurred during validation. Installed interpreter SHA256 remains 4D6F5F81A4BCA11191C4C7C6B43632694D0A4CE74E068619D8FDC161D469859A. Existing temporary installed-interpreter rule remains enabled, Outbound, Block, Any, with exact expected target; deadline 2026-10-10T23:15:44Z. Validator did not remove or mutate it. Before/after native app/driver inventory is empty. Model inference was not launched by these commands.

Commands and outcomes:
1. pnpm.cmd build:packages -> exit 0; shared and EPUB TypeScript builds passed.
2. pnpm.cmd --filter @voxleaf/desktop typecheck -> exit 0; desktop compile-time contracts passed.
3. pnpm.cmd --filter @voxleaf/desktop test -> exit 0; 54 Vitest files / 588 tests, plus 38 Node tests passed.
4. pnpm.cmd format:check:typescript -> exit 0; all matched files conform to Prettier. Original post01 failure remains immutable.
5. pnpm.cmd lint:typescript -> exit 0.
6. pnpm.cmd --filter @voxleaf/desktop build -> exit 0; Vite production build passed, 186 modules transformed. Existing large-chunk warning is non-failing.
7. pnpm.cmd test:browser -> exit 0; all 7 browser tests passed (10.4 seconds), including navigation, reader geometry, oversized chapter boundary, reflow/restoration, keyboard accessibility and synchronization.
8. pnpm.cmd test:native-startup -> exit 0; Tauri release build and packaged native smoke passed: root mount, bounded protocol, supervised fake-service lifecycle, binary delivery/cancellation/crash recovery, local file reselection/cancellation/replacement, exact/max-plus-one boundaries, narrow keyboard/accessibility matrix, synchronization, local image decoding, position/preferences restart persistence and replacement cleanup. No errors or external requests reported.
9. git diff --check -> exit 0, supplemental review.

Independent evidence checks:
- Entry is exactly five unique unconditional quoted local imports in approved order, with no extra rules/qualifiers.
- Each leaf matches its immutable baseline slice (1-245, 247-806, 808-1061, 1063-1242, 1244-1659), preserving all interior bytes under only CRLF-to-LF normalization. Each has one terminal LF. Joining complete bodies with one additional LF restores exactly the four separator lines.
- Reconstructed SHA256 FF3DEC8E9000AC8C547A37ED77AEFCDAD6C1B33705E94CC322B5FC726783D823 equals immutable source snapshot; no broad trim, serializer or rule normalization used.
- Correction proof independently reverses only the three-line exec call layout and recovers post01 test SHA256 006A75771F78325A635665A0DD5F715A0B9CFB2BB4318819C2C5C4AA388EAB9A. All other six unit paths remain exact relative to post01.
- Fresh dist/index.html selects exactly one local compiled stylesheet. Its bytes equal the immutable baseline compiled stylesheet, with no unexpanded @import. Complete-byte equality preserves expansion, cascade order, nested conditions, media blocks and late overrides. Reduced-motion/forced-color conditions are present in actual minified syntax.
- Fresh JS/CSS/worklet names, lengths and SHA256 exactly match both STYLES baseline and accepted PCM post02:

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

The ignored supplemental media-presence probe initially assumed no space after @media, after byte-equality checks had already succeeded. Inspection confirmed actual minified syntax is "@media (condition:value)". Only that ignored evidence helper was corrected; the read-only comparison then passed. No repository source, test, acceptance command or assertion was changed or rerun for this probe issue.

Diff scope: PASS. Exactly seven unit paths, +1685/-1664 = 3349 combined lines, below 3400. Entry +5/-1659; test +25/-5; new leaves 245/560/254/180/416 lines. All original source slices remain intact. Accepted Units1/2 and director-owned documentation remain separate unchanged campaign scope. No new dependencies/configuration/lockfiles, markup, runtime logic, frozen authority, harness, generated tracked output or unrelated changes.

Invariant review: PASS. Exact source reconstruction plus fresh compiled CSS equality prove preservation of selectors, declarations, values, specificity, important/custom/vendor properties, comments, duplicates, complete media/nested blocks, original rule order and late shell/Settings overrides. main.tsx single stylesheet import is unchanged. Browser/native gates cover geometry, reflow, focus, keyboard, synchronization and lifecycle behavior; they are not an exhaustive visual matrix over every operating-system preference. Product privacy, bounded memory, cancellation, persistence and public contracts are untouched. Canonical system diagram remains applicable because this internal source organization does not change architectural components or flows.

Test-integrity review: PASS. Only dirname import and approved CSS-loading/assembly logic changed, followed by formatter-only correction. Test parses actual entry statements, asserts bare-import grammar, exact ordered paths and uniqueness, and reads those parsed paths relative to entry. Existing reduced-motion, forced-color and focus assertions retained verbatim; independent suffix comparison passed. No unrelated test/assertion/timeout change or snapshot refresh.

Privacy/artifact review: PASS. No private book text, generated audio, model payload, secret, raw runtime log or unrelated artifact entered the diff. Validator writes are ignored helpers/evidence only; build/test output is bounded ignored output. Installed host paths are represented symbolically. No full process command lines collected.

H evidence applicability: reasoned reuse is supported for this CSS unit's unchanged runtime inputs, not a newly executed H result. Accepted DESKTOP-PCM-01-POST-CHANGE-02 supplied full six-arm H exit 0, including four ADR0051 required arms and both Piper six-rate matrices. Since that run, the affected CSS semantics reconstruct exactly and freshly compiled renderer JS, CSS and WSOLA worklet are byte-identical. Accepted semantic/PCM sources, frozen WSOLA authority, profile-selection code and native/H harness identities remain unchanged; Git scope shows no native/TTS/configuration/dependency mutation. Installed Chatterbox manifests/interpreter and matching driver remain exact, with temporary installed-interpreter isolation verified. Thus no CSS change invalidates those prior model playback/profile/rate observations. H is not required by this unit order and was NOT RUN here.

Limits on reuse: N rebuilt the packaged executable; its SHA changed from 5AD0090F81F995E590F960C85C627FBFABAEE1BD9D0EAD18EB73D358BCDB2861 to BCD3C8E5E241C4EACD510F0828CA94FC0AC2B141C204C3E537EC4BE8415E7937. This report claims compiled frontend byte equality and unchanged native source/configuration, not packaged executable binary equality. Fresh N passed against the rebuild. No full model-weight hash inventory or fresh H performance measurement was taken. Prior H remains bound to its original recorded environment/results; final campaign gate must explicitly assess continued applicability and any subsequent input/environment drift. This unit PASS does not automatically relabel prior H or replace final F.

Action required: none for the exact validated unit. Preserve immutable post01 failure and this fresh post02 acceptance separately. Final campaign F remains separate and NOT RUN here. No staging, commit, push, PR or firewall cleanup authorized by this report.

Evidence root: tmp/evidence/desktop-source-organization/DESKTOP-STYLES-01-POST-CHANGE-02/
Raw evidence: before.json, after.json, identity-comparison.json, correction-proof.json, reconstruction.json, styles.reconstructed.css, compiled-proof.json, test.diff, tracked-numstat.txt, versions.json, outcomes.jsonl, 01-build-packages.log through 08-native.log, 09-diff-check.log and diff-check.json. All eight logs captured during execution; no retrospective or invented command outcomes.
