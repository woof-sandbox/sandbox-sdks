import { type Config, multicall } from "@wagmi/core";
import {
  type IMarketProposalTx,
  Market,
  Token,
} from "@woof-software/comet-sdk";
import type { Address } from "viem";
import type { WagmiChainId } from "../config";
import { CometContract, Erc20Contract, wagmiConfig } from "../contracts";
import { WagmiUtils } from "../utils";
import { fetchBase, fetchBaseMock } from "./Base";
import { fetchCollaterals, fetchCollateralsMocks } from "./Collateral";

export async function fetchMarketMock(
  cometProxyAddress: Address,
  chainId: WagmiChainId,
): Promise<Market> {
  // USDt comet
  const cometAddress = "0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840";
  const utilization = 622155096290286592n;
  const supplyRate = 1065334068n;
  const borrowRate = 1462067313n;
  //
  const borrowMinAmount = 1000000000000000n;
  const totalBorrow = 115139196488456n;
  const totalSupply = 185064689883219n;
  const totalReserves = 1368714199302n;
  const availableLiquidity = 71294244719270n;
  // TODO: fulfill this block after adding new functionality to contracts
  const configControllerAddress = "0x0000000000000000000000000000000000000000";
  const ownerAddress = "0x0000000000000000000000000000000000000000";
  const guardianAddress = "0x0000000000000000000000000000000000000000";
  const curatorAddress = "0x0000000000000000000000000000000000000000";
  const feeDistribution = 10;
  const proposals: IMarketProposalTx[] = [];
  //
  const baseToken = await fetchBaseMock(cometProxyAddress, chainId);
  const collaterals = await fetchCollateralsMocks(cometProxyAddress, chainId);
  const comp = new Token({
    tokenAddress: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
    symbol: "COMP",
    decimals: 18n,
    price: "42.59",
    priceFeedAddress: "0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5",
  });
  //
  return new Market({
    chain: chainId,
    borrowMinAmount,
    cometAddress,
    utilization,
    supplyRate,
    borrowRate,
    totalBorrow,
    totalSupply,
    totalReserves,
    availableLiquidity,
    configControllerAddress,
    ownerAddress,
    guardianAddress,
    curatorAddress,
    curatorFee: feeDistribution,
    proposals,
    baseToken,
    collaterals,
    compToken: comp,
    rewardTokens: [], // todo: fullfill
  });
}

export async function fetchMarket(
  cometProxyAddress: Address,
  chainId: WagmiChainId,
  config: Config,
): Promise<Market> {
  const comet = new CometContract(cometProxyAddress, chainId);

  const utilization = await comet.getUtilization();
  const collaterals = await fetchCollaterals(cometProxyAddress, chainId);
  const baseToken = await fetchBase(cometProxyAddress, chainId, config);
  const baseContract = new Erc20Contract(
    baseToken.tokenAddress as Address,
    chainId,
  );

  const marketData = await multicall(wagmiConfig, {
    chainId,
    contracts: [
      comet.getBorrowRateCall(utilization),
      comet.getSupplyRateCall(utilization),
      comet.getTotalBorrowCall(),
      comet.getTotalSupplyCall(),
      comet.getReservesCall(),
      baseContract.getBalanceOfCall(cometProxyAddress),
      comet.getBaseBorrowMinCall(),
    ],
  });
  const borrowRate = WagmiUtils.resultOrThrow<bigint>(marketData[0]);
  const supplyRate = WagmiUtils.resultOrThrow<bigint>(marketData[1]);
  const totalBorrow = WagmiUtils.resultOrThrow<bigint>(marketData[2]);
  const totalSupply = WagmiUtils.resultOrThrow<bigint>(marketData[3]);
  const totalReserves = WagmiUtils.resultOrThrow<bigint>(marketData[4]);
  const availableLiquidity = WagmiUtils.resultOrThrow<bigint>(marketData[5]);
  const borrowMinAmount = WagmiUtils.resultOrThrow<bigint>(marketData[6]);

  return new Market({
    chain: chainId,
    cometAddress: cometProxyAddress,
    borrowMinAmount,
    utilization,
    supplyRate,
    borrowRate,
    //
    totalBorrow,
    totalSupply,
    totalReserves,
    baseToken,
    collaterals,
    availableLiquidity,
    // TODO: update after contracts
    configControllerAddress: "0x0000000000000000000000000000000000000000", // TODO
    ownerAddress: "0x0000000000000000000000000000000000000000", // TODO
    guardianAddress: "0x0000000000000000000000000000000000000000", // TODO
    curatorAddress: "0x0000000000000000000000000000000000000000", // TODO
    curatorFee: 0, // TODO
    //
    proposals: [], // TODO
    //
    compToken: await fetchBaseMock(), // TODO
    rewardTokens: [], // TODO
  });
}

export async function fetchMarkets(
  marketConfig: Record<number, Address[]>,
  config: Config,
): Promise<Market[]> {
  const marketInChain = Object.entries(marketConfig).flatMap(
    async ([chainId, marketsComets]) => {
      const chain = Number(chainId) as WagmiChainId;

      return Promise.all(
        marketsComets.map(async (cometProxyAddress, index) => {
          const comet = new CometContract(cometProxyAddress, chain);

          const utilization = await comet.getUtilization();
          const collaterals = await fetchCollaterals(cometProxyAddress, chain);
          const baseToken = await fetchBase(cometProxyAddress, chain, config);
          const baseContract = new Erc20Contract(
            baseToken.tokenAddress as Address,
            chain,
          );

          const marketData = await multicall(wagmiConfig, {
            chainId: chain,
            contracts: [
              comet.getBorrowRateCall(utilization),
              comet.getSupplyRateCall(utilization),
              comet.getTotalBorrowCall(),
              comet.getTotalSupplyCall(),
              comet.getReservesCall(),
              baseContract.getBalanceOfCall(cometProxyAddress),
              comet.getBaseBorrowMinCall(),
            ],
          });
          const borrowRate = WagmiUtils.resultOrThrow<bigint>(marketData[0]);
          const supplyRate = WagmiUtils.resultOrThrow<bigint>(marketData[1]);
          const totalBorrow = WagmiUtils.resultOrThrow<bigint>(marketData[2]);
          const totalSupply = WagmiUtils.resultOrThrow<bigint>(marketData[3]);
          const totalReserves = WagmiUtils.resultOrThrow<bigint>(marketData[4]);
          const availableLiquidity = WagmiUtils.resultOrThrow<bigint>(
            marketData[5],
          );
          const borrowMinAmount = WagmiUtils.resultOrThrow<bigint>(
            marketData[6],
          );

          return new Market({
            chain: chain,
            cometAddress: cometProxyAddress,
            borrowMinAmount,
            utilization,
            supplyRate,
            borrowRate,
            //
            totalBorrow,
            totalSupply,
            totalReserves,
            baseToken,
            collaterals,
            availableLiquidity,
            // TODO: update after contracts
            configControllerAddress:
              "0x0000000000000000000000000000000000000000", // TODO
            ownerAddress: "0x0000000000000000000000000000000000000000", // TODO
            guardianAddress: "0x0000000000000000000000000000000000000000", // TODO
            curatorAddress: "0x0000000000000000000000000000000000000000", // TODO
            curatorFee: 0, // TODO
            //
            proposals: [], // TODO
            //
            compToken: await fetchBaseMock(), // TODO
            rewardTokens: [], // TODO
          });
        }),
      );
    },
  );

  return Promise.all(marketInChain).then((markets) => {
    return markets.flat();
  });
}
