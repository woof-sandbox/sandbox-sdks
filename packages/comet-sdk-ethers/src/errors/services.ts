const prefix = "Services error: ";
export const SERVICES_ERRORS = {
  SIGNER_IS_NOT_PROVIDED: new Error(
    prefix + "Signer (private key) is not provided for this action!",
  ),
  CALL_WAS_UNSUCCESSFUL: new Error(prefix + "Call was unsuccessful!"),
};
