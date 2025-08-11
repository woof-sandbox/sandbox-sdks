import { UserMarket } from "../../src/augment";

import { arbitrum, mainnet, sepolia } from "@wagmi/core/chains";
import type { Address } from "viem";
import { beforeAll, describe, expect, test } from "vitest";
import { wagmiConfig } from "../../src";
import { UserMarketWrapper } from "../../src/wrappers/UserMarketWrapper";

const marketsArbitrum: Address[] = [
  "0xd98be00b5d27fc98112bde293e487f8d4ca57d07", // USDT
  "0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf", // USDC
  "0x6f7d514bbd4aff3bcd1140b7344b32f063dee486", // WETH
];
const marketsMainnet: Address[] = [
  "0x3afdc9bca9213a35503b077a6072f3d0d5ab0840", // USDT
  "0xc3d688b66703497daa19211eedff47f25384cdc3", // USDC
];

let market: UserMarketWrapper[];

describe("UserMarketWrapper", () => {
  beforeAll(async () => {
    const userMarkets = await UserMarket.fetchUserMarkets(
      {
        [arbitrum.id]: marketsArbitrum,
        [mainnet.id]: marketsMainnet,
      },
      "0x23eef61ab548a8852117561689886f583fc0e2b7",
      wagmiConfig,
    );

    market = await Promise.all(
      userMarkets.map(
        async (userMarket) =>
          new UserMarketWrapper(userMarket, wagmiConfig, sepolia.id),
      ),
    );
  });

  test("check availableLiquidity 1", async () => {
    const availableLiquidity = Number(market[0]?.availableLiquidity || 0);
    console.log(market);
    expect(availableLiquidity).to.be.greaterThan(0);
  });
  test("check availableLiquidity 2", async () => {
    const availableLiquidity = Number(market[1]?.availableLiquidity || 0);

    expect(availableLiquidity).to.be.greaterThan(0);
  });
  test("check availableLiquidity 3", async () => {
    const availableLiquidity = Number(market[2]?.availableLiquidity || 0);

    expect(availableLiquidity).to.be.greaterThan(0);
  });
  // test("check supplyRate", async () => {
  //     const supplyRate = Number(market.supplyRate);
  //     expect(supplyRate).to.be.greaterThan(0);
  // });
  // test("check borrowRate", async () => {
  //     const borrowRate = Number(market.borrowRate);
  //     expect(borrowRate).to.be.greaterThan(0);
  // });
  //
  // test("check utilization", async () => {
  //     const utilization = Number(market.utilization);
  //     expect(utilization).to.be.greaterThan(0);
  // });
  //
  // test("check supply user", async () => {
  //     const userSupply = Number(market.supplyBalance);
  //     expect(userSupply).to.be.greaterThan(0);
  // });
});
