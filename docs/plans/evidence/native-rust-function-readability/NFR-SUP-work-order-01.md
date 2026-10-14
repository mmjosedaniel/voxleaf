# APPROVED WORK ORDER

Target ID: NFR-SUP. Risk: medium.
Goal: name expected-state receipt and common development path resolution.
Closed allowlist, relative to `apps/desktop/src-tauri/src/`:
`tts_service_supervisor.rs` and `tts_service_supervisor/tests.rs`.
Ceiling: 320 added plus removed lines across exactly these two files.

Baseline: [NFR-SUP-BASELINE-20261013-03](NFR-SUP-baseline-03.md), PASS at
`d5ad0427dc58d71bdb678df17454d9412c8488c8`, pristine SUP paths and empty index;
director recheck agrees with its exact SHA/blob identities. Accepted DIAG and
director documentation are separate existing changes to preserve.

## Required implementation

1. Add private `TtsServiceSupervisor::receive_expected_state(&self, session: &ServiceSession, timeout: Duration, expected_state: &str) -> Result<Value, TtsNativeFailure>`.
   Call existing `receive_control(session, timeout, "state")`, compare state,
   preserve `ProtocolRejected`, return the original value. Replace precisely
   nine existing checks, preserving each timeout/expected-state pair.
2. Add private `development_service_paths(&Path) -> Result<(PathBuf, PathBuf), TtsNativeFailure>` under existing non-release cfg. Move only the shared source
   canonicalization, site-packages canonicalization and jsonschema/referencing
   checks, in that order. Replace the three constructor blocks with named tuple
   destructuring in their original positions; preserve `ChildUnavailable`.
3. Add process-free private channel fixtures in existing tests, capacity one,
   no child/input process handles, using existing state-control/frame builders.
   Matching expected state returns the exact Value and updates lifecycle;
   valid unexpected warming returns ProtocolRejected after updating lifecycle;
   wrong valid service identity rejects without changing seeded lifecycle.
   Empty retained-sender channel with Duration::ZERO times out; disconnected
   channel yields ChildUnavailable. No sleeps or production accessors.
4. Add cfg-matched disposable directory fixtures: successful tuple in original
   order, missing source/site-packages/jsonschema/referencing all fail with
   ChildUnavailable. No global environment mutation or new source-is-directory
   condition. Reuse local fixture conventions without new dependencies.

## Invariants and exclusions

Receive/control identity validation precedes lifecycle update; lifecycle update
precedes expected-state rejection. Health remains unrestricted. Preserve all
operation/guard scopes, fail-session/cleanup ownership, record order and timing,
cancellation, errors and memory bounds. Preserve each constructor's enable,
root discovery, interpreter equality, lock, profile/language, model-root and
fallback ordering; Piper and Chatterbox retain different fallback policies.

No public API, module, trait, generic builder, dependency, protocol, cfg change,
timeout, buffer, metric, fake-child, Windows fixture, installed model, manifest,
authority, environment-global or user-data change. No documentation edits by
worker and no Git mutation. You are not alone: preserve every other edit.

Worker runs no acceptance commands. Return a Change Packet with exact symbols,
test cases, invariant mapping, numstat and deviations. Stop if ceiling cannot be
met without weakening coverage. Only this worker may write source.

## Independent acceptance

Repeat all twelve exact commands in baseline 03, through verified normal host
PowerShell with its scoped environment. Compare all nine call sites, all three
constructor positions, health, lock/fallback semantics and test fixture validity.
Both Rust configurations and all supported model arms must pass. New immutable
post-change report and director identity recheck are required before acceptance.
