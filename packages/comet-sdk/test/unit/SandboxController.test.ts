import { describe, it, expect } from "vitest";
import { SandboxController } from "../../src/sandbox-controller/SandboxController";
import {Address} from "viem";
import type {ISandboxController} from "../../src";

describe("SandboxController", () => {
  it("should assign all properties from constructor", () => {
    const data: ISandboxController = {
      address: "0xSandbox" as Address,
      daoAddress: "0xDao" as Address,
      multisigAddress: "0xMulti" as Address,
      suggestedAmountOfSeedReserves: 100n,
      suggestedLockTimeOfSeedReserves: 200n,
      minUpdateTime: 300n,
      feeEnabled: true,
      treasuryAddress: "0xTreasury",
      baseWhitelist: [],
      collateralsWhitelist: [],
      storeFrontPriceFactor: 42,
    };
    const controller = new SandboxController(data);
    expect(controller.address).toBe(data.address);
    expect(controller.daoAddress).toBe(data.daoAddress);
    expect(controller.multisigAddress).toBe(data.multisigAddress);
    expect(controller.suggestedAmountOfSeedReserves).toBe(data.suggestedAmountOfSeedReserves);
    expect(controller.suggestedLockTimeOfSeedReserves).toBe(data.suggestedLockTimeOfSeedReserves);
    expect(controller.minUpdateTime).toBe(data.minUpdateTime);
    expect(controller.feeEnabled).toBe(data.feeEnabled);
    expect(controller.treasuryAddress).toBe(data.treasuryAddress);
    expect(controller.baseWhitelist).toBe(data.baseWhitelist);
    expect(controller.collateralsWhitelist).toBe(data.collateralsWhitelist);
    expect(controller.storeFrontPriceFactor).toBe(data.storeFrontPriceFactor);
  });
});