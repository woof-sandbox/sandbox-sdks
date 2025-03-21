import type { ICurve } from "./ICurve";

export class Curve implements ICurve {
  public id: number;
  public supplyKink: number; // percents
  public supplyPerYearInterestRateSlopeLow: number; // percents
  public supplyPerYearInterestRateSlopeHigh: number; // percents
  public supplyPerYearInterestRateBase: number; // percents
  public sorrowKink: number; // percents
  public borrowPerYearInterestRateSlopeLow: number; // percents
  public borrowPerYearInterestRateSlopeHigh: number; // percents
  public borrowPerYearInterestRateBase: number; // percents

  constructor(curveData: ICurve) {
    this.id = curveData.id;
    this.supplyKink = curveData.supplyKink;
    this.supplyPerYearInterestRateSlopeLow =
      curveData.supplyPerYearInterestRateSlopeLow;
    this.supplyPerYearInterestRateSlopeHigh =
      curveData.supplyPerYearInterestRateSlopeHigh;
    this.supplyPerYearInterestRateBase =
      curveData.supplyPerYearInterestRateBase;
    this.sorrowKink = curveData.sorrowKink;
    this.borrowPerYearInterestRateSlopeLow =
      curveData.borrowPerYearInterestRateSlopeLow;
    this.borrowPerYearInterestRateSlopeHigh =
      curveData.borrowPerYearInterestRateSlopeHigh;
    this.borrowPerYearInterestRateBase =
      curveData.borrowPerYearInterestRateBase;
  }
}
