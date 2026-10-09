# ADR-0053: Refresh Piper's current ONNX Runtime

## Status

Accepted for PR #219 after fresh bilingual Piper host validation and independent
review PR219-v3. The completed Piper ONNX Runtime ExecPlan records the evidence
and limits; this decision does not authorize a merge or release publication.

## Context

The dependency PR changes ONNX Runtime from 1.27.0 to 1.30.0 while preserving
Piper 1.4.2. The release graph cutoff excludes that release and the production
adapter rejects it. Native development startup also binds the historical v6
candidate environment. Changing only the release manifest cannot yield a
working, integrity-verified application.

## Decision

Use exactly ONNX Runtime 1.30.0 for current Piper product execution, with Piper
1.4.2 and the same davefx/Spanish and joe/English model revisions, file hashes,
phonemizer and synthesis settings. Keep existing profile IDs and preferences:
they identify the selected engine/voice family; the current release lock and
runtime manifest identify the executable dependency bytes.

The current adapter accepts only 1.30.0. Both native development configuration
and the packaged runtime use the core release graph. Development still requires
the exact interpreter path and compile-bound lock bytes; packaged execution
still verifies every runtime file. The date exception applies only to ONNX
Runtime, leaving the other dependency pins and cutoff unchanged.

Frozen v6/v8 evaluation manifests, candidate locks and benchmark adapters remain
immutable 1.27.0 historical evidence. They do not establish the new runtime's
performance or voice quality. Preserve their model/generation assertions and
separately test the current adapter against the current release lock. Existing
measurements remain historical; record fresh bilingual synthesis, cancellation,
resource and packaged playback evidence for this upgrade. No new listening
quality score or broader hardware support is inferred.

The local-inference topology, protocol v1, transient audio, CPU-only provider,
one-child ownership and identity-first cancellation remain unchanged. No model
or runtime acquisition occurs during narration.

## Consequences

Regenerate licence evidence, the component inventory, source lock digest and
packaged runtime hashes through their tooling before building a new installer.
Existing installed artifacts remain tied to their own older bytes. Developer
setup uses the current core environment; historical benchmark environments are
not silently upgraded. This decision does not authorize publishing an installer
or merging the PR.

## Alternatives considered

- Accept any ONNX Runtime version: rejected because it removes exact admission.
- Relabel or edit v6/v8 results: rejected because no old measurement validates
  new executable bytes.
- Upgrade Piper simultaneously: deferred to PR #218 to isolate compatibility.
- Keep the manifest-only patch: rejected because it cannot resolve or execute.
