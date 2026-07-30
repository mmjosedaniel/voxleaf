# ADR-0032: Bound Chatterbox complete-waveform units

Status: Accepted
Date: 2026-07-30

## Context

Chatterbox generates a complete waveform for each narration request. Protocol
v1 accepts at most 480,000 samples, which is 20 seconds at the adapter's 24 kHz
output rate. The engine-neutral bilingual profile could emit long units whose
generated duration exceeded that limit. The service correctly rejected those
outputs, but the product presented the result as a processing failure after
some audio had already played.

The exact private-EPUB reproduction produced 21.92- and 20.44-second units.
Synthetic sequential requests and model loading remained healthy, so the
failure was not caused by request count, CUDA state, or profile switching.

## Decision

Add `narration-chatterbox-v1`, an engine-specific packing profile that:

- reuses the accepted `narration-bilingual-v2` Spanish/English normalization;
- targets 200 normalized code points and caps them at 256;
- targets 240 source code points and caps them at 320;
- retains the existing stable locator, continuation, cancellation, and bounded
  retention contracts; and
- is selected only when the desktop starts the exact Chatterbox profile.

Keep protocol v1's 480,000-sample maximum unchanged.

## Consequences

Chatterbox receives shorter text units, so complete generated waveforms remain
credibly inside the protocol boundary on the evaluated host. Locator mapping
and model-independent normalization stay canonical. The profile is a
model-output accommodation rather than a second text-normalization pipeline.

More unit transitions may occur. Existing boundary-aware playback pauses
remain responsible for audible joins.

## Rejected alternatives

- Increasing the protocol limit would weaken a shared memory bound and would
  not prove a safe upper duration for arbitrary text.
- Truncating or retrying an oversized waveform could lose narration content or
  repeat expensive nondeterministic inference.
- Reusing Piper's profile would couple unrelated model constraints.
- Keeping the generic bilingual profile would preserve the reproduced failure.
