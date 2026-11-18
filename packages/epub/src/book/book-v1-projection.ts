import { BookContractError, decodeBookV1 } from "@voxleaf/shared";
import type { BookV1 } from "@voxleaf/shared";

import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  PackageManifestItem,
  ParsedPackageDocument,
} from "../package/package-document.js";
import type {
  ParsedNavigationDocument,
  ParsedNavigationNode,
} from "../navigation/navigation-document.js";

const SHA256_BYTE_LENGTH = 32;
const ACTIVE_RESOURCE_PROPERTIES = new Set(["remote-resources", "scripted"]);

function fail(code: "internal-failure" | "malformed-package"): never {
  throw new EpubArchiveError(code);
}

function isSupportedLocalResource(item: PackageManifestItem): boolean {
  return (
    item.location.kind === "local" &&
    (item.kind === "content-document" || item.kind === "raster-image") &&
    !item.properties.some((property) =>
      ACTIVE_RESOURCE_PROPERTIES.has(property),
    )
  );
}

function toLowercaseHex(bytes: Uint8Array): string {
  let result = "";
  for (const byte of bytes) {
    result += byte.toString(16).padStart(2, "0");
  }
  return result;
}

async function computeSha256(exactEpubBytes: Uint8Array): Promise<string> {
  let digest: ArrayBuffer;
  try {
    digest = await globalThis.crypto.subtle.digest(
      "SHA-256",
      exactEpubBytes as Uint8Array<ArrayBuffer>,
    );
  } catch {
    return fail("internal-failure");
  }

  if (digest.byteLength !== SHA256_BYTE_LENGTH) {
    return fail("internal-failure");
  }

  return toLowercaseHex(new Uint8Array(digest));
}

function uniqueInOrder(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function projectNavigation(
  navigationDocument: ParsedNavigationDocument,
  packageDocument: ParsedPackageDocument,
): readonly { readonly label: string; readonly targetSpineItemId: string }[] {
  const navigation: {
    readonly label: string;
    readonly targetSpineItemId: string;
  }[] = [];

  function visit(nodes: readonly ParsedNavigationNode[]): void {
    for (const node of nodes) {
      const target = node.target;
      if (target?.kind === "spine") {
        const spineItem = packageDocument.spine[target.spineItemIndex];
        if (
          spineItem === undefined ||
          spineItem.index !== target.spineItemIndex ||
          spineItem.path !== target.path
        ) {
          return fail("malformed-package");
        }

        navigation.push({
          label: node.label,
          targetSpineItemId: `spine:${target.spineItemIndex}`,
        });
      }

      visit(node.children);
    }
  }

  visit(navigationDocument.roots);
  return navigation;
}

export async function projectBookV1(
  exactEpubBytes: Uint8Array,
  packageDocument: ParsedPackageDocument,
  navigationDocument: ParsedNavigationDocument,
): Promise<BookV1> {
  const identityValue = await computeSha256(exactEpubBytes);
  const localResources = packageDocument.manifest.filter(
    isSupportedLocalResource,
  );
  const occupiedPaths = new Set(
    localResources.flatMap(({ location }) =>
      location.kind === "local" ? [String(location.path)] : [],
    ),
  );
  // BookV1 paths join projection records. All reads still use the archive keys.
  const projectedPaths = new Map<string, string>();
  let aliasOrdinal = 0;
  const resources = localResources.map((item) => {
    if (item.location.kind !== "local") {
      return fail("internal-failure");
    }

    const archivePath = String(item.location.path);
    let path = archivePath;
    if (archivePath.includes("#")) {
      const previous = projectedPaths.get(archivePath);
      if (previous !== undefined) {
        path = previous;
      } else {
        do {
          path = `voxleaf-resource/${aliasOrdinal++}`;
        } while (occupiedPaths.has(path));
        occupiedPaths.add(path);
        projectedPaths.set(archivePath, path);
      }
    }
    return {
      path,
      mediaType: item.mediaType,
      role:
        item.kind === "content-document"
          ? ("content-document" as const)
          : ("image" as const),
    };
  });
  const spine = packageDocument.spine.map((item) => ({
    id: `spine:${item.index}`,
    index: item.index,
    resourcePath: projectedPaths.get(item.path) ?? String(item.path),
  }));
  const navigation = projectNavigation(navigationDocument, packageDocument);

  try {
    return decodeBookV1({
      schemaVersion: 1,
      identity: {
        scheme: "sha256",
        schemeVersion: 1,
        value: identityValue,
      },
      metadata: {
        title: packageDocument.metadata.titles[0],
        authors: uniqueInOrder(packageDocument.metadata.creators),
      },
      resources,
      spine,
      navigation,
    });
  } catch (error: unknown) {
    if (error instanceof BookContractError) {
      return fail("malformed-package");
    }

    return fail("internal-failure");
  }
}
