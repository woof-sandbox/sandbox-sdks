import { DataUtils, type IUserMarket } from "@woof-software/comet-sdk";
import { UserMarket } from "../augment";

import { type Config, getWalletClient } from "@wagmi/core";
import type { Address } from "viem";
import { encodeAbiParameters, type EncodeAbiParametersReturnType } from "viem";
import type { WagmiChainId } from "../config";
import {
  ACTION_SUPPLY_NATIVE_TOKEN,
  ACTION_SUPPLY_TOKEN,
  ACTION_WITHDRAW_ASSET,
  ACTION_WITHDRAW_NATIVE_TOKEN,
} from "../constants";
import { BulkerContract, CometContract, Erc20Contract } from "../contracts";
import type { MultiAllowanceCallType } from "../contracts/entities/multi-allowance-call";
import {
  ALLOW_FAILED,
  APPROVE_FAILED,
  BORROW_FAILED,
  BORROW_POSITION_OPEN,
  BORROW_SUPPLY_FAILED,
  BULKER_NOT_ALLOWED,
  COLLATERAL_NOT_FOUND,
  EXCESSIVE_COLLATERAL_WITHDRAW,
  INSUFFICIENT_COLLATERAL,
  INVALID_COLLATERAL_MARKET,
  LOW_COLLATERAL_ALLOWANCE,
  OVER_WITHDRAW,
  SMALL_BORROW_AMOUNT,
  SUPPLY_COLLATERAL_FAILED,
  SUPPLY_FAILED,
  TOKEN_NOT_APPROVED,
  WITHDRAW_COLLATERAL_FAILED,
  WITHDRAW_FAILED,
} from "../errors/wrappers/user-market-wrapper.errors";
//import { DataUtils } from "../utils";

// Todo need to find where to get Bulker Address
const bulkerAddress = "0xbde8f31d2ddda895264e27dd990fab3dc87b372d"; // arbitrum

export class UserMarketWrapper extends UserMarket {
  private readonly config: Config;
  private readonly chainId?: WagmiChainId;

  private readonly cometContract: CometContract;
  private readonly bulkerContract: BulkerContract;
  private readonly baseTokenContract: Erc20Contract;

  constructor(userMarket: IUserMarket, config: Config, chainId?: WagmiChainId) {
    super(userMarket);
    this.config = config;
    this.chainId = chainId;

    this.cometContract = new CometContract(
      this.cometAddress as Address,
      chainId,
      config,
    );
    this.bulkerContract = new BulkerContract(
      bulkerAddress as Address,
      chainId,
      config,
    );
    this.baseTokenContract = new Erc20Contract(
      this.baseToken.tokenAddress as Address,
      chainId,
      config,
    );
  }

  private _encodeSupplyNativeToken(
    userAddress: string,
    amount: bigint,
  ): EncodeAbiParametersReturnType {
    return encodeAbiParameters(
      [{ type: "address" }, { type: "address" }, { type: "uint256" }],
      [this.cometAddress as Address, userAddress as Address, amount],
    );
  }

  /**
   * Encode supply or borrow call with full params: market, user, token, amount
   */
  private _encodeSupplyOrWithdrawWithToken(
    userAddress: string,
    tokenAddress: string,
    amount: bigint,
  ): EncodeAbiParametersReturnType {
    return encodeAbiParameters(
      [
        { type: "address" },
        { type: "address" },
        { type: "address" },
        { type: "uint256" },
      ],
      [
        this.cometAddress as Address,
        userAddress as Address,
        tokenAddress as Address,
        amount,
      ],
    );
  }

  /**
   * Encode simple withdraw call: market, user, amount
   */
  private _encodeWithdrawSimple(
    userAddress: string,
    amount: bigint,
    tokenAddress?: string,
  ): EncodeAbiParametersReturnType {
    return encodeAbiParameters(
      [
        { type: "address" },
        { type: "address" },
        { type: "address" },
        { type: "uint256" },
      ],
      [
        this.cometAddress as Address,
        userAddress as Address,
        (tokenAddress || this.baseToken.tokenAddress) as Address,
        amount,
      ],
    );
  }

  private _encodeWithdrawNative(
    userAddress: string,
    amount: bigint,
  ): EncodeAbiParametersReturnType {
    return encodeAbiParameters(
      [{ type: "address" }, { type: "address" }, { type: "uint256" }],
      [this.cometAddress as Address, userAddress as Address, amount],
    );
  }

  async ensureBulkerAllowed(user: Address) {
    const allowed = await this.cometContract.isAllowed(user, bulkerAddress);
    if (!allowed) throw BULKER_NOT_ALLOWED();
  }

  async getBulkerAllowed(user: Address) {
    return await this.cometContract.isAllowed(user, bulkerAddress);
  }

  async allowMarket() {
    try {
      return await this.cometContract.allow(bulkerAddress, true);
    } catch (e) {
      throw ALLOW_FAILED();
    }
  }

  async approveMarketBaseToken(amount: string) {
    try {
      return await this.baseTokenContract.approve(
        this.cometAddress as Address,
        DataUtils.toBigNumber(amount, Number(this.baseToken.decimals)),
      );
    } catch (e) {
      throw APPROVE_FAILED();
    }
  }

  async approveToken(
    tokenAddress: Address,
    amount: string,
    tokenDecimals: number,
  ) {
    const token = new Erc20Contract(tokenAddress, this.chainId, this.config);

    try {
      return await token.approve(
        this.cometAddress as Address,
        DataUtils.toBigNumber(amount, tokenDecimals),
      );
    } catch (e) {
      throw APPROVE_FAILED();
    }
  }

  async getTokenAllowance(tokenAddress: Address) {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;

    const token = new Erc20Contract(tokenAddress, this.chainId, this.config);

    return await token.allowance(userAddress, this.cometAddress as Address);
  }

  async supplyMarket(inputValue: string, isNative: boolean): Promise<Address> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;
    await this.ensureBulkerAllowed(userAddress);

    const allowance = await this.getTokenAllowance(
      this.baseToken.tokenAddress as Address,
    );

    const supplyValue = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    if (!isNative && allowance < supplyValue)
      throw TOKEN_NOT_APPROVED(supplyValue);

    const abiEncodeData = isNative
      ? this._encodeSupplyNativeToken(userAddress, supplyValue)
      : this._encodeSupplyOrWithdrawWithToken(
          userAddress,
          this.baseToken.tokenAddress,
          supplyValue,
        );

    try {
      return await this.bulkerContract.invoke(
        [
          [isNative ? ACTION_SUPPLY_NATIVE_TOKEN : ACTION_SUPPLY_TOKEN],
          [abiEncodeData],
        ],
        isNative ? supplyValue : undefined,
      );
    } catch (e) {
      throw SUPPLY_FAILED();
    }
  }

  async borrowMarket(inputValue: string): Promise<Address> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;
    await this.ensureBulkerAllowed(userAddress);

    const borrowValue = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    const minBorrowValue = this.borrowMinAmount + this.supplyBalance;

    if (borrowValue < minBorrowValue) throw SMALL_BORROW_AMOUNT();

    const availableToBorrow = DataUtils.toBigNumber(
      this.availableToBorrow,
      Number(this.baseToken.decimals),
    );

    if (availableToBorrow <= borrowValue) throw INSUFFICIENT_COLLATERAL();

    const abiEncodeData = this._encodeSupplyOrWithdrawWithToken(
      userAddress,
      this.baseToken.tokenAddress,
      DataUtils.toBigNumber(inputValue, Number(this.baseToken.decimals)),
    );

    try {
      return await this.bulkerContract.invoke([
        [ACTION_WITHDRAW_ASSET],
        [abiEncodeData],
      ]);
    } catch (e) {
      throw BORROW_FAILED();
    }
  }

  async borrowAndSupplyMarket(
    inputValue: string,
    supplyCollaterals: MultiAllowanceCallType[],
  ): Promise<Address> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;
    await this.ensureBulkerAllowed(userAddress);

    const isCollateralsFromThisMarket =
      this.isAllCollateralsFromMarket(supplyCollaterals);

    if (!isCollateralsFromThisMarket) throw INVALID_COLLATERAL_MARKET();

    const collateralsAllowances =
      await this.baseTokenContract.getMultiAllowance(
        supplyCollaterals,
        this.chainId,
        userAddress,
        this.cometAddress as Address,
      );

    const isSmallAllowance = this.isSomeTokenSmallAllowance(
      collateralsAllowances,
    );

    if (isSmallAllowance) throw LOW_COLLATERAL_ALLOWANCE();

    const collateralsActions: Address[] = collateralsAllowances.map((data) =>
      data.isNative ? ACTION_SUPPLY_NATIVE_TOKEN : ACTION_SUPPLY_TOKEN,
    );

    let nativeTokenAmount: bigint | undefined;

    const collateralsData = collateralsAllowances.map((collateral) => {
      const currentCollateralData = this.findMarketCollateralByAddress(
        collateral.tokenAddress,
      );

      if (!currentCollateralData)
        throw COLLATERAL_NOT_FOUND(collateral.tokenAddress);

      if (collateral.isNative) {
        nativeTokenAmount = DataUtils.toBigNumber(
          collateral.inputAmount,
          Number(currentCollateralData.decimals),
        );
      }

      return collateral.isNative
        ? this._encodeSupplyNativeToken(
            userAddress,
            DataUtils.toBigNumber(
              collateral.inputAmount,
              Number(currentCollateralData.decimals),
            ),
          )
        : this._encodeSupplyOrWithdrawWithToken(
            userAddress,
            collateral.tokenAddress,
            DataUtils.toBigNumber(
              collateral.inputAmount,
              Number(currentCollateralData.decimals),
            ),
          );
    });

    const borrowValue = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    const minBorrowValue = this.borrowMinAmount + this.supplyBalance;

    if (borrowValue < minBorrowValue) throw SMALL_BORROW_AMOUNT();

    const borrowCapacityUSD = DataUtils.toBigNumber(
      this.getBorrowCapacityMarketUSD(supplyCollaterals).toString(),
      Number(this.baseToken.decimals),
    );

    if (borrowCapacityUSD <= borrowValue) throw INSUFFICIENT_COLLATERAL();

    const abiEncodeData = this._encodeSupplyOrWithdrawWithToken(
      userAddress,
      this.baseToken.tokenAddress,
      DataUtils.toBigNumber(inputValue, Number(this.baseToken.decimals)),
    );

    collateralsActions.push(ACTION_WITHDRAW_ASSET);

    collateralsData.push(abiEncodeData);

    const isSomeIsNative = collateralsAllowances.find((data) => data.isNative);

    try {
      return await this.bulkerContract.invoke(
        [collateralsActions, collateralsData],
        isSomeIsNative ? nativeTokenAmount : undefined,
      );
    } catch (e) {
      throw BORROW_SUPPLY_FAILED();
    }
  }

  async withdrawMarket(
    inputValue: string,
    isMax: boolean,
    isNative: boolean,
  ): Promise<Address> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;
    await this.ensureBulkerAllowed(userAddress);

    const inputAmount = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    const borrowBalance = this.borrowBalance;
    const supplyBalance = this.supplyBalance;

    if (borrowBalance > BigInt(0)) throw BORROW_POSITION_OPEN();
    if (supplyBalance < inputAmount) throw OVER_WITHDRAW();

    const abiEncodeData = isNative
      ? this._encodeWithdrawNative(
          userAddress,
          isMax ? supplyBalance : inputAmount,
        )
      : this._encodeWithdrawSimple(
          userAddress,
          isMax ? supplyBalance : inputAmount,
        );

    try {
      return await this.bulkerContract.invoke(
        [
          [isNative ? ACTION_WITHDRAW_NATIVE_TOKEN : ACTION_WITHDRAW_ASSET],
          [abiEncodeData],
        ],
        isNative ? (isMax ? supplyBalance : inputAmount) : undefined,
      );
    } catch (e) {
      throw WITHDRAW_FAILED();
    }
  }

  async supplyCollaterals(
    collaterals: MultiAllowanceCallType[],
    chainId: WagmiChainId,
  ): Promise<Address> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;
    await this.ensureBulkerAllowed(userAddress);

    const isCollateralsFromThisMarket =
      this.isAllCollateralsFromMarket(collaterals);

    if (!isCollateralsFromThisMarket) throw INVALID_COLLATERAL_MARKET();

    const collateralsAllowances =
      await this.baseTokenContract.getMultiAllowance(
        collaterals,
        chainId,
        userAddress,
        this.cometAddress as Address,
      );

    const isSmallAllowance = this.isSomeTokenSmallAllowance(
      collateralsAllowances,
    );

    if (isSmallAllowance) {
      throw new Error("some of tokens have smaller approve then input value");
    }

    const actions: Address[] = collateralsAllowances.map((data) =>
      data.isNative ? ACTION_SUPPLY_NATIVE_TOKEN : ACTION_SUPPLY_TOKEN,
    );

    const abiEncodeData = collateralsAllowances.map((collateral) => {
      const currentCollateralData = this.findMarketCollateralByAddress(
        collateral.tokenAddress,
      );

      if (!currentCollateralData)
        throw COLLATERAL_NOT_FOUND(collateral.tokenAddress);

      return collateral.isNative
        ? this._encodeSupplyNativeToken(
            userAddress,
            DataUtils.toBigNumber(
              collateral.inputAmount,
              Number(currentCollateralData?.decimals),
            ),
          )
        : this._encodeSupplyOrWithdrawWithToken(
            userAddress,
            collateral.tokenAddress,
            DataUtils.toBigNumber(
              collateral.inputAmount,
              Number(currentCollateralData?.decimals),
            ),
          );
    });

    try {
      return await this.bulkerContract.invoke([actions, abiEncodeData]);
    } catch (e) {
      throw SUPPLY_COLLATERAL_FAILED();
    }
  }

  async withdrawCollateral(
    collaterals: MultiAllowanceCallType[],
  ): Promise<Address> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;
    await this.ensureBulkerAllowed(userAddress);

    const isCollateralsFromThisMarket =
      this.isAllCollateralsFromMarket(collaterals);

    if (!isCollateralsFromThisMarket) throw INVALID_COLLATERAL_MARKET();

    const sumOfWithdraw = collaterals.reduce((acc, collateral) => {
      const currentCollateralData = this.findMarketCollateralByAddress(
        collateral.tokenAddress,
      );

      if (!currentCollateralData)
        throw COLLATERAL_NOT_FOUND(collateral.tokenAddress);

      return (
        acc +
        DataUtils.toBigNumber(
          collateral.inputAmount,
          Number(currentCollateralData?.decimals),
        )
      );
    }, BigInt(0));

    const maxWithDrawAmount = this.maxWithDrawCollateralAmount;

    if (Number(sumOfWithdraw) > Number(maxWithDrawAmount))
      throw EXCESSIVE_COLLATERAL_WITHDRAW();

    const action = collaterals.map(() => ACTION_WITHDRAW_ASSET);

    const abiEncodeData = collaterals.map((collateral) => {
      const currentCollateralData = this.findMarketCollateralByAddress(
        collateral.tokenAddress,
      );

      if (!currentCollateralData)
        throw COLLATERAL_NOT_FOUND(collateral.tokenAddress);

      const withdrawAmount = DataUtils.toBigNumber(
        collateral.inputAmount,
        Number(currentCollateralData?.decimals),
      );

      return this._encodeWithdrawSimple(
        userAddress,
        withdrawAmount,
        collateral.tokenAddress,
      );
    });

    try {
      return await this.bulkerContract.invoke([action, abiEncodeData]);
    } catch (e) {
      throw WITHDRAW_COLLATERAL_FAILED();
    }
  }
}
