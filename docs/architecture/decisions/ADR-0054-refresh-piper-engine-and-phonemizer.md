# ADR-0054: Refresh the current Piper engine and phonemizer

## Status

Accepted for PR #218 after fresh bilingual runtime validation and independent
change review PR218-v1. Supersedes only ADR-0053's current Piper/phonemizer versions.

## Context

The Piper 1.8.0 dependency update cannot execute as a manifest-only change:
resolution cutoff, adapter admission, package licence path, corresponding
sources and integrity manifests still bind 1.4.2. Upstream also refreshes the
embedded eSpeak-NG phonemizer and adds optional language helpers. These changes
require new evidence even though the two voice model files remain identical.

## Decision

Use exactly Piper 1.8.0 with the already accepted ONNX Runtime 1.30.0 and Python
3.12 core graph. Add a Piper-only resolution cutoff of 2026-09-05, retaining all
other dependency pins and the existing ONNX exception. Require the exact engine
version before import; do not accept a version range or a historical runtime.

Bind the Windows wheel to upstream Piper commit
`639388b6317fc4731e91d53da42aea68fd4166ff` and its CMake-selected eSpeak-NG
commit `724808c5a83f9ef95fdd0db886ba7ba537ff224a`. Include their corresponding
sources and licences in the verified package. Extend the existing dormant-code
exclusions to the new Chinese helper, Hebrew/Japanese/Thai helpers and Hebrew
model subtree; both admitted voices use the hash-verified eSpeak configuration.
Retain upstream files unchanged and install no optional language extras.

Keep the current Spanish/English voice artifacts, synthesis settings, CPU-only
provider, bounded PCM conversion, protocol, cancellation and one-child topology.
Keep existing profile preference IDs as engine/voice-family identities under
ADR-0053; the exact current lock and manifest identify executable bytes.

Historical Piper 1.4.2 evaluation profiles, candidate locks and completed
evidence remain immutable. Their measurements and listening scores do not
validate 1.8.0. Fresh synthesis/service/playback/privacy/resource results must
be recorded separately, and pronunciation changes or human-quality uncertainty
must be disclosed rather than inferred from successful execution.

## Consequences

Regenerate inventory, licence metadata, lock digest and runtime/package
evidence. Test the real bilingual core and WebView playback before acceptance.
Existing installer lifecycle and historical audio-quality results remain bound
to their original artifacts. This decision does not authorize a merge, a new
language, a new model selection or installer publication.

## Alternatives considered

- Keep 1.4.2: technically viable, but the maintainer requested the upgrade now.
- Install all Piper extras: unnecessary for the admitted voices and expands
  the runtime dependency/model surface.
- Weaken exact version or payload checks: would weaken the integrity boundary.
- Rewrite historical evaluations: would incorrectly transfer old evidence.
