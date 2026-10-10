# Change Packet

Target ID: DESKTOP-PCM-01

Files changed:
- apps/desktop/src/tts/pcm-playback.ts: +15/-386.
- apps/desktop/src/tts/pcm-playback-contracts.ts: new, +55.
- apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts: new, +345.

Exact tally: 801 combined lines (+415/-386), within 850.

Symbols changed: relocated PcmPlaybackErrorCode, PcmPlaybackError,
PcmPlaybackRequest, PcmPlaybackHandle, PcmPlaybackCallbacks, PcmPlaybackBackend,
WebAudioPcmPlaybackBackend, WebAudioPlaybackHandle, AudioContextFactory,
IncrementalWsolaV3Factory.

Required edit mapping:
1. Six declarations moved verbatim to neutral contracts, type-only rate import.
2. Backend/private declarations moved verbatim with comments; imports point to
   contracts, existing authorities and unchanged sibling WSOLA.
3. Facade imports player contracts and directly re-exports public declarations.
   AdaptivePcmPlayer logic remains unchanged; one PcmPlaybackError definition.

Invariants preserved: worker maps all eleven ordered invariants to unchanged
implementations: exports/error identity; player state/timers/cleanup; lazy24kHz;
PCM decode/copy/transfer; progress/pause/volume/durations; resource reuse/disposal;
callbacks/sequences; six deferred rates; release-once/four-unit cleanup;
locators/cancellation/privacy/bounds/non-persistence; frozen WSOLA files/URL.

Tests changed: none. Deviations: none. Accepted Unit1 and documentation retained.
HEAD unchanged; index empty. Worker ran no validation commands or Git mutations.

Director inspection: actual diff and both complete new files match the bounded
extraction and compatible re-exports. No behavior edit identified. This review
is not acceptance; independent validation is pending.

Remaining validation: all nine commands in PCM-order-01.md (D/B/N/H), exact
source identities and host prerequisites. Zero correction cycles so far.
