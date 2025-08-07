import { User } from "@woof-software/comet-sdk";
import {
  type CollectionCallback,
  fetchCollection,
} from "@woof-software/subgraph-sdk";
import type { IUser } from "../subgraph/entities";
import { userActiveMarketQuery } from "../subgraph/queries";

export async function fetchUserMock(
  userAddress?: string,
  subgraphUrl?: string,
): Promise<User> {
  void subgraphUrl;

  const address = userAddress || "0xd0e4a05a84ce039be8647ca8089266117a7e96c5";
  const borrowMarkets = ["0x3afdc9bca9213a35503b077a6072f3d0d5ab0840"]; // USDt comet
  const lendMarkets = ["0x3afdc9bca9213a35503b077a6072f3d0d5ab0840"];

  return new User({
    address,
    borrowMarkets,
    lendMarkets,
  });
}

export async function fetchUser(
  userAddress: string,
  subgraphUrl: string,
): Promise<User> {
  const [borrowMarkets, lendMarkets] = await fetchUserActiveMarkets(
    userAddress,
    subgraphUrl,
  );

  return new User({
    address: userAddress,
    borrowMarkets,
    lendMarkets,
  });
}

export async function fetchUserActiveMarkets(
  address: string,
  subgraphUrl: string,
  options: {
    token?: string;
  } = {},
): Promise<[string[], string[]]> {
  const borrowMarkets: Set<string> = new Set();
  const lendMarkets: Set<string> = new Set();

  const callback: CollectionCallback = (result, params) => {
    const subgraphUser = result?.data?.users;
    if (!subgraphUser?.length || subgraphUser.length < params.pageSize) {
      params.loopFlag = false;
    }
    subgraphUser.forEach((user: IUser) => {
      const principal = BigInt(user.principal);
      if (principal < 0n) {
        borrowMarkets.add(user.comet.market.id);
      } else if (principal > 0n) {
        lendMarkets.add(user.comet.market.id);
      }
    });
  };

  await fetchCollection(
    userActiveMarketQuery(address),
    callback,
    subgraphUrl,
    options,
  );

  return [Array.from(borrowMarkets), Array.from(lendMarkets)];
}
