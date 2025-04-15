import {UserMarket} from "@sandbox/comet-sdk";
import {multicall} from "@wagmi/core";
import {cometAbi, erc20Abi} from "../abis";
import {WagmiConfig} from "../contracts";
import {fetchBaseMock} from "./Base";
import {WagmiUtils} from "../utils";
import {Address} from "viem";

export async function fetchUserMarket(
    cometProxyAddress: `0x${string}`,
    chainId: any,
    userAddress: `0x${string}`,
): Promise<UserMarket> {
    const cometBaseData = await multicall(WagmiConfig, {
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

    const baseTokenAddress = WagmiUtils.resultOrThrow<Address>(cometBaseData[0]);
    const baseTokenPriceFeed = WagmiUtils.resultOrThrow<Address>(cometBaseData[1]);
    const utilization = WagmiUtils.resultOrThrow<bigint>(cometBaseData[2]);

    const fullData = await multicall(WagmiConfig, {
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

    const baseTokenBalance = WagmiUtils.resultOrThrow<bigint>(fullData[0]);
    const availableLiquidity = WagmiUtils.resultOrThrow<bigint>(fullData[1]);
    const totalSupply = WagmiUtils.resultOrThrow<bigint>(fullData[4]);
    const totalBorrow = WagmiUtils.resultOrThrow<bigint>(fullData[5]);
    const supplyRate = WagmiUtils.resultOrThrow<bigint>(fullData[9]);
    const borrowRate = WagmiUtils.resultOrThrow<bigint>(fullData[10]);

    const supplyBalance = WagmiUtils.resultOrThrow<bigint>(cometBaseData[3]);
    const borrowBalance = WagmiUtils.resultOrThrow<bigint>(cometBaseData[4]);
    const totalReserves = WagmiUtils.resultOrThrow<bigint>(cometBaseData[6]);
    const baseToken = await fetchBaseMock(cometProxyAddress, chainId);

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
