import { Curve } from "@sandbox/comet-sdk";
import { MulticallContract } from "@sandbox/contracts-tools-sdk-ethers";
import type { Provider, Signer } from "ethers";
import { CometContract } from "../contracts";
import { MULTICALL_ERRORS } from "../errors/multicall";

const secsPerYear = 60n * 60n * 24n * 365n;

export async function fetchCurvesMocks(
  cometProxyAddress?: string,
  driver?: Provider | Signer,
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
  cometProxyAddress: string,
  driver: Provider | Signer,
): Promise<Curve[]> {
  const comet = new CometContract(cometProxyAddress, driver);
  const multicall = new MulticallContract(driver);

  const supplyKinkTag = multicall.add("supplyKink", comet.getSupplyKinkCall());
  const supplySlopeLowTag = multicall.add(
    "supplySlopeLow",
    comet.getSupplyPerSecondInterestRateSlopeLowCall(),
  );
  const supplySlopeHighTag = multicall.add(
    "supplySlopeHigh",
    comet.getSupplyPerSecondInterestRateSlopeHighCall(),
  );
  const supplyRateBaseTag = multicall.add(
    "supplyRateBase",
    comet.getSupplyPerSecondInterestRateBaseCall(),
  );

  const borrowKinkTag = multicall.add("borrowKink", comet.getBorrowKinkCall());
  const borrowSlopeLowTag = multicall.add(
    "borrowSlopeLow",
    comet.getBorrowPerSecondInterestRateSlopeLowCall(),
  );
  const borrowSlopeHighTag = multicall.add(
    "borrowSlopeHigh",
    comet.getBorrowPerSecondInterestRateSlopeHighCall(),
  );
  const borrowRateBaseTag = multicall.add(
    "borrowRateBase",
    comet.getBorrowPerSecondInterestRateBaseCall(),
  );

  await multicall.run();

  const supplyKink = multicall.getSingle<bigint>(supplyKinkTag);
  if (!supplyKink) throw MULTICALL_ERRORS.RESULT_NOT_FOUND(supplyKinkTag);
  const supplySlopeLow = multicall.getSingle<bigint>(supplySlopeLowTag);
  if (!supplySlopeLow)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(supplySlopeLowTag);
  const supplySlopeHigh = multicall.getSingle<bigint>(supplySlopeHighTag);
  if (!supplySlopeHigh)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(supplySlopeHighTag);
  const supplyRateBase = multicall.getSingle<bigint>(supplyRateBaseTag);
  if (!supplyRateBase)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(supplyRateBaseTag);

  const borrowKink = multicall.getSingle<bigint>(borrowKinkTag);
  if (!borrowKink) throw MULTICALL_ERRORS.RESULT_NOT_FOUND(borrowKinkTag);
  const borrowSlopeLow = multicall.getSingle<bigint>(borrowSlopeLowTag);
  if (!borrowSlopeLow)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(borrowSlopeLowTag);
  const borrowSlopeHigh = multicall.getSingle<bigint>(borrowSlopeHighTag);
  if (!borrowSlopeHigh)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(borrowSlopeHighTag);
  const borrowRateBase = multicall.getSingle<bigint>(borrowRateBaseTag);
  if (!borrowRateBase)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(borrowRateBaseTag);

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
