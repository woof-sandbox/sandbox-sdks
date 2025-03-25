import { type IMarketProposalTx, Market } from "@sandbox/comet-sdk";
import { Token } from "@sandbox/comet-sdk/src/token";
import type { Provider, Signer } from "ethers";
import { fetchBaseMock } from "./Base";
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
  const configControllerAddress = "0xd0E4A05a84ce039be8647cA8089266117a7E96C5";
  const ownerAddress = "0xd0E4A05a84ce039be8647cA8089266117a7E96C5";
  const guardianAddress = "0xd0E4A05a84ce039be8647cA8089266117a7E96C5";
  const curatorAddress = "0xd0E4A05a84ce039be8647cA8089266117a7E96C5";
  const feeDistribution = 10;
  const proposals: IMarketProposalTx[] = [];
  //
  const baseToken = await fetchBaseMock(cometProxyAddress, driver);
  const collaterals = await fetchCollateralsMocks(cometProxyAddress, driver);
  const comp = new Token({
    tokenAddress: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
    symbol: "COMP",
    decimals: 18,
    price: 42.59,
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
    feeDistribution,
    proposals,
    baseToken,
    collaterals,
    comp,
  });
}

export async function fetchMarket(
  cometProxyAddress: string,
  driver: Provider | Signer,
): Promise<Market> {
  /*const comet = new CometContract(cometProxyAddress, driver);
  const multicall = new MulticallContract(driver);

  const utilization = await comet.getUtilization();

  const borrowRateTag = "borrowRate";
  multicall.add(borrowRateTag, comet.getBorrowRateCall(utilization));

  const supplyRateTag = "supplyRate";
  multicall.add(supplyRateTag, comet.getSupplyRateCall(utilization));

  multicall.add(supplyRateTag, comet.getSupplyRateCall(utilization));

  const success: boolean = await multicall.run();

  let borrowRate: bigint | undefined;
  let supplyRate: bigint | undefined;
  if (success) {
    borrowRate = multicall.getSingle<bigint>(borrowRateTag);
    supplyRate = multicall.getSingle<bigint>(supplyRateTag);
  }

  const data = {
    cometAddress: cometProxyAddress,
    utilization,
    borrowRate,
    supplyRate,
    // TODO
  };*/

  return fetchMarketMock();
}
