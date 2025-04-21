import { ConfigController } from "@sandbox/comet-sdk";
import type { WagmiChainId } from "../config/chains";
import { ConfigControllerContract } from "../contracts/config-controller.contract";
import { type Config, WriteContractReturnType } from "@wagmi/core";

export class ConfigControllerWrapper extends ConfigController {
  private readonly configControllerContract: ConfigControllerContract;
  public chainId: WagmiChainId;
  private config: Config;

  constructor(
    configController: ConfigController,
    chainId: WagmiChainId,
    config: Config,
  ) {
    super(configController);
    this.configControllerContract = new ConfigControllerContract(
      this.address,
      chainId,
      config,
    );
    this.chainId = chainId;
    this.config = config;
  }

  async acceptCuratorRole(): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.acceptCuratorRole(
        this.chainId,
      );
    } catch {
      throw new Error("Failed to accept curator role.");
    }
  }

  async acceptMarketTransferProposal(
    market: `0x${string}`,
  ): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.acceptMarketTransferProposal(
        market,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to accept market transfer proposal.");
    }
  }

  async accumulateRevenue(
    token: `0x${string}`,
    amount: bigint,
  ): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.accumulateRevenue(
        token,
        amount,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to accumulate revenue.");
    }
  }

  async cancelCuratorProposal(): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.cancelCuratorProposal(
        this.chainId,
      );
    } catch {
      throw new Error("Failed to cancel curator proposal.");
    }
  }

  async cancelMarketConfigProposal(
    market: `0x${string}`,
  ): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.cancelMarketConfigProposal(
        market,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to cancel market config proposal.");
    }
  }

  async cancelMarketTransferProposal(
    market: `0x${string}`,
  ): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.cancelMarketTransferProposal(
        market,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to cancel market transfer proposal.");
    }
  }

  async claimAllRevenue(): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.claimAllRevenue(this.chainId);
    } catch {
      throw new Error("Failed to claim all revenue.");
    }
  }

  async claimRevenue(token: `0x${string}`): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.claimRevenue(
        token,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to claim revenue.");
    }
  }

  async createMarket(
    marketConfig: Parameters<ConfigControllerContract["createMarket"]>[0],
  ): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.createMarket(
        marketConfig,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to create market.");
    }
  }

  async executeMarketConfigProposal(
    market: `0x${string}`,
  ): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.executeMarketConfigProposal(
        market,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to execute market config proposal.");
    }
  }

  async grantOwnership(
    newOwner: `0x${string}`,
  ): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.grantOwnership(
        newOwner,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to grant ownership.");
    }
  }

  async initialize(
    owner: `0x${string}`,
    guardian: `0x${string}`,
    sandboxController: `0x${string}`,
    marketFactory: `0x${string}`,
    curatorFee: bigint,
    name: string,
    curatorProposalDuration: bigint,
    proposalDuration: bigint,
    configControllerFactory: `0x${string}`,
  ): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.initialize(
        owner,
        guardian,
        sandboxController,
        marketFactory,
        curatorFee,
        name,
        curatorProposalDuration,
        proposalDuration,
        configControllerFactory,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to initialize config controller.");
    }
  }

  async proposeCurator(
    curator: `0x${string}`,
  ): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.proposeCurator(
        curator,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to propose curator.");
    }
  }

  async proposeMarketCollateralTokens(
    market: `0x${string}`,
    collateralTokens: Parameters<
      ConfigControllerContract["proposeMarketCollateralTokens"]
    >[1],
  ): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.proposeMarketCollateralTokens(
        market,
        collateralTokens,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to propose market collateral tokens.");
    }
  }

  async proposeMarketTransfer(
    market: `0x${string}`,
    newController: `0x${string}`,
  ): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.proposeMarketTransfer(
        market,
        newController,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to propose market transfer.");
    }
  }

  async removeClaimRevenueToken(
    token: `0x${string}`,
  ): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.removeClaimRevenueToken(
        token,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to remove claim revenue token.");
    }
  }

  async removeCurator(): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.removeCurator(this.chainId);
    } catch {
      throw new Error("Failed to remove curator.");
    }
  }

  async setCuratorFee(fee: bigint): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.setCuratorFee(
        fee,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to set curator fee.");
    }
  }

  async setGuardian(
    newGuardian: `0x${string}`,
  ): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.setGuardian(
        newGuardian,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to set guardian.");
    }
  }

  async setProposalDurations(
    curatorProposalDuration: bigint,
    proposalDuration: bigint,
  ): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.setProposalDurations(
        curatorProposalDuration,
        proposalDuration,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to set proposal durations.");
    }
  }
}
