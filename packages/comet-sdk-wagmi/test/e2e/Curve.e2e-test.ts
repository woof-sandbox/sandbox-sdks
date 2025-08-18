import { http, createConfig } from "@wagmi/core";
import { sepolia } from "@wagmi/core/chains";
import "../../src/augment/Curve";
import { Curve, type IMarket } from "@woof-software/comet-sdk";
import type { Address } from "viem";
import { beforeAll, describe, expect, test } from "vitest";
import { SepoliaConfig } from "../sepolia.config";

const RPC_URL = SepoliaConfig.rpcUrl;
const data: Partial<IMarket> = {
  cometAddress: SepoliaConfig.comet1,
} as const;

let curves: Curve[];

describe("Curve Methods", () => {
  beforeAll(async () => {
    createConfig({
      chains: [sepolia],
      transports: {
        [sepolia.id]: http(RPC_URL),
      },
    });

    curves = await Curve.fetch(data.cometAddress as Address, sepolia.id);
  });

  test("curves available", () => {
    expect(curves.length, "No curves were fetched").greaterThan(0);
  });

  test("should contain supplyKink", () => {
    const curve = curves[0]!;
    expect(curve.supplyKink, "supplyKink is missing").to.be.a("bigint");
    expect(curve.supplyKink, "supplyKink is not valid").greaterThan(0);
  });

  test("should contain borrowPerYearInterestRateSlopeHigh", () => {
    const curve = curves[0]!;
    expect(
      curve.borrowPerYearInterestRateSlopeHigh,
      "borrowPerYearInterestRateSlopeHigh is missing",
    ).to.be.a("bigint");
    expect(
      curve.borrowPerYearInterestRateSlopeHigh,
      "borrowPerYearInterestRateSlopeHigh is not valid",
    ).greaterThan(0);
  });
});
