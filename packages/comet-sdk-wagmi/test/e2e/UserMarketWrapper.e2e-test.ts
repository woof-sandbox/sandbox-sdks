import { sepolia } from "@wagmi/core/chains";
import type { IMarket } from "@woof-software/comet-sdk";
import type { Address } from "viem";
import { beforeAll, describe, expect, test } from "vitest";
import { wagmiConfig } from "../../src";
import { UserMarketWrapper } from "../../src/wrappers/UserMarketWrapper";

const data: Partial<IMarket> = {
  cometAddress: "0xacb1c4d4de3ce962673326fb9c53d56ce4881cf4",
} as const;

let market: UserMarketWrapper;

describe("UserMarketWrapper", () => {
  beforeAll(async () => {
    market = await UserMarketWrapper.fetchUserMarket(
      data.cometAddress as Address,
      "0xacb1c4d4de3ce962673326fb9c53d56ce4881cf40044908ef517c28de800222a9f2030efbb01ee9afe",
      sepolia.id,
      wagmiConfig,
    );
  });

  test("collaterals ", async () => {
    const collaterals = market.collaterals;
    expect(collaterals.length).to.be.greaterThan(0);
  });

  test("check approve", async () => {
    const approve = market.approveToken(
      "0x306134121e8b55dfa9faba05de590e639a1f7d6b",
      "0.01",
      18,
    );
    console.log("--approve-", approve);
  });

  test("check supply collaterals", async () => {
    const supplyCollaterals = market.supplyCollaterals(
      [
        {
          tokenAddress: "0x306134121e8b55dfa9faba05de590e639a1f7d6b",
          inputAmount: "0.01",
        },
      ],
      sepolia.id,
    );
    console.log("--supplyCollaterals-", supplyCollaterals);
  });

  // test("check withdraw collaterals", async () => {
  //   const withdrawCollaterals = market.withDrawCollateral([
  //     {
  //       tokenAddress: "0x912ce59144191c1204e64559fe8253a0e49e6548",
  //       inputAmount: "0.01",
  //     },
  //   ]);
  //   console.log("--withdrawCollaterals-", withdrawCollaterals);
  // });

  test("check borrow and supply collaterals", async () => {
    const borrowAndSupplyCollaterals = market.borrowAndSupplyMarket("0.01", [
      {
        inputAmount: "0.01",
        tokenAddress: "0x306134121e8b55dfa9faba05de590e639a1f7d6b",
      },
    ]);
    console.log("--borrowAndSupplyCollaterals-", borrowAndSupplyCollaterals);
  });

  test("check supply", async () => {
    const supply = market.supplyMarket("0.01", false);
    console.log("--supply-", supply);
  });

  test("check borrow", async () => {
    const borrow = market.borrowMarket("0.01");
    console.log("--borrow-", borrow);
  });

  // test("check withDraw", async () => {
  //   const withDraw = market.withDrawMarket("0.01", false);
  //   console.log("--withDraw-", withDraw);
  // });

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
    const userSupply = Number(market.supplyBalance);
    expect(userSupply).to.be.greaterThan(0);
  });
});
