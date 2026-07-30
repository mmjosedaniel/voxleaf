# Chatterbox narration preparation profile v1

Status: Implemented
Date: 2026-07-30

## Purpose

The exact Chatterbox adapter returns one complete 24 kHz waveform for each
prepared narration unit. Protocol v1 bounds one unit to 480,000 samples, or 20
seconds. The generic bilingual preparation profile can preserve a long
sentence as one unit and therefore cannot by itself guarantee that a
Chatterbox waveform remains inside this model-output boundary.

`narration-chatterbox-v1` keeps the accepted Spanish/English normalization,
stable locator ranges, continuation, cancellation, and retention behavior of
`narration-bilingual-v2`. It changes only the packing envelope used before
Chatterbox inference.

## Frozen packing envelope

| Limit | Target | Hard maximum |
| --- | ---: | ---: |
| Source code points | 240 | 320 |
| Normalized narration code points | 200 | 256 |
| Normalized narration UTF-8 bytes | 800 | 1,024 |
| Sentences | 2 | 6 |

The desktop coordinator selects this profile only for the exact bilingual
Chatterbox runtime. Piper continues to use `narration-piper-v2`; Qwen continues
to use `narration-bilingual-v2`. These text limits reduce the measured risk of
an oversized waveform; because generated duration is model-dependent, the
service still rejects any unusual result above the protocol maximum.

## Exact-host evidence

The private EPUB failure was reproduced without retaining or logging book
text. Generic bilingual preparation produced 482- and 460-code-point units
whose Chatterbox outputs contained 526,080 and 490,560 samples: 21.92 and
20.44 seconds at 24 kHz. Both exceeded protocol v1.

With this profile, the same bounded diagnostic prepared eight consecutive
units between 99 and 241 code points. Their generated audio ranged from 5.12
to 12.00 seconds, all below the 20-second protocol maximum. A fresh packaged
application run then crossed the former failure point and reached the
one-minute playable-audio target without a processing or cleanup failure.

## Non-effects

This profile does not:

- truncate narration text or generated audio;
- retry an oversized model response;
- increase protocol v1 payload limits;
- change bilingual normalization;
- persist EPUB text or generated audio; or
- relax identity-first cancellation and bounded-memory ownership.
