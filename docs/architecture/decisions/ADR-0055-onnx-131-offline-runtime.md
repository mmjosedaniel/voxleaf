# ADR-0055: ONNX Runtime 1.31 with pre-import telemetry suppression

- Status: accepted for the locally validated runtime
- Date: 2026-10-18

## Context

PR #249 updates the inference runtime used by the current Piper 1.8 CPU package.
The historical v6/v8 evaluation identities remain immutable. ONNX Runtime 1.31
also changes supported native builds to default to 1DS telemetry. Its Python
extension initializes the native environment during import, before callers can
invoke `disable_telemetry_events()`.

## Decision

Pin the current core graph and adapter to ONNX Runtime 1.31.0. Advance only its
package-specific resolution cutoff to 2026-10-10. Keep all other versions,
voice hashes, CPU provider and generation settings unchanged.

Set `ORT_DISABLE_TELEMETRY=1` in the service process immediately before the
adapter imports ONNX. This overrides an inherited opt-in value. Upstream's
1.31 initialization latches this suppression before creating its uploader,
persistent device identity or telemetry cache. Do not rely on CI detection or
on a post-import event-disable call to protect ordinary desktop execution.

The published Windows x64 wheel retains Windows TraceLogging, which ignores
that environment flag. Call the public `disable_telemetry_events()` API
immediately after import and before importing Piper or creating a model session.
The regression covers both ordering boundaries and an inherited opt-in value.
This does not claim suppression of Windows ETW process metadata during import;
its OS-controlled trace mechanism predates this update. No book text or model
is supplied before the disable call. The pre-import flag covers 1DS builds.

## Consequences and acceptance

The public protocol, audio persistence and process topology do not change.
Current lock identities, package manifests and inventory must be regenerated.
Acceptance requires focused version/privacy regression checks plus fresh
Spanish/English synthesis and packaged playback/cancellation/resource/privacy
evidence. Those checks and independent local review
PR249-INTEGRATION-20261018-01 passed; see the
[completed plan](../../plans/completed/piper-onnxruntime-pr-249.md).
This decision neither admits optional Chatterbox v4 nor publishes an installer.

## Sources

- [ONNX Runtime 1.31 release](https://github.com/microsoft/onnxruntime/releases/tag/v1.31.0).
- [Initialization suppression](https://github.com/microsoft/onnxruntime/blob/v1.31.0/onnxruntime/core/platform/telemetry_1ds.cc).
- [Environment switch](https://github.com/microsoft/onnxruntime/blob/v1.31.0/onnxruntime/core/platform/telemetry_environment.h).
- [Python module initialization](https://github.com/microsoft/onnxruntime/blob/v1.31.0/onnxruntime/python/onnxruntime_pybind_module.cc).
