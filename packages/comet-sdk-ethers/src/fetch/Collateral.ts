import { Collateral } from "@sandbox/comet-sdk/src/token";
import { MulticallContract } from "@sandbox/contracts-tools-sdk-ethers";
import { type Provider, type Signer, formatUnits } from "ethers";
import { PRICE_FEED_FACTOR_UNITS } from "../constants";
import { CometContract, Erc20Contract } from "../contracts";
import { MULTICALL_ERRORS } from "../errors/multicall";

export async function fetchCollateralsMocks(
  cometProxyAddress?: string,
  driver?: Provider | Signer,
): Promise<Collateral[]> {
  // for USDt comet
  return [
    new Collateral({
      collateralFactor: 500000000000000000n,
      liquidationFactor: 700000000000000000n,
      liquidationPenalty: BigInt(1e18) - 750000000000000000n,
      supplyCap: 100000000000000000000000n,
      //
      tokenAddress: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
      symbol: "COMP",
      decimals: 18n,
      price: "42.59",
      priceFeedAddress: "0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5",
    }),
    new Collateral({
      collateralFactor: 830000000000000000n,
      liquidationFactor: 900000000000000000n,
      liquidationPenalty: BigInt(1e18) - 950000000000000000n,
      supplyCap: 500000000000000000000000n,
      //
      tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      symbol: "WETH",
      decimals: 18n,
      price: "2093.59",
      priceFeedAddress: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    }),
    new Collateral({
      collateralFactor: 800000000000000000n,
      liquidationFactor: 850000000000000000n,
      liquidationPenalty: BigInt(1e18) - 900000000000000000n,
      supplyCap: 140000000000n,
      //
      tokenAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      symbol: "WBTC",
      decimals: 8n,
      price: "80784.02",
      priceFeedAddress: "0x4E64E54c9f0313852a230782B3ba4B3B0952B499",
    }),
    new Collateral({
      collateralFactor: 680000000000000000n,
      liquidationFactor: 740000000000000000n,
      liquidationPenalty: BigInt(1e18) - 830000000000000000n,
      supplyCap: 1300000000000000000000000n,
      //
      tokenAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      symbol: "UNI",
      decimals: 18n,
      price: "7",
      priceFeedAddress: "0x553303d460EE0afB37EdFf9bE42922D8FF63220e",
    }),
    new Collateral({
      collateralFactor: 730000000000000000n,
      liquidationFactor: 790000000000000000n,
      liquidationPenalty: BigInt(1e18) - 830000000000000000n,
      supplyCap: 500000000000000000000000n,
      //
      tokenAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      symbol: "LINK",
      decimals: 18n,
      price: "15.27",
      priceFeedAddress: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
    }),
    new Collateral({
      collateralFactor: 800000000000000000n,
      liquidationFactor: 850000000000000000n,
      liquidationPenalty: BigInt(1e18) - 950000000000000000n,
      supplyCap: 60000000000000000000000n,
      //
      tokenAddress: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
      symbol: "wstETH",
      decimals: 18n,
      price: "2506.29",
      priceFeedAddress: "0x023ee795361B28cDbB94e302983578486A0A5f1B",
    }),
    new Collateral({
      collateralFactor: 800000000000000000n,
      liquidationFactor: 850000000000000000n,
      liquidationPenalty: BigInt(1e18) - 950000000000000000n,
      supplyCap: 100000000000n,
      //
      tokenAddress: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
      symbol: "cbBTC",
      decimals: 8n,
      price: "87777.03",
      priceFeedAddress: "0x2D09142Eae60Fd8BD454a276E95AeBdFFD05722d",
    }),
    new Collateral({
      collateralFactor: 760000000000000000n,
      liquidationFactor: 810000000000000000n,
      liquidationPenalty: BigInt(1e18) - 900000000000000000n,
      supplyCap: 285000000000000000000n,
      //
      tokenAddress: "0x18084fbA666a33d37592fA2633fD49a74DD93a88",
      symbol: "tBTC",
      decimals: 18n,
      price: "87261.1",
      priceFeedAddress: "0x7b03a016dBC36dB8e05C480192faDcdB0a06bC37",
    }),
    new Collateral({
      collateralFactor: 880000000000000000n,
      liquidationFactor: 900000000000000000n,
      liquidationPenalty: BigInt(1e18) - 950000000000000000n,
      supplyCap: 6500000000000000000000000n,
      //
      tokenAddress: "0x57F5E098CaD7A3D1Eed53991D4d66C45C9AF7812",
      symbol: "wUSDM",
      decimals: 18n,
      price: "1.07",
      priceFeedAddress: "0xe3a409eD15CD53aFdEFdd191ad945cEC528A2496",
    }),
    new Collateral({
      collateralFactor: 880000000000000000n,
      liquidationFactor: 900000000000000000n,
      liquidationPenalty: BigInt(1e18) - 950000000000000000n,
      supplyCap: 30000000000000000000000000n,
      //
      tokenAddress: "0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32",
      symbol: "sFRAX",
      decimals: 18n,
      price: "1.12",
      priceFeedAddress: "0x403F2083B6E220147f8a8832f0B284B4Ed5777d1",
    }),
    new Collateral({
      collateralFactor: 800000000000000000n,
      liquidationFactor: 850000000000000000n,
      liquidationPenalty: BigInt(1e18) - 950000000000000000n,
      supplyCap: 4000000000000000000000n,
      //
      tokenAddress: "0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa",
      symbol: "mETH",
      decimals: 18n,
      price: "2118.67",
      priceFeedAddress: "0x2f7439252Da796Ab9A93f7E478E70DED43Db5B89",
    }),
    new Collateral({
      collateralFactor: 750000000000000000n,
      liquidationFactor: 800000000000000000n,
      liquidationPenalty: BigInt(1e18) - 900000000000000000n,
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
  cometProxyAddress: string,
  driver: Provider | Signer,
): Promise<Collateral[]> {
  const comet = new CometContract(cometProxyAddress, driver);
  const numAssets = Number(await comet.numAssets());

  const multicall = new MulticallContract(driver);

  // Collaterals
  for (let i = 0; i < numAssets; i++) {
    multicall.add(i, comet.getAssetInfoCall(i));
  }

  await multicall.run();

  // Collaterals infos
  const addresses: string[] = new Array<string>(numAssets);
  const priceFeeds: string[] = new Array<string>(numAssets);
  const collateralFactors: bigint[] = new Array<bigint>(numAssets);
  const liquidationFactors: bigint[] = new Array<bigint>(numAssets);
  const liquidationPenalties: bigint[] = new Array<bigint>(numAssets);
  const supplyCaps: bigint[] = new Array<bigint>(numAssets);
  //
  for (let i = 0; i < numAssets; i++) {
    const assetRaw =
      multicall.getArray<
        [bigint, string, string, bigint, bigint, bigint, bigint, bigint]
      >(i);
    if (!assetRaw) throw MULTICALL_ERRORS.RESULT_NOT_FOUND(i);
    const [
      _offset,
      address,
      priceFeed,
      _scale,
      borrowCollateralFactor,
      liquidateCollateralFactor,
      liquidationFactor,
      supplyCap,
    ] = assetRaw;
    addresses[i] = address;
    priceFeeds[i] = priceFeed;
    collateralFactors[i] = borrowCollateralFactor;
    liquidationFactors[i] = liquidateCollateralFactor;
    liquidationPenalties[i] = BigInt(1e18) - liquidationFactor; // Reverse
    supplyCaps[i] = supplyCap;
  }

  multicall.clear();

  const erc20Contracts = addresses.map(
    (address) => new Erc20Contract(address, driver),
  );

  const symbolT = (iter: number) => `symbol-${iter}`;
  const decimalsT = (iter: number) => `decimals-${iter}`;
  const priceRawT = (iter: number) => `priceRaw-${iter}`;

  for (let i = 0; i < numAssets; i++) {
    const erc20Contract = erc20Contracts[i]!;
    multicall.add(symbolT(i), erc20Contract.getSymbolCall());
    multicall.add(decimalsT(i), erc20Contract.getDecimalsCall());
    multicall.add(priceRawT(i), comet.getPriceCall(priceFeeds[i]!));
  }

  await multicall.run();

  // Collect results
  const results = new Array<Collateral>(numAssets);

  for (let i = 0; i < numAssets; i++) {
    const symbol = multicall.getSingle<string>(symbolT(i));
    if (!symbol) throw MULTICALL_ERRORS.RESULT_NOT_FOUND(symbolT(i));

    const decimals = multicall.getSingle<bigint>(decimalsT(i));
    if (!decimals) throw MULTICALL_ERRORS.RESULT_NOT_FOUND(decimalsT(i));

    const priceRaw = multicall.getSingle<bigint>(priceRawT(i));
    if (!priceRaw) throw MULTICALL_ERRORS.RESULT_NOT_FOUND(priceRawT(i));

    results[i] = new Collateral({
      tokenAddress: addresses[i]!,
      symbol,
      decimals,
      price: formatUnits(priceRaw, PRICE_FEED_FACTOR_UNITS),
      priceFeedAddress: priceFeeds[i]!,
      collateralFactor: collateralFactors[i]!,
      liquidationFactor: liquidationFactors[i]!,
      liquidationPenalty: liquidationPenalties[i]!,
      supplyCap: supplyCaps[i]!,
    });
  }

  return results;
}
