import { http, createConfig } from "@wagmi/core";
import { sepolia } from "@wagmi/core/chains";
import "../../src/augment/Collateral";
import { Collateral, type IMarket } from "@woof-software/comet-sdk";
import type { Address } from "viem";
import { beforeAll, describe, expect, test } from "vitest";
import { SepoliaConfig } from "../sepolia.config";

const RPC_URL = SepoliaConfig.rpcUrl;
const data: Partial<IMarket> = {
  cometAddress: SepoliaConfig.comet1,
} as const;

let collaterals: Collateral[];

describe("Collateral Methods", () => {
  beforeAll(async () => {
    createConfig({
      chains: [sepolia],
      transports: {
        [sepolia.id]: http(RPC_URL),
      },
    });

    collaterals = await Collateral.fetch(
      data.cometAddress as Address,
      sepolia.id,
    );
  });

  test("collaterals available", () => {
    expect(collaterals.length, "No collaterals were fetched").greaterThan(0);
  });

  test("should contain collateralFactor", () => {
    const collateral = collaterals[0]!;
    expect(
      collateral.collateralFactor,
      "collateralFactor is missing or undefined",
    ).to.be.a("bigint");
    expect(
      collateral.collateralFactor,
      "collateralFactor must be greater than 0",
    ).greaterThan(0);
  });

  test("should contain totalSupplyAssetUSD", () => {
    const collateral = collaterals[0]!;
    expect(
      collateral.totalSupplyAssetUSD,
      "totalSupplyAssetUSD must be greater than 0",
    ).greaterThan(0);
  });

  test("should contain collateralFactor", () => {
    const collateral = collaterals[0]!;
    expect(
      collateral.supplyCapUSD,
      "getSupplyCapUSD must be greater than 0",
    ).greaterThan(0);
  });
});
