import { Curve } from "@sandbox/comet-sdk";
import { MulticallUnit, Tagable } from "@sandbox/contracts-tools-sdk-ethers";
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
  const multicall = new MulticallUnit(driver);

  const supplyKinkTag = multicall.add(comet.getSupplyKinkCall(), "supplyKink");
  const supplySlopeLowTag = multicall.add(
    comet.getSupplyPerSecondInterestRateSlopeLowCall(),
    "supplySlopeLow",
  );
  const supplySlopeHighTag = multicall.add(
    comet.getSupplyPerSecondInterestRateSlopeHighCall(),
    "supplySlopeHigh",
  );
  const supplyRateBaseTag = multicall.add(
    comet.getSupplyPerSecondInterestRateBaseCall(),
    "supplyRateBase",
  );

  const borrowKinkTag = multicall.add(comet.getBorrowKinkCall(), "borrowKink");
  const borrowSlopeLowTag = multicall.add(
    comet.getBorrowPerSecondInterestRateSlopeLowCall(),
    "borrowSlopeLow",
  );
  const borrowSlopeHighTag = multicall.add(
    comet.getBorrowPerSecondInterestRateSlopeHighCall(),
    "borrowSlopeHigh",
  );
  const borrowRateBaseTag = multicall.add(
    comet.getBorrowPerSecondInterestRateBaseCall(),
    "borrowRateBase",
  );

  await multicall.run();

  const supplyKink = multicall.getSingle<bigint>(supplyKinkTag);
  if (supplyKink === null) throw MULTICALL_ERRORS.RESULT_NOT_FOUND(supplyKinkTag as Tagable);
  const supplySlopeLow = multicall.getSingle<bigint>(supplySlopeLowTag);
  if (supplySlopeLow === null)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(supplySlopeLowTag as Tagable);
  const supplySlopeHigh = multicall.getSingle<bigint>(supplySlopeHighTag);
  if (supplySlopeHigh === null)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(supplySlopeHighTag as Tagable);
  const supplyRateBase = multicall.getSingle<bigint>(supplyRateBaseTag);
  if (supplyRateBase === null)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(supplyRateBaseTag as Tagable);

  const borrowKink = multicall.getSingle<bigint>(borrowKinkTag);
  if (borrowKink === null) throw MULTICALL_ERRORS.RESULT_NOT_FOUND(borrowKinkTag as Tagable);
  const borrowSlopeLow = multicall.getSingle<bigint>(borrowSlopeLowTag);
  if (borrowSlopeLow === null)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(borrowSlopeLowTag as Tagable);
  const borrowSlopeHigh = multicall.getSingle<bigint>(borrowSlopeHighTag);
  if (borrowSlopeHigh === null)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(borrowSlopeHighTag as Tagable);
  const borrowRateBase = multicall.getSingle<bigint>(borrowRateBaseTag);
  if (borrowRateBase === null)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(borrowRateBaseTag as Tagable);

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
