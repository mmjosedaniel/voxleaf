import workletModuleUrl from "./incremental-wsola-v2-worklet.ts?worker&url";

export const INCREMENTAL_WSOLA_V2_PROCESSOR_NAME =
  "voxleaf-incremental-wsola-v2";

export interface IncrementalWsolaV2Node {
  readonly node: AudioWorkletNode;
  readonly close: () => void;
}

export async function createIncrementalWsolaV2Node(
  context: AudioContext,
): Promise<IncrementalWsolaV2Node> {
  await context.audioWorklet.addModule(workletModuleUrl);
  const node = new AudioWorkletNode(
    context,
    INCREMENTAL_WSOLA_V2_PROCESSOR_NAME,
    {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [1],
    },
  );
  return Object.freeze({
    node,
    close: () => {
      node.disconnect();
      node.port.close();
    },
  });
}
