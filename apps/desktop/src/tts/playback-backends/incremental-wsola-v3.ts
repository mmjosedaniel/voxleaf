import workletModuleUrl from "./incremental-wsola-v3-worklet.ts?worker&url";

export const INCREMENTAL_WSOLA_V3_PROCESSOR_NAME =
  "voxleaf-incremental-wsola-boundary-v3";

export interface IncrementalWsolaV3Node {
  readonly node: AudioWorkletNode;
  readonly close: () => void;
}

export async function createIncrementalWsolaV3Node(
  context: AudioContext,
): Promise<IncrementalWsolaV3Node> {
  await context.audioWorklet.addModule(workletModuleUrl);
  const node = new AudioWorkletNode(
    context,
    INCREMENTAL_WSOLA_V3_PROCESSOR_NAME,
    {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [1],
    },
  );

  let closed = false;
  return Object.freeze({
    node,
    close: () => {
      if (closed) {
        return;
      }
      closed = true;
      node.disconnect();
      node.port.close();
    },
  });
}
