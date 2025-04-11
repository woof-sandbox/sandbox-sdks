import type { Tagable } from "../types";

export const multicallErrorEventName = (normalizedTags: Tagable): string =>
  `error:${String(normalizedTags)}`;
