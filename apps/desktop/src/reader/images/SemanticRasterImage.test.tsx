import type {
  OpenedPublication,
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
import { StrictMode } from "react";

import {
  PublicationRasterImageLoader,
  type PublicationRasterImageLoadPort,
  type PublicationRasterImageLoadResult,
  type RasterImageVisibility,
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
  readonly set: (visibility: RasterImageVisibility) => void;
  readonly disconnect: ReturnType<typeof vi.fn>;
} {
  let onVisible: ((visibility: RasterImageVisibility) => void) | undefined;
  const disconnect = vi.fn();
  return {
    observe: vi.fn((_element, callback) => {
      onVisible = callback;
      return disconnect;
    }),
    reveal: () => onVisible?.("visible"),
    set: (visibility) => onVisible?.(visibility),
    disconnect,
  };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function managedLoader(
  load: PublicationRasterImageLoadPort["load"],
): PublicationRasterImageLoadPort {
  const loader = new PublicationRasterImageLoader({
    resources: [],
    closed: false,
  } as unknown as OpenedPublication);
  vi.spyOn(loader, "load").mockImplementation(load);
  return loader;
}

describe("semantic raster image", () => {
  it("RPI-02 releases offscreen sources while reserving their footprint and reloads on return", async () => {
    const first = createSource();
    const second = createSource();
    const load = vi
      .fn<PublicationRasterImageLoadPort["load"]>()
      .mockResolvedValueOnce({ status: "ready", source: first.source })
      .mockResolvedValueOnce({ status: "ready", source: second.source });
    const visibility = controlledVisibility();
    const { container, unmount } = render(
      <StrictMode>
        <SemanticRasterImageElement
          resourceId={RESOURCE_ID}
          loader={managedLoader(load)}
          observeVisibility={visibility.observe}
        />
      </StrictMode>,
    );
    act(() => visibility.reveal());
    await waitFor(() => expect(container.querySelector("img")).not.toBeNull());
    const host = container.querySelector<HTMLElement>(".semantic-raster-host")!;
    const width = host.style.width;
    const ratio = host.style.aspectRatio;
    act(() => visibility.set("outside"));
    expect(container.querySelector("img")).toBeNull();
    expect(first.release).toHaveBeenCalledTimes(1);
    expect(width).toBe("320px");
    expect(host.style.width).toBe(width);
    expect(host.style.aspectRatio).toBe(ratio);
    act(() => visibility.reveal());
    await waitFor(() => expect(container.querySelector("img")).not.toBeNull());
    expect(load).toHaveBeenCalledTimes(2);
    unmount();
    expect(second.release).toHaveBeenCalledTimes(1);
    expect(visibility.disconnect).toHaveBeenCalledTimes(2);
  });

  it("RPI-02 discards a slow obsolete completion after re-entry", async () => {
    const first = createSource();
    const second = createSource();
    const pending = deferred<PublicationRasterImageLoadResult>();
    const load = vi
      .fn<PublicationRasterImageLoadPort["load"]>()
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce({ status: "ready", source: second.source });
    const visibility = controlledVisibility();
    const { container, unmount } = render(
      <SemanticRasterImageElement
        resourceId={RESOURCE_ID}
        loader={managedLoader(load)}
        observeVisibility={visibility.observe}
      />,
    );
    act(() => visibility.reveal());
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
    act(() => visibility.set("outside"));
    expect(load.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
    act(() => visibility.reveal());
    await waitFor(() => expect(container.querySelector("img")).not.toBeNull());
    await act(async () => {
      pending.resolve({ status: "ready", source: first.source });
      await pending.promise;
    });
    expect(first.release).toHaveBeenCalledTimes(1);
    expect(second.release).not.toHaveBeenCalled();
    unmount();
    expect(second.release).toHaveBeenCalledTimes(1);
  });

  it("RPI-02 remains bounded when intersection observation is unavailable", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { source, release } = createSource();
    const load = vi
      .fn<PublicationRasterImageLoadPort["load"]>()
      .mockResolvedValue({ status: "ready", source });
    const { container, unmount } = render(
      <SemanticRasterImageElement
        resourceId={RESOURCE_ID}
        loader={managedLoader(load)}
      />,
    );
    await waitFor(() => expect(container.querySelector("img")).not.toBeNull());
    expect(load).toHaveBeenCalledTimes(1);
    unmount();
    expect(release).toHaveBeenCalledTimes(1);
  });

  it("SAF-15 keeps decorative loading, ready and failed images unnamed and releases them", async () => {
    const pending = deferred<PublicationRasterImageLoadResult>();
    const visibility = controlledVisibility();
    const { source, release } = createSource();
    const { container, unmount } = render(
      <SemanticRasterImageElement
        resourceId={RESOURCE_ID}
        alternativeText={"" as SensitivePublicationText}
        loader={managedLoader(() => pending.promise)}
        observeVisibility={visibility.observe}
      />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    act(() => visibility.reveal());
    await act(async () => {
      pending.resolve({ status: "ready", source });
      await pending.promise;
    });
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    fireEvent.error(container.querySelector("img")!);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(release).toHaveBeenCalledTimes(1);
    unmount();
    expect(source.released).toBe(true);
    expect(visibility.disconnect).toHaveBeenCalledTimes(1);
  });

  it("SAF-15 keeps a decorative unavailable placeholder out of the accessibility tree", () => {
    render(
      <SemanticRasterImageElement
        resourceId={RESOURCE_ID}
        alternativeText={"" as SensitivePublicationText}
      />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("waits for visibility, renders a decoded local source, and releases it", async () => {
    const pending = deferred<PublicationRasterImageLoadResult>();
    const load = vi.fn<PublicationRasterImageLoadPort["load"]>(
      () => pending.promise,
    );
    const loader = managedLoader(load);
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
        loader={managedLoader(load)}
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
        loader={managedLoader(load)}
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
        loader={managedLoader(load)}
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
