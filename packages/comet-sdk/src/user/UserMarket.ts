import type { Address } from "viem";
import { Market } from "../market";
import type { ICustomCollateral } from "./ICustomCollateral";
import type { IUserMarket } from "./IUserMarket";
import type { UserCollateral } from "./UserCollateral";
import { UserMarketMethods } from "./UserMarketMethods";
import type { MultiAllowanceResponseType } from "./entities/multi-allowance-result";

export class UserMarket extends Market implements IUserMarket {
  public borrowBalance: bigint;
  public supplyBalance: bigint;
  public baseTokenBalance: bigint;
  public collaterals: UserCollateral[];

  constructor(userMarket: IUserMarket) {
    super(userMarket);
    this.borrowBalance = userMarket.borrowBalance;
    this.supplyBalance = userMarket.supplyBalance;
    this.baseTokenBalance = userMarket.baseTokenBalance;
    this.collaterals = userMarket.collaterals;
  }

  get borrowBalanceUSD(): number {
    return UserMarketMethods.borrowBalanceUsd(
      this.borrowBalance,
      this.baseToken.decimals,
      this.price,
    );
  }

  get supplyBalanceUSD(): number {
    return UserMarketMethods.supplyBalanceUsd(
      this.supplyBalance,
      this.baseToken.decimals,
      this.price,
    );
  }

  getTokenPrice(tokenPrice: bigint, usdToken = false): number {
    return UserMarketMethods.tokenPrice(tokenPrice, this.price, usdToken);
  }

  get borrowCollateralValueUSD(): number {
    return UserMarketMethods.borrowCollateralValueUSD(
      this.collaterals,
      this.price,
    );
  }

  getBorrowCollateralValueUSD(customCollaterals: ICustomCollateral[]): number {
    return UserMarketMethods.borrowCollateralValueCustomUsd(
      this.collaterals,
      customCollaterals,
      this.price,
    );
  }

  get borrowCapacityMarketUSD(): number {
    return UserMarketMethods.borrowCapacityMarketUsd(
      this.collaterals,
      this.price,
    );
  }

  getBorrowCapacityMarketUSD(customCollaterals: ICustomCollateral[]): number {
    return UserMarketMethods.borrowCapacityMarketCustomUsd(
      this.collaterals,
      customCollaterals,
      this.price,
    );
  }

  get maxWithDrawCollateralAmount(): string {
    return UserMarketMethods.maxWithdrawCollateralAmount(
      this.borrowCapacityMarketUSD,
      this.supplyBalance,
      this.borrowBalance,
      this.baseToken.decimals,
      this.price,
    );
  }

  findMarketCollateralByAddress(
    collateralAddress: Address,
  ): UserCollateral | undefined {
    return UserMarketMethods.findMarketCollateralByAddress(
      collateralAddress,
      this.collaterals,
    );
  }

  isSomeTokenSmallAllowance(
    collateralsAllowances: MultiAllowanceResponseType[],
  ) {
    return UserMarketMethods.isSomeTokenAllowanceTooSmall(
      this.collaterals,
      collateralsAllowances,
    );
  }

  isAllCollateralsFromMarket(supplyCollaterals: ICustomCollateral[]) {
    return UserMarketMethods.isAllCollateralsFromMarket(
      this.collaterals,
      supplyCollaterals,
    );
  }

  get availableToBorrow() {
    return UserMarketMethods.availableToBorrow(
      this.collaterals,
      this.price,
      this.borrowBalance,
    );
  }

  earnAprCustom(userSupplyValue: string): number {
    return UserMarketMethods.earnAprCustom(
      userSupplyValue,
      this.baseToken,
      this.totalSupply,
      this.totalBorrow,
      this.baseToken.curvePresets[0]!,
    );
  }

  borrowAprCustom(userBorrowValue: string): number {
    return UserMarketMethods.borrowAprCustom(
      userBorrowValue,
      this.baseToken,
      this.totalSupply,
      this.totalBorrow,
      this.baseToken.curvePresets[0]!,
    );
  }

  netEarnAprsCustom(userSupplyValue: string): number[] {
    return UserMarketMethods.netEarnAprsCustom(
      userSupplyValue,
      this.baseToken,
      this.totalSupply,
      this.compToken,
      this.rewardTokens,
      this.supplyApr,
    );
  }

  netBorrowAprsCustom(userBorrowValue: string): number[] {
    return UserMarketMethods.netBorrowAprsCustom(
      userBorrowValue,
      this.baseToken,
      this.totalBorrow,
      this.compToken,
      this.rewardTokens,
      this.borrowApr,
    );
  }
}
