# Change Review Report

Review ID: RPI-CR-R1-20261110  
Task ID: reader-position-and-image-lifecycle, M0–M3  
Verdict: APPROVE  
Base commit and reviewed HEAD: `26f92365eed3d30cbcb57eb2867b848d3beb28c4`  
Branch: `codex/reader-position-image-execplan`

Reviewed paths and identities: The closed set comprises the 68 entries in `docs/plans/evidence/reader-position-and-image-lifecycle/review-identities.md`, SHA-256 `ba8e6021c6f7de41e35e136d2996d17da3e357e28286ef796fc5f9c96cec4a4a`, plus these unchanged supporting files:

| Status | Repository path | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| CLEAN | `docs/README.md` | `3944df11ca57e76e11b215b800a0ccad13abb5b455a2c46d8d341fdcfc663fc2` | `d23d71adf7dd345e83da322c02ab49bbff205bce` |
| CLEAN | `docs/architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md` | `30fef46e862af8b4f62f6ab3d72413482d468eb4ddea3606d9d6cf4861b58e94` | `1220b1b996ddfa60dfe444cd91b35adf9cb95a9d` |
| CLEAN | `docs/product/reader-settings-and-playback-controls.md` | `e46897865dc122a5169d8a408f9ee7536db07ae4221bbbf626667983bd4072f3` | `1a248e51c77441df845c87df65a5d603b6e9dd5d` |
| CLEAN | `.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md` | `a5f2d805063ba8536cc046b361ea5bda732f55d9166afe137b08bc01175f49ae` | `16ba1a7002366ad9312223d51dace7902d6ae751` |
| CLEAN | `docs/plans/roadmap.md` | `664a0323d2b20e055ac64b104479aa11e751ef45ce71ed8a607ab27584f34428` | `21f8bc4a2e4898f2ed6518b527e9e9c8cb50c6f5` |

Identity recheck: PASS. All 68 manifest content identities matched before and after inspection; final porcelain statuses also matched. The additional supporting files match their immutable HEAD blobs. HEAD and branch remained unchanged, the index is empty, and no reviewed-path drift was observed. Request, manifest and report remain outside their own identity closure.

Acceptance review:

- **P1–P3:** Reflow no longer accepts a presentation locator as persistence authority. `scheduleReflow()` expedites admitted progress while retaining pending passive saves, deduplication and valid offset-zero movement. App still admits package recovery only after successful settlement and uses the recovered canonical locator. Mounted-reader and browser assertions compare complete locators through appearance changes, lifecycle flush and reopen.
- **P4–P5:** Direct callers preserve visual placement notification, Play settlement gating, heard-checkpoint precedence and manual inspection. The tracker retains one transient placement snapshot and retires it on measured displacement; missing geometry does not freeze sampling. Existing cancellation, replacement, rapid-reflow, narration and StrictMode controls remain represented in the passing suites.
- **I1–I2:** Occurrences release outside the retention region. Eligible work retries after queue or live-capacity changes; visible demand can retire near-prefetch sources. Unchanged live pressure does not repeatedly read/decode, and excess visible demand remains bounded. Tests exercise queue, source-count and aggregate-pixel pressure separately, including retry without re-entry.
- **I3–I5:** Existing predecode format, dimension, animation and pixel guards remain intact. Cancellation clears obsolete bytes and retires late sources; occurrence identity prevents stale image errors from releasing a replacement. Geometry retention, responsive resizing, decorative alt behavior, observer fallback and teardown are covered. The limits remain eight active-plus-queued loads, eight live sources, one decode and 16,777,216 aggregate decoded pixels.
- **C1:** Chromium exercises ordinary geometry, explicitly controlled missing-range geometry and delayed real decoder completion. It checks canonical checkpoint preservation and subsequent intentional wheel movement through reopen. WebView2 adds actual process restart, local decoding and ownership cleanup.
- **Scope and test integrity:** Changes remain within the documented reader/persistence/image and supporting harness boundaries. The two existing mounted-reader tests add actual displacement while preserving their assertions. The benchmark selector narrows the intended status target without changing thresholds. No shared schema, persistence backend, dependency, CSP, TTS execution or system-topology change was found.

Test evidence reviewed: Results below are attributed to the implementation executor in normal local PowerShell outside the managed sandbox. I inspected the supplied ledger, relevant raw captures, source assertions and input identities; I did not execute tests, builds, formatters or linters.

| Exact command | Attributed result |
| --- | --- |
| `pnpm.cmd build:packages` | PASS |
| `pnpm.cmd --filter @voxleaf/desktop test` | PASS, exit 0; 61 Vitest files, 1,246 tests and 223 Node tests |
| `pnpm.cmd format:check:typescript` | PASS, exit 0 |
| `pnpm.cmd lint:typescript` | PASS, exit 0 |
| `pnpm.cmd typecheck:typescript` | PASS, exit 0 |
| `pnpm.cmd --filter @voxleaf/desktop test:browser reader-image-lifecycle.smoke.spec.ts` | PASS, exit 0; five cases |
| `pnpm.cmd test:browser` | PASS, exit 0; 68 cases |
| `pnpm.cmd test:native-startup` | PASS, exit 0; packaged WebView2, restart and cleanup |
| `pnpm.cmd benchmark:reader` | PASS, exit 0; six cases, including six lifecycle cycles |
| `pnpm.cmd benchmark:reader:native` | PASS, exit 0; six lifecycle cycles |
| `pnpm.cmd check:evidence` | PASS, exit 0, before review |

Evidence identity: Independently compared both 446-entry snapshots. Their only difference is `apps/desktop/tests/browser/reader-performance.benchmark.spec.ts`; all current entries match `final-test-inputs-r2.json`. Ordinary Playwright explicitly excludes benchmark specs. The selector change does not affect desktop/native runtime inputs, and static checks plus the browser benchmark were repeated.

Snapshot SHA-256 values:

- `final-test-inputs.json`: `3f1cb72db8ceef895947a01ce7e341f997b13808b4e16bbb7b44ae6f4e605bae`
- `final-test-inputs-r2.json`: `07fdea9d54a99226937dfd11e69a7f6e7d4dc621234bbace8b7cf60998545376`

The native smoke executable identity is attributed to the ledger: `73cf706afab13d4ba1d5acb86de6ea41941ed536687018a253fc41cf56390546`. The native benchmark performs a separate build; its current executable SHA-256 was independently inspected as `d265d97e1bc8a12d4917ff641ce62da9f84e8557b43b01214ac5d249142f7e20`. Binary equality between these builds is not claimed.

Findings: none.

Remaining uncertainty: No blocking uncertainty within the reviewed acceptance scope. Controlled geometry remains distinguished from natural observations; historical C15 remains modeled-only and DCR-02 remains withdrawn. This review does not establish universal browser/hardware behavior, physical audibility, model quality or CI status.

Required next action: No implementation correction required. Preserve this immutable report, then complete the planned documentation archival, evidence-retention check and separate closure review. Any subsequent reviewed-content change requires a new assessment. This approval is not a Validation Report and grants no permission to commit, push or create a pull request.
