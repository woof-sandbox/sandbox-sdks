import type { CollectionQuery } from "./collection-query";

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
