# Change Review Report

**Review ID:** CAF-R1-20261103  
**Task ID:** CAF — chat-audit-minimal-follow-up  
**Verdict:** **BLOCKED** — required final evidence is pending, and one confirmed acceptance-coverage gap requires correction.

**Base commit and reviewed HEAD:** `840bf0a2cadf43849d380058b38da784174302db`  
**Branch:** `codex/chat-audit-minimal-follow-up-plan`

**Reviewed paths and identities**

Frozen artifacts under `tmp/evidence/chat-audit-minimal-follow-up/20261103-01/`:

| Artifact | SHA-256 |
|---|---|
| `R1-reviewed-identities.json` — all 59 changed paths | `E2828CCA7C167A7A544C7E1B52A11FD2135D850D8F37BE0CEA62543AAD684F6B` |
| `R1-all-source-identities.json` — 1,537 source paths | `85585A470CDE395ED4C8B36B7B5DC15169B1F410455E532B6F79884E68AD55E8` |
| `R1-tracked.patch` | `817705A4936FCADC0BF06FC7DEDA8B100C3296E59792B0B318F58C0B7F83F0DC` |
| `R1-new-files.json` | `CE98F74E5BC791960E95F95FC029D9A1BFF60FF8052720F2FD2526CF16C1865A` |

Reviewed the production and test changes, new contract vectors, generated-package deltas, documentation changes and evidence summaries. Unchanged supporting source examined includes:

- `packages/shared/src/contracts/locator.ts`
- `packages/epub/src/resource/raster-resource-catalog.ts`
- `packages/epub/src/resource/opened-publication.ts`
- `apps/desktop/src/settings/narration-settings-actions.ts`
- `apps/desktop/src/persistence/reader-position-restore-coordinator.ts`
- `apps/desktop/src/tts/optional-chatterbox-client.ts`
- `apps/desktop/src/tts/product-narration-coordinator.ts`

Applicable requirements, architecture, diagram, M005 boundary, roadmap, ADRs 0010/0012/0046/0060/0064/0065 and review/evidence policies informed the assessment. Their identities are retained in the source manifest. The proposed report path is excluded from its own manifest.

**Identity recheck: PASS**

Before and after inspection, all 1,537 source SHA-256 identities matched the frozen manifest. Final inspection also verified all 59 filter-aware changed-file blob identities, exact changed-path membership, unchanged HEAD/branch and an empty index. No reviewed-source drift was observed.

**Acceptance review**

The patch stays within the planned bounded corrections. Inspection supports the intended archive ownership release, rejected-rendition admission, conservative current normalization, protocol parity, incremental Piper collection, identity-scoped containment, optional-package recovery protections, reader placement/focus changes and tooling corrections. Preserved policies and deferred cases remain explicitly separate.

R7.3 has an attributed pre-edit failure at the intended assertion and a focused clock correction. Changed existing assertions follow approved behavior changes; I found no assertion weakened to conceal an unrelated failure.

**Findings**

**CAF-R1-F1 — P2, confirmed acceptance-coverage gap**

- **Location:** `apps/desktop/src/App.test.tsx:3050`; affected production ownership at `App.tsx:543`, `App.tsx:630` and `App.tsx:672`.
- **Trigger:** An appearance write fails before a position-save coordinator exists, or a deferred appearance write fails after the mounted publication owner has been replaced.
- **Consequence:** The required direct-write feedback and mounted stale-completion protections remain unproved. Regressions in the epoch guard, callback detachment or restore-cache publication could pass the current tests.
- **Evidence:** The CAF-R6.2 App test waits for an after-open failure before replacing the book. The save-coordinator test at line 213 checks its isolated stale/closed callback behavior. CAF-3 also covers an after-open failure. None exercises the two missing mounted boundaries required by the plan’s R6.2 criterion at line 107. The coordinator confirmed no additional matching assertions exist.
- **Bounded correction criterion:** Add focused App tests using the existing committed-props/`observeSettings` harness for the direct-write path, and a deferred failure spanning publication replacement. Assert temporary appearance retention, truthful current failure/restore status, stale-result suppression and a successful current-owner retry. No new pre-book Settings UI is required. Supply passing host-local App and applicable static checks for the revised patch.

This is a demonstrated coverage gap, not a confirmed runtime defect.

**Test evidence reviewed**

Attributed executor receipts and raw outputs report:

- G2: shared **56**, EPUB **455** passing tests.
- G3: **505** tests from the 14 passing suites, plus G3-App-exact **87** passing tests. The failed G3-final aggregate remains rejected.
- Python **147**, Node **52**, Rust **173/172** passing tests; Rust ignored tests remain separate.
- Three CAF Chromium journeys.
- Applicable static checks, one Piper regeneration/check with ES/EN smokes, desktop build, Piper EN 1x host arm and fresh F08.
- Installed-input comparison and supplied Piper/F08 restoration records.

I inspected these results; I did not execute tests, builds or formatters. Final cross-gate acceptance remains pending the promised input-equivalence proof.

**Remaining uncertainty**

The following required artifacts were absent at the final recheck:

- `G9-local-admission-result.json`
- `G9-cleanup.json`
- `R1-input-equivalence.json`

**Required next action**

Correct CAF-R1-F1, complete the pending admission/cleanup evidence, and submit a new immutable revision with matching input-equivalence evidence and renewed affected checks. This report grants no approval or Git authorization.
