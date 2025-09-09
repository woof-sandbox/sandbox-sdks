import type { ICurve } from "../../curve";
import type { IToken } from "../IToken";

export interface IBase extends IToken {
  // mock: USDT
  curvePresets: ICurve[];
}
