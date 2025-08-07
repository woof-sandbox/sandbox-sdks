import { type Config, multicall } from "@wagmi/core";
import {
  Base,
  PRICE_FEED_FACTOR_UNITS,
  SECONDS_PER_YEAR,
} from "@woof-software/comet-sdk";
import { type Address, formatUnits } from "viem";
import type { WagmiChainId } from "../config";
import { CometContract, Erc20Contract } from "../contracts";
import { WagmiUtils } from "../utils";
import { fetchCurves, fetchCurvesMocks } from "./Curve";

const secsPerYear = BigInt(SECONDS_PER_YEAR);

export async function fetchBaseMock(
  cometProxyAddress?: Address,
  chainId?: WagmiChainId,
): Promise<Base> {
  // for USDt comet
  const tokenAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7";
  const symbol = "USDT";
  const decimals = 6n;
  const price = "1";
  const priceFeedAddress = "0x3e7d1eab13ad0104d2750b8863b489d65364e32d"; // comet -> baseTokenPriceFeed

  const curves = await fetchCurvesMocks(cometProxyAddress, chainId);

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
  cometProxyAddress: Address,
  chainId: WagmiChainId,
  config: Config,
): Promise<Base> {
  const comet = new CometContract(cometProxyAddress, chainId);

  const cometBaseData = await multicall(config, {
    chainId,
    contracts: [comet.getBaseTokenCall(), comet.getBaseTokenPriceFeedCall()],
  });

  const tokenAddress = WagmiUtils.resultOrThrow<Address>(cometBaseData[0]);
  const priceFeedAddress = WagmiUtils.resultOrThrow<Address>(cometBaseData[1]);

  const erc20 = new Erc20Contract(tokenAddress, chainId);

  ///

  const baseData = await multicall(config, {
    chainId,
    contracts: [
      comet.getPriceCall(priceFeedAddress),
      erc20.getDecimalsCall(),
      erc20.getSymbolCall(),
      //
      comet.getBaseMinForRewardsCall(),
      comet.getBaseTrackingBorrowSpeedCall(),
      comet.getBaseTrackingSupplySpeedCall(),
      comet.getBaseScaleCall(),
    ],
  });

  const priceRaw = WagmiUtils.resultOrThrow<bigint>(baseData[0]);
  const decimals = WagmiUtils.resultOrThrow<bigint>(baseData[1]);
  const symbol = WagmiUtils.resultOrThrow<string>(baseData[2]);
  //
  const baseMinForRewards = WagmiUtils.resultOrThrow<bigint>(baseData[3]);
  const baseTrackingBorrowSpeed = WagmiUtils.resultOrThrow<bigint>(baseData[4]);
  const baseTrackingSupplySpeed = WagmiUtils.resultOrThrow<bigint>(baseData[5]);
  const baseIndexScale = WagmiUtils.resultOrThrow<bigint>(baseData[6]);

  const curves = await fetchCurves(cometProxyAddress, chainId);

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
