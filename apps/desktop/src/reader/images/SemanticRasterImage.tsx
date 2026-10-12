import type {
  RasterImageResourceId,
  SemanticTextDirection,
  SensitivePublicationText,
} from "@voxleaf/epub";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";

import type {
  PublicationRasterImageLoadPort,
  PublicationRasterImageLoadResult,
} from "./publication-raster-image-loader";
import type { RasterImageSource } from "./raster-image-source";

export type ObserveRasterImageVisibility = (
  element: HTMLElement,
  onVisible: () => void,
) => () => void;

type RasterImagePresentation =
  | Readonly<{ status: "loading" | "unavailable" }>
  | Readonly<{ status: "ready"; source: RasterImageSource }>;

const FIXED_LOADING_PRESENTATION: RasterImagePresentation = Object.freeze({
  status: "loading",
});
const FIXED_UNAVAILABLE_PRESENTATION: RasterImagePresentation = Object.freeze({
  status: "unavailable",
});
const DEFAULT_IMAGE_LABEL = "Publication image";
const VISIBILITY_ROOT_MARGIN = "256px 0px";

const observeRasterImageVisibility: ObserveRasterImageVisibility = (
  element,
  onVisible,
) => {
  if (typeof IntersectionObserver === "undefined") {
    let active = true;
    queueMicrotask(() => {
      if (active) {
        onVisible();
      }
    });
    return () => {
      active = false;
    };
  }

  let settled = false;
  let observer: IntersectionObserver | undefined;
  const markVisible = (): void => {
    if (settled) {
      return;
    }
    settled = true;
    observer?.disconnect();
    onVisible();
  };

  try {
    observer = new IntersectionObserver(
      (entries) => {
        if (
          entries.some(
            (entry) => entry.isIntersecting || entry.intersectionRatio > 0,
          )
        ) {
          markVisible();
        }
      },
      { rootMargin: VISIBILITY_ROOT_MARGIN },
    );
    observer.observe(element);
  } catch {
    queueMicrotask(markVisible);
  }

  return () => {
    settled = true;
    observer?.disconnect();
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

function presentationFor(
  result: PublicationRasterImageLoadResult,
): RasterImagePresentation {
  return result.status === "ready"
    ? Object.freeze({ status: "ready", source: result.source })
    : FIXED_UNAVAILABLE_PRESENTATION;
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
  const [visible, setVisible] = useState(false);
  const [presentation, setPresentation] = useState<RasterImagePresentation>(
    loader === undefined
      ? FIXED_UNAVAILABLE_PRESENTATION
      : FIXED_LOADING_PRESENTATION,
  );
  const label = alternativeText ?? DEFAULT_IMAGE_LABEL;

  useEffect(() => {
    if (loader === undefined) {
      return;
    }

    const host = hostRef.current;
    if (host === null) {
      return;
    }
    return observeVisibility(host, () => setVisible(true));
  }, [loader, observeVisibility, resourceId]);

  useEffect(() => {
    if (!visible || loader === undefined) {
      return;
    }

    const controller = new AbortController();
    let active = true;
    let ownedSource: RasterImageSource | undefined;

    void loader.load(resourceId, { signal: controller.signal }).then(
      (result) => {
        if (!active) {
          if (result.status === "ready") {
            result.source.release();
          }
          return;
        }
        if (result.status === "ready") {
          ownedSource = result.source;
        }
        setPresentation(presentationFor(result));
      },
      () => {
        if (active) {
          setPresentation(FIXED_UNAVAILABLE_PRESENTATION);
        }
      },
    );

    return () => {
      active = false;
      controller.abort();
      ownedSource?.release();
    };
  }, [loader, resourceId, visible]);

  const handleImageError = useCallback(() => {
    if (presentation.status === "ready") {
      presentation.source.release();
      setPresentation(FIXED_UNAVAILABLE_PRESENTATION);
    }
  }, [presentation]);

  if (presentation.status === "ready") {
    return (
      <span ref={hostRef} className="semantic-raster-host">
        <img
          className="semantic-raster-image"
          src={presentation.source.objectUrl}
          width={presentation.source.widthPixels}
          height={presentation.source.heightPixels}
          alt={label}
          lang={language}
          dir={direction}
          decoding="async"
          onError={handleImageError}
        />
      </span>
    );
  }

  const unavailable = presentation.status === "unavailable";
  return (
    <span ref={hostRef} className="semantic-raster-host">
      <span
        className={`semantic-raster-placeholder${
          unavailable ? " semantic-raster-unavailable" : ""
        }`}
        role="img"
        aria-label={`${label}. Image ${
          unavailable ? "unavailable" : "loading"
        }.`}
        lang={language}
        dir={direction}
      >
        <span aria-hidden="true">
          {unavailable ? "Image unavailable" : "Loading image"}
        </span>
      </span>
    </span>
  );
}
