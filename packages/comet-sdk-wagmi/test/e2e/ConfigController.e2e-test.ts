import { beforeAll, describe, expect, test } from "vitest";
import { ConfigController } from "../../src/augment/ConfigController";
import { Chain } from "../../src/config/chains";
import {wagmiConfig} from "../../src";

const configController = "0xDF539a3B60172779Be6cBa11B26bBE0913b5316A";
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
