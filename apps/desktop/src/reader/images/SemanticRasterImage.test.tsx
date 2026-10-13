import type {
  RasterImageResourceId,
  SensitivePublicationText,
} from "@voxleaf/epub";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  PublicationRasterImageLoadPort,
  PublicationRasterImageLoadResult,
} from "./publication-raster-image-loader";
import type { RasterImageSource } from "./raster-image-source";
import {
  SemanticRasterImageElement,
  type ObserveRasterImageVisibility,
} from "./SemanticRasterImage";

const RESOURCE_ID = "private-raster-resource" as RasterImageResourceId;
const ALTERNATIVE_TEXT = "Synthetic cover" as SensitivePublicationText;

function deferred<T>(): {
  readonly promise: Promise<T>;
  readonly resolve: (value: T) => void;
} {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function createSource(): {
  readonly source: RasterImageSource;
  readonly release: ReturnType<typeof vi.fn>;
} {
  let released = false;
  const release = vi.fn(() => {
    released = true;
  });
  return {
    source: Object.freeze({
      objectUrl: "blob:synthetic-image",
      widthPixels: 320,
      heightPixels: 180,
      decodedPixels: 57_600,
      get released() {
        return released;
      },
      release,
    }),
    release,
  };
}

function controlledVisibility(): {
  readonly observe: ObserveRasterImageVisibility;
  readonly reveal: () => void;
  readonly disconnect: ReturnType<typeof vi.fn>;
} {
  let onVisible: (() => void) | undefined;
  const disconnect = vi.fn();
  return {
    observe: vi.fn((_element, callback) => {
      onVisible = callback;
      return disconnect;
    }),
    reveal: () => onVisible?.(),
    disconnect,
  };
}

afterEach(cleanup);

describe("semantic raster image", () => {
  it("waits for visibility, renders a decoded local source, and releases it", async () => {
    const pending = deferred<PublicationRasterImageLoadResult>();
    const load = vi.fn<PublicationRasterImageLoadPort["load"]>(
      () => pending.promise,
    );
    const loader: PublicationRasterImageLoadPort = { load };
    const visibility = controlledVisibility();
    const { source, release } = createSource();
    const { unmount } = render(
      <SemanticRasterImageElement
        resourceId={RESOURCE_ID}
        alternativeText={ALTERNATIVE_TEXT}
        loader={loader}
        observeVisibility={visibility.observe}
        language="en"
        direction="ltr"
      />,
    );

    expect(
      screen.getByRole("img", {
        name: "Synthetic cover. Image loading.",
      }),
    ).toBeInTheDocument();
    expect(load).not.toHaveBeenCalled();

    act(() => visibility.reveal());
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
    const signal = load.mock.calls[0]![1]?.signal;
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal?.aborted).toBe(false);

    await act(async () => {
      pending.resolve({ status: "ready", source });
      await pending.promise;
    });

    const image = screen.getByRole("img", { name: "Synthetic cover" });
    expect(image.tagName).toBe("IMG");
    expect(image).toHaveAttribute("src", "blob:synthetic-image");
    expect(image).toHaveAttribute("width", "320");
    expect(image).toHaveAttribute("height", "180");
    expect(image).toHaveAttribute("decoding", "async");
    expect(image).toHaveAttribute("lang", "en");
    expect(image).toHaveAttribute("dir", "ltr");

    unmount();
    expect(signal?.aborted).toBe(true);
    expect(release).toHaveBeenCalledTimes(1);
    expect(visibility.disconnect).toHaveBeenCalledTimes(1);
  });

  it("releases a late ready source after the component becomes stale", async () => {
    const pending = deferred<PublicationRasterImageLoadResult>();
    const load = vi.fn<PublicationRasterImageLoadPort["load"]>(
      () => pending.promise,
    );
    const visibility = controlledVisibility();
    const { source, release } = createSource();
    const { unmount } = render(
      <SemanticRasterImageElement
        resourceId={RESOURCE_ID}
        alternativeText={ALTERNATIVE_TEXT}
        loader={{ load }}
        observeVisibility={visibility.observe}
      />,
    );

    act(() => visibility.reveal());
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
    const signal = load.mock.calls[0]![1]?.signal;
    unmount();

    await act(async () => {
      pending.resolve({ status: "ready", source });
      await pending.promise;
    });

    expect(signal?.aborted).toBe(true);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it("uses fixed accessible fallback text without exposing resource identity", async () => {
    const load = vi.fn(async () => ({ status: "unavailable" }) as const);
    const visibility = controlledVisibility();
    const { container } = render(
      <SemanticRasterImageElement
        resourceId={RESOURCE_ID}
        loader={{ load }}
        observeVisibility={visibility.observe}
      />,
    );

    act(() => visibility.reveal());

    expect(
      await screen.findByRole("img", {
        name: "Publication image. Image unavailable.",
      }),
    ).toHaveTextContent("Image unavailable");
    expect(container.innerHTML).not.toContain(RESOURCE_ID);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[src]")).toBeNull();
  });

  it("falls back locally and releases the source if final image presentation fails", async () => {
    const { source, release } = createSource();
    const load = vi.fn(async (): Promise<PublicationRasterImageLoadResult> => ({
      status: "ready",
      source,
    }));
    const visibility = controlledVisibility();
    render(
      <SemanticRasterImageElement
        resourceId={RESOURCE_ID}
        alternativeText={ALTERNATIVE_TEXT}
        loader={{ load }}
        observeVisibility={visibility.observe}
      />,
    );

    act(() => visibility.reveal());
    const image = await screen.findByRole("img", { name: "Synthetic cover" });
    fireEvent.error(image);

    expect(
      screen.getByRole("img", {
        name: "Synthetic cover. Image unavailable.",
      }),
    ).toHaveTextContent("Image unavailable");
    expect(release).toHaveBeenCalledTimes(1);
  });

  it("renders an immediate accessible placeholder when no loader is owned", () => {
    const observe = vi.fn<ObserveRasterImageVisibility>();
    render(
      <SemanticRasterImageElement
        resourceId={RESOURCE_ID}
        alternativeText={ALTERNATIVE_TEXT}
        observeVisibility={observe}
      />,
    );

    expect(
      screen.getByRole("img", {
        name: "Synthetic cover. Image unavailable.",
      }),
    ).toHaveTextContent("Image unavailable");
    expect(observe).not.toHaveBeenCalled();
  });
});
