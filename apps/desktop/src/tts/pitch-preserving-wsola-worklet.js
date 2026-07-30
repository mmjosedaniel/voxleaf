/* global AudioWorkletProcessor, currentTime, registerProcessor */

const FRAME_SIZE = 960;
const SYNTHESIS_HOP = 240;
const SEARCH_RADIUS = 48;
const PROCESSOR_NAME = "voxleaf-wsola-probe-v1";

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function correlation(input, previousPosition, candidatePosition, length) {
  let numerator = 0;
  let previousEnergy = 0;
  let candidateEnergy = 0;
  for (let index = 0; index < length; index += 1) {
    const previous = input[previousPosition + index] ?? 0;
    const candidate = input[candidatePosition + index] ?? 0;
    numerator += previous * candidate;
    previousEnergy += previous * previous;
    candidateEnergy += candidate * candidate;
  }
  const denominator = Math.sqrt(previousEnergy * candidateEnergy);
  return denominator === 0 ? -1 : numerator / denominator;
}

function chooseAnalysisPosition(input, previousPosition, expectedPosition) {
  const overlap = FRAME_SIZE - SYNTHESIS_HOP;
  const comparisonPosition = previousPosition + SYNTHESIS_HOP;
  const maximumPosition = Math.max(0, input.length - FRAME_SIZE);
  const first = clamp(
    Math.round(expectedPosition) - SEARCH_RADIUS,
    0,
    maximumPosition,
  );
  const last = clamp(
    Math.round(expectedPosition) + SEARCH_RADIUS,
    0,
    maximumPosition,
  );
  let bestPosition = first;
  let bestCorrelation = Number.NEGATIVE_INFINITY;
  for (let position = first; position <= last; position += 1) {
    const score = correlation(input, comparisonPosition, position, overlap);
    if (score > bestCorrelation) {
      bestCorrelation = score;
      bestPosition = position;
    }
  }
  return bestPosition;
}

function stretchWsola(input, ratePercent) {
  if (
    !(input instanceof Float32Array) ||
    !Number.isInteger(ratePercent) ||
    ratePercent < 50 ||
    ratePercent > 100
  ) {
    throw new TypeError("Invalid WSOLA probe input.");
  }
  const targetLength = Math.ceil((input.length * 100) / ratePercent);
  const output = new Float32Array(targetLength);
  const weights = new Float32Array(targetLength);
  const window = new Float32Array(FRAME_SIZE);
  for (let index = 0; index < FRAME_SIZE; index += 1) {
    window[index] =
      0.5 - 0.5 * Math.cos((2 * Math.PI * index) / (FRAME_SIZE - 1));
  }
  const analysisHop = (SYNTHESIS_HOP * ratePercent) / 100;
  let outputPosition = 0;
  let analysisPosition = 0;
  let frameIndex = 0;
  while (outputPosition < targetLength) {
    if (frameIndex > 0) {
      const expectedPosition = analysisPosition + analysisHop;
      analysisPosition = chooseAnalysisPosition(
        input,
        analysisPosition,
        expectedPosition,
      );
    }
    for (
      let index = 0;
      index < FRAME_SIZE && outputPosition + index < targetLength;
      index += 1
    ) {
      const inputIndex = analysisPosition + index;
      if (inputIndex >= input.length) {
        break;
      }
      const weight = window[index];
      output[outputPosition + index] += input[inputIndex] * weight;
      weights[outputPosition + index] += weight;
    }
    outputPosition += SYNTHESIS_HOP;
    frameIndex += 1;
    if (
      analysisPosition >= input.length - FRAME_SIZE &&
      outputPosition + FRAME_SIZE >= targetLength
    ) {
      break;
    }
  }
  for (let index = 0; index < output.length; index += 1) {
    if (weights[index] > 0.000001) {
      output[index] /= weights[index];
    }
  }
  return {
    output,
    additionalWorkBytes:
      input.byteLength +
      output.byteLength +
      weights.byteLength +
      window.byteLength,
  };
}

class VoxLeafWsolaProbeProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = (event) => {
      const value = event.data;
      if (value?.type === "render") {
        const startedAt = currentTime;
        const result = stretchWsola(value.input, value.ratePercent);
        this.port.postMessage(
          {
            type: "rendered",
            output: result.output,
            sourceFrames: value.input.length,
            renderedFrames: result.output.length,
            computeMs: Math.max(0, (currentTime - startedAt) * 1_000),
            additionalWorkBytes: result.additionalWorkBytes,
          },
          [result.output.buffer],
        );
      } else if (value?.type === "settle-rate") {
        this.port.postMessage({
          type: "rate-settled",
          sourceFrames: value.sourceFrames,
        });
      }
    };
  }

  process(_inputs, outputs) {
    const output = outputs[0]?.[0];
    if (output !== undefined) {
      output.fill(0);
    }
    return true;
  }
}

registerProcessor(PROCESSOR_NAME, VoxLeafWsolaProbeProcessor);
