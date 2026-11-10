# Change Review Report

Review ID: DCR-U4-R1-ASTRA-20261109-01
Task ID: U4 / DCR-09
Verdict: APPROVE — local unit only
Base commit and reviewed HEAD: d375ecc84261c404e855c055e0ecc8949a97caaf

Reviewed paths and identities: Incorporate the 13-row manifest and three generated-export identities in docs/plans/evidence/deep-chat-audit/u4-dcr-09-execution.md, receipt DCR-U4-EXEC-20261109-01, SHA-256 b785b57edc191e030172edf04b463e636d4e5a65ffc20f0d816fec0bbd9a0af7. Preserve those exact receipt bytes. First four source/document rows are the unit patch. The full tracked diff matches tmp/evidence/deep-chat-audit/U4/review-patch.diff; no new source files.

The closed review scope additionally includes these unchanged direct-caller/bound-policy support inputs, independently identified before and after inspection:

| Path | Status | Worktree SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| packages/epub/src/narration/narration-prepared-segment.ts | clean | 2e888f954139ed3b4fee72e827c63966a9c64f6de0c17d53794d9127a966f169 | 06791d78677776039194a967cfb0d971ef29a2d7 |
| packages/epub/src/narration/narration-policy.ts | clean | 96a62a9d0d57e5fad904b4c38d98ded4d48d5c2f8e125ea527c5df535ac0f85c | 9ddc7859fe3e07b984116d61f634c3ea908b7b08 |

Both support blobs match HEAD. Other unit patches and plan/evidence status edits are outside local acceptance; root package.json's existing U8 change is supporting context, not U4-owned work.

Identity recheck: PASS. All 13 receipt rows and both supplemental rows match their initial status/SHA-256/blob identities at completion. HEAD is unchanged and index empty. Final host snapshots agree before/after; existing files, the explicitly absent Vitest configuration and all three recorded exports match current state. In particular, the public compiled bilingual normalizer remains SHA-256 7acd9c65783285494da2de9c254552af33526336e5355806fce4041140bc263a. The reviewer used read-only source, diff and supplied-evidence inspection; no tests, build, formatting, edits or delegation.

Acceptance review:

- DCR-09: APPROVE locally. The forward Celsius-range neighbor scan now permits one attached plus, ASCII minus or Unicode minus before digits, followed optionally by one comma/dot decimal with required digits. It still requires a Celsius endpoint across the existing hyphen/en-dash separator, so this remains a conservative preservation guard rather than a general expansion grammar. The backward guard and standalone-expansion checks are unchanged.
- Every new scan step consumes the same cursor-based 128-code-point budget through lexicalContext. Invisible-mark handling, same-language/prose checks and code/language barriers remain shared with the existing implementation. Exhaustion conservatively preserves the text. The added loop neither crosses protected boundaries nor creates unbounded lookahead/storage.
- Direct tests cover ES/EN decimal and signed right endpoints, compact/spaced separators, ASCII plus/minus and Unicode minus, and reversed endpoint controls. Existing per-case assertions also check source mapping, code preservation and unsupported-language preservation. No existing assertions were weakened.
- Public preparation tests exercise all three mutable profiles, compare single-item and larger batches, require unchanged output for each unsupported range, assert exact source start/end locators and public segment validity, and verify the publication documents remain unchanged. The direct prepared-segment caller retains its profile selection, bounded work charge, scanner/packer and canonical range validation. Frozen v1 normalization is unchanged.
- The ADR-0063 amendment is confined to the mutable Celsius range rule. M005's source/locator contract and the canonical diagram remain consistent; this change makes no new TTS, playback or synchronization implementation claim and changes no component boundary.

Test evidence reviewed — supplied normal local PowerShell results, not reviewer executions:

- RED: pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts -t DCR-09. Exit 1, nine intended failures, four inverse controls passed, 296 skipped. The mutable production normalizer matched HEAD.
- First candidate: pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts src/narration/narration-resource-bounds.test.ts. Exit 1, 316 passed and four public integration failures. The direct normalizer and resource-bound files passed; the public test used the stale package dist. This remains a failed aggregate, not an overall passing run.
- Export refresh: pnpm.cmd --filter @voxleaf/epub run build. Exit 0, configured tsc --build tsconfig.json, 2026-11-09T20:58:19.9760477Z–20:58:21.9287917Z. Source remained unchanged. The captured compiled normalizer hash changed from the stale integer-only implementation to the reviewed implementation; package and shared export entry hashes stayed unchanged.
- Final exact GREEN: the RED command repeated after export refresh. Exit 0, 13 passed and 296 skipped, 2026-11-09T20:58:37.7987510Z–20:58:38.8430784Z. Both direct and actual public-export regressions pass. The earlier shell-selector exit 255 remains separately recorded as a command-selection failure.
- Scoped pnpm.cmd exec prettier --check and pnpm.cmd exec eslint passed on narration-bilingual-normalizer.ts, narration-normalizer.test.ts and integration/narration-preparation-matrix.test.ts using their full packages/epub/src paths. Host versions: PowerShell 7.6.9, Node v24.20.0, offline Corepack pnpm 11.15.1 and Vitest 5.0.5.

Findings: none in the reviewed local scope.

Remaining uncertainty: G0/G2/G7 and final integrated review remain pending. This is not a full EPUB-suite final PASS. U13 will invalidate the current EPUB export, requiring the planned final rebuild and applicable current tests; these local generated hashes must not be silently refreshed. No historical PASS is claimed as current evidence.

Required next action: No further U4 local correction. Record this immutable local approval, including its two supplemental support identities, and proceed with authorized campaign work. This report is not a Validation Report, campaign completion or Git authorization.
