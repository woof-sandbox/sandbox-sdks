import { http, createConfig } from "@wagmi/core";
import { sepolia } from "@wagmi/core/chains";
import { type IMarket, PERCENT_PRECISION } from "@woof-software/comet-sdk";
import { Address, isAddress } from "viem";
import { beforeAll, describe, expect, test } from "vitest";
import { wagmiConfig } from "../../src";
import { Market } from "../../src/augment";
import {sepoliaAddressConfig} from "../address-e2e.config";

const percentsReg = new RegExp(`^\\d+\\.\\d{${PERCENT_PRECISION}}$`);
const RPC_URL = sepoliaAddressConfig.rpcUrl;
const data: Partial<IMarket> = {
  cometAddress: sepoliaAddressConfig.comet1,
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
  });

  test("should calculate the correct borrow APR", async () => {
    const percents = market.borrowApr.toFixed(PERCENT_PRECISION);
    expect(percents).to.be.match(percentsReg);
  });

  test("should calculate the correct supply APR", () => {
    const percents = market.supplyApr.toFixed(PERCENT_PRECISION);
    expect(percents).to.be.match(percentsReg);
  });

  test("should contain ownerAddress", () => {
    expect(market.ownerAddress, "ownerAddress is missing").to.be.a("string");
    expect(isAddress(market.ownerAddress), "ownerAddress is not valid").to.be.true;
  });

  test("should contain guardianAddress", () => {
    expect(market.guardianAddress, "guardianAddress is missing").to.be.a("string");
    expect(isAddress(market.guardianAddress), "guardianAddress is not valid").to.be.true;
  });

  test("should contain configControllerAddress", () => {
    expect(market.configControllerAddress, "configControllerAddress is missing").to.be.a("string");
    expect(isAddress(market.configControllerAddress), "configControllerAddress is not valid").to.be.true;
  });

  test("should contain curatorFee", () => {
    expect(market.curatorFee, "curatorFee is missing").to.be.a("number");
    expect(market.curatorFee).to.be.gte(0);
  });
});