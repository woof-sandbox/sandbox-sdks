import type { Tagable } from "@sandbox/contracts-tools-sdk-ethers/src/types";

const prefix = "Multicall error: ";
export const MULTICALL_ERRORS = {
  TAG_NOT_FOUND: new Error(prefix + "Tag not Found!"),
  RESULT_NOT_FOUND: (tag: Tagable) =>
    new Error(prefix + `${String(tag)} => result not found!`),
};
