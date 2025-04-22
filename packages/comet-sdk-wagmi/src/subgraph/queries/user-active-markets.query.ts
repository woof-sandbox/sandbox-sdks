import type { CollectionQuery } from "@sandbox/subgraph-sdk";

// Returns query factory
export const userActiveMarketQuery =
  (userAddress: string): CollectionQuery =>
  (skip, pageSize) =>
    `{
          users(where: { userAddress: ${userAddress}, principal_not: "0" }, orderBy: createdAt, orderDirection: asc, skip: ${skip}, first: ${pageSize}) {
            principal
            proxyCometAddress
          }
        }`;
