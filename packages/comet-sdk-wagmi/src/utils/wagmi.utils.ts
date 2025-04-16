import type { MulticallReturnType } from "@wagmi/core";

export class WagmiUtils {
  static resultOrThrow<T>(response?: MulticallReturnType[number]) {
    if (!response || response.error || !response)
      throw response?.error || new Error("Failed to get multicall result");
    return response.result as T;
  }
}
