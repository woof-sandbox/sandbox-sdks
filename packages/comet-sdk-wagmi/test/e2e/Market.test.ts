import { type IMarket, PERCENT_PRECISION } from "@sandbox/comet-sdk";
import { Market } from "../../src/augment";

import { ethers } from "ethers";
import { beforeAll, describe, expect, test } from "vitest";

const percentsReg = new RegExp(`^\\d+\\.\\d{${PERCENT_PRECISION}}$`);
const RPC_URL = "https://eth.llamarpc.com";
const data: Partial<IMarket> = {
  cometAddress: "0x3afdc9bca9213a35503b077a6072f3d0d5ab0840",
} as const;

let market: Market;

describe("MarketMethods", () => {
  beforeAll(async () => {
    market = await Market.fetch(
      data.cometAddress as `0x${string}`,
      new ethers.JsonRpcProvider(RPC_URL),
    );
    console.log();
  });

  test("should calculate the correct borrow APR", async () => {
    const percents = market.borrowApr.toFixed(PERCENT_PRECISION);
    expect(percents).to.be.match(percentsReg);
  });

  test("should calculate the correct supply APR", () => {
    const percents = market.supplyApr.toFixed(PERCENT_PRECISION);
    expect(percents).to.be.match(percentsReg);
  });
});
