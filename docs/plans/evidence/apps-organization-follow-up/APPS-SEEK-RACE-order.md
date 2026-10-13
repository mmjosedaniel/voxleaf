# Seek observation race regression and repair order

Order: APPS-SEEK-RACE-RED-01, derived from accepted audit
APPS-NATIVE-SEEK-OBSERVATION-01 and independent validator judgment.
HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`.
Baseline: immutable DIAG-04/05 identities and commands. No new unchanged model
retry is required. This is a separately authorized harness bug investigation,
not a claim of pure extraction equivalence or historical failure attribution.

## Evidence and requirement

`ProductNarrationCoordinator.#beginNavigation` establishes pending navigation;
`#finishNavigation` removes it after containment and canonical reader placement.
Reader placement can settle promptly; neither the product contract nor the
implementation promises a minimum navigation-settling duration. The original
harness samples only the current attribute after a separate highlight-clear
wait. Thus a complete transition between observations can be missed. Existing
diagnostic tests prove the observer retains that transition but do not yet
exercise the original acceptance predicate.

DIAG-04 isolated English and DIAG-05 Spanish-then-English passed. They do not
identify the predicate that failed in POST-02/03 or establish a repair.
Do not rewrite those historical failures as proven consequences of this race.

## Red phase

Sole bug writer may modify only
`apps/desktop/scripts/native-smoke.node-test.mjs`, adding at most 150 lines of
regression edits. Execute the exact existing installation, marker and seek
predicate scripts in a controlled fixture. After arming from false, deliver
false-to-true-to-false before acceptance sampling. Require evidence of the
completed transition: the original predicate must fail this regression.
Include negative controls for no transition, prior queued history, an earlier
seek, pre-existing true and stopped instrumentation. Do not mirror the predicate
in a test-owned implementation. The independent validator runs the existing
desktop test command outside sandbox and records the precise expected failure.

## Repair phase, conditional on demonstrated regression

Closed allowlist: the same test and
`apps/desktop/scripts/native-smoke/tts-scenarios.mjs`. At most 180 additional
added-plus-removed lines beyond DIAG-04/05, and 400 total bug-investigation lines
beyond POST-03. Keep the original extraction ceiling separate.

Replace only the transient settling predicate with evidence from active,
armed instrumentation whose initial state was false and which actually observed
true after arming. Never infer success from playback, highlight progression,
an earlier action or elapsed time. Preserve the same 90-second deadline,
100-ms polling, order, selectors, stages, failure mapping and downstream proof.
No product scheduling delays, timeout increases, model changes or new retries.
Retain bounded state, owner binding, reset and cleanup, content-free diagnostics,
highlight clearing, old-key rejection, fresh audible range and stale suppression.

No public runtime, dependency, native/Python/model, publication or image edits.
Writer may apply the existing formatter only to allowed files and run host lint
preflight. Independent validator owns regression and acceptance evidence.

After the red result, the director issues the precise repair instruction.
Require all five deterministic checks and all eleven section 8 native-unit
commands outside sandbox, including all four supported model arms. Conservatively
request independent change review of the acceptance-observation correction;
the existing refactor validator still owns extraction acceptance. Keep all
changes unstaged/uncommitted. No later unit starts before acceptance.
