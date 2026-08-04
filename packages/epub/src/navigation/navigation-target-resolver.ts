import { EpubArchiveError } from "../archive/archive-error.js";
import type { OpenedEpubArchive } from "../archive/archive-inventory.js";
import type {
  PackageManifestItem,
  ParsedPackageDocument,
} from "../package/package-document.js";
import type { ArchiveFilePath } from "../paths/archive-path.js";
import {
  parseOcfReference,
  resolveOcfReference,
} from "../paths/ocf-reference.js";
import { EpubPathError } from "../paths/path-error.js";

const XHTML_MEDIA_TYPE = "application/xhtml+xml";
const ACTIVE_RESOURCE_PROPERTIES = new Set(["remote-resources", "scripted"]);

export interface SpineNavigationTarget {
  readonly kind: "spine";
  readonly path: ArchiveFilePath;
  readonly spineItemIndex: number;
  readonly fragment?: string;
}

export interface NonSpineNavigationTarget {
  readonly kind: "non-spine";
  readonly path: ArchiveFilePath;
  readonly fragment?: string;
}

export type ParsedNavigationTarget =
  NonSpineNavigationTarget | SpineNavigationTarget;

function fail(code: "broken-reference" | "resource-limit-exceeded"): never {
  throw new EpubArchiveError(code);
}

function isSupportedContentDocument(item: PackageManifestItem): boolean {
  return (
    item.location.kind === "local" &&
    item.kind === "content-document" &&
    item.mediaType === XHTML_MEDIA_TYPE &&
    !item.properties.some((property) =>
      ACTIVE_RESOURCE_PROPERTIES.has(property),
    )
  );
}

function mapReferenceError(error: unknown): never {
  if (error instanceof EpubArchiveError) {
    throw error;
  }

  if (
    error instanceof EpubPathError &&
    error.code === "resource-limit-exceeded"
  ) {
    return fail("resource-limit-exceeded");
  }

  return fail("broken-reference");
}

export class NavigationTargetResolver {
  readonly #archive: OpenedEpubArchive;
  readonly #packageDocument: ParsedPackageDocument;
  readonly #supportedDocumentPaths = new Set<string>();
  readonly #firstSpineIndexByPath = new Map<string, number>();

  public constructor(
    archive: OpenedEpubArchive,
    packageDocument: ParsedPackageDocument,
  ) {
    this.#archive = archive;
    this.#packageDocument = packageDocument;

    for (const item of packageDocument.manifest) {
      archive.budget.checkpoint();
      if (isSupportedContentDocument(item) && item.location.kind === "local") {
        this.#supportedDocumentPaths.add(String(item.location.path));
      }
    }

    for (const item of packageDocument.spine) {
      archive.budget.checkpoint();
      const path = String(item.path);
      if (!this.#firstSpineIndexByPath.has(path)) {
        this.#firstSpineIndexByPath.set(path, item.index);
      }
    }
  }

  public resolve(href: string): ParsedNavigationTarget {
    this.#archive.budget.checkpoint();
    if (href !== href.trim() || /^[a-z][a-z0-9+.-]*:/iu.test(href)) {
      return fail("broken-reference");
    }

    try {
      const resolved = resolveOcfReference(
        this.#packageDocument.navigation.path,
        parseOcfReference(href, this.#archive.budget.policy),
        this.#archive.budget.policy,
      );
      const pathText = String(resolved.path);
      if (!this.#supportedDocumentPaths.has(pathText)) {
        return fail("broken-reference");
      }

      const spineItemIndex = this.#firstSpineIndexByPath.get(pathText);
      if (spineItemIndex === undefined) {
        return Object.freeze({
          kind: "non-spine",
          path: resolved.path,
          ...(resolved.fragment === undefined
            ? {}
            : { fragment: resolved.fragment }),
        });
      }

      return Object.freeze({
        kind: "spine",
        path: resolved.path,
        spineItemIndex,
        ...(resolved.fragment === undefined
          ? {}
          : { fragment: resolved.fragment }),
      });
    } catch (error: unknown) {
      return mapReferenceError(error);
    }
  }
}
