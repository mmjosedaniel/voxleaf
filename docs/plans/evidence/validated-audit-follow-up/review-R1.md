# Change Review Report

Review ID: `VAF-R1-20261028`  
Task ID: `validated-audit-follow-up`  
Verdict: **BLOCKED**

Base commit and reviewed HEAD: `beb1093447a9bd75ee3eee9c28575e4a902b55d7`  
Branch: `codex/validated-audit-follow-up`

The patch has one actionable H13 finding. Required final B1, N1 and L1 evidence is also incomplete. This report grants neither acceptance nor Git authorization.

## Reviewed paths and identities

The closed scope comprises the 86 paths in `tmp/evidence/validated-audit-follow-up/VAF-R1-20261028-manifest.json`, including all 42 task-owned changed paths, plus the seven unchanged supporting paths below. There are no pre-existing edits or additional changed paths. The report itself is excluded.

| Artifact | SHA-256 |
| --- | --- |
| `VAF-R1-20261028-manifest.json` | `efe0a81824df10a995e3c9244517272b62015daa65dce5b8f028eae92cd2380b` |
| `VAF-R1-20261028-tracked.patch` | `c24fe863fb96911524fed5b0d15d4407b2b76e8f0e36f7592decfa38a0ea5443` |
| `VAF-R1-20261028-new-files.json` | `d78f59c1cc10bb3b832a133fa93d09a81f01a785508e4325c67a9c2c1d87582b` |
| `VAF-R1-20261028-receipts.json` | `4cf3d3d1a502dac5978d0189078d024ac0bd4d21e8ab161b67a0123c0fd95662` |
| `VAF-R1-20261028-gate-deltas.json` | `69c1d66e2663cbbae7f94210a45d90beeb942fc3c1b1a0e466bb260df5660db1` |

All artifact paths above are relative to `tmp/evidence/validated-audit-follow-up/`. The 127 entries in the receipt manifest matched their recorded hashes.

Additional supporting paths have porcelain status `"  "`:

| Path | SHA-256 | Filter-aware blob ID |
| --- | --- | --- |
| `apps/desktop/src/tts/HardwareCompatibilityControls.tsx` | `556fcc93b73adb855470a12dab950e31ff09a77d03acb20e54aaddcefcae8afe` | `678159162bd003f851dc1dce9468c1f8c033da37` |
| `services/tts/benchmarks/harness.py` | `a6308187fc8d11b3f05787cd2f0ba09c73b3f7ae0ec90b91414f3322cf2db467` | `e617e0eee6d203217ab04e00c0465a5778c3e26d` |
| `docs/architecture/narration-preparation-limits-v1.md` | `bab17ade55ff9b8b04ee9f2a0bebbb96e4c467260e54d4ff557bf3c125f54240` | `a18fbbb72586204fdfb5c28fabe5e2b817ce80a8` |
| `docs/architecture/decisions/ADR-0047-separate-chatterbox-uninstall-retention.md` | `3d5ac04867ca300e599055c30e62ae65fd1af1b0785325ffebfebb3e693a723a` | `40e4ccb76b45a94b84431b66bd30615adb4b9ea8` |
| `docs/architecture/decisions/ADR-0063-default-cuda-and-celsius-boundaries.md` | `807676c3384a51d6d6a317cc93fa795ceb810a84c5521c84e1b9bcb9dd66b97f` | `66d0111e5fda60d655b4ab951f6f23b3c0e69ca4` |
| `docs/architecture/decisions/ADR-0066-bounded-orientation-and-silent-tail-corrections.md` | `c1f6ffe553aa1edb5d08065e8f75454ebd590c8443232004790af4d2f4c87316` | `250dd6d4ea6590824294960d07bcbd69c9295e84` |
| `packages/epub/src/narration/narration-prepared-segment.ts` | `bd885664ee9220d2621bde03266174b883ac393771f65dc9ea8a10c4b19dcfa2` | `3066360d253e1bac6d41794bdd07a9683994c7d2` |

Identity recheck: **PASS**. Opening and closing checks matched the supplied manifest's statuses, SHA-256 hashes and filter-aware blobs. Supplemental identities remained unchanged. Base, HEAD and branch remained unchanged; the index remained empty.

## Acceptance review

The actual production/test patch, relevant requirements, direct callers and supplied evidence were inspected independently.

- **H1/H7:** Optional recheck awaits fresh compatibility and invokes the existing reconciliation callback. Focus filtering includes summaries and excludes effectively disabled controls. New unit and browser assertions cover both Tab directions, unchanged-selection playback, changed-selection containment and absence of automatic download/start.
- **H8:** The scheduler admits a complete nonempty zero-millisecond tail using frame truth. Scheduler/coordinator tests cover the specified six frame/rate combinations, consumption, release and terminal completion without fabricating duration.
- **H10:** Completion revokes follow/navigation/settlement eligibility while retaining decoration and cancelling pending follow. Unit and browser assertions cover final settlement followed by manual reading and reflow.
- **H6/H11:** The bounded contextual guard preserves abbreviation protection/source mapping. Unicode Mark classification uses the existing packer. Corpus controls and additive tests cover preserved contexts, backtracking, exact limits, overflow, public batching equality and unchanged display text.
- **H3/H4/H12:** Diagnostic matching retains a bounded cross-write suffix; screen audits no longer claim success without a successful observed run; all five quality builders shuffle presentation records after synthesis. Deterministic assertions check order and case/audio/sample correspondence.
- **H2:** The production request-error boundary checks cancellation before publishing a failure diagnostic. The real loopback regression exercises withheld headers, cancellation, request failure, staging cleanup and the uncancelled control.
- **H9:** Preference cleanup has an independent postcondition, including unsafe/inaccessible ancestors. Compiled NSIS tests retain default/update/independent-removal controls.
- **H13:** Ownership journaling, partial-install cleanup, backup retention and cleanup-before-restoration are implemented, but the required bounded uninstall attempt is missing.

H5 remains excluded. No frozen contracts, corpus, historical evaluations, completed plans, dependencies or generated tracked sources were changed. No additional component or persistence boundary was introduced. The obsolete copied-selector focus assertion was replaced by stronger behavioral coverage; no concealment of a product failure was found.

## Test evidence reviewed

These are **executor-supplied local PowerShell results**, not commands run by this reviewer:

| Receipt | Command and attributed result |
| --- | --- |
| `F-Python-tests-01` | `pnpm.cmd test:python`: 722 passed; one cache-write warning |
| `F-Python-static-01` | Python format/lint/typecheck scripts: passed |
| `F-Python-build-01` | `pnpm.cmd build:python`: passed |
| `F-Rust-static-tests-01` | Rust format/lint/test scripts: passed; 140 default and 139 release-locked tests, seven explicitly ignored per configuration |
| `F-TS-static-01`, `TS-format-02` | TypeScript static checks plus later scoped test-file formatting/lint/typecheck: passed |
| `F-TS-tests-01` | `pnpm.cmd test:typescript`: shared 210 and EPUB 720 passed; desktop initially failed one obsolete focus assertion |
| `F-Desktop-tests-02` | `pnpm.cmd --filter @voxleaf/desktop test`: 913 Vitest and 109 Node tests passed |
| `F-Desktop-build-01` | `pnpm.cmd build:desktop`: passed |
| `F-evidence-01` | `pnpm.cmd test:evidence`: 31 passed; document guard and diff check passed on their recorded inputs |

Recorded before/after identities and gate deltas support retaining the unaffected Python, Rust, shared/EPUB and desktop deterministic leaves. Subsequent changes outside those consumed inputs do not supply new execution claims. No historical approval or historical aggregate PASS was reused.

**B1 remains incomplete under the required identity policy.** `B1-browser-01` produced 13 passes and one VAF fixture failure; `B1-browser-VAF-02` passed only VAF after changing the shared spec. The trace member `src/07a25ec1f2e0da3000ad2f35da3a701af63c590a.ts` has SHA-256 `0c0303207ac3b9a2b0c7fe973db66715cf67e157884dbd1450aa8b7acd17e9eb`, matching the recorded earlier source. Its difference is confined to the optional fixture capability and VAF assertion. Nevertheless, the canonical policy requires identical consumed test/fixture inputs and explicitly invalidates changed harnesses. A current full-spec receipt is required. The standalone extracted-source file named in the request does not exist; the trace was inspected directly.

**N1 remains incomplete.** Both uninstrumented attempts fail with `synchronization-feasibility-failed`, `followed=false`. The manually constructed probe does not invoke the changed highlight controller, so this evidence does not establish a defect there. The instrumented diagnostic pass cannot replace N1.

**L1 remains unexecuted.** A personal installation blocks the required real lifecycle run without separate authorization or a suitable disposable environment.

## Findings

**VAF-R1-F1 — P2 — Bound the cleanup uninstaller wait**

- **Location:** `scripts/test-windows-package-lifecycle.ps1:149`, `Invoke-Uninstaller`; invoked from `finally` at line 330.
- **Trigger:** An owned installation exists after an earlier failure, and its uninstaller starts but does not exit.
- **Consequence:** `Start-Process -Wait` blocks indefinitely inside cleanup. Recovery cannot finish, report cleanup failure, or return control with its preserved recovery state. The primary failure also remains unreported while waiting.
- **Evidence:** The approved H13 implementation criterion explicitly requires a bounded uninstall attempt. `Stop-LifecycleProcess` has a ten-second termination wait, but it runs before the new cleanup uninstaller is launched; it does not bound this `-Wait`. Existing fault fixtures return immediately or throw and therefore do not cover a hanging uninstaller.
- **Correction criterion:** Give the cleanup uninstall operation a finite deadline and retain exact process/installation ownership. On timeout, report cleanup failure, preserve the original failure and recovery artifacts, and prevent restoration while cleanup remains unverified. Add a deterministic hanging-uninstaller regression proving bounded completion and preservation.

This is a confirmed source/acceptance gap, not a claim that an observed host uninstaller hung.

## Remaining uncertainty and required next action

1. Correct VAF-R1-F1 and renew the affected Windows/Node evidence.
2. Obtain a passing full `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts` receipt on the final spec.
3. Resolve N1 through a diagnosed, authorized next step and obtain its required uninstrumented evidence.
4. Obtain authorized clean-entry L1 integration evidence.
5. Renew `pnpm.cmd check:evidence` after final documentation changes.
6. Submit the resulting exact patch under a new review ID.

Host postflight confirms unchanged executable/uninstaller hashes, entry counts and named temporary roots, with zero named native processes. Full metadata digests differ without an explained cause; complete host equality is **not established**, and corruption is **not established** either. Later stable inventories cannot reconstruct the missing per-entry baseline.

No model-backed occurrence of H8, new listening quality, model/runtime rebuild or release acceptance is claimed. Review inspection is complete; the coordinator may end the write freeze to address findings. This immutable R1 report must not be rebound to later hashes.
