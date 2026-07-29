# ADR-0024: Freeze bilingual product and v7 evaluation authority

## Status

Accepted for M010.1 Milestone 1. This decision freezes planned behavior and
evaluation authority; English narration and new engines remain unimplemented.

## Context

Completed M010 supports exact Piper/davefx Spanish and retains Qwen/Serena as
development-only. The desktop and EPUB narration boundary are Spanish-only.
The portfolio-focused M010.1 follow-up needs explicit English narration and a
bounded naturalness screen without changing historical M005 normalization or
selecting a model after hearing favorable results.

Candidate families change rapidly and may contain ambiguous default voices,
automatic downloads, upstream text rewriting, reference-audio workflows, and
large dependency graphs. Family names and upstream demos are insufficient
authority for a local privacy-first product.

## Decision

Adopt:

- [`bilingual-narration-authority-v1`](../bilingual-narration-authority-v1.md)
  for explicit `es`/`en` selection, bounded persistence, identity-first
  invalidation, compatibility rejection, explicit restart, and accessibility;
- [`narration-bilingual-v2`](../narration-normalization-v2.md) as a new
  locator-preserving profile that reuses Spanish v1 unchanged and adds only a
  closed English corpus;
- [`tts-bilingual-profile-v7`](../tts-feasibility-profile-v7.md) with exact
  candidates, locks, revisions, artifacts, settings, schemas, corpus hashes,
  evaluator rules, gates, stop conditions, and result ancestry; and
- one fluent evaluator per evaluated language for the MVP.

Piper `en_US-joe-medium` is the English baseline. Chatterbox Multilingual V3
and MOSS-TTS-Nano 100M ONNX are the two ordered new-engine screens.
Fun-CosyVoice3 is rejected at intake because no exact non-personal default
voice was frozen and reference audio is forbidden.

At most one new engine can survive to full evaluation and integration. No
survivor is acceptable. Automatic engine fallback, simultaneous model
processes, language detection, translation, and voice cloning remain outside
scope.

## Consequences

- No v7 result may be created until the authority commit exists.
- Current Spanish narration remains unchanged through Milestone 1.
- Milestone 2 can implement bilingual behavior against deterministic
  model-free authority.
- Candidate dependencies stay in isolated locks and do not enter the base
  service environment.
- M011 remains responsible for distribution notices, source obligations,
  voice/model provenance fulfillment, installer size, signing, and updates.
- An upstream update requires a new authority version; it cannot silently
  change a frozen candidate.

## Alternatives considered

### Add English directly to narration-v1

Rejected because it would rewrite historical normalization authority and make
past Spanish evidence ambiguous.

### Evaluate all candidates before freezing thresholds

Rejected because listening or performance results could influence selection
rules.

### Keep CosyVoice by asking the maintainer for reference audio

Rejected because personal reference audio and voice enrollment are explicit
non-goals.
