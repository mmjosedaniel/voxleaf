import { describe, expect, expectTypeOf, it } from "vitest";

import { createIndex, createSpineItemId } from "@voxleaf/shared";
import type { BookV1 } from "@voxleaf/shared";
import type {
  ContentDocumentId,
  OpenedPublication,
  PublicationLocatorResolution,
  PublicationNavigationNode,
  RasterImageResource,
  RasterImageResourceId,
  SemanticBlock,
  SemanticDocument,
  SemanticInline,
  SensitivePublicationText,
  SourceFragment,
} from "@voxleaf/epub";

const documentId = "document:synthetic" as ContentDocumentId;
const imageResourceId = "image:synthetic" as RasterImageResourceId;
const sensitiveText = "Synthetic publication text" as SensitivePublicationText;
const sourceFragment = "synthetic-fragment" as SourceFragment;
const spineItemId = createSpineItemId("spine:synthetic");
const spineItemIndex = createIndex(0);

describe("public EPUB document model", () => {
  it("defines closed semantic block and inline allowlists", () => {
    const inline = {
      kind: "internal-link",
      target: { documentId, fragment: sourceFragment },
      children: Object.freeze([
        Object.freeze({ kind: "text", text: sensitiveText }),
        Object.freeze({ kind: "line-break" }),
        Object.freeze({
          kind: "raster-image",
          resourceId: imageResourceId,
          alternativeText: sensitiveText,
        }),
      ]),
    } as const satisfies SemanticInline;
    const block = {
      kind: "block-quote",
      children: Object.freeze([
        Object.freeze({
          kind: "heading",
          level: 2,
          children: Object.freeze([
            Object.freeze({
              kind: "emphasis",
              children: Object.freeze([
                Object.freeze({ kind: "text", text: sensitiveText }),
              ]),
            }),
          ]),
        }),
        Object.freeze({
          kind: "list",
          ordered: true,
          items: Object.freeze([
            Object.freeze({
              children: Object.freeze([
                Object.freeze({
                  kind: "paragraph",
                  children: Object.freeze([inline]),
                }),
              ]),
            }),
          ]),
        }),
      ]),
    } as const satisfies SemanticBlock;

    expectTypeOf(inline).toMatchTypeOf<SemanticInline>();
    expectTypeOf(block).toMatchTypeOf<SemanticBlock>();
    expect(Object.isFrozen(block.children)).toBe(true);
  });

  it("models spine and non-spine documents without paths or trusted markup", () => {
    const documents = Object.freeze([
      Object.freeze({
        id: documentId,
        location: Object.freeze({
          kind: "spine",
          spineItemId,
          spineItemIndex,
        }),
        language: "en",
        direction: "ltr",
        blocks: Object.freeze([]),
      }),
      Object.freeze({
        id: documentId,
        location: Object.freeze({ kind: "non-spine" }),
        blocks: Object.freeze([]),
      }),
    ] as const satisfies readonly SemanticDocument[]);

    expectTypeOf(documents).toMatchTypeOf<readonly SemanticDocument[]>();
    expect(documents[0]).not.toHaveProperty("path");
    expect(documents[0]).not.toHaveProperty("html");
    expect(documents[0]).not.toHaveProperty("dom");
  });

  it("keeps navigation hierarchical and grouping nodes nonempty", () => {
    const linkedNode = Object.freeze({
      kind: "link",
      label: sensitiveText,
      target: Object.freeze({ documentId, fragment: sourceFragment }),
      children: Object.freeze([]),
    } as const satisfies PublicationNavigationNode);
    const navigation = Object.freeze([
      Object.freeze({
        kind: "group",
        label: sensitiveText,
        children: Object.freeze([linkedNode]),
      } as const satisfies PublicationNavigationNode),
    ]);

    expectTypeOf(navigation).toMatchTypeOf<
      readonly PublicationNavigationNode[]
    >();
    expect(Object.isFrozen(navigation[0]?.children)).toBe(true);
  });

  it("defines a closed local raster-resource descriptor", () => {
    const resource = Object.freeze({
      id: imageResourceId,
      kind: "raster-image",
      mediaType: "image/png",
    } as const satisfies RasterImageResource);

    expectTypeOf(resource).toMatchTypeOf<RasterImageResource>();
    expect(resource).not.toHaveProperty("path");
    expect(resource).not.toHaveProperty("url");
    expect(resource).not.toHaveProperty("bytes");
  });

  it("makes publication values readonly and lifecycle operations explicit", () => {
    const inspect = (publication: OpenedPublication): void => {
      expectTypeOf(publication.book).toEqualTypeOf<BookV1>();
      expectTypeOf(publication.readResource(imageResourceId)).toEqualTypeOf<
        Promise<Uint8Array>
      >();
      expectTypeOf(
        publication.resolveLocator({}),
      ).toEqualTypeOf<PublicationLocatorResolution>();
      expectTypeOf(publication.close()).toEqualTypeOf<Promise<void>>();

      // @ts-expect-error Public semantic collections are readonly.
      publication.documents.push({});
      // @ts-expect-error Lifecycle state is observable but not caller-mutable.
      publication.closed = true;
    };

    expectTypeOf(inspect).toBeFunction();
    expectTypeOf<OpenedPublication["book"]>().toEqualTypeOf<BookV1>();
  });

  it("keeps document, resource, fragment, and sensitive-text values distinct", () => {
    const acceptDocumentId = (value: ContentDocumentId): void => {
      void value;
    };
    const acceptResourceId = (value: RasterImageResourceId): void => {
      void value;
    };

    // @ts-expect-error Resource IDs cannot identify content documents.
    acceptDocumentId(imageResourceId);
    // @ts-expect-error Content document IDs cannot identify raster resources.
    acceptResourceId(documentId);
    // @ts-expect-error Sensitive text is not a structural source fragment.
    const invalidFragment: SourceFragment = sensitiveText;

    expectTypeOf(invalidFragment).toEqualTypeOf<SourceFragment>();
  });
});
