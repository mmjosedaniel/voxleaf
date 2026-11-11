import type {
  RasterImageResourceId,
  SemanticTextDirection,
  SensitivePublicationText,
} from "@voxleaf/epub";
import { useEffect, useRef, useState, type ReactElement } from "react";

import type {
  PublicationRasterImageLoadPort,
  PublicationRasterImageOccurrence,
  RasterImageVisibility,
} from "./publication-raster-image-loader";
import type { RasterImageSource } from "./raster-image-source";

export type ObserveRasterImageVisibility = (
  element: HTMLElement,
  onVisibility: (visibility: RasterImageVisibility) => void,
) => () => void;

type RasterImagePresentation =
  | Readonly<{ status: "loading" | "unavailable" }>
  | Readonly<{ status: "ready"; source: RasterImageSource }>;

const DEFAULT_IMAGE_LABEL = "Publication image";
const VISIBILITY_ROOT_MARGIN = "256px 0px";

const observeRasterImageVisibility: ObserveRasterImageVisibility = (
  element,
  onVisibility,
) => {
  let active = true;
  let near = false;
  let visible = false;
  let fallbackMode = false;
  const observers: IntersectionObserver[] = [];
  const root = element.closest('[data-reader-scroll-owner="true"]');
  const fallback = (): void => {
    fallbackMode = true;
    for (const observer of observers) observer.disconnect();
    queueMicrotask(() => {
      if (active) onVisibility("visible");
    });
  };
  try {
    if (typeof IntersectionObserver === "undefined") fallback();
    else {
      for (const margin of [false, true]) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (!active || fallbackMode) return;
            const entry = entries.find(
              (candidate) => candidate.target === element,
            );
            if (entry === undefined) return;
            const intersects =
              entry.isIntersecting || entry.intersectionRatio > 0;
            if (margin) near = intersects;
            else visible = intersects;
            onVisibility(visible ? "visible" : near ? "near" : "outside");
          },
          { root, rootMargin: margin ? VISIBILITY_ROOT_MARGIN : "0px" },
        );
        observers.push(observer);
        observer.observe(element);
      }
    }
  } catch {
    fallback();
  }
  return () => {
    active = false;
    for (const observer of observers) observer.disconnect();
  };
};

export interface SemanticRasterImageElementProps {
  readonly resourceId: RasterImageResourceId;
  readonly alternativeText?: SensitivePublicationText | undefined;
  readonly loader?: PublicationRasterImageLoadPort | undefined;
  readonly observeVisibility?: ObserveRasterImageVisibility | undefined;
  readonly language?: string | undefined;
  readonly direction?: SemanticTextDirection | undefined;
}

interface ImageState {
  readonly resourceId: RasterImageResourceId;
  readonly loader: PublicationRasterImageLoadPort;
  readonly presentation: RasterImagePresentation;
  readonly dimensions: readonly [number, number] | undefined;
}

export function SemanticRasterImageElement({
  resourceId,
  alternativeText,
  loader,
  observeVisibility = observeRasterImageVisibility,
  language,
  direction,
}: SemanticRasterImageElementProps): ReactElement {
  const hostRef = useRef<HTMLSpanElement | null>(null);
  const occurrenceRef = useRef<PublicationRasterImageOccurrence | undefined>(
    undefined,
  );
  const [state, setState] = useState<ImageState | undefined>(undefined);
  const current =
    state?.resourceId === resourceId && state.loader === loader
      ? state
      : undefined;
  const presentation: RasterImagePresentation = current?.presentation ?? {
    status: loader === undefined ? "unavailable" : "loading",
  };
  const label = alternativeText ?? DEFAULT_IMAGE_LABEL;
  const decorative = alternativeText === "";

  useEffect(() => {
    const host = hostRef.current;
    if (loader === undefined || host === null) return;
    const occurrence = loader.watch(resourceId, (result) => {
      setState((previous) => ({
        resourceId,
        loader,
        presentation:
          result.status === "ready"
            ? result
            : {
                status:
                  result.status === "unavailable" ||
                  result.status === "cancelled"
                    ? "unavailable"
                    : "loading",
              },
        dimensions:
          result.status === "ready"
            ? [result.source.widthPixels, result.source.heightPixels]
            : previous?.resourceId === resourceId && previous.loader === loader
              ? previous.dimensions
              : undefined,
      }));
    });
    occurrenceRef.current = occurrence;
    const stopObserving = observeVisibility(host, (visibility) =>
      occurrence.setVisibility(visibility),
    );
    return () => {
      occurrenceRef.current = undefined;
      stopObserving();
      occurrence.close();
    };
  }, [loader, observeVisibility, resourceId]);

  const dimensions = current?.dimensions;
  const unavailable = presentation.status === "unavailable";
  return (
    <span
      ref={hostRef}
      className={`semantic-raster-host${dimensions === undefined ? "" : " semantic-raster-reserved"}`}
      style={
        dimensions === undefined
          ? undefined
          : {
              width: dimensions[0],
              aspectRatio: `${dimensions[0]} / ${dimensions[1]}`,
            }
      }
    >
      {presentation.status === "ready" ? (
        <img
          className="semantic-raster-image"
          src={presentation.source.objectUrl}
          width={presentation.source.widthPixels}
          height={presentation.source.heightPixels}
          alt={label}
          lang={language}
          dir={direction}
          decoding="async"
          onError={() => occurrenceRef.current?.fail(presentation.source)}
        />
      ) : (
        <span
          className={`semantic-raster-placeholder${unavailable ? " semantic-raster-unavailable" : ""}`}
          role={decorative ? undefined : "img"}
          aria-hidden={decorative ? true : undefined}
          aria-label={
            decorative
              ? undefined
              : `${label}. Image ${unavailable ? "unavailable" : "loading"}.`
          }
          lang={language}
          dir={direction}
        >
          <span aria-hidden="true">
            {unavailable ? "Image unavailable" : "Loading image"}
          </span>
        </span>
      )}
    </span>
  );
}
