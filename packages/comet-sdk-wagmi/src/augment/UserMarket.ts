import { UserMarket } from "@woof-software/comet-sdk";
import {
  fetchUserMarket as fetchUserMarketF,
  fetchUserMarkets as fetchUserMarketsF,
} from "../fetch/UserMarket";

declare module "@woof-software/comet-sdk" {
  namespace UserMarket {
    let fetchUserMarket: typeof fetchUserMarketF;
    let fetchUserMarkets: typeof fetchUserMarketsF;
  }
}

UserMarket.fetchUserMarket = fetchUserMarketF;
UserMarket.fetchUserMarkets = fetchUserMarketsF;

export { UserMarket };
