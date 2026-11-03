# Change Review Report

Review ID: **RCF-R1-20261103**

Task ID: **RCF**

Verdict: **CHANGES_REQUESTED**

Base commit and reviewed HEAD: `887c5898d0712cf4053e845bbf286e8dadd3cf80`

Branch: `codex/revalidated-chat-findings-plan`

Independent reviewer: `change_reviewer` (GPT-6 Astra high), read-only; no tests
executed by the reviewer. This immutable report records the reviewer's findings
and assessment. It does not approve subsequent corrections.

## Reviewed identities

The closed 56-path manifest and complete patch artifacts are under
`tmp/evidence/revalidated-chat-findings/20261103-01/`:

| Artifact | SHA-256 |
| --- | --- |
| R1-envelope.json | 4CEEC0F3775BC2F584F05F9EEFCC5ADA3357E8ECD1E24D1FD7616857CA9234E3 |
| R1-reviewed-identities.json | A53E55FD34812F85C606E10805E5F0000D8BD0F68E3E779930EB311692CD3D3E |
| R1-all-source-identities.json | 997C6F945CC8D7C059276EF2E49A65CCDE3F3511038EA3C1CFF633B12F2165B6 |
| R1-tracked.patch | 4FF3D4D0E6AF793B0B274F35EE18E61670CAAF06ED68FA514C56403A2D910F7D |
| R1-new-files.json | AFF914326AB9B46EF56CE667E1484DF64849EE37E94DA57BA1D583DD9D44510E |
| R1-evidence-equivalence.json | 684A94D64518B2EF68C6C72B265C7A86582D5CB19BF8BCD0DA4D9A7ED39F775D |

The report itself is excluded from its manifest. Identity recheck: **PASS**.
Initial/final inspections matched HEAD, all 56 changed-file SHA-256/filter-aware
blob identities and expanded porcelain path/status set. Index empty. All 1,529
source entries matched on both independent comparisons. Final comparison:
`2026-11-03T18:27:23.3897054Z`.

## Acceptance and evidence assessment

Reviewed RCF-01–22 and variants against the ExecPlan and ADR-0070, including
delegated policies 03/06/17/08, production changes, callers, assertions,
persistence ownership and supplied host evidence. No additional confirmed
actionable findings emerged beyond F1. Topology, local EPUB/TTS boundaries and
default ephemeral audio ownership remain unchanged.

G1 static/export checks pass. G2: 516 EPUB; G3: 625 desktop; G4: 165/164 native
with eight ignored in each; G5: 126 Python with disclosed existing cache warning.
G6 retained nine passing journeys plus the corrected isolated list-anchor test;
450→451 agrees with the list's structural anchor and does not weaken placement.
G7 is inapplicable; the Rust admission-only entry preserves the inference entry.
G8 current build/core and six-rate Piper pass, with zero external requests/audio
files, 347 ms cancellation and closed contexts; restoration evidence supplied.
G9 passes in 712.87 seconds without inference; hashes/environment/cleanup verified.
G10 receipts supplied and current identities independently checked.

These are implementer-supplied PowerShell results outside sandbox. The equivalence
record reports no drift in eight runtime closures; two installed exclusions are
identified diagnostic/derived outputs. Results support R1 inputs but cannot
override F1 or approve a future correction. Exact commands and timestamps are in
[the command register](validation-commands.md) and immutable raw receipts.

## F1 — P2, confirmed

**A shared failed speed preparation is incorrectly discarded after another
slower selection.**

Owner: `apps/desktop/src/tts/pcm-playback.ts`,
`AdaptivePcmPlayer.#preparePlaybackRate`, R1 lines 772 and 815; contrary regression
assertion in `pcm-playback.test.ts`, R1 lines 1085–1111.

While unit A plays at 100%, select 85%, then 75% before preparation settles.
The second selection increments `#rateSelectionRevision`, but the preparation
method returns early because the first promise remains pending. Both choices
depend on that attempt; repeated slower selection has the same problem.
On rejection, revision mismatch releases preparation instead of falling back.
Selected/stored slower rate remains, without fallback count, explanation or
100% persistence. The next boundary can initiate another preparation instead.

The early return proves no replacement attempt exists. Nevertheless the catch
treats every selection revision as supersession. The test explicitly expects
the slower selection and fallback zero, contrary to RCF-19's shared-attempt rule.

Required correction: track whether the latest selection still depends on the
failed preparation. Shared repeated/slower selections must fall back once to
100%, retain current audio, expose the explanation and persist through the
preference owner with independent save-failure reporting. A superseding 100%
choice, replaced session, Stop or independent attempt remains authoritative.
Replace the contrary assertions; verify next-unit rate and coordinator status/save.

Supporting unchanged sources were independently checked against HEAD and the
bound full-source manifest: AGENTS, review/identity policy, docs index,
architecture overview/diagram, roadmap, M005, ADRs 0007/0012/0017/0039/0040/0057,
App, playback-preference repository, both position-save owners, narration source
projector, locator index and native main. Their SHA-256 identities are preserved
in the bound manifest; unchanged filter-aware blobs matched HEAD.

Remaining uncertainty: corrected behavior not yet implemented/validated at R1;
host measurements do not establish listening quality or general performance.
Required next action: correct F1, renew affected host gates and request a new
immutable review with fresh identities. Preserve R1 unchanged.

This is not a refactor Validation Report and grants no Git/delivery permission.
