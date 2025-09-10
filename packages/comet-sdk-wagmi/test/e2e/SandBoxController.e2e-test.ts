import { SandboxController } from "../../src/augment";

import { sepolia } from "@wagmi/core/chains";
import { beforeAll, describe, expect, test } from "vitest";

let controller: SandboxController;

describe("SandboxController", () => {
  beforeAll(async () => {
    controller = await SandboxController.fetch(
      "0x989c545362a6ad8534f91b970cf2ac5d97fa8dff",
      sepolia.id,
    );
  });

  test("check controller method", async () => {
    const minUpdateTime = Number(controller.minUpdateTime);
    expect(minUpdateTime).to.be.greaterThan(0);
  });
});
