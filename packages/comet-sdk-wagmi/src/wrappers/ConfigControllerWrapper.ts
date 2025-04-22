import type { Config, WriteContractReturnType } from "@wagmi/core";
import { ConfigController } from "@woof-software/comet-sdk";
import type { WagmiChainId } from "../config";
import { ConfigControllerContract } from "../contracts";
import {
  ACCEPT_CURATOR_ROLE_FAILED,
  ACCEPT_MARKET_TRANSFER_FAILED,
  ACCUMULATE_REVENUE_FAILED,
  CANCEL_CURATOR_PROPOSAL_FAILED,
  CANCEL_MARKET_CONFIG_PROPOSAL_FAILED,
  CANCEL_MARKET_TRANSFER_PROPOSAL_FAILED,
  CLAIM_ALL_REVENUE_FAILED,
  CLAIM_REVENUE_FAILED,
  CONFIG_INITIALIZATION_FAILED,
  CREATE_MARKET_FAILED,
  EXECUTE_MARKET_CONFIG_PROPOSAL_FAILED,
  GRANT_OWNERSHIP_FAILED,
  PROPOSE_CURATOR_FAILED,
  PROPOSE_MARKET_COLLATERAL_FAILED,
  PROPOSE_MARKET_TRANSFER_FAILED,
  REMOVE_CLAIM_REVENUE_TOKEN_FAILED,
  REMOVE_CURATOR_FAILED,
  SET_CURATOR_FEE_FAILED,
  SET_GUARDIAN_FAILED,
  SET_PROPOSAL_DURATIONS_FAILED,
} from "../errors/wrappers/config-controller-wrapper.errors";

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
      throw ACCEPT_CURATOR_ROLE_FAILED();
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
      throw ACCEPT_MARKET_TRANSFER_FAILED();
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
      throw ACCUMULATE_REVENUE_FAILED();
    }
  }

  async cancelCuratorProposal(): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.cancelCuratorProposal(
        this.chainId,
      );
    } catch {
      throw CANCEL_CURATOR_PROPOSAL_FAILED();
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
      throw CANCEL_MARKET_CONFIG_PROPOSAL_FAILED();
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
      throw CANCEL_MARKET_TRANSFER_PROPOSAL_FAILED();
    }
  }

  async claimAllRevenue(): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.claimAllRevenue(this.chainId);
    } catch {
      throw CLAIM_ALL_REVENUE_FAILED();
    }
  }

  async claimRevenue(token: `0x${string}`): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.claimRevenue(
        token,
        this.chainId,
      );
    } catch {
      throw CLAIM_REVENUE_FAILED();
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
      throw CREATE_MARKET_FAILED();
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
      throw EXECUTE_MARKET_CONFIG_PROPOSAL_FAILED();
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
      throw GRANT_OWNERSHIP_FAILED();
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
      throw CONFIG_INITIALIZATION_FAILED();
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
      throw PROPOSE_CURATOR_FAILED();
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
      throw PROPOSE_MARKET_COLLATERAL_FAILED();
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
      throw PROPOSE_MARKET_TRANSFER_FAILED();
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
      throw REMOVE_CLAIM_REVENUE_TOKEN_FAILED();
    }
  }

  async removeCurator(): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.removeCurator(this.chainId);
    } catch {
      throw REMOVE_CURATOR_FAILED();
    }
  }

  async setCuratorFee(fee: bigint): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.setCuratorFee(
        fee,
        this.chainId,
      );
    } catch {
      throw SET_CURATOR_FEE_FAILED();
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
      throw SET_GUARDIAN_FAILED();
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
      throw SET_PROPOSAL_DURATIONS_FAILED();
    }
  }
}
