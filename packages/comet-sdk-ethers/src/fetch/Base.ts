import { Base } from "@sandbox/comet-sdk/src/token";
import type { Provider, Signer } from "ethers";
import { fetchCurvesMocks } from "./Curve";

const secsPerYear = 60n * 60n * 24n * 365n;

export async function fetchBaseMock(
  cometProxyAddress?: string,
  driver?: Provider | Signer,
): Promise<Base> {
  // for USDt comet
  const tokenAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const symbol = "USDT";
  const decimals = 6;
  const price = 1;
  const priceFeedAddress = "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D"; // comet -> baseTokenPriceFeed

  const curves = await fetchCurvesMocks(cometProxyAddress, driver);

  return new Base({
    baseMinBorrow: 100000000n,
    baseMinForRewards: 900000000000000000n,
    baseTrackingBorrowSpeed: 1712328767n * secsPerYear,
    baseTrackingSupplySpeed: 96207508878n * secsPerYear,
    baseIndexScale: 0n,
    curvePresets: curves,
    //
    tokenAddress,
    symbol,
    decimals,
    price,
    priceFeedAddress,
  });
}
