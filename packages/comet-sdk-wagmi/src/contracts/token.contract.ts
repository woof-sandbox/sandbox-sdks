/* TODO: remove
import { readContract } from "@wagmi/core";
import type { Address } from "viem";
import { erc20Abi } from "../abis";
import { config } from "./bulker.contract";

export class TokenContract {
  async getAllowance(userAddress: Address, owner: Address, spender: Address) {
    return await readContract(config, {
      abi: erc20Abi,
      address: userAddress,
      functionName: "allowance",
      args: [owner, spender],
    });
  }
}
*/
