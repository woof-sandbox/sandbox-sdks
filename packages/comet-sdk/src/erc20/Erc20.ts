import type { IErc20 } from "./IErc20";

export class Erc20 implements IErc20 {
  public address: string;

  constructor(address: string) {
    this.address = address;
  }
}
