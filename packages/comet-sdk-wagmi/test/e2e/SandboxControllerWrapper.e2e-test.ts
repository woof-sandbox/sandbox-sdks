import { SandboxController } from "@woof-software/comet-sdk";
import { sepolia } from "@wagmi/core/chains";
import { beforeAll, describe, test } from "vitest";
import { SandboxControllerWrapper } from "../../src/wrappers/SandboxControllerWrapper";

let controller: SandboxControllerWrapper;

const controllerAddress = "0x989c545362a6ad8534f91b970cf2ac5d97fa8dff";
const token = "0x306134121e8b55dfa9faba05de590e639a1f7d6b";

describe("SandboxControllerWrapper", () => {
  beforeAll(async () => {
    const sandBoxController = await SandboxController.fetch(
      controllerAddress,
      sepolia.id,
    );
    controller = new SandboxControllerWrapper(sandBoxController, sepolia.id);
  });

  test("addBaseAssetCurve", async () => {
    const addBaseAssetCurve = controller.addBaseAssetCurve(token, {
      id: "1",
      supplyKink: BigInt(0),
      borrowKink: BigInt(0),
      borrowPerYearInterestRateBase: BigInt(0),
      borrowPerYearInterestRateSlopeLow: BigInt(0),
      supplyPerYearInterestRateBase: BigInt(0),
      supplyPerYearInterestRateSlopeHigh: BigInt(0),
      supplyPerYearInterestRateSlopeLow: BigInt(0),
      borrowPerYearInterestRateSlopeHigh: BigInt(0),
    });
    console.log("--addBaseAssetCurve-", addBaseAssetCurve);
  });

  test("changeBaseAssetCurve", async () => {
    const changeBaseAssetCurve = controller.changeBaseAssetCurve(
      token,
      BigInt(1),
      {
        id: "1",
        supplyKink: BigInt(0),
        borrowKink: BigInt(0),
        borrowPerYearInterestRateBase: BigInt(0),
        borrowPerYearInterestRateSlopeLow: BigInt(0),
        supplyPerYearInterestRateBase: BigInt(0),
        supplyPerYearInterestRateSlopeHigh: BigInt(0),
        supplyPerYearInterestRateSlopeLow: BigInt(0),
        borrowPerYearInterestRateSlopeHigh: BigInt(0),
      },
    );
    console.log("--changeBaseAssetCurve-", changeBaseAssetCurve);
  });
});
