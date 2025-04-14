import {Address} from "viem";

export type MultiAllowanceResponseType = {
    tokenAddress: Address;
    inputAmount: string;
    allowance?: bigint
}