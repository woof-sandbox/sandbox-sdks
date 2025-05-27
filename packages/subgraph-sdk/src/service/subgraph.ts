import { SUBGRAPH_PAGE_SIZE } from "../constant";
import {CollectionQuery, ItemQuery} from "../query";
import {CollectionCallback, CollectionCallbackParams, ItemCallback} from "../types";

export async function fetchItem(
  query: ItemQuery,
  itemCallback: ItemCallback,
  subgraphUrl: string,
  options?: {
    authorization?: string;
    headers?: Record<string, string>;
  },
): Promise<void> {
  const headers = buildHeaders(options);
  const method = "POST";

  const body = JSON.stringify({
    query: query(),
  });

  const result = await fetchSubgraph(subgraphUrl, body, headers);
  itemCallback(result);
}

export async function fetchCollection(
  iterationQuery: CollectionQuery,
  iterationCallback: CollectionCallback,
  subgraphUrl: string,
  options?: {
    authorization?: string;
    headers?: Record<string, string>;
  },
): Promise<void> {
  const headers = buildHeaders(options);
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

    const result = await fetchSubgraph(subgraphUrl, body, headers);
    iterationCallback(result, callbackParams);
    prevPage++;
  }
}

function buildHeaders(options?: {
  authorization?: string;
  headers?: Record<string, string>;
}): Record<string, string> {
  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json, multipart/mixed",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
  };

  return {
    ...defaultHeaders,
    ...(options?.headers || {}),
    ...(options?.authorization && {
      Authorization: `Bearer ${options.authorization}`,
    }),
  };
}

async function fetchSubgraph(
    url: string,
    body: string,
    headers: Record<string, string>,
): Promise<any> {
  const response = await fetch(url, {
    method: "POST",
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

  return result;
}

