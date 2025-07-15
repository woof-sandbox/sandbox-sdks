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
  MAX_UINT,
} from "../constants";
import {
  BulkerContract,
  CometContract,
  Erc20Contract,
  MigratorContract,
} from "../contracts";
import type { MultiAllowanceCallType } from "../contracts/entities/multi-allowance-call";
import {
  ACTION_FAILED,
  ALLOW_FAILED,
  APPROVE_FAILED,
  BORROW_FAILED,
  BORROW_POSITION_OPEN,
  BORROW_SUPPLY_FAILED,
  BULKER_NOT_ALLOWED,
  COLLATERAL_NOT_FOUND,
  EXCESSIVE_COLLATERAL_WITHDRAW,
  FULL_MIGRATE_FAILED,
  INSUFFICIENT_COLLATERAL,
  INVALID_COLLATERAL_MARKET,
  LOW_COLLATERAL_ALLOWANCE,
  OVER_WITHDRAW,
  PART_MIGRATE_FAILED,
  SMALL_BORROW_AMOUNT,
  SUPPLY_COLLATERAL_FAILED,
  SUPPLY_FAILED,
  TOKEN_NOT_APPROVED,
  WITHDRAW_COLLATERAL_FAILED,
  WITHDRAW_FAILED,
} from "../errors/wrappers/user-market-wrapper.errors";

import { type ActionData, ActionType } from "../contracts/entities/actions";

// Todo need to find where to get Bulker Address
const bulkerAddress = "0xa3607ff0a0f7bb9571b8a6155d4b32042890aeff"; // arbitrum
// const bulkerAddress = "0xbde8f31d2ddda895264e27dd990fab3dc87b372d"; // arbitrum

export class UserMarketWrapper extends UserMarket {
  private readonly config: Config;
  private readonly chainId?: WagmiChainId;

  private readonly cometContract: CometContract;
  private readonly bulkerContract: BulkerContract;
  private readonly baseTokenContract: Erc20Contract;
  private readonly migrationContract: MigratorContract;

  constructor(userMarket: IUserMarket, config: Config, chainId: WagmiChainId) {
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

    this.migrationContract = new MigratorContract(
      this.baseToken.tokenAddress as Address, // TODO change with migration address
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

  getActionType = (action: ActionType, isNative?: boolean) => {
    const actionsMap = isNative
      ? {
          [ActionType.Supply]: ACTION_SUPPLY_NATIVE_TOKEN,
          [ActionType.Withdraw]: ACTION_WITHDRAW_NATIVE_TOKEN,
          [ActionType.Borrow]: ACTION_WITHDRAW_ASSET,
          [ActionType.Lend]: ACTION_SUPPLY_TOKEN,
          [ActionType.WithdrawBase]: ACTION_WITHDRAW_ASSET,
          [ActionType.Repay]: ACTION_SUPPLY_TOKEN,
        }
      : {
          [ActionType.Supply]: ACTION_SUPPLY_TOKEN,
          [ActionType.Withdraw]: ACTION_WITHDRAW_ASSET,
          [ActionType.Borrow]: ACTION_WITHDRAW_ASSET,
          [ActionType.Lend]: ACTION_SUPPLY_TOKEN,
          [ActionType.WithdrawBase]: ACTION_WITHDRAW_ASSET,
          [ActionType.Repay]: ACTION_SUPPLY_TOKEN,
        };
    return actionsMap[action] as Address;
  };

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

  findByActionType(actions: ActionData[], actionType: ActionType) {
    return actions.filter((action) => action.action === actionType);
  }

  async createAction(actions: ActionData[]): Promise<Address> {
    const walletClient = await getWalletClient(this.config);
    const userAddress = walletClient.account.address;

    await this.ensureBulkerAllowed(userAddress);

    const byType = (type: ActionType) => this.findByActionType(actions, type);
    const supplyActions = byType(ActionType.Supply);
    const withdrawActions = byType(ActionType.Withdraw);
    const lendActions = byType(ActionType.Lend);
    const repayActions = byType(ActionType.Repay);

    const supplyData = supplyActions
      .filter(({ isNative }) => !isNative)
      .map(({ address, value }) => ({
        tokenAddress: address,
        inputAmount: value,
        isNative: false,
      }));

    const withdrawData = withdrawActions.map(
      ({ address, value, isNative }) => ({
        tokenAddress: address,
        inputAmount: value,
        isNative,
      }),
    );

    const allCollateralData = [...withdrawData, ...supplyData];

    if (allCollateralData.length) {
      if (!this.isAllCollateralsFromMarket(allCollateralData)) {
        throw INVALID_COLLATERAL_MARKET();
      }

      if (supplyData.length) {
        const allowances = await this.baseTokenContract.getMultiAllowance(
          supplyData,
          this.chainId,
          userAddress,
          this.cometAddress as Address,
        );

        if (this.isSomeTokenSmallAllowance(allowances)) {
          throw LOW_COLLATERAL_ALLOWANCE();
        }
      }
    }

    const totalLendRepay = [...lendActions, ...repayActions]
      .reduce((sum, { value }) => sum + Number(value), 0)
      .toString();

    if (totalLendRepay !== "0") {
      const requiredAllowance = DataUtils.toBigNumber(
        totalLendRepay,
        Number(this.baseToken.decimals),
      );
      const currentAllowance = await this.getTokenAllowance(
        this.baseToken.tokenAddress as Address,
      );

      if (currentAllowance < requiredAllowance) {
        throw TOKEN_NOT_APPROVED(requiredAllowance);
      }
    }

    const invokeActions: Address[] = [];
    const encodedActions: Address[] = [];
    let ethValue: bigint | undefined;

    for (const action of actions) {
      const marketData = this.findMarketCollateralByAddress(action.address);
      const decimals = marketData?.decimals ?? this.baseToken.decimals;
      const inputAmount = DataUtils.toBigNumber(action.value, Number(decimals));

      if (action.isNative && action.action !== ActionType.Withdraw) {
        ethValue = (ethValue ?? BigInt(0)) + inputAmount;
      }

      const encoded = action.isNative
        ? this._encodeSupplyNativeToken(userAddress, inputAmount)
        : this._encodeSupplyOrWithdrawWithToken(
            userAddress,
            action.address,
            inputAmount,
          );

      invokeActions.push(this.getActionType(action.action, action.isNative));
      encodedActions.push(encoded);
    }

    try {
      return await this.bulkerContract.invoke(
        [invokeActions, encodedActions],
        ethValue,
      );
    } catch {
      throw ACTION_FAILED();
    }
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

  async lendAndSupplyMarket(
    inputValue: string,
    isNative: boolean,
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

    const supplyValue = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    const baseTokenAllowance = await this.getTokenAllowance(
      this.baseToken.tokenAddress as Address,
    );

    if (!isNative && baseTokenAllowance < supplyValue)
      throw TOKEN_NOT_APPROVED(supplyValue);

    const abiEncodeData = isNative
      ? this._encodeSupplyNativeToken(userAddress, supplyValue)
      : this._encodeSupplyOrWithdrawWithToken(
          userAddress,
          this.baseToken.tokenAddress,
          supplyValue,
        );

    collateralsActions.push(
      isNative ? ACTION_SUPPLY_NATIVE_TOKEN : ACTION_SUPPLY_TOKEN,
    );

    collateralsData.push(abiEncodeData);

    const isSomeIsNative = collateralsAllowances.find((data) => data.isNative);

    let value: bigint | undefined;

    if (isNative && isSomeIsNative) {
      value = supplyValue + (nativeTokenAmount || BigInt(0));
    } else if (isSomeIsNative) {
      value = nativeTokenAmount;
    } else if (isNative) {
      value = supplyValue;
    } else {
      value = undefined;
    }

    try {
      return await this.bulkerContract.invoke(
        [collateralsActions, collateralsData],
        value,
      );
    } catch (e) {
      throw BORROW_SUPPLY_FAILED();
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
          isMax ? BigInt(MAX_UINT) : inputAmount,
        )
      : this._encodeWithdrawSimple(
          userAddress,
          isMax ? BigInt(MAX_UINT) : inputAmount,
        );

    try {
      return await this.bulkerContract.invoke(
        [
          [isNative ? ACTION_WITHDRAW_NATIVE_TOKEN : ACTION_WITHDRAW_ASSET],
          [abiEncodeData],
        ],
        isNative ? (isMax ? BigInt(MAX_UINT) : inputAmount) : undefined,
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

    let supplyValue = BigInt(0);

    const abiEncodeData = collateralsAllowances.map((collateral) => {
      const currentCollateralData = this.findMarketCollateralByAddress(
        collateral.tokenAddress,
      );

      if (!currentCollateralData)
        throw COLLATERAL_NOT_FOUND(collateral.tokenAddress);

      const inputValue = DataUtils.toBigNumber(
        collateral.inputAmount,
        Number(currentCollateralData?.decimals),
      );

      if (collateral.isNative) {
        supplyValue = supplyValue + inputValue;
      }

      return collateral.isNative
        ? this._encodeSupplyNativeToken(userAddress, inputValue)
        : this._encodeSupplyOrWithdrawWithToken(
            userAddress,
            collateral.tokenAddress,
            inputValue,
          );
    });

    try {
      return await this.bulkerContract.invoke(
        [actions, abiEncodeData],
        supplyValue > BigInt(0) ? supplyValue : undefined,
      );
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

    if (this.borrowBalance > BigInt(0)) {
      if (Number(sumOfWithdraw) > Number(maxWithDrawAmount))
        throw EXCESSIVE_COLLATERAL_WITHDRAW();
    }

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

  async migrate(
    fromCometAddress: Address,
    toCometAddress: Address,
    flashAmount: bigint,
    collateralsData?: MultiAllowanceCallType[],
  ) {
    if (Boolean(collateralsData?.length)) {
      try {
        return await this.migrationContract.partialMigrate([
          fromCometAddress,
          toCometAddress,
          collateralsData,
          flashAmount,
        ]);
      } catch (e) {
        throw PART_MIGRATE_FAILED();
      }
    }

    try {
      return await this.migrationContract.fullMigrate([
        fromCometAddress,
        toCometAddress,
        flashAmount,
      ]);
    } catch (e) {
      throw FULL_MIGRATE_FAILED();
    }
  }
}
