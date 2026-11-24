import { EpubArchiveError } from "../archive/archive-error.js";

const DUBLIN_CORE_TERMS = "http://purl.org/dc/terms/";
const RENDITION = "http://www.idpf.org/vocab/rendition/#";
const RESERVED = new Map([
  ["dcterms", DUBLIN_CORE_TERMS],
  ["rendition", RENDITION],
]);

export const MODIFIED_PROPERTY_IRI = DUBLIN_CORE_TERMS + "modified";
export const LAYOUT_PROPERTY_IRI = RENDITION + "layout";
export const REFLOWABLE_OVERRIDE_IRI = RENDITION + "layout-reflowable";
export const FIXED_OVERRIDE_IRI = RENDITION + "layout-pre-paginated";

/** Parse the root attribute within the existing package XML byte limit. */
export function parsePackagePrefixes(
  declaration: string | undefined,
): ReadonlyMap<string, string> {
  const mappings = new Map<string, string>();
  if (declaration === undefined) return mappings;

  const tokens = declaration.split(/[\t\n\r ]+/u).filter(Boolean);
  for (let index = 0; index < tokens.length; index += 2) {
    const name = tokens[index]!;
    const iri = tokens[index + 1];
    const prefix = name.slice(0, -1);
    if (
      !name.endsWith(":") ||
      prefix.length === 0 ||
      prefix.includes(":") ||
      iri === undefined ||
      !/^[A-Za-z][A-Za-z0-9+.-]*:/u.test(iri) ||
      mappings.has(prefix)
    ) {
      throw new EpubArchiveError("malformed-package");
    }
    mappings.set(prefix, iri);
  }
  return mappings;
}

/** Compare expanded property identity without constructing or dereferencing a URL. */
export function matchesPackageProperty(
  property: string | undefined,
  prefixes: ReadonlyMap<string, string>,
  expected: string,
): boolean {
  if (property === undefined) return false;
  const delimiter = property.indexOf(":");
  if (delimiter < 1) return false;

  const prefix = property.slice(0, delimiter);
  const base = prefixes.get(prefix) ?? RESERVED.get(prefix);
  return (
    base !== undefined &&
    expected.startsWith(base) &&
    expected.slice(base.length) === property.slice(delimiter + 1)
  );
}
