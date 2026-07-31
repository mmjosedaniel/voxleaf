import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import "./styles.css";
import type {
  PitchPreservingCapabilityResultV3,
  PitchPreservingProbeCandidateIdV3,
  PitchProbeCandidateResultV3,
} from "./tts/pitch-preserving-backend-probe-v3";
import { runTtsServiceLifecycleProbe } from "./tts/service-lifecycle-probe";
import { runTtsProtocolProbe } from "./tts/transport-probe";

async function inspectPitchPreservingBackendCapabilitiesV3(): Promise<PitchPreservingCapabilityResultV3> {
  const audio = document.createElement("audio");
  const audioWorklet =
    typeof AudioContext === "function" &&
    typeof AudioWorkletNode === "function";
  return Object.freeze({
    authorityVersion: 3,
    audioWorklet,
    mediaElementPreservesPitch: "preservesPitch" in audio,
    repositoryWorkletModule: audioWorklet,
  });
}

async function runPitchPreservingBackendCandidateProbeV3(
  candidateId: PitchPreservingProbeCandidateIdV3,
): Promise<PitchProbeCandidateResultV3> {
  const probe = await import("./tts/pitch-preserving-backend-probe-v3");
  return probe.runPitchPreservingBackendCandidateProbeV3(candidateId);
}

declare global {
  interface Window {
    readonly __voxleafRunTtsProtocolProbe?: typeof runTtsProtocolProbe;
    readonly __voxleafRunTtsServiceLifecycleProbe?: typeof runTtsServiceLifecycleProbe;
    readonly __voxleafInspectPitchPreservingBackendCapabilitiesV3?: typeof inspectPitchPreservingBackendCapabilitiesV3;
    readonly __voxleafRunPitchPreservingBackendCandidateProbeV3?: typeof runPitchPreservingBackendCandidateProbeV3;
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
  "__voxleafInspectPitchPreservingBackendCapabilitiesV3",
  {
    configurable: false,
    enumerable: false,
    value: inspectPitchPreservingBackendCapabilitiesV3,
    writable: false,
  },
);

Object.defineProperty(
  globalThis,
  "__voxleafRunPitchPreservingBackendCandidateProbeV3",
  {
    configurable: false,
    enumerable: false,
    value: runPitchPreservingBackendCandidateProbeV3,
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
