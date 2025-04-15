import { Market } from "@sandbox/comet-sdk";
import { fetchMarket, fetchMarketMock } from "../fetch";

declare module "@sandbox/comet-sdk" {
  namespace Market {
    let fetch: typeof fetchMarket;
    let fetchMock: typeof fetchMarketMock;
  }
}

Market.fetch = fetchMarket;
Market.fetchMock = fetchMarketMock;

export { Market };
