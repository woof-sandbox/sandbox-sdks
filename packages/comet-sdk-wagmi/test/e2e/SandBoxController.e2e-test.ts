import { SandboxController } from "../../src/augment";

import { arbitrum } from "@wagmi/core/chains";
import { beforeAll, describe, expect, test } from "vitest";

let controller: SandboxController;

describe("SandboxController", () => {
  beforeAll(async () => {
    controller = await SandboxController.fetch(
      "0x23eEF61AB548a8852117561689886f583FC0E2B7",
      arbitrum.id,
    );
  });

  test("check controller method", async () => {
    const minUpdateTime = Number(controller.minUpdateTime);
    expect(minUpdateTime).to.be.greaterThan(0);
  });
});
