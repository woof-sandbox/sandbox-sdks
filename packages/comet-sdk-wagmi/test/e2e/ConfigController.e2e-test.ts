import { beforeAll, describe, expect, test } from "vitest";
import { wagmiConfig } from "../../src";
import { ConfigController } from "../../src/augment/ConfigController";
import { Chain } from "../../src/config/chains";
import { SepoliaConfig } from "../sepolia.config";

const configController = SepoliaConfig.configControllerImplementation;
let configC: ConfigController;

describe("Configurato Contract", () => {
  beforeAll(async () => {
    configC = await ConfigController.fetch(
      configController,
      Chain.Sepolia,
      wagmiConfig,
    );
  });

  test("curator", async () => {
    const curator = configC.curator;
    expect(curator).to.be.an("string");
    expect(configC).to.be.an("object");
  });
});
