import { IProvider, Provider } from '../../provider';
import { ISigner, Signer } from 'src/signer';

export class NetworkService {
  private static instance: NetworkService;
  private rpcConfigs: Record<number, { current: string; fallback: string[] }> = {};
  private rpcChangeCallbacks: Array<(rpcUrl: string, chainId: number) => void> = [];
  private providerInstances: Record<number, Provider> = {};
  private signerInstances: Record<number, Signer> = {};

  private constructor() {}

  static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  getCurrentRPC(chainId: number): string | undefined {
    return this.rpcConfigs[chainId]?.current;
  }

  setRPC(rpcUrl: string, chainId: number): void {
    if (!this.rpcConfigs[chainId]) {
      this.rpcConfigs[chainId] = { current: rpcUrl, fallback: [] };
    } else {
      this.rpcConfigs[chainId].current = rpcUrl;
    }

    if (this.providerInstances[chainId]) {
      this.providerInstances[chainId].setProvider(rpcUrl);
      if (this.signerInstances[chainId]) {
        this.signerInstances[chainId].updateSigner();
      }
    } else {
      this.providerInstances[chainId] = new Provider(rpcUrl);
    }

    this.notifyRPCChange(rpcUrl, chainId);
  }

  resetToDefaultRPC(chainId: number, defaultRPC: string): void {
    this.setRPC(defaultRPC, chainId);
  }

  addFallbackRPC(rpcUrls: string[], chainId: number): void {
    if (!this.rpcConfigs[chainId]) {
      this.rpcConfigs[chainId] = { current: rpcUrls[0] || '', fallback: rpcUrls.slice(1) };
    } else {
      this.rpcConfigs[chainId].fallback = rpcUrls;
    }
  }

  getFallbackRPCs(chainId: number): string[] {
    return this.rpcConfigs[chainId]?.fallback || [];
  }

  onRPCChange(callback: (rpcUrl: string, chainId: number) => void): void {
    this.rpcChangeCallbacks.push(callback);
  }

  async handleRPCFailure(chainId: number): Promise<void> {
    const fallbackList = this.getFallbackRPCs(chainId);
    if (fallbackList.length === 0) return;

    const nextRPC = fallbackList.shift();
    if (nextRPC) {
      this.setRPC(nextRPC, chainId);
    }
  }

  getAllRPCConfigs(): Record<number, { current: string; fallback: string[] }> {
    return this.rpcConfigs;
  }

  private notifyRPCChange(rpcUrl: string, chainId: number): void {
    this.rpcChangeCallbacks.forEach((callback) => callback(rpcUrl, chainId));
  }

  getProvider(chainId: number): IProvider {
    if (!this.providerInstances[chainId]) {
      throw new Error(`No provider found for chain ${chainId}`);
    }
    return this.providerInstances[chainId];
  }

  getSigner(chainId: number, privateKey: string): ISigner {
    if (!this.signerInstances[chainId]) {
      this.signerInstances[chainId] = new Signer(this.getProvider(chainId), privateKey);
    }
    return this.signerInstances[chainId];
  }
}
