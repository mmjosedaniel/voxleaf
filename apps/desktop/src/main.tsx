import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import "./styles.css";
import type {
  PitchPreservingCapabilityResultV2,
  PitchPreservingProbeCandidateIdV2,
  PitchProbeCandidateResultV2,
} from "./tts/pitch-preserving-backend-probe-v2";
import { runTtsServiceLifecycleProbe } from "./tts/service-lifecycle-probe";
import { runTtsProtocolProbe } from "./tts/transport-probe";

async function inspectPitchPreservingBackendCapabilitiesV2(): Promise<PitchPreservingCapabilityResultV2> {
  const audio = document.createElement("audio");
  const audioWorklet =
    typeof AudioContext === "function" &&
    typeof AudioWorkletNode === "function";
  return Object.freeze({
    authorityVersion: 2,
    audioWorklet,
    mediaElementPreservesPitch: "preservesPitch" in audio,
    signalsmithModule: true,
    repositoryWorkletModule: audioWorklet,
  });
}

async function runPitchPreservingBackendCandidateProbeV2(
  candidateId: PitchPreservingProbeCandidateIdV2,
): Promise<PitchProbeCandidateResultV2> {
  const probe = await import("./tts/pitch-preserving-backend-probe-v2");
  return probe.runPitchPreservingBackendCandidateProbeV2(candidateId);
}

declare global {
  interface Window {
    readonly __voxleafRunTtsProtocolProbe?: typeof runTtsProtocolProbe;
    readonly __voxleafRunTtsServiceLifecycleProbe?: typeof runTtsServiceLifecycleProbe;
    readonly __voxleafInspectPitchPreservingBackendCapabilitiesV2?: typeof inspectPitchPreservingBackendCapabilitiesV2;
    readonly __voxleafRunPitchPreservingBackendCandidateProbeV2?: typeof runPitchPreservingBackendCandidateProbeV2;
  }
}

Object.defineProperty(globalThis, "__voxleafRunTtsProtocolProbe", {
  configurable: false,
  enumerable: false,
  value: runTtsProtocolProbe,
  writable: false,
});

Object.defineProperty(globalThis, "__voxleafRunTtsServiceLifecycleProbe", {
  configurable: false,
  enumerable: false,
  value: runTtsServiceLifecycleProbe,
  writable: false,
});

Object.defineProperty(
  globalThis,
  "__voxleafInspectPitchPreservingBackendCapabilitiesV2",
  {
    configurable: false,
    enumerable: false,
    value: inspectPitchPreservingBackendCapabilitiesV2,
    writable: false,
  },
);

Object.defineProperty(
  globalThis,
  "__voxleafRunPitchPreservingBackendCandidateProbeV2",
  {
    configurable: false,
    enumerable: false,
    value: runPitchPreservingBackendCandidateProbeV2,
    writable: false,
  },
);

const container = document.getElementById("root");

if (container === null) {
  throw new Error("Desktop root element was not found");
}

createRoot(container, {
  // React's default caught-error reporter writes the raw thrown value to the
  // console. Reader failures are rendered through a fixed safe boundary, so
  // publication-derived exceptions must not also cross into browser logs.
  onCaughtError: () => undefined,
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
