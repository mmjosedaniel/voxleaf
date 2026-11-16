# Change Review Report

Review ID: FPFC-PLAN-CR-R01-20261115  
Task ID: FPFC-PLAN  
Verdict: **CHANGES_REQUESTED**

Base commit and reviewed HEAD: `997cddff2a8658440324a87e44178a98018dea77`  
Branch: `codex/four-pass-findings-corrections-plan`

Reviewed paths and identities: Complete closed 92-path set in `tmp/evidence/four-pass-findings-corrections-plan/review-r01/manifest.json`, SHA-256 `9e35bf24e7c6588b38786b5765c9bbf2130d3d8c363fe0650dace7cd22c9a2dc`. No additions or exclusions beyond the manifest’s two reserved terminal outputs.

Exact patch artifacts:

- `patch.diff`: SHA-256 `a5ba02520263cbfcdc41419b4f09e3555fa7492759689d9bbc83b6a9f3eddbcc`.
- `new-files.json`: SHA-256 `e9d1d8a5a9c476cb5984a6016a5ca9406a3c84d4d2383f99aed5eda9f6d5cd9c`.

Identity recheck: **PASS**. Before and after inspection, all 92 paths matched their recorded status, SHA-256 and filter-aware blob identity. HEAD and branch remained unchanged, the index remained empty, and both reserved outputs remained absent. The actual tracked diff matches the frozen patch exactly; all seven new-file contents match the supplied artifact. The actual changed set contains the ten documented paths.

Acceptance review: The plan contains the twelve required sections and clearly limits current authorization to planning documentation. Its proposed corrections preserve frozen legacy authorities, local privacy boundaries, bounded memory, cancellation, stable locations and independent acceptance. U6 correctly requires actual WebView2 gesture evidence; VF-0071 is excluded from implementation; VF-0070 is bounded to fail-closed admission with a positive successor deferred.

The proposed original-trigger assertions and continuation checks distinguish these cases from historical neighboring tests. Relevant production owners, direct callers and existing assertions support that distinction. Historical receipt integrity is separated from applicability, and no behavioral result is pre-approved for reuse. The executable gate selections and registry summary require the corrections below.

Test evidence reviewed: Coordinator-supplied `planning-checks.json` attributes the following to normal local PowerShell outside the managed sandbox, using Node `24.18.0` and pnpm `11.15.1`:

- `pnpm.cmd check:evidence`: exit 0.
- `git diff --check`: exit 0.
- `python tmp/evidence/four-pass-findings-corrections-plan/freeze-plan-review.py`: exit 0; 584 local link targets checked, twelve required sections present, and only the two reserved destinations permitted absent.

The supplied historical inspection records seven matching receipt identities and 28 matching referenced evidence files, while explicitly withholding current reuse approval. Those are attributed historical/planning observations. I ran no tests, formatters or builds.

Findings:

1. **P2 — The native command expands the promised single journey into four model/language arms.**  
   **Location:** `docs/plans/active/four-pass-findings-corrections.md:290`, G-NATIVE and command at line 317.  
   **Trigger:** An executor follows `pnpm.cmd test:tts:reader-corrections-host`.  
   **Consequence:** The command builds the desktop and unconditionally runs Piper ES/EN and Chatterbox CUDA ES/EN, introducing GPU/model requirements and repeated journeys beyond the selected minimal gate.  
   **Evidence:** Root `package.json:114`, desktop `package.json:17`, and `apps/desktop/scripts/reader-corrections-host.mjs:6` define this chain and hard-coded four-arm loop. The wrapper has no arm selector.  
   **Bounded correction criterion:** Specify an existing single-profile native route after one current build, or explicitly plan and validate selector support before using the wrapper. The existing `native-startup-smoke.mjs` accepts the exact-host, reader-corrections, profile and language arguments and owns operation timeout and cleanup failure handling. A direct selected Piper route is suitable provided implementation adds the actual U6/direction/continuation assertions and retains fresh artifact, cleanup and restoration evidence. Its existing scenario flag alone does not establish those new assertions.

2. **P3 — The release command unconditionally rebuilds an otherwise reusable Piper core.**  
   **Location:** `docs/plans/active/four-pass-findings-corrections.md:320`, G-RELEASE.  
   **Trigger:** Release orchestration changes require a current package/build check while the existing Piper core remains valid and unchanged.  
   **Consequence:** `package:windows` rebuilds the core before building the desktop package, adding unnecessary work despite the plan’s explicit verified-asset reuse strategy.  
   **Evidence:** `package.json:81` invokes `package:piper-core`; line 82 already provides `package:windows:verified-core`, which checks the existing core and invokes the same production PowerShell build. The inspected historical G9 receipt also used that route.  
   **Bounded correction criterion:** Select `package:windows:verified-core` when current core verification and relevant input identity permit reuse. Reserve core regeneration for a missing/invalid core or changed consumed inputs. Retain the current desktop package build and package check.

3. **P3 — The registry summary omits two findings and retains VF-0071’s superseded disposition.**  
   **Location:** `docs/development/findings/registry.md:96`, summary table.  
   **Trigger:** A reader uses the registry table to identify findings and dispositions for the planning handoff.  
   **Consequence:** VF-0071 appears as `candidate`, while VF-0072 and VF-0073 are absent from the summary, obscuring the final reviewed classification and scope.  
   **Evidence:** The dated VF-0071 entry at line 1068 changes its disposition to `not-confirmed`; VF-0072 and VF-0073 have substantive entries at lines 1070 and 1081. The plan correctly reflects all three.  
   **Bounded correction criterion:** Align the summary with the recorded disposition and add the two missing linked rows. Preserve the dated historical assessments and immutable audit reports.

Remaining uncertainty: Runtime reproductions, actual U6 host reachability, future implementation correctness and final gate reuse remain unverified, appropriately outside this planning review.

Required next action: Make the three bounded documentation corrections, preserve this report unchanged, and submit a fresh identified candidate with affected documentary checks for R02 review. No product implementation or runtime tests are required to resolve these findings. This report grants no implementation or Git authorization.
