import { describe, expect, it } from "vitest";
import {
  ConfigController,
  type IConfigController,
} from "../../src/config-controller";

describe("ConfigController", () => {
  it("should assign all properties from constructor", () => {
    const data: IConfigController = {
      address: "0xConfig",
      owner: "0xOwner",
      guardian: "0xGuardian",
      curator: "0xCurator",
      curatorFee: 10,
    };
    const controller = new ConfigController(data);
    expect(controller.address).toBe(data.address);
    expect(controller.owner).toBe(data.owner);
    expect(controller.guardian).toBe(data.guardian);
    expect(controller.curator).toBe(data.curator);
    expect(controller.curatorFee).toBe(data.curatorFee);
  });
});
