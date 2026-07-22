import { hasEncodedPathHazard, parseArchiveEntryPath } from "./archive-path.js";
import type { ArchiveFilePath } from "./archive-path.js";
import { EpubPathError } from "./path-error.js";

const MAX_REFERENCE_PATH_BYTES = 2_048;
const utf8Encoder = new TextEncoder();

declare const ocfReferenceBrand: unique symbol;

export interface OcfReference {
  readonly relativePath: string;
  readonly fragment?: string;
  readonly [ocfReferenceBrand]: "OcfReference";
}

export interface ResolvedOcfReference {
  readonly path: ArchiveFilePath;
  readonly fragment?: string;
}

function brokenReference(): never {
  throw new EpubPathError("broken-reference");
}

function resourceLimitExceeded(): never {
  throw new EpubPathError("resource-limit-exceeded");
}

function isWellFormedUnicode(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);

    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const nextCodeUnit = value.charCodeAt(index + 1);
      if (nextCodeUnit < 0xdc00 || nextCodeUnit > 0xdfff) {
        return false;
      }

      index += 1;
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      return false;
    }
  }

  return true;
}

function hasControlCodePoint(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0);
    if (
      codePoint === undefined ||
      codePoint <= 0x1f ||
      (codePoint >= 0x7f && codePoint <= 0x9f) ||
      codePoint === 0xfeff
    ) {
      return true;
    }
  }

  return false;
}

function decodeReferencePart(value: string): string {
  let decoded: string;

  try {
    decoded = decodeURIComponent(value);
  } catch {
    return brokenReference();
  }

  if (!isWellFormedUnicode(decoded) || hasControlCodePoint(decoded)) {
    return brokenReference();
  }

  return decoded;
}

export function parseOcfReference(input: string): OcfReference {
  if (
    !isWellFormedUnicode(input) ||
    hasControlCodePoint(input) ||
    input.includes("\\")
  ) {
    return brokenReference();
  }

  const fragmentSeparatorIndex = input.indexOf("#");
  const pathPart =
    fragmentSeparatorIndex === -1
      ? input
      : input.slice(0, fragmentSeparatorIndex);
  const rawFragment =
    fragmentSeparatorIndex === -1
      ? undefined
      : input.slice(fragmentSeparatorIndex + 1);

  if (utf8Encoder.encode(pathPart).byteLength > MAX_REFERENCE_PATH_BYTES) {
    return resourceLimitExceeded();
  }

  if (
    pathPart.includes("?") ||
    pathPart.startsWith("/") ||
    /^[a-z][a-z0-9+.-]*:/iu.test(pathPart)
  ) {
    return brokenReference();
  }

  const decodedComponents: string[] = [];
  if (pathPart.length > 0) {
    for (const [componentIndex, component] of pathPart.split("/").entries()) {
      if (component.length === 0) {
        return brokenReference();
      }

      const decodedComponent = decodeReferencePart(component);
      if (
        decodedComponent.includes("/") ||
        decodedComponent.includes("\\") ||
        (componentIndex === 0 &&
          /^[a-z][a-z0-9+.-]*:/iu.test(decodedComponent)) ||
        (decodedComponent !== component &&
          (decodedComponent === "." || decodedComponent === "..")) ||
        hasEncodedPathHazard(decodedComponent)
      ) {
        return brokenReference();
      }

      decodedComponents.push(decodedComponent);
    }
  }

  const fragment =
    rawFragment === undefined ? undefined : decodeReferencePart(rawFragment);
  if (fragment?.includes("\\") === true) {
    return brokenReference();
  }

  const reference = {
    relativePath: decodedComponents.join("/"),
    ...(fragment === undefined ? {} : { fragment }),
  } as OcfReference;

  return Object.freeze(reference);
}

export function resolveOcfReference(
  baseDocument: ArchiveFilePath,
  reference: OcfReference,
): ResolvedOcfReference {
  let resolvedPath: ArchiveFilePath;

  if (reference.relativePath.length === 0) {
    resolvedPath = baseDocument;
  } else {
    const referenceComponents = reference.relativePath.split("/");
    const finalComponent = referenceComponents.at(-1);
    if (finalComponent === "." || finalComponent === "..") {
      return brokenReference();
    }

    const resolvedComponents = String(baseDocument).split("/").slice(0, -1);
    for (const component of referenceComponents) {
      if (component === ".") {
        continue;
      }

      if (component === "..") {
        if (resolvedComponents.length === 0) {
          return brokenReference();
        }

        resolvedComponents.pop();
      } else {
        resolvedComponents.push(component);
      }
    }

    try {
      resolvedPath = parseArchiveEntryPath(
        resolvedComponents.join("/"),
        "file",
      );
    } catch (error: unknown) {
      if (
        error instanceof EpubPathError &&
        error.code === "resource-limit-exceeded"
      ) {
        throw error;
      }

      return brokenReference();
    }
  }

  return Object.freeze({
    path: resolvedPath,
    ...(reference.fragment === undefined
      ? {}
      : { fragment: reference.fragment }),
  });
}
