import { UserMarket } from "@sandbox/comet-sdk";
import { fetchUserMarket, fetchUserMarkets } from "../fetch/UserMarket";

declare module "@sandbox/comet-sdk" {
  namespace UserMarket {
    let fetch: typeof fetchUserMarket;
    let fetchMarkets: typeof fetchUserMarkets;
  }
}

UserMarket.fetch = fetchUserMarket;
UserMarket.fetchMarkets = fetchUserMarkets;

export { UserMarket };
