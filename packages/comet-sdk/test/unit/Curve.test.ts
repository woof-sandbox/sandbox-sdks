import { describe, expect, it } from "vitest";
import { Curve } from "../../src/curve/Curve";

const mockCurveData = {
  id: "curve1",
  supplyKink: 80n,
  supplyPerYearInterestRateSlopeLow: 10n,
  supplyPerYearInterestRateSlopeHigh: 20n,
  supplyPerYearInterestRateBase: 2n,
  borrowKink: 70n,
  borrowPerYearInterestRateSlopeLow: 15n,
  borrowPerYearInterestRateSlopeHigh: 25n,
  borrowPerYearInterestRateBase: 3n,
};

describe("Curve", () => {
  it("should assign all properties from constructor", () => {
    const curve = new Curve(mockCurveData);
    expect(curve.id).toBe(mockCurveData.id);
    expect(curve.supplyKink).toBe(mockCurveData.supplyKink);
    expect(curve.supplyPerYearInterestRateSlopeLow).toBe(
      mockCurveData.supplyPerYearInterestRateSlopeLow,
    );
    expect(curve.supplyPerYearInterestRateSlopeHigh).toBe(
      mockCurveData.supplyPerYearInterestRateSlopeHigh,
    );
    expect(curve.supplyPerYearInterestRateBase).toBe(
      mockCurveData.supplyPerYearInterestRateBase,
    );
    expect(curve.borrowKink).toBe(mockCurveData.borrowKink);
    expect(curve.borrowPerYearInterestRateSlopeLow).toBe(
      mockCurveData.borrowPerYearInterestRateSlopeLow,
    );
    expect(curve.borrowPerYearInterestRateSlopeHigh).toBe(
      mockCurveData.borrowPerYearInterestRateSlopeHigh,
    );
    expect(curve.borrowPerYearInterestRateBase).toBe(
      mockCurveData.borrowPerYearInterestRateBase,
    );
  });
});
