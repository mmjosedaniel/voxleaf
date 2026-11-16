# ADR-0076: Prospective benchmark restoration and cancellation evidence

Status: Accepted for implementation under the explicit 2026-11-16 authorization; acceptance is governed by the five-search ExecPlan's follow-up review.

## Context

VF-0077's boolean does not prove restoration of an operator's prior power settings. VF-0091's dispatch/completion callbacks do not distinguish the named cancellation phases. Frozen v5/v14 records cannot acquire new guarantees retroactively. ADR-0072 already provides an identity-bound private child acceptance/adapter-entry exchange.

## Decision

Use the versioned `tts-benchmark-safety-v1` companion contract and separate prospective session namespace. Preserve frozen measurement authorities and historical pure readers. New official execution and derivation explicitly select the companion contract; missing evidence fails closed, with no historical fallback. Public output identifies the new contract and verified input digests around inherited measurement summaries. Digests bind bytes; observed events establish semantics.

Before an operator changes energy settings, capture the active Windows scheme GUID and standby/hibernate timeouts on AC and DC. The supported procedure changes only those four timeouts on that scheme. Immediately before worker acquisition, reread that same scheme, require zero timeouts and consume the reservation once. After restoration, a separate explicit finalization captures and compares original/final values for that run. Pending, failed and interrupted executions retain a restoration path without being derivable. A failed finalization may retry the same unchanged execution. No tool automatically writes power policy, and no unsupported global hibernation change is credited.

Raw `sleepSettingRestored` remains false; independent finalization records restoration only in the companion evidence. Raw is not rewritten to feed legacy acceptance. Prospective derivation uses verified companion evidence for this audit, preserving all other cleanup predicates and publishing only after actual required private-session removal.

The frozen v14 raw schema itself requires a positive restoration literal. Therefore prospective raw uses the distinct identities `tts-short-segment-batch-raw-v14-safety-v1` and `tts-dual-worker-raw-v5-safety-v1`, with pending cleanup facts. New validator entry points preserve the other frozen shape/semantic checks and leave legacy entry points unchanged. The complete [contract and operator sequence](../../development/benchmark-safety-v1.md) specifies the retained one-use journal, private-data removal, incomplete-run finalization and exact input bindings.

Queued work is controller-admitted but undispatched at invalidation. Complete-before-release requires a valid concrete completion suppressed by the real identity gate. Active means the child has reached adapter entry and is parked there; it does not mean the model started synthesis. Both-active requires overlapping witnesses at one invalidation. Adapt the private benchmark exchange to one-unit requests without weakening existing two-unit behavior. Retain exact identity/attempt/worker binding, exclusive receive ownership, bounded waits, explicit cancellation and reaping. Counters and acceptance derive from those observations, not labels or success flags.

## Consequences

The extra preparation/finalization steps make restoration an observable operator workflow. Versioned closed evidence binds session, authority/execution, raw, loads and applicable baseline inputs. New output cannot be mistaken for historical acceptance. Synthetic child tests validate control behavior; they do not certify GPU feasibility or physical audio quality. All work stays within the existing development benchmark boundary; no product IPC, process, network, model, dependency or audio persistence change is introduced.

## Alternatives considered

Changing frozen schemas/results would rewrite their meaning. Trusting a user boolean, a dispatch timestamp, an empty output list or successful process termination would leave the original assertions unproved. Duplicating units to reuse the two-unit witness would test the wrong v5 operation. A full scheduler redesign or new hardware campaign is unnecessary for these evidence defects.
