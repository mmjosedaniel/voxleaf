# Change Review Report

Review ID: **FPFC-IMPLEMENTATION-CR-R01**  
Task ID: **four-pass-findings-corrections**  
Verdict: **BLOCKED**

Base commit and reviewed HEAD: `df0109b0cefb50394e55eed10f2065140de837ec`  
Branch: `codex/four-pass-findings-corrections-plan`

Reviewed paths and identities: The complete closed set in `tmp/evidence/four-pass-findings-corrections/implementation-review-r01/manifest.json`: 1,808 paths, including 37 changed paths. No inherited approval.

| Artifact | SHA-256 |
| --- | --- |
| `manifest.json` | `0e4714bf00c592bc5d09d093c4776ee7874052b7780b313bc33b93a98cf40c5a` |
| `patch.diff` | `8df591867dce0778614835761d1d98fe02a28ddab2535447a247f2c6883bf694` |
| `new-files.json` | `718508c8a50871501366c4ec0ea0b454d0343b189891b23616f28a845592f1e0` |
| `gate-artifacts.json` | `47cf2e954dffbc6043e2e7bec8003f148c39b05470ab2fc6314a6bf8fb777d19` |

Identity recheck: **PASS.** Before and after review, HEAD, branch, all path SHA-256 values, filter-aware blobs, statuses and the 69 evidence-artifact hashes matched. The manifest covers the actual changes and new-file contents without duplicate entries or additional changed paths. The index remained empty. Both reserved terminal destinations remained absent.

Acceptance review:

The patch was reviewed against AGENTS.md, the approved plan, original audits and registry, relevant product/architecture authorities, affected production owners, direct callers and regression assertions.

- **U1:** The v14-only changes preserve rejected raw inputs until successful derivation/serialization, retain measured privacy failures, fail conclusions dependent on invalid playback, and reject unproved CPU admission. The producer overflow, isolated-worker privacy, real deriver retry and contradictory-summary assertions address their respective paths. Frozen v4/v13 authorities remain unchanged.
- **U2:** The source separates functional smoke failure from containment, launches a run-owned installer copy, and binds release evidence to locked artifacts and build authority. Required mutation-boundary and installed-startup evidence remains incomplete.
- **U3:** The label handling remains bounded and rejects substantive overflow; horizontal-space matching stays outside frozen narration-v1; paragraph direction follows the block boundary. Public-opening, narration-range and visual-restoration assertions were inspected.
- **U4:** Controlled IPC with the real client and mounted App covers both late-Cancel response orders, one availability refresh, no autoplay and the next explicit Play dispatch. Cleanup-failure and stale-owner protections remain.
- **U5:** Direct decoding removes the extra full-sized array. Refill admission remains provisional until activation, with selection/fallback, sufficient-lead continuation and unchanged-underrun assertions. No measured RSS or new DSP-quality claim is established.
- **U6:** Trusted native movement and subsequent audible-range recovery are distinct from Chromium’s first-prepared-range observation. The scoped zero-offset assertion change retains anchor/range containment and does not weaken the existing downward controls. Two native results require renewal against the final shared harness.

VF-0071 remains excluded. VF-0070 establishes fail-closed admission only; a positive successor remains deferred. No new public contract, dependency, EPUB network flow or generated-audio persistence was introduced.

Test evidence reviewed:

All executions below are attributed to the coordinator/implementer’s normal local Windows PowerShell runs. **The reviewer executed no tests, builds, formatters or linters.**

| Gate | Supplied evidence and assessment |
| --- | --- |
| G-PY | Eight-file pytest union reported 128 passed, exit 0. The retained earlier receipt contains exact arguments and stable inputs; four captured files subsequently changed. The renewed `g-python.log` lacks matching before/after identities. |
| G-NODE | `node --test` for ordinary-host, windows-release and native-smoke: 150 passed, zero skips. Receipt hashes verified; only the two declared native scripts subsequently changed. The native fixture renewal reports 59 passed. |
| G-EPUB | Eight-file Vitest union reported 574 passed after package exports were rebuilt. Coordinator identified tool session `58060`, exit 0; no immutable tested-input linkage was retained. |
| G-DESKTOP | Eleven-file Vitest union: 626 passed. Exact arguments, receipt and subordinate hashes verified; captured inputs, including generated package outputs, match the candidate. |
| G-BROWSER | Retained logs show Ctrl+Home, Ctrl+End, real refill and RTL save/reopen passing, followed by the corrected Shift+Space case passing. Earlier failed fixtures remain recorded. |
| G-NATIVE | Final-binary Shift+Space/Ctrl+Home and later Ctrl+End successes are retained, but only Ctrl+End used the final shared harness. |
| G-RELEASE | Current unsigned build and package check passed. Actual installation, installed-byte verification, uninstall and original-profile restoration passed; installed application launch was not exercised. |
| G-STATIC | Retained frontend and Python logs report affected formatting, lint and type checks passing. Evidence/diff checks are coordinator-attributed. No historical behavioral PASS was substituted. |

Findings: **No confirmed production defect identified.** The following are acceptance-evidence blockers, not claims that the implementations fail.

1. **B1 — P2 acceptance gap: U2 original replacement triggers.**  
   Owners: `runJourney`; `build-windows-release.ps1`; `writePackageEvidence`.  
   Evidence: `ordinary-chatterbox-release-host.node-test.mjs:259` checks private path/content without replacing the public installer. `windows-release.node-test.mjs:1402` and `:1421` inject mismatched fields directly; its PowerShell fixture checks handoff arguments without the required replacement attempts.  
   Consequence: These checks do not establish the approved producer-boundary protections for VF-0067, VF-0068 and VF-0072.  
   **Correction criterion:** Add bounded disposable-fixture controls for permanent and swap-and-return source replacement, post-build authority mutation before attachment, and attempted artifact replacement between PowerShell observations and Node hashing. Assert exercised/recorded byte identity or rejection, preservation of prior evidence/sidecars on rejection, and unchanged-input continuation. Retain meaningful original-trigger failure evidence.

2. **B2 — P2 acceptance gap: failed v14 deletion.**  
   Owner: `batch_result_cli.py:_consume_v14`, especially line 125.  
   Evidence: CLI regressions cover rejected reads, real authority rejection/retry and successful removal, but no failed or partial `rmtree`.  
   Consequence: The explicitly required cleanup-failure boundary is unverified.  
   **Correction criterion:** Exercise failed/partial removal through the CLI and assert failure-only output, no successful cleanup summary, and no false claim that partially consumed inputs remain intact.

3. **B3 — Required current-input linkage missing for G-PY and G-EPUB.**  
   **Correction criterion:** Supply existing immutable command/result/input linkage, or rerun the selected unions with exact command, environment, exit status and before/after consumed-input captures. Include generated package exports where consumed. Do not relabel the earlier capture as the renewed run.

4. **B4 — Final native harness not exercised for two chords.**  
   Evidence: Shift+Space/Ctrl+Home bind `tts-scenarios.mjs` to `9daf16f4…`; final Ctrl+End binds it to `fbb65603…`. The added scroll-stability wait affects their shared scenario.  
   **Correction criterion:** Renew only focused native Shift+Space and Ctrl+Home using the retained matching dev binary and final harness. No rebuild or broader model campaign is required solely for this gap.

5. **B5 — Installed release startup missing.**  
   Evidence: `ordinary-local-candidate.mjs:36–40` validates installed bytes then deliberately exits before session creation.  
   **Correction criterion:** Complete one bounded launch and verified shutdown/containment of the installed final release candidate, followed by uninstall and profile-restoration verification. Optional download and inference are unnecessary.

Remaining uncertainty: The five boundaries above remain unaccepted. Signed/Defender journeys, full optional acquisition, positive v14 CPU admission and general hardware/performance support are outside this review’s claims.

Required next action: Supply those focused corrections/evidence, preserve this report unchanged, and request a new review ID for the resulting candidate. Keep the implementation plan active.

This report grants no implementation acceptance, Validation Report status, or permission to commit, push, publish or create a pull request.
