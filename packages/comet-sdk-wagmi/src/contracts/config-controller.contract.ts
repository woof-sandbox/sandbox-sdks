import { WagmiChainId } from "../config/chains";
import { WagmiContract } from "./wagmi-contract";
import { wagmiConfig } from "./wagmiConfig";
import { configControllerAbi } from "../abis";
import type { Config, WriteContractReturnType } from "@wagmi/core";

export class ConfigControllerContract extends WagmiContract {
  constructor(
    address: `0x${string}`,
    chainId?: WagmiChainId,
    config: Config = wagmiConfig,
  ) {
    super(config, configControllerAbi, address, chainId);
  }

  ownerCall() {
    return this.getCall("owner");
  }

  guardianCall() {
    return this.getCall("guardian");
  }

  curatorCall() {
    return this.getCall("curator");
  }

  curatorFeeCall() {
    return this.getCall("curatorFee");
  }

  marketsLengthCall() {
    return this.getCall("marketsLength");
  }

  revenueTokensLengthCall() {
    return this.getCall("revenueTokensLength");
  }

  async acceptCuratorRole(
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("acceptCuratorRole", chainId);
  }

  async acceptMarketTransferProposal(
    market: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("acceptMarketTransferProposal", chainId, [market]);
  }

  async accumulateRevenue(
    token: `0x${string}`,
    amount: bigint,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("accumulateRevenue", chainId, [token, amount]);
  }

  async cancelCuratorProposal(
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("cancelCuratorProposal", chainId);
  }

  async cancelMarketConfigProposal(
    market: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("cancelMarketConfigProposal", chainId, [market]);
  }

  async cancelMarketTransferProposal(
    market: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("cancelMarketTransferProposal", chainId, [market]);
  }

  async claimAllRevenue(
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("claimAllRevenue", chainId);
  }

  async claimRevenue(
    token: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("claimRevenue", chainId, [token]);
  }

  async createMarket(
    marketConfig: {
      baseToken: `0x${string}`;
      priceFeed: `0x${string}`;
      collateraTokens: {
        collateralToken: `0x${string}`;
        priceFeed: `0x${string}`;
        borrowCollateralFactor: bigint;
        liquidateCollateralFactor: bigint;
        liquidationFactor: bigint;
        supplyCap: bigint;
      }[];
      baseTokenCurveId: bigint;
    },
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("createMarket", chainId, [marketConfig]);
  }

  async executeMarketConfigProposal(
    market: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("executeMarketConfigProposal", chainId, [market]);
  }

  async grantOwnership(
    newOwner: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("grantOwnership", chainId, [newOwner]);
  }

  async initialize(
    _owner: `0x${string}`,
    _guardian: `0x${string}`,
    _sandboxController: `0x${string}`,
    _marketFactory: `0x${string}`,
    _curatorFee: bigint,
    _name: string,
    _curatorProposalDuration: bigint,
    _proposalDuration: bigint,
    _configControllerFactory: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("initialize", chainId, [
      _owner,
      _guardian,
      _sandboxController,
      _marketFactory,
      _curatorFee,
      _name,
      _curatorProposalDuration,
      _proposalDuration,
      _configControllerFactory,
    ]);
  }

  async proposeCurator(
    proposedCurator: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("proposeCurator", chainId, [proposedCurator]);
  }

  async proposeMarketCollateralTokens(
    market: `0x${string}`,
    collateralTokens: {
      collateralToken: `0x${string}`;
      priceFeed: `0x${string}`;
      borrowCollateralFactor: bigint;
      liquidateCollateralFactor: bigint;
      liquidationFactor: bigint;
      supplyCap: bigint;
    }[],
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("proposeMarketCollateralTokens", chainId, [
      market,
      collateralTokens,
    ]);
  }

  async proposeMarketTransfer(
    market: `0x${string}`,
    newController: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("proposeMarketTransfer", chainId, [
      market,
      newController,
    ]);
  }

  async removeClaimRevenueToken(
    token: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("removeClaimRevenueToken", chainId, [token]);
  }

  async removeCurator(
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("removeCurator", chainId);
  }

  async setCuratorFee(
    fee: bigint,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("setCuratorFee", chainId, [fee]);
  }

  async setGuardian(
    newGuardian: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("setGuardian", chainId, [newGuardian]);
  }

  async setProposalDurations(
    curatorProposalDuration: bigint,
    proposalDuration: bigint,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("setProposalDurations", chainId, [
      curatorProposalDuration,
      proposalDuration,
    ]);
  }
}
