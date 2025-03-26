import type { JsonRpcProvider, Wallet, WebSocketProvider } from "ethers";
import { BulkerAbi } from "../abis";
import { Contract } from "@sandbox/contracts-tools-sdk-ethers";

export class BulkerContract extends Contract {
  constructor(
    address: string,
    driver?: JsonRpcProvider | WebSocketProvider | Wallet,
  ) {
    super(BulkerAbi, address, driver);
  }

  // TODO
}
