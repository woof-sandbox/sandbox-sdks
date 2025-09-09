import type { ICurve } from "../../curve";
import { Token } from "../Token";
import type { IBase } from "./IBase";

export class Base extends Token implements IBase {
  public curvePresets: ICurve[];

  constructor(baseData: IBase) {
    super(baseData);
    this.curvePresets = baseData.curvePresets;
  }
}
