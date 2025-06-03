export async function fetchSubgraph(
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
