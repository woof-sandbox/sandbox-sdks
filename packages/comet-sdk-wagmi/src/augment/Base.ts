import { Base } from "@woof-software/comet-sdk";
import { fetchBase, fetchBaseMock } from "../fetch";

declare module "@woof-software/comet-sdk" {
  namespace Base {
    let fetchMock: typeof fetchBaseMock;
    let fetch: typeof fetchBase;
  }
}

Base.fetchMock = fetchBaseMock;
Base.fetch = fetchBase;

export { Base };
