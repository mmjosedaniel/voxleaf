# ADR-0063: Correct default CUDA admission and Celsius numeric boundaries

## Status

Accepted for implementation on 2026-10-26; validation is tracked in the
[narration logic plan](../../plans/completed/narration-logic-corrections.md).

## Context and decision

CUDA admission must describe the default visible CUDA ordinal used by inference,
not the device with the greatest memory. The Windows probe enumerates
`cuDeviceGet` ordinals in order without filtering. The native supervisor's
`ExactRuntime::command` inherits CUDA visibility/order, changes only
the explicit offline/Python/runtime environment, and does not select another GPU.
Qwen uses `cuda:0`; Chatterbox uses the default CUDA device, including its frozen
packaged service. Normalize the first CUDA entry through the existing LUID join;
missing, ambiguous or unusable mapping fails closed. Preserve DirectML ranking,
report shape, thresholds and native-private identities. This amends only the
CUDA ranking rule in the historical hardware-profile authority.

Freeze **Celsius boundary correction v1** with these examples before implementation:

| Input | Current ES narration | Current EN narration |
| --- | --- | --- |
| `20 °C` | `veinte grados Celsius` | `twenty degrees Celsius` |
| `(20 °C),` | `(veinte grados Celsius),` | `(twenty degrees Celsius),` |
| `1,20 °C` | unchanged | unchanged |
| `1.20 °C` | unchanged | unchanged |
| `120 °C` | unchanged | unchanged |
| `1/20 °C`, `1:20 °C`, `1-20 °C`, `+20 °C`, `−20 °C` | unchanged | unchanged |

Code and unsupported semantic languages remain unchanged. Only standalone
accepted Celsius forms expand. Reject matches attached to numeric punctuation
without introducing a general number parser. Route current `narration-piper-v2`
Spanish through the mutable bilingual normalizer as English and Chatterbox
already do. Preserve historical `narration-v1`, `narration-piper-v1`, frozen
normalizers, corpora and hashes byte-for-byte. The historical unconditional
Spanish equivalence statement is amended only for invalid Celsius suffix
matches; accepted corpus output must remain identical.

## Consequences and alternatives

No GPU selector, protocol, profile ID, model, dependency, packing policy, locator
contract or component boundary changes. Displayed EPUB text remains immutable.
A second qualifying GPU cannot grant admission to an insufficient default GPU.
Physical multi-GPU proof remains distinct from ordered synthetic regression tests.
Changing the frozen service or duplicating a normalizer would expand scope and
invalidate historical authority; both are rejected.

## 2026-11-04: Standalone Celsius range clarification

The current mutable normalizer preserves both endpoints of unsupported Celsius
ranges, including `20 °C–25 °C`, `20 °C – 25 °C` and `20 °C - 20 °C`.
Compact ASCII ranges were already protected. This applies bounded same-prose
context on both sides; an editorial dash without another Celsius endpoint does
not itself prohibit an accepted standalone form. Existing language/code barriers,
source ranges, limits and frozen v1 normalizers remain unchanged. The
[CCF ledger](../../plans/evidence/confirmed-chat-findings/execution-ledger.md)
tracks the new correction and its acceptance separately from the original record.

## 2026-11-09: Decimal and signed Celsius range endpoints

The mutable normalizer preserves both endpoints when either uses an attached
sign or a comma or dot decimal, as in `20 °C – 25,5 °C` and `20 °C–−5 °C`.
The guard uses the existing bounded same-prose lookahead. Standalone Celsius
expansion, editorial dashes, locator mapping and the frozen v1 authority keep
their existing rules.

## 2026-11-09: Query only the default CUDA ordinal on Windows

This amendment supersedes the Windows enumeration rule recorded in the
2026-10-26 decision above. The current Windows probe validates CUDA
initialization and the visible device count, then queries `cuDeviceGet` only for
ordinal 0. A secondary ordinal cannot discard valid default-device facts or
rescue an unknown or invalid default. Default-device capability, LUID matching
and free-memory checks still govern admission. DirectML ranking, report shape,
thresholds and native-private identities remain unchanged.

The [DCR-04 execution receipt](../../plans/evidence/deep-chat-audit/u12-dcr-04-execution.md)
records the original-enumeration reproduction and the current ordinal-0
regressions. The [current U12 review](../../plans/evidence/deep-chat-audit/review-U12-R2.md)
binds the same production behavior and both native feature-mode results
after the test module relocation. The ordered synthetic regression does not
establish physical multi-GPU behavior.
