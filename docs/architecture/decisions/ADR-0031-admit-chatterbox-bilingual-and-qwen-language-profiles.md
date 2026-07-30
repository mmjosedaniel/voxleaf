# ADR-0031: Admit Chatterbox bilingual and Qwen language profiles

- **Status:** Accepted
- **Date:** 2026-07-30
- **Decision owners:** VoxLeaf maintainers
- **Related:** ADR-0023, ADR-0026, ADR-0029, ADR-0030, M010.1

## Context

Result-blind v12 authority required a complete bilingual Chatterbox matrix and
fresh independent quality review for Chatterbox, Qwen/Serena Spanish, and
Qwen/Aiden English. It prohibited automatic rejection and preserved Qwen's
existing approximately 1.44 RTF measurements as constrained-buffer capacity
evidence.

Chatterbox completed five cold loads, 50 generation attempts, and eight
cancellation trials. Spanish and English total sustained RTF were 0.523 and
0.537. Privacy, offline isolation, bounded retention, cleanup, and
cancellation passed. The process used 4.88 GiB peak RAM and 3.56 GiB peak
dedicated VRAM. Its cold load exceeded 30 seconds and process RAM exceeded the
preferred 4-GiB target.

The first packaged Milestone 7 admission check exposed a unit-boundary defect,
not a model failure: DXGI reports the evaluated nominal 8-GB RTX 5060 as 7,810
MiB of usable dedicated memory, while the runtime registry used an 8,000-MiB
literal floor. The same probe reported 7,042 MiB available. Chatterbox's
measured-plus-frozen-margin requirement is 4,668 MiB and its separate available
floor remains 6,144 MiB.

The final packaged synthetic EPUB matrix confirms both Chatterbox languages
through the complete product path. Spanish and English reached first audible
output in 28.811 and 33.007 seconds, produced warm prepared RTF of 0.92 and
0.87, sustained the one-minute quick observation with zero underruns, and
released all audio/model ownership after cancellation and exit. The Qwen
controls also completed safely, but warm prepared RTF was 2.21 for Serena and
2.09 for Aiden; each quick-start arm depleted once and required a bounded
refill. No arm persisted audio or made an external request.

One fluent bilingual maintainer reviewed five fresh samples per language and
profile. Chatterbox was strongly useful in both languages with no
meaning-changing or wrong-language output. Qwen/Serena was strongly rated in
Spanish. Qwen/Aiden received 5.0 in every English quality dimension and was
described as “really good.”

## Decision

- Admit exact Chatterbox profile
  `chatterbox-multilingual-v3-cuda-bf16-default-v4` for both Spanish and
  English integration.
- Retain exact Qwen/Serena Spanish and admit exact Qwen/Aiden English as
  separate hardware-dependent profiles of the existing Qwen engine.
- Treat Chatterbox cold-load latency and RAM use as explicit compatibility and
  UX limitations. They do not override its passing sustained throughput,
  cancellation, quality, privacy, or cleanup evidence.
- Represent Chatterbox's nominal 8-GB GPU class as a 7,680-MiB minimum in the
  DXGI-backed runtime registry. Preserve the stricter calculated 4,668-MiB
  measured-capacity gate and 6,144-MiB available-memory floor. Historical
  frozen benchmark manifests remain byte-unchanged.
- Keep Qwen behind the existing bounded constrained-buffer path. Its measured
  slower-than-real-time behavior on this host is not a rejection or a promise
  about stronger hardware.
- Keep Piper as the lightweight CPU family and current runtime-safe fallback.
- Authorize Milestone 6 integration, but do not call any newly admitted
  profile runtime-supported until its registry, supervision, language routing,
  recovery, cleanup, and exact-host integration evidence pass.
- Reject none of the v12 profiles. Preserve MOSS as deferred without rejection.

## Consequences

VoxLeaf may offer engine and language selection after Milestone 6 proves the
exact combinations. Chatterbox can cover both languages with one engine.
Qwen can expose Serena for Spanish and Aiden for English without duplicating
the engine adapter.

Compatibility UI must disclose that Chatterbox has a heavy cold start and
roughly 5-GiB process footprint on the measured host. Qwen remains a
hardware-dependent buffered quality option with complete-waveform
cancellation limitations. Automatic fallback remains disabled, and only one
model process may be loaded at a time.

The packaged evidence preserves the support decision: Chatterbox is supported
on exact compatible/configured hosts, while Qwen remains development-only
because successful bounded execution does not imply uninterrupted quick
playback on this measured GPU.

M011 must still resolve distributable runtime/model/voice topology, licenses,
notices, installer size, signing, updates, and broader host claims. Admission
for integration does not grant redistribution rights.

## Alternatives considered

- **Use Chatterbox only for one language.** Rejected because its exact frozen
  bilingual matrix and both language reviews passed.
- **Exclude Qwen/Aiden because Serena was the only existing runtime option.**
  Rejected because Aiden uses the same Qwen engine boundary and independently
  passed English quality review.
- **Make Qwen the default on this host.** Rejected because its measured
  approximately 1.44 RTF requires constrained buffering and its host fit is
  narrower than Piper or Chatterbox.
- **Reject Chatterbox for cold-load or RAM advisories.** Rejected because v12
  explicitly made those preferred targets advisory and required the
  maintainer to weigh them against complete passing evidence.
