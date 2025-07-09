import { Market } from "@woof-software/comet-sdk";
import {
  fetchMarket as fetchMarketF,
  fetchMarketMock as fetchMarketMockF,
  fetchMarkets as fetchMarketsF,
} from "../fetch";

declare module "@woof-software/comet-sdk" {
  namespace Market {
    let fetchMarket: typeof fetchMarketF;
    let fetchMarkets: typeof fetchMarketsF;
    let fetchMarketMock: typeof fetchMarketMockF;
  }
}

Market.fetchMarket = fetchMarketF;
Market.fetchMarkets = fetchMarketsF;
Market.fetchMarketMock = fetchMarketMockF;

export { Market };
