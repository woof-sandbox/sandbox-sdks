import { beforeAll, describe, expect, test } from "vitest";
import { Chain } from "../../src/config/chains";
import { ConfiguratorContract } from "../../src/contracts/configurator.contract";

const usdtComet = "0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840";
let configurator: ConfiguratorContract;

describe("Configurato Contract", () => {
  beforeAll(async () => {
    configurator = new ConfiguratorContract(
      "0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3",
      Chain.Ethereum,
    );
  });

  test("should get configuration", async () => {
    const conf = await configurator.getConfiguration(usdtComet);
    expect(conf).to.be.an("object");
  });
});
