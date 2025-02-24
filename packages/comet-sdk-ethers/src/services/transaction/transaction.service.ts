import { type JsonRpcProvider, Wallet, ethers } from "ethers";
import { SERVICES_ERRORS } from "../../errors/services";
import { TransactionStatus } from "./transaction-status";

export class TransactionService {
  private readonly provider: JsonRpcProvider;
  private readonly signer?: Wallet;

  constructor(rpcUrl: string, privateKey?: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    if (privateKey) {
      this.signer = new Wallet(privateKey, this.provider);
    }
  }

  getDriver(): JsonRpcProvider | Wallet {
    return this.signer || this.provider;
  }

  getSigner(): Wallet {
    if (!this.signer) {
      throw SERVICES_ERRORS.SIGNER_IS_NOT_PROVIDED;
    }
    return this.signer;
  }

  async sendTransaction(
    tx: ethers.TransactionRequest,
  ): Promise<ethers.TransactionResponse> {
    const signer = this.getSigner();
    const response = await signer.sendTransaction(tx);
    return response;
  }

  async waitForTransaction(
    txHash: string,
    confirmations = 1,
  ): Promise<ethers.TransactionReceipt | null> {
    return await this.provider.waitForTransaction(txHash, confirmations);
  }

  async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    const tx = await this.provider.getTransaction(txHash);
    if (!tx) {
      return TransactionStatus.NotFound;
    }
    if (!tx.blockNumber) {
      return TransactionStatus.Pending;
    }
    const receipt = await this.provider.getTransactionReceipt(txHash);
    return receipt && receipt.status === 1
      ? TransactionStatus.Success
      : TransactionStatus.Failed;
  }

  async estimateGas(tx: ethers.TransactionRequest): Promise<bigint> {
    return await this.provider.estimateGas(tx);
  }

  async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.maxFeePerGas || BigInt(0);
  }
}
