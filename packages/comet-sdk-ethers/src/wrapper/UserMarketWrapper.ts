import {ACTION_SUPPLY_NATIVE_TOKEN, ACTION_WITHDRAW_ASSET, UserMarket} from "@sandbox/comet-sdk";
import {IUserMarket} from "@sandbox/comet-sdk/src/user/IUserMarket";
import {BulkerContract} from "../contracts";
import {DataUtils} from "../utils";
import {AbiCoder} from "ethers";
import {UserMarketWrapperMethods} from "./UserMarketWrapperMethods";
import {BorrowingService} from "../services/borrowing";
import {LendingService} from "../services/lending";

const rpcUrl = "https://rpc.example.com";
const privateKey = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
// Todo need to find where to get Bulker Address
const bulkerAddress = '0x123'

export class UserMarketWrapper extends UserMarket {
    constructor(userMarket: IUserMarket) {
        super(userMarket);
    }

    async supplyMarket(inputValue: string) {
        const userAddress = '0x123'

        const bulker = new BulkerContract();

        const lendingService = new LendingService(rpcUrl, privateKey);

        const allowance = await lendingService.getAllowance(this.baseToken.tokenAddress, userAddress, bulkerAddress)

        const supplyValue = DataUtils.toBigNumber(inputValue, Number(this.baseToken.decimals))

        if (allowance < supplyValue) {
            return 'need approve token on input amount'
        }


        const borrowBalance = DataUtils.toBigNumber(this.borrowBalance, Number(this.baseToken.decimals))

        if (supplyValue <= borrowBalance) {
            console.log('we make a repay in this case')
        }

        const data = [
            this.cometAddress,
            userAddress,
            this.baseToken.tokenAddress,
            DataUtils.toBigNumber(inputValue, Number(this.baseToken.decimals)),
        ];

        const abiEncodeData = AbiCoder.defaultAbiCoder().encode(
            ['address', 'address', 'address', 'uint'],
            data
        ) as `0x${string}`;


        try {
            return await bulker.invokeBulker(bulkerAddress, [[ACTION_SUPPLY_NATIVE_TOKEN], abiEncodeData]) //if need update data after implement then and refetch userMarket
        } catch (e) {
            return 'supply error'
        }
    }

    async borrowMarket(inputValue: string) {
        const userAddress = '0x123'

        const bulker = new BulkerContract();

        const borrowingService = new BorrowingService(rpcUrl, privateKey);

        const isAllowed = await borrowingService.isBorrowAllowed(
            this.cometAddress,
            userAddress,
            bulkerAddress
        );

        if (!isAllowed) {
            return 'need to make allow on contract!'
        }


        const borrowValue = DataUtils.toBigNumber(inputValue, Number(this.baseToken.decimals))

        const borrowBalance = DataUtils.toBigNumber(this.borrowBalance, Number(this.baseToken.decimals))


        const availableToBorrow = DataUtils.toBigNumber(UserMarketWrapperMethods.availableToBorrow(borrowBalance, this.price, this.collaterals), Number(this.baseToken.decimals))

        if (availableToBorrow <= borrowValue) {
            return 'need collaterals to borrow this amount'
        }


        const data = [
            this.cometAddress,
            userAddress,
            this.baseToken.tokenAddress,
            DataUtils.toBigNumber(inputValue, Number(this.baseToken.decimals)),
        ];

        const abiEncodeData = AbiCoder.defaultAbiCoder().encode(
            ['address', 'address', 'address', 'uint'],
            data
        ) as `0x${string}`;


        try {
            return await bulker.invokeBulker(bulkerAddress, [[ACTION_WITHDRAW_ASSET], abiEncodeData]) //if need update data after implement then and refetch userMarket
        } catch (e) {
            return 'borrow error'
        }
    }

    async withDrawMarket(inputValue: string, isMax: boolean) {
        const userAddress = '0x123'

        const bulker = new BulkerContract();

        const inputAmount = DataUtils.toBigNumber(inputValue, Number(this.baseToken.decimals))

        const borrowBalance = DataUtils.toBigNumber(this.borrowBalance, Number(this.baseToken.decimals))
        const supplyBalance = DataUtils.toBigNumber(this.supplyBalance, Number(this.baseToken.decimals))


        if (borrowBalance < inputAmount) {
            return 'user cant withdraw more that he borrow'
        }
        const data = [
            this.cometAddress,
            userAddress,
            isMax ? supplyBalance : inputAmount,
        ];


        const abiEncodeData = AbiCoder.defaultAbiCoder().encode(
            ['address', 'address', 'uint'],
            data
        ) as `0x${string}`;


        try {
            return await bulker.invokeBulker(bulkerAddress, [[ACTION_WITHDRAW_ASSET], abiEncodeData]) //if need update data after implement then and refetch userMarket
        } catch (e) {
            return 'borrow error'
        }
    }

}