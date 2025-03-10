import { ethers } from 'ethers';
import { IProvider } from '../provider';

export interface ISigner {
  setSigner(privateKey: string): void;
  getSigner(): ethers.Signer;
  updateSigner(): void;
}
