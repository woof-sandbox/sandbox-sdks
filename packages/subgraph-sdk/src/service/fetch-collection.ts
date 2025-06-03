import { SUBGRAPH_PAGE_SIZE } from "../constant";
import { formHeaders } from "../helpers";
import type { CollectionQueryFactory } from "../query";
import type { CollectionCallback, CollectionCallbackParams } from "../types";
import { fetchSubgraph } from "./fetch-subgraph";

export async function fetchCollection(
  iterationQueryFactory: CollectionQueryFactory,
  iterationCallback: CollectionCallback,
  subgraphUrl: string,
  options: {
    token?: string;
  } = {},
): Promise<void> {
  const headers = formHeaders(options);

  const callbackParams: CollectionCallbackParams = {
    pageSize: SUBGRAPH_PAGE_SIZE,
    loopFlag: true,
  };
  let prevPage = 0;
  while (callbackParams.loopFlag) {
    const skip = prevPage * callbackParams.pageSize;
    const body = JSON.stringify({
      query: iterationQueryFactory(skip, callbackParams.pageSize),
    });

    const result = await fetchSubgraph(subgraphUrl, body, headers);
    iterationCallback(result, callbackParams);
    prevPage++;
  }
}
