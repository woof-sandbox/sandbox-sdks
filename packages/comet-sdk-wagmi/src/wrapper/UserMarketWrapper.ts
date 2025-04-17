import {
  ACTION_SUPPLY_TOKEN,
  ACTION_WITHDRAW_ASSET,
  type IUserMarket,
} from "@sandbox/comet-sdk";
import { UserMarket } from "../augment/UserMarket";

import { type Config, getWalletClient } from "@wagmi/core";
import { arbitrum } from "@wagmi/core/chains";
import { AbiCoder } from "ethers";
import type { Address } from "viem";
import type { WagmiChainId } from "../config/chains";
import { BulkerContract, CometContract, Erc20Contract } from "../contracts";
import type { MultiAllowanceCallType } from "../contracts/entities/multi-allowance-call";
import { DataUtils } from "../utils";

// Todo need to find where to get Bulker Address
const bulkerAddress = "0xbde8f31d2ddda895264e27dd990fab3dc87b372d"; // arbitrum

export class UserMarketWrapper extends UserMarket {
  private config: Config;

  constructor(userMarket: IUserMarket, config: Config) {
    super(userMarket);
    this.config = config;
  }

  async allowMarket() {
    const market = new CometContract(
      this.cometAddress as `0x${string}`,
      arbitrum.id,
      this.config,
    );

    try {
      return await market.allow(bulkerAddress, true, arbitrum.id);
    } catch (e) {
      throw new Error("approve error");
    }
  }

  async approveMarketBaseToken(amount: string) {
    const token = new Erc20Contract(
      this.baseToken.tokenAddress as `0x${string}`,
      arbitrum.id,
      this.config,
    );

    try {
      return await token.approve(
        bulkerAddress,
        DataUtils.toBigNumber(amount, Number(this.baseToken.decimals)),
      );
    } catch (e) {
      throw new Error("approve error");
    }
  }

  async approveToken(
    tokenAddress: `0x${string}`,
    amount: string,
    tokenDecimals: number,
  ) {
    const token = new Erc20Contract(tokenAddress, arbitrum.id, this.config);

    try {
      return await token.approve(
        bulkerAddress,
        DataUtils.toBigNumber(amount, tokenDecimals),
      );
    } catch (e) {
      throw new Error("approve error");
    }
  }

  async supplyMarket(inputValue: string): Promise<`0x${string}`> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;

    const market = new CometContract(
      this.cometAddress as `0x${string}`,
      arbitrum.id,
      this.config,
    );

    const bulker = new BulkerContract(bulkerAddress, this.config, arbitrum.id);

    const token = new Erc20Contract(
      this.baseToken.tokenAddress as Address,
      arbitrum.id,
      this.config,
    );

    const isAllowed = await market.isAllowed(userAddress, bulkerAddress);

    if (!isAllowed) {
      throw new Error("need to make allow on contract!");
    }

    const allowance = await token.allowance(userAddress, bulkerAddress);

    const supplyValue = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    if (allowance < supplyValue) {
      throw new Error(`need approve token on input amount ${supplyValue}`);
    }

    const data = [
      this.cometAddress,
      userAddress,
      this.baseToken.tokenAddress,
      supplyValue,
    ];

    const abiEncodeData = AbiCoder.defaultAbiCoder().encode(
      ["address", "address", "address", "uint"],
      data,
    ) as `0x${string}`;

    try {
      return await bulker.invoke([[ACTION_SUPPLY_TOKEN], [abiEncodeData]]);
    } catch (e) {
      console.log("--e--", e);
      throw new Error("supply error");
    }
  }

  async borrowMarket(inputValue: string): Promise<`0x${string}`> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;

    const bulker = new BulkerContract(bulkerAddress, this.config);

    const market = new CometContract(
      this.cometAddress as `0x${string}`,
      arbitrum.id,
      this.config,
    );

    const isAllowed = await market.isAllowed(userAddress, bulkerAddress);

    if (!isAllowed) {
      throw new Error("need to make allow on contract!");
    }

    const borrowValue = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    const availableToBorrow = DataUtils.toBigNumber(
      this.availableToBorrow(),
      Number(this.baseToken.decimals),
    );

    if (availableToBorrow <= borrowValue) {
      throw new Error("need collaterals to borrow this amount");
    }

    const data = [
      this.cometAddress,
      userAddress,
      this.baseToken.tokenAddress,
      DataUtils.toBigNumber(inputValue, Number(this.baseToken.decimals)),
    ];

    const abiEncodeData = AbiCoder.defaultAbiCoder().encode(
      ["address", "address", "address", "uint"],
      data,
    ) as `0x${string}`;

    try {
      return await bulker.invoke([[ACTION_WITHDRAW_ASSET], [abiEncodeData]]);
    } catch (e) {
      throw new Error("borrow error");
    }
  }

  async borrowAndSupplyMarket(
    inputValue: string,
    supplyCollaterals: MultiAllowanceCallType[],
    chainId: WagmiChainId,
  ): Promise<`0x${string}`> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;

    const bulker = new BulkerContract(bulkerAddress, this.config);

    const market = new CometContract(
      this.cometAddress as `0x${string}`,
      chainId,
      this.config,
    );

    const token = new Erc20Contract(
      this.baseToken.tokenAddress as `0x${string}`,
      chainId,
      this.config,
    );

    const isAllowed = await market.isAllowed(userAddress, bulkerAddress);

    if (!isAllowed) {
      throw new Error("need to make allow on contract!");
    }

    const isCollateralsFromThisMarket =
      this.isAllCollateralsFromMarket(supplyCollaterals);

    if (!isCollateralsFromThisMarket) {
      throw new Error("you try to supply collaterals from other market");
    }

    const collateralsAllowances = await token.getMultiAllowance(
      supplyCollaterals,
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

    const collateralsActions: `0x${string}`[] = collateralsAllowances.map(
      () => ACTION_SUPPLY_TOKEN,
    );

    const collateralsData = collateralsAllowances.map((collateral) => {
      const currentCollateralData = this.findMarketCollateralByAddress(
        collateral.tokenAddress,
      );

      const data = [
        this.cometAddress,
        userAddress,
        collateral.tokenAddress,
        DataUtils.toBigNumber(
          collateral.inputAmount,
          Number(currentCollateralData?.decimals || 18),
        ),
      ];

      return AbiCoder.defaultAbiCoder().encode(
        ["address", "address", "address", "uint"],
        data,
      ) as `0x${string}`;
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

    if (availableToBorrow <= borrowValue) {
      throw new Error("need collaterals to borrow this amount");
    }

    const data = [
      this.cometAddress,
      userAddress,
      this.baseToken.tokenAddress,
      DataUtils.toBigNumber(inputValue, Number(this.baseToken.decimals)),
    ];

    const abiEncodeData = AbiCoder.defaultAbiCoder().encode(
      ["address", "address", "address", "uint"],
      data,
    ) as `0x${string}`;

    collateralsActions.push(ACTION_WITHDRAW_ASSET);

    collateralsData.push(abiEncodeData);

    try {
      return await bulker.invoke([collateralsActions, collateralsData]);
    } catch (e) {
      throw new Error("error borrow and supply");
    }
  }

  async withDrawMarket(
    inputValue: string,
    isMax: boolean,
  ): Promise<`0x${string}`> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;

    const bulker = new BulkerContract(bulkerAddress, this.config);

    const inputAmount = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    const borrowBalance = this.borrowBalance;
    const supplyBalance = this.supplyBalance;

    if (borrowBalance > BigInt(0)) {
      throw new Error("you have opened borrow position");
    }

    if (supplyBalance < inputAmount) {
      throw new Error("user cant withdraw more that he borrow");
    }
    const data = [
      this.cometAddress,
      userAddress,
      isMax ? supplyBalance : inputAmount,
    ];

    const abiEncodeData = AbiCoder.defaultAbiCoder().encode(
      ["address", "address", "uint"],
      data,
    ) as `0x${string}`;

    try {
      return await bulker.invoke([[ACTION_WITHDRAW_ASSET], [abiEncodeData]]);
    } catch (e) {
      throw new Error("error withdraw market");
    }
  }

  async supplyCollaterals(
    collaterals: MultiAllowanceCallType[],
    chainId: WagmiChainId,
  ): Promise<`0x${string}`> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;

    const bulker = new BulkerContract(bulkerAddress, this.config);

    const market = new CometContract(
      this.cometAddress as `0x${string}`,
      chainId,
      this.config,
    );

    const token = new Erc20Contract(
      this.baseToken.tokenAddress as `0x${string}`,
      arbitrum.id,
      this.config,
    );

    const isAllowed = await market.isAllowed(userAddress, bulkerAddress);

    if (!isAllowed) {
      throw new Error("need to make allow on contract!");
    }

    const isCollateralsFromThisMarket =
      this.isAllCollateralsFromMarket(collaterals);

    if (!isCollateralsFromThisMarket) {
      throw new Error("you try to supply collaterals from other market");
    }

    const collateralsAllowances = await token.getMultiAllowance(
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

      const data = [
        this.cometAddress,
        userAddress,
        collateral.tokenAddress,
        DataUtils.toBigNumber(
          collateral.inputAmount,
          Number(currentCollateralData?.decimals || 18),
        ),
      ];

      return AbiCoder.defaultAbiCoder().encode(
        ["address", "address", "address", "uint"],
        data,
      ) as `0x${string}`;
    });

    try {
      return await bulker.invoke([actions, abiEncodeData]);
    } catch (e) {
      throw new Error("supply collateral error");
    }
  }

  async withDrawCollateral(
    collaterals: MultiAllowanceCallType[],
  ): Promise<`0x${string}`> {
    const walletClient = await getWalletClient(this.config);

    const userAddress = walletClient.account.address;

    const bulker = new BulkerContract(bulkerAddress, this.config);

    const market = new CometContract(
      this.cometAddress as `0x${string}`,
      arbitrum.id,
      this.config,
    );

    const isAllowed = await market.isAllowed(userAddress, bulkerAddress);

    if (!isAllowed) {
      throw new Error("need to make allow on contract!");
    }

    const isCollateralsFromThisMarket =
      this.isAllCollateralsFromMarket(collaterals);

    if (!isCollateralsFromThisMarket) {
      throw new Error("you try to withdraw collaterals from other market");
    }

    const sumOfWithdraw = collaterals.reduce((acc, collateral) => {
      const currentCollateralData = this.findMarketCollateralByAddress(
        collateral.tokenAddress,
      );

      return (
        acc +
        DataUtils.toBigNumber(
          collateral.inputAmount,
          Number(currentCollateralData?.decimals || 18),
        )
      );
    }, BigInt(0));

    const maxWithDrawAmount = this.maxWithDrawCollateralAmount();

    if (Number(sumOfWithdraw) > Number(maxWithDrawAmount)) {
      throw new Error("you try to withdraw more than you can");
    }

    const action = collaterals.map(() => ACTION_WITHDRAW_ASSET);

    const abiEncodeData = collaterals.map((collateral) => {
      const currentCollateralData = this.findMarketCollateralByAddress(
        collateral.tokenAddress,
      );

      const withDrawAmount = DataUtils.toBigNumber(
        collateral.inputAmount,
        Number(currentCollateralData?.decimals || 18),
      );
      const data = [this.cometAddress, userAddress, withDrawAmount];

      return AbiCoder.defaultAbiCoder().encode(
        ["address", "address", "uint"],
        data,
      ) as `0x${string}`;
    });

    try {
      return await bulker.invoke([action, abiEncodeData]);
    } catch (e) {
      throw new Error("withdraw collateral error");
    }
  }
}
