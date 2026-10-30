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

export function formatLoadedDuration(durationMs: number): string {
  const seconds = Math.max(0, Math.floor(durationMs / 1_000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const secondsLabel = `${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"}`;
  if (minutes === 0) return secondsLabel;
  const minutesLabel = `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  return remainingSeconds === 0
    ? minutesLabel
    : `${minutesLabel} ${secondsLabel}`;
}

export function loadedAudioStatusText(
  state: AdaptivePreparationUiState,
): string {
  const loaded = formatLoadedDuration(state.readyMs);
  const target = preparationTargetLabel(state.targetMs);
  const rate = (state.selectedPlaybackRatePercent / 100).toFixed(2);
  const loadedAtRate = `${loaded} ready at ${rate}×`;
  return state.phase === "preparing"
    ? `Playable audio loaded: ${loadedAtRate}. Starts at ${target}.`
    : `Playable audio loaded: ${loadedAtRate}. Active target: ${target}.`;
}
