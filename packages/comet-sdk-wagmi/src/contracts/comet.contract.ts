import {
  type Config,
  type WriteContractReturnType,
  multicall,
} from "@wagmi/core";
import type { UserCollateral } from "@woof-software/comet-sdk/lib";
import type { ContractFunctionParameters } from "viem";
import { cometAbi } from "../abis";
import type { WagmiChainId } from "../config";
import { WagmiContract } from "./wagmi-contract";
import { wagmiConfig } from "./wagmiConfig";
import {
  MultiAllowanceCallType,
  MultiAllowanceCallTypeBigInt,
} from "./entities/multi-allowance-call";

export interface AssetConfig {
  collateralToken: `0x${string}`;
  priceFeed: `0x${string}`;
  borrowCollateralFactor: bigint;
  liquidateCollateralFactor: bigint;
  liquidationFactor: bigint;
  supplyCap: bigint;
  scale: bigint;
}

export interface MarketConfig {
  governor: `0x${string}`;
  pauseGuardian: `0x${string}`;
  baseToken: `0x${string}`;
  baseTokenPriceFeed: `0x${string}`;
  extensionDelegate: `0x${string}`;
  supplyKink: bigint;
  supplyPerYearInterestRateSlopeLow: bigint;
  supplyPerYearInterestRateSlopeHigh: bigint;
  supplyPerYearInterestRateBase: bigint;
  borrowKink: bigint;
  borrowPerYearInterestRateSlopeLow: bigint;
  borrowPerYearInterestRateSlopeHigh: bigint;
  borrowPerYearInterestRateBase: bigint;
  storeFrontPriceFactor: bigint;
  trackingIndexScale: bigint;
  baseTrackingSupplySpeed: bigint;
  baseTrackingBorrowSpeed: bigint;
  baseMinForRewards: bigint;
  baseBorrowMin: bigint;
  targetReserves: bigint;
  assetConfigs: AssetConfig[];
}

export class CometContract extends WagmiContract {
  constructor(
    address: `0x${string}`,
    chainId?: WagmiChainId,
    config: Config = wagmiConfig,
  ) {
    super(config, cometAbi, address, chainId);
  }

  getTotalsCollateralCall(
    collateralAddress: `0x${string}`,
  ): ContractFunctionParameters {
    return this.getCall("totalsCollateral", [collateralAddress]);
  }

  getCollateralReservesCall(
    collateralAddress: `0x${string}`,
  ): ContractFunctionParameters {
    return this.getCall("getCollateralReserves", [collateralAddress]);
  }

  async getUtilization(): Promise<bigint> {
    const utilization = await this.read("getUtilization", this.chainId);
    return utilization as bigint;
  }

  getUtilizationCall(): ContractFunctionParameters {
    return this.getCall("getUtilization");
  }

  async numAssets(): Promise<bigint> {
    const numAssets = await this.read("numAssets", this.chainId);
    return numAssets as bigint;
  }

  getNumAssetsCall(): ContractFunctionParameters {
    return this.getCall("numAssets");
  }

  getAssetInfoCall(index: number): ContractFunctionParameters {
    return this.getCall("getAssetInfo", [index]);
  }

  getDecimalsCall(): ContractFunctionParameters {
    return this.getCall("decimals");
  }

  getBorrowRateCall(utilization: bigint): ContractFunctionParameters {
    return this.getCall("getBorrowRate", [utilization]);
  }

  getSupplyRateCall(utilization: bigint): ContractFunctionParameters {
    return this.getCall("getSupplyRate", [utilization]);
  }

  //
  getTotalBorrowCall(): ContractFunctionParameters {
    return this.getCall("totalBorrow");
  }

  getTotalSupplyCall(): ContractFunctionParameters {
    return this.getCall("totalSupply");
  }

  getReservesCall(): ContractFunctionParameters {
    return this.getCall("getReserves");
  }

  getBaseBorrowMinCall(): ContractFunctionParameters {
    return this.getCall("baseBorrowMin");
  }

  getBaseTokenCall(): ContractFunctionParameters {
    return this.getCall("baseToken");
  }

  async getContractName(): Promise<string> {
    const nonce = await this.read("name", this.chainId);

    return nonce as string;
  }

  async getContractVersion(): Promise<string> {
    const nonce = await this.read("version", this.chainId);

    return nonce as string;
  }

  async getUserNonce(owner: `0x${string}`): Promise<number> {
    const nonce = await this.read("userNonce", this.chainId, [owner]);

    return nonce as number;
  }

  async writeAllowAllBySig(
    owner: `0x${string}`,
    bulker: `0x${string}`,
    nonce: number,
    expiry: bigint,
    v: number,
    r: string,
    s: string,
  ): Promise<WriteContractReturnType> {
    return await this.write("allowAllBySig", this.chainId, [
      owner,
      bulker,
      true,
      nonce,
      expiry,
      v,
      r,
      s,
    ]);
  }

  async isAllowed(
    owner: `0x${string}`,
    bulker: `0x${string}`,
  ): Promise<boolean> {
    const isAllowed = await this.read("allowanceAll", this.chainId, [
      owner,
      bulker,
    ]);

    return isAllowed as boolean;
  }

  async isAllowedToken(
    owner: `0x${string}`,
    bulker: `0x${string}`,
    tokenAddress: `0x${string}`,
    amount: bigint,
  ): Promise<boolean> {
    const result: any = await this.read("allowance", this.chainId, [
      owner,
      bulker,
      tokenAddress,
    ]);

    const allowAmount = result as bigint;

    console.log("--allowAmount--", allowAmount);
    console.log("--amount--", amount);

    return allowAmount >= amount;
  }

  async isAllowedTokens(
    owner: `0x${string}`,
    bulker: `0x${string}`,
    tokensData: MultiAllowanceCallTypeBigInt[],
  ): Promise<boolean> {
    const tokensAllowance = await multicall(wagmiConfig, {
      chainId: this.chainId,
      contracts: tokensData.map(({ tokenAddress }) =>
        this.getCallAddress(this.address, "allowance", [
          owner,
          bulker,
          tokenAddress,
        ]),
      ),
    });

    console.log("--tokensAllowance--", tokensAllowance);

    const isSomeSmall = tokensData.some((tokenData, index) => {
      const currentTokenAllowance = tokensAllowance[index]?.result as bigint;

      if (!currentTokenAllowance) {
        return true;
      }

      console.log("--currentTokenAllowance--", currentTokenAllowance);
      console.log("--tokenData.inputAmount--", tokenData.inputAmount);
      return currentTokenAllowance < tokenData.inputAmount;
    });

    return !isSomeSmall;
  }

  async allow(
    bulker: `0x${string}`,
    collaterals: UserCollateral[],
  ): Promise<WriteContractReturnType> {
    return this.write("approveAllTokens", this.chainId, [
      bulker,
      BigInt(
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      ) - BigInt(1),
      [
        ...collaterals.map(
          () =>
            BigInt(
              "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            ) - BigInt(1),
        ),
      ],
    ]);
  }

  getAllowCall(
    bulker: `0x${string}`,
    status: boolean,
  ): ContractFunctionParameters {
    return this.getCall("allow", [bulker, status]);
  }

  //
  getBalanceOfCall(userAddress: `0x${string}`): ContractFunctionParameters {
    return this.getCall("balanceOf", [userAddress]);
  }

  getBorrowBalanceOfCall(
    userAddress: `0x${string}`,
  ): ContractFunctionParameters {
    return this.getCall("borrowBalanceOf", [userAddress]);
  }

  getCollateralBalanceOfCall(
    userAddress: `0x${string}`,
  ): ContractFunctionParameters {
    return this.getCall("collateralBalanceOf", [userAddress]);
  }

  getLiquidationFactorCall(): ContractFunctionParameters {
    return this.getCall("getLiquidationFactor");
  }

  // CURVE

  getSupplyKinkCall(): ContractFunctionParameters {
    return this.getCall("supplyKink");
  }

  getSupplyPerSecondInterestRateSlopeLowCall(): ContractFunctionParameters {
    return this.getCall("supplyPerSecondInterestRateSlopeLow");
  }

  getSupplyPerSecondInterestRateSlopeHighCall(): ContractFunctionParameters {
    return this.getCall("supplyPerSecondInterestRateSlopeHigh");
  }

  getSupplyPerSecondInterestRateBaseCall(): ContractFunctionParameters {
    return this.getCall("supplyPerSecondInterestRateBase");
  }

  getBorrowKinkCall(): ContractFunctionParameters {
    return this.getCall("borrowKink");
  }

  getBorrowPerSecondInterestRateSlopeLowCall(): ContractFunctionParameters {
    return this.getCall("borrowPerSecondInterestRateSlopeLow");
  }

  getBorrowPerSecondInterestRateSlopeHighCall(): ContractFunctionParameters {
    return this.getCall("borrowPerSecondInterestRateSlopeHigh");
  }

  getBorrowPerSecondInterestRateBaseCall(): ContractFunctionParameters {
    return this.getCall("borrowPerSecondInterestRateBase");
  }

  // BASE

  getBaseTokenPriceFeedCall(): ContractFunctionParameters {
    return this.getCall("baseTokenPriceFeed");
  }

  getPriceCall(priceFeedAddress: `0x${string}`): ContractFunctionParameters {
    return this.getCall("getPrice", [priceFeedAddress]);
  }

  getUserCollateralCall(
    userAddress: `0x${string}`,
    tokenAddress: `0x${string}`,
  ): ContractFunctionParameters {
    return this.getCall("userCollateral", [userAddress, tokenAddress]);
  }

  getBaseMinForRewardsCall(): ContractFunctionParameters {
    return this.getCall("baseMinForRewards");
  }

  getBaseTrackingBorrowSpeedCall(): ContractFunctionParameters {
    return this.getCall("baseTrackingBorrowSpeed");
  }

  getBaseTrackingSupplySpeedCall(): ContractFunctionParameters {
    return this.getCall("baseTrackingSupplySpeed");
  }

  getBaseScaleCall(): ContractFunctionParameters {
    // Requires additional ABI. Works while it is not showing on scan
    return this.getCall("baseScale");
  }

  async getConfiguration(): Promise<MarketConfig> {
    const configuration = await this.read("getConfiguration");
    return configuration as MarketConfig;
  }
}
