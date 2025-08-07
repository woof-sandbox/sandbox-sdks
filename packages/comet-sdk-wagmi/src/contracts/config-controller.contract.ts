import type { Config, WriteContractReturnType } from "@wagmi/core";
import type { Address, ContractFunctionParameters } from "viem";
import { configControllerAbi } from "../abis";
import type { WagmiChainId } from "../config";
import { WagmiContract } from "./wagmi-contract";
import { wagmiConfig } from "./wagmiConfig";

export class ConfigControllerContract extends WagmiContract {
  constructor(
    address: Address,
    chainId?: WagmiChainId,
    config: Config = wagmiConfig,
  ) {
    super(config, configControllerAbi, address, chainId);
  }

  getOwnerCall(): ContractFunctionParameters {
    return this.getCall("owner");
  }

  getGuardianCall(): ContractFunctionParameters {
    return this.getCall("guardian");
  }

  getCuratorCall(): ContractFunctionParameters {
    return this.getCall("curator");
  }

  getCuratorFeeCall(): ContractFunctionParameters {
    return this.getCall("curatorFee");
  }

  getMarketsLengthCall(): ContractFunctionParameters {
    return this.getCall("marketsLength");
  }

  getRevenueTokensLengthCall(): ContractFunctionParameters {
    return this.getCall("revenueTokensLength");
  }

  async acceptCuratorRole(
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("acceptCuratorRole", chainId);
  }

  async acceptMarketTransferProposal(
    market: Address,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("acceptMarketTransferProposal", chainId, [market]);
  }

  async accumulateRevenue(
    token: Address,
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
    market: Address,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("cancelMarketConfigProposal", chainId, [market]);
  }

  async cancelMarketTransferProposal(
    market: Address,
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
    token: Address,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("claimRevenue", chainId, [token]);
  }

  async createMarket(
    marketConfig: {
      baseToken: Address;
      priceFeed: Address;
      collateralTokens: {
        collateralToken: Address;
        priceFeed: Address;
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
    market: Address,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("executeMarketConfigProposal", chainId, [market]);
  }

  async grantOwnership(
    newOwner: Address,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("grantOwnership", chainId, [newOwner]);
  }

  async initialize(
    _owner: Address,
    _guardian: Address,
    _sandboxController: Address,
    _marketFactory: Address,
    _curatorFee: bigint,
    _name: string,
    _curatorProposalDuration: bigint,
    _proposalDuration: bigint,
    _configControllerFactory: Address,
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
    proposedCurator: Address,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("proposeCurator", chainId, [proposedCurator]);
  }

  async proposeMarketCollateralTokens(
    market: Address,
    collateralTokens: {
      collateralToken: Address;
      priceFeed: Address;
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
    market: Address,
    newController: Address,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("proposeMarketTransfer", chainId, [
      market,
      newController,
    ]);
  }

  async removeClaimRevenueToken(
    token: Address,
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
    newGuardian: Address,
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
