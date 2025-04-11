import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SUBGRAPH_PAGE_SIZE } from "../../src/constants";
import { fetchUserActiveMarkets } from "../../src/fetch";

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchUserActiveMarkets", () => {
  const mockAddress = '"0x123"';
  const mockSubgraphUrl = "https://mock.subgraph.url/subgraphs/name/test";

  it("should fetch and correctly categorize markets from a single page", async () => {
    const mockUsers = [
      { principal: "-1000", proxyCometAddress: "0xborrow1" },
      { principal: "5000", proxyCometAddress: "0xlend1" },
      { principal: "-200", proxyCometAddress: "0xborrow2" },
    ];

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { users: mockUsers } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { users: [] } }),
      });

    const [borrowMarkets, landMarkets] = await fetchUserActiveMarkets(
      mockAddress,
      mockSubgraphUrl,
    );

    expect(borrowMarkets).toEqual(["0xborrow1", "0xborrow2"]);
    expect(landMarkets).toEqual(["0xlend1"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const firstCallArgs = fetchMock.mock.calls[0];
    expect(firstCallArgs![0]).toBe(mockSubgraphUrl);
    expect(firstCallArgs![1]?.method).toBe("POST");
    expect(JSON.parse(firstCallArgs![1]?.body as string).query).toContain(
      `skip: 0, first: ${SUBGRAPH_PAGE_SIZE}`,
    );
    expect(JSON.parse(firstCallArgs![1]?.body as string).query).toContain(
      `userAddress: ${mockAddress}`,
    );

    const secondCallArgs = fetchMock.mock.calls[1];
    expect(JSON.parse(secondCallArgs![1]?.body as string).query).toContain(
      `skip: ${SUBGRAPH_PAGE_SIZE}, first: ${SUBGRAPH_PAGE_SIZE}`,
    );
  });

  it("should handle pagination correctly when data spans multiple pages", async () => {
    const mockUsersPage1 = Array.from({ length: SUBGRAPH_PAGE_SIZE }).map(
      (_, i) => ({
        principal: i % 2 === 0 ? "-100" : "100",
        proxyCometAddress: `0xpage1_${i % 2 === 0 ? "b" : "l"}${i}`,
      }),
    );
    const mockUsersPage2 = [
      { principal: "-500", proxyCometAddress: "0xpage2_b1" },
      { principal: "600", proxyCometAddress: "0xpage2_l1" },
    ];

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { users: mockUsersPage1 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { users: mockUsersPage2 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { users: [] } }),
      });

    const [borrowMarkets, landMarkets] = await fetchUserActiveMarkets(
      mockAddress,
      mockSubgraphUrl,
    );

    expect(fetchMock).toHaveBeenCalledTimes(3);

    const secondCallArgs = fetchMock.mock.calls[1];
    expect(JSON.parse(secondCallArgs![1]?.body as string).query).toContain(
      `skip: ${SUBGRAPH_PAGE_SIZE}, first: ${SUBGRAPH_PAGE_SIZE}`,
    );
    const thirdCallArgs = fetchMock.mock.calls[2];
    expect(JSON.parse(thirdCallArgs![1]?.body as string).query).toContain(
      `skip: ${SUBGRAPH_PAGE_SIZE * 2}, first: ${SUBGRAPH_PAGE_SIZE}`,
    );

    const expectedBorrows = mockUsersPage1
      .filter((u) => BigInt(u.principal) < 0)
      .map((u) => u.proxyCometAddress);
    expectedBorrows.push("0xpage2_b1");
    const expectedLends = mockUsersPage1
      .filter((u) => BigInt(u.principal) > 0)
      .map((u) => u.proxyCometAddress);
    expectedLends.push("0xpage2_l1");

    expect(borrowMarkets).toEqual(expectedBorrows);
    expect(landMarkets).toEqual(expectedLends);
  });

  it("should return empty arrays if the subgraph returns no users", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { users: [] } }),
    });

    const [borrowMarkets, landMarkets] = await fetchUserActiveMarkets(
      mockAddress,
      mockSubgraphUrl,
    );

    expect(borrowMarkets).toEqual([]);
    expect(landMarkets).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if the fetch response is not ok", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(
      fetchUserActiveMarkets(mockAddress, mockSubgraphUrl),
    ).rejects.toThrowError("[500] Failed to fetch subgraph!");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if the subgraph response contains errors", async () => {
    const mockSubgraphErrors = [
      { message: "Syntax Error" },
      { message: "Invalid field" },
    ];
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ errors: mockSubgraphErrors }),
    });

    await expect(
      fetchUserActiveMarkets(mockAddress, mockSubgraphUrl),
    ).rejects.toThrowError("Subgraph errors: Syntax Error Invalid field");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
