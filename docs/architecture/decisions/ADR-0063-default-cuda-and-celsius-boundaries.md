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
