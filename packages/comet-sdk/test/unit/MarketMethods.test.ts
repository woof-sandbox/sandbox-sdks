import { type IMarket, MarketMethods } from "../../src";

import { describe, expect, test } from "vitest";

const market: IMarket = {
  cometAddress: "0x3afdc9bca9213a35503b077a6072f3d0d5ab0840",
  utilization: 868781696515866780n,
  supplyRate: 1487639891n,
  borrowRate: 1853091222n,
} as const;

describe("MarketMethods", () => {
  test("should calculate the correct borrow APR", () => {
    const percents = MarketMethods.getAprPercents(market.borrowRate);
    expect(percents).toEqual("5.84391");
  });

  test("should calculate the correct supply APR", () => {
    const percents = MarketMethods.getAprPercents(market.supplyRate);
    expect(percents).toEqual("4.69142");
  });
});
