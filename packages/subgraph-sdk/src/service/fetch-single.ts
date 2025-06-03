import { formHeaders } from "../helpers";
import { fetchSubgraph } from "./fetch-subgraph";

export async function fetchSingle<T>(
  query: string,
  subgraphUrl: string,
  options: {
    token?: string;
  } = {},
): Promise<T> {
  const headers = formHeaders(options);
  const body = JSON.stringify({
    query,
  });

  const result = await fetchSubgraph(subgraphUrl, body, headers);
  return result.data as T;
}
