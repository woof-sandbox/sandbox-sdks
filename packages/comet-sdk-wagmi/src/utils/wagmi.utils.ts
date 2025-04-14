import { MulticallReturnType } from "@wagmi/core";

export class WagmiUtils {
    static resultOrThrow<T>(response: MulticallReturnType[number]) {
        if (response.result === undefined) throw response.error;
        return response.result as T;
    }
}
