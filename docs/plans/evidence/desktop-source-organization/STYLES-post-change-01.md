# Validation Report

Report ID: DESKTOP-STYLES-01-POST-CHANGE-01
Target ID: DESKTOP-STYLES-01
Mode: POST-CHANGE
Verdict: FAIL
Environment: local PowerShell outside sandbox. All executed acceptance commands and after-capture used require_escalated host execution. PowerShell 7.6.5, Node 24.20.0, pinned cached pnpm 11.15.1 through existing Corepack shim, COREPACK_ENABLE_NETWORK=0. NODE_OPTIONS unset. All twelve model-profile environment keys removed by existing lifecycle policy; HF_HUB_OFFLINE=1 and TRANSFORMERS_OFFLINE=1 retained. Existing matching Edge driver SHA256 DC99C208C10A5364E61C4E5B1341BE492F3224DE753ADB23E973BE97875B1892. No downloads, installation, firewall mutations, source edits or Git mutations. Writers remained idle.
Starting HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Ending HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Validated paths: closed seven-path manifest below, matching DESKTOP-STYLES-WORK-01. Generated assets are supplemental.
Validated path identities: exact before-command porcelain, SHA256 and filter-aware expected Git blob; identical after commands.

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
    "sha256": "006A75771F78325A635665A0DD5F715A0B9CFB2BB4318819C2C5C4AA388EAB9A",
    "blob": "7aab3434f30566367c50da8e3cf5712de8468f63"
  }
]
```

Identity recheck: PASS. Before/after HEAD, branch codex/desktop-source-organization, seven path identities, accepted Units1/2 six-path identities, preserved runtime/harness/frozen-source identities, main.tsx, installed Chatterbox manifests/interpreter, driver, environment and full global porcelain status match. Index empty before/after (git diff --cached --quiet exit 0). Temporary cb3 interpreter rule remained enabled, Outbound, Block, Any, with its expected exact interpreter target. No rule mutation; safety deadline remains 2026-10-10T23:15:44Z. No VoxLeaf/tauri-driver/msedgedriver processes present in before/after inventory. Native/model commands were not launched.

Commands and outcomes:
1. pnpm.cmd build:packages -> exit 0; shared and EPUB TypeScript builds passed.
2. pnpm.cmd --filter @voxleaf/desktop typecheck -> exit 0.
3. pnpm.cmd --filter @voxleaf/desktop test -> exit 0; 54 Vitest files / 588 tests and 38 Node tests passed.
4. pnpm.cmd format:check:typescript -> exit 1; Prettier names only apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx. New formatting failure relative to accepted STYLES baseline.
5. pnpm.cmd lint:typescript -> NOT RUN after required-gate failure.
6. pnpm.cmd --filter @voxleaf/desktop build -> NOT RUN after required-gate failure.
7. pnpm.cmd test:browser -> NOT RUN after required-gate failure.
8. pnpm.cmd test:native-startup -> NOT RUN after required-gate failure.
9. git diff --check -> exit 0, supplemental read-only review.

Supplemental read-only diagnosis used installed Prettier with resolved repository configuration to format the test string in memory only. No source was written. At line 500 the regex .exec(statement) needs a multiline argument layout:
```typescript
        const match = /^@import "(\.\/styles\/[a-z-]+\.css)";$/u.exec(
          statement,
        );
```
The exact formatter comparison is retained in format-diagnostic.json. Independent ignored reconstruct.ps1 passed exact entry, leaf-slice and complete-source comparisons before commands.

Diff scope: PASS. Exactly seven unit paths, +1683/-1664 = 3347 combined lines, below 3400. Tracked entry/test numstat is +5/-1659 and +23/-5; five additions have 245, 560, 254, 180 and 416 lines. Prior accepted source changes and director-owned documentation are separate pre-existing campaign scope and unchanged. No configuration, dependencies, locks, generated tracked files, frozen evaluation sources, harnesses or unrelated tests changed.

Invariant review: PASS for inspected source invariants; required runtime/build evidence incomplete, so unit acceptance FAIL. Entry contains exactly five unique unconditional quoted local imports in approved order. Every leaf matches its frozen baseline slice after only CRLF-to-LF handling; complete leaf bodies joined with one additional LF reproduce original separators. Reconstructed SHA256 FF3DEC8E9000AC8C547A37ED77AEFCDAD6C1B33705E94CC322B5FC726783D823 equals immutable baseline source. Each leaf has exactly one terminal LF. No trim, serializer or rule normalization was used. This proves original selectors/declarations, comments, duplicates, specificity, complete media/nested blocks, original cascade order and late shell/Settings overrides remain in source. main.tsx and its single stylesheet import remain exact. Product privacy, cancellation, memory bounds, persistence and synchronization code did not change. Canonical system diagram remains applicable to internal stylesheet organization.

Compiled CSS / H applicability: NOT ESTABLISHED for this attempt. Existing dist assets retain baseline/PCM post02 identities, but no post-change production build executed; stale output is not proof of new import expansion. Fresh built-CSS comparison with baseline reference, media/order expansion proof and post-build JS/CSS/worklet equality remain required. H is not required or run for this CSS unit; no previous H outcome is relabeled. Unaffected runtime-source and installed identities support evaluating reuse after successful fresh build/equality evidence, not automatic reuse or final campaign acceptance. Final F is separate and NOT RUN here.

Test-integrity review: PASS. Actual test diff changes only dirname import and stylesheet loading/assembly. Test parses every nonblank actual entry statement, asserts closed bare-import grammar, five exact ordered paths and uniqueness, then reads parsed paths relative to entry. Original reduced-motion, forced-color and focus assertions retained verbatim; independent assertion suffix comparison passed. Other tests/assertions/timeouts unchanged. Formatting failure does not indicate assertion weakening.

Privacy/artifact review: PASS. No private book text, audio, models, secrets, logs or unrelated artifacts entered the diff. Validator wrote only ignored helpers/evidence; bounded build/test output is ignored. No tracked artifact manually edited. Installed paths represented symbolically; no process command lines collected.

Action required: director-owned correction limited to formatting regex exec call at apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx:500 with formatter-required multiline argument layout, preserving regex/assertions. No validator repair. After correction issue a new immutable report and rerun all eight D/B/N commands plus reconstruction and fresh built-asset equality checks. Do not refresh this report's hashes or accept on partial results.

Evidence root: tmp/evidence/desktop-source-organization/DESKTOP-STYLES-01-POST-CHANGE-01/
Raw evidence: before.json, after.json, identity-comparison.json, reconstruction.json, styles.reconstructed.css, test.diff, tracked-numstat.txt, versions.json, outcomes.jsonl, 01-build-packages.log, 02-desktop-typecheck.log, 03-desktop-test.log, 04-format.log, 09-diff-check.log, diff-check.json, format-diagnostic.json. No logs invented for unrun commands.
