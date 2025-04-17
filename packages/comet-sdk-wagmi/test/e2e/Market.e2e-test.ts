import { type IMarket, PERCENT_PRECISION } from "@sandbox/comet-sdk";
import { Market } from "../../src/augment";
import { beforeAll, describe, expect, test } from "vitest";
import {arbitrum} from "@wagmi/core/chains";
import {createConfig, http} from "@wagmi/core";

const percentsReg = new RegExp(`^\\d+\\.\\d{${PERCENT_PRECISION}}$`);
const RPC_URL = "https://eth.llamarpc.com";
const data: Partial<IMarket> = {
  cometAddress: "0x3afdc9bca9213a35503b077a6072f3d0d5ab0840",
} as const;

let market: Market;

describe("MarketMethods", () => {
  beforeAll(async () => {
    createConfig({
      chains: [arbitrum],
      transports: {
        [arbitrum.id]: http(RPC_URL),
      },
    });

    market = await Market.fetch(
      data.cometAddress as `0x${string}`,
      arbitrum.id,
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
