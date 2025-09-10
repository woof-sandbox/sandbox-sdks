import {
  type Config,
  type WriteContractReturnType,
  multicall,
} from "@wagmi/core";
import type { UserCollateral } from "@woof-software/comet-sdk/lib";
import type { Address, ContractFunctionParameters } from "viem";
import { cometAbi } from "../abis";
import type { WagmiChainId } from "../config";
import type { MultiAllowanceCallTypeBigInt } from "./entities/multi-allowance-call";
import { WagmiContract } from "./wagmi-contract";
import { wagmiConfig } from "./wagmiConfig";

export interface AssetConfig {
  collateralToken: Address;
  priceFeed: Address;
  borrowCollateralFactor: bigint;
  liquidateCollateralFactor: bigint;
  liquidationFactor: bigint;
  supplyCap: bigint;
  scale: bigint;
}

export interface MarketConfig {
  governor: Address;
  pauseGuardian: Address;
  baseToken: Address;
  baseTokenPriceFeed: Address;
  extensionDelegate: Address;
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
    address: Address,
    chainId?: WagmiChainId,
    config: Config = wagmiConfig,
  ) {
    super(config, cometAbi, address, chainId);
  }

  getTotalsCollateralCall(
    collateralAddress: Address,
  ): ContractFunctionParameters {
    return this.getCall("totalsCollateral", [collateralAddress]);
  }

  getCollateralReservesCall(
    collateralAddress: Address,
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

  getConfigControllerCall(): ContractFunctionParameters {
    return this.getCall("configController");
  }

  async getContractName(): Promise<string> {
    const nonce = await this.read("name", this.chainId);

    return nonce as string;
  }

  async getContractVersion(): Promise<string> {
    const nonce = await this.read("version", this.chainId);

    return nonce as string;
  }

  async getUserNonce(owner: Address): Promise<number> {
    const nonce = await this.read("userNonce", this.chainId, [owner]);

    return nonce as number;
  }
  /**
   * THIS allows full amount withdraw or repay
   */
  async writeAllowAllBySig(
    owner: Address,
    bulker: Address,
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
  /**
   * Check allow for full amount withdraw or repay
   */
  async isAllowed(owner: Address, bulker: Address): Promise<boolean> {
    const isAllowed = await this.read("allowanceAll", this.chainId, [
      owner,
      bulker,
    ]);

    return isAllowed as boolean;
  }

  /**
   * Check allow for not full amount withdraw or repay
   */
  async isAllowedToken(
    owner: Address,
    bulker: Address,
    tokenAddress: Address,
    amount: bigint,
  ): Promise<boolean> {
    const result = await this.read("allowance", this.chainId, [
      owner,
      bulker,
      tokenAddress,
    ]);

    const allowAmount = result as bigint;

    return allowAmount >= amount;
  }

  /**
   * Check allow for not full amount withdraw or repay
   */
  async isAllowedTokens(
    owner: Address,
    bulker: Address,
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

    const isSomeSmall = tokensData.some((tokenData, index) => {
      const currentTokenAllowance = tokensAllowance[index]?.result as bigint;

      if (!currentTokenAllowance) {
        return true;
      }

      return currentTokenAllowance < tokenData.inputAmount;
    });

    return !isSomeSmall;
  }

  /**
   * This allow is for collaterals and not full amount withdraw and repay
   */
  async allow(
    bulker: Address,
    collaterals: UserCollateral[],
  ): Promise<WriteContractReturnType> {
    return this.write("approveAllTokens", this.chainId, [
      bulker,
      BigInt(
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      ) - 1n,
      [
        ...collaterals.map(
          () =>
            BigInt(
              "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            ) - 1n,
        ),
      ],
    ]);
  }

  async approve(
    migrator: Address,
    amount: bigint,
  ): Promise<WriteContractReturnType> {
    return this.write("approve", this.chainId, [migrator, amount]);
  }

  getAllowCall(bulker: Address, status: boolean): ContractFunctionParameters {
    return this.getCall("allow", [bulker, status]);
  }

  //
  getBalanceOfCall(userAddress: Address): ContractFunctionParameters {
    return this.getCall("balanceOf", [userAddress]);
  }

  getBorrowBalanceOfCall(userAddress: Address): ContractFunctionParameters {
    return this.getCall("borrowBalanceOf", [userAddress]);
  }

  getCollateralBalanceOfCall(userAddress: Address): ContractFunctionParameters {
    return this.getCall("collateralBalanceOf", [userAddress]);
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

  getPriceCall(priceFeedAddress: Address): ContractFunctionParameters {
    return this.getCall("getPrice", [priceFeedAddress]);
  }

  getUserCollateralCall(
    userAddress: Address,
    tokenAddress: Address,
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
