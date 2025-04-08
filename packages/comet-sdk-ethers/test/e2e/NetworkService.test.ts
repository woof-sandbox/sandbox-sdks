import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type FallbackRPCConfig,
  type InitialEndpoint,
  NetworkService,
  ProviderType,
} from "../../src/services/network";

describe("NetworkService", () => {
  let initialEndpoints: InitialEndpoint[];
  let networkService: NetworkService;

  beforeEach(() => {
    initialEndpoints = [
      { rpcUrl: "https://mainnet.infura.io/v3/test", chainId: 1, priority: 1 },
      {
        rpcUrl: "https://mainnet.alchemyapi.io/v2/test",
        chainId: 1,
        priority: 2,
      },
      { rpcUrl: "wss://mainnet.infura.io/ws/v3/test", chainId: 1, priority: 1 },
    ];
    networkService = new NetworkService(initialEndpoints);
  });

  it("should initialize with correct primary endpoints", () => {
    const primaryJsonRpc = networkService.getCurrentRPC(
      1,
      ProviderType.JsonRpc,
    );
    expect(primaryJsonRpc).toBe("https://mainnet.infura.io/v3/test");

    const primaryWs = networkService.getCurrentRPC(1, ProviderType.Websocket);
    expect(primaryWs).toBe("wss://mainnet.infura.io/ws/v3/test");
  });

  it("should update primary RPC using setRPC", () => {
    networkService.setRPC("https://custom.rpc.url", 1, ProviderType.JsonRpc);
    const primaryJsonRpc = networkService.getCurrentRPC(
      1,
      ProviderType.JsonRpc,
    );
    expect(primaryJsonRpc).toBe("https://custom.rpc.url");
  });

  it("should add fallback endpoints", () => {
    const fallbackRPCs: FallbackRPCConfig[] = [
      {
        rpcUrl: "https://fallback1.rpc.url",
        chainId: 1,
        providerType: ProviderType.JsonRpc,
      },
      {
        rpcUrl: "https://fallback2.rpc.url",
        chainId: 1,
        providerType: ProviderType.JsonRpc,
      },
    ];
    networkService.addFallbackRPC(fallbackRPCs);
    const configs = networkService.getAllRPCConfigs();
    const jsonRpcConfig = configs[1]![ProviderType.JsonRpc];
    expect(jsonRpcConfig).toBeDefined();
    expect(jsonRpcConfig?.endpoints.length).toBe(3);
  });

  it("should rotate to next endpoint on handleRPCFailure", async () => {
    const fallbackRPCs: FallbackRPCConfig[] = [
      {
        rpcUrl: "https://fallback1.rpc.url",
        chainId: 1,
        providerType: ProviderType.JsonRpc,
      },
      {
        rpcUrl: "https://fallback2.rpc.url",
        chainId: 1,
        providerType: ProviderType.JsonRpc,
      },
    ];
    networkService.addFallbackRPC(fallbackRPCs);
    expect(networkService.getCurrentRPC(1, ProviderType.JsonRpc)).toBe(
      "https://mainnet.infura.io/v3/test",
    );
    await networkService.handleRPCFailure(1, ProviderType.JsonRpc);
    expect(networkService.getCurrentRPC(1, ProviderType.JsonRpc)).toBe(
      "https://fallback1.rpc.url",
    );
  });

  it("should reset to default RPC using resetToDefaultRPC", () => {
    networkService.setRPC("https://custom.rpc.url", 1, ProviderType.JsonRpc);
    expect(networkService.getCurrentRPC(1, ProviderType.JsonRpc)).toBe(
      "https://custom.rpc.url",
    );
    networkService.resetToDefaultRPC(1, ProviderType.JsonRpc);
    expect(networkService.getCurrentRPC(1, ProviderType.JsonRpc)).toBe(
      "https://mainnet.infura.io/v3/test",
    );
  });

  it("should notify subscribers on RPC change", async () => {
    const callback = vi.fn();
    networkService.onRPCChange(callback);
    networkService.setRPC("https://custom.rpc.url", 1, ProviderType.JsonRpc);
    expect(callback).toHaveBeenCalledWith(
      "https://custom.rpc.url",
      1,
      ProviderType.JsonRpc,
    );

    const fallbackRPCs: FallbackRPCConfig[] = [
      {
        rpcUrl: "https://fallback1.rpc.url",
        chainId: 1,
        providerType: ProviderType.JsonRpc,
      },
      {
        rpcUrl: "https://fallback2.rpc.url",
        chainId: 1,
        providerType: ProviderType.JsonRpc,
      },
    ];
    networkService.addFallbackRPC(fallbackRPCs);
    await networkService.handleRPCFailure(1, ProviderType.JsonRpc);
    expect(callback).toHaveBeenCalledWith(
      "https://fallback1.rpc.url",
      1,
      ProviderType.JsonRpc,
    );
  });
});
