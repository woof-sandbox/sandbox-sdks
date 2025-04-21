import { beforeAll, describe, expect, test } from "vitest";
import { Chain } from "../../src/config/chains";
import { ConfigControllerWrapper } from "../../src/wrapper/ConfigControllerWrapper";

const configController = "0xDF539a3B60172779Be6cBa11B26bBE0913b5316A";
let configC: ConfigControllerWrapper;

describe("Configurato Contract", () => {
  beforeAll(async () => {
    configC = await ConfigControllerWrapper.fetch(
      configController,
      Chain.Sepolia,
    );
  });

  test("curator", async () => {
    const curator = await configC.curator;
    expect(curator).to.be.an("string");
    // expect(conf).to.be.an("object");
  });

  test("curator", async () => {
    const curator = await configC.acceptCuratorRole();
    expect(curator).to.be.an("string");
    // expect(conf).to.be.an("object");
  });
});
