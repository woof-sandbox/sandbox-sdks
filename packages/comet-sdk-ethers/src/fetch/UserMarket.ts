import { UserMarket } from "@sandbox/comet-sdk";
import { multicall } from "@wagmi/core";
import type { Provider, Signer } from "ethers";
import { cometAbi, erc20Abi } from "../abis";
import { config } from "../contracts";
import { fetchBaseMock } from "./Base";

export async function fetchUserMarket(
  cometProxyAddress: `0x${string}`,
  chainId: any,
  userAddress: `0x${string}`,
  driver?: Provider | Signer,
): Promise<UserMarket> {
  const cometBaseData = await multicall(config, {
    chainId,
    contracts: [
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "baseToken",
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "baseTokenPriceFeed",
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "getUtilization",
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "balanceOf",
        args: [userAddress],
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "borrowBalanceOf",
        args: [userAddress],
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "getReserves",
      } as const,

      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "baseBorrowMin",
      } as const,
    ],
  });

  const baseTokenAddress = cometBaseData[0].result || "0x123";
  const baseTokenPriceFeed = cometBaseData[1].result || "0x123";
  const utilization = cometBaseData[2].result || BigInt(0);

  const fullData = await multicall(config, {
    chainId,
    contracts: [
      {
        address: baseTokenAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [userAddress],
      } as const,
      {
        address: baseTokenAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [cometProxyAddress],
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "decimals",
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "baseIndexScale",
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "totalSupply",
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "totalBorrow",
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "getPrice",
        args: [baseTokenPriceFeed],
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "baseTrackingSupplySpeed",
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "baseTrackingBorrowSpeed",
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "getSupplyRate",
        args: [utilization],
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "getBorrowRate",
        args: [utilization],
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "supplyKink",
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "supplyPerSecondInterestRateBase",
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "supplyPerSecondInterestRateSlopeLow",
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "supplyPerSecondInterestRateSlopeHigh",
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "borrowKink",
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "borrowPerSecondInterestRateBase",
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "borrowPerSecondInterestRateSlopeLow",
      } as const,
      {
        address: cometProxyAddress,
        abi: cometAbi,
        functionName: "borrowPerSecondInterestRateSlopeHigh",
      } as const,
    ],
  });

  const baseTokenBalance = fullData[0].result || BigInt(0);
  const availableLiquidity = fullData[1].result || BigInt(0);
  const totalSupply = fullData[4].result || BigInt(0);
  const totalBorrow = fullData[5].result || BigInt(0);
  const supplyRate = fullData[9].result || BigInt(0);
  const borrowRate = fullData[10].result || BigInt(0);

  const supplyBalance = cometBaseData[3].result || BigInt(0);
  const borrowBalance = cometBaseData[4].result || BigInt(0);
  const totalReserves = cometBaseData[6].result || BigInt(0);
  const baseToken = await fetchBaseMock(cometProxyAddress, driver);

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
    collaterals: [],
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
