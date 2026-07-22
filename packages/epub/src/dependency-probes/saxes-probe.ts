import { SaxesParser } from "saxes";

import {
  DependencyProbeError,
  mapDependencyProbeError,
} from "./probe-error.js";

const MAX_PROBE_CHARS = 16 * 1024;

export interface XmlDependencyProbeSummary {
  readonly elementCount: number;
  readonly namespacedElementCount: number;
  readonly textCodeUnitCount: number;
}

/**
 * Exercises namespace-aware streaming without a DOM or resolver callback.
 * Production byte decoding and XML budgets belong to Task 2.4.
 */
export function probeXmlDependency(
  chunks: Iterable<string>,
  signal?: AbortSignal,
): XmlDependencyProbeSummary {
  let elementCount = 0;
  let namespacedElementCount = 0;
  let textCodeUnitCount = 0;
  let writtenCodeUnitCount = 0;

  try {
    const parser = new SaxesParser({
      defaultXMLVersion: "1.0",
      forceXMLVersion: true,
      xmlns: true,
    });

    parser.on("doctype", () => {
      throw new DependencyProbeError("malformed-xml");
    });
    parser.on("error", () => {
      throw new DependencyProbeError("malformed-xml");
    });
    parser.on("opentag", (tag) => {
      elementCount += 1;
      if (tag.uri.length > 0) {
        namespacedElementCount += 1;
      }
    });
    parser.on("text", (text) => {
      textCodeUnitCount += text.length;
    });

    for (const chunk of chunks) {
      if (signal?.aborted) {
        throw new DependencyProbeError("cancelled");
      }

      writtenCodeUnitCount += chunk.length;
      if (writtenCodeUnitCount > MAX_PROBE_CHARS) {
        throw new DependencyProbeError("resource-limit-exceeded");
      }

      parser.write(chunk);
    }

    if (signal?.aborted) {
      throw new DependencyProbeError("cancelled");
    }
    parser.close();

    return Object.freeze({
      elementCount,
      namespacedElementCount,
      textCodeUnitCount,
    });
  } catch (error: unknown) {
    throw mapDependencyProbeError(error, "malformed-xml", signal);
  }
}
