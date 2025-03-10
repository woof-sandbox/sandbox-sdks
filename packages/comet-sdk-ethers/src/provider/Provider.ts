import { ethers } from 'ethers';
import { IProvider } from './IProvider';

export class Provider implements IProvider {
  private provider: ethers.JsonRpcProvider | null = null;

  constructor(rpcUrl: string) {
    this.setProvider(rpcUrl);
  }

  setProvider(rpcUrl: string): void {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  getProvider(): ethers.JsonRpcProvider {
    if (!this.provider) {
      throw new Error('Provider is not initialized.');
    }
    return this.provider;
  }
}
