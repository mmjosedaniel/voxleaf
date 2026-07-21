export { BookContractError, decodeBookV1 } from "./book.js";
export {
  LocatorContractError,
  decodeLocatorRangeV1,
  decodeReadingLocatorV1,
} from "./locator.js";

export type {
  BookContractErrorCode,
  BookIdentityV1,
  BookV1,
  LocalResourcePath,
  LocalResourceRoleV1,
  LocalResourceV1,
  NavigationEntryV1,
  PublicationMetadataV1,
  SpineItemV1,
} from "./book.js";

export type {
  LocatorContractErrorCode,
  LocatorRangeV1,
  ReadingLocatorV1,
  StructuralAnchorV1,
  StructuralAnchorValue,
} from "./locator.js";
