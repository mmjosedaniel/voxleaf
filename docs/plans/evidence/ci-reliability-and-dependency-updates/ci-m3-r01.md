# Change Review Report

**Review ID** CI-M3-R01  
**Task ID** CI reliability M3 rollout patch · VF-0175, VF-0176, VF-0184  
**Verdict** APPROVE  
**Base** `28e157cd2dc08ab974cf3478ea730e8cef801661`  
**Reviewed HEAD** `79789ae2109575277677963deedcde385953dbae`

**Reviewed identities and recheck** PASS. In `tmp/ci-next`, the complete 10-path `tmp/evidence/ci-implementation/m3b.json` manifest, SHA-256 `5dc7fc1039a261155efdb2906346daff6f3d7bb33e685e55c8a71c608c71139a`, matched before and after review. The four-path diff, worktree SHA-256s, filtered blobs, statuses and commit identities matched. Additional clean, unchanged inputs were `services/tts/release/profiles/chatterbox-v7/requirements.in` (`29f39102e55bec0846ffb2fc19dda087f7f2e741`, SHA-256 `07e959840737bfb380ffa5f438b98e0af05fe21fb73a8c1bcf4f73781b30aebe`), its `requirements.lock` (`a07d116db7e4f27713972f4a00e140560ef19041`, `f9f3f707ae6ccb5d4a93919fad4265be70ed69dc2d93064f2384ba4f78565aed`), `services/tts/release/core/pyproject.toml` (`f9977b2f3f4b27ab23ba49e84c2cc5dbe47533fd`, `b33857ad4bfb4932548e03af650b9076e3d8d04ca101fc6eaa01b33c06580107`) and `services/tts/pyproject.toml` (`45ad2716bb5cbc50662b0f05e22b734fce0542b0`, `f65ca556bd98ac9183c6ce95b05de1873689f22058820f1ff0b16d59fedf3c64`).

**Acceptance review** The weekly and manually dispatched Windows workflow selects only registry pins from the reviewed v7 input, preserves the exact CUDA/source URLs, applies a seven-day cutoff, produces a scratch requirements file and hash lock, then checks the Windows/Python 3.12 installation plan. Its token is read-only. The patch changes no product or release authority. Both base/core entries select uv in the correct directory. The npm ignore targets TypeScript 7.x and keeps the development group. Core local-source and cutoff settings are intact.

**Test evidence reviewed** The coordinator supplied successful local positive and no-update controls, plus rejection of a real Linux-only CPython wheel by the Windows dry-run after compile accepted it. The host `uv lock --project services/tts --upgrade-package ruff` produced a changed lock, followed by successful locked sync/export. Core locked sync/export passed. A copy with #324’s ONNX pin failed its date cutoff and preserved the lock hash. GitHub shows the candidate job succeeded on this HEAD. It retained artifact `15060969569` with SHA-256 `81f134ba5cf79102d315bdecf1037f2b8a4829bb15ef9f0105b34a142909d088` through December 2. The coordinator reported 79 planned installations including the two CUDA wheels and proposed certifi/msgpack changes. [Candidate job](https://github.com/mmjosedaniel/voxleaf/actions/runs/45698537795/job/139502230946)

**Findings** None for this rollout patch.

**Remaining uncertainty** Actual default-branch Dependabot proposals require rollout. The eligible npm group’s lint/Chromium result, refreshed #328/#330/#331, and the dispositions of #324/#329 remain open. Independent foundation/release jobs on #335 were still running at review. The four previously passing v7 authority checks are historical coordinator evidence; candidate discovery demonstrates install planning, not successor admission.

**Required next action** None for this code review. Record the remaining hosted checks and post-rollout updater observations before closing M3.
