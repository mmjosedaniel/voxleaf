# Audit Packet and source-free seek diagnostic draft

Target ID: MOD-A-SEEK-DIAG-01  
Auditor: reused clean_code_auditor, GPT-6.1 Sol high.  
Decision: CHANGE to temporary observation only. Risk: medium.

## Evidence

The full uninstrumented run passed four arms then failed Qwen/es post-seek
resumption. Its next-button readiness, clear-count and navigation-settling
predicates completed. The final 360-second predicate requires playing plus a
new transition and different string highlight key. Existing output omits phase,
failure/recovery/service state and play intent. Null key/document comes from
the existing highlight-clear observer, not proof of a reader defect. The sticky
rangeValid=true flag does not prove playback resumed.

All missing fields already exist on ProductNarrationControls' fixed data
attributes. No coordinator, reader or product instrumentation edit is needed.

## Closed temporary scope

- `tmp/mod-a-seek-observer/observer.mjs`
- `tmp/mod-a-seek-observer/observer.node-test.mjs`

Maximum two ignored temporary files, 300 total lines (approximately 150 observer
lines plus meaningful stub tests). Seven product/repair paths remain frozen.
Independent baseline review and identity checks precede authoring.

## Required observation and invariants

Guard the exact native runner, adaptive mode, Qwen Serena profile and Spanish
arguments. Import the existing side-effect-free driver module. Track the element
returned for the exact next-passage selector; before its original sendKeys,
install a bounded DOM observer and starting snapshot. Preserve receivers,
arguments, values and original errors; diagnostic failure cannot block dispatch.

Retain at most 64 distinct state records, latest state and overflow count. Emit
before original deleteSession; always run original cleanup even when observation
or logging fails. Observe only fixed whitelisted owner/profile/phase/availability,
failure/preparation/recovery/service codes, intent/settling, bounded duration/unit
counts, synchronization counts and key-present/changed/highlight booleans, reader
presence and paragraph-leaf count/state, and next-button presence/effective enable.
Never emit text, locators/keys/document IDs, raw errors, paths, storage or DOM dumps.
Use existing fixed data attributes; no extra native/service invocation.

Preserve every assertion, 360-second seek deadline, navigation command, forbidden
key tracking and cleanup. No retry, recovery, product/harness/dependency/Git
change or MOD-B work. Tests must meaningfully verify guard, passthrough/errors,
bounded records, sanitization and cleanup on failed observation.

## Diagnostic interpretation

Settling/operational/no failure points to stop completion or reader settlement;
inactive intent or failure/recovery to containment; preparing/buffering with
playing intent and operational service to generation; playing without a new key
to synchronization; missing owner/reader to teardown. These remain hypotheses
until the observer records actual state.

## Commands

Use the existing Node test runner outside sandbox:
`node --test tmp/mod-a-seek-observer/observer.node-test.mjs`.

After independent review, diagnostic only, existing explicit portfolio filter:
`pnpm.cmd --filter @voxleaf/desktop exec node scripts/bilingual-portfolio-host.mjs --profile=qwen3-tts-1-7b-customvoice-cuda-bf16-serena-es-v8 --language=es`.

Use the current already-built artifact, record its hash after pending aggregate
builds finish, and verified process-local offline/model/driver/preload setup.
This intentionally avoids repeating four passing arms for diagnosis; it is not
acceptance evidence. Final acceptance remains the full uninstrumented, unfiltered
`pnpm.cmd test:tts:bilingual-portfolio-exact-host`.

Keep previous FAIL reports immutable. A correction requires causal evidence and
a new bounded decision; the coordinator exclusion remains binding.
