import { SandboxController } from "@sandbox/comet-sdk";

import { arbitrum } from "@wagmi/core/chains";
import { beforeAll, describe, test } from "vitest";
import { SandboxControllerWrapper } from "../../src/wrapper/SandboxControllerWrapper";

let controller: SandboxControllerWrapper;

const controllerAddress = "0x23eEF61AB548a8852117561689886f583FC0E2B7";
const token = "0x23eEF61AB548a8852117561689886f583FC0E2B7";

describe("SandboxControllerWrapper", () => {
  beforeAll(async () => {
    const sandBoxController = await SandboxController.fetch(
      controllerAddress,
      arbitrum.id,
    );
    controller = new SandboxControllerWrapper(sandBoxController, arbitrum.id);
  });

  test("addBaseAssetCurve", async () => {
    const addBaseAssetCurve = controller.addBaseAssetCurve(token, {
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
