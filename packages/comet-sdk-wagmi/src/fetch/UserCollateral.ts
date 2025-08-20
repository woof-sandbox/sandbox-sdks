import { multicall } from "@wagmi/core";
import { COMET_FACTOR_SCALE, UserCollateral } from "@woof-software/comet-sdk";
import {
  type Address,
  type ContractFunctionParameters,
  formatUnits,
} from "viem";
import type { WagmiChainId } from "../config";
import {
  ChainlinkPriceFeedContract,
  CometContract,
  Erc20Contract,
  wagmiConfig,
} from "../contracts";
import { WagmiUtils } from "../utils";

export async function fetchUserCollaterals(
  cometProxyAddress: Address,
  userAddress: Address,
  chainId: WagmiChainId,
): Promise<UserCollateral[]> {
  const comet = new CometContract(cometProxyAddress, chainId);

  const cometConfig = await comet.getConfiguration();

  const multicallBatch: ContractFunctionParameters[] = [];
  for (const config of cometConfig.assetConfigs) {
    const asset = new Erc20Contract(config.collateralToken, chainId);
    const chainlinkPriceFeed = new ChainlinkPriceFeedContract(
      config.priceFeed,
      chainId,
    );
    multicallBatch.push(
      asset.getSymbolCall(),
      chainlinkPriceFeed.getDecimalsCall(),
      asset.getBalanceOfCall(userAddress),
      comet.getPriceCall(config.priceFeed),
      comet.getUserCollateralCall(userAddress, config.collateralToken),
      asset.getBalanceOfCall(cometProxyAddress),
      comet.getTotalsCollateralCall(config.collateralToken),
      comet.getCollateralReservesCall(config.collateralToken),
    );
  }

  const assetsData = await multicall(wagmiConfig, {
    chainId,
    contracts: multicallBatch,
  });

  const results = new Array<UserCollateral>(cometConfig.assetConfigs.length);

  let index = 0;
  for (let i = 0; i < cometConfig.assetConfigs.length; ++i) {
    const config = cometConfig.assetConfigs[i]!;

    const symbol = WagmiUtils.resultOrThrow<string>(assetsData[index]!);
    ++index;
    const decimals = WagmiUtils.resultOrThrow<bigint>(assetsData[index]!);
    ++index;
    const userBalance = WagmiUtils.resultOrThrow<bigint>(assetsData[index]!);
    ++index;
    const rawPrice = WagmiUtils.resultOrThrow<bigint>(assetsData[index]!);
    ++index;
    const userSupplyBalance = WagmiUtils.resultOrThrow<bigint>(
      assetsData[index]!,
    );
    ++index;

    const cometBalance = WagmiUtils.resultOrThrow<bigint>(assetsData[index]!);
    ++index;

    const totalSupplyAsset = WagmiUtils.resultOrThrow<bigint>(
      assetsData[index]!,
    );
    ++index;

    const collateralReserves = WagmiUtils.resultOrThrow<bigint>(
      assetsData[index]!,
    );
    ++index;

    results[i] = new UserCollateral({
      tokenAddress: config.collateralToken,
      symbol,
      decimals,
      userBalance,
      userSupplyBalance,
      cometBalance,
      totalSupplyAsset,
      collateralReserves,
      price: formatUnits(rawPrice, Number(decimals)),
      priceFeedAddress: config.priceFeed,
      collateralFactor: config.borrowCollateralFactor,
      liquidationFactor: config.liquidateCollateralFactor,
      liquidationPenalty: COMET_FACTOR_SCALE - config.liquidationFactor,
      cometScale: config.scale,
      supplyCap: config.supplyCap,
    });
  }

  return results;
}
