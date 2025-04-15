import { UserMarket } from "../../src/augment";

import { arbitrum, mainnet } from "@wagmi/core/chains";
import { beforeAll, describe, expect, test } from "vitest";
import { UserMarketWrapper } from "../../src/wrapper/UserMarketWrapper";

const marketsArbitrum: `0x${string}`[] = [
  "0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07", // USDT
  "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf", // USDC
  "0x6f7D514bbD4aFf3BcD1140B7344b32f063dEe486", // WETH
];
const marketsMainnet: `0x${string}`[] = [
  "0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840", // USDT
  "0xc3d688B66703497DAA19211EEdff47f25384cdc3", // USDC
];

let market: UserMarketWrapper[];

describe("UserMarketWrapper", () => {
  beforeAll(async () => {
    const userMarkets = await UserMarket.fetchMarkets(
      {
        [arbitrum.id]: marketsArbitrum,
        [mainnet.id]: marketsMainnet,
      },
      "0x23eEF61AB548a8852117561689886f583FC0E2B7",
    );

    market = await Promise.all(
      userMarkets.map(
        async (userMarket) => new UserMarketWrapper(await userMarket),
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
