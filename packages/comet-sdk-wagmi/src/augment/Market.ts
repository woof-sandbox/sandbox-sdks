import { Market } from "@woof-software/comet-sdk";
import {
  fetchMarket as fetchMarketF,
  fetchMarketMock as fetchMarketMockF,
} from "../fetch";

declare module "@woof-software/comet-sdk" {
  namespace Market {
    let fetchMarket: typeof fetchMarketF;
    let fetchMarketMock: typeof fetchMarketMockF;
  }
}

Market.fetchMarket = fetchMarketF;
Market.fetchMarketMock = fetchMarketMockF;

export { Market };
