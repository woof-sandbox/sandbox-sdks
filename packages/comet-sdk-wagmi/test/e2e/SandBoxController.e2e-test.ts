import { SandboxController } from "../../src/augment";

import { sepolia } from "@wagmi/core/chains";
import { beforeAll, describe, expect, test } from "vitest";
import { sepoliaAddressConfig } from "../address-e2e.config";
import { isAddress } from "viem";

let controller: SandboxController;

describe("SandboxController", () => {
  beforeAll(async () => {
    controller = await SandboxController.fetch(
        sepoliaAddressConfig.sandboxController,
        sepolia.id,
    );
  });

  test("check controller method", async () => {
    const minUpdateTime = Number(controller.minUpdateTime);
    expect(minUpdateTime).to.be.greaterThan(0);
  });

  test("should contain daoAddress", () => {
    expect(controller.daoAddress, "daoAddress is missing").to.be.a("string");
    expect(isAddress(controller.daoAddress), "daoAddress is not valid").to.be.true;
  });

  test("should contain multisigAddress", () => {
    expect(controller.multisigAddress, "multisigAddress is missing").to.be.a("string");
    expect(isAddress(controller.multisigAddress), "multisigAddress is not valid").to.be.true;
  });

  test("should contain treasuryAddress", () => {
    expect(controller.treasuryAddress, "treasuryAddress is missing").to.be.a("string");
    expect(isAddress(controller.treasuryAddress), "treasuryAddress is not valid").to.be.true;
  });
});
