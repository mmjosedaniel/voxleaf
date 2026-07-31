declare module "signalsmith-stretch" {
  interface SignalsmithSchedule {
    readonly active?: boolean;
    readonly input?: number;
    readonly output?: number;
    readonly rate?: number;
    readonly semitones?: number;
  }

  export interface SignalsmithStretchNode extends AudioWorkletNode {
    inputTime: number;
    addBuffers(buffers: readonly Float32Array[]): Promise<number>;
    configure(options: {
      readonly preset?: "default" | "cheaper";
      readonly blockMs?: number;
      readonly intervalMs?: number;
      readonly splitComputation?: boolean;
    }): Promise<unknown>;
    dropBuffers(toSeconds?: number): Promise<{
      readonly start: number;
      readonly end: number;
    }>;
    latency(): Promise<number>;
    schedule(options: SignalsmithSchedule): Promise<SignalsmithSchedule>;
    setUpdateInterval(
      seconds: number,
      callback?: (inputTime: number) => void,
    ): Promise<unknown>;
    start(
      when?: number | SignalsmithSchedule,
      offset?: number,
      duration?: number,
      rate?: number,
      semitones?: number,
    ): Promise<SignalsmithSchedule>;
    stop(when?: number): Promise<SignalsmithSchedule>;
  }

  export interface SignalsmithStretchFactory {
    (
      audioContext: AudioContext,
      options?: AudioWorkletNodeOptions,
    ): Promise<SignalsmithStretchNode>;
    moduleUrl?: string;
  }

  const createSignalsmithStretch: SignalsmithStretchFactory;
  export default createSignalsmithStretch;
}
