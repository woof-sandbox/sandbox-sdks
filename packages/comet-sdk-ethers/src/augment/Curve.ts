import { Curve } from "@sandbox/comet-sdk";
import { fetchCurves, fetchCurvesMocks } from "../fetch";

declare module "@sandbox/comet-sdk" {
  namespace Curve {
    let fetchMocks: typeof fetchCurvesMocks;
    let fetch: typeof fetchCurves;
  }
}

Curve.fetchMocks = fetchCurvesMocks;
Curve.fetch = fetchCurves;

export { Curve };
