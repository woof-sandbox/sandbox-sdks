import type { Config, WriteContractReturnType } from "@wagmi/core";
import { ConfigController } from "@woof-software/comet-sdk";
import type { Address } from "viem";
import type { WagmiChainId } from "../config";
import { ConfigControllerContract } from "../contracts";
import {
  ACCEPT_CURATOR_ROLE_FAILED,
  CANCEL_CURATOR_PROPOSAL_FAILED,
  CLAIM_REVENUE_FAILED,
  CONFIG_INITIALIZATION_FAILED,
  GRANT_OWNERSHIP_FAILED,
  PROPOSE_CURATOR_FAILED,
  REMOVE_CURATOR_FAILED,
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

  async cancelCuratorProposal(): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.cancelCuratorProposal(
        this.chainId,
      );
    } catch {
      throw CANCEL_CURATOR_PROPOSAL_FAILED();
    }
  }

  async claimRevenue(token: Address): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.claimRevenue(
        token,
        this.chainId,
      );
    } catch {
      throw CLAIM_REVENUE_FAILED();
    }
  }

  async grantOwnership(newOwner: Address): Promise<WriteContractReturnType> {
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
    owner: Address,
    guardian: Address,
    sandboxController: Address,
    marketFactory: Address,
    curatorFee: bigint,
    name: string,
    curatorProposalDuration: bigint,
    proposalDuration: bigint,
    configControllerFactory: Address,
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

  async proposeCurator(curator: Address): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.proposeCurator(
        curator,
        this.chainId,
      );
    } catch {
      throw PROPOSE_CURATOR_FAILED();
    }
  }

  async removeCurator(): Promise<WriteContractReturnType> {
    try {
      return await this.configControllerContract.removeCurator(this.chainId);
    } catch {
      throw REMOVE_CURATOR_FAILED();
    }
  }

  async setGuardian(newGuardian: Address): Promise<WriteContractReturnType> {
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
