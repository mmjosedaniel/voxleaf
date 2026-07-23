import { EpubArchiveError } from "../archive/archive-error.js";
import type { EpubArchiveErrorCode } from "../archive/archive-error.js";
import type { OpenedEpubArchive } from "../archive/archive-inventory.js";
import type { ResolvedPackageDocument } from "../container/container-resolver.js";
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

const OPF_NAMESPACE = "http://www.idpf.org/2007/opf";
const DUBLIN_CORE_NAMESPACE = "http://purl.org/dc/elements/1.1/";
const SUPPORTED_VERSION = "3.0";
const XHTML_MEDIA_TYPE = "application/xhtml+xml";
const SMIL_MEDIA_TYPE = "application/smil+xml";
const RASTER_IMAGE_MEDIA_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const ACTIVE_RESOURCE_PROPERTIES = new Set(["remote-resources", "scripted"]);
const REFLOWED_LAYOUT = "reflowable";
const FIXED_LAYOUT = "pre-paginated";
const MODIFIED_PROPERTY = "dcterms:modified";
const LAYOUT_PROPERTY = "rendition:layout";
const ENCRYPTION_DOCUMENT_PATH = "META-INF/encryption.xml";
const ASCII_WHITESPACE = /[\t\n\f\r ]+/gu;
const IDREF_WHITESPACE = /[\t\n\f\r ]/u;
const MEDIA_TYPE_ESSENCE = /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/u;

export type PackageResourceKind = "content-document" | "other" | "raster-image";

export interface LocalPackageResourceLocation {
  readonly kind: "local";
  readonly path: ArchiveFilePath;
}

export interface ExternalPackageResourceLocation {
  readonly kind: "external";
}

export type PackageResourceLocation =
  ExternalPackageResourceLocation | LocalPackageResourceLocation;

export interface PackageMetadata {
  readonly uniqueIdentifier: string;
  readonly identifiers: readonly string[];
  readonly titles: readonly string[];
  readonly languages: readonly string[];
  readonly creators: readonly string[];
  readonly modified: string;
}

export interface PackageManifestItem {
  readonly id: string;
  readonly location: PackageResourceLocation;
  readonly mediaType: string;
  readonly mediaTypeEssence: string;
  readonly kind: PackageResourceKind;
  readonly properties: readonly string[];
  readonly fallbackId?: string;
  readonly mediaOverlayId?: string;
}

export interface PackageSpineItem {
  readonly index: number;
  readonly idref: string;
  readonly contentResourceId: string;
  readonly path: ArchiveFilePath;
  readonly linear: boolean;
  readonly properties: readonly string[];
}

export interface PackageNavigationItem {
  readonly resourceId: string;
  readonly path: ArchiveFilePath;
}

export interface ParsedPackageDocument {
  readonly path: ArchiveFilePath;
  readonly version: "3.0";
  readonly renditionLayout: "reflowable";
  readonly pageProgressionDirection: "default" | "ltr" | "rtl";
  readonly metadata: PackageMetadata;
  readonly manifest: readonly PackageManifestItem[];
  readonly spine: readonly PackageSpineItem[];
  readonly navigation: PackageNavigationItem;
}

interface ResolvedManifestLocation {
  readonly location: PackageResourceLocation;
  readonly uniquenessKey: string;
}

interface IdentifierValue {
  readonly id?: string;
  readonly value: string;
}

interface RawManifestItem extends PackageManifestItem {
  readonly location: PackageResourceLocation;
}

interface RawSpineItem {
  readonly idref: string;
  readonly linear: boolean;
  readonly properties: readonly string[];
}

type CapturedTextKind =
  | "creator"
  | "identifier"
  | "ignored"
  | "language"
  | "legacy"
  | "layout"
  | "modified"
  | "title";

interface CapturedText {
  readonly depth: number;
  readonly kind: CapturedTextKind;
  readonly id?: string;
  text: string;
}

interface RawPackageDocument {
  readonly uniqueIdentifierId: string;
  readonly identifiers: readonly IdentifierValue[];
  readonly titles: readonly string[];
  readonly languages: readonly string[];
  readonly creators: readonly string[];
  readonly modified: string;
  readonly renditionLayout: string | undefined;
  readonly manifest: readonly RawManifestItem[];
  readonly spine: readonly RawSpineItem[];
  readonly pageProgressionDirection: "default" | "ltr" | "rtl";
}

function fail(code: EpubArchiveErrorCode): never {
  throw new EpubArchiveError(code);
}

function namesEqual(
  name: XmlExpandedName | undefined,
  namespaceUri: string,
  localName: string,
): boolean {
  return name?.namespaceUri === namespaceUri && name.localName === localName;
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

function requiredAttribute(
  event: XmlStartElementEvent,
  localName: string,
): string {
  const value = unqualifiedAttribute(event, localName);
  if (value === undefined || value.length === 0) {
    return fail("malformed-package");
  }

  return value;
}

function validateIdReference(value: string): string {
  if (value.length === 0 || IDREF_WHITESPACE.test(value)) {
    return fail("malformed-package");
  }

  return value;
}

function normalizeMetadataText(value: string): string {
  const normalized = value.replace(ASCII_WHITESPACE, " ").trim();
  if (normalized.length === 0) {
    return fail("malformed-package");
  }

  return normalized;
}

function parseProperties(value: string | undefined): readonly string[] {
  if (value === undefined) {
    return Object.freeze([]);
  }

  const normalized = value.replace(ASCII_WHITESPACE, " ").trim();
  if (normalized.length === 0) {
    return fail("malformed-package");
  }

  const properties = normalized.split(" ");
  if (new Set(properties).size !== properties.length) {
    return fail("malformed-package");
  }

  return Object.freeze(properties);
}

function parseMediaType(value: string): {
  readonly mediaType: string;
  readonly essence: string;
} {
  if (value !== value.trim() || hasControlCharacter(value)) {
    return fail("malformed-package");
  }

  const mediaType = value.toLowerCase();
  const essence = mediaType.split(";", 1)[0];
  if (essence === undefined || !MEDIA_TYPE_ESSENCE.test(essence)) {
    return fail("malformed-package");
  }

  return Object.freeze({ mediaType, essence });
}

function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit <= 0x1f || codeUnit === 0x7f) {
      return true;
    }
  }

  return false;
}

function resourceKind(
  mediaType: string,
  mediaTypeEssence: string,
): PackageResourceKind {
  if (mediaType === XHTML_MEDIA_TYPE) {
    return "content-document";
  }

  if (
    mediaType === mediaTypeEssence &&
    RASTER_IMAGE_MEDIA_TYPES.has(mediaTypeEssence)
  ) {
    return "raster-image";
  }

  return "other";
}

function parsePageProgressionDirection(
  value: string | undefined,
): "default" | "ltr" | "rtl" {
  if (value === undefined || value === "default") {
    return "default";
  }

  if (value === "ltr" || value === "rtl") {
    return value;
  }

  return fail("malformed-package");
}

function parseLinearity(value: string | undefined): boolean {
  if (value === undefined || value === "yes") {
    return true;
  }

  if (value === "no") {
    return false;
  }

  return fail("malformed-package");
}

function isValidModifiedTimestamp(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/u.exec(
    value,
  );
  if (match === null) {
    return false;
  }

  const [, yearText, monthText, dayText, hourText, minuteText, secondText] =
    match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month - 1];

  return (
    month >= 1 &&
    month <= 12 &&
    daysInMonth !== undefined &&
    day >= 1 &&
    day <= daysInMonth &&
    hour <= 23 &&
    minute <= 59 &&
    second <= 59
  );
}

function mapReferenceError(error: unknown): never {
  if (
    error instanceof EpubPathError &&
    error.code === "resource-limit-exceeded"
  ) {
    return fail("resource-limit-exceeded");
  }

  return fail("broken-reference");
}

function resolveManifestLocation(
  packagePath: ArchiveFilePath,
  href: string,
  policy: EpubIngestionPolicy,
  inventoryFiles: ReadonlySet<string>,
): ResolvedManifestLocation {
  if (href.length === 0 || href !== href.trim()) {
    return fail("broken-reference");
  }

  const schemeMatch = /^([a-z][a-z0-9+.-]*):/iu.exec(href);
  if (schemeMatch !== null) {
    const scheme = schemeMatch[1]?.toLowerCase();
    if (scheme !== "http" && scheme !== "https") {
      return fail("broken-reference");
    }

    return Object.freeze({
      location: Object.freeze({ kind: "external" }),
      uniquenessKey: `external:${href}`,
    });
  }

  try {
    const reference = parseOcfReference(href, policy);
    if (
      reference.relativePath.length === 0 ||
      reference.fragment !== undefined
    ) {
      return fail("broken-reference");
    }

    const path = resolveOcfReference(packagePath, reference, policy).path;
    const pathText = String(path);
    if (
      path === packagePath ||
      pathText === "mimetype" ||
      pathText.startsWith("META-INF/")
    ) {
      return fail("malformed-package");
    }

    if (!inventoryFiles.has(pathText)) {
      return fail("broken-reference");
    }

    return Object.freeze({
      location: Object.freeze({ kind: "local", path }),
      uniquenessKey: `local:${pathText}`,
    });
  } catch (error: unknown) {
    if (error instanceof EpubArchiveError) {
      throw error;
    }

    return mapReferenceError(error);
  }
}

class PackageDocumentParser {
  readonly #packagePath: ArchiveFilePath;
  readonly #policy: EpubIngestionPolicy;
  readonly #inventoryFiles: ReadonlySet<string>;
  readonly #stack: XmlExpandedName[] = [];
  readonly #ids = new Set<string>();
  readonly #manifestLocationKeys = new Set<string>();
  readonly #identifiers: IdentifierValue[] = [];
  readonly #titles: string[] = [];
  readonly #languages: string[] = [];
  readonly #creators: string[] = [];
  readonly #manifest: RawManifestItem[] = [];
  readonly #spine: RawSpineItem[] = [];
  #capturedText: CapturedText | undefined;
  #ignoredDepth: number | undefined;
  #nextRequiredSection = 0;
  #sawPackage = false;
  #uniqueIdentifierId: string | undefined;
  #modified: string | undefined;
  #renditionLayout: string | undefined;
  #pageProgressionDirection: "default" | "ltr" | "rtl" = "default";

  public constructor(
    packagePath: ArchiveFilePath,
    policy: EpubIngestionPolicy,
    inventoryFiles: ReadonlySet<string>,
  ) {
    this.#packagePath = packagePath;
    this.#policy = policy;
    this.#inventoryFiles = inventoryFiles;
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
        if (this.#capturedText !== undefined) {
          this.#capturedText.text += event.text;
        } else if (
          this.#ignoredDepth === undefined &&
          event.text.trim().length > 0
        ) {
          return fail("malformed-package");
        }
        return;
    }
  }

  public complete(): RawPackageDocument {
    if (
      this.#stack.length !== 0 ||
      !this.#sawPackage ||
      this.#nextRequiredSection !== 3 ||
      this.#uniqueIdentifierId === undefined ||
      this.#modified === undefined ||
      this.#identifiers.length === 0 ||
      this.#titles.length === 0 ||
      this.#languages.length === 0 ||
      this.#manifest.length === 0 ||
      this.#spine.length === 0
    ) {
      return fail("malformed-package");
    }

    return Object.freeze({
      uniqueIdentifierId: this.#uniqueIdentifierId,
      identifiers: Object.freeze([...this.#identifiers]),
      titles: Object.freeze([...this.#titles]),
      languages: Object.freeze([...this.#languages]),
      creators: Object.freeze([...this.#creators]),
      modified: this.#modified,
      renditionLayout: this.#renditionLayout,
      manifest: Object.freeze([...this.#manifest]),
      spine: Object.freeze([...this.#spine]),
      pageProgressionDirection: this.#pageProgressionDirection,
    });
  }

  private consumeStartElement(event: XmlStartElementEvent): void {
    const depth = this.#stack.length + 1;
    if (this.#ignoredDepth !== undefined) {
      this.#stack.push(event.name);
      return;
    }

    if (this.#capturedText !== undefined) {
      return fail("malformed-package");
    }

    if (depth === 1) {
      this.beginPackage(event);
    } else if (depth === 2) {
      this.beginPackageSection(event, depth);
    } else {
      const section = this.#stack[1];
      if (namesEqual(section, OPF_NAMESPACE, "metadata") && depth === 3) {
        this.beginMetadataChild(event, depth);
      } else if (
        namesEqual(section, OPF_NAMESPACE, "manifest") &&
        depth === 3
      ) {
        this.beginManifestItem(event, depth);
      } else if (namesEqual(section, OPF_NAMESPACE, "spine") && depth === 3) {
        this.beginSpineItem(event, depth);
      } else {
        return fail("malformed-package");
      }
    }

    this.#stack.push(event.name);
  }

  private beginPackage(event: XmlStartElementEvent): void {
    if (
      this.#sawPackage ||
      !namesEqual(event.name, OPF_NAMESPACE, "package") ||
      requiredAttribute(event, "version") !== SUPPORTED_VERSION
    ) {
      return fail("malformed-package");
    }

    this.#sawPackage = true;
    this.#uniqueIdentifierId = validateIdReference(
      requiredAttribute(event, "unique-identifier"),
    );
    this.registerId(unqualifiedAttribute(event, "id"));
  }

  private beginPackageSection(
    event: XmlStartElementEvent,
    depth: number,
  ): void {
    const expectedSections = ["metadata", "manifest", "spine"] as const;
    const expectedSection = expectedSections[this.#nextRequiredSection];

    if (
      event.name.namespaceUri === OPF_NAMESPACE &&
      ["metadata", "manifest", "spine"].includes(event.name.localName) &&
      event.name.localName !== expectedSection
    ) {
      return fail("malformed-package");
    }

    if (
      expectedSection !== undefined &&
      namesEqual(event.name, OPF_NAMESPACE, expectedSection)
    ) {
      this.#nextRequiredSection += 1;
      this.registerId(unqualifiedAttribute(event, "id"));
      if (expectedSection === "spine") {
        this.#pageProgressionDirection = parsePageProgressionDirection(
          unqualifiedAttribute(event, "page-progression-direction"),
        );
      }
      return;
    }

    if (
      event.name.namespaceUri !== OPF_NAMESPACE ||
      this.#nextRequiredSection === 3
    ) {
      this.#ignoredDepth = depth;
      return;
    }

    return fail("malformed-package");
  }

  private beginMetadataChild(event: XmlStartElementEvent, depth: number): void {
    const id = unqualifiedAttribute(event, "id");
    this.registerId(id);

    if (event.name.namespaceUri === DUBLIN_CORE_NAMESPACE) {
      const knownKind: Record<string, CapturedTextKind> = {
        creator: "creator",
        identifier: "identifier",
        language: "language",
        title: "title",
      };
      this.#capturedText = {
        depth,
        kind: knownKind[event.name.localName] ?? "ignored",
        ...(id === undefined ? {} : { id }),
        text: "",
      };
      return;
    }

    if (namesEqual(event.name, OPF_NAMESPACE, "meta")) {
      const property = unqualifiedAttribute(event, "property");
      const refines = unqualifiedAttribute(event, "refines");
      const legacyName = unqualifiedAttribute(event, "name");
      const legacyContent = unqualifiedAttribute(event, "content");

      if (property === undefined) {
        if (
          refines !== undefined ||
          legacyName === undefined ||
          legacyName.length === 0 ||
          legacyContent === undefined ||
          legacyContent.length === 0
        ) {
          return fail("malformed-package");
        }

        this.#capturedText = {
          depth,
          kind: "legacy",
          ...(id === undefined ? {} : { id }),
          text: "",
        };
        return;
      }

      if (
        property.length === 0 ||
        legacyName !== undefined ||
        legacyContent !== undefined
      ) {
        return fail("malformed-package");
      }

      let kind: CapturedTextKind = "ignored";
      if (refines === undefined && property === MODIFIED_PROPERTY) {
        kind = "modified";
      } else if (refines === undefined && property === LAYOUT_PROPERTY) {
        kind = "layout";
      }

      this.#capturedText = {
        depth,
        kind,
        ...(id === undefined ? {} : { id }),
        text: "",
      };
      return;
    }

    if (namesEqual(event.name, OPF_NAMESPACE, "link")) {
      requiredAttribute(event, "href");
      requiredAttribute(event, "rel");
      return;
    }

    if (event.name.namespaceUri !== OPF_NAMESPACE) {
      this.#ignoredDepth = depth;
      return;
    }

    return fail("malformed-package");
  }

  private beginManifestItem(event: XmlStartElementEvent, depth: number): void {
    if (!namesEqual(event.name, OPF_NAMESPACE, "item")) {
      if (event.name.namespaceUri !== OPF_NAMESPACE) {
        this.#ignoredDepth = depth;
        return;
      }

      return fail("malformed-package");
    }

    if (this.#manifest.length >= this.#policy.maxManifestItems) {
      return fail("resource-limit-exceeded");
    }

    const id = validateIdReference(requiredAttribute(event, "id"));
    this.registerId(id);
    const resolvedLocation = resolveManifestLocation(
      this.#packagePath,
      requiredAttribute(event, "href"),
      this.#policy,
      this.#inventoryFiles,
    );
    if (this.#manifestLocationKeys.has(resolvedLocation.uniquenessKey)) {
      return fail("malformed-package");
    }
    this.#manifestLocationKeys.add(resolvedLocation.uniquenessKey);

    const { mediaType, essence } = parseMediaType(
      requiredAttribute(event, "media-type"),
    );
    const fallbackId = unqualifiedAttribute(event, "fallback");
    const mediaOverlayId = unqualifiedAttribute(event, "media-overlay");
    this.#manifest.push(
      Object.freeze({
        id,
        location: resolvedLocation.location,
        mediaType,
        mediaTypeEssence: essence,
        kind: resourceKind(mediaType, essence),
        properties: parseProperties(unqualifiedAttribute(event, "properties")),
        ...(fallbackId === undefined
          ? {}
          : { fallbackId: validateIdReference(fallbackId) }),
        ...(mediaOverlayId === undefined
          ? {}
          : { mediaOverlayId: validateIdReference(mediaOverlayId) }),
      }),
    );
  }

  private beginSpineItem(event: XmlStartElementEvent, depth: number): void {
    if (!namesEqual(event.name, OPF_NAMESPACE, "itemref")) {
      if (event.name.namespaceUri !== OPF_NAMESPACE) {
        this.#ignoredDepth = depth;
        return;
      }

      return fail("malformed-package");
    }

    if (this.#spine.length >= this.#policy.maxSpineItems) {
      return fail("resource-limit-exceeded");
    }

    this.registerId(unqualifiedAttribute(event, "id"));
    this.#spine.push(
      Object.freeze({
        idref: validateIdReference(requiredAttribute(event, "idref")),
        linear: parseLinearity(unqualifiedAttribute(event, "linear")),
        properties: parseProperties(unqualifiedAttribute(event, "properties")),
      }),
    );
  }

  private consumeEndElement(): void {
    const depth = this.#stack.length;
    if (depth === 0) {
      return fail("malformed-package");
    }

    if (this.#capturedText?.depth === depth) {
      this.finishCapturedText(this.#capturedText);
      this.#capturedText = undefined;
    }

    this.#stack.pop();
    if (this.#ignoredDepth === depth) {
      this.#ignoredDepth = undefined;
    }
  }

  private finishCapturedText(captured: CapturedText): void {
    if (captured.kind === "legacy") {
      if (captured.text.length !== 0) {
        return fail("malformed-package");
      }
      return;
    }

    const value = normalizeMetadataText(captured.text);
    switch (captured.kind) {
      case "creator":
        this.#creators.push(value);
        return;
      case "identifier":
        this.#identifiers.push(
          Object.freeze({
            ...(captured.id === undefined ? {} : { id: captured.id }),
            value,
          }),
        );
        return;
      case "language":
        this.#languages.push(value);
        return;
      case "layout":
        if (this.#renditionLayout !== undefined) {
          return fail("malformed-package");
        }
        this.#renditionLayout = value;
        return;
      case "modified":
        if (this.#modified !== undefined || !isValidModifiedTimestamp(value)) {
          return fail("malformed-package");
        }
        this.#modified = value;
        return;
      case "title":
        this.#titles.push(value);
        return;
      case "ignored":
        return;
    }
  }

  private registerId(id: string | undefined): void {
    if (id === undefined) {
      return;
    }

    validateIdReference(id);
    if (this.#ids.has(id)) {
      return fail("malformed-package");
    }

    this.#ids.add(id);
  }
}

function inventoryFilePaths(archive: OpenedEpubArchive): ReadonlySet<string> {
  const result = new Set<string>();
  for (const entry of archive.inventory.entries) {
    archive.budget.checkpoint();
    if (entry.kind === "file") {
      result.add(String(entry.path));
    }
  }
  return result;
}

function rejectProtectedPublication(archive: OpenedEpubArchive): void {
  for (const entry of archive.inventory.entries) {
    archive.budget.checkpoint();
    if (
      entry.kind === "file" &&
      String(entry.path) === ENCRYPTION_DOCUMENT_PATH
    ) {
      return fail("unsupported-protection");
    }
  }
}

function validateFallbackGraph(
  manifest: readonly RawManifestItem[],
  manifestById: ReadonlyMap<string, RawManifestItem>,
  archive: OpenedEpubArchive,
): void {
  for (const start of manifest) {
    archive.budget.checkpoint();
    const seen = new Set<string>([start.id]);
    let current = start;
    let fallbackItemCount = 0;

    while (current.fallbackId !== undefined) {
      archive.budget.checkpoint();
      fallbackItemCount += 1;
      if (
        fallbackItemCount > archive.budget.policy.maxManifestFallbackChainItems
      ) {
        return fail("resource-limit-exceeded");
      }

      const fallback = manifestById.get(current.fallbackId);
      if (fallback === undefined) {
        return fail("broken-reference");
      }

      if (seen.has(fallback.id)) {
        return fail("malformed-package");
      }

      seen.add(fallback.id);
      current = fallback;
    }
  }
}

function isSupportedContentDocument(item: RawManifestItem): boolean {
  return (
    item.location.kind === "local" &&
    item.mediaType === XHTML_MEDIA_TYPE &&
    !item.properties.some((property) =>
      ACTIVE_RESOURCE_PROPERTIES.has(property),
    )
  );
}

function resolveSupportedContentDocument(
  start: RawManifestItem,
  manifestById: ReadonlyMap<string, RawManifestItem>,
  archive: OpenedEpubArchive,
): RawManifestItem {
  let current: RawManifestItem | undefined = start;
  let traversedFallbacks = 0;

  while (current !== undefined) {
    archive.budget.checkpoint();
    if (isSupportedContentDocument(current)) {
      return current;
    }

    if (current.fallbackId === undefined) {
      return fail("unsupported-resource");
    }

    traversedFallbacks += 1;
    if (
      traversedFallbacks > archive.budget.policy.maxManifestFallbackChainItems
    ) {
      return fail("resource-limit-exceeded");
    }
    current = manifestById.get(current.fallbackId);
  }

  return fail("broken-reference");
}

function validateMediaOverlays(
  manifest: readonly RawManifestItem[],
  manifestById: ReadonlyMap<string, RawManifestItem>,
): void {
  for (const item of manifest) {
    if (item.mediaOverlayId === undefined) {
      continue;
    }

    const overlay = manifestById.get(item.mediaOverlayId);
    if (overlay === undefined) {
      return fail("broken-reference");
    }

    if (overlay.mediaTypeEssence !== SMIL_MEDIA_TYPE) {
      return fail("malformed-package");
    }
  }
}

function buildParsedPackage(
  archive: OpenedEpubArchive,
  resolved: ResolvedPackageDocument,
  raw: RawPackageDocument,
): ParsedPackageDocument {
  if (raw.renditionLayout === FIXED_LAYOUT) {
    return fail("unsupported-layout");
  }
  if (
    raw.renditionLayout !== undefined &&
    raw.renditionLayout !== REFLOWED_LAYOUT
  ) {
    return fail("malformed-package");
  }

  const uniqueIdentifier = raw.identifiers.find(
    (identifier) => identifier.id === raw.uniqueIdentifierId,
  );
  if (uniqueIdentifier === undefined) {
    return fail("broken-reference");
  }

  const manifestById = new Map<string, RawManifestItem>();
  for (const item of raw.manifest) {
    archive.budget.checkpoint();
    if (manifestById.has(item.id)) {
      return fail("malformed-package");
    }
    manifestById.set(item.id, item);
  }

  validateFallbackGraph(raw.manifest, manifestById, archive);
  validateMediaOverlays(raw.manifest, manifestById);

  const navigationItems = raw.manifest.filter((item) =>
    item.properties.includes("nav"),
  );
  if (navigationItems.length !== 1) {
    return fail("malformed-package");
  }
  const navigationItem = navigationItems[0];
  if (
    navigationItem === undefined ||
    !isSupportedContentDocument(navigationItem) ||
    navigationItem.location.kind !== "local"
  ) {
    return fail("unsupported-resource");
  }

  const seenSpineIds = new Set<string>();
  const spine: PackageSpineItem[] = [];
  let linearItemCount = 0;
  for (const [index, rawSpineItem] of raw.spine.entries()) {
    archive.budget.checkpoint();
    if (seenSpineIds.has(rawSpineItem.idref)) {
      return fail("malformed-package");
    }
    seenSpineIds.add(rawSpineItem.idref);

    if (
      rawSpineItem.properties.includes("rendition:layout-reflowable") &&
      rawSpineItem.properties.includes("rendition:layout-pre-paginated")
    ) {
      return fail("malformed-package");
    }
    if (rawSpineItem.properties.includes("rendition:layout-pre-paginated")) {
      return fail("unsupported-layout");
    }

    const sourceItem = manifestById.get(rawSpineItem.idref);
    if (sourceItem === undefined) {
      return fail("broken-reference");
    }
    const contentItem = resolveSupportedContentDocument(
      sourceItem,
      manifestById,
      archive,
    );
    if (contentItem.location.kind !== "local") {
      return fail("internal-failure");
    }

    if (rawSpineItem.linear) {
      linearItemCount += 1;
    }
    spine.push(
      Object.freeze({
        index,
        idref: rawSpineItem.idref,
        contentResourceId: contentItem.id,
        path: contentItem.location.path,
        linear: rawSpineItem.linear,
        properties: rawSpineItem.properties,
      }),
    );
  }

  if (linearItemCount === 0) {
    return fail("malformed-package");
  }

  return Object.freeze({
    path: resolved.path,
    version: SUPPORTED_VERSION,
    renditionLayout: REFLOWED_LAYOUT,
    pageProgressionDirection: raw.pageProgressionDirection,
    metadata: Object.freeze({
      uniqueIdentifier: uniqueIdentifier.value,
      identifiers: Object.freeze(
        raw.identifiers.map((identifier) => identifier.value),
      ),
      titles: raw.titles,
      languages: raw.languages,
      creators: raw.creators,
      modified: raw.modified,
    }),
    manifest: raw.manifest,
    spine: Object.freeze(spine),
    navigation: Object.freeze({
      resourceId: navigationItem.id,
      path: navigationItem.location.path,
    }),
  });
}

export function parsePackageDocument(
  archive: OpenedEpubArchive,
  resolved: ResolvedPackageDocument,
): ParsedPackageDocument {
  archive.budget.checkpoint();
  rejectProtectedPublication(archive);
  if (
    resolved.version !== SUPPORTED_VERSION ||
    resolved.renditionLayout !== REFLOWED_LAYOUT
  ) {
    return fail("internal-failure");
  }

  const parser = new PackageDocumentParser(
    resolved.path,
    archive.budget.policy,
    inventoryFilePaths(archive),
  );
  createXmlEventReader(archive.budget).read(
    resolved.bytes,
    "container-or-package",
    (event) => parser.consume(event),
  );
  const raw = parser.complete();
  return buildParsedPackage(archive, resolved, raw);
}
