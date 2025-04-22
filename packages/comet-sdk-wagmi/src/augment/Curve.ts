import { Curve } from "@woof-software/comet-sdk";
import { fetchCurves, fetchCurvesMocks } from "../fetch";

declare module "@woof-software/comet-sdk" {
  namespace Curve {
    let fetchMocks: typeof fetchCurvesMocks;
    let fetch: typeof fetchCurves;
  }
}

Curve.fetchMocks = fetchCurvesMocks;
Curve.fetch = fetchCurves;

export { Curve };
