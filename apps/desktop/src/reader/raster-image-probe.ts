import { RasterImageSourceManager } from "./raster-image-source";

export interface RasterImageProbeOptions {
  readonly signal?: AbortSignal;
}

export type RasterImageProbeResult = Readonly<{
  status: "accepted" | "cancelled" | "rejected";
}>;

const SYNTHETIC_STATIC_PNG = new Uint8Array([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0,
  0, 0, 1, 8, 4, 0, 0, 0, 181, 28, 12, 2, 0, 0, 0, 11, 73, 68, 65, 84, 120, 218,
  99, 100, 248, 15, 0, 1, 5, 1, 1, 39, 24, 227, 102, 0, 0, 0, 0, 73, 69, 78, 68,
  174, 66, 96, 130,
]);

function fixedResult(
  status: RasterImageProbeResult["status"],
): RasterImageProbeResult {
  return Object.freeze({ status });
}

export async function runRasterImageSafetyProbe(
  options: RasterImageProbeOptions = {},
): Promise<RasterImageProbeResult> {
  const manager = new RasterImageSourceManager();
  try {
    const result = await manager.prepare(
      SYNTHETIC_STATIC_PNG,
      "image/png",
      options,
    );
    if (result.status === "ready") {
      result.source.release();
      return fixedResult("accepted");
    }
    return fixedResult(
      result.status === "cancelled" ? "cancelled" : "rejected",
    );
  } catch {
    return fixedResult(
      options.signal?.aborted === true ? "cancelled" : "rejected",
    );
  } finally {
    await manager.close();
  }
}
