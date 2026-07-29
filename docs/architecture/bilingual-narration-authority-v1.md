# Bilingual narration product authority v1

## Status

Accepted as result-blind authority for M010.1 Milestone 1. This document freezes
the product behavior that later milestones must implement. It does not claim
that English narration is currently available.

The current product remains Spanish-only:

- `NarrationPreparationLanguage` accepts only `und` or `es`;
- the desktop submits `defaultLanguage: "es"`;
- the product coordinator selects `narration-v1`, or
  `narration-piper-v2` for the supported Piper Spanish profile; and
- the executable profile registry contains no English profile.

Deterministic tests retain this boundary until M010.1 Milestone 2 changes it.

## Explicit language selection

VoxLeaf will expose exactly two product narration languages:

- Spanish (`es`); and
- English (`en`).

There is no automatic detection, translation, or mixed-language switching.
Existing installations, missing preferences, invalid persisted values, and
new books default to Spanish. The user must explicitly select English.

The accessible control is a labelled two-option radio group. Both options are
keyboard operable. Availability and incompatibility changes are announced
through a polite, content-free status. A disabled option exposes a fixed safe
reason without engine errors, book text, host identity, paths, or model data.

## Bounded persistence

The desktop may persist one versioned closed preference:

```text
narration-language-preference-v1 = es | en
```

No inferred language, book excerpt, generated audio, evaluator data, profile
path, or host report may be persisted with it. Unknown versions, unknown
values, extra fields, or malformed state fail closed to `es`.

## Identity and replacement lifecycle

Language is part of the complete generation identity. Changing language:

1. replaces the active generation identity;
2. cancels active preparation and synthesis;
3. stops and cleans the one supervised service tree;
4. releases obsolete queued, playable, and currently playing audio;
5. retains the current canonical narration locator;
6. recomputes exact profile/language compatibility; and
7. requires an explicit Play action.

The change does not start narration automatically, run two engines, reuse old
audio, or silently fall back to another engine.

## Exact profile compatibility

A profile is selectable only when its immutable registry identity declares the
selected language and its existing support, host, evidence, and runtime
configuration gates all pass. An unsupported combination is rejected before
child start and presented as a content-free unavailable state.

Spanish Piper remains the only supported profile until later v7 evidence
admits an English profile. Qwen/Serena remains development-only and
Spanish-only unless a later versioned evaluation changes that exact identity.

## Privacy and cancellation

Language selection changes no EPUB privacy rule. Book text and generated audio
remain process-local, local inference remains mandatory, audio remains bounded
in memory, and identity replacement precedes cancellation. Persisted language
state is content-free and bounded.

## Acceptance boundary

Milestone 2 must prove this behavior with model-free unit, integration,
browser, and packaged fake-service tests before any real bilingual engine
integration. A real profile remains unavailable until its frozen v7 result and
selection decision pass.
