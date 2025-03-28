import { User } from "@sandbox/comet-sdk";
import type { Provider, Signer } from "ethers";
import { ELEMENTS_PER_PAGE_FOR_SUBGRAPH } from "../constants";

export async function fetchUserMock(
    userAddress?: string,
    driver?: Provider | Signer,
): Promise<User> {
  const address = userAddress || "0xd0E4A05a84ce039be8647cA8089266117a7E96C5";
  const borrowMarkets = ["0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840"]; // USDt comet
  const landMarkets = ["0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840"];

  return new User({
    address,
    borrowMarkets,
    landMarkets,
  });
}

export async function getUserActiveMarkets(
    address: string,
    subgraphUrl: string,
): Promise<[string[], string[]]> {
  const borrowMarkets: string[] = [];
  const landMarkets: string[] = [];

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, multipart/mixed",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
  };
  const method = "POST";

  let flag = true;
  let prevPage = 0;
  while (flag) {
    const skip = prevPage * ELEMENTS_PER_PAGE_FOR_SUBGRAPH;

    const body = JSON.stringify({
      query: `{
          users(where: { userAddress: ${address}, principal_not: "0" }, orderBy: createdAt, orderDirection: asc, skip: ${skip}, first: ${ELEMENTS_PER_PAGE_FOR_SUBGRAPH}) {
            principal
            proxyCometAddress
          }
        }`,
    });

    const response = await fetch(subgraphUrl, {
      method,
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
    const subgraphUser = result.data?.users;
    if (!subgraphUser?.length) {
      flag = false;
    } else {
      prevPage++;
      subgraphUser.forEach((user: any) => {
        if (BigInt(user.principal) < 0) {
          borrowMarkets.push(user.proxyCometAddress);
        } else {
          landMarkets.push(user.proxyCometAddress);
        }
      });
    }
  }

  return [borrowMarkets, landMarkets];
}
