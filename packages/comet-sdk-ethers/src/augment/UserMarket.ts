import {UserMarket} from "@sandbox/comet-sdk";
import {fetchUserMarket} from "../fetch/UserMarket";

declare module "@sandbox/comet-sdk" {
    namespace UserMarket {
        let fetch: typeof fetchUserMarket;
    }
}

UserMarket.fetch = fetchUserMarket;

export {UserMarket};
