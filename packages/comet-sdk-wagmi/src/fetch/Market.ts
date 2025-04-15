import { type IMarketProposalTx, Market, Token } from "@sandbox/comet-sdk";
import {
  MulticallUnit,
  type Tagable,
} from "@sandbox/contracts-tools-sdk-ethers";
import type { Provider, Signer } from "ethers";
import { CometContract, Erc20Contract } from "../contracts";
import { MULTICALL_ERRORS } from "../errors/multicall";
import { fetchBase, fetchBaseMock } from "./Base";
import { fetchCollateralsMocks } from "./Collateral";

export async function fetchMarketMock(
  cometProxyAddress?: string,
  driver?: Provider | Signer,
): Promise<Market> {
  // USDt comet
  const cometAddress = "0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840";
  const utilization = 622155096290286592n;
  const supplyRate = 1065334068n;
  const borrowRate = 1462067313n;
  //
  const totalBorrow = 115139196488456n;
  const totalSupply = 185064689883219n;
  const totalReserves = 1368714199302n;
  const availableLiquidity = 71294244719270n;
  // TODO: fulfill this block after adding new functionality to contracts
  const configControllerAddress = "0x0000000000000000000000000000000000000000";
  const ownerAddress = "0x0000000000000000000000000000000000000000";
  const guardianAddress = "0x0000000000000000000000000000000000000000";
  const curatorAddress = "0x0000000000000000000000000000000000000000";
  const feeDistribution = 10;
  const proposals: IMarketProposalTx[] = [];
  //
  const baseToken = await fetchBaseMock(cometProxyAddress, driver);
  const collaterals = await fetchCollateralsMocks(cometProxyAddress, driver);
  const comp = new Token({
    tokenAddress: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
    symbol: "COMP",
    decimals: 18n,
    price: "42.59",
    priceFeedAddress: "0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5",
  });
  //
  return new Market({
    cometAddress,
    utilization,
    supplyRate,
    borrowRate,
    totalBorrow,
    totalSupply,
    totalReserves,
    availableLiquidity,
    configControllerAddress,
    ownerAddress,
    guardianAddress,
    curatorAddress,
    curatorFee: feeDistribution,
    proposals,
    baseToken,
    collaterals,
    compToken: comp,
    rewardTokens: [], // todo: fullfill
  });
}

export async function fetchMarket(
  cometProxyAddress: string,
  driver: Provider | Signer,
): Promise<Market> {
  const comet = new CometContract(cometProxyAddress, driver);
  const multicall = new MulticallUnit(driver);

  const utilization = await comet.getUtilization();

  const borrowRateTag = multicall.add(
    comet.getBorrowRateCall(utilization),
    "borrowRate",
  );
  const supplyRateTag = multicall.add(
    comet.getSupplyRateCall(utilization),
    "supplyRate",
  );
  //
  const totalBorrowTag = multicall.add(
    comet.getTotalBorrowCall(),
    "totalBorrow",
  );
  const totalSupplyTag = multicall.add(
    comet.getTotalSupplyCall(),
    "totalSupply",
  );
  const totalReservesTag = multicall.add(
    comet.getReservesCall(),
    "totalReserves",
  );
  //
  const baseToken = await fetchBase(cometProxyAddress, driver);
  const baseContract = new Erc20Contract(baseToken.tokenAddress, driver);
  const availableLiquidityTag = multicall.add(
    baseContract.getBalanceOfCall(cometProxyAddress),
    "availableLiquidity",
  );

  await multicall.run();

  const borrowRate = multicall.getSingle<bigint>(borrowRateTag);
  if (borrowRate === null)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(borrowRateTag as Tagable);
  const supplyRate = multicall.getSingle<bigint>(supplyRateTag);
  if (supplyRate === null)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(supplyRateTag as Tagable);
  const totalBorrow = multicall.getSingle<bigint>(totalBorrowTag);
  if (totalBorrow === null)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(totalBorrowTag as Tagable);
  const totalSupply = multicall.getSingle<bigint>(totalSupplyTag);
  if (totalSupply === null)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(totalSupplyTag as Tagable);
  const totalReserves = multicall.getSingle<bigint>(totalReservesTag);
  if (totalReserves === null)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(totalReservesTag as Tagable);
  const availableLiquidity = multicall.getSingle<bigint>(availableLiquidityTag);
  if (availableLiquidity === null)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(availableLiquidityTag as Tagable);

  const collaterals = await fetchCollateralsMocks(cometProxyAddress, driver);

  return new Market({
    cometAddress: cometProxyAddress,
    utilization,
    supplyRate,
    borrowRate,
    //
    totalBorrow,
    totalSupply,
    totalReserves,
    baseToken,
    collaterals,
    availableLiquidity,
    // TODO: update after contracts
    configControllerAddress: "0x0000000000000000000000000000000000000000", // TODO
    ownerAddress: "0x0000000000000000000000000000000000000000", // TODO
    guardianAddress: "0x0000000000000000000000000000000000000000", // TODO
    curatorAddress: "0x0000000000000000000000000000000000000000", // TODO
    curatorFee: 0, // TODO
    //
    proposals: [], // TODO
    //
    compToken: await fetchBaseMock(), // TODO
    rewardTokens: [], // TODO
  });
}
