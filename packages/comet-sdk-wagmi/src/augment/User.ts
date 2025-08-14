import { User } from "@woof-software/comet-sdk";
import { fetchUserActiveMarkets, fetchUserMock, fetchUser } from "../fetch";

declare module "@woof-software/comet-sdk" {
  namespace User {
    let fetchMock: typeof fetchUserMock;
    let fetch: typeof fetchUser;
    let fetchActiveMarkets: typeof fetchUserActiveMarkets;
  }
}

User.fetchMock = fetchUserMock;
User.fetch = fetchUser;
User.fetchActiveMarkets = fetchUserActiveMarkets;

export { User };
