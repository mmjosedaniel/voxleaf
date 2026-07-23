import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import "./styles.css";

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
