import { Base } from "@sandbox/comet-sdk";
import { MulticallContract } from "@sandbox/contracts-tools-sdk-ethers";
import { type Provider, type Signer, formatUnits } from "ethers";
import { PRICE_FEED_FACTOR_UNITS } from "../constants";
import { CometContract, Erc20Contract } from "../contracts";
import { MULTICALL_ERRORS } from "../errors/multicall";
import { fetchCurves, fetchCurvesMocks } from "./Curve";

const secsPerYear = 60n * 60n * 24n * 365n;

export async function fetchBaseMock(
  cometProxyAddress?: string,
  driver?: Provider | Signer,
): Promise<Base> {
  // for USDt comet
  const tokenAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const symbol = "USDT";
  const decimals = 6n;
  const price = "1";
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

export async function fetchBase(
  cometProxyAddress: string,
  driver: Provider | Signer,
): Promise<Base> {
  const multicall = new MulticallContract(driver);
  const comet = new CometContract(cometProxyAddress, driver);

  const tokenAddressTag = multicall.add(
    "tokenAddress",
    comet.getBaseTokenCall(),
  );
  const priceFeedAddressTag = multicall.add(
    "priceFeedAddress",
    comet.getBaseTokenPriceFeedCall(),
  );

  await multicall.run();

  const tokenAddress = multicall.getSingle<string>(tokenAddressTag);
  if (!tokenAddress) throw MULTICALL_ERRORS.RESULT_NOT_FOUND(tokenAddressTag);
  const priceFeedAddress = multicall.getSingle<string>(priceFeedAddressTag);
  if (!priceFeedAddress)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(priceFeedAddressTag);

  multicall.clear();
  const erc20 = new Erc20Contract(tokenAddress, driver);

  const priceTag = multicall.add("price", comet.getPriceCall(priceFeedAddress));
  const decimalsTag = multicall.add("decimals", erc20.getDecimalsCall());
  const symbolTag = multicall.add("symbol", erc20.getSymbolCall());
  //
  const baseMinForRewardsTag = multicall.add(
    "baseMinForRewards",
    comet.getBaseMinForRewardsCall(),
  );
  const baseTrackingBorrowSpeedTag = multicall.add(
    "baseTrackingBorrowSpeed",
    comet.getBaseTrackingBorrowSpeedCall(),
  );
  const baseTrackingSupplySpeedTag = multicall.add(
    "baseTrackingSupplySpeed",
    comet.getBaseTrackingSupplySpeedCall(),
  );
  const baseIndexScaleTag = multicall.add(
    "baseIndexScale",
    comet.getBaseIndexScaleCall(),
  );

  await multicall.run();

  const priceRaw = multicall.getSingle<bigint>(priceTag);
  if (!priceRaw) throw MULTICALL_ERRORS.RESULT_NOT_FOUND(priceTag);
  const decimals = multicall.getSingle<bigint>(decimalsTag);
  if (!decimals) throw MULTICALL_ERRORS.RESULT_NOT_FOUND(decimalsTag);
  const symbol = multicall.getSingle<string>(symbolTag);
  if (!symbol) throw MULTICALL_ERRORS.RESULT_NOT_FOUND(symbolTag);
  //
  const baseMinForRewards = multicall.getSingle<bigint>(baseMinForRewardsTag);
  if (!baseMinForRewards)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(baseMinForRewardsTag);
  const baseTrackingBorrowSpeed = multicall.getSingle<bigint>(
    baseTrackingBorrowSpeedTag,
  );
  if (!baseTrackingBorrowSpeed)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(baseTrackingBorrowSpeedTag);
  const baseTrackingSupplySpeed = multicall.getSingle<bigint>(
    baseTrackingSupplySpeedTag,
  );
  if (!baseTrackingSupplySpeed)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(baseTrackingSupplySpeedTag);
  const baseIndexScale = multicall.getSingle<bigint>(baseIndexScaleTag);
  if (!baseIndexScale)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(baseIndexScaleTag);

  const curves = await fetchCurves(cometProxyAddress, driver);

  return new Base({
    baseMinBorrow: 100000000n, // TODO: takes from sandbox controller
    baseMinForRewards,
    baseTrackingBorrowSpeed: baseTrackingBorrowSpeed * secsPerYear,
    baseTrackingSupplySpeed: baseTrackingSupplySpeed * secsPerYear,
    baseIndexScale,
    curvePresets: curves,
    //
    tokenAddress,
    symbol,
    decimals,
    price: formatUnits(priceRaw, PRICE_FEED_FACTOR_UNITS),
    priceFeedAddress,
  });
}
