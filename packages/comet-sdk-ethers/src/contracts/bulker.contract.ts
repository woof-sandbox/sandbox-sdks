import type {
  JsonRpcProvider,
  Wallet,
  WebSocketProvider,
} from "ethers";
import { BulkerAbi } from "../abis";
import { BaseContract } from "./base-contract";

export class BulkerContract extends BaseContract {
  constructor(
    address: string,
    driver?: JsonRpcProvider | WebSocketProvider | Wallet,
  ) {
    super(BulkerAbi, address, driver);
  }

  // TODO
}
