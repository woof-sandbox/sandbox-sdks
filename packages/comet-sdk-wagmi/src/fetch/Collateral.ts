import { multicall } from "@wagmi/core";
import { Collateral } from "@woof-software/comet-sdk";
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

export async function fetchCollateralsMocks(
  cometProxyAddress?: Address,
  chainId?: WagmiChainId,
): Promise<Collateral[]> {
  void cometProxyAddress;
  void chainId;
  // for USDt comet
  return [
    new Collateral({
      totalSupplyAsset: 0n,
      collateralReserves: 0n,
      cometBalance: 35027723652721944326765n,
      collateralFactor: 500000000000000000n,
      liquidationFactor: 700000000000000000n,
      liquidationPenalty: BigInt(1e18) - 750000000000000000n,
      cometScale: 18n,
      supplyCap: 100000000000000000000000n,
      //
      tokenAddress: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
      symbol: "COMP",
      decimals: 18n,
      price: "42.59",
      priceFeedAddress: "0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5",
    }),
    new Collateral({
      totalSupplyAsset: 0n,
      collateralReserves: 0n,
      cometBalance: 12117355922641259954364n,
      collateralFactor: 830000000000000000n,
      liquidationFactor: 900000000000000000n,
      liquidationPenalty: BigInt(1e18) - 950000000000000000n,
      cometScale: 18n,
      supplyCap: 500000000000000000000000n,
      //
      tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      symbol: "WETH",
      decimals: 18n,
      price: "2093.59",
      priceFeedAddress: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    }),
    new Collateral({
      totalSupplyAsset: 0n,
      collateralReserves: 0n,
      cometBalance: 140523006387n,
      collateralFactor: 800000000000000000n,
      liquidationFactor: 850000000000000000n,
      liquidationPenalty: BigInt(1e18) - 900000000000000000n,
      cometScale: 18n,
      supplyCap: 140000000000n,
      //
      tokenAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      symbol: "WBTC",
      decimals: 8n,
      price: "80784.02",
      priceFeedAddress: "0x4E64E54c9f0313852a230782B3ba4B3B0952B499",
    }),
    new Collateral({
      totalSupplyAsset: 0n,
      collateralReserves: 0n,
      cometBalance: 107289863723008177633341n,
      collateralFactor: 680000000000000000n,
      liquidationFactor: 740000000000000000n,
      liquidationPenalty: BigInt(1e18) - 830000000000000000n,
      cometScale: 18n,
      supplyCap: 1300000000000000000000000n,
      //
      tokenAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      symbol: "UNI",
      decimals: 18n,
      price: "7",
      priceFeedAddress: "0x553303d460EE0afB37EdFf9bE42922D8FF63220e",
    }),
    new Collateral({
      totalSupplyAsset: 0n,
      collateralReserves: 0n,
      cometBalance: 208318770012408717958779n,
      collateralFactor: 730000000000000000n,
      liquidationFactor: 790000000000000000n,
      liquidationPenalty: BigInt(1e18) - 830000000000000000n,
      cometScale: 18n,
      supplyCap: 500000000000000000000000n,
      //
      tokenAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      symbol: "LINK",
      decimals: 18n,
      price: "15.27",
      priceFeedAddress: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
    }),
    new Collateral({
      totalSupplyAsset: 0n,
      collateralReserves: 0n,
      cometBalance: 46928176653511787713918n,
      collateralFactor: 800000000000000000n,
      liquidationFactor: 850000000000000000n,
      liquidationPenalty: BigInt(1e18) - 950000000000000000n,
      cometScale: 18n,
      supplyCap: 60000000000000000000000n,
      //
      tokenAddress: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
      symbol: "wstETH",
      decimals: 18n,
      price: "2506.29",
      priceFeedAddress: "0x023ee795361B28cDbB94e302983578486A0A5f1B",
    }),
    new Collateral({
      totalSupplyAsset: 0n,
      collateralReserves: 0n,
      cometBalance: 14310372018n,
      collateralFactor: 800000000000000000n,
      liquidationFactor: 850000000000000000n,
      liquidationPenalty: BigInt(1e18) - 950000000000000000n,
      cometScale: 18n,
      supplyCap: 100000000000n,
      //
      tokenAddress: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
      symbol: "cbBTC",
      decimals: 8n,
      price: "87777.03",
      priceFeedAddress: "0x2D09142Eae60Fd8BD454a276E95AeBdFFD05722d",
    }),
    new Collateral({
      totalSupplyAsset: 0n,
      collateralReserves: 0n,
      cometBalance: 184999996802880975784n,
      collateralFactor: 760000000000000000n,
      liquidationFactor: 810000000000000000n,
      liquidationPenalty: BigInt(1e18) - 900000000000000000n,
      cometScale: 18n,
      supplyCap: 285000000000000000000n,
      //
      tokenAddress: "0x18084fbA666a33d37592fA2633fD49a74DD93a88",
      symbol: "tBTC",
      decimals: 18n,
      price: "87261.1",
      priceFeedAddress: "0x7b03a016dBC36dB8e05C480192faDcdB0a06bC37",
    }),
    new Collateral({
      totalSupplyAsset: 0n,
      collateralReserves: 0n,
      cometBalance: 452117739980n,
      collateralFactor: 880000000000000000n,
      liquidationFactor: 900000000000000000n,
      liquidationPenalty: BigInt(1e18) - 950000000000000000n,
      cometScale: 18n,
      supplyCap: 6500000000000000000000000n,
      //
      tokenAddress: "0x57F5E098CaD7A3D1Eed53991D4d66C45C9AF7812",
      symbol: "wUSDM",
      decimals: 18n,
      price: "1.07",
      priceFeedAddress: "0xe3a409eD15CD53aFdEFdd191ad945cEC528A2496",
    }),
    new Collateral({
      totalSupplyAsset: 0n,
      collateralReserves: 0n,
      cometBalance: 28750977989188964083475517n,
      collateralFactor: 880000000000000000n,
      liquidationFactor: 900000000000000000n,
      liquidationPenalty: BigInt(1e18) - 950000000000000000n,
      cometScale: 18n,
      supplyCap: 30000000000000000000000000n,
      //
      tokenAddress: "0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32",
      symbol: "sFRAX",
      decimals: 18n,
      price: "1.12",
      priceFeedAddress: "0x403F2083B6E220147f8a8832f0B284B4Ed5777d1",
    }),
    new Collateral({
      totalSupplyAsset: 0n,
      collateralReserves: 0n,
      cometBalance: 1000000000000000000n,
      collateralFactor: 800000000000000000n,
      liquidationFactor: 850000000000000000n,
      liquidationPenalty: BigInt(1e18) - 950000000000000000n,
      cometScale: 18n,
      supplyCap: 4000000000000000000000n,
      //
      tokenAddress: "0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa",
      symbol: "mETH",
      decimals: 18n,
      price: "2118.67",
      priceFeedAddress: "0x2f7439252Da796Ab9A93f7E478E70DED43Db5B89",
    }),
    new Collateral({
      totalSupplyAsset: 0n,
      collateralReserves: 0n,
      cometBalance: 11999105242216432177492n,
      collateralFactor: 750000000000000000n,
      liquidationFactor: 800000000000000000n,
      liquidationPenalty: BigInt(1e18) - 900000000000000000n,
      cometScale: 18n,
      supplyCap: 12000000000000000000000n,
      //
      tokenAddress: "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee",
      symbol: "weETH",
      decimals: 18n,
      price: "2229.28",
      priceFeedAddress: "0x9e0e0C58AA8287F9f6E2666a21fbF2adEeAD3fef",
    }),
  ];
}

export async function fetchCollaterals(
  cometProxyAddress: Address,
  chainId: WagmiChainId,
): Promise<Collateral[]> {
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
      comet.getPriceCall(config.priceFeed),
      asset.getBalanceOfCall(cometProxyAddress),
      comet.getTotalsCollateralCall(config.collateralToken),
      comet.getCollateralReservesCall(config.collateralToken),
    );
  }

  const assetsData = await multicall(wagmiConfig, {
    chainId,
    contracts: multicallBatch,
  });

  const results = new Array<Collateral>(cometConfig.assetConfigs.length);

  let index = 0;
  for (let i = 0; i < cometConfig.assetConfigs.length; ++i) {
    const config = cometConfig.assetConfigs[i]!;

    const symbol = WagmiUtils.resultOrThrow<string>(assetsData[index]!);
    ++index;
    const decimals = WagmiUtils.resultOrThrow<bigint>(assetsData[index]!);
    ++index;
    const rawPrice = WagmiUtils.resultOrThrow<bigint>(assetsData[index]!);
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

    results[i] = new Collateral({
      cometBalance,
      tokenAddress: config.collateralToken,
      symbol,
      decimals,
      totalSupplyAsset,
      collateralReserves,
      price: formatUnits(rawPrice, Number(decimals)),
      priceFeedAddress: config.priceFeed,
      collateralFactor: config.borrowCollateralFactor,
      liquidationFactor: config.liquidateCollateralFactor,
      liquidationPenalty: config.scale - config.liquidationFactor,
      cometScale: config.scale,
      supplyCap: config.supplyCap,
    });
  }

  return results;
}
