# CI reliability, dependency updates and build efficiency

## Goal

Prevent a PR with failed CI from merging to `main`, make dependency updates produce reviewable candidates, and reduce repeated work on hosted runners. Close the twelve findings from the [November 25 CI review](../../development/findings/audits/2026-11-25-continuous-integration-review.md).

## User-visible outcome

Contributors receive a result for their own PR, early feedback on formatting and useful diagnostics for dependency failures. Maintainers can see which updates qualify under the Windows release policy. A merge requires all four existing job results. The Windows smoke launches the executable built and checked in that run.

## Current state

The audit examined `main` at `28e157cd2dc08ab974cf3478ea730e8cef801661`. All four jobs passed there. The release job spent 5m50s of 7m19s compiling cargo-audit. PR #333 built the default Tauri release target twice. On #332, Ubuntu reported a format failure in 38 seconds and Windows reached it nearly 16 minutes into its job. These are historical comparisons. [Main foundation](https://github.com/mmjosedaniel/voxleaf/actions/runs/45646380680) · [Release timing](https://github.com/mmjosedaniel/voxleaf/actions/runs/45646380329/job/139318383031) · [Windows builds](https://github.com/mmjosedaniel/voxleaf/actions/runs/45547789111/job/138981454378)

The [registry](../../development/findings/registry.md#vf-0174) and audit record the exact triggers, owners and evidence. Confirmed at intake were VF-0174–0176, VF-0179, VF-0181, VF-0184 and VF-0185. VF-0177, VF-0178, VF-0180, VF-0182 and VF-0183 were source-supported candidates. VF-0182 concerns the Rust policy comparator, a separate owner from VF-0015 and VF-0079. VF-0185 identifies the failing receipt time guard in a historical Windows run. Its failing operand is unknown. Earlier escape causes are unknown unless the audit supplies evidence.

The source audit and registry changes were pending locally at authoring. Preserve that intake and make it available with or before a published plan. Recheck HEAD, local changes, effective branch rules, current PR heads and the scanner/tool pins at execution start.

## Scope and non-goals

Work covers GitHub Actions, Dependabot, the release audit and inventory, and their local checks and fixtures. Updating branch rules and refreshing existing PRs are remote operations for the authorized execution stage. Publishing a Chatterbox package, admitting a dependency upgrade, changing product runtime, enabling auto-merge and scheduling a new release-security audit are outside this plan. The weekly update intake is already part of project policy.

## Relevant files and documentation

- [Foundation workflow](../../../.github/workflows/foundation-checks.yml), [release workflow](../../../.github/workflows/release-audit.yml), [Dependabot](../../../.github/dependabot.yml), [root scripts](../../../package.json) and [desktop scripts](../../../apps/desktop/package.json).
- [Release scanner](../../../scripts/release-audit.mjs), [inventory generator](../../../scripts/release_inventory.py), [audit policy](../../../services/tts/release/audit-policy.json), [release graph tests](../../../services/tts/tests/test_release_dependency_graphs.py), [ESLint](../../../eslint.config.js) and [Windows release tests](../../../apps/desktop/scripts/windows-release.node-test.mjs).
- [Foundation testing](../../development/testing.md#deterministic-foundation-checks), [toolchain policy](../../architecture/decisions/ADR-0005-engineering-workspace-and-quality-tooling.md), [dependency inventory](../../development/dependencies.md), [v7 release authority](../../architecture/decisions/ADR-0064-admit-msgpack-chatterbox-v7.md) and [evidence retention](../../development/evidence-retention.md).

## Architecture and constraints

Hosted CI is contributor tooling. Keep the pinned runner classes, full action SHAs, least-privilege permissions, Windows WebView2 and Chromium coverage, both Rust feature configurations, and the historical Git ancestry used by the Python validators. Product privacy, local inference, bounded buffering, cancellation and malformed-EPUB handling continue under the existing checks. Use synthetic evidence only. A future release successor owns its own payloads, cutoffs, licences and distribution approval. Published v7 and the separate local v8 candidate have distinct identities. [System boundaries](../../architecture/system-diagram.md) · [Overview](../../architecture/overview.md) · [Roadmap](../roadmap.md)

## Milestones

### 1. Make the foundation checks trustworthy

**Complete.** [PR #334](https://github.com/mmjosedaniel/voxleaf/pull/334) integrated after [CI-M1-R01](../evidence/ci-reliability-and-dependency-updates/ci-m1-r01.md) and all four hosted checks passed.

| Case | Change and discriminating evidence |
| --- | --- |
| VF-0177 · concurrency | In both workflows, key PR runs by workflow, event and PR number. Key push and manual runs by workflow, event and full ref. Check that two same-named fork branches and a qualifying push have independent groups. A second commit to the same PR must supersede only its previous run. Record the evaluated keys and actual hosted event evidence where available. |
| VF-0178 · Cargo | On a fresh checkout, check the committed lock before the first command that could resolve or rewrite it, including Windows Tauri build. Use the existing locked Cargo tree invocation as a model and pass `--locked` to Clippy and tests in both feature modes. A deliberately stale manifest in a disposable checkout must fail before compilation with the original lock bytes intact. A matching lock must pass both native jobs. |
| VF-0179 · ESLint | Match package-local `tmp/` and `temp/` in the ESLint global ignores. Demonstrate that ignored nested scratch is skipped and a real tracked-source lint violation in a disposable copy still fails. The ordinary local `pnpm.cmd check` must reach the later gates. |
| VF-0180 · Windows setup | Split or explicitly check sequential native commands in PowerShell setup, including pnpm/uv, Corepack, rustup and WebDriver installation where applicable. In a disposable controlled failure, a failed first command must fail its named step even when the following command would succeed. Verify the ordinary install path. |
| VF-0185 · receipt fixture | Give the synthetic installer a fixed past mtime after its final write. Read back the filesystem precision and construct ordered past start/completion times. Validate the success case and retain separate failures for a pre-installer start, reversed chronology and future completion. Preserve production receipt validation and the key-order controls. |

### 2. Require the working checks on main

**Complete.** [Ruleset and PR evidence](../evidence/ci-reliability-and-dependency-updates/main-rules.md) records the previous settings, the applied rule and GitHub’s blocked/green decisions. For VF-0174, capture the effective rules, existing bypass settings and exact GitHub Actions check names/source on a green integrated revision. An authorized repository administrator adds `Windows native foundation`, `Ubuntu portable foundation`, `Ubuntu Rust foundation` and `Production dependency graphs` to the applicable main ruleset. Preserve the existing PR and conversation-resolution settings.

Read the effective rules back. On a normal PR without bypass privileges, verify GitHub reports merging blocked while a required check is pending or failing. Verify those four requirements are satisfied on the green revision. Use mergeability/status evidence without merging a failing PR. Until the remote rule and this behavior are verified, record VF-0174 as pending. [Effective rules](https://api.github.com/repos/mmjosedaniel/voxleaf/rules/branches/main) · [Required checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)

### 3. Restore useful dependency updates

**Complete.** [PR #335](https://github.com/mmjosedaniel/voxleaf/pull/335) received independent approval. The Windows candidate produced its artifacts, the base uv updater opened four lock proposals, core rejected the out-of-cutoff ONNX release, and #343 ran ESLint and Chromium without TypeScript 7. #328 and #331 were refreshed by Dependabot. The maintainer authorized synchronizing #330 with main. GitHub completed all checks on the resulting PR head and blocked the zip upgrade on its stale inventory. [Synchronized proposal and results](../evidence/ci-reliability-and-dependency-updates/implementation.md#synchronized-pr-330)

- **VF-0176.** Switch only the base service and release-core entries from `pip` to `uv`. Exercise each directory. For an admissible update, inspect the resulting lock diff and run locked sync/export. The core case must retain the local service source, dated eligibility cutoffs and explicit release pins. Report an ineligible update with its reason. PR #324 is the manifest-only counterexample. A green update job alone proves too little. [Core project](../../../services/tts/release/core/pyproject.toml) · [Dependabot ecosystems](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference#package-ecosystem)
- **VF-0175.** Replace the broken optional-profile pip entry with weekly, read-only Windows candidate discovery, also runnable on demand. Compare the pinned input with available versions under a stated candidate cutoff and allowlist, then resolve proposed changes against Windows x64/Python 3.12 into scratch. Use the existing v7 lock recipe as the platform/hash reference. Its normal output path is the published v7 lock, so direct candidate output elsewhere. Keep direct URL/CUDA pins under explicit review. Report eligible changes with candidate input and lock diffs, or a successful no-update result. Report unsupported wheels, network or resolver failures distinctly. Prove a known eligible change is surfaced and the exact Windows wheel is accepted, plus an incompatible candidate fails. Verify the tracked v7 inputs, lock, source/acquisition authorities and local v8 identity remain byte-identical. Switch the weekly job over only when its replacement demonstrates this path. [v7 inputs](../../../services/tts/release/profiles/chatterbox-v7/requirements.in) · [Release precedent](../completed/chatterbox-msgpack-security-refresh.md)
- **VF-0184.** Exclude the currently deferred TypeScript 7 range from version-update proposals so compatible development updates can proceed. Revisit it when the parser supports that major. Verify an eligible group still forms, runs lint and exercises Chromium. Record #329's browser failures separately if they recur on an isolated candidate.
- Recheck the status of #324 and #328–331 against their live heads. With authorization, refresh stale-base PRs #328, #330 and #331 after the repairs land. Record pass or the new diagnostic for each current proposal. Let the revised updater generate an admissible replacement for any still-invalid #324/#329 proposal. Do not infer an upgrade is shippable from the historical green run on main.

### 4. Make release-audit failures actionable

**Complete.** [PR #336](https://github.com/mmjosedaniel/voxleaf/pull/336) preserves the thresholds and blind spots. Two hosted negative controls and the ordinary release job completed. The patch merged as `4629117` after four required checks passed. [Review on the integrated foundation](../evidence/ci-reliability-and-dependency-updates/ci-m4-r03.md)

- **VF-0181.** Parse the pinned scanners' actual report formats. Emit ecosystem, package, affected version and advisory ID when available. Distinguish a finding from unavailable scanners, invalid output or registry errors. Run independent graph checks and inventory verification to recorded outcomes even when one fails. The job must remain failed if any required check failed. Use sanitized synthetic scanner results for a finding in each of Node/Rust, a clean run, and a tool failure.
- **VF-0182.** Compare full typed warning records independent of object property order. Exercise reordered fields, changed versions or reachability, duplicates, missing/extra fields and wrong types. Align Windows reachability with the inventory's locked normal/build tree and release feature. Existing unexpected warnings must still reject the audit.
- **VF-0183.** Change the inventory generator's dated wording to name the high/critical Node threshold, the actual Rust/Python scope and blind spots. Regenerate using `pnpm.cmd inventory:release`. An allowed moderate Node advisory cannot justify an unqualified clean claim. Verify the regenerated inventory is current and any changed component identities are explained.

### 5. Remove repeated work and retain failure evidence

**Complete.** [PR #337](https://github.com/mmjosedaniel/voxleaf/pull/337) integrated after the final four hosted checks and [CI-M5-R02](../evidence/ci-reliability-and-dependency-updates/ci-m5-r02.md). The final Windows sample took 25m07s, including one application build and both smoke engines. The release job took 1m48s.

1. Reuse the pinned cargo-audit Windows executable. Prefer an exact published asset with an independently verified digest if available. Otherwise reuse a trusted default-branch build with independently verifiable identity, keyed by scanner version, toolchain, OS and architecture. A missing or unverifiable binary takes the existing locked source-install path. Refresh advisory data and scan the current locks on every run. Compare cold, verified warm and rejected-identity paths. A version print or checksum supplied solely by the same cache is insufficient. [GitHub cache scope](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching)
2. On Windows, run cheap gates before browser/driver setup. Preserve the pinned NSIS prerequisite before tests that compile installer fixtures. Let the normal aggregate build the default Tauri release binary once, then point the existing `native-startup-smoke.mjs` harness to that exact absolute path. Keep the standalone local build-and-smoke command and separate production Chromium preview. Verify one native build, the executable identity used for smoke, and an early exit on a formatting error. [Existing executable invocation](../../development/testing.md#L1678)
3. Try a shallow checkout and skip workspace JS installation only in the Ubuntu Rust job. Keep pnpm if it launches the existing wrappers. Require the fresh Linux job to run formatting, Clippy and tests for the supported features as before. Restore any prerequisite demonstrated necessary.
4. On Chromium failure only, upload an allowlisted trace/screenshot from synthetic tests with explicit short retention and recorded expiry. Check the failed job provides the artifact and the successful job produces none. Keep private data, raw local evidence and native/production output outside that upload. Reconcile the action-version inventory with workflow pins and bind the scanner acquisition version to the policy.

## Testing and benchmark strategy

Run repository checks from normal local Windows PowerShell outside the managed sandbox. Use the configured commands below on the affected patch, and record exact command, input identity, result and evidence level. Use disposable fixture copies for negative controls. Hosted results establish GitHub behavior and clean-runner coverage. Local simulations can support diagnosis while hosted acceptance is pending.

| Boundary | Gates and observations |
| --- | --- |
| Foundation | `pnpm.cmd lint:typescript`, `pnpm.cmd lint:rust`, `pnpm.cmd test:rust`, `node --test apps/desktop/scripts/windows-release.node-test.mjs`, then the applicable `pnpm.cmd check` and `pnpm.cmd check:portable`. Verify all required contexts on the exact candidate and the next PR commit. |
| Dependency and release | `pnpm.cmd audit:release`, `pnpm.cmd inventory:release:check`, `pnpm.cmd test:python`. Exercise new audit fixtures through the existing test aggregate when registered. For the frozen profile use `pnpm.cmd package:chatterbox-optional:v7:check-source`, `pnpm.cmd package:chatterbox-optional:v7:check-acquisition`, `pnpm.cmd audit:chatterbox:v7` and `pnpm.cmd test:chatterbox:v7:preparation`. Record a real updater's inputs and its resulting proposal/no-update outcome. |
| Browser, native and cost | Use `pnpm.cmd test:browser:install`, `pnpm.cmd test:browser` and the documented existing-executable invocation for the hosted path. Compare runner class, cold/warm state, setup/build/scan time, format-failure time and total job duration against the audited samples. Confirm both smoke engines pass. Timing variance alone cannot establish equivalence. GPU, audio and reader performance benchmarks are outside this CI change. |

## Risks and rollback

An incorrect check name can block every PR. Retain the pre-change ruleset and restore only its affected rule if that happens. Keep previous updater configuration and default build/scanner commands available for scoped rollback. If Linux setup removal breaks either feature configuration, restore the prerequisite. A cache integrity failure must fall back to the pinned install. Diagnose a red dependency gate against its actual PR head. Preserve release identity and report blockers instead of loosening admission, thresholds or tests.

## Progress log

- 2026-11-25 — Closed milestone 3 after the authorized branch update and the final hosted checks on #330. The dependency PR remained open. [Final PR evidence](../evidence/ci-reliability-and-dependency-updates/implementation.md#synchronized-pr-330)

- 2026-11-25 — All four implementation PRs landed in order (#334, #335, #336, #337). Main now enforces the four checks. The final native and release timings, permitted dependency results, deliberately failed jobs and original versus current proposal heads are in the [execution record](../evidence/ci-reliability-and-dependency-updates/implementation.md). The plan remains active for the outstanding branch refresh in milestone 3.

- 2026-11-25 — Local foundation, portable and 115 Chromium scenarios passed. The revised Windows updater verified an installation plan for 79 packages including the two exact CUDA wheels, then retained its proposal for seven days. A real incompatible wheel was rejected. The two uv controls established an admissible base lock change and an ineligible core update. [Implementation evidence](../evidence/ci-reliability-and-dependency-updates/implementation.md) · [Dependency rollout review](../evidence/ci-reliability-and-dependency-updates/ci-m3-r01.md)
- 2026-11-25 — The first implementation review of release diagnostics requested four corrections. On the revised patch, independent graph and inventory results survived both a Rust warning mismatch and an unavailable scanner in real GitHub jobs. The format-failure control rejected its source in two minutes before installing a browser or driver. [Corrective review](../evidence/ci-reliability-and-dependency-updates/ci-m4-r01.md) · [Revised review](../evidence/ci-reliability-and-dependency-updates/ci-m4-r02.md) · [Format control](https://github.com/mmjosedaniel/voxleaf/actions/runs/45698612672/job/139502503297)
- 2026-11-25 — Implementation is in progress. [Foundation #334](https://github.com/mmjosedaniel/voxleaf/pull/334), [updaters #335](https://github.com/mmjosedaniel/voxleaf/pull/335), [audit #336](https://github.com/mmjosedaniel/voxleaf/pull/336) and [efficiency #337](https://github.com/mmjosedaniel/voxleaf/pull/337) have distinct integration results. The original local lint failure reproduced with 3,748 errors. The corrected aggregate passed lint and both Rust feature test sets. A stale synthetic Cargo manifest failed before compilation with unchanged lock bytes. The Windows updater [produced a candidate](https://github.com/mmjosedaniel/voxleaf/actions/runs/45696531807/job/139495272361) including certifi and msgpack while preserving the tracked authorities. The production release scans, regenerated inventory and two focused report tests passed locally. A verified scanner archive took 1.71 seconds to acquire locally, 0.89 seconds on reuse, and a corrupt archive triggered a successful locked source install. Branch enforcement and final acceptance are pending.
- 2026-11-25 — Established the audit baseline, mapped the twelve findings and selected the verification and rollout order. All five implementation milestones are pending.

## Discoveries and decisions

Keep release inventory and local fixture corrections separate from the administrative rule change. VF-0057's synchronous write admission and VF-0155's lock-only chrono classification are existing protections. The scheduled work in milestone 3 replaces an existing weekly update responsibility. A periodic advisory scan of idle main is a separate policy decision. Record new evidence and decisions here during execution.

## Final validation results

The twelve original findings are recorded as fixed in the [registry](../../development/findings/registry.md#vf-0174). [CI-M1-R01](../evidence/ci-reliability-and-dependency-updates/ci-m1-r01.md), [CI-M3-R01](../evidence/ci-reliability-and-dependency-updates/ci-m3-r01.md), [CI-M4-R03](../evidence/ci-reliability-and-dependency-updates/ci-m4-r03.md) and [CI-M5-R02](../evidence/ci-reliability-and-dependency-updates/ci-m5-r02.md) cover the exact implementation patches. Their [manifests](../evidence/ci-reliability-and-dependency-updates/implementation-manifests.md) are preserved. [Main rules and rollback](../evidence/ci-reliability-and-dependency-updates/main-rules.md) and the [execution record](../evidence/ci-reliability-and-dependency-updates/implementation.md) describe the service results.

The planning approval [CI-PLAN-CR-R01](../evidence/ci-reliability-and-dependency-updates/plan-review.md) and its [documentation checks](../evidence/ci-reliability-and-dependency-updates/plan-closeout.md) remain historical. All five milestones are complete. The synchronized dependency proposal remains subject to its own release inventory gate. [Final PR evidence](../evidence/ci-reliability-and-dependency-updates/implementation.md#synchronized-pr-330) · [Archive review](../evidence/ci-reliability-and-dependency-updates/archive-review.md)
