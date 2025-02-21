const prefix = "Contracts error: ";
export const CONTRACTS_ERRORS = {
  TRY_TO_CALL_NON_CALLABLE: new Error(
    prefix +
      "The contract was created as non-callable but was attempted to be called!",
  ),
  TRY_TO_CALL_READ_ONLY: new Error(
    prefix +
      "The contract was created as read-only but was attempted to be called!",
  ),
  ADDRESS_IS_NOT_PROVIDED: new Error(prefix + "Address is not provided!"),
  METHOD_NOT_FOUND: (methodName: string) =>
    new Error(prefix + `Method ${methodName} not found on contract!`),
  FRAGMENT_NOT_FOUND: (methodName: string) =>
    new Error(
      prefix + `Fragment for method ${methodName} not found on contract!`,
    ),
};
