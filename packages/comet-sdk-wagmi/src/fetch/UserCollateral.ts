import { multicall } from "@wagmi/core";
import {
  PRICE_FEED_FACTOR_UNITS,
  UserCollateral,
} from "@woof-software/comet-sdk";
import { type ContractFunctionParameters, formatUnits } from "viem";
import { Addresses, type WagmiChainId } from "../config";
import {
  CometContract,
  ConfiguratorContract,
  Erc20Contract,
  wagmiConfig,
} from "../contracts";
import { WagmiUtils } from "../utils";

export async function fetchUserCollaterals(
  cometProxyAddress: `0x${string}`,
  userAddress: `0x${string}`,
  chainId: WagmiChainId,
): Promise<UserCollateral[]> {
  const configurator = new ConfiguratorContract(
    Addresses[chainId].configurator,
    chainId,
  );
  const cometConfig = await configurator.getConfiguration(cometProxyAddress);
  const comet = new CometContract(cometProxyAddress, chainId);

  const multicallBatch: ContractFunctionParameters[] = [];
  for (const config of cometConfig.assetConfigs) {
    const asset = new Erc20Contract(config.asset, chainId);
    multicallBatch.push(
      asset.getSymbolCall(),
      asset.getDecimalsCall(),
      asset.getBalanceOfCall(userAddress),
      comet.getPriceCall(config.priceFeed),
      comet.getUserCollateralCall(userAddress, config.asset),
      asset.getBalanceOfCall(cometProxyAddress),
      comet.getTotalsCollateralCall(config.asset),
      comet.getCollateralReservesCall(config.asset),
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
    const userSupplyBalance = WagmiUtils.resultOrThrow<bigint[]>(
      assetsData[index]!,
    );
    ++index;

    const cometBalance = WagmiUtils.resultOrThrow<bigint>(assetsData[index]!);
    ++index;

    const totalSupplyAsset = WagmiUtils.resultOrThrow<bigint[]>(
      assetsData[index]!,
    );
    ++index;

    const collateralReserves = WagmiUtils.resultOrThrow<bigint>(
      assetsData[index]!,
    );
    ++index;

    results[i] = new UserCollateral({
      tokenAddress: config.asset,
      symbol,
      decimals,
      userBalance,
      userSupplyBalance,
      cometBalance,
      totalSupplyAsset,
      collateralReserves,
      price: formatUnits(rawPrice, PRICE_FEED_FACTOR_UNITS),
      priceFeedAddress: config.priceFeed,
      collateralFactor: config.borrowCollateralFactor,
      liquidationFactor: config.liquidateCollateralFactor,
      liquidationPenalty: BigInt(1e18) - config.liquidationFactor,
      supplyCap: config.supplyCap,
    });
  }

  return results;
}
