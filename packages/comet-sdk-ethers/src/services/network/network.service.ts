import { AbstractProvider, FallbackProvider, JsonRpcProvider, WebSocketProvider } from "ethers/providers";

export enum ProviderType {
  JsonRpc = "jsonrpc",
  Websocket = "websocket",
}

export interface InitialEndpoint {
  rpcUrl: string;
  isWs: boolean;
  chainId: number;
  priority?: number;
  weight?: number;
  stallTimeout?: number;
}

export interface EndpointConfig {
  rpcUrl: string;
  priority: number;
  weight: number;
  stallTimeout: number;
}

export interface InternalRPCConfig {
  default: EndpointConfig;
  current: EndpointConfig;
  endpoints: EndpointConfig[];
}

export interface FallbackRPCConfig {
  rpcUrl: string;
  chainId: number;
  providerType: ProviderType;
  priority?: number;
  weight?: number;
  stallTimeout?: number;
}

export type RPCChangeCallback = (rpcUrl: string, chainId: number, providerType: ProviderType) => void;

export class NetworkService {
  private rpcConfigs: Record<number, Partial<Record<ProviderType, InternalRPCConfig>>> = {};
  private fallbackProviders: Record<number, Partial<Record<ProviderType, FallbackProvider>>> = {};
  private rpcChangeCallbacks: RPCChangeCallback[] = [];

  /*
   * Constructs a new NetworkService with the provided initial endpoints.
   * Endpoints are grouped by chain and provider type, sorted by priority,
   * and the first endpoint is used as both the default and the current endpoint.
   */
  public constructor(initialEndpoints: InitialEndpoint[]) {
    initialEndpoints.forEach((endpoint) => {
      const providerType = endpoint.isWs ? ProviderType.Websocket : ProviderType.JsonRpc;
      const chainId = endpoint.chainId;
      const newEp: EndpointConfig = {
        rpcUrl: endpoint.rpcUrl,
        priority: endpoint.priority ?? 1,
        weight: endpoint.weight ?? 1,
        stallTimeout: endpoint.stallTimeout ?? 1000,
      };

      if (!this.rpcConfigs[chainId]) {
        this.rpcConfigs[chainId] = {};
      }

      if (!this.rpcConfigs[chainId]![providerType]) {
        this.rpcConfigs[chainId]![providerType] = {
          default: newEp,
          current: newEp,
          endpoints: [newEp],
        };
      }
    });

    Object.keys(this.rpcConfigs).forEach((chainIdStr) => {
      const chainId = parseInt(chainIdStr, 10);
      const types = Object.keys(this.rpcConfigs[chainId]!) as ProviderType[];
      types.forEach((pt) => {
        this.updateFallbackProvider(chainId, pt);
      });
    });
  }

  /**
   * Utility: Creates an ethers provider instance based on the provider type.
   */
  private createProvider(url: string, providerType: ProviderType): AbstractProvider {
    if (providerType === ProviderType.JsonRpc) {
      return new JsonRpcProvider(url);
    } else if (providerType === ProviderType.Websocket) {
      return new WebSocketProvider(url);
    } else {
      throw new Error(`Unsupported provider type: ${providerType}`);
    }
  }

  /**
   * Rebuilds the ethers FallbackProvider for a given chain and provider type
   * based on the current internal configuration.
   */
  private updateFallbackProvider(chainId: number, providerType: ProviderType): void {
    const config = this.rpcConfigs[chainId]?.[providerType];
    if (!config) return;
    const endpoints = config.endpoints.map((ep) => ({
      provider: this.createProvider(ep.rpcUrl, providerType),
      priority: ep.priority,
      weight: ep.weight,
      stallTimeout: ep.stallTimeout,
    }));

    if (!this.fallbackProviders[chainId]) {
      this.fallbackProviders[chainId] = {};
    }
    this.fallbackProviders[chainId]![providerType] = new FallbackProvider(endpoints);
  }

  /**
   * Returns the current RPC URL (active endpoint) for the specified chain and provider type.
   */
  public getCurrentRPC(chainId: number, providerType: ProviderType): string | undefined {
    return this.rpcConfigs[chainId]?.[providerType]?.current.rpcUrl;
  }

  /**
   * Sets the primary RPC URL for a given chain and provider type.
   * This replaces the current active endpoint with the new endpoint,
   * updates the default, and rebuilds the fallback provider.
   */
  public setRPC(
    rpcUrl: string,
    chainId: number,
    providerType: ProviderType,
    priority: number = 1,
    weight: number = 1,
    stallTimeout: number = 1000
  ): void {
    if (!this.rpcConfigs[chainId]) {
      this.rpcConfigs[chainId] = {};
    }
    const newPrimary: EndpointConfig = { rpcUrl, priority, weight, stallTimeout };

    if (!this.rpcConfigs[chainId]![providerType]) {
      this.rpcConfigs[chainId]![providerType] = { default: newPrimary, current: newPrimary, endpoints: [newPrimary] };
    } else {
      const config = this.rpcConfigs[chainId]![providerType]!;
      config.current = newPrimary;
      config.endpoints[0] = newPrimary;
      config.endpoints.sort((a, b) => a.priority - b.priority);
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
      this.notifyRPCChange(config.default.rpcUrl, chainId, providerType);
    }
  }

  /**
   * Adds fallback RPC endpoints for a given chain and provider type.
   * These endpoints are appended to the endpoints array (without modifying current or default),
   * then the list is re-sorted by priority.
   */
  public addFallbackRPC(
    rpcs: {
      rpcUrl: string;
      chainId: number;
      providerType: ProviderType;
      priority?: number;
      weight?: number;
      stallTimeout?: number;
    }[]
  ): void {
    rpcs.forEach((fallback) => {
      const { rpcUrl, chainId, providerType } = fallback;

      const priority = fallback.priority ?? 2;
      const weight = fallback.weight ?? 1;
      const stallTimeout = fallback.stallTimeout ?? 1000;
      const newEp: EndpointConfig = { rpcUrl, priority, weight, stallTimeout };

      if (!this.rpcConfigs[chainId]) {
        this.rpcConfigs[chainId] = {};
      }

      if (!this.rpcConfigs[chainId]![providerType]) {
        this.rpcConfigs[chainId]![providerType] = {
          default: newEp,
          current: newEp,
          endpoints: [newEp],
        };
      } else {
        const config = this.rpcConfigs[chainId]![providerType]!;
        config.endpoints.push(newEp);
        config.endpoints.sort((a, b) => a.priority - b.priority);
      }

      this.updateFallbackProvider(chainId, providerType);
    });
  }

  /**
   * Subscribes to RPC configuration changes.
   */
  public onRPCChange(callback: RPCChangeCallback): void {
    this.rpcChangeCallbacks.push(callback);
  }

  /**
   * When an RPC failure is detected, this method selects the next endpoint in the sorted list (if available)
   * as the new current endpoint, rebuilds the fallback provider, and notifies subscribers.
   */
  public async handleRPCFailure(chainId: number, providerType: ProviderType): Promise<void> {
    const config = this.rpcConfigs[chainId]?.[providerType];
    if (!config) {
      console.warn(`No configuration found for chain ${chainId} and type ${providerType}`);
      return;
    }
    const currentIndex = config.endpoints.findIndex((ep) => ep.rpcUrl === config.current.rpcUrl);
    if (currentIndex === -1) {
      console.warn(`Current endpoint not found in endpoints list for chain ${chainId} and type ${providerType}`);
      return;
    }

    const nextEndpoint = config.endpoints[currentIndex + 1];

    if (nextEndpoint) {
      config.current = nextEndpoint;
      this.updateFallbackProvider(chainId, providerType);
      this.notifyRPCChange(config.current.rpcUrl, chainId, providerType);
    } else {
      console.warn(`No further fallback RPC available for chain ${chainId} and type ${providerType}`);
    }
    return Promise.resolve();
  }

  /**
   * Returns all RPC configurations.
   */
  public getAllRPCConfigs(): Record<number, Partial<Record<ProviderType, InternalRPCConfig>>> {
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
