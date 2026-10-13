# English seek diagnostic order

Order ID: APPS-SEEK-DIAG-01. Accepted audit: APPS-NATIVE-SEEK-DIAG-01.
HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`.

The maintainer explicitly authorized investigating and correcting the English
Piper seek blocker before continuing the organization plan, without weakening
tests, staging or commits. This is a bounded diagnostic amendment; it does not
rewrite the original extraction order or its failures.

Baseline: POST-03's exact six source identities were rechecked unchanged by
the independent validator. Deterministic gates passed there; English failed.
The earlier isolated PASS is not a repair. Both complete failures finished in
about 175 seconds, which excludes a complete 270-second first wait under normal
clock progression. Three 90-second waits remain possible, including the
previously omitted wait inside `forbidAdaptiveHighlightKey`.

## Closed scope and invariants

Allowed files:

- `apps/desktop/scripts/native-smoke/tts-scenarios.mjs`.
- `apps/desktop/scripts/native-smoke.node-test.mjs`.

Maximum incremental change: 240 added-plus-removed lines beyond POST-03,
separate from the extraction's 698 non-relocation lines. A separate bug writer
owns this diagnostic patch; the refactor writer is idle. No product source,
native/Python implementation, model, public contract or dependency change.

Install a bounded MutationObserver through the existing synchronization
installation call, filtered only to the narration navigation-settling attribute.
Arm/reset it through the existing pre-action marker call, discarding earlier
records. Preserve evidence of `true` even when `true` then `false` are delivered
together. Disconnect through the existing instrumentation stop/finally owner.
Record only booleans, bounded counts and timings; never book text or raw keys.

Tag all five waits with fixed diagnostic labels, preserving their exact
predicates, order, deadlines, polling and assertions. On failure, take at most
one content-safe snapshot and rethrow the original error even if that snapshot
fails. Preserve the existing resumed-playback diagnostic. Add controlled tests
for coalesced mutations, no transition, pre-arm history and stop cleanup.

## Validation order

The independent validator records fresh before/after identities for all six
native-unit files and checks the incremental patch against the saved POST-03
bytes. Run in normal local PowerShell outside sandbox:

1. `pnpm.cmd build:packages`.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`.
3. `pnpm.cmd --filter @voxleaf/desktop test`.
4. `pnpm.cmd format:check:typescript`.
5. `pnpm.cmd lint:typescript`.
6. Exactly one instrumented invocation of
   `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en`.

Use the same existing pinned toolchain, local interpreters/model roots and
process-only offline settings as POST-03. Preserve old logs; new raw output and
rollback copies belong under ignored `tmp/evidence/apps-organization-follow-up/`.
This is diagnostic evidence, never native-unit acceptance. A correction needs
proven cause, a separate bounded order and full native-unit acceptance. No
timeout increases, skipped predicates, product delays or retry-until-green.
