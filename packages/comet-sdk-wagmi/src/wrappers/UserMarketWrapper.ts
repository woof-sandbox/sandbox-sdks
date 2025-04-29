import { DataUtils, type IUserMarket } from "@woof-software/comet-sdk";
import { UserMarket } from "../augment";

import { type Config, getWalletClient } from "@wagmi/core";
import type { Address } from "viem";
import { encodeAbiParameters, type EncodeAbiParametersReturnType } from "viem";
import type { WagmiChainId } from "../config";
import { ACTION_SUPPLY_TOKEN, ACTION_WITHDRAW_ASSET } from "../constants";
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
      this.cometAddress as `0x${string}`,
      chainId,
      config,
    );
    this.bulkerContract = new BulkerContract(
      bulkerAddress as `0x${string}`,
      chainId,
      config,
    );
    this.baseTokenContract = new Erc20Contract(
      this.baseToken.tokenAddress as `0x${string}`,
      chainId,
      config,
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
        this.cometAddress as `0x${string}`,
        userAddress as `0x${string}`,
        tokenAddress as `0x${string}`,
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
        this.cometAddress as `0x${string}`,
        userAddress as `0x${string}`,
        (tokenAddress || this.baseToken.tokenAddress) as `0x${string}`,
        amount,
      ],
    );
  }

  async ensureBulkerAllowed(user: Address) {
    const allowed = await this.cometContract.isAllowed(user, bulkerAddress);
    if (!allowed) throw BULKER_NOT_ALLOWED();
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
        this.cometAddress as `0x${string}`,
        DataUtils.toBigNumber(amount, Number(this.baseToken.decimals)),
      );
    } catch (e) {
      throw APPROVE_FAILED();
    }
  }

  async approveToken(
    tokenAddress: `0x${string}`,
    amount: string,
    tokenDecimals: number,
  ) {
    const token = new Erc20Contract(tokenAddress, this.chainId, this.config);

    try {
      return await token.approve(
        this.cometAddress as `0x${string}`,
        DataUtils.toBigNumber(amount, tokenDecimals),
      );
    } catch (e) {
      throw APPROVE_FAILED();
    }
  }

  async getTokenAllowance(tokenAddress: `0x${string}`) {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;

    const token = new Erc20Contract(tokenAddress, this.chainId, this.config);

    return await token.allowance(
      userAddress,
      this.cometAddress as `0x${string}`,
    );
  }

  async supplyMarket(inputValue: string): Promise<`0x${string}`> {
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

    if (allowance < supplyValue) throw TOKEN_NOT_APPROVED(supplyValue);

    const abiEncodeData = this._encodeSupplyOrWithdrawWithToken(
      userAddress,
      this.baseToken.tokenAddress,
      supplyValue,
    );

    try {
      return await this.bulkerContract.invoke([
        [ACTION_SUPPLY_TOKEN],
        [abiEncodeData],
      ]);
    } catch (e) {
      throw SUPPLY_FAILED();
    }
  }

  async borrowMarket(inputValue: string): Promise<`0x${string}`> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;
    await this.ensureBulkerAllowed(userAddress);

    const borrowValue = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    const availableToBorrow = DataUtils.toBigNumber(
      this.availableToBorrow(),
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
    chainId: WagmiChainId,
  ): Promise<`0x${string}`> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;
    await this.ensureBulkerAllowed(userAddress);

    const isCollateralsFromThisMarket =
      this.isAllCollateralsFromMarket(supplyCollaterals);

    if (!isCollateralsFromThisMarket) throw INVALID_COLLATERAL_MARKET();

    const collateralsAllowances =
      await this.baseTokenContract.getMultiAllowance(
        supplyCollaterals,
        chainId,
        userAddress,
        bulkerAddress,
      );

    const isSmallAllowance = this.isSomeTokenSmallAllowance(
      collateralsAllowances,
    );

    if (isSmallAllowance) throw LOW_COLLATERAL_ALLOWANCE();

    const collateralsActions: `0x${string}`[] = collateralsAllowances.map(
      () => ACTION_SUPPLY_TOKEN,
    );

    const collateralsData = collateralsAllowances.map((collateral) => {
      const currentCollateralData = this.findMarketCollateralByAddress(
        collateral.tokenAddress,
      );

      if (!currentCollateralData)
        throw COLLATERAL_NOT_FOUND(collateral.tokenAddress);

      return this._encodeSupplyOrWithdrawWithToken(
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

    // TODO here we need to add supply amount to correct data
    const availableToBorrow = DataUtils.toBigNumber(
      this.availableToBorrow(),
      Number(this.baseToken.decimals),
    );

    if (availableToBorrow <= borrowValue) throw INSUFFICIENT_COLLATERAL();

    const abiEncodeData = this._encodeSupplyOrWithdrawWithToken(
      userAddress,
      this.baseToken.tokenAddress,
      DataUtils.toBigNumber(inputValue, Number(this.baseToken.decimals)),
    );

    collateralsActions.push(ACTION_WITHDRAW_ASSET);

    collateralsData.push(abiEncodeData);

    try {
      return await this.bulkerContract.invoke([
        collateralsActions,
        collateralsData,
      ]);
    } catch (e) {
      throw BORROW_SUPPLY_FAILED();
    }
  }

  async withdrawMarket(
    inputValue: string,
    isMax: boolean,
  ): Promise<`0x${string}`> {
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

    const abiEncodeData = this._encodeWithdrawSimple(
      userAddress,
      isMax ? supplyBalance : inputAmount,
    );

    try {
      return await this.bulkerContract.invoke([
        [ACTION_WITHDRAW_ASSET],
        [abiEncodeData],
      ]);
    } catch (e) {
      throw WITHDRAW_FAILED();
    }
  }

  async supplyCollaterals(
    collaterals: MultiAllowanceCallType[],
    chainId: WagmiChainId,
  ): Promise<`0x${string}`> {
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
        bulkerAddress,
      );

    const isSmallAllowance = this.isSomeTokenSmallAllowance(
      collateralsAllowances,
    );

    if (isSmallAllowance) {
      throw new Error("some of tokens have smaller approve then input value");
    }

    const actions: `0x${string}`[] = collateralsAllowances.map(
      () => ACTION_SUPPLY_TOKEN,
    );

    const abiEncodeData = collateralsAllowances.map((collateral) => {
      const currentCollateralData = this.findMarketCollateralByAddress(
        collateral.tokenAddress,
      );

      if (!currentCollateralData)
        throw COLLATERAL_NOT_FOUND(collateral.tokenAddress);

      return this._encodeSupplyOrWithdrawWithToken(
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
  ): Promise<`0x${string}`> {
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

    const maxWithDrawAmount = this.maxWithDrawCollateralAmount();

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
