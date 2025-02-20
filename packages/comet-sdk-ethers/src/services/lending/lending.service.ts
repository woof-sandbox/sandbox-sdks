import { type JsonRpcProvider, type Wallet, ethers } from "ethers";
import { CometContract, Erc20Contract } from "../../contracts";
import { SERVICES_ERRORS } from "../../errors/services";

export class LendingService {
  private readonly provider: ethers.JsonRpcProvider;
  private readonly signer?: ethers.Wallet;

  constructor(rpcUrl: string, privateKey?: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
    }
  }

  getDriver(): JsonRpcProvider | Wallet {
    if (this.signer) return this.signer;
    return this.provider;
  }

  getSigner(): Wallet {
    if (this.signer) return this.signer;
    throw SERVICES_ERRORS.SIGNER_IS_NOT_PROVIDED;
  }

  async getAllowance(
    tokenAddress: string,
    owner: string,
    spender: string,
  ): Promise<bigint> {
    const erc20Contract = new Erc20Contract(tokenAddress, this.provider);
    return await erc20Contract.allowance(owner, spender);
  }

  async isAllowed(
    cometAddress: string,
    owner: string,
    bulker: string,
  ): Promise<boolean> {
    const comet = new CometContract(cometAddress);
    return await comet.isAllowed(owner, bulker);
  }

  async approveToken(
    tokenAddress: string,
    spender: string,
    amount: bigint,
  ): Promise<ethers.TransactionResponse> {
    const erc20Contract = new Erc20Contract(tokenAddress, this.getSigner());
    const tx = await erc20Contract.approve(spender, amount);
    return tx;
  }

  async allowComet(
    cometAddress: string,
    bulker: string,
    status: boolean,
  ): Promise<ethers.TransactionResponse> {
    const cometContract = new CometContract(cometAddress, this.getSigner());
    const tx = await cometContract.allow(bulker, status);
    return tx;
  }

  async getGasPrice(): Promise<bigint> {
    // todo: move
    const feeData = await this.provider.getFeeData();
    return feeData.maxFeePerGas || BigInt(0);
  }
}
