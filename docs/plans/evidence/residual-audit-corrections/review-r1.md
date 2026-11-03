# Change Review Report

Review ID: **RAF-R1-20261103**  
Task ID: **residual-audit-corrections**  
Verdict: **CHANGES_REQUESTED**  
Base commit and reviewed HEAD: `031581acf028b73697bfb3e12ffa96828f1553fa`  
Branch: `codex/residual-audit-corrections-plan`

Independent reviewer: `change_reviewer`, GPT-6 Astra high. Read-only review;
no tests, builds, formatters, edits or delegation performed by the reviewer.
This immutable record preserves the returned decision, evidence and finding.

## Reviewed identities

Closed scope: the 79 paths in the ignored
`RAF-R1-20261103-identities.json`, plus 11 unchanged support paths below.
Artifact root: `tmp/evidence/residual-audit-corrections/20261103-01/`.

| Artifact | SHA-256 |
| --- | --- |
| RAF-R1-20261103-identities.json | `6c6909676c2f8d1b8ac8dde5527e54da7358f6444efe620d57b161ccc7861491` |
| RAF-R1-20261103-diff.patch | `29a0ea284f0693d2f861510a86965a2d9b4b5242d1a1a93000582610672e22de` |
| RAF-R1-20261103-new-files.json | `af27ebdd2918896ef738a6c0a442596066194ea5e57095e32d3cb7c1ba79e64a` |
| R1-current-evidence-comparison.json | `a0483a81bc5cee27aa0779db736d066a18271ef6a02cb14b83973f74ba83550e` |

Additional support: `apps/desktop/src/reader/ReaderPublication.tsx`,
`docs/product/mvp.md`, `docs/plans/roadmap.md`, completed M005, and ADRs
0007, 0012, 0016, 0017, 0057, 0059 and 0060. All were `UNCHANGED`, matching
the entries in `G10-pre-review-check-inputs.json` (SHA-256
`aa9c948846bcc1e41dcc63d36ba9adea93cb6128f719df92ec6e5f6a71a879a9`)
and filter-aware blobs at the full base commit above.

**Identity recheck: PASS.** Initial/final SHA-256, filter-aware blobs and statuses
match all supplied paths; all 41 task-owned changed paths are accounted for,
the index is empty, HEAD/branch are unchanged, and the frozen diff equals current
`git diff --binary`. Supplementary paths were rechecked. No approval hashes refreshed.

## Acceptance and supplied host evidence

RAF-01/09/10/18 have bounded public-input capacity/traversal reproductions;
private lookups and totals preserve existing authorities without universal
performance claims. RAF-02/16 cover remount observation and native token binding,
including the production probe/claim helper and zero stale transfers.
RAF-03/05/08 preserve persistence, threshold and continuing-profile responsibilities;
fresh-start hardware gates remain separate. RAF-04 preserves Resume versus Play
after Stop. RAF-06/07/17 cover lifetime, rejected-handle cleanup and current import
feedback. RAF-11 preflights the closed package set. RAF-12/13 preserve mutable
unsupported numeric compounds/source ranges while keeping legacy unchanged.
RAF-14 joins the completion race and verifies cleanup under the existing deadline.
RAF-15 covers published sessions but remains open for the finding below.

The reviewer identified no additional actionable findings in the remaining scope.
No production dependency, external EPUB transfer, generated-audio persistence or
serialized protocol change was added; topology and completed M005 remain intact.

Reviewed implementer-run host results: G2 522 EPUB; G3 602 desktop; G4 supervisor
38/37 (five ignored each), optional 65/65 (two ignored each); G5 96 packaging;
G6 applicable static checks; G7 seven Chromium cases; G8 current integrity/artifact
proof; G9 build/Piper EN; final F08 frozen execution; G10 evidence/diff/cleanup.
Exact commands are in `validation-commands.md`; receipt input digests match.
Nonconsumed cross-component drift is distinguished from refreshed renderer/static
inputs. Complete installed comparison differs only in appended Chromium debug.log.
Artifact-only reuse covers 2,024 files and 26 source inputs. Piper reports zero
external requests/audio files/underruns and 255 ms cancellation. Resource trees
match; no owned processes or new scratch roots remain.

## RAF-R1-F1 — P2: pre-publication startup failure blocks the typed client

Locations: `TtsProcessClient.stopService` at reviewed process-client.ts:600 and
the new start guard at line 323; native `start_selected` at reviewed
tts_service_supervisor.rs:1436 and `shutdown_owned`.

Trigger: after availability succeeds, OS process creation fails. Alternatively,
profile configuration becomes unavailable between checking and starting.
`ServiceSession::spawn(...)?` or `configure_profile_locked(...)?` returns before
publishing a session. The renderer retains startRequestId, but native has neither
that session nor a matching containment receipt. Owned shutdown returns InvalidState;
the client remains non-stopped and refuses another start, causing terminal cleanup
failure even when no child was created.

Evidence: spawn_without_job maps OS failure to ChildUnavailable; start_selected
propagates before publication. The new contained_start_request_id is written only
by fail_session for a published session. Existing RAF-15 regressions cover later
handshake/termination failures. This finding is source-confirmed, not a test run
by the reviewer.

Required correction: preserve exact failed-start ownership while providing a
verifiable completion path for a proven no-child attempt. Do not treat generic
InvalidState as containment or stop a foreign/replacement owner. Add native real
pre-publication spawn-rejection coverage and typed-client/coordinator evidence
that cleanup and explicit retry succeed after the prerequisite is restored.
Retain failed-termination and replacement-safety controls.

Remaining uncertainty: this earlier failure has no supplied regression evidence.
Native observations remain host/run-specific, with no fresh physical listening
or broad GPU/acquisition claim. Correct the finding, rerun affected host checks
and request a new immutable review. M4 and archival remain pending; no Git action
is authorized by this report.
