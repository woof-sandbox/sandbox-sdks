import { AbstractProvider, FallbackProvider, JsonRpcProvider, WebSocketProvider } from 'ethers/providers';

export type ProviderType = 'jsonrpc' | 'websocket';

export interface RPCConfig {
  current: string;
  default: string;
  fallback: string[];
}

export interface FallbackProviderConfig {
  provider: AbstractProvider;
  priority: number;
  weight: number;
  stallTimeout: number;
}

export type RPCChangeCallback = (rpcUrl: string, chainId: number, providerType: ProviderType) => void;

export class NetworkService {
  private static instance: NetworkService;
  private rpcConfigs: Record<number, Partial<Record<ProviderType, RPCConfig>>> = {};
  private fallbackProviders: Record<number, Partial<Record<ProviderType, FallbackProvider>>> = {};
  private rpcChangeCallbacks: RPCChangeCallback[] = [];

  private constructor() {}

  public static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  /**
   * Utility: Creates an ethers provider based on the type.
   */
  private createProvider(url: string, providerType: ProviderType): AbstractProvider {
    if (providerType === 'jsonrpc') {
      return new JsonRpcProvider(url);
    } else if (providerType === 'websocket') {
      return new WebSocketProvider(url);
    } else {
      throw new Error(`Unsupported provider type: ${providerType}`);
    }
  }

  /**
   * Rebuilds the ethers FallbackProvider for a specific chain and provider type
   * based on the current configuration.
   */
  private updateFallbackProvider(chainId: number, providerType: ProviderType): void {
    const config = this.rpcConfigs[chainId]?.[providerType];
    if (!config) return;
    const endpoints: FallbackProviderConfig[] = [];

    if (config.current) {
      endpoints.push({
        provider: this.createProvider(config.current, providerType),
        priority: 1,
        weight: 1,
        stallTimeout: 1000,
      });
    }

    config.fallback.forEach((url, index) => {
      endpoints.push({
        provider: this.createProvider(url, providerType),
        priority: index + 2,
        weight: 1,
        stallTimeout: 1000,
      });
    });

    if (!this.fallbackProviders[chainId]) {
      this.fallbackProviders[chainId] = {};
    }
    this.fallbackProviders[chainId]![providerType] = new FallbackProvider(endpoints);
  }

  /**
   * Returns the ethers FallbackProvider for a given chain and provider type.
   */
  public getProvider(chainId: number, providerType: ProviderType): FallbackProvider {
    const provider = this.fallbackProviders[chainId]?.[providerType];
    if (!provider) {
      throw new Error(`No fallback provider configured for chain ${chainId} and type ${providerType}`);
    }
    return provider;
  }

  /**
   * Returns the current RPC URL for the specified chain and provider type.
   */
  public getCurrentRPC(chainId: number, providerType: ProviderType): string | undefined {
    return this.rpcConfigs[chainId]?.[providerType]?.current;
  }

  /**
   * Sets the primary RPC URL for a given chain and provider type.
   * If no configuration exists yet, it is created with the given URL as primary/default.
   */
  public setRPC(rpcUrl: string, chainId: number, providerType: ProviderType): void {
    if (!this.rpcConfigs[chainId]) {
      this.rpcConfigs[chainId] = {};
    }
    if (!this.rpcConfigs[chainId]![providerType]) {
      this.rpcConfigs[chainId]![providerType] = { current: rpcUrl, default: rpcUrl, fallback: [] };
    } else {
      this.rpcConfigs[chainId]![providerType]!.current = rpcUrl;
    }
    this.updateFallbackProvider(chainId, providerType);
    this.notifyRPCChange(rpcUrl, chainId, providerType);
  }

  /**
   * Resets the primary RPC to its default for a given chain and provider type.
   */
  public resetToDefaultRPC(chainId: number, providerType: ProviderType): void {
    const config = this.rpcConfigs[chainId]?.[providerType];
    if (config) {
      config.current = config.default;
      this.updateFallbackProvider(chainId, providerType);
      this.notifyRPCChange(config.default, chainId, providerType);
    }
  }

  /**
   * Sets an ordered list of fallback RPC URLs for the given chain and provider type.
   * If no configuration exists, the first URL is used as primary/default.
   */
  public addFallbackRPC(rpcUrls: string[], chainId: number, providerType: ProviderType): void {
    if (!this.rpcConfigs[chainId]) {
      this.rpcConfigs[chainId] = {};
    }
    if (!this.rpcConfigs[chainId]![providerType]) {
      if (rpcUrls[0]) {
        this.rpcConfigs[chainId]![providerType] = {
          current: rpcUrls[0],
          default: rpcUrls[0],
          fallback: rpcUrls.slice(1),
        };
      } else {
        this.rpcConfigs[chainId]![providerType] = { current: '', default: '', fallback: [] };
      }
    } else {
      this.rpcConfigs[chainId]![providerType]!.fallback = rpcUrls;

      if (!this.rpcConfigs[chainId]![providerType]!.current && rpcUrls[0]) {
        this.rpcConfigs[chainId]![providerType]!.current = rpcUrls[0];
        this.notifyRPCChange(rpcUrls[0], chainId, providerType);
      }
    }
    this.updateFallbackProvider(chainId, providerType);
  }

  /**
   * Returns the fallback RPC URLs for the given chain and provider type.
   */
  public getFallbackRPCs(chainId: number, providerType: ProviderType): string[] {
    return this.rpcConfigs[chainId]?.[providerType]?.fallback || [];
  }

  /**
   * Subscribe to RPC configuration changes.
   */
  public onRPCChange(callback: RPCChangeCallback): void {
    this.rpcChangeCallbacks.push(callback);
  }

  /**
   * Invoked when an RPC endpoint failure is detected for a given chain and provider type.
   * It checks the current configuration for that chain and provider type, and if fallback RPC endpoints are available
   * it automatically shifts to the next fallback RPC endpoint.
   */
  public async handleRPCFailure(chainId: number, providerType: ProviderType): Promise<void> {
    const config = this.rpcConfigs[chainId]?.[providerType];
    if (!config) {
      console.warn(`No configuration found for chain ${chainId} and type ${providerType}`);
      return;
    }
    if (config.fallback.length === 0) {
      console.warn(`No fallback RPC available for chain ${chainId} and type ${providerType}`);
      return;
    }

    const nextRPC = config.fallback.shift();
    if (nextRPC) {
      config.current = nextRPC;
      this.updateFallbackProvider(chainId, providerType);
      this.notifyRPCChange(nextRPC, chainId, providerType);
    }
    return Promise.resolve();
  }

  /**
   * Returns all RPC configurations.
   */
  public getAllRPCConfigs(): Record<number, Partial<Record<ProviderType, RPCConfig>>> {
    return this.rpcConfigs;
  }

  /**
   * Resets all RPC configurations and fallback providers.
   */
  public resetAllRPCSettings(): void {
    this.rpcConfigs = {};
    this.fallbackProviders = {};
  }

  /**
   * Notifies all subscribers about an RPC configuration change.
   */
  private notifyRPCChange(rpcUrl: string, chainId: number, providerType: ProviderType): void {
    this.rpcChangeCallbacks.forEach((callback) => callback(rpcUrl, chainId, providerType));
  }
}
