import { User } from "@sandbox/comet-sdk";
import { fetchUserMock } from "../fetch";

declare module "@sandbox/comet-sdk" {
  namespace User {
    let fetchMock: typeof fetchUserMock;
  }
}

User.fetchMock = fetchUserMock;

export { User };
