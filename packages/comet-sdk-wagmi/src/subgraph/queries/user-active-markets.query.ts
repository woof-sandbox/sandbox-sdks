import type { CollectionQueryFactory } from "@woof-software/subgraph-sdk";

// Returns query factory
export const userActiveMarketQuery =
  (userAddress: string): CollectionQueryFactory =>
  (skip, pageSize) =>
    `{
          users(where: { userAddress: ${userAddress}, principal_not: "0" }, orderBy: createdAt, orderDirection: asc, skip: ${skip}, first: ${pageSize}) {
            principal
            comet {
                market {
                    id
                }
            }
          }
        }`;
