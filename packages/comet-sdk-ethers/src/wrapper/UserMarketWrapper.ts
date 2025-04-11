import {
  ACTION_SUPPLY_NATIVE_TOKEN,
  ACTION_WITHDRAW_ASSET,
  UserMarket,
} from "@sandbox/comet-sdk";
import type { IUserMarket } from "@sandbox/comet-sdk/src/user/IUserMarket";
import { getWalletClient } from "@wagmi/core";
import { AbiCoder } from "ethers";
import {
  BulkerContract,
  MarketContract,
  TokenContract,
  config,
} from "../contracts";
import { DataUtils } from "../utils";
import { UserMarketWrapperMethods } from "./UserMarketWrapperMethods";

// Todo need to find where to get Bulker Address
const bulkerAddress = "0x123";

export class UserMarketWrapper extends UserMarket {
  constructor(userMarket: IUserMarket) {
    super(userMarket);
  }

  async supplyMarket(inputValue: string) {
    const walletClient = await getWalletClient(config);

    const userAddress = walletClient.account.address;

    const bulker = new BulkerContract();

    const token = new TokenContract();

    const allowance = await token.getAllowance(
      this.baseToken.tokenAddress as `0x${string}`,
      userAddress,
      bulkerAddress,
    );

    const supplyValue = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    if (allowance < supplyValue) {
      return "need approve token on input amount";
    }

    const borrowBalance = this.borrowBalance;

    if (supplyValue <= borrowBalance) {
      console.log("we make a repay in this case");
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
      return await bulker.invokeBulker(bulkerAddress, [
        [ACTION_SUPPLY_NATIVE_TOKEN],
        abiEncodeData,
      ]); //if need update data after implement then and refetch userMarket
    } catch (e) {
      return "supply error";
    }
  }

  async borrowMarket(inputValue: string) {
    const walletClient = await getWalletClient(config);

    const userAddress = walletClient.account.address;

    const bulker = new BulkerContract();

    const market = new MarketContract();

    const isAllowed = await market.getIsAllow(
      this.cometAddress as `0x${string}`,
      userAddress,
      bulkerAddress,
    );

    if (!isAllowed) {
      return "need to make allow on contract!";
    }

    const borrowValue = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    const borrowBalance = this.borrowBalance;

    const availableToBorrow = DataUtils.toBigNumber(
      UserMarketWrapperMethods.availableToBorrow(
        borrowBalance,
        this.price,
        this.collaterals,
      ),
      Number(this.baseToken.decimals),
    );

    if (availableToBorrow <= borrowValue) {
      return "need collaterals to borrow this amount";
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
      return await bulker.invokeBulker(bulkerAddress, [
        [ACTION_WITHDRAW_ASSET],
        abiEncodeData,
      ]); //if need update data after implement then and refetch userMarket
    } catch (e) {
      return "borrow error";
    }
  }

  async withDrawMarket(inputValue: string, isMax: boolean) {
    const walletClient = await getWalletClient(config);

    const userAddress = walletClient.account.address;

    const bulker = new BulkerContract();

    const inputAmount = DataUtils.toBigNumber(
      inputValue,
      Number(this.baseToken.decimals),
    );

    const borrowBalance = this.borrowBalance;
    const supplyBalance = this.supplyBalance;

    if (borrowBalance < inputAmount) {
      return "user cant withdraw more that he borrow";
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
      return await bulker.invokeBulker(bulkerAddress, [
        [ACTION_WITHDRAW_ASSET],
        abiEncodeData,
      ]); //if need update data after implement then and refetch userMarket
    } catch (e) {
      return "borrow error";
    }
  }
}
