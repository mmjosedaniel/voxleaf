# Change Review Report

Review ID: DCR-U5-R1-ASTRA-20261109-01
Task ID: U5 / DCR-15
Verdict: APPROVE — local unit only
Base commit and reviewed HEAD: d375ecc84261c404e855c055e0ecc8949a97caaf

Reviewed paths and identities: Incorporate all 13 path/SHA-256/filter-aware blob rows in [DCR-U5-EXEC-20261109-01](u5-dcr-15-execution.md), SHA-256 627de220e55ae4832ca7550898a0c47d322a271e9c4234e510e596aa4d0bd4d0. Preserve those exact bytes. The receipt's Status cells contain a literal $s; this report explicitly binds the supplemental status mapping supplied by the worker and independently verified against browser-before/after.json and current Git status: rows 1, 2, 3, 5 and 10 are ` M`; row 4 is `??`; rows 6, 7, 8, 9, 11, 12 and 13 are clean. This supplement resolves the manifest transcription gap without editing its historical bytes.

The first five rows are the U5 patch. The new webp-fixture.ts was read in full; the saved review-patch.diff matches the live diff for the four tracked patch paths. Remaining rows are supporting inputs. Other units and plan/evidence status edits are excluded from local acceptance.

Identity recheck: PASS. All 13 content identities match the receipt and host snapshots, and all statuses match the explicit supplement before and after review. HEAD remained unchanged and index empty. Both unit and browser before/after snapshots match current inputs. The G0 tracked-input lists agree before/after, and all recorded source/export digests also match current files at review completion. This is a current comparison, not permission to refresh those hashes after later edits. No review-time drift found. The reviewer performed read-only inspection and ran no tests, builds, formatters or edits.

Acceptance review:

DCR-15: APPROVE locally.

- parseWebp now combines the VP8X animation flag with previously observed animation evidence instead of overwriting that evidence. An earlier ANIM or ANMF cannot become static when a later VP8X omits its animation bit. Chunk bounds, RIFF length checks, duplicate-header/payload checks and static dimension validation remain unchanged.
- Early ANIM without a valid frame rejects as invalid; early ANMF remains animated and rejects through the animation policy. Both routes reject before decoding. No new animation support or chunk grammar was introduced.
- RasterImageSourceManager still evaluates metadata before object-URL creation or decode invocation. New tests assert neither occurs for either early marker. Existing cancellation, ownership, decoded-size and capacity controls remain in the unchanged manager and passing owner suites.
- The synthetic fixture is deliberately a predecode-policy probe, not proof that a browser decoder accepts or exploits the malformed ordering. Policy tests retain controls for the animation bit, truncated data and accepted static WebP. Existing raster bounds and static-format controls pass.
- The Chromium journey opens the synthetic EPUB through the actual app, observes the named unavailable-image fallback, and counts zero WebP object URLs. Existing decorative-image semantics remain asserted while the additional named fallback increases the expected accessible-image count. No earlier assertions were removed to hide a regression.
- Scope is a correction to the existing unsupported-animation admission rule. No product contract, architecture, locator, EPUB privacy or persistence boundary changed. The report makes no decoder vulnerability or animation exploit claim.

Test evidence reviewed — attributed to normal local PowerShell execution, not reviewer runs:

- RED: pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/images/raster-image-policy.test.ts src/reader/images/raster-image-source.test.ts -t DCR-15. Exit 1, four intended failures and 54 skipped. Both production policy and source-manager inputs matched HEAD.
- GREEN: the same command without -t DCR-15. Exit 0, 58 passed, 2026-11-09T21:10:53.3704350Z–21:10:54.8746260Z. Exact input snapshots match.
- Scoped pnpm.cmd exec prettier --write and pnpm.cmd exec eslint exited 0 over the exact first five manifest paths. Formatting was applied; no separate final format --check run is claimed.
- pnpm.cmd build:packages exited 0, recorded 2026-11-09 21:11:16–21:11:18 UTC. The g0-before/after input lists agree, and g0-exports.txt records the rebuilt workspace outputs after U4/U13. Current comparison found no recorded input/export drift. Final G0 reuse remains coordinator-owned and requires rechecking after subsequent work.
- pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts --grep DCR-15 exited 0, one Chromium journey passed in 5.2 seconds; recorded host interval 2026-11-09 21:11:20–21:11:28 UTC. The configured server used a fresh desktop Vite build and reuseExistingServer=false. Unit and browser snapshots match current reviewed sources.
- Host: Windows NT 10.0.26200.0, PowerShell 7.6.9, Node v24.20.0, pinned offline Corepack pnpm 11.15.1, Vitest 5.0.5. The browser log reports the executed Chromium test; existing Vite chunk-size and color-environment warnings did not fail the run.

Findings: none remaining in the reviewed local scope. The receipt-status transcription gap is resolved by the explicit immutable supplement above.

Remaining uncertainty: Final G3/G6/G7 and integrated acceptance remain pending. The single focused Chromium journey does not establish the full browser gate or packaged WebView2 behavior. G0 evidence may be attributed later only if its complete recorded inputs/outputs remain current. No security exploit or browser-decoder vulnerability is established.

Required next action: No further U5 local correction. Persist this report with its status supplement, preserve the original receipt, and proceed with authorized campaign work while retaining final gates. This is not a Validation Report, campaign completion or authorization for Git mutation.
