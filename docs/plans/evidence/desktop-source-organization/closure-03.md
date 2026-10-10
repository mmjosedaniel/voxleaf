# Validation Report
Report ID: DESKTOP-ORG-CLOSURE-03
Target ID: desktop-source-organization / diagnosis documentation closure
Mode: FINAL
Verdict: BLOCKED
Environment: local PowerShell outside sandbox. Bounded documentation and preservation review only; no runtime reruns, installation, full group F, or campaign acceptance.
Starting HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Ending HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Validated paths: closed 21-path manifest below; this receipt is self-excluded.
Validated path identities:

| Path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| apps/desktop/src/reader/SemanticDocument.tsx | ` M apps/desktop/src/reader/SemanticDocument.tsx` | 6559C258CE1A2247897DCB131D6D5D4A5B79AED6F0CE8F94D6700189151FE8E2 | 2461f6208cc6e1b082b1c7977143f37903d2e041 |
| apps/desktop/src/reader/semantic-document-render-plan.ts | `?? apps/desktop/src/reader/semantic-document-render-plan.ts` | 51E91A57D9ED9C6B9734434F8489AD150DE0E6D22DAE8888A3036263E1A247CB | f7083cd49d14c17eaeefd898ed230da223042616 |
| apps/desktop/src/reader/SemanticDocument.test.tsx | ` M apps/desktop/src/reader/SemanticDocument.test.tsx` | C37C3437C433F8E73DEA95C36373D2C7A8842746D0A0FFD82B5C5555B06981A3 | 26ba73dc3fb43d41f345ae852131ae2846e1d1ef |
| apps/desktop/src/tts/pcm-playback.ts | `CLEAN (empty)` | 2731139D1F6BB7C0BA936BEC426710ADC03CFFAD7A3A35381AC70FBC31F2C1BD | bcbea041a9a5bfdf0d5acf47927c6b91f2b496db |
| apps/desktop/src/tts/pcm-playback-contracts.ts | `CLEAN (empty)` | ABSENT | ABSENT |
| apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts | `CLEAN (empty)` | ABSENT | ABSENT |
| apps/desktop/src/styles.css | `CLEAN (empty)` | FF3DEC8E9000AC8C547A37ED77AEFCDAD6C1B33705E94CC322B5FC726783D823 | b616c73157a4a490bbf038ab4a613690432fbd29 |
| apps/desktop/src/settings/narration-settings-actions.ts | `CLEAN (empty)` | 8782470007E32E81AF7F6B04BD3CD51F878635E410AB9C70664371E327517DB5 | d49281f8ad9c336568cc6e56f6d596cd25458ac7 |
| apps/desktop/src/tts/HardwareCompatibilityControls.tsx | `CLEAN (empty)` | 3ACCA5106BAFD089282C536D2F639BBE80E7128F3391D8879D0D7F9CFC184384 | 6bf1bb57fc346a2359219e48c82d5042523efdf2 |
| apps/desktop/src/tts/optional-chatterbox-client.ts | `CLEAN (empty)` | 687B13980DB4096C4114A8C97B6D843396C40E048DB099E496609DAF2324DA97 | e52200f97d0a7cd8a384e1cfd43509b7b817e99f |
| apps/desktop/src-tauri/src/tts_optional_chatterbox.rs | `CLEAN (empty)` | E525734297CE7CF8B437E5FC50B75A9F6D680CA6FC56707EE36ACAE5CAF45ECF | 8cc8be9ddcdd7b676b0743b3cbb6b8ecc2d74513 |
| apps/desktop/scripts/bilingual-portfolio-host.mjs | `CLEAN (empty)` | 9CA2FC5ACD2DCA71A713E843397AF8F7816451A879635AE39BFEF36498AB9BCE | 62dbe89b3f2d99bf8a6c641bf0112b21fd426abc |
| apps/desktop/scripts/native-startup-smoke.mjs | `CLEAN (empty)` | 7238E6807B3D832F810F6811AB3E4B15D567969F91D89012FB2A41E1A0F7E4AC | 2e502ceb4eecdbab0d301cbdcdddc571b859f94a |
| apps/desktop/scripts/native-webdriver-client.mjs | `CLEAN (empty)` | B898BB5C312C3099E2E43656A8FF27DBA2DD9137ECE26AAA73255DCEF7381051 | bfdeae55313b5a4f3d249eb03709632aa0ee8540 |
| apps/desktop/scripts/adaptive-tts-profile-selection.mjs | `CLEAN (empty)` | 748263CC88876FFE307A733955F5AE186A7E1384B6DE3CB0856C02E318E68ED8 | 084ced445f46beb814e0c1a4aa80601ac77b5adc |
| docs/plans/evidence/desktop-source-organization/PIPER-ES-profile-diagnosis-01.md | `?? docs/plans/evidence/desktop-source-organization/PIPER-ES-profile-diagnosis-01.md` | C6A5569C4FE0181A47AB69087B623484E9A20658938FF57995439938C820DECB | 6b5ee5d6a0e997cda0a3476769889ab511a02fa0 |
| docs/plans/evidence/desktop-source-organization/profile-prerequisite-recovery-01.md | `?? docs/plans/evidence/desktop-source-organization/profile-prerequisite-recovery-01.md` | 07120302095D3A74015539C5CC703A62B76184DC894BEE326C9C800CF0A2555D | 3bda5dd6405b3260feadb0579f431c9effd047f2 |
| docs/plans/evidence/desktop-source-organization/README.md | `?? docs/plans/evidence/desktop-source-organization/README.md` | 1401521662A77AD73B68C44C5BDF9BD4E04B36E429DECFC33035F82976435F2D | f9f0b5f300cbc2c58172a9acf0c126af5a3a657a |
| docs/plans/active/desktop-source-organization.md | ` M docs/plans/active/desktop-source-organization.md` | 90E15111F14C2CB7D07379FF81ECC2DBFB5674B6659995328454EA862E573CAD | 57c843325daa1a52a6d3763794db81bf4772135b |
| docs/development/agentic-change-review.md | `CLEAN (empty)` | DE4C430A5DE120D9C900D6BAD0BEBBFEEC81673614B30F242F3154EFBEDCFC39 | 373443e17547185e2294d906bdc9cb489daca67c |
| services/tts/release/optional/chatterbox/optional-package-manifest-v3.json | `CLEAN (empty)` | C1D650B589D287974C008229DFD553700A83D87EDAAAE705A35FD13CAFFEDF12 | 752533a071f31c1e58fc5cc7530d16f57a2e8836 |

Identity recheck: PASS. All 21 path identities, full HEAD, branch codex/desktop-source-organization, complete porcelain path/status list, and empty index unchanged across the check. The 15 source/harness identities match PIPER-ES-PROFILE-DIAG-01 after.json exactly; accepted Unit1 identities remain unchanged, PCM/CSS remain clean, proposed PCM additions remain ABSENT. No source edits since the prior report. Capture files before.json and after.json retain the complete manifests. The final receipt copy is the only anticipated subsequent documentation addition.
Commands and outcomes:
1. Host read-only Get-Content/rg inspection of the four current documents, review policy and directly relevant source/manifest references -> documentation review PASS. This includes the diagnosis copy, recovery assessment, evidence index and active plan. One initial rg Windows wildcard path was invalid; corrected directory search succeeded. No runtime command was attempted.
2. & ./tmp/evidence/desktop-source-organization/DESKTOP-ORG-CLOSURE-03/check.ps1 -> exit 0. Captured HEAD/branch/status/index, SHA256 and filter-aware blobs before/after; compared source identities against the diagnostic, checked copied report and local links.
3. git diff --check -> exit 0, no whitespace findings; raw output in diff-check.log.
4. git diff --cached --quiet -> exit 0 before and after; index empty.
5. Get-FileHash SHA256 comparison -> copied diagnosis exactly matches the immutable ignored original, hash C6A5569C4FE0181A47AB69087B623484E9A20658938FF57995439938C820DECB.
6. Local Markdown link resolution -> 55 links across the four documents resolve. links.json records each target; this is file-target resolution, not a new web/anchor validation.
7. D/H/B/N runtime tests and group F -> NOT RUN, intentionally outside this narrow review. The existing failed baseline still blocks sequential Unit2/Unit3 progression.

Diff scope: PASS. Current changes are the already accepted three-file Unit1 patch plus director-owned planning/evidence documentation. This review created ignored check/evidence/receipt files only. Diagnosis produced no source/harness patch; no generated output, dependency, test, configuration, frozen authority or Git mutation was introduced by this work.
Invariant review: PASS for documentation accuracy and source preservation. The documents accurately preserve Unit1 acceptance, original Unit2 BASELINE-FAIL, separate instrumented diagnostic exit 1, absent current cb/3 and present legacy cb/2, alternate Chatterbox confirming with Piper remaining active, and absence of model/rate-matrix acceptance. Recovery statements correctly distinguish supported preparation from authorization or successful execution. Manifest byte declarations match the current tracked manifest. Auditor-only sandbox mirror observations remain explicitly attributed and are not promoted to host integrity evidence. No broader recovery or installation test was performed. Historical progress entries remain dated history; current status and final-result table clearly record the newer diagnosis and continued block. No architecture/runtime ownership change follows from this read-only diagnosis, so the prior canonical-diagram assessment remains applicable.
Test-integrity review: PASS. Source and harness identities are unchanged, no assertion, timeout or coverage was altered. Original diagnostic and failed-baseline evidence remain immutable and separate. No fresh test pass is claimed.
Privacy/artifact review: PASS. Added documentation records fixed profile states, prerequisite identities and manifest declarations, not book text/audio, secrets, downloaded models or private runtime payloads. Raw diagnostic captures stay ignored. No new process cleanup claim is made here; the diagnostic's zero remaining native/model processes is historical evidence from its host after-capture.
Action required: none for this documentation review, which is PASS. Campaign remains BLOCKED. Current optional-package preparation requires separate authorization within the supported workflow, then a fresh unchanged D/H baseline before Unit2; this receipt does not authorize installation, a source/harness fix, Git mutation, group F PASS or archival.

Review-workflow exemption: docs/development/agentic-change-review.md states that a read-only investigation with no patch needs no change review; nonbehavioral documentation is also exempt. This diagnostic/documentation follow-up introduces no behavioral patch. Existing Unit1 retains its independent refactor-validator acceptance, rather than obtaining an unrelated feature/bug reviewer approval.

Evidence: ignored tmp/evidence/desktop-source-organization/DESKTOP-ORG-CLOSURE-03/{before.json,after.json,outcome.json,links.json,diff-check.log,check.ps1}. Issued report immutable; director may copy it verbatim after this validator is idle.
