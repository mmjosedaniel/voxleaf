import { EpubArchiveError } from "../archive/archive-error.js";
import { openEpubArchive } from "../archive/archive-inventory.js";
import type { OpenedEpubArchive } from "../archive/archive-inventory.js";
import { projectBookV1 } from "../book/book-v1-projection.js";
import { resolveContainerPackage } from "../container/container-resolver.js";
import type {
  ContentDocumentId,
  PublicationNavigationNode,
  SensitivePublicationText,
  SourceFragment,
} from "../document/document-model.js";
import {
  contentDocumentIdForManifestIndex,
  isSupportedContentDocument,
  projectXhtmlDocumentProjection,
} from "../document/xhtml-projector.js";
import type { XhtmlDocumentProjection } from "../document/xhtml-projector.js";
import { createPublicationLocatorIndex } from "../locator/locator-index.js";
import { parseNavigationDocument } from "../navigation/navigation-document.js";
import type {
  ParsedNavigationDocument,
  ParsedNavigationNode,
} from "../navigation/navigation-document.js";
import { parsePackageDocument } from "../package/package-document.js";
import type { ParsedPackageDocument } from "../package/package-document.js";
import { createOpenedPublication } from "../resource/opened-publication.js";
import {
  epubOpenSuccess,
  mapEpubFailure,
  type OpenEpubPublicationOptions,
  type OpenEpubPublicationResult,
} from "./epub-result.js";

function failInternal(): never {
  throw new EpubArchiveError("internal-failure");
}

function projectNavigation(
  navigation: ParsedNavigationDocument,
  documentsByPath: ReadonlyMap<string, ContentDocumentId>,
): readonly PublicationNavigationNode[] {
  function projectNode(node: ParsedNavigationNode): PublicationNavigationNode {
    const children = Object.freeze(node.children.map(projectNode));
    const label = node.label as SensitivePublicationText;
    if (node.target === undefined) {
      if (children.length === 0) {
        return failInternal();
      }
      return Object.freeze({
        kind: "group",
        label,
        children: children as readonly [
          PublicationNavigationNode,
          ...PublicationNavigationNode[],
        ],
      });
    }

    const documentId = documentsByPath.get(String(node.target.path));
    if (documentId === undefined) {
      return failInternal();
    }
    const target = Object.freeze({
      documentId,
      ...(node.target.fragment === undefined
        ? {}
        : { fragment: node.target.fragment as SourceFragment }),
    });
    return Object.freeze({ kind: "link", label, target, children });
  }

  return Object.freeze(navigation.roots.map(projectNode));
}

async function projectDocuments(
  archive: OpenedEpubArchive,
  packageDocument: ParsedPackageDocument,
): Promise<readonly XhtmlDocumentProjection[]> {
  const projections: XhtmlDocumentProjection[] = [];
  for (const item of packageDocument.manifest) {
    archive.budget.checkpoint();
    if (isSupportedContentDocument(item) && item.location.kind === "local") {
      projections.push(
        await projectXhtmlDocumentProjection(
          archive,
          packageDocument,
          item.location.path,
        ),
      );
    }
  }
  return Object.freeze(projections);
}

/**
 * Opens untrusted local EPUB bytes through the complete bounded ingestion
 * pipeline. Expected failures are returned as content-free values and never
 * expose raw exceptions.
 */
export async function openEpubPublication(
  bytes: Uint8Array,
  options: OpenEpubPublicationOptions = {},
): Promise<OpenEpubPublicationResult> {
  let archive: OpenedEpubArchive | undefined;
  try {
    if (!(bytes instanceof Uint8Array)) {
      throw new EpubArchiveError("invalid-container");
    }

    archive = await openEpubArchive(bytes, {
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    });
    const resolvedPackage = await resolveContainerPackage(archive);
    const packageDocument = parsePackageDocument(archive, resolvedPackage);
    const parsedNavigation = await parseNavigationDocument(
      archive,
      packageDocument,
    );
    const book = await projectBookV1(bytes, packageDocument, parsedNavigation);
    const projections = await projectDocuments(archive, packageDocument);
    const locatorIndex = createPublicationLocatorIndex(
      book,
      projections,
      archive.budget,
    );
    const documentsByPath = new Map<string, ContentDocumentId>();
    for (const [index, item] of packageDocument.manifest.entries()) {
      archive.budget.checkpoint();
      if (isSupportedContentDocument(item) && item.location.kind === "local") {
        documentsByPath.set(
          String(item.location.path),
          contentDocumentIdForManifestIndex(index),
        );
      }
    }
    const publication = createOpenedPublication(archive, packageDocument, {
      book,
      documents: Object.freeze(
        projections.map((projection) => projection.document),
      ),
      navigation: projectNavigation(parsedNavigation, documentsByPath),
      locatorIndex,
    });
    archive = undefined;
    return epubOpenSuccess(publication);
  } catch (error: unknown) {
    await archive?.close().catch(() => undefined);
    return mapEpubFailure(error);
  }
}
