# Change Review Report

Review ID: **RCF-R2-20261103**

Task ID: **RCF**. Verdict: **CHANGES_REQUESTED**.

Base/HEAD: `887c5898d0712cf4053e845bbf286e8dadd3cf80`.
Branch: `codex/revalidated-chat-findings-plan`.
Independent reviewer: `change_reviewer`, GPT-6 Astra high, read-only.
The reviewer executed no tests. This immutable report records its assessment.

## Identities and acceptance

Closed 57-path manifest under `tmp/evidence/revalidated-chat-findings/20261103-01/`:

| Artifact | SHA-256 |
| --- | --- |
| R2-envelope.json | 9A20328B52369C9170EB2C13CE1593A2A08BDF57955A61B4DF5E378F5D79FECA |
| R2-reviewed-identities.json | EF909529DD308BA116270061F70BD897336E1E9753AA512EE2B30888C3B7F31C |
| R2-all-source-identities.json | 0FB0FB04D472A3AE84A2DF49C3EDCAF8CFB0960C46B0C9D2E133C1B33639328D |
| R2-tracked.patch | 6B7BABD34F95DBAD316DAB49F1655809EC186B61AC1814F077C5E690DD55BF8F |
| R2-new-files.json | 761B0D1F929430A2273B06B2D88AFB0A432B599E6582A13FBAF77547D22B5FAA |
| R2-evidence-equivalence.json | 8B0B455E1EAB448518B2DB1D1ADA746F4EBFF5B5DE36E85CBF106EAFFF750E9A |

Identity recheck **PASS**: HEAD, 57 changed-file SHA-256/filter-aware blobs,
complete porcelain status and all 1,530 source entries matched initial/final
comparisons; index empty. Final check `2026-11-03T18:38:20.7685107Z`.
Report excluded from its own manifest.

R1-F1 is resolved at the player boundary. Corrected shared-selection tests cover
playing, paused and successor-waiting states without duplicate completion or
preparation. Full R1 scope was reconciled against R2 identities and actual delta.
The remaining production-backend replacement case prevents RCF-19 acceptance.

Supplied host results outside sandbox: R2 focused nine PASS; static PASS;
629 desktop / 18 suites PASS; ten Chromium PASS; fresh build/six-speed Piper
PASS on binary `2150697b820cfea19900d2ef27f32c6d4c50a87efe58ecfc239b783ba6245d94`.
Native output reports zero external requests/audio files, six closed contexts,
restored resources and no new owned roots/processes. Unchanged closures support
516 EPUB, 165/164 native (eight ignored each), 126 Python and exact local
admission without inference. G10 and supplied equivalence pass, with the two
explained derived installed-file exclusions. Commands/intervals remain in the
[register](validation-commands.md) and bound receipts. These passing results do
not cover F2's production-backend sequence.

## F2 — P2, confirmed

**A released backend preparation can be adopted by a later rate request.**

Owner: `WebAudioPcmPlaybackBackend.preparePlaybackRate()` R2 lines 64–65 and
`releasePlaybackRatePreparation()` lines 104–111 in
`apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts`, interacting
with the player. The new manual-backend "independent" test misses this behavior.

During healthy 100% audio, select 85→100→75 while the first WSOLA creation is
pending, then reject it. Selecting 100 invalidates both tokens, but the backend
retains its preparation promise. The 75 request creates a new player attempt
while the backend returns the retired promise. Its rejection reaches the new
player token and falls back, overwriting/persisting 100 for the later choice
without making a fresh attempt. This contradicts released/replaced ownership.
The manual backend immediately succeeds on its second call, so its control does
not reproduce real backend coalescing. The retained promise clears only in its
eventual finally.

Required correction: prevent a post-release request from adopting retired
success/failure. Preserve bounded preparation/stretcher ownership and close/join
cleanup. Test the real WebAudio backend with deferred creation: 85→100→75,
old rejection and old success, subsequent successful preparation, current audio
preserved, no obsolete fallback and no leaked node/cleanup owner. Keep shared
failure controls.

Additional unchanged supporting source: `incremental-wsola-v3.ts`, SHA-256
`7207D053E3ED94E45ACD4149D10905FB931C5312C5D3F433193A62A92C48F6E8`,
filter-aware/HEAD blob `439d24928039cca4464ce5a140f6df1c04ebe6c7`.
Earlier unchanged requirements/callers remain identical in the bound manifest.

No additional confirmed actionable findings emerged. F2 implementation and host
verification remain outstanding at R2. Resolve it, renew affected evidence and
request a new immutable review. Preserve R1/R2. No Git/delivery permission granted.
