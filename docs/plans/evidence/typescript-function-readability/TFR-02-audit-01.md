# Audit Packet

Record ID: TFR-02-AUDIT-20261019-01

Target ID: TFR-02 / TFR-BATCH.
Decision: CHANGE. Risk: high (profile selection and persistence).
Auditor: configured `clean_code_auditor`, GPT-6.1 Sol high, read-only.
Starting HEAD: `2648617f86fdfd7dddc8dc81fdeabd36942f3c3c`.

Primary target: `apps/desktop/src/tts/hardware-profile-compatibility.ts`,
`HardwareProfileCompatibilityCoordinator.selectProfile`.

Related context: complete paired test file; `admittedForLanguage` and its
`chooseActiveProfile`, `chooseReplacementProfile`, `#runProbe` callers;
`profileSupportsNarrationLanguageV1` and frozen language bindings;
`HardwareProfileMatchV1` construction; preference repository/tests;
settings selection actions and controls; ADR-0019.

Concrete evidence: `selectProfile` repeats compatibility, admitted support state
and language rules already owned by `admittedForLanguage`. Keep exact requested
ID equality first. After equality, the helper's profile ID equals the requested
ID. Language lookup is pure over frozen records/arrays; matches are frozen plain
scalar objects. The helper's different boolean evaluation order introduces no
observed effect. No runtime defect is claimed.

Behavior invariants: open coordinator; exact requested identity; compatible and
supported/development-only profile for current language; persistence permission;
one write with requested ID; unchanged await; post-await closure/saved-result
guards; unchanged snapshot fields and publication. Preserve future-version
protection, recommendation/replacement, native gate, re-probing, caller cleanup,
privacy, cancellation, bounded resources and local-only inference.

## Coverage map

| Invariant | Existing test/assertion | Gap and decision |
| --- | --- | --- |
| Admitted selection and single write | `persists only an admitted compatible explicit selection`: true, exact Qwen ID, preference metadata and one write | No isolated explicit supported-profile positive case; supported helper paths covered by CPU recommendation/English replacement. No new test for equivalent reuse. |
| Unsupported rejection | Same test rejects Supertonic without an additional write | None. |
| Current language | English preference test selects English CPU and rejects Spanish Piper | No explicit wrong-language no-write assertion; unchanged call boundary, no new test. |
| Requested identity | Exact accepted write argument and stale removed-ID probe case | No dedicated unknown-ID select case; preserve equality expression and position, no expansion. |
| Future-version persistence | Stale/future preference test asserts cannot persist, false result and no write | None. |
| Persistence bounds/storage | Preference repository tests cover bounded ID, malformed/future values and storage failures | Unchanged boundary. |
| Pre-start capacity | Reprobe test asserts success then false, two detections and unavailable-RAM result | None. |
| Closed state, non-saved write and closure during await | Explicit source guards, no direct coordinator assertion | Keep every guard/write/await/update/publication statement byte-equivalent; no unrelated tests. |
| Publication/caller order | Preference snapshot assertions; caller stops before selection and refreshes only on true | Exact listener count unasserted; publication/caller code excluded. |

Allowed files (closed):

- `apps/desktop/src/tts/hardware-profile-compatibility.ts`
- `apps/desktop/src/tts/hardware-profile-compatibility.test.ts`

Proposed edits: replace only the repeated portion after
`profile.profileId === profileId` with
`admittedForLanguage(profile, this.#snapshot.language)`. Do not change or rename
the helper. Tests remain unchanged: extraction adds no uncovered behavior.

Forbidden edits: helpers, registry/matcher/language bindings, persistence,
callers, dependency/contracts, admission/support decisions, guard/write/await/
publication order, acquisition eligibility, generated/frozen/historical files,
unrelated formatting or Git mutations.

Diff ceiling: two files, 60 added plus removed lines; expected about 10 lines in
production only. No implementation order is issued by this audit.

Baseline commands / post-change commands / gate ledger: the current ExecPlan
section 8 is the closed command authority. G-FAST, G-BUILD, G-DESKTOP, configured
and filtered G-HOST readiness, G-NATIVE and lifecycle/four-arm G-HOST apply before
and after this unit. Worker performs fast checks. G-BROWSER, G-CROSS, G-FINAL
and G-DOCS remain pending combined acceptance. All run outside sandbox with
before/after HEAD/path identities, exact tools, discovery/transitive inputs,
artifact bytes, environment and cleanup receipts. No benchmark added. Preserve
Qwen model deferral. Any accepted earlier unstaged patch must be explicit in
the starting context; this unit's allowlist must remain clean. Only the
independent validator can reuse an immutable gate with full equivalence proof.

Documentation impact: execution plan/evidence only; no diagram or product change.
Decision required: none for the extraction; missing mandatory baseline/host
evidence prevents implementation. No tests ran as part of this audit.
