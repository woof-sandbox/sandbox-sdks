import { UserMarket } from "@sandbox/comet-sdk";
import {
  fetchUserMarket as fetchUserMarketF,
  fetchUserMarkets as fetchUserMarketsF,
} from "../fetch/UserMarket";

declare module "@sandbox/comet-sdk" {
  namespace UserMarket {
    let fetchUserMarket: typeof fetchUserMarketF;
    let fetchUserMarkets: typeof fetchUserMarketsF;
  }
}

UserMarket.fetchUserMarket = fetchUserMarketF;
UserMarket.fetchUserMarkets = fetchUserMarketsF;

export { UserMarket };
