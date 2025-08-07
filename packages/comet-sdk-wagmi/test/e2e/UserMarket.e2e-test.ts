import type { IMarket } from "@woof-software/comet-sdk";
import { UserMarket } from "../../src/augment";
import { sepolia } from "@wagmi/core/chains";
import { beforeAll, describe, expect, test } from "vitest";
import { wagmiConfig } from "../../src/contracts";
import {Address} from "viem";

const data: Partial<IMarket> = {
  cometAddress: "0xacb1c4d4de3ce962673326fb9c53d56ce4881cf4",
} as const;

let market: UserMarket;

describe("MarketMethods", () => {
  beforeAll(async () => {
    market = await UserMarket.fetchUserMarket(
      data.cometAddress as Address,
      "0xacb1c4d4de3ce962673326fb9c53d56ce4881cf40044908ef517c28de800222a9f2030efbb01ee9afe",
      sepolia.id,
      wagmiConfig,
    );
    console.log();
  });

  test("check availableLiquidity", async () => {
    const availableLiquidity = Number(market.availableLiquidity);
    expect(availableLiquidity).to.be.greaterThan(0);
  });
  test("check supplyRate", async () => {
    const supplyRate = Number(market.supplyRate);
    expect(supplyRate).to.be.greaterThan(0);
  });
  test("check borrowRate", async () => {
    const borrowRate = Number(market.borrowRate);
    expect(borrowRate).to.be.greaterThan(0);
  });

  test("check utilization", async () => {
    const utilization = Number(market.utilization);
    expect(utilization).to.be.greaterThan(0);
  });

  test("check supply user", async () => {
    console.log("--market--", market);
    const userSupply = Number(market.supplyBalance);
    expect(userSupply).to.be.greaterThan(0);
  });
});
