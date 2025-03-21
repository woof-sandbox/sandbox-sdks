export interface ICurve {
  id: number;
  //
  supplyKink: number; // percents
  supplyPerYearInterestRateSlopeLow: number; // percents
  supplyPerYearInterestRateSlopeHigh: number; // percents
  supplyPerYearInterestRateBase: number; // percents
  sorrowKink: number; // percents
  borrowPerYearInterestRateSlopeLow: number; // percents
  borrowPerYearInterestRateSlopeHigh: number; // percents
  borrowPerYearInterestRateBase: number; // percents
}
