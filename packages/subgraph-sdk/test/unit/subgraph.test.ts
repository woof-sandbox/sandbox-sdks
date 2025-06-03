import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchCollection, fetchSingle } from "../../src";
import type { CollectionCallback, CollectionCallbackParams } from "../../src";
import { SUBGRAPH_PAGE_SIZE } from "../../src/constant";

describe("fetchCollection", () => {
  global.fetch = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("must successfully execute the query and call a callback with the result", async () => {
    const mockQuery = vi.fn(
      (skip, limit) => `{ items(skip: ${skip}, first: ${limit}) { id name } }`,
    );
    const mockCallback = vi.fn((result, params) => {
      params.loopFlag = false;
    });
    const mockSubgraphUrl = "https://api.example.com/subgraph";

    const mockResponse = {
      data: {
        items: [
          { id: "1", name: "Item 1" },
          { id: "2", name: "Item 2" },
        ],
      },
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await fetchCollection(mockQuery, mockCallback, mockSubgraphUrl);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(mockSubgraphUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, multipart/mixed",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br, zstd",
      },
      body: JSON.stringify({
        query: mockQuery(0, SUBGRAPH_PAGE_SIZE),
      }),
    });

    expect(mockQuery).toHaveBeenCalledWith(0, SUBGRAPH_PAGE_SIZE);

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(
      mockResponse,
      expect.objectContaining({
        pageSize: SUBGRAPH_PAGE_SIZE,
        loopFlag: false,
      }),
    );
  });

  it("must perform multiple queries for pagination", async () => {
    const mockQuery = vi.fn(
      (skip, limit) => `{ items(skip: ${skip}, first: ${limit}) { id name } }`,
    );
    const mockSubgraphUrl = "https://api.example.com/subgraph";

    let callCount = 0;

    const mockCallback: CollectionCallback = (
      result,
      params: CollectionCallbackParams,
    ) => {
      callCount++;
      if (callCount >= 2) {
        params.loopFlag = false;
      }
    };

    const mockResponses = [
      {
        data: {
          items: [
            { id: "1", name: "Item 1" },
            { id: "2", name: "Item 2" },
          ],
        },
      },
      {
        data: {
          items: [
            { id: "3", name: "Item 3" },
            { id: "4", name: "Item 4" },
          ],
        },
      },
    ];

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponses[0],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponses[1],
      });

    await fetchCollection(mockQuery, mockCallback, mockSubgraphUrl);

    expect(global.fetch).toHaveBeenCalledTimes(2);

    expect(global.fetch).toHaveBeenNthCalledWith(1, mockSubgraphUrl, {
      method: "POST",
      headers: expect.any(Object),
      body: JSON.stringify({
        query: mockQuery(0, SUBGRAPH_PAGE_SIZE),
      }),
    });

    expect(global.fetch).toHaveBeenNthCalledWith(2, mockSubgraphUrl, {
      method: "POST",
      headers: expect.any(Object),
      body: JSON.stringify({
        query: mockQuery(SUBGRAPH_PAGE_SIZE, SUBGRAPH_PAGE_SIZE),
      }),
    });

    expect(mockQuery).toHaveBeenNthCalledWith(1, 0, SUBGRAPH_PAGE_SIZE);
    expect(mockQuery).toHaveBeenNthCalledWith(
      2,
      SUBGRAPH_PAGE_SIZE,
      SUBGRAPH_PAGE_SIZE,
    );

    expect(callCount).toBe(2);
  });

  it("should throw an error if the answer is not ok", async () => {
    const mockQuery = vi.fn(
      (skip, limit) => `{ items(skip: ${skip}, first: ${limit}) { id name } }`,
    );
    const mockCallback = vi.fn();
    const mockSubgraphUrl = "https://api.example.com/subgraph";

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(
      fetchCollection(mockQuery, mockCallback, mockSubgraphUrl),
    ).rejects.toThrow("[500] Failed to fetch subgraph!");

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("should throw an error if there are errors in the subgraph response", async () => {
    const mockQuery = vi.fn(
      (skip, limit) => `{ items(skip: ${skip}, first: ${limit}) { id name } }`,
    );
    const mockCallback = vi.fn();
    const mockSubgraphUrl = "https://api.example.com/subgraph";

    const mockErrorResponse = {
      errors: [
        { message: 'Field "unknown" is not defined' },
        { message: "Syntax error" },
      ],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockErrorResponse,
    });

    await expect(
      fetchCollection(mockQuery, mockCallback, mockSubgraphUrl),
    ).rejects.toThrow(
      'Subgraph errors: Field "unknown" is not defined Syntax error',
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(mockCallback).not.toHaveBeenCalled();
  });
});

describe("fetchSingle", () => {
  const mockSubgraphUrl = "https://api.example.com/subgraph";

  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fetches and returns data successfully", async () => {
    const query = `{ item { id name } }`;
    const mockResponse = {
      data: {
        item: { id: "1", name: "Item 1" },
      },
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await fetchSingle<typeof mockResponse.data>(
      query,
      mockSubgraphUrl,
    );

    expect(global.fetch).toHaveBeenCalledWith(mockSubgraphUrl, {
      method: "POST",
      headers: expect.objectContaining({
        "Content-Type": "application/json",
        Accept: "application/json, multipart/mixed",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br, zstd",
      }),
      body: JSON.stringify({ query }),
    });

    expect(result).toEqual(mockResponse.data);
  });

  it("throws if response.ok is false", async () => {
    const query = `{ item { id name } }`;

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(fetchSingle<any>(query, mockSubgraphUrl)).rejects.toThrow(
      "[500] Failed to fetch subgraph!",
    );
  });

  it("throws if response contains errors", async () => {
    const query = `{ item { id name } }`;

    const errorResponse = {
      errors: [
        { message: "Something went wrong" },
        { message: "Another error" },
      ],
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => errorResponse,
    });

    await expect(fetchSingle<any>(query, mockSubgraphUrl)).rejects.toThrow(
      "Subgraph errors: Something went wrong Another error",
    );
  });

  it("adds Authorization header if token is passed", async () => {
    const query = `{ item { id name } }`;
    const token = "abc123";
    const mockResponse = {
      data: { item: { id: "42", name: "Test" } },
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await fetchSingle<typeof mockResponse.data>(query, mockSubgraphUrl, {
      token,
    });

    expect(global.fetch).toHaveBeenCalledWith(mockSubgraphUrl, {
      method: "POST",
      headers: expect.objectContaining({
        Authorization: `Bearer ${token}`,
      }),
      body: JSON.stringify({ query }),
    });
  });
});
