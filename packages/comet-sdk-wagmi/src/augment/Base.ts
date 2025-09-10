import { Base } from "@woof-software/comet-sdk";
import { fetchBaseMock } from "../fetch";

declare module "@woof-software/comet-sdk" {
  namespace Base {
    let fetchMock: typeof fetchBaseMock;
  }
}

Base.fetchMock = fetchBaseMock;

export { Base };
