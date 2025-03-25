import { Curve } from "@sandbox/comet-sdk";
import { fetchCurvesMocks } from "../fetch";

declare module "@sandbox/comet-sdk" {
  namespace Curve {
    let fetchMocks: typeof fetchCurvesMocks;
  }
}

Curve.fetchMocks = fetchCurvesMocks;

export { Curve };
