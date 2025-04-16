import {CollectionCallback, CollectionCallbackParams, CollectionQuery} from "../types";
import {SUBGRAPH_PAGE_SIZE} from "../constant";


export async function fetchCollection(
  iterationQuery: CollectionQuery,
  iterationCallback: CollectionCallback,
  subgraphUrl: string,
): Promise<void> {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, multipart/mixed",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
  };
  const method = "POST";

  const callbackParams: CollectionCallbackParams = {
    pageSize: SUBGRAPH_PAGE_SIZE,
    loopFlag: true,
  };
  let prevPage = 0;
  while (callbackParams.loopFlag) {
    const skip = prevPage * callbackParams.pageSize;
    const body = JSON.stringify({
      query: iterationQuery(skip, callbackParams.pageSize),
    });

    const response = await fetch(subgraphUrl, {
      method,
      headers,
      body,
    });
    if (!response.ok) {
      throw new Error(`[${response.status}] Failed to fetch subgraph!`);
    }
    const result = await response.json();
    if (result.errors?.length) {
      throw new Error(
        `Subgraph errors: ${result.errors.map((e: Error) => e?.message).join(" ")}`,
      );
    }

    iterationCallback(result, callbackParams);
    prevPage++;
  }
}
