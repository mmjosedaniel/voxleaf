import type { AdaptivePreparationUiState } from "./adaptive-preparation";

export const PREPARED_TARGET_OPTIONS = Object.freeze([
  Object.freeze({ targetMs: 60_000 as const, label: "1 minute" }),
  Object.freeze({ targetMs: 120_000 as const, label: "2 minutes" }),
  Object.freeze({ targetMs: 300_000 as const, label: "5 minutes" }),
  Object.freeze({ targetMs: 600_000 as const, label: "10 minutes" }),
]);

export function formatPreparationDuration(durationMs: number): string {
  if (durationMs < 60_000) {
    const seconds = Math.max(0, Math.ceil(durationMs / 1_000));
    return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
  }
  const minutes = Math.ceil(durationMs / 60_000);
  return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
}

export function preparationTargetLabel(targetMs: number): string {
  const match = PREPARED_TARGET_OPTIONS.find(
    (option) => option.targetMs === targetMs,
  );
  return match?.label ?? formatPreparationDuration(targetMs);
}

export function loadedAudioStatusText(
  state: AdaptivePreparationUiState,
): string {
  const loaded = formatPreparationDuration(state.readyMs);
  const target = preparationTargetLabel(state.targetMs);
  return state.phase === "preparing"
    ? `Playable audio loaded: ${loaded}. Starts at ${target}.`
    : `Playable audio loaded: ${loaded}. Active target: ${target}.`;
}
