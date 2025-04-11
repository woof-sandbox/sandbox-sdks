import { type IMarketProposalTx, Market, Token } from "@sandbox/comet-sdk";
import { MulticallContract } from "@sandbox/contracts-tools-sdk-ethers";
import type { Provider, Signer } from "ethers";
import { CometContract, Erc20Contract } from "../contracts";
import { MULTICALL_ERRORS } from "../errors/multicall";
import { fetchBase, fetchBaseMock } from "./Base";
import { fetchCollaterals, fetchCollateralsMocks } from "./Collateral";

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
  const curatorFee = 10n;
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
    curatorFee,
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
  const multicall = new MulticallContract(driver);

  const utilization = await comet.getUtilization();

  const borrowRateTag = multicall.add(
    "borrowRate",
    comet.getBorrowRateCall(utilization),
  );
  const supplyRateTag = multicall.add(
    "supplyRate",
    comet.getSupplyRateCall(utilization),
  );
  //
  const totalBorrowTag = multicall.add(
    "totalBorrow",
    comet.getTotalBorrowCall(),
  );
  const totalSupplyTag = multicall.add(
    "totalSupply",
    comet.getTotalSupplyCall(),
  );
  const totalReservesTag = multicall.add(
    "totalReserves",
    comet.getTotalReservesCall(),
  );
  //
  const baseToken = await fetchBase(cometProxyAddress, driver);
  const baseContract = new Erc20Contract(baseToken.tokenAddress, driver);
  const availableLiquidityTag = multicall.add(
    "availableLiquidity",
    baseContract.getBalanceOfCall(cometProxyAddress),
  );

  await multicall.run();

  const borrowRate = multicall.getSingle<bigint>(borrowRateTag);
  if (!borrowRate) throw MULTICALL_ERRORS.RESULT_NOT_FOUND(borrowRateTag);
  const supplyRate = multicall.getSingle<bigint>(supplyRateTag);
  if (!supplyRate) throw MULTICALL_ERRORS.RESULT_NOT_FOUND(supplyRateTag);
  const totalBorrow = multicall.getSingle<bigint>(totalBorrowTag);
  if (!totalBorrow) throw MULTICALL_ERRORS.RESULT_NOT_FOUND(totalBorrowTag);
  const totalSupply = multicall.getSingle<bigint>(totalSupplyTag);
  if (!totalSupply) throw MULTICALL_ERRORS.RESULT_NOT_FOUND(totalSupplyTag);
  const totalReserves = multicall.getSingle<bigint>(totalReservesTag);
  if (!totalReserves) throw MULTICALL_ERRORS.RESULT_NOT_FOUND(totalReservesTag);
  const availableLiquidity = multicall.getSingle<bigint>(availableLiquidityTag);
  if (!availableLiquidity)
    throw MULTICALL_ERRORS.RESULT_NOT_FOUND(availableLiquidityTag);

  const collaterals = await fetchCollaterals(cometProxyAddress, driver);

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
    curatorFee: 0n, // TODO
    //
    proposals: [], // TODO
    //
    compToken: await fetchBaseMock(), // TODO
    rewardTokens: [], // TODO
  });
}
