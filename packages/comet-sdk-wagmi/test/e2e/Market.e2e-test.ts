import { http, createConfig } from "@wagmi/core";
import { sepolia } from "@wagmi/core/chains";
import { type IMarket, PERCENT_PRECISION } from "@woof-software/comet-sdk";
import type { Address } from "viem";
import { beforeAll, describe, expect, test } from "vitest";
import { wagmiConfig } from "../../src";
import { Market } from "../../src/augment";

const percentsReg = new RegExp(`^\\d+\\.\\d{${PERCENT_PRECISION}}$`);
const RPC_URL = "https://1rpc.io/sepolia";
const data: Partial<IMarket> = {
  cometAddress: "0x4e24e491b68f2718fce98f0bc5064716db695619",
} as const;

let market: Market;

describe("MarketMethods", () => {
  beforeAll(async () => {
    createConfig({
      chains: [sepolia],
      transports: {
        [sepolia.id]: http(RPC_URL),
      },
    });

    market = await Market.fetchMarket(
      data.cometAddress as Address,
      sepolia.id,
      wagmiConfig,
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
