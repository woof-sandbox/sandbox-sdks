import { multicall } from "@wagmi/core";
import { Curve, SECONDS_PER_YEAR } from "@woof-software/comet-sdk";
import type { Address } from "viem";
import type { WagmiChainId } from "../config";
import { CometContract, wagmiConfig } from "../contracts";
import { WagmiUtils } from "../utils";

const secsPerYear = BigInt(SECONDS_PER_YEAR);

export async function fetchCurvesMocks(
  cometProxyAddress?: Address,
  chainId?: WagmiChainId,
): Promise<Curve[]> {
  return [
    new Curve({
      id: "42",
      supplyKink: 900000000000000000n,
      supplyPerYearInterestRateSlopeLow: 1712328767n * secsPerYear,
      supplyPerYearInterestRateSlopeHigh: 96207508878n * secsPerYear,
      supplyPerYearInterestRateBase: 0n,
      borrowKink: 900000000000000000n,
      borrowPerYearInterestRateSlopeLow: 1585489599n * secsPerYear,
      borrowPerYearInterestRateSlopeHigh: 107813292744n * secsPerYear,
      borrowPerYearInterestRateBase: 475646879n * secsPerYear,
    }),
  ];
}

export async function fetchCurves(
  cometProxyAddress: Address,
  chainId: WagmiChainId,
): Promise<Curve[]> {
  const comet = new CometContract(cometProxyAddress, chainId);

  const curveData = await multicall(wagmiConfig, {
    chainId,
    contracts: [
      comet.getSupplyKinkCall(),
      comet.getSupplyPerSecondInterestRateSlopeLowCall(),
      comet.getSupplyPerSecondInterestRateSlopeHighCall(),
      comet.getSupplyPerSecondInterestRateBaseCall(),
      //
      comet.getBorrowKinkCall(),
      comet.getBorrowPerSecondInterestRateSlopeLowCall(),
      comet.getBorrowPerSecondInterestRateSlopeHighCall(),
      comet.getBorrowPerSecondInterestRateBaseCall(),
    ],
  });

  const supplyKink = WagmiUtils.resultOrThrow<bigint>(curveData[0]);
  const supplySlopeLow = WagmiUtils.resultOrThrow<bigint>(curveData[1]);
  const supplySlopeHigh = WagmiUtils.resultOrThrow<bigint>(curveData[2]);
  const supplyRateBase = WagmiUtils.resultOrThrow<bigint>(curveData[3]);

  const borrowKink = WagmiUtils.resultOrThrow<bigint>(curveData[4]);
  const borrowSlopeLow = WagmiUtils.resultOrThrow<bigint>(curveData[5]);
  const borrowSlopeHigh = WagmiUtils.resultOrThrow<bigint>(curveData[6]);
  const borrowRateBase = WagmiUtils.resultOrThrow<bigint>(curveData[7]);

  return [
    new Curve({
      id: "42", // TODO: sandbox functionality
      supplyKink,
      supplyPerYearInterestRateSlopeLow: supplySlopeLow * secsPerYear,
      supplyPerYearInterestRateSlopeHigh: supplySlopeHigh * secsPerYear,
      supplyPerYearInterestRateBase: supplyRateBase * secsPerYear,
      borrowKink,
      borrowPerYearInterestRateSlopeLow: borrowSlopeLow * secsPerYear,
      borrowPerYearInterestRateSlopeHigh: borrowSlopeHigh * secsPerYear,
      borrowPerYearInterestRateBase: borrowRateBase * secsPerYear,
    }),
  ];
}
