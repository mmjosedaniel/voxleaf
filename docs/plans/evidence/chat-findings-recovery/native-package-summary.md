# Native and package validation

The original host receipts live under `tmp/evidence/chat-findings-recovery/`.
They preserve the exact PowerShell commands, input hashes, artifacts and
restoration comparisons. No raw process, profile or package-cache inventories
are included here.

## G7 native startup and bilingual Piper

`native-final-chat-g7-a01` passed `pnpm.cmd test:native-startup` and both
preflight and runtime arms of `node apps/desktop/scripts/bilingual-portfolio-host.mjs`.
The Spanish arm used
`--profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es`.
The English arm used
`--profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en`.
Preflight added `--preflight-only` to each arm.

Startup and both Piper matrices exited 0. The exact Spanish and English
arm reports recorded cancellation in 328 ms and 190 ms respectively, zero
external requests, and zero generated audio files. These observations
describe the measured playback path on this host. Physical audibility
was outside these measurements. Original adjacent resources were restored
with matching directory identity and tree metadata.

## G8 local Chatterbox admission

`native-final-chat-g8-a01` ran
`pnpm.cmd test:chatterbox:v7:local-admission`. Its command exited 0 and the
selected Rust test passed in 770.83 seconds. The test verified all nine
local inputs, package admission, installed integrity and owned removal.
The test reports `inference=false`. It supplies no model quality or
ordinary installed acquisition result.

The outer wrapper exited 1 after finding Node compile-cache residue in its
owned scratch. The original failure receipt remains intact. The separate
`recover-g8-a01.ps1` run exited 0. It verified the 11-row scratch inventory,
retained it intact in private local evidence, confirmed the original scratch
path was absent and matched the preflight host state.

## G9 unsigned Windows package

`g9-final-build-chat-a01` ran `pnpm.cmd package:windows:verified-core` and
exited 0. The installer and application signatures both reported
`NotSigned`. Installer SHA-256
`6c05de4f0930af420d6801033e329c36d1017e808c52b22ecbb58a8e32e0a1dc`.
Application executable SHA-256
`c2d5856fdefa0d05a8308359d2cb59cdf3f696b1bbd43a5d9328fbaf0adb88d6`.
The original tracked package evidence was restored.

`g9-final-lifecycle-chat-a01` ran
`pnpm.cmd package:windows:lifecycle -Installer <current installer> -LifecycleReceipt <current run receipt>`.
The command receipt provides the resolved paths. All six lifecycle cases
passed. The wrapper restored the host and bound the lifecycle receipt to
the same installer and application hashes through `windows-release.mjs evidence`.
`g9-final-check-chat-a01` ran `pnpm.cmd package:windows:check`, exited 0 and
confirmed current package inputs and host restoration.

After those checks, `restore-g9-adjacent.ps1` verified and restored the
original adjacent resource directory and verified that the temporary hold
was absent. The newly built resource directory was retained intact in
ignored evidence. The current build provides unsigned local lifecycle
evidence. Authenticode signing, Defender scanning and a new exact ordinary
Chatterbox journey were outside this host run. G4 exercised the attachment
contract with controlled input combinations.
