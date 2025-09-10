import { Collateral } from "@woof-software/comet-sdk";
import { fetchCollaterals, fetchCollateralsMocks } from "../fetch";

declare module "@woof-software/comet-sdk" {
  namespace Collateral {
    let fetchMocks: typeof fetchCollateralsMocks;
    let fetch: typeof fetchCollaterals;
  }
}

Collateral.fetchMocks = fetchCollateralsMocks;
Collateral.fetch = fetchCollaterals;

export { Collateral };
