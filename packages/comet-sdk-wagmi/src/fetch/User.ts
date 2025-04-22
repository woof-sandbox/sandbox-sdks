import { User } from "@sandbox/comet-sdk";
import {
  type CollectionCallback,
  fetchCollection,
} from "@sandbox/subgraph-sdk"; // Ensure the package is installed using `npm install @sandbox/subgraph-sdk`
import type { IUser } from "../subgraph/entities";
import { userActiveMarketQuery } from "../subgraph/queries";

export async function fetchUserMock(
  userAddress?: string,
  subgraphUrl?: string,
): Promise<User> {
  const address = userAddress || "0xd0E4A05a84ce039be8647cA8089266117a7E96C5";
  const borrowMarkets = ["0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840"]; // USDt comet
  const lendMarkets = ["0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840"];

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
): Promise<[string[], string[]]> {
  const borrowMarkets: Set<string> = new Set();
  const lendMarkets: Set<string> = new Set();

  const callback: CollectionCallback = (result, params) => {
    const subgraphUser = result?.data?.users;
    if (!subgraphUser?.length || subgraphUser.length < params.pageSize) {
      params.loopFlag = false;
    }
    subgraphUser.forEach((user: IUser) => {
      if (BigInt(user.principal) < 0n) {
        borrowMarkets.add(user.proxyCometAddress);
      } else {
        lendMarkets.add(user.proxyCometAddress);
      }
    });
  };

  await fetchCollection(userActiveMarketQuery(address), callback, subgraphUrl);

  return [Array.from(borrowMarkets), Array.from(lendMarkets)];
}
