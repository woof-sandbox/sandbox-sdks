import type { Tagable } from "../types";

export const multicallResultEventName = (normalizedTags: Tagable): string =>
  `result:${String(normalizedTags)}`;
