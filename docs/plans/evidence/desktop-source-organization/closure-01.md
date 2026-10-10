# Validation Report

Report ID: DESKTOP-ORG-CLOSURE-01

Target ID: desktop-source-organization

Mode: FINAL

Verdict: BLOCKED

Environment: local PowerShell outside sandbox. This is a bounded current-state/documentation closure review only, not group F execution or final campaign acceptance. Read-only host inspections used require_escalated; only ignored receipt/helper files were written. No source, tests, documentation, configuration, Git, installed runtime or firewall mutation. Prior runtime reports remain immutable.

Starting HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5

Ending HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5

Validated paths: the closed 33-path list in the identity manifest below, covering every changed source/document, untouched PCM/CSS targets including planned absent additions, retained WSOLA/authority files and canonical diagram. ABSENT denotes still-unimplemented planned paths; it is not a deletion. This receipt does not approve those absent additions or unimplemented units.

Validated path identities:

| Exact path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob ID |
| --- | --- | --- | --- |
| apps/desktop/src/reader/semantic-document-render-plan.ts | `?? apps/desktop/src/reader/semantic-document-render-plan.ts` | 51E91A57D9ED9C6B9734434F8489AD150DE0E6D22DAE8888A3036263E1A247CB | f7083cd49d14c17eaeefd898ed230da223042616 |
| apps/desktop/src/reader/SemanticDocument.test.tsx | ` M apps/desktop/src/reader/SemanticDocument.test.tsx` | C37C3437C433F8E73DEA95C36373D2C7A8842746D0A0FFD82B5C5555B06981A3 | 26ba73dc3fb43d41f345ae852131ae2846e1d1ef |
| apps/desktop/src/reader/SemanticDocument.tsx | ` M apps/desktop/src/reader/SemanticDocument.tsx` | 6559C258CE1A2247897DCB131D6D5D4A5B79AED6F0CE8F94D6700189151FE8E2 | 2461f6208cc6e1b082b1c7977143f37903d2e041 |
| apps/desktop/src/styles.css | `""` | FF3DEC8E9000AC8C547A37ED77AEFCDAD6C1B33705E94CC322B5FC726783D823 | b616c73157a4a490bbf038ab4a613690432fbd29 |
| apps/desktop/src/styles/accessibility-and-responsive.css | `""` | ABSENT | ABSENT |
| apps/desktop/src/styles/narration-and-publication-states.css | `""` | ABSENT | ABSENT |
| apps/desktop/src/styles/reader-shell-and-settings.css | `""` | ABSENT | ABSENT |
| apps/desktop/src/styles/reader.css | `""` | ABSENT | ABSENT |
| apps/desktop/src/styles/shell-and-publication.css | `""` | ABSENT | ABSENT |
| apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx | `""` | F96F90D241B9D188CDAFDF6CF09D49DE9FF07BB0288F0A532360CD16EFFEB2C5 | 0fff933a6d14d3071c981b1857c5f7e940d41b2e |
| apps/desktop/src/tts/pcm-playback-contracts.ts | `""` | ABSENT | ABSENT |
| apps/desktop/src/tts/pcm-playback.ts | `""` | 2731139D1F6BB7C0BA936BEC426710ADC03CFFAD7A3A35381AC70FBC31F2C1BD | bcbea041a9a5bfdf0d5acf47927c6b91f2b496db |
| apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.ts | `""` | B5DAF75AF097A46F9202A409AD001F4D6B5BA306C1872AAF7E4638B8D3CB7A0D | 771e2ac7bb982a3a0722cf0c85a71a26f31329ce |
| apps/desktop/src/tts/playback-backends/incremental-wsola-v3.ts | `""` | 2D77C0B4A348F7AD94250A0F97233C2A97E3AA2AA4954C3080687D11D3BCECE7 | cb6719c792f2563e10d0e3c8340e8d15e8bdcb0e |
| apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts | `""` | ABSENT | ABSENT |
| apps/desktop/src/tts/reader-settings-playback-authority-v3.ts | `""` | 199882997B0B5CCE4B0E2A184E4F26DD5411DDC76F5D5E230DB4C3DAE8C7A91A | 9ab37c996809ee76070bbf0e6fafb0f0129c0aff |
| apps/desktop/src/tts/reader-settings-playback-result-v3.test.ts | `""` | AB70DA22D44FA2934D870138D1E2257EBE9DC4FBD859AB355E81C024EEB3FFB2 | f29a477c41da19868b7d666590bd20e5cc6c657c |
| docs/architecture/system-diagram.md | `""` | D0CFC70091076429AFB81FC8FF7DF0D1B2837D25C3948DACDDC7D2CE27972ED6 | edc5ab6a2932b193471a45f9471e79f8d72f2b7d |
| docs/plans/active/desktop-source-organization.md | ` M docs/plans/active/desktop-source-organization.md` | 1E0AAA66770019BBB8F2B7C96DAABA75266715B29895A120C4DFF5E3300E5ABC | f6288a46d2a14637203ede402ecaf3372415adb1 |
| docs/plans/active/README.md | ` M docs/plans/active/README.md` | A3BC774DA578E90F3552EC2071ED3D8BE13850AC7A5FD8EF3D410A46ACDB9821 | 765fa8321e2716dc9c237a2d066c71c4e354c682 |
| docs/plans/evidence/desktop-source-organization/driver-diagnosis-01.md | `?? docs/plans/evidence/desktop-source-organization/driver-diagnosis-01.md` | 6491414CEFDD6E737F511B73E74827D1D25CB362EAA2B952512F5A2CCEF4EA07 | 86413d255e0bb655cf710f31235f24af6168522f |
| docs/plans/evidence/desktop-source-organization/PCM-audit-01.md | `?? docs/plans/evidence/desktop-source-organization/PCM-audit-01.md` | 46ED1E01B1BE004E7225AB7752F843A53EC90C8052A3EE9D26418AB5FBF67A7A | 4ba2806e3ce040a8c250bc4f659ebd81516cdd3b |
| docs/plans/evidence/desktop-source-organization/PCM-baseline-01.md | `?? docs/plans/evidence/desktop-source-organization/PCM-baseline-01.md` | B46C82606DEBF32328AC9C3ECC0BA940D38138696F733F3A1D88B2CBA5D2B85A | 7727cc49f0194de2708dd5a171690ea40af238cb |
| docs/plans/evidence/desktop-source-organization/PCM-draft-01.md | `?? docs/plans/evidence/desktop-source-organization/PCM-draft-01.md` | DB5051E615C73ED6BCCF21A961F0331692B7B8DA888E19CC1E25BB7CBC7102B1 | 6694a3f89edf52713ccd09650b533484f645dcab |
| docs/plans/evidence/desktop-source-organization/README.md | `?? docs/plans/evidence/desktop-source-organization/README.md` | 5C684EFBFF286D7DE6D5EBDD1BB8AAA259DC022E1FE04A8F90E2CE1C3E351AE4 | af10ac58d35d8bd24856706d44c5a6fe266a6df3 |
| docs/plans/evidence/desktop-source-organization/SEMANTIC-audit-01.md | `?? docs/plans/evidence/desktop-source-organization/SEMANTIC-audit-01.md` | D8328651BDE33B71E79C1F9AE52BEE20DAB91A83CC49D63A4C37A5ABFD920351 | 18014aeba78137a59a2beeb1c51a7f682c11f5f7 |
| docs/plans/evidence/desktop-source-organization/SEMANTIC-baseline-01.md | `?? docs/plans/evidence/desktop-source-organization/SEMANTIC-baseline-01.md` | EAD5E4222DBBCF91358CB0AE1551846BFBE7BA2F520FDE553F143CB06C14A5E6 | aeec488d19146e3519b23da172cfc3da924126b9 |
| docs/plans/evidence/desktop-source-organization/SEMANTIC-change-01.md | `?? docs/plans/evidence/desktop-source-organization/SEMANTIC-change-01.md` | 005E7766CD614A6DF687E51A7FC2A14CE2BD1741F5DF0DFDB26DBA2C10949FA1 | 6bcd5f5ddc0d0d8f3639bf291d375bc614dbdb7b |
| docs/plans/evidence/desktop-source-organization/SEMANTIC-draft-01.md | `?? docs/plans/evidence/desktop-source-organization/SEMANTIC-draft-01.md` | 461B30C76F2FD7658490330BF2AAF983348E2D86F52223AFA7FC291126597959 | db832aa95074c8482b473c9936a21cf10f0e744d |
| docs/plans/evidence/desktop-source-organization/SEMANTIC-order-01.md | `?? docs/plans/evidence/desktop-source-organization/SEMANTIC-order-01.md` | 79132856D62F8949AD5392D7C1AAD636F0B9B27546DB3FC3E44F68BF003D2F15 | 693c78aa693b7df1840fd53e2d533addb4272584 |
| docs/plans/evidence/desktop-source-organization/SEMANTIC-post-change-01.md | `?? docs/plans/evidence/desktop-source-organization/SEMANTIC-post-change-01.md` | F24365EDC2D80833932E38A0F3C7020051BB37198A4370195DE12CE64519E722 | 62aaa881af043837d7bc329d6f2e010ae85f314d |
| docs/plans/evidence/desktop-source-organization/SEMANTIC-post-change-02.md | `?? docs/plans/evidence/desktop-source-organization/SEMANTIC-post-change-02.md` | B64C9CF47727FC23A33AC6179A1E695CDF87D3F33D46799DC6BCE631BD5AC05B | 6eedd237298d39d071e1c1c64ac2b2697bfbb804 |
| docs/README.md | ` M docs/README.md` | 56ED1D4E456A5738C33882DE3207B950A49DB38BC802B4188E74398C75E75C2B | 8bd4bb3f465f4fb2927482c5a19e32cdba37738c |

Identity recheck: PASS. All 33 exact path statuses/hashes/blob IDs/absences, complete global porcelain listing, branch and HEAD matched before/after. Index was empty both times. Branch remains codex/desktop-source-organization. Source identities for all three accepted Unit 1 files match immutable DESKTOP-SEMANTIC-DOCUMENT-01-POST-CHANGE-02 exactly. PCM primary matches its failed baseline; new PCM files remain absent. styles.css and its accessibility test are unchanged; all five proposed CSS leaves remain absent. The missing styles directory produces harmless read-only Git warnings; absent paths were never hashed. Evidence is in before.json and after.json beside this report. Identities use git status --porcelain=v1 --untracked-files=all, Get-FileHash -Algorithm SHA256, and filter-aware git hash-object --path.

Commands and outcomes:
1. `& ./tmp/evidence/desktop-source-organization/DESKTOP-ORG-CLOSURE-01/closure-check.ps1` -> exit 0. Read-only inspection confirmed accepted Unit 1 identities, resolved 301 local Markdown link targets with zero missing paths, and matched the issued versus saved text of SEMANTIC-post-change-01, SEMANTIC-post-change-02 and PCM-baseline-01 (CRLF/LF normalization only). Safe process inventory exposed no command lines: zero voxleaf-desktop/tauri-driver/msedgedriver processes and zero processes at the three exact configured model interpreter paths. These counts are an observation, not historical model-arm cleanup acceptance. Raw closure-check.json and helper retained ignored.
2. `git diff --check` -> exit 0 outside sandbox, embedded in the closure helper; raw diff-check.log retained ignored.
3. `git diff --cached --quiet` -> exit 0 before and after. `git branch --show-current` and `git rev-parse HEAD` confirm the branch/full HEAD above.
4. `pnpm.cmd check:portable` and `pnpm.cmd check` -> NOT RUN. Group F is gated by sequential Unit 2 model-backed baseline acceptance; Unit 2 remains BASELINE-FAIL and Unit 3 is unimplemented. No runtime tests repeated because accepted source evidence did not drift. This bounded review is not a substitute for F.

Diff scope: PASS. Complete tracked/untracked inspection contains only the exact accepted three-file Unit 1 patch (501 added/deleted source lines) and 15 director-owned Markdown files covering the active plan, indexes and concise immutable receipts. No Unit 2/CSS edit, generated/frozen authority, completed-plan/historical edit, dependency/configuration/lockfile change or extra source file. Index remains empty; no Git mutation occurred.

Invariant review: FAIL for one documentation-accuracy issue; reviewed source/architecture invariants remain unchanged. docs/plans/active/desktop-source-organization.md:272-273 still says “No acceptance evidence exists yet; do not create placeholder PASS receipts.” The first clause is stale and contradicts the accepted Unit 1 evidence. Other inspected current status summaries correctly state one accepted unit, PCM baseline failure before implementation, no completed model arm or Piper rate matrix, CSS pending, group F unrun and plan active/unarchived. The canonical diagram still matches: pure planning stays inside the existing desktop semantic React-reader owner; no process, package, trust, persistence, resource owner or narration-flow boundary changes. The existing playback/WSOLA and authority paths are unchanged. The prior H failure remains a baseline result, not a refactor regression or diagnosed root cause. Runtime invariants rely only on their exact earlier unit reports; no new model-backed/performance claim follows from this receipt.

Test-integrity review: PASS. The only test modification remains the accepted additive Unit 1 nested rendering regression; its accepted identity is unchanged. No timeout/assertion/snapshot/harness change. Saved accepted/failed reports retain their issued text; the initial baseline receipt is correctly described as validator-reported, without retrospective raw-log claims.

Privacy/artifact review: PASS. No book, audio, model weight, secret, private content or raw capture entered tracked/untracked publication scope. Changed evidence is concise Markdown; raw logs/helpers/snapshots remain ignored. Frozen WSOLA/controller/worklet/authority and completed plans remain untouched. No remaining matching task runtime processes were observed; no process was terminated by this review.

Action required: Director should remove only the stale “No acceptance evidence exists yet” clause while retaining the no-placeholder-PASS rule, then obtain a fresh bounded document/current-state receipt because that document identity changes. Keep this report immutable. Unit 2 remains blocked separately: diagnose its Piper Spanish profile-selection timeout under an authorized bounded scope and obtain fresh D/H baseline before implementation. Do not proceed to Unit 3 or label the campaign complete; group F remains NOT RUN. No staging, commit, push or PR is authorized.
