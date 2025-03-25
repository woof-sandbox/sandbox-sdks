import { Collateral } from "@sandbox/comet-sdk";
import { fetchCollateralsMocks } from "../fetch";

declare module "@sandbox/comet-sdk" {
  namespace Collateral {
    let fetchMocks: typeof fetchCollateralsMocks;
  }
}

Collateral.fetchMocks = fetchCollateralsMocks;

export { Collateral };
