import { type Config, multicall } from "@wagmi/core";
import { UserMarket } from "@woof-software/comet-sdk";
import type { Address } from "viem";
import type { WagmiChainId } from "../config";
import { CometContract, Erc20Contract } from "../contracts";
import { WagmiUtils } from "../utils";
import { UserMarketWrapper } from "../wrappers";
import { fetchBase, fetchBaseMock } from "./Base";
import { fetchConfigController } from "./ConfigController";
import { fetchUserCollaterals } from "./UserCollateral";

export async function fetchUserMarkets(
  marketConfig: Record<number, Address[]>,
  userAddress: Address,
  config: Config,
): Promise<UserMarketWrapper[]> {
  const marketInChain = Object.entries(marketConfig).flatMap(
    async ([chainId, marketsComets]) => {
      const chain = Number(chainId) as WagmiChainId;
      const cometsBaseData = await multicall(config, {
        chainId: chain,
        contracts: marketsComets.flatMap((cometProxyAddress) => {
          const comet = new CometContract(cometProxyAddress, chain);

          return [
            comet.getBaseTokenCall(),
            comet.getBaseTokenPriceFeedCall(),
            comet.getUtilizationCall(),
            comet.getBalanceOfCall(userAddress),
            comet.getBorrowBalanceOfCall(userAddress),
            comet.getReservesCall(),
            comet.getBaseBorrowMinCall(),
          ];
        }),
      });

      return Promise.all(
        marketsComets.map(async (cometProxyAddress, index) => {
          const currentCometBaseData = cometsBaseData.slice(
            index * 7,
            7 * (index + 1),
          );

          const baseTokenAddress = WagmiUtils.resultOrThrow<Address>(
            currentCometBaseData[0],
          );
          const baseTokenPriceFeed = WagmiUtils.resultOrThrow<Address>(
            currentCometBaseData[1],
          );
          const utilization = WagmiUtils.resultOrThrow<bigint>(
            currentCometBaseData[2],
          );
          const supplyBalance = WagmiUtils.resultOrThrow<bigint>(
            currentCometBaseData[3],
          );
          const borrowBalance = WagmiUtils.resultOrThrow<bigint>(
            currentCometBaseData[4],
          );
          const totalReserves = WagmiUtils.resultOrThrow<bigint>(
            currentCometBaseData[5],
          );
          const borrowMinAmount = WagmiUtils.resultOrThrow<bigint>(
            currentCometBaseData[6],
          );

          const comet = new CometContract(cometProxyAddress, chain, config);
          const baseTokenContract = new Erc20Contract(
            baseTokenAddress,
            chain,
            config,
          );

          const fullData = await multicall(config, {
            chainId: chain,
            contracts: [
              baseTokenContract.getBalanceOfCall(userAddress),
              baseTokenContract.getBalanceOfCall(cometProxyAddress),
              comet.getTotalSupplyCall(),
              comet.getTotalBorrowCall(),
              comet.getSupplyRateCall(utilization),
              comet.getBorrowRateCall(utilization),
              comet.getConfigControllerCall(),
            ],
          });

          const baseTokenBalance = WagmiUtils.resultOrThrow<bigint>(
            fullData[0],
          );
          const availableLiquidity = WagmiUtils.resultOrThrow<bigint>(
            fullData[1],
          );
          const totalSupply = WagmiUtils.resultOrThrow<bigint>(fullData[2]);
          const totalBorrow = WagmiUtils.resultOrThrow<bigint>(fullData[3]);
          const supplyRate = WagmiUtils.resultOrThrow<bigint>(fullData[4]);
          const borrowRate = WagmiUtils.resultOrThrow<bigint>(fullData[5]);
          const configControllerAddress = WagmiUtils.resultOrThrow<Address>(
            fullData[6],
          );

          const configController = await fetchConfigController(
            configControllerAddress,
            chain,
            config,
          );
          const baseToken = await fetchBase(cometProxyAddress, chain, config);

          const collaterals = await fetchUserCollaterals(
            cometProxyAddress,
            userAddress,
            chain,
          );

          const userMarket = new UserMarket({
            chain,
            borrowMinAmount,
            borrowBalance,
            supplyBalance,
            baseTokenBalance,
            cometAddress: cometProxyAddress,
            utilization,
            supplyRate,
            borrowRate,
            totalBorrow,
            totalSupply,
            totalReserves,
            baseToken,
            collaterals: collaterals,
            availableLiquidity,
            configControllerAddress,
            ownerAddress: configController.owner,
            guardianAddress: configController.guardian,
            curatorAddress: configController.curator,
            curatorFee: configController.curatorFee,
            //
            proposals: [], // TODO
            //
            compToken: await fetchBaseMock(), // TODO
            rewardTokens: [], // TODO
          });

          return new UserMarketWrapper(userMarket, config, chain);
        }),
      );
    },
  );

  return Promise.all(marketInChain).then((markets) => {
    return markets.flat();
  });
}

export async function fetchUserMarket(
  cometProxyAddress: Address,
  userAddress: Address,
  chainId: WagmiChainId,
  config: Config,
): Promise<UserMarketWrapper> {
  const comet = new CometContract(cometProxyAddress, chainId, config);
  const cometBaseData = await multicall(config, {
    chainId,
    contracts: [
      comet.getBaseTokenCall(),
      comet.getBaseTokenPriceFeedCall(),
      comet.getUtilizationCall(),
      comet.getBalanceOfCall(userAddress),
      comet.getBorrowBalanceOfCall(userAddress),
      comet.getReservesCall(),
      comet.getBaseBorrowMinCall(),
    ],
  });

  const baseTokenAddress = WagmiUtils.resultOrThrow<Address>(cometBaseData[0]);
  const baseTokenPriceFeed = WagmiUtils.resultOrThrow<Address>(
    cometBaseData[1],
  );
  const utilization = WagmiUtils.resultOrThrow<bigint>(cometBaseData[2]);
  const supplyBalance = WagmiUtils.resultOrThrow<bigint>(cometBaseData[3]);
  const borrowBalance = WagmiUtils.resultOrThrow<bigint>(cometBaseData[4]);
  const totalReserves = WagmiUtils.resultOrThrow<bigint>(cometBaseData[5]);
  const borrowMinAmount = WagmiUtils.resultOrThrow<bigint>(cometBaseData[6]);

  const baseTokenContract = new Erc20Contract(baseTokenAddress, chainId);

  const fullData = await multicall(config, {
    chainId,
    contracts: [
      baseTokenContract.getBalanceOfCall(userAddress),
      baseTokenContract.getBalanceOfCall(cometProxyAddress),
      comet.getTotalSupplyCall(),
      comet.getTotalBorrowCall(),
      comet.getSupplyRateCall(utilization),
      comet.getBorrowRateCall(utilization),
      comet.getConfigControllerCall(),
    ],
  });

  const baseTokenBalance = WagmiUtils.resultOrThrow<bigint>(fullData[0]);
  const availableLiquidity = WagmiUtils.resultOrThrow<bigint>(fullData[1]);
  const totalSupply = WagmiUtils.resultOrThrow<bigint>(fullData[2]);
  const totalBorrow = WagmiUtils.resultOrThrow<bigint>(fullData[3]);
  const supplyRate = WagmiUtils.resultOrThrow<bigint>(fullData[4]);
  const borrowRate = WagmiUtils.resultOrThrow<bigint>(fullData[5]);
  const configControllerAddress = WagmiUtils.resultOrThrow<Address>(
    fullData[6],
  );

  const configController = await fetchConfigController(
    configControllerAddress,
    chainId,
    config,
  );
  const baseToken = await fetchBase(cometProxyAddress, chainId, config);

  const collaterals = await fetchUserCollaterals(
    cometProxyAddress,
    userAddress,
    chainId,
  );

  const userMarket = new UserMarket({
    chain: chainId,
    borrowMinAmount,
    borrowBalance,
    supplyBalance,
    baseTokenBalance,
    cometAddress: cometProxyAddress,
    utilization,
    supplyRate,
    borrowRate,
    totalBorrow,
    totalSupply,
    totalReserves,
    baseToken,
    collaterals: collaterals,
    availableLiquidity,
    configControllerAddress,
    ownerAddress: configController.owner,
    guardianAddress: configController.guardian,
    curatorAddress: configController.curator,
    curatorFee: configController.curatorFee,
    //
    proposals: [], // TODO
    //
    compToken: await fetchBaseMock(), // TODO
    rewardTokens: [], // TODO
  });

  return new UserMarketWrapper(userMarket, config, chainId);
}
