import {MULTICALL_ALLOW_FAILURE} from "../constants";

export type ContractCall = {
    method: string;
    target: string;
    allowFailure: boolean;
    callData: string;
}
