# Validation Report
Report ID: DESKTOP-PCM-01-BASELINE-02
Target ID: DESKTOP-PCM-01
Mode: BASELINE
Verdict: BLOCKED
Environment: local PowerShell outside sandbox. Authorized fresh baseline preparation after normal-flow Chatterbox v3 installation. All host inspections used require_escalated. NODE_OPTIONS explicitly unset; no diagnostic instrumentation or model command was launched. No installation, removal, firewall, persistent-environment, source/harness, documentation or Git mutation by validator.
Starting HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Ending HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Validated paths: exact three-source-path draft allowlist below.
Validated path identities:

| Path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| apps/desktop/src/tts/pcm-playback.ts | `""` | 2731139D1F6BB7C0BA936BEC426710ADC03CFFAD7A3A35381AC70FBC31F2C1BD | bcbea041a9a5bfdf0d5acf47927c6b91f2b496db |
| apps/desktop/src/tts/pcm-playback-contracts.ts | `""` | ABSENT | ABSENT |
| apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts | `""` | ABSENT | ABSENT |

Identity recheck: PASS. Before/after full HEAD, branch codex/desktop-source-organization, all three path identities, 15 supplemental preserved source/harness hashes from PIPER-ES-PROFILE-DIAG-01, installation manifest/interpreter hashes, packaged executable hash, complete porcelain listing, and empty index unchanged. Existing PCM path clean and proposed additions ABSENT. Accepted Unit1 source remains unchanged and unstaged; CSS/harness unchanged. Full evidence in before.json and after.json.

Installation identity: LocalAppData/com.voxleaf.desktop/tts/cb/3, current runtime manifest schemaVersion 2, packageVersion 3, pythonPath runtime/python.exe, modelRoot models. The manifest-selected interpreter exists. Hashes below bind the observed manifests and interpreter, not a newly executed full package/model integrity verification:

- runtime-manifest-v3.json: `470EC7E8A6FA1E91F9831E42DE7988249220B51D4ECD4352452F3C70B2B6084A`.
- source-manifest-v3.json: `F1EAE833B75625F290A94F06ABCB2CD70A39FFE23603D9FEC523999B8F0EB6D6`.
- runtime/python.exe: `4D6F5F81A4BCA11191C4C7C6B43632694D0A4CE74E068619D8FDC161D469859A`.

Packaged executable apps/desktop/src-tauri/target/release/voxleaf-desktop.exe SHA-256: 8343E0121E8D72D4E4A252D6F00DBAC24D2C4087C4B5E8ED33A98A338956F234. No build was performed in this attempt.

Commands and outcomes:
1. Read CHATTERBOX-preparation-01.md, PCM-audit-refresh-02.md, unchanged PCM draft/prior audit context, validation matrix and effective supervisor/installed-runtime source -> current installation satisfies previous absence diagnosis, but packaged Chatterbox now prefers installed runtime over developer fallback. Installed runtime's outbound isolation must be checked independently.
2. Host read-only Get-NetFirewallRule filtered Enabled=True, Direction=Outbound, Action=Block, piped through Get-NetFirewallApplicationFilter and normalized exact case-insensitive comparison against current installed runtime/python.exe -> zero matching rules. All rule display names were searched. This is the missing prerequisite; the developer-interpreter rule cannot establish isolation for this executable. Proof: firewall.json.
3. & ./tmp/evidence/desktop-source-organization/DESKTOP-PCM-01-BASELINE-02/check-prerequisites.ps1 -> exit 0, captured exact identities and repeated the missing-rule proof; no commands executed by the interpreter. It explicitly removed process-local NODE_OPTIONS before capture.
4. git diff --check -> exit 0, no whitespace findings.
5. git diff --cached --quiet -> exit 0 before and after.
6. pnpm.cmd build:packages -> NOT RUN, baseline stopped at mandatory host prerequisite.
7. pnpm.cmd --filter @voxleaf/desktop typecheck -> NOT RUN.
8. pnpm.cmd --filter @voxleaf/desktop test -> NOT RUN.
9. pnpm.cmd format:check:typescript -> NOT RUN.
10. pnpm.cmd lint:typescript -> NOT RUN.
11. pnpm.cmd --filter @voxleaf/desktop build -> NOT RUN.
12. pnpm.cmd test:tts:bilingual-portfolio-exact-host -> NOT RUN; no global command exit exists for this attempt. It would be false to classify this prerequisite stop as an H test failure or model rejection.

Arm outcomes: all six arms UNRUN in this attempt (Piper Spanish, Piper English, Chatterbox Spanish, Chatterbox English, Qwen Spanish, Qwen English); both Piper six-rate matrices NOT RUN. Neither ADR-0051 scoped PASS nor complete-command PASS is available. Prior BASELINE-01 remains its separate actual failed execution; this report does not replace it.

Diff scope: PASS. Unit2 remains unimplemented, closed allowlist unchanged/absent as required. Previously accepted Unit1 and director-owned Markdown remain untouched. Only ignored prerequisite evidence/report files were written.
Invariant review: PASS for source preservation and prerequisite review; runtime evidence absent. Current package presence is not proof of installed-child network isolation or successful narration. No fresh PCM/model behavior claim. No attempt to substitute HF offline variables or developer-interpreter rules for the missing installed-interpreter block.
Test-integrity review: PASS. Original scripts, assertions, timeouts and exact commands unchanged; no model run, retry or narrowed acceptance substitute. Existing frozen authority paths remain outside edit scope.
Privacy/artifact review: PASS. Inspection uses fixed interpreter-relative identities and hashes, no book contents, audio, secrets or private process command lines. Installed files were read only. Model files were not copied or downloaded. Evidence remains ignored under this report directory; no firewall mutation.
Action required: obtain separate authorization and establish the exact installed interpreter's required outbound block, preserving all existing rules. User permission was still pending at report issue; this receipt grants none. Then issue a new report and run all six D checks plus unchanged complete H command uninstrumented with fresh source/installation/environment identities. Do not revise this immutable BLOCKED receipt or issue a PCM work order from it. No source/harness correction is indicated by this prerequisite finding.

Evidence directory: tmp/evidence/desktop-source-organization/DESKTOP-PCM-01-BASELINE-02/ (before.json, after.json, firewall.json, outcome.json, diff-check.log, check-prerequisites.ps1). The director may copy this immutable report after validator is idle.
