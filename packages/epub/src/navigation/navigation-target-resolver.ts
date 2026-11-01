import { EpubArchiveError } from "../archive/archive-error.js";
import type { OpenedEpubArchive } from "../archive/archive-inventory.js";
import {
  createContentReferenceResolver,
  type ParsedPackageDocument,
} from "../package/package-document.js";
import type { ArchiveFilePath } from "../paths/archive-path.js";
import {
  parseOcfReference,
  resolveOcfReference,
} from "../paths/ocf-reference.js";
import { EpubPathError } from "../paths/path-error.js";

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
  readonly #resolveContent: ReturnType<typeof createContentReferenceResolver>;

  public constructor(
    archive: OpenedEpubArchive,
    packageDocument: ParsedPackageDocument,
  ) {
    this.#archive = archive;
    this.#packageDocument = packageDocument;

    this.#resolveContent = createContentReferenceResolver(
      archive,
      packageDocument,
    );
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
      const target = this.#resolveContent(resolved.path);
      const spineItemIndex = target.spineItemIndex;
      if (spineItemIndex === undefined) {
        return Object.freeze({
          kind: "non-spine",
          path: target.path,
          ...(resolved.fragment === undefined
            ? {}
            : { fragment: resolved.fragment }),
        });
      }

      return Object.freeze({
        kind: "spine",
        path: target.path,
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
