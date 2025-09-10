import type { ICurve } from "./ICurve";

export class Curve implements ICurve {
  public id: string;
  public supplyKink: bigint; // percents
  public supplyPerYearInterestRateSlopeLow: bigint; // percents
  public supplyPerYearInterestRateSlopeHigh: bigint; // percents
  public supplyPerYearInterestRateBase: bigint; // percents
  public borrowKink: bigint; // percents
  public borrowPerYearInterestRateSlopeLow: bigint; // percents
  public borrowPerYearInterestRateSlopeHigh: bigint; // percents
  public borrowPerYearInterestRateBase: bigint; // percents

  constructor(curveData: ICurve) {
    this.id = curveData.id;
    this.supplyKink = curveData.supplyKink;
    this.supplyPerYearInterestRateSlopeLow =
      curveData.supplyPerYearInterestRateSlopeLow;
    this.supplyPerYearInterestRateSlopeHigh =
      curveData.supplyPerYearInterestRateSlopeHigh;
    this.supplyPerYearInterestRateBase =
      curveData.supplyPerYearInterestRateBase;
    this.borrowKink = curveData.borrowKink;
    this.borrowPerYearInterestRateSlopeLow =
      curveData.borrowPerYearInterestRateSlopeLow;
    this.borrowPerYearInterestRateSlopeHigh =
      curveData.borrowPerYearInterestRateSlopeHigh;
    this.borrowPerYearInterestRateBase =
      curveData.borrowPerYearInterestRateBase;
  }
}
