# Bilingual narration product authority v2

## Status

Implemented by M010.2 Milestone 3. This authority supersedes only the default,
persistence, hydration, and explicit-reset portions of
[`bilingual-narration-authority-v1`](bilingual-narration-authority-v1.md).
The historical v1 file remains byte-for-byte evaluation evidence and is not
rewritten. Its two-language set, identity-first language replacement,
profile-language compatibility, privacy, and cancellation requirements remain
binding.

This authority does not add playback-rate persistence. The production player
remains `1.00x` until M010.2 Milestone 5 integrates the separately selected
WSOLA backend.

## English fallback and upgrade behavior

VoxLeaf exposes exactly English (`en`) and Spanish (`es`). A valid saved value
always wins, including a valid Spanish value written by v1. English is used
only when language state is missing, malformed, over limit, unavailable,
unsupported, otherwise invalid, or explicitly reset.

Opening or replacing an EPUB does not change language. VoxLeaf does not infer
book language, translate text, or switch languages automatically.

## Bounded language preference v2

The desktop owns one content-free Web Storage envelope under the existing
`voxleaf.narration.language-preference` key:

```json
{"schemaVersion":2,"language":"en"}
```

The envelope has exactly `schemaVersion` and `language`, is limited to 256
UTF-8 bytes, and accepts only `en` or `es`. Reads accept valid schema v1 and v2
envelopes so existing choices survive upgrade. A successful user write emits
v2. A future schema fails closed to English and is preserved from overwrite by
this version. Reading a missing or invalid value does not silently write a
replacement; only an explicit selection or reset writes.

Storage errors become the fixed content-free `unavailable` state. They expose
no storage exception, book text, profile data, path, or host detail.

## Bounded narration-start preference v1

The desktop separately owns
`voxleaf.narration.start-preference`. Its exact envelope fields are:

```text
schemaVersion = 1
mode = quick | prepared
preparedTargetMs = 60000 | 120000 | 300000 | 600000
```

The envelope is limited to 256 UTF-8 bytes. Quick mode is represented with
`preparedTargetMs = 60000`; its safe default is Quick. Unknown values, extra
fields, invalid current versions, over-limit data, and unavailable storage
fall back to Quick without a write. A future version is preserved and disables
writes from this application version.

Volume remains session-only. Reader appearance remains owned by the existing
reader-position preference repository. Playback rate has no preference in
this milestone.

## Hydration and actionable controls

Language/profile controls remain disabled while the compatibility coordinator
loads language and profile state. Quick/Prepared controls remain disabled
while the product coordinator loads narration-start state. Hydration performs
only bounded local preference reads and compatibility/configuration checks; it
does not start, load, prepare, or synthesize with a TTS model.

## Explicit reset and generation identity

Reset returns language to English and narration start to Quick. When a
publication coordinator exists, reset first follows the same
`stopForConfigurationChange` path as direct language/profile selection:

1. make the old generation ineligible;
2. cancel or contain active preparation, synthesis, playback, and service
   ownership;
3. release obsolete queued and active audio;
4. write the bounded language and start preferences;
5. recompute the selected English-compatible profile and availability; and
6. require a new explicit Play action.

Reset never starts a model, reuses prior audio, changes the reading locator, or
runs two engines. Profile presentation remains filtered by the existing
language registry. Qwen Serena/Spanish and Aiden/English remain explicitly
labelled Development and retain every native, hardware, configuration, and
support gate.

## Privacy and validation boundary

Both preference envelopes are content-free, globally bounded, and contain no
EPUB identity, locator, text, audio, model path, host report, or error detail.
Repository, coordinator, component, and application-lifecycle tests cover
valid v1/v2 retention, English defaults, malformed/future/over-limit/
unavailable state, closed narration-start values, pre-action hydration,
language-specific profile selection, and identity-first reset ordering.
