import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import "./styles.css";
import { runTtsServiceLifecycleProbe } from "./tts/service-lifecycle-probe";
import { runTtsProtocolProbe } from "./tts/transport-probe";

declare global {
  interface Window {
    readonly __voxleafRunTtsProtocolProbe?: typeof runTtsProtocolProbe;
    readonly __voxleafRunTtsServiceLifecycleProbe?: typeof runTtsServiceLifecycleProbe;
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
