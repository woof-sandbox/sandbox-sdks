import { describe, expect, it } from "vitest";
import { User } from "../../src/user/User";

describe("User", () => {
  it("should assign all properties from constructor", () => {
    const userData = {
      address: "0xUser",
      borrowMarkets: ["0xMarket1", "0xMarket2"],
      lendMarkets: ["0xMarket3"],
    };
    const user = new User(userData);
    expect(user.address).toBe(userData.address);
    expect(user.borrowMarkets).toEqual(userData.borrowMarkets);
    expect(user.lendMarkets).toEqual(userData.lendMarkets);
  });
});
