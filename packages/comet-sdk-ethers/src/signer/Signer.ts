import { ethers } from 'ethers';
import { ISigner } from './ISigner';
import { IProvider } from '../provider';

export class Signer implements ISigner {
  private signer: ethers.Wallet | null = null;
  private providerInstance: IProvider;
  private privateKey: string | null = null;

  constructor(provider: IProvider, privateKey?: string) {
    this.providerInstance = provider;
    if (privateKey) {
      this.privateKey = privateKey;
      this.setSigner(privateKey);
    }
  }

  setSigner(privateKey: string): void {
    const provider = this.providerInstance.getProvider();
    this.signer = new ethers.Wallet(privateKey, provider);
  }

  getSigner(): ethers.Wallet {
    if (!this.signer) {
      throw new Error('Signer is not initialized.');
    }
    return this.signer;
  }

  updateSigner(): void {
    if (this.privateKey) {
      this.setSigner(this.privateKey);
    }
  }
}
