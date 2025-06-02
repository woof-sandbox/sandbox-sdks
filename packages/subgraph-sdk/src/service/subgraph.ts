import { SUBGRAPH_PAGE_SIZE } from "../constant";
import type { CollectionQueryFactory } from "../query";
import type { CollectionCallback, CollectionCallbackParams } from "../types";

export async function fetchItem<T>(
  query: string,
  subgraphUrl: string,
  options: {
    token?: string;
  } = {},
): Promise<T> {
  const headers = buildHeaders(options);
  const body = JSON.stringify({
    query,
  });

  const result = await fetchSubgraph(subgraphUrl, body, headers);
  return result.data as T;
}

export async function fetchCollection(
  iterationQueryFactory: CollectionQueryFactory,
  iterationCallback: CollectionCallback,
  subgraphUrl: string,
  options: {
    token?: string;
  } = {},
): Promise<void> {
  const headers = buildHeaders(options);

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

function buildHeaders(options?: {
  token?: string;
}): Record<string, string> {
  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json, multipart/mixed",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
  };

  return {
    ...defaultHeaders,
    ...(options?.token && {
      Authorization: `Bearer ${options.token}`,
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
