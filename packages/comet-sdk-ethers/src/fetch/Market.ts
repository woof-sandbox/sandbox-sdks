import type { IMarket } from "@sandbox/comet-sdk";
import { JsonRpcProvider } from "ethers";
import { CometContract } from "../contracts";
import {MulticallContract} from "../contracts/multicall.contract";

export async function fetchMarket(
    cometProxyAddress: string,
    provider: JsonRpcProvider,
): Promise<IMarket> {
    const contract = new CometContract(provider, cometProxyAddress);
    const multicall = new MulticallContract(provider);

    const tags: string[] = [];
    const borrowRateCall = contract.getBorrowRateCall();
    const supplyRateCall = contract.getSupplyRateCall();

    const borrowRateTag = 'borrowRate';
    multicall.add(borrowRateTag, borrowRateCall);
    tags.push(borrowRateTag);

    const supplyRateTag = 'supplyRate';
    multicall.add(supplyRateTag, supplyRateCall);
    tags.push(supplyRateTag);

    const results: any[] = await multicall.run(); // todo: type
    const borrowRate: bigint = contract.interface.decodeFunctionResult(borrowRateCall.method, results[0][0])[0];
    const supplyRate: bigint = contract.interface.decodeFunctionResult(borrowRateCall.method, results[0][1])[0];

    return {
        cometAddress: cometProxyAddress,
        borrowRate,
        supplyRate,
    };
}