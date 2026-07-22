import { EpubArchiveError } from "../archive/archive-error.js";
import type { OpenedEpubArchive } from "../archive/archive-inventory.js";
import type {
  PackageManifestItem,
  ParsedPackageDocument,
} from "../package/package-document.js";
import type { ArchiveFilePath } from "../paths/archive-path.js";
import type {
  RasterImageMediaType,
  RasterImageResource,
  RasterImageResourceId,
} from "../document/document-model.js";

const ACTIVE_RESOURCE_PROPERTIES = new Set(["remote-resources", "scripted"]);

export interface RasterImageResourceBinding {
  readonly descriptor: RasterImageResource;
  readonly path: ArchiveFilePath;
}

function fail(
  code: "internal-failure" | "malformed-package" | "resource-limit-exceeded",
): never {
  throw new EpubArchiveError(code);
}

function mediaTypeFor(item: PackageManifestItem): RasterImageMediaType {
  if (item.mediaType !== item.mediaTypeEssence) {
    return fail("malformed-package");
  }

  switch (item.mediaTypeEssence) {
    case "image/gif":
    case "image/jpeg":
    case "image/png":
    case "image/webp":
      return item.mediaTypeEssence;
    default:
      return fail("malformed-package");
  }
}

export function rasterImageResourceIdForManifestItem(
  item: PackageManifestItem,
  manifestIndex: number,
): RasterImageResourceId | undefined {
  if (
    item.location.kind !== "local" ||
    item.kind !== "raster-image" ||
    item.properties.some((property) => ACTIVE_RESOURCE_PROPERTIES.has(property))
  ) {
    return undefined;
  }

  if (!Number.isSafeInteger(manifestIndex) || manifestIndex < 0) {
    return fail("internal-failure");
  }

  return `resource:${String(manifestIndex)}` as RasterImageResourceId;
}

export function createRasterImageResourceCatalog(
  archive: OpenedEpubArchive,
  packageDocument: ParsedPackageDocument,
): readonly RasterImageResourceBinding[] {
  const inventoryByPath = new Map(
    archive.inventory.entries.map((entry) => [String(entry.path), entry]),
  );
  const bindings: RasterImageResourceBinding[] = [];

  for (const [manifestIndex, item] of packageDocument.manifest.entries()) {
    archive.budget.checkpoint();
    const id = rasterImageResourceIdForManifestItem(item, manifestIndex);
    if (id === undefined) {
      continue;
    }

    if (item.location.kind !== "local") {
      return fail("internal-failure");
    }

    const inventoryEntry = inventoryByPath.get(String(item.location.path));
    if (inventoryEntry?.kind !== "file") {
      return fail("malformed-package");
    }
    if (
      inventoryEntry.uncompressedSize >
      archive.budget.policy.maxRasterImageBytes
    ) {
      return fail("resource-limit-exceeded");
    }

    bindings.push(
      Object.freeze({
        descriptor: Object.freeze({
          id,
          kind: "raster-image",
          mediaType: mediaTypeFor(item),
        }),
        path: item.location.path,
      }),
    );
  }

  return Object.freeze(bindings);
}
