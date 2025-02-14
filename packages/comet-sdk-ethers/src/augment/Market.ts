import { Market } from "@sandbox/comet-sdk";
import { fetchMarket } from "../fetch";

declare module "@sandbox/comet-sdk" {
    namespace Market {
        let fetch: typeof fetchMarket;
    }
}

Market.fetch = fetchMarket;

export { Market };
