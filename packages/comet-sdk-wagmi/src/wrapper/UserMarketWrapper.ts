import {ACTION_SUPPLY_TOKEN, ACTION_WITHDRAW_ASSET, UserMarket,} from "@sandbox/comet-sdk";
import type {IUserMarket} from "@sandbox/comet-sdk/src/user/IUserMarket";
import {getWalletClient} from "@wagmi/core";
import {AbiCoder} from "ethers";
import {BulkerContract, CometContract, Erc20Contract, wagmiConfig,} from "../contracts";
import type {MultiAllowanceCallType} from "../contracts/entities/multi-allowance-call";
import {DataUtils} from "../utils";
import {UserMarketMethods} from "@sandbox/comet-sdk/src/user/UserMarketMethods";
import type {WagmiChainId} from "../config/chains";


// Todo need to find where to get Bulker Address
const bulkerAddress = "0xbde8f31d2ddda895264e27dd990fab3dc87b372d"; // arbitrum

export type setterResponseType = {
    response?: string;
    message: string;
};

export class UserMarketWrapper extends UserMarket {
    constructor(userMarket: IUserMarket) {
        super(userMarket);
    }

    async supplyMarket(inputValue: string): Promise<setterResponseType> {
        const walletClient = await getWalletClient(wagmiConfig);

        const userAddress = walletClient.account.address;

        const bulker = new BulkerContract(bulkerAddress);

        const token = new Erc20Contract(this.baseToken.tokenAddress as `0x${string}`);

        const allowance = await token.allowance(
            userAddress,
            bulkerAddress,
        );

        const supplyValue = DataUtils.toBigNumber(
            inputValue,
            Number(this.baseToken.decimals),
        );

        if (allowance < supplyValue) {
            return {
                message: "need approve token on input amount",
            };
        }

        const borrowBalance = this.borrowBalance;

        if (supplyValue <= borrowBalance) {
            console.log("we make a repay in this case");
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
            return {
                response: await bulker.invoke([
                    [ACTION_SUPPLY_TOKEN],
                    abiEncodeData,
                ]),
                message: "supply success",
            };
        } catch (e) {
            return {
                message: "supply error",
            };
        }
    }

    async borrowMarket(inputValue: string): Promise<setterResponseType> {
        const walletClient = await getWalletClient(wagmiConfig);

        const userAddress = walletClient.account.address;

        const bulker = new BulkerContract(bulkerAddress);

        const market = new CometContract(this.cometAddress as `0x${string}`); // ?:

        const isAllowed = await market.isAllowed(
            userAddress,
            bulkerAddress,
        );

        if (!isAllowed) {
            return {
                message: "need to make allow on contract!",
            };
        }

        const borrowValue = DataUtils.toBigNumber(
            inputValue,
            Number(this.baseToken.decimals),
        );

        const borrowBalance = this.borrowBalance;

        const availableToBorrow = DataUtils.toBigNumber(
            UserMarketMethods.availableToBorrow(
                borrowBalance,
                this.price,
                this.collaterals,
            ),
            Number(this.baseToken.decimals),
        );

        if (availableToBorrow <= borrowValue) {
            return {
                message: "need collaterals to borrow this amount",
            };
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
            return {
                response: await bulker.invoke([
                    [ACTION_WITHDRAW_ASSET],
                    abiEncodeData,
                ]),
                message: "borrow success",
            };
        } catch (e) {
            return {
                message: "borrow error",
            };
        }
    }

    async borrowAndSupplyMarket(
        inputValue: string,
        supplyCollaterals: MultiAllowanceCallType[],
        chainId: WagmiChainId,
    ): Promise<setterResponseType> {
        const walletClient = await getWalletClient(wagmiConfig);

        const userAddress = walletClient.account.address;

        const bulker = new BulkerContract(bulkerAddress);

        const market = new CometContract(this.cometAddress as `0x${string}`, chainId);

        const token = new Erc20Contract(this.baseToken.tokenAddress as `0x${string}`, chainId);

        const isAllowed = await market.isAllowed(
            userAddress,
            bulkerAddress,
        );

        if (!isAllowed) {
            return {
                message: "need to make allow on contract!",
            };
        }

        const isCollateralsFromThisMarket =
            UserMarketMethods.isAllCollateralsFromMarket(
                this.collaterals,
                supplyCollaterals,
            );

        if (!isCollateralsFromThisMarket) {
            return {
                message: "you try to supply collaterals from other market",
            };
        }

        const collateralsAllowances = await token.getMultiAllowance(
            supplyCollaterals,
            chainId,
            userAddress,
            bulkerAddress,
        );

        const isSmallAllowance = UserMarketMethods.isSomeTokenSmallAllowance(
            collateralsAllowances,
            this.collaterals,
        );

        if (isSmallAllowance) {
            return {
                message: "some of tokens have smaller approve then input value",
            };
        }

        const collateralsActions: `0x${string}`[] = collateralsAllowances.map(
            () => ACTION_SUPPLY_TOKEN,
        );

        const collateralsData = collateralsAllowances.map((collateral) => {
            const currentCollateralData =
                UserMarketMethods.findMarketCollateralByAddress(
                    this.collaterals,
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

        const borrowBalance = this.borrowBalance;

        // TODO here we need to add supply amount to correct data
        const availableToBorrow = DataUtils.toBigNumber(
            UserMarketMethods.availableToBorrow(
                borrowBalance,
                this.price,
                this.collaterals,
            ),
            Number(this.baseToken.decimals),
        );

        if (availableToBorrow <= borrowValue) {
            return {
                message: "need collaterals to borrow this amount",
            };
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
            return {
                response: await bulker.invoke([
                    collateralsActions,
                    collateralsData,
                ]),
                message: "borrow and supply success",
            };
        } catch (e) {
            return {
                message: "error borrow and withdraw",
            };
        }
    }

    async withDrawMarket(
        inputValue: string,
        isMax: boolean,
    ): Promise<setterResponseType> {
        const walletClient = await getWalletClient(wagmiConfig);

        const userAddress = walletClient.account.address;

        const bulker = new BulkerContract(bulkerAddress);

        const inputAmount = DataUtils.toBigNumber(
            inputValue,
            Number(this.baseToken.decimals),
        );

        const supplyBalance = this.supplyBalance;

        if (supplyBalance < inputAmount) {
            return {
                message: "user cant withdraw more that he borrow",
            };
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
            return {
                response: await bulker.invoke([
                    [ACTION_WITHDRAW_ASSET],
                    abiEncodeData,
                ]),
                message: "withdraw success",
            };
        } catch (e) {
            return {
                message: "error withdraw market",
            };
        }
    }

    async supplyCollaterals(
        collaterals: MultiAllowanceCallType[],
        chainId: number,
    ): Promise<setterResponseType> {
        const walletClient = await getWalletClient(wagmiConfig);

        const userAddress = walletClient.account.address;

        const bulker = new BulkerContract(bulkerAddress);

        const market = new CometContract(this.cometAddress as `0x${string}`);

        const token = new Erc20Contract(this.baseToken.tokenAddress as `0x${string}`);

        const isAllowed = await market.isAllowed(
            userAddress,
            bulkerAddress,
        );

        if (!isAllowed) {
            return {
                message: "need to make allow on contract!",
            };
        }

        const isCollateralsFromThisMarket =
            UserMarketMethods.isAllCollateralsFromMarket(this.collaterals, collaterals);

        if (!isCollateralsFromThisMarket) {
            return {
                message: "you try to supply collaterals from other market",
            };
        }

        const collateralsAllowances = await token.getMultiAllowance(
            collaterals,
            chainId,
            userAddress,
            bulkerAddress,
        );

        const isSmallAllowance = UserMarketMethods.isSomeTokenSmallAllowance(
            collateralsAllowances,
            this.collaterals,
        );

        if (isSmallAllowance) {
            return {
                message: "some of tokens have smaller approve then input value",
            };
        }


        const actions: `0x${string}`[] = collateralsAllowances.map(
            () => ACTION_SUPPLY_TOKEN,
        );

        const abiEncodeData = collateralsAllowances.map((collateral) => {
            const currentCollateralData =
                UserMarketMethods.findMarketCollateralByAddress(
                    this.collaterals,
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
            return {
                response: await bulker.invoke([
                    actions,
                    abiEncodeData,
                ]),
                message: "supply success",
            };
        } catch (e) {
            return {
                message: "supply collateral error",
            };
        }
    }

    async withDrawCollateral(
        collaterals: MultiAllowanceCallType[],
    ): Promise<setterResponseType> {
        const walletClient = await getWalletClient(wagmiConfig);

        const userAddress = walletClient.account.address;

        const bulker = new BulkerContract(bulkerAddress);

        const market = new CometContract(this.cometAddress as `0x${string}`);

        const isAllowed = await market.isAllowed(
            userAddress,
            bulkerAddress,
        );

        if (!isAllowed) {
            return {
                message: "need to make allow on contract!",
            };
        }

        const isCollateralsFromThisMarket =
            UserMarketMethods.isAllCollateralsFromMarket(this.collaterals, collaterals);

        if (!isCollateralsFromThisMarket) {
            return {
                message: "you try to withdraw collaterals from other market",
            };
        }

        const sumOfWithdraw = collaterals.reduce((acc, collateral) => {
            const currentCollateralData =
                UserMarketMethods.findMarketCollateralByAddress(
                    this.collaterals,
                    collateral.tokenAddress,
                );

            return acc + DataUtils.toBigNumber(
                collateral.inputAmount,
                Number(currentCollateralData?.decimals || 18),
            );
        }, BigInt(0))


        const maxWithDrawAmount =
            UserMarketMethods.maxWithDrawCollateralAmount(
                this.supplyBalance,
                this.borrowBalance,
                this.collaterals,
                this.price,
                this.baseToken.decimals,
            );

        if (Number(sumOfWithdraw) > Number(maxWithDrawAmount)) {
            return {
                message: "you try to withdraw more than you can",
            };
        }

        const action = collaterals.map(() => ACTION_WITHDRAW_ASSET);

        const abiEncodeData = collaterals.map((collateral) => {
            const currentCollateralData =
                UserMarketMethods.findMarketCollateralByAddress(
                    this.collaterals,
                    collateral.tokenAddress,
                );

            const withDrawAmount = DataUtils.toBigNumber(
                collateral.inputAmount,
                Number(currentCollateralData?.decimals || 18),
            )
            const data = [this.cometAddress, userAddress, withDrawAmount];

            return AbiCoder.defaultAbiCoder().encode(
                ["address", "address", "uint"],
                data,
            ) as `0x${string}`;
        })

        try {
            return {
                response: await bulker.invoke([
                    action,
                    abiEncodeData,
                ]),
                message: "withdraw success",
            };
        } catch (e) {
            return {
                message: "withdraw collateral error",
            };
        }
    }
}
