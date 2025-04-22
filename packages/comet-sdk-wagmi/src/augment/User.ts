import { User } from "@woof-software/comet-sdk";
import { fetchUserActiveMarkets, fetchUserMock } from "../fetch";

declare module "@woof-software/comet-sdk" {
  namespace User {
    let fetchMock: typeof fetchUserMock;
    let fetchActiveMarkets: typeof fetchUserActiveMarkets;
  }
}

User.fetchMock = fetchUserMock;
User.fetchActiveMarkets = fetchUserActiveMarkets;

export { User };
