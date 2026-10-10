# Validation Report
Report ID: DESKTOP-STYLES-01-BASELINE-01
Target ID: DESKTOP-STYLES-01
Mode: BASELINE
Verdict: PASS
Environment: normal local PowerShell outside sandbox, repository root; PowerShell7.6.5, Node v24.20.0, pinned pnpm11.15.1 through existing Corepack shim with COREPACK_ENABLE_NETWORK=0. All seven acceptance commands require_escalated. Model-free environment: exactly the twelve existing portfolio profile keys removed, present count0 before/after, NODE_OPTIONS unset. Existing matching EdgeDriver155 override and HF_HUB_OFFLINE=1/TRANSFORMERS_OFFLINE=1 retained. No N/H/model/native command or installation/firewall/Git/source mutation by validator.
Starting HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Ending HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Validated paths: accepted STYLES-audit-01/STYLES-draft-01 exact seven-path baseline allowlist below.
Validated path identities:

| Path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| apps/desktop/src/styles.css | `""` | FF3DEC8E9000AC8C547A37ED77AEFCDAD6C1B33705E94CC322B5FC726783D823 | b616c73157a4a490bbf038ab4a613690432fbd29 |
| apps/desktop/src/styles/shell-and-publication.css | `""` | ABSENT | ABSENT |
| apps/desktop/src/styles/reader.css | `""` | ABSENT | ABSENT |
| apps/desktop/src/styles/narration-and-publication-states.css | `""` | ABSENT | ABSENT |
| apps/desktop/src/styles/accessibility-and-responsive.css | `""` | ABSENT | ABSENT |
| apps/desktop/src/styles/reader-shell-and-settings.css | `""` | ABSENT | ABSENT |
| apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx | `""` | F96F90D241B9D188CDAFDF6CF09D49DE9FF07BB0288F0A532360CD16EFFEB2C5 | 0fff933a6d14d3071c981b1857c5f7e940d41b2e |

Identity recheck: PASS. Full before.json/after.json match, including HEAD, branch codex/desktop-source-organization, all seven exact path statuses/hash/blob identities, main.tsx, complete porcelain listing, compiled assets, environment and existing temporary rule identity. Index empty before/after. Both existing source/test paths clean; five new leaves ABSENT and not hashed. git status emitted expected missing-directory warnings for the five absent paths; no files were created there. Accepted Unit1 and Unit2 six source paths independently match their immutable accepted statuses/SHA256/filter-aware blobs and remained unchanged. The baseline source identity matches the accepted audit.

Frozen evidence: ignored styles.source-baseline.css is a byte-for-byte copy of apps/desktop/src/styles.css, SHA256 FF3DEC8E9000AC8C547A37ED77AEFCDAD6C1B33705E94CC322B5FC726783D823. Original has1659 body lines, zero CRLF, exactly one terminal LF. Blank separator lines246/807/1062/1243 verified. Planned complete body slices are1-245,247-806,808-1061,1063-1242,1244-1659. Future reconstruction must preserve each complete body and interior bytes; each leaf ends in one LF and joining with one additional LF restores these four separators. Only the ordered newline treatment in the approved terms is allowed.

Ignored styles.built-baseline.css is a byte-for-byte copy of the sole stylesheet referenced by apps/desktop/dist/index.html: apps/desktop/dist/assets/index-N6B5ULJr.css, SHA256 56C75AD24E3919833B7FDA80F88CDE36833FADF9EE1A9A00ED7D562C99AF4743. Source and compiled snapshot hashes matched live files before/after commands. Copies were made before any source edits or acceptance commands; frozen-css.json records exact paths/hashes/boundaries. No normalization was applied to the snapshot files.

Supplemental built asset identities, identical before/after and exactly equal to DESKTOP-PCM-01-POST-CHANGE-02 built-assets.json:

| Asset path | Bytes | SHA-256 |
| --- | --- | --- |
| apps/desktop/dist/assets/incremental-wsola-v3-worklet-C8gQhKHK.js | 3306 | B9C83DC4DF9F567355574011890985A727F0AA20B51C43EEF8721DDF9C782A52 |
| apps/desktop/dist/assets/index-B0fx3AxN.js | 1025324 | 90674E0969BC34A0E113E2A9A86B4595B9EB3E511B85452BC7181561207A7711 |
| apps/desktop/dist/assets/index-N6B5ULJr.css | 26840 | 56C75AD24E3919833B7FDA80F88CDE36833FADF9EE1A9A00ED7D562C99AF4743 |

These are comparison evidence, not automatic authorization to reuse model-backed acceptance after later changes. Source allowlist remains seven paths. The exact temporary installed-interpreter rule VoxLeaf-DesktopOrg-ChatterboxV3-01a126fa-Temporary stayed unchanged, enabled Outbound Block, Profile Any, exact current cb/3/runtime/python.exe. No cleanup trigger or firewall action was issued.

Commands and outcomes:
- `pnpm.cmd build:packages` -> exit0; 10/10/2026 20:51:40 to 10/10/2026 20:51:41; 01-build-packages.log.
- `pnpm.cmd --filter @voxleaf/desktop typecheck` -> exit0; 10/10/2026 20:51:41 to 10/10/2026 20:51:46; 02-desktop-typecheck.log.
- `pnpm.cmd --filter @voxleaf/desktop test` -> exit0; 10/10/2026 20:51:46 to 10/10/2026 20:51:54; 03-desktop-test.log.
- `pnpm.cmd format:check:typescript` -> exit0; 10/10/2026 20:51:54 to 10/10/2026 20:52:01; 04-format.log.
- `pnpm.cmd lint:typescript` -> exit0; 10/10/2026 20:52:01 to 10/10/2026 20:52:11; 05-lint.log.
- `pnpm.cmd --filter @voxleaf/desktop build` -> exit0; 10/10/2026 20:52:11 to 10/10/2026 20:52:12; 06-desktop-build.log.
- `pnpm.cmd test:browser` -> exit0; 10/10/2026 20:52:12 to 10/10/2026 20:52:25; 07-browser.log.

All seven D/B commands PASS. Package TypeScript builds and desktop noEmit pass. Desktop tests:54 files/588 Vitest tests and38 Node tests, no failures/cancellations/skips. Formatting and lint pass. Production build transforms186 modules and emits the CSS/JS/worklet above, with the existing nonfatal large-chunk warning. Browser gate passes7 Chromium tests in10.9s: real locator geometry, EPUB2/NCX/local boundary, oversized chapter rejection, restoration/preferences/zoom/reflow, narrow keyboard navigation and synchronization/focus.

Additional evidence checks: capture.ps1 before/after exit0; git diff --cached --quiet exit0 before/after; git diff --check exit0 after commands, log08-diff-check.log. comparison.json records identityMatch=true, pcmPost02AssetsMatch=true, sourceSnapshotMatch=true and builtSnapshotMatch=true. N and H NOT RUN by design; no new native/model acceptance is claimed for this CSS baseline.

Diff scope: PASS. No Unit3 source patch exists. styles.css and HardwareCompatibilityControls.test.tsx are clean; all five proposed styles leaves absent. Prior accepted renderer/PCM patches and director documentation remain untouched. Only ignored evidence/scripts/frozen CSS snapshots were created by validator; configured builds created normal ignored outputs.
Invariant review: PASS for baseline. main.tsx retains exactly its existing single styles.css import. The eight draft invariants require selector/declaration/value/specificity/important/custom-property/vendor/comment/duplicate order, complete media conditions and late shell/Settings precedence to survive the proposed relocation. Exact frozen source bytes and prescribed blank boundaries provide the reconstruction authority; current compiled bytes and browser results provide presentation baseline evidence. Existing CSS-reading test retains its reduced-motion, forced-color and focus assertions and currently reads the monolithic entry; only its import-based loading boundary may change under the future order. Current layout, scroll ownership, focus/highlight and synchronized locator behavior pass browser coverage. Future extraction/import grammar/reconstruction and native presentation still require post-change proof; this baseline does not accept an unimplemented split.
Test-integrity review: PASS. No test, assertion, timeout, fixture, authority or snapshot changed. Existing accessibility assertions inspected directly. Exact configured D/B commands ran once; no substituted native/model results. Test count remains unchanged from accepted PCM state.
Privacy/artifact review: PASS. No books, generated audio, model weights, secrets/private payload, dependency/configuration/generated tracked/frozen/historical file entered the diff. CSS snapshot content is repository source/output, kept ignored. Browser uses synthetic repository fixtures. Existing installed package, environment persistence and firewall rule were not changed. Prior model evidence remains distinct.
Action required: none for this baseline. Director may freeze the accepted stylesheet terms using this report and exact captures before authorizing the worker. Post-change requires all seven D/B checks plus sanitized N and exact reconstruction/import/compiled-CSS proof. Preserve prior units and the original frozen copies. H is not part of this CSS unit; later campaign decisions remain separate. No staging/commit/push/PR or campaign completion is authorized.

Evidence directory: tmp/evidence/desktop-source-organization/DESKTOP-STYLES-01-BASELINE-01/ (before.json,after.json,frozen-css.json,styles.source-baseline.css,styles.built-baseline.css,comparison.json,versions.json,outcomes.jsonl,seven numbered logs,08-diff-check.log,environment.ps1,capture.ps1,run.ps1). Report immutable after issue; director may copy verbatim while validator is idle.
