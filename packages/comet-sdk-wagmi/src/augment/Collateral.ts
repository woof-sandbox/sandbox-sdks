import { Collateral } from "@woof-software/comet-sdk";
import { fetchCollateralsMocks } from "../fetch";

declare module "@woof-software/comet-sdk" {
  namespace Collateral {
    let fetchMocks: typeof fetchCollateralsMocks;
  }
}

Collateral.fetchMocks = fetchCollateralsMocks;

export { Collateral };
