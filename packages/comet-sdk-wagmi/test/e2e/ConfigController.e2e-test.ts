import { beforeAll, describe, expect, test } from "vitest";
import { wagmiConfig } from "../../src";
import { ConfigController } from "../../src/augment/ConfigController";
import { Chain } from "../../src/config/chains";

const configController = "0x989c545362a6ad8534f91b970cf2ac5d97fa8dff";
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
    // expect(conf).to.be.an("object");
  });

  // test("curator", async () => {
  //   const curator = await configC.acceptCuratorRole();
  //   expect(curator).to.be.an("string");
  //   // expect(conf).to.be.an("object");
  // });
});
