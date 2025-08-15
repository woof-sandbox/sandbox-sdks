import { sepolia } from "@wagmi/core/chains";
import type { IMarket } from "@woof-software/comet-sdk";
import { type Address, isAddress } from "viem";
import { beforeAll, describe, expect, test } from "vitest";
import { UserMarket } from "../../src/augment";
import { wagmiConfig } from "../../src/contracts";
import { sepoliaAddressConfig } from "../address-e2e.config";

const data: Partial<IMarket> = {
  cometAddress: sepoliaAddressConfig.comet1,
} as const;

let market: UserMarket;

describe("MarketMethods", () => {
  beforeAll(async () => {
    market = await UserMarket.fetchUserMarket(
      data.cometAddress as Address,
      sepoliaAddressConfig.userMarket,
      sepolia.id,
      wagmiConfig,
    );
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

  test("should contain ownerAddress", () => {
    expect(market.ownerAddress, "ownerAddress is missing").to.be.a("string");
    expect(isAddress(market.ownerAddress), "ownerAddress is not valid").to.be
      .true;
  });

  test("should contain guardianAddress", () => {
    expect(market.guardianAddress, "guardianAddress is missing").to.be.a(
      "string",
    );
    expect(isAddress(market.guardianAddress), "guardianAddress is not valid").to
      .be.true;
  });

  test("should contain configControllerAddress", () => {
    expect(
      market.configControllerAddress,
      "configControllerAddress is missing",
    ).to.be.a("string");
    expect(
      isAddress(market.configControllerAddress),
      "configControllerAddress is not valid",
    ).to.be.true;
  });

  test("should contain curatorFee", () => {
    expect(market.curatorFee, "curatorFee is missing").to.be.a("number");
    expect(market.curatorFee).to.be.gte(0);
  });
});
