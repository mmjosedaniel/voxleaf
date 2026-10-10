# PCM audit refresh

Target: DESKTOP-PCM-01. Date: 2026-10-10.
Director-retained receipt of independent clean_code_auditor refresh.
The existing [Audit Packet](PCM-audit-01.md) and [draft terms](PCM-draft-01.md)
remain applicable without expanded transformation, scope, or ceiling.

HEAD: `ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5`. Empty index.
Accepted Unit 1 remains outside this allowlist. No tests or source edits by auditor.

| Path | Fresh SHA-256 |
| --- | --- |
| `apps/desktop/src/tts/pcm-playback.ts` | `2731139D1F6BB7C0BA936BEC426710ADC03CFFAD7A3A35381AC70FBC31F2C1BD` |
| `apps/desktop/src/tts/pcm-playback-contracts.ts` | ABSENT |
| `apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts` | ABSENT |
| `apps/desktop/src/tts/pcm-playback.test.ts` | `5DFABEE0764687DFF7F33AC5CA5695F773E579341F8CD725737E79861CF5D6EA` |
| `apps/desktop/src/tts/playback-backends/incremental-wsola-v3.ts` | `2D77C0B4A348F7AD94250A0F97233C2A97E3AA2AA4954C3080687D11D3BCECE7` |
| `apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.ts` | `B5DAF75AF097A46F9202A409AD001F4D6B5BA306C1872AAF7E4638B8D3CB7A0D` |

Existing paths match HEAD; PCM blob remains
`bcbea041a9a5bfdf0d5acf47927c6b91f2b496db`. Retain CHANGE/medium, the exact
three-source-path allowlist, eleven invariants, and 850 combined changed lines.
Tests and frozen WSOLA files remain excluded from edits. Fresh D/H baseline
must pass before the director issues an Approved Work Order; post-change uses
D/B/N/H. Preserve ADR-0051's scoped evidence and actual six-arm command outcome.

The separately authorized one-time normal-flow Chatterbox installation does not
expand source-worker permissions. Worker download/install/firewall/persistent-
environment/Git prohibitions remain. This refresh is static audit evidence only.
