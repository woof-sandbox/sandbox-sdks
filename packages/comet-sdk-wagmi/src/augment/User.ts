import { User } from "@sandbox/comet-sdk";
import { fetchUserActiveMarkets, fetchUserMock } from "../fetch";

declare module "@sandbox/comet-sdk" {
  namespace User {
    let fetchMock: typeof fetchUserMock;
    let fetchActiveMarkets: typeof fetchUserActiveMarkets;
  }
}

User.fetchMock = fetchUserMock;
User.fetchActiveMarkets = fetchUserActiveMarkets;

export { User };
