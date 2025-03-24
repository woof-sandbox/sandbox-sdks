import { User } from "@sandbox/comet-sdk";
import type { Provider, Signer } from "ethers";

export async function fetchUserMock(
  userAddress?: string,
  driver?: Provider | Signer,
): Promise<User> {
  const address = userAddress || "0xd0E4A05a84ce039be8647cA8089266117a7E96C5";
  const borrowMarkets = ["0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840"]; // USDt comet
  const landMarkets = ["0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840"];

  return new User({
    address,
    borrowMarkets,
    landMarkets,
  });
}
