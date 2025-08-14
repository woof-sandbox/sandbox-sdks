import { UserCollateral } from "@woof-software/comet-sdk";
import { fetchUserCollaterals } from "../fetch/UserCollateral";

declare module "@woof-software/comet-sdk" {
    namespace UserCollateral {
        let fetch: typeof fetchUserCollaterals;
    }
}

UserCollateral.fetch = fetchUserCollaterals;

export { UserCollateral };