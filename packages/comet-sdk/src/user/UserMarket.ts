import { formatUnits, parseUnits } from "ethers";
import { PRICE_FEED_MANTISSA } from "../constants";
import { Market } from "../market";
import { DataUtils } from "../utils/data";
import type { IUserMarket } from "./IUserMarket";
import type { MultiAllowanceCallType } from "./entities/multi-allowance-call";
import type { MultiAllowanceResponseType } from "./entities/multi-allowance-result";

export class UserMarket extends Market implements IUserMarket {
  public borrowBalance: bigint;
  public supplyBalance: bigint;
  public baseTokenBalance: bigint;

  constructor(userMarket: IUserMarket) {
    super(userMarket);
    this.borrowBalance = userMarket.borrowBalance;
    this.supplyBalance = userMarket.supplyBalance;
    this.baseTokenBalance = userMarket.baseTokenBalance;
  }

  getTokenPrice(symbol: string, tokenPrice: bigint): number {
    return symbol === "ETH" ||
      symbol === "wstETH" ||
      symbol === "WBTC" ||
      symbol === "WETH"
      ? Number(formatUnits(tokenPrice, PRICE_FEED_MANTISSA)) *
          Number(this.price)
      : Number(formatUnits(tokenPrice, PRICE_FEED_MANTISSA));
  }

  getBorrowCapacityMarketUSD() {
    return this.collaterals
      .map(
        (collateral) =>
          //TODO add totalSupply
          // Number(formatUnits(collateral.totalSupply, collateral.decimals)) *
          Number(formatUnits(collateral.liquidationFactor, 18)) *
          this.getTokenPrice(
            collateral.symbol,
            DataUtils.toBigNumber(collateral.price, PRICE_FEED_MANTISSA),
          ),
      )
      .reduce((a: number, b: number) => a + b, 0);
  }

  maxWithDrawCollateralAmount() {
    const borrowCapacityUSD = this.getBorrowCapacityMarketUSD();

    const supplyAmount = DataUtils.fromBigNumber(
      this.supplyBalance,
      Number(this.baseToken.decimals),
    );

    const borrowBalanceUSD =
      Number(
        DataUtils.fromBigNumber(
          this.borrowBalance,
          Number(this.baseToken.decimals),
        ),
      ) * Number(this.price);

    const availableToBorrow = borrowCapacityUSD - borrowBalanceUSD;

    if (this.borrowBalance > BigInt(0)) {
      return (availableToBorrow / Number(this.price)).toString();
    } else {
      return supplyAmount;
    }
  }

  findMarketCollateralByAddress(collateralAddress: `0x${string}`) {
    return this.collaterals.find(
      (marketCollateral) =>
        marketCollateral.tokenAddress.toLowerCase() ===
        collateralAddress.toLowerCase(),
    );
  }

  isTokenSmallAllowance(tokenAmount: bigint, allowance?: bigint) {
    if (!allowance) {
      return true;
    }
    return tokenAmount < allowance;
  }

  isSomeTokenSmallAllowance(
    collateralsAllowances: MultiAllowanceResponseType[],
  ) {
    return collateralsAllowances.some((collateral) => {
      const currentCollateralData = this.findMarketCollateralByAddress(
        collateral.tokenAddress,
      );

      return this.isTokenSmallAllowance(
        DataUtils.toBigNumber(
          collateral.inputAmount,
          Number(currentCollateralData?.decimals || 18),
        ),
        collateral.allowance,
      );
    });
  }

  isAllCollateralsFromMarket(supplyCollaterals: MultiAllowanceCallType[]) {
    return supplyCollaterals
      .map(({ tokenAddress }) => tokenAddress)
      .every((tokenAddress) =>
        this.collaterals
          .map((marketCollateral) =>
            marketCollateral.tokenAddress.toLowerCase(),
          )
          .includes(tokenAddress),
      );
  }

  availableToBorrow() {
    if (!this.collaterals.length) {
      return "10";
    }
    const borrowCapacity =
      this.collaterals
        .map(
          (collateral) =>
            // Number(formatUnits(collateral.totalSupply, collateral.decimals)) * // here need to add user total supply in collateral
            10 *
            Number(formatUnits(collateral.collateralFactor, 18)) *
            this.getTokenPrice(
              collateral.symbol,
              parseUnits(collateral.price, PRICE_FEED_MANTISSA),
            ),
        )
        .reduce((a: number, b: number) => a + b) / 1.5;

    const borrow = Number(this.borrowBalance) * Number(this.price);

    const availableToBorrow = (borrowCapacity - borrow) / Number(this.price);

    return availableToBorrow.toString();
  }
}
