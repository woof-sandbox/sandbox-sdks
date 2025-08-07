import { DataUtils, type IUserMarket } from "@woof-software/comet-sdk";
import { UserMarket } from "../augment";

import {
  type Config,
  type WriteContractReturnType,
  getWalletClient,
  signTypedData,
} from "@wagmi/core";
import { Signature } from "ethers";
import type { Address, Hex } from "viem";
import { type EncodeAbiParametersReturnType, encodeAbiParameters } from "viem";
import { Addresses, type WagmiChainId } from "../config";
import {
  ACTION_REPAY_ALL,
  ACTION_SUPPLY_NATIVE_TOKEN,
  ACTION_SUPPLY_TOKEN,
  ACTION_WITHDRAW_ASSET,
  ACTION_WITHDRAW_ASSET_ALL,
  ACTION_WITHDRAW_NATIVE_TOKEN,
  MAX_UINT,
} from "../constants";
import {
  BulkerContract,
  CometContract,
  Erc20Contract,
  MigratorContract,
} from "../contracts";
import type {
  MultiAllowanceCallType,
  MultiAllowanceCallTypeBigInt,
} from "../contracts/entities/multi-allowance-call";
import {
  ACTION_FAILED,
  ALLOW_FAILED,
  APPROVE_FAILED,
  BORROW_FAILED,
  BORROW_POSITION_OPEN,
  BORROW_SUPPLY_FAILED,
  BULKER_NOT_ALLOWED,
  CHAIN_ID_WAS_NOT_PROVIDED,
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

import { sepolia } from "viem/chains";
import { type ActionData, ActionType } from "../contracts/entities/actions";
import type { MigrateArgs } from "../contracts/entities/migrate-args";

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
      Addresses[chainId].bulker,
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

  private _encodeWithdrawRepayAll(
    userAddress: string,
  ): EncodeAbiParametersReturnType {
    return encodeAbiParameters(
      [
        { type: "address" },
        { type: "address" },
        { type: "address" },
        { type: "address" },
      ],
      [
        this.cometAddress as Address,
        userAddress as Address,
        userAddress as Address,
        userAddress as Address,
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

  private splitSignature(signature: Hex): { r: Hex; s: Hex; v: number } {
    const sig = signature.slice(2); // remove 0x
    const r = `0x${sig.slice(0, 64)}` as Hex;
    const s = `0x${sig.slice(64, 128)}` as Hex;
    const v = Number.parseInt(sig.slice(128, 130), 16);
    return { r, s, v };
  }

  /**
   * THIS allows for full amount withdraw or repay
   */
  async approveViaSignature(
    userAddress: Address,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    const chain = chainId ?? this.chainId;
    if (chain === undefined) {
      throw CHAIN_ID_WAS_NOT_PROVIDED();
    }

    const bulker = Addresses[chain].bulker;

    const name = await this.cometContract.getContractName();

    const version = await this.cometContract.getContractVersion();

    const nonce = await this.cometContract.getUserNonce(userAddress);

    const expiry = BigInt(Math.floor(Date.now() / 1000) + 3600);

    const message = {
      owner: userAddress,
      manager: bulker,
      approved: true,
      nonce,
      expiry,
    };

    const types = {
      AuthorizationAll: [
        { name: "owner", type: "address" },
        { name: "manager", type: "address" },
        { name: "approved", type: "bool" },
        { name: "nonce", type: "uint256" },
        { name: "expiry", type: "uint256" },
      ],
    };

    const domain = {
      name,
      version,
      chainId: sepolia.id,
      verifyingContract: this.cometAddress as Address,
    };

    try {
      const signature = await signTypedData(this.config, {
        domain,
        types,
        primaryType: "AuthorizationAll",
        message,
      });

      const sig = Signature.from(signature);

      return await this.cometContract.writeAllowAllBySig(
        userAddress,
        bulker,
        nonce,
        expiry,
        sig.v,
        sig.r,
        sig.s,
      );
    } catch (e) {
      throw ALLOW_FAILED();
    }
  }
  /**
   * THIS check allow for full amount withdraw or repay
   */
  async ensureBulkerAllowed(
    user: Address,
    chainId?: WagmiChainId,
  ): Promise<void> {
    const chain = chainId ?? this.chainId;
    if (chain === undefined) {
      throw CHAIN_ID_WAS_NOT_PROVIDED();
    }
    const isAllowed = await this.cometContract.isAllowed(
      user,
      Addresses[chain].bulker,
    );

    if (!isAllowed) throw BULKER_NOT_ALLOWED();
  }

  /**
   * THIS check allow for not full amount withdraw or repay
   */
  async ensureBulkerAllowedToken(
    user: Address,
    tokenAddress: Address,
    amount: bigint,
    chainId?: WagmiChainId,
  ): Promise<void> {
    const chain = chainId ?? this.chainId;
    if (chain === undefined) {
      throw CHAIN_ID_WAS_NOT_PROVIDED();
    }
    const isAllowed = await this.cometContract.isAllowedToken(
      user,
      Addresses[chain].bulker,
      tokenAddress,
      amount,
    );

    if (!isAllowed) throw BULKER_NOT_ALLOWED();
  }

  /**
   * THIS checks allow for not full amount withdraw or repay
   */
  async getBulkerTokensAllowed(
    user: Address,
    tokensData: MultiAllowanceCallTypeBigInt[],
    chainId?: WagmiChainId,
  ): Promise<boolean> {
    const chain = chainId ?? this.chainId;
    if (chain === undefined) {
      throw CHAIN_ID_WAS_NOT_PROVIDED();
    }
    return this.cometContract.isAllowedTokens(
      user,
      Addresses[chain].bulker,
      tokensData,
    );
  }

  getActionType = (
    action: ActionType,
    isNative?: boolean,
    isMax?: boolean,
  ): Hex => {
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
          [ActionType.WithdrawBase]: !isMax
            ? ACTION_WITHDRAW_ASSET
            : ACTION_WITHDRAW_ASSET_ALL,
          [ActionType.Repay]: !isMax ? ACTION_SUPPLY_TOKEN : ACTION_REPAY_ALL,
        };
    return actionsMap[action] as Address;
  };

  async getBulkerAllowed(
    user: Address,
    chainId?: WagmiChainId,
  ): Promise<boolean> {
    const chain = chainId ?? this.chainId;
    if (chain === undefined) {
      throw CHAIN_ID_WAS_NOT_PROVIDED();
    }
    return this.cometContract.isAllowed(user, Addresses[chain].bulker);
  }

  async allowMarket(chainId?: WagmiChainId): Promise<WriteContractReturnType> {
    const chain = chainId ?? this.chainId;
    if (chain === undefined) {
      throw CHAIN_ID_WAS_NOT_PROVIDED();
    }
    try {
      return await this.cometContract.allow(
        Addresses[chain].bulker,
        this.collaterals,
      );
    } catch (e) {
      throw ALLOW_FAILED();
    }
  }

  async approveMarketBaseToken(
    amount: string,
  ): Promise<WriteContractReturnType> {
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
  ): Promise<WriteContractReturnType> {
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

  async getTokenAllowance(tokenAddress: Address): Promise<bigint> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;

    const token = new Erc20Contract(tokenAddress, this.chainId, this.config);

    return await token.allowance(userAddress, this.cometAddress as Address);
  }

  findByActionType(
    actions: ActionData[],
    actionType: ActionType,
  ): ActionData[] {
    return actions.filter((action) => action.action === actionType);
  }

  async createAction(actions: ActionData[]): Promise<WriteContractReturnType> {
    const walletClient = await getWalletClient(this.config);
    const userAddress = walletClient.account.address;

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
          userAddress,
          this.cometAddress as Address,
          this.chainId,
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
      const collateralData = this.findMarketCollateralByAddress(action.address);

      const decimals = collateralData?.decimals ?? this.baseToken.decimals;

      if (action.isMax) {
        await this.ensureBulkerAllowed(userAddress);
      } else {
        await this.ensureBulkerAllowedToken(
          userAddress,
          action.address,
          DataUtils.toBigNumber(action.value, Number(decimals)),
        );
      }

      const inputAmount = action.isMax
        ? ActionType.Withdraw && collateralData
          ? collateralData.userSupplyBalance
          : ActionType.WithdrawBase
            ? this.supplyBalance
            : BigInt(MAX_UINT)
        : DataUtils.toBigNumber(action.value, Number(decimals));

      if (action.isNative && action.action !== ActionType.Withdraw) {
        ethValue = (ethValue ?? 0n) + inputAmount;
      }

      const encoded = action.isNative
        ? this._encodeSupplyNativeToken(userAddress, inputAmount)
        : action.isMax
          ? this._encodeWithdrawRepayAll(userAddress)
          : this._encodeSupplyOrWithdrawWithToken(
              userAddress,
              action.address,
              inputAmount,
            );

      invokeActions.push(
        this.getActionType(action.action, action.isNative, action.isMax),
      );
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

  async supplyMarket(
    inputValue: string,
    isNative: boolean,
  ): Promise<WriteContractReturnType> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;

    const supplyValue = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    await this.ensureBulkerAllowedToken(
      userAddress,
      this.baseToken.tokenAddress as Address,
      supplyValue,
    );

    const allowance = await this.getTokenAllowance(
      this.baseToken.tokenAddress as Address,
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

  async borrowMarket(inputValue: string): Promise<WriteContractReturnType> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;

    const borrowValue = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    await this.ensureBulkerAllowedToken(
      userAddress,
      this.baseToken.tokenAddress as Address,
      borrowValue,
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
  ): Promise<WriteContractReturnType> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;

    const supplyValue = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    await this.ensureBulkerAllowedToken(
      userAddress,
      this.baseToken.tokenAddress as Address,
      supplyValue,
    );

    const isCollateralsFromThisMarket =
      this.isAllCollateralsFromMarket(supplyCollaterals);

    if (!isCollateralsFromThisMarket) throw INVALID_COLLATERAL_MARKET();

    const collateralsAllowances =
      await this.baseTokenContract.getMultiAllowance(
        supplyCollaterals,
        userAddress,
        this.cometAddress as Address,
        this.chainId,
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

      (async () => {
        await this.ensureBulkerAllowedToken(
          userAddress,
          collateral.tokenAddress,
          DataUtils.toBigNumber(
            collateral.inputAmount,
            Number(currentCollateralData.decimals),
          ),
        );
      })();

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
      value = supplyValue + (nativeTokenAmount || 0n);
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
  ): Promise<WriteContractReturnType> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;

    const borrowValue = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    await this.ensureBulkerAllowedToken(
      userAddress,
      this.baseToken.tokenAddress as Address,
      borrowValue,
    );

    const isCollateralsFromThisMarket =
      this.isAllCollateralsFromMarket(supplyCollaterals);

    if (!isCollateralsFromThisMarket) throw INVALID_COLLATERAL_MARKET();

    const collateralsAllowances =
      await this.baseTokenContract.getMultiAllowance(
        supplyCollaterals,
        userAddress,
        this.cometAddress as Address,
        this.chainId,
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

      (async () => {
        await this.ensureBulkerAllowedToken(
          userAddress,
          collateral.tokenAddress,
          DataUtils.toBigNumber(
            collateral.inputAmount,
            Number(currentCollateralData.decimals),
          ),
        );
      })();

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
  ): Promise<WriteContractReturnType> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;

    const inputAmount = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    if (isMax) {
      await this.ensureBulkerAllowed(userAddress);
    } else {
      await this.ensureBulkerAllowedToken(
        userAddress,
        this.baseToken.tokenAddress as Address,
        inputAmount,
      );
    }

    const borrowBalance = this.borrowBalance;
    const supplyBalance = this.supplyBalance;

    if (borrowBalance > 0n) throw BORROW_POSITION_OPEN();
    if (supplyBalance < inputAmount) throw OVER_WITHDRAW();

    const abiEncodeData = isNative
      ? this._encodeWithdrawNative(userAddress, inputAmount)
      : isMax
        ? this._encodeWithdrawRepayAll(userAddress)
        : this._encodeWithdrawSimple(userAddress, inputAmount);

    try {
      return await this.bulkerContract.invoke(
        [
          [
            isNative
              ? ACTION_WITHDRAW_NATIVE_TOKEN
              : isMax
                ? ACTION_WITHDRAW_ASSET_ALL
                : ACTION_WITHDRAW_ASSET,
          ],
          [abiEncodeData],
        ],
        isNative ? inputAmount : undefined,
      );
    } catch (e) {
      throw WITHDRAW_FAILED();
    }
  }

  async supplyCollaterals(
    collaterals: MultiAllowanceCallType[],
    chainId: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;

    const isCollateralsFromThisMarket =
      this.isAllCollateralsFromMarket(collaterals);

    if (!isCollateralsFromThisMarket) throw INVALID_COLLATERAL_MARKET();

    const collateralsAllowances =
      await this.baseTokenContract.getMultiAllowance(
        collaterals,
        userAddress,
        this.cometAddress as Address,
        chainId,
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

    let supplyValue = 0n;

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

      (async () => {
        await this.ensureBulkerAllowedToken(
          userAddress,
          collateral.tokenAddress as Address,
          inputValue,
        );
      })();

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
        supplyValue > 0n ? supplyValue : undefined,
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
    }, 0n);

    const maxWithDrawAmount = this.maxWithDrawCollateralAmount;

    if (this.borrowBalance > 0n) {
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

      (async () => {
        await this.ensureBulkerAllowedToken(
          userAddress,
          collateral.tokenAddress as Address,
          withdrawAmount,
        );
      })();

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
  ): Promise<WriteContractReturnType> {
    const args: MigrateArgs = {
      fromCometAddress,
      toCometAddress,
      flashAmount,
      collateralsData,
    };
    if (Boolean(collateralsData?.length)) {
      try {
        return await this.migrationContract.partialMigrate(args);
      } catch (e) {
        throw PART_MIGRATE_FAILED();
      }
    }

    try {
      return await this.migrationContract.fullMigrate(args);
    } catch (e) {
      throw FULL_MIGRATE_FAILED();
    }
  }
}
