import {
  ACTION_SUPPLY_TOKEN,
  ACTION_WITHDRAW_ASSET,
  UserMarket,
} from "@sandbox/comet-sdk";
import type { IUserMarket } from "@sandbox/comet-sdk/src/user/IUserMarket";
import { getWalletClient } from "@wagmi/core";
import { AbiCoder } from "ethers";
import type { Address } from "viem";
import type { WagmiChainId } from "../config/chains";
import {
  BulkerContract,
  CometContract,
  Erc20Contract,
  wagmiConfig,
} from "../contracts";
import type { MultiAllowanceCallType } from "../contracts/entities/multi-allowance-call";
import { DataUtils } from "../utils";

// Todo need to find where to get Bulker Address
const bulkerAddress = "0xbde8f31d2ddda895264e27dd990fab3dc87b372d"; // arbitrum

export class UserMarketWrapper extends UserMarket {
  constructor(userMarket: IUserMarket) {
    super(userMarket);
  }

  async supplyMarket(inputValue: string): Promise<`0x${string}`> {
    const walletClient = await getWalletClient(wagmiConfig);

    const userAddress = walletClient.account.address;

    const bulker = new BulkerContract(bulkerAddress);

    const token = new Erc20Contract(this.baseToken.tokenAddress as Address);

    const allowance = await token.allowance(userAddress, bulkerAddress);

    const supplyValue = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    if (allowance < supplyValue) {
      throw new Error("need approve token on input amount");
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
      return await bulker.invoke([[ACTION_SUPPLY_TOKEN], abiEncodeData]);
    } catch (e) {
      throw new Error("supply error");
    }
  }

  async borrowMarket(inputValue: string): Promise<`0x${string}`> {
    const walletClient = await getWalletClient(wagmiConfig);

    const userAddress = walletClient.account.address;

    const bulker = new BulkerContract(bulkerAddress);

    const market = new CometContract(this.cometAddress as `0x${string}`); // ?:

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
      return await bulker.invoke([[ACTION_WITHDRAW_ASSET], abiEncodeData]);
    } catch (e) {
      throw new Error("borrow error");
    }
  }

  async borrowAndSupplyMarket(
    inputValue: string,
    supplyCollaterals: MultiAllowanceCallType[],
    chainId: WagmiChainId,
  ): Promise<`0x${string}`> {
    const walletClient = await getWalletClient(wagmiConfig);

    const userAddress = walletClient.account.address;

    const bulker = new BulkerContract(bulkerAddress);

    const market = new CometContract(
      this.cometAddress as `0x${string}`,
      chainId,
    );

    const token = new Erc20Contract(
      this.baseToken.tokenAddress as `0x${string}`,
      chainId,
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
    const walletClient = await getWalletClient(wagmiConfig);

    const userAddress = walletClient.account.address;

    const bulker = new BulkerContract(bulkerAddress);

    const inputAmount = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    const supplyBalance = this.supplyBalance;

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
      return await bulker.invoke([[ACTION_WITHDRAW_ASSET], abiEncodeData]);
    } catch (e) {
      throw new Error("error withdraw market");
    }
  }

  async supplyCollaterals(
    collaterals: MultiAllowanceCallType[],
    chainId: number,
  ): Promise<`0x${string}`> {
    const walletClient = await getWalletClient(wagmiConfig);

    const userAddress = walletClient.account.address;

    const bulker = new BulkerContract(bulkerAddress);

    const market = new CometContract(this.cometAddress as `0x${string}`);

    const token = new Erc20Contract(
      this.baseToken.tokenAddress as `0x${string}`,
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
    const walletClient = await getWalletClient(wagmiConfig);

    const userAddress = walletClient.account.address;

    const bulker = new BulkerContract(bulkerAddress);

    const market = new CometContract(this.cometAddress as `0x${string}`);

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
