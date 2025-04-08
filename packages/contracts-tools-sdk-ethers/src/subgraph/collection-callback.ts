import type { CollectionCallbackParams } from "./collection-callback-params";

/**
 * @param result - subgraph response
 * @param params - for pagination
 */

export type CollectionCallback = (
  result: any,
  params: CollectionCallbackParams,
) => void;
