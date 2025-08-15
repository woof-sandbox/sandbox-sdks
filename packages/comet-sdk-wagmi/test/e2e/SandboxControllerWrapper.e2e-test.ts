import { sepolia } from "@wagmi/core/chains";
import { beforeAll, describe, expect, test } from "vitest";
import { SandboxController } from "../../src/augment";
import { SandboxControllerWrapper } from "../../src/wrappers/SandboxControllerWrapper";
import { sepoliaAddressConfig } from "../address-e2e.config";

let controller: SandboxControllerWrapper;

const controllerAddress = sepoliaAddressConfig.sandboxController;
const token = sepoliaAddressConfig.TokenAddresses.usdc;

describe("SandboxControllerWrapper", () => {
  beforeAll(async () => {
    const sandBoxController = await SandboxController.fetch(
      controllerAddress,
      sepolia.id,
    );
    controller = new SandboxControllerWrapper(sandBoxController, sepolia.id);
  });

  test("check controller method", async () => {
    expect(controller.minUpdateTime).to.be.greaterThan(0);
  });

  // test("changeBaseAssetCurve", async () => {
  //   const changeBaseAssetCurve = controller.changeBaseAssetCurve(
  //     token,
  //     BigInt(1),
  //     {
  //       supplyKink: BigInt(0),
  //       borrowKink: BigInt(0),
  //       borrowPerYearInterestRateBase: BigInt(0),
  //       borrowPerYearInterestRateSlopeLow: BigInt(0),
  //       supplyPerYearInterestRateBase: BigInt(0),
  //       supplyPerYearInterestRateSlopeHigh: BigInt(0),
  //       supplyPerYearInterestRateSlopeLow: BigInt(0),
  //       borrowPerYearInterestRateSlopeHigh: BigInt(0),
  //     },
  //   );
  //   console.log("--changeBaseAssetCurve-", changeBaseAssetCurve);
  // });
});
