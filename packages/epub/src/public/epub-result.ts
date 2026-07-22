import { createOperationalErrorV1 } from "@voxleaf/shared";
import type {
  OperationalErrorCodeV1,
  OperationalErrorV1,
} from "@voxleaf/shared";

import { EpubArchiveError } from "../archive/archive-error.js";
import type { EpubArchiveErrorCode } from "../archive/archive-error.js";
import type { OpenedPublication } from "../document/document-model.js";

/** Closed, content-free reason for a failed EPUB operation. */
export type EpubFailureDetail = EpubArchiveErrorCode;

export interface EpubFailure {
  readonly ok: false;
  readonly detail: EpubFailureDetail;
  readonly error: OperationalErrorV1;
}

export interface OpenEpubPublicationSuccess {
  readonly ok: true;
  readonly publication: OpenedPublication;
}

export type OpenEpubPublicationResult =
  EpubFailure | OpenEpubPublicationSuccess;

export interface OpenEpubPublicationOptions {
  readonly signal?: AbortSignal;
}

const OPERATIONAL_CODES = Object.freeze({
  "broken-reference": "invalid-input",
  cancelled: "operation-cancelled",
  "invalid-container": "invalid-input",
  "internal-failure": "internal-failure",
  "locator-unresolved": "invalid-input",
  "malformed-package": "invalid-input",
  "malformed-xml": "invalid-input",
  "resource-limit-exceeded": "resource-exhausted",
  "unsafe-entry": "invalid-input",
  "unsupported-layout": "unsupported-input",
  "unsupported-protection": "unsupported-input",
  "unsupported-resource": "unsupported-input",
  "unsupported-version": "unsupported-input",
} satisfies Readonly<Record<EpubFailureDetail, OperationalErrorCodeV1>>);

/** Maps an internal exception without retaining or inspecting sensitive data. */
export function mapEpubFailure(error: unknown): EpubFailure {
  const detail =
    error instanceof EpubArchiveError ? error.code : "internal-failure";

  return Object.freeze({
    ok: false,
    detail,
    error: createOperationalErrorV1(OPERATIONAL_CODES[detail]),
  });
}

export function epubOpenSuccess(
  publication: OpenedPublication,
): OpenEpubPublicationSuccess {
  return Object.freeze({ ok: true, publication });
}
