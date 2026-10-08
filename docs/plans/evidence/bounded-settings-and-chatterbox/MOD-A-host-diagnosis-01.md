# Read-only host failure diagnosis

Report ID: MOD-A-HOST-DIAGNOSIS-01-20261006  
Related validation: MOD-A-POST-CHANGE-05-20261006 (FAIL)  
Author: independent refactor_validator (GPT-6 Astra high); persisted by director.  
Disposition: acceptance BLOCKED; attribution unresolved.

## Observed evidence

The first portfolio arm targets Piper Spanish. The preceding language exercise
finished and asserted persisted `es`. The initial profile snapshot reported
Piper/davefx already active, requestedSelectable=true, requestedState=compatible,
reason=none, compatibility status=compatible and a complete native host probe.
`requestedSelectable` establishes input existence, not effective enabled state.

In `apps/desktop/scripts/native-startup-smoke.mjs`, the selectable DOM order is
Chatterbox, Piper, Qwen. The enabled `--exercise-profile-switch` route therefore
chooses Chatterbox as the alternate for Piper. The 300-second optional verification
wait applies only when the requested target itself is Chatterbox.

After the logged snapshot, three conditions can produce the same failure:

| Condition | Time budget | Source lines at current HEAD |
| --- | --- | --- |
| Alternate active profile becomes Chatterbox | 90 seconds (default) | 2806-2814 |
| Requested Piper input exists and does not match `:disabled` | 180 seconds | 2817-2822 |
| Active profile becomes Piper after click | 90 seconds (default) | 2838-2845 |

`waitForCondition` (line 3209) polls every 100 ms and emits the same
`webdriver-condition-timeout`. No individual wait result is retained. The
earlier language interaction's 15-second timeout is not this failed stage.

## Hypotheses, not established causes

The alternate click at line 2798 has no effective-enabled guard. Its changed flag
only compares the active ID before clicking. `HardwareCompatibilityControls.tsx`
lines 244-249 disable the fieldset while selection is pending, compatibility is
checking or persistence is unavailable. The earlier language helper waits for
language/status but not completion of the settings action, and tests
`input.disabled` rather than inherited `:disabled`. Language selection becomes
visible before the subsequent awaited narration refresh necessarily finishes.
A lost alternate click is therefore a plausible existing harness race.

Alternatively, the Chatterbox alternate awaits `OptionalChatterboxClient.select`.
That client catches native failure into a failed snapshot (lines 255-263), and
the settings action returns false for a noninstalled result. A stale request can
also return the fixed busy failure (line 265). Optional state is not logged for
the Piper target. Neither hypothesis is confirmed by the observed output.

The harness, controls and optional client have no diff. The extraction remains
statically equivalent; there is no pre-change model-backed result to attribute
this runtime failure to either the patch or the existing checkout.

## Evidence limits and next scope

The failure handler prints only stage/code; driver stdio is ignored. There is no
failure-time DOM/native snapshot, and the harness removed its temporary WebView
and synthetic-input directory. Later successful-path log collection was not
reached. App/driver and installed-interpreter processes were absent after cleanup.
Only the initial content-safe snapshot and generic timeout survive in tool output.

No retry, source edit, assertion/timeout change or build occurred during this
diagnosis. Keep POST05 FAIL. A separate diagnostic scope must identify the exact
wait and capture only fixed fields: language, active/requested/alternate IDs,
effective disabled state, selection-pending state, compatibility status and
optional state/fixed failure. Preserve assertions and timeouts; compare the base
under the same host environment if evidence later requires it. These harness
edits are outside the closed MOD-A allowlist and are not authorized by WORK02.

The director retains the unaccepted patch, starts no further unit and does not
claim a native SKIP. A new scoped diagnostic order and fresh independent passing
host evidence are prerequisites for resuming MOD-A acceptance and then MOD-B.
