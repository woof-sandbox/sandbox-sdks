import { Curve } from "@sandbox/comet-sdk/src/curve";
import type { Provider, Signer } from "ethers";

const secsPerYear = 60n * 60n * 24n * 365n;

export async function fetchCurvesMocks(
  cometProxyAddress?: string,
  driver?: Provider | Signer,
): Promise<Curve[]> {
  return [
    new Curve({
      id: 42,
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
