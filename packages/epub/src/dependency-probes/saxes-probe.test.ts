import { afterEach, describe, expect, it, vi } from "vitest";

import { DependencyProbeError } from "./probe-error.js";
import { probeXmlDependency } from "./saxes-probe.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("saxes dependency probe", () => {
  it("parses namespace-aware XML incrementally without a DOM", () => {
    expect(
      probeXmlDependency([
        '<package xmlns="urn:oasis:names:tc:opendocument:xmlns:container">',
        "<rootfiles>safe &amp; local</rootfiles>",
        "</package>",
      ]),
    ).toEqual({
      elementCount: 2,
      namespacedElementCount: 2,
      textCodeUnitCount: 12,
    });
  });

  it.each([
    '<!DOCTYPE package [<!ENTITY canary "private-canary">]><package/>',
    '<!DOCTYPE package SYSTEM "https://private-canary.invalid/book.dtd"><package/>',
    "<package>&private-canary;</package>",
  ])("rejects DTD or custom-entity input without resolution", (xml) => {
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    vi.stubGlobal("fetch", fetch);

    const error = captureProbeError([xml]);

    expect(error).toMatchObject({ code: "malformed-xml" });
    expect(error.message).toBe("malformed-xml");
    expect(error.message).not.toContain("private-canary");
    expect(error.cause).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("stops at an AbortSignal checkpoint between chunks", () => {
    const controller = new AbortController();

    function* cancellableChunks(): Generator<string> {
      yield "<package>";
      controller.abort();
      yield "<child/>";
    }

    const error = captureProbeError(cancellableChunks(), controller.signal);

    expect(error).toMatchObject({ code: "cancelled" });
  });
});

function captureProbeError(
  chunks: Iterable<string>,
  signal?: AbortSignal,
): DependencyProbeError {
  try {
    probeXmlDependency(chunks, signal);
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(DependencyProbeError);
    return error as DependencyProbeError;
  }

  throw new Error("expected dependency probe to fail");
}
