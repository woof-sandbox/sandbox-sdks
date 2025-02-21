import { type JsonRpcProvider, Wallet, ethers } from "ethers";
import { CometContract, MulticallContract } from "../../contracts";
import { SERVICES_ERRORS } from "../../errors/services";

export class BorrowingService {
  private readonly provider: JsonRpcProvider;
  private readonly signer?: Wallet;

  constructor(rpcUrl: string, privateKey?: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    if (privateKey) {
      this.signer = new Wallet(privateKey, this.provider);
    }
  }

  getDriver(): JsonRpcProvider | Wallet {
    return this.signer || this.provider;
  }

  getSigner(): Wallet {
    if (!this.signer) {
      throw SERVICES_ERRORS.SIGNER_IS_NOT_PROVIDED;
    }
    return this.signer;
  }

  async getAvailableBorrowAmount(
    cometAddress: string,
    userAddress: string,
  ): Promise<bigint> {
    const comet = new CometContract(cometAddress);
    const multicall = new MulticallContract(this.getDriver());

    const borrowBalanceTag = "borrowBalance";
    const collateralBalanceOfTag = "collateralBalanceOf";
    const getLiquidationFactorTag = "getLiquidationFactor";
    multicall.add(borrowBalanceTag, comet.getBorrowBalanceOfCall(userAddress));
    multicall.add(
      collateralBalanceOfTag,
      comet.getCollateralBalanceOfCall(userAddress),
    );
    multicall.add(getLiquidationFactorTag, comet.getLiquidationFactorCall());

    await multicall.run();

    const borrowBalance = multicall.getSingle<bigint>(borrowBalanceTag);
    const collateralBalance = multicall.getSingle<bigint>(collateralBalanceOfTag);
    const liquidationFactor = multicall.getSingle<bigint>(getLiquidationFactorTag);
    if (!borrowBalance || !collateralBalance || !liquidationFactor) {
        throw SERVICES_ERRORS.CALL_WAS_UNSUCCESSFUL;
    }

    const maxBorrowCapacity =
      (collateralBalance * liquidationFactor) / BigInt(1e18);
    const availableToBorrow = maxBorrowCapacity - borrowBalance;

    return availableToBorrow > BigInt(0) ? availableToBorrow : BigInt(0);
  }

  async isBorrowAllowed(
    cometAddress: string,
    userAddress: string,
    bulkerAddress: string,
  ): Promise<boolean> {
    const comet = new CometContract(cometAddress, this.provider);
    return comet.isAllowed(userAddress, bulkerAddress);
  }

  async allowBorrow(
    cometAddress: string,
    bulkerAddress: string,
  ): Promise<ethers.TransactionResponse> {
    const comet = new CometContract(cometAddress, this.getSigner());
    return comet.allow(bulkerAddress, true);
  }
}
