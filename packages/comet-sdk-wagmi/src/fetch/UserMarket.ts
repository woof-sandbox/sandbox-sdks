import { UserMarket } from "@sandbox/comet-sdk";
import { type Config, multicall } from "@wagmi/core";
import type { Address } from "viem";
import type { WagmiChainId } from "../config/chains";
import { CometContract, Erc20Contract, wagmiConfig } from "../contracts";
import { WagmiUtils } from "../utils";
import { UserMarketWrapper } from "../wrapper/UserMarketWrapper";
import { fetchBase, fetchBaseMock } from "./Base";
import { fetchUserCollaterals } from "./UserCollateral";

export async function fetchUserMarkets(
  marketConfig: Record<number, `0x${string}`[]>,
  userAddress: `0x${string}`,
): Promise<UserMarket[]> {
  const marketInChain = Object.entries(marketConfig).flatMap(
    async ([chainId, marketsComets]) => {
      const cometsBaseData = await multicall(wagmiConfig, {
        chainId: Number(chainId) as WagmiChainId,
        contracts: marketsComets.flatMap((cometProxyAddress) => {
          const comet = new CometContract(
            cometProxyAddress,
            Number(chainId) as WagmiChainId,
          );

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
            currentCometBaseData[6],
          );

          const comet = new CometContract(
            cometProxyAddress,
            Number(chainId) as WagmiChainId,
          );
          const baseTokenContract = new Erc20Contract(
            baseTokenAddress,
            Number(chainId) as WagmiChainId,
          );

          const fullData = await multicall(wagmiConfig, {
            chainId: Number(chainId) as WagmiChainId,
            contracts: [
              baseTokenContract.getBalanceOfCall(userAddress),
              baseTokenContract.getBalanceOfCall(cometProxyAddress),
              comet.getDecimalsCall(), // ?: not in use
              comet.getBaseIndexScaleCall(), // ?: not in use
              comet.getTotalSupplyCall(),
              comet.getTotalBorrowCall(),
              comet.getPriceCall(baseTokenPriceFeed), // ?: not in use
              comet.getBaseTrackingSupplySpeedCall(), // ?: not in use
              comet.getBaseTrackingBorrowSpeedCall(), // ?: not in use
              comet.getSupplyRateCall(utilization),
              comet.getBorrowRateCall(utilization),
              //
              comet.getSupplyKinkCall(), // ?: not in use
              comet.getSupplyPerSecondInterestRateBaseCall(), // ?: not in use
              comet.getSupplyPerSecondInterestRateSlopeLowCall(), // ?: not in use
              comet.getSupplyPerSecondInterestRateSlopeHighCall(), // ?: not in use
              //
              comet.getBorrowKinkCall(), // ?: not in use
              comet.getBorrowPerSecondInterestRateBaseCall(), // ?: not in use
              comet.getBorrowPerSecondInterestRateSlopeLowCall(), // ?: not in use
              comet.getBorrowPerSecondInterestRateSlopeHighCall(), // ?: not in use
            ],
          });

          const baseTokenBalance = WagmiUtils.resultOrThrow<bigint>(
            fullData[0],
          );
          const availableLiquidity = WagmiUtils.resultOrThrow<bigint>(
            fullData[1],
          );
          const totalSupply = WagmiUtils.resultOrThrow<bigint>(fullData[4]);
          const totalBorrow = WagmiUtils.resultOrThrow<bigint>(fullData[5]);
          const supplyRate = WagmiUtils.resultOrThrow<bigint>(fullData[9]);
          const borrowRate = WagmiUtils.resultOrThrow<bigint>(fullData[10]);

          const baseToken = await fetchBase(
            cometProxyAddress,
            Number(chainId) as WagmiChainId,
          );

          const collaterals = await fetchUserCollaterals(
            cometProxyAddress,
            userAddress,
            Number(chainId) as WagmiChainId,
          );

          return new UserMarket({
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

export async function fetchUserMarket(
  cometProxyAddress: `0x${string}`,
  userAddress: `0x${string}`,
  chainId: WagmiChainId,
  config: Config,
): Promise<UserMarketWrapper> {
  const comet = new CometContract(cometProxyAddress, chainId);
  const cometBaseData = await multicall(wagmiConfig, {
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
  const totalReserves = WagmiUtils.resultOrThrow<bigint>(cometBaseData[6]);

  const baseTokenContract = new Erc20Contract(baseTokenAddress, chainId);

  const fullData = await multicall(wagmiConfig, {
    chainId,
    contracts: [
      baseTokenContract.getBalanceOfCall(userAddress),
      baseTokenContract.getBalanceOfCall(cometProxyAddress),
      comet.getDecimalsCall(), // ?: not in use
      comet.getBaseIndexScaleCall(), // ?: not in use
      comet.getTotalSupplyCall(),
      comet.getTotalBorrowCall(),
      comet.getPriceCall(baseTokenPriceFeed), // ?: not in use
      comet.getBaseTrackingSupplySpeedCall(), // ?: not in use
      comet.getBaseTrackingBorrowSpeedCall(), // ?: not in use
      comet.getSupplyRateCall(utilization),
      comet.getBorrowRateCall(utilization),
      //
      comet.getSupplyKinkCall(), // ?: not in use
      comet.getSupplyPerSecondInterestRateBaseCall(), // ?: not in use
      comet.getSupplyPerSecondInterestRateSlopeLowCall(), // ?: not in use
      comet.getSupplyPerSecondInterestRateSlopeHighCall(), // ?: not in use
      //
      comet.getBorrowKinkCall(), // ?: not in use
      comet.getBorrowPerSecondInterestRateBaseCall(), // ?: not in use
      comet.getBorrowPerSecondInterestRateSlopeLowCall(), // ?: not in use
      comet.getBorrowPerSecondInterestRateSlopeHighCall(), // ?: not in use
    ],
  });

  const baseTokenBalance = WagmiUtils.resultOrThrow<bigint>(fullData[0]);
  const availableLiquidity = WagmiUtils.resultOrThrow<bigint>(fullData[1]);
  const totalSupply = WagmiUtils.resultOrThrow<bigint>(fullData[4]);
  const totalBorrow = WagmiUtils.resultOrThrow<bigint>(fullData[5]);
  const supplyRate = WagmiUtils.resultOrThrow<bigint>(fullData[9]);
  const borrowRate = WagmiUtils.resultOrThrow<bigint>(fullData[10]);

  const baseToken = await fetchBase(cometProxyAddress, chainId);

  const collaterals = await fetchUserCollaterals(
    cometProxyAddress,
    userAddress,
    Number(chainId) as WagmiChainId,
  );

  const userMarket = new UserMarket({
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

  return new UserMarketWrapper(userMarket, config);
}
