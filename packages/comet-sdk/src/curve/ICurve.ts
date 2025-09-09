export interface ICurve {
  supplyKink: bigint; // percents 900000000000000000 //
  supplyPerYearInterestRateSlopeLow: bigint; // percents 1712328767 * SecPerYear
  supplyPerYearInterestRateSlopeHigh: bigint; // percents 96207508878 * SecPerYear
  supplyPerYearInterestRateBase: bigint; // percents 0
  borrowKink: bigint; // percents 900000000000000000
  borrowPerYearInterestRateSlopeLow: bigint; // percents 1585489599 * SecPerYear
  borrowPerYearInterestRateSlopeHigh: bigint; // percents 107813292744 * SecPerYear
  borrowPerYearInterestRateBase: bigint; // percents 475646879 * SecPerYear
}
