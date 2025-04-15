import {UserMarket} from "@sandbox/comet-sdk";
import {multicall} from "@wagmi/core";
import {CometContract, Erc20Contract, WagmiConfig} from "../contracts";
import {fetchBaseMock} from "./Base";
import {WagmiUtils} from "../utils";
import {Address} from "viem";

export async function fetchUserMarket(
    cometProxyAddress: `0x${string}`,
    chainId: any,
    userAddress: `0x${string}`,
): Promise<UserMarket> {
    const comet = new CometContract(WagmiConfig, cometProxyAddress as `0x${string}`);


    const cometBaseData = await multicall(WagmiConfig, {
        chainId,
        contracts: [
            comet.getBaseTokenCall(),
            comet.getBaseTokenPriceFeedCall(),
            comet.getUtilizationCall(),
            comet.getBorrowBalanceOf(userAddress),
            comet.getBorrowBalanceOfCall(userAddress),
            comet.getReservesCall(),
            comet.getBaseBorrowMinCall(),
        ],
    });

    const baseTokenAddress = WagmiUtils.resultOrThrow<Address>(cometBaseData[0]);
    const baseTokenPriceFeed = WagmiUtils.resultOrThrow<Address>(cometBaseData[1]);
    const utilization = WagmiUtils.resultOrThrow<bigint>(cometBaseData[2]);

    const token = new Erc20Contract(WagmiConfig, baseTokenAddress);

    const fullData = await multicall(WagmiConfig, {
        chainId,
        contracts: [
            token.getBalanceOfCall(userAddress),
            token.getBalanceOfCall(cometProxyAddress),
            comet.getDecimalsCall(),
            comet.getBaseIndexScaleCall(),
            comet.getTotalSupplyCall(),
            comet.getTotalBorrowCall(),
            comet.getPriceCall(baseTokenPriceFeed),
            comet.getBaseTrackingSupplySpeedCall(),
            comet.getBaseTrackingBorrowSpeedCall(),
            comet.getSupplyRateCall(utilization),
            comet.getBorrowRateCall(utilization),
            comet.getSupplyKinkCall(),
            comet.getSupplyPerSecondInterestRateBaseCall(),
            comet.getSupplyPerSecondInterestRateSlopeLowCall(),
            comet.getSupplyPerSecondInterestRateSlopeHighCall(),
            comet.getBorrowKinkCall(),
            comet.getBorrowPerSecondInterestRateBaseCall(),
            comet.getBorrowPerSecondInterestRateSlopeLowCall(),
            comet.getBorrowPerSecondInterestRateSlopeHighCall(),
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
