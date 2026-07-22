import { EpubArchiveError } from "../archive/archive-error.js";
import type { EpubArchiveErrorCode } from "../archive/archive-error.js";
import type { OpenedEpubArchive } from "../archive/archive-inventory.js";
import { parseArchiveEntryPath } from "../paths/archive-path.js";
import type { ArchiveFilePath } from "../paths/archive-path.js";
import {
  parseOcfReference,
  resolveOcfReference,
} from "../paths/ocf-reference.js";
import { EpubPathError } from "../paths/path-error.js";
import type { EpubIngestionPolicy } from "../security/ingestion-policy.js";
import { createXmlEventReader } from "../xml/xml-event-reader.js";
import type {
  XmlEvent,
  XmlExpandedName,
  XmlStartElementEvent,
} from "../xml/xml-event-reader.js";

const CONTAINER_NAMESPACE = "urn:oasis:names:tc:opendocument:xmlns:container";
const CONTAINER_PATH = parseArchiveEntryPath("META-INF/container.xml", "file");
const ARCHIVE_ROOT_BASE_PATH = parseArchiveEntryPath("root", "file");
const OPF_NAMESPACE = "http://www.idpf.org/2007/opf";
const PACKAGE_MEDIA_TYPE = "application/oebps-package+xml";
const SUPPORTED_PACKAGE_VERSION = "3.0";
const RENDITION_LAYOUT_PROPERTY = "rendition:layout";
const REFLOWED_LAYOUT = "reflowable";
const FIXED_LAYOUT = "pre-paginated";

interface ContainerRootfile {
  readonly path: ArchiveFilePath;
  readonly mediaType: string;
}

interface PackageProfile {
  readonly version: string;
  readonly renditionLayout: string | undefined;
}

export interface ResolvedPackageDocument {
  readonly path: ArchiveFilePath;
  readonly bytes: Uint8Array;
  readonly version: "3.0";
  readonly renditionLayout: "reflowable";
}

function fail(code: EpubArchiveErrorCode): never {
  throw new EpubArchiveError(code);
}

function namesEqual(
  left: XmlExpandedName | undefined,
  namespaceUri: string,
  localName: string,
): boolean {
  return left?.namespaceUri === namespaceUri && left.localName === localName;
}

function unqualifiedAttribute(
  event: XmlStartElementEvent,
  localName: string,
): string | undefined {
  return event.attributes.find(
    (attribute) =>
      attribute.namespaceUri === "" && attribute.localName === localName,
  )?.value;
}

function resolveRootfilePath(
  value: string,
  policy: EpubIngestionPolicy,
): ArchiveFilePath {
  try {
    const reference = parseOcfReference(value, policy);
    if (
      reference.relativePath.length === 0 ||
      reference.fragment !== undefined
    ) {
      return fail("broken-reference");
    }

    return resolveOcfReference(ARCHIVE_ROOT_BASE_PATH, reference, policy).path;
  } catch (error: unknown) {
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
}

class ContainerDocumentParser {
  readonly #policy: EpubIngestionPolicy;
  readonly #stack: XmlExpandedName[] = [];
  readonly #rootfiles: ContainerRootfile[] = [];
  #ignoredDepth: number | undefined;
  #sawContainer = false;
  #sawRootfiles = false;

  public constructor(policy: EpubIngestionPolicy) {
    this.#policy = policy;
  }

  public consume(event: XmlEvent): void {
    switch (event.type) {
      case "start-element":
        this.consumeStartElement(event);
        return;
      case "end-element":
        this.consumeEndElement();
        return;
      case "text":
        if (this.#ignoredDepth === undefined && event.text.trim().length > 0) {
          return fail("invalid-container");
        }
        return;
    }
  }

  public complete(): readonly ContainerRootfile[] {
    if (
      this.#stack.length !== 0 ||
      !this.#sawContainer ||
      !this.#sawRootfiles ||
      this.#rootfiles.length === 0
    ) {
      return fail("invalid-container");
    }

    return Object.freeze([...this.#rootfiles]);
  }

  private consumeStartElement(event: XmlStartElementEvent): void {
    const depth = this.#stack.length + 1;
    const parent = this.#stack.at(-1);

    if (this.#ignoredDepth !== undefined) {
      this.#stack.push(event.name);
      return;
    }

    if (depth === 1) {
      if (
        this.#sawContainer ||
        !namesEqual(event.name, CONTAINER_NAMESPACE, "container") ||
        unqualifiedAttribute(event, "version") !== "1.0"
      ) {
        return fail("invalid-container");
      }

      this.#sawContainer = true;
    } else if (
      depth === 2 &&
      namesEqual(parent, CONTAINER_NAMESPACE, "container")
    ) {
      if (namesEqual(event.name, CONTAINER_NAMESPACE, "rootfiles")) {
        if (this.#sawRootfiles) {
          return fail("invalid-container");
        }

        this.#sawRootfiles = true;
      } else if (
        namesEqual(event.name, CONTAINER_NAMESPACE, "links") ||
        event.name.namespaceUri !== CONTAINER_NAMESPACE
      ) {
        this.#ignoredDepth = depth;
      } else {
        return fail("invalid-container");
      }
    } else if (
      depth === 3 &&
      namesEqual(parent, CONTAINER_NAMESPACE, "rootfiles")
    ) {
      if (namesEqual(event.name, CONTAINER_NAMESPACE, "rootfile")) {
        const fullPath = unqualifiedAttribute(event, "full-path");
        const mediaType = unqualifiedAttribute(event, "media-type");
        if (fullPath === undefined || mediaType === undefined) {
          return fail("invalid-container");
        }

        this.#rootfiles.push(
          Object.freeze({
            path: resolveRootfilePath(fullPath, this.#policy),
            mediaType,
          }),
        );
      } else if (event.name.namespaceUri !== CONTAINER_NAMESPACE) {
        this.#ignoredDepth = depth;
      } else {
        return fail("invalid-container");
      }
    } else {
      return fail("invalid-container");
    }

    this.#stack.push(event.name);
  }

  private consumeEndElement(): void {
    const depth = this.#stack.length;
    if (depth === 0) {
      return fail("invalid-container");
    }

    this.#stack.pop();
    if (this.#ignoredDepth === depth) {
      this.#ignoredDepth = undefined;
    }
  }
}

class PackageProfileParser {
  readonly #stack: XmlExpandedName[] = [];
  #version: string | undefined;
  #layoutDepth: number | undefined;
  #layoutText = "";
  #renditionLayout: string | undefined;
  #sawPackage = false;

  public consume(event: XmlEvent): void {
    switch (event.type) {
      case "start-element":
        this.consumeStartElement(event);
        return;
      case "end-element":
        this.consumeEndElement();
        return;
      case "text":
        if (this.#layoutDepth !== undefined) {
          this.#layoutText += event.text;
        }
        return;
    }
  }

  public complete(): PackageProfile {
    if (
      this.#stack.length !== 0 ||
      !this.#sawPackage ||
      this.#version === undefined
    ) {
      return fail("malformed-package");
    }

    return Object.freeze({
      version: this.#version,
      renditionLayout: this.#renditionLayout,
    });
  }

  private consumeStartElement(event: XmlStartElementEvent): void {
    const depth = this.#stack.length + 1;
    const parent = this.#stack.at(-1);
    const grandparent = this.#stack.at(-2);

    if (this.#layoutDepth !== undefined) {
      return fail("malformed-package");
    }

    if (depth === 1) {
      if (
        this.#sawPackage ||
        !namesEqual(event.name, OPF_NAMESPACE, "package")
      ) {
        return fail("malformed-package");
      }

      const version = unqualifiedAttribute(event, "version");
      if (version === undefined || version.length === 0) {
        return fail("malformed-package");
      }

      this.#sawPackage = true;
      this.#version = version;
    } else if (
      depth === 3 &&
      namesEqual(grandparent, OPF_NAMESPACE, "package") &&
      namesEqual(parent, OPF_NAMESPACE, "metadata") &&
      namesEqual(event.name, OPF_NAMESPACE, "meta") &&
      unqualifiedAttribute(event, "property") === RENDITION_LAYOUT_PROPERTY &&
      unqualifiedAttribute(event, "refines") === undefined
    ) {
      if (this.#renditionLayout !== undefined) {
        return fail("malformed-package");
      }

      this.#layoutDepth = depth;
      this.#layoutText = "";
    }

    this.#stack.push(event.name);
  }

  private consumeEndElement(): void {
    const depth = this.#stack.length;
    if (depth === 0) {
      return fail("malformed-package");
    }

    if (this.#layoutDepth === depth) {
      const value = this.#layoutText.trim();
      if (value.length === 0) {
        return fail("malformed-package");
      }

      this.#renditionLayout = value;
      this.#layoutDepth = undefined;
      this.#layoutText = "";
    }

    this.#stack.pop();
  }
}

function hasFile(archive: OpenedEpubArchive, path: ArchiveFilePath): boolean {
  for (const entry of archive.inventory.entries) {
    archive.budget.checkpoint();
    if (entry.kind === "file" && entry.path === path) {
      return true;
    }
  }

  return false;
}

async function readContainerRootfiles(
  archive: OpenedEpubArchive,
): Promise<readonly ContainerRootfile[]> {
  if (!hasFile(archive, CONTAINER_PATH)) {
    return fail("invalid-container");
  }

  const bytes = await archive.readEntry(CONTAINER_PATH, {
    maximumBytes: archive.budget.policy.maxContainerOrPackageDocumentBytes,
  });
  const parser = new ContainerDocumentParser(archive.budget.policy);
  createXmlEventReader(archive.budget).read(
    bytes,
    "container-or-package",
    (event) => parser.consume(event),
  );
  return parser.complete();
}

function inspectPackageProfile(
  archive: OpenedEpubArchive,
  bytes: Uint8Array,
): PackageProfile {
  const parser = new PackageProfileParser();
  createXmlEventReader(archive.budget).read(
    bytes,
    "container-or-package",
    (event) => parser.consume(event),
  );
  return parser.complete();
}

export async function resolveContainerPackage(
  archive: OpenedEpubArchive,
): Promise<ResolvedPackageDocument> {
  const rootfiles = await readContainerRootfiles(archive);
  let firstUnsupportedReason:
    "unsupported-layout" | "unsupported-version" | undefined;

  for (const rootfile of rootfiles) {
    archive.budget.checkpoint();
    if (rootfile.mediaType !== PACKAGE_MEDIA_TYPE) {
      continue;
    }

    if (!hasFile(archive, rootfile.path)) {
      return fail("broken-reference");
    }

    const bytes = await archive.readEntry(rootfile.path, {
      maximumBytes: archive.budget.policy.maxContainerOrPackageDocumentBytes,
    });
    const profile = inspectPackageProfile(archive, bytes);

    if (profile.version !== SUPPORTED_PACKAGE_VERSION) {
      firstUnsupportedReason ??= "unsupported-version";
      continue;
    }

    const layout = profile.renditionLayout ?? REFLOWED_LAYOUT;
    if (layout === FIXED_LAYOUT) {
      firstUnsupportedReason ??= "unsupported-layout";
      continue;
    }

    if (layout !== REFLOWED_LAYOUT) {
      return fail("malformed-package");
    }

    return Object.freeze({
      path: rootfile.path,
      bytes,
      version: SUPPORTED_PACKAGE_VERSION,
      renditionLayout: REFLOWED_LAYOUT,
    });
  }

  return fail(firstUnsupportedReason ?? "unsupported-resource");
}
