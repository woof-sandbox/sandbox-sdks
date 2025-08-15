import { UserMarket } from "../../src/augment";

import { sepolia } from "@wagmi/core/chains";
import type { Address } from "viem";
import { beforeAll, describe, expect, test } from "vitest";
import { wagmiConfig } from "../../src";
import { UserMarketWrapper } from "../../src/wrappers/UserMarketWrapper";
import {sepoliaAddressConfig} from "../address-e2e.config";

const marketsSepolia: Address[] = [
  sepoliaAddressConfig.comet1!,
  sepoliaAddressConfig.comet2!,
];

let market: UserMarketWrapper[];

describe("UserMarketWrapper", () => {
  beforeAll(async () => {
    const userMarkets = await UserMarket.fetchUserMarkets(
        {
          [sepolia.id]: marketsSepolia,
        },
        sepoliaAddressConfig.userMarket,
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
  test("check supplyRate", async () => {
    const supplyRate = Number(market[0]?.supplyRate);
    expect(supplyRate).to.be.greaterThan(0);
  });
  test("check borrowRate", async () => {
    const borrowRate = Number(market[0]?.borrowRate);
    expect(borrowRate).to.be.greaterThan(0);
  });

  test("check utilization", async () => {
    const utilization = Number(market[0]?.utilization);
    expect(utilization).to.be.greaterThan(0);
  });

  test("check supply user", async () => {
    const userSupply = Number(market[0]?.supplyBalance);
    expect(userSupply).to.be.greaterThan(0);
  });
});