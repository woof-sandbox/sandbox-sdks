import { User } from "@sandbox/comet-sdk";
import { fetchUserMock, getUserActiveMarkets } from "../fetch";

declare module "@sandbox/comet-sdk" {
  namespace User {
    let fetchMock: typeof fetchUserMock;
    let getActiveMarkets: typeof getUserActiveMarkets;
  }
}

User.fetchMock = fetchUserMock;
User.getActiveMarkets = getUserActiveMarkets;

export { User };
