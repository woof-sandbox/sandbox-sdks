import { Base } from "@sandbox/comet-sdk";
import { fetchBaseMock } from "../fetch";

declare module "@sandbox/comet-sdk" {
  namespace Base {
    let fetchMock: typeof fetchBaseMock;
  }
}

Base.fetchMock = fetchBaseMock;

export { Base };
