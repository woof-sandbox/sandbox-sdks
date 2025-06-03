export function formHeaders(options?: {
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
