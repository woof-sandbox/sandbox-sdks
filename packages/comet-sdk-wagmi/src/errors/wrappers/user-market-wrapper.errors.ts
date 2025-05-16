export const ALLOW_FAILED = () => new Error("Failed to allow bulker contract.");

export const COLLATERAL_NOT_FOUND = (collateral: string) =>
  new Error(`Collateral not found: ${collateral}`);

export const BULKER_NOT_ALLOWED = () =>
  new Error("User must approve the bulker contract.");

export const TOKEN_NOT_APPROVED = (amount: bigint) =>
  new Error(
    `Insufficient token allowance. Need approval for at least ${amount.toString()}.`,
  );

export const SMALL_BORROW_AMOUNT = () =>
  new Error("Borrow amount is too small.");

export const INSUFFICIENT_COLLATERAL = () =>
  new Error("Not enough collateral to borrow this amount.");

export const INVALID_COLLATERAL_MARKET = () =>
  new Error("Supplied collaterals must belong to the same market.");

export const LOW_COLLATERAL_ALLOWANCE = () =>
  new Error("Some collaterals have insufficient approval.");

export const BORROW_POSITION_OPEN = () =>
  new Error("Borrow position is still open. Withdraw not allowed.");

export const OVER_WITHDRAW = () =>
  new Error("Attempt to withdraw more than available.");

export const EXCESSIVE_COLLATERAL_WITHDRAW = () =>
  new Error("Attempting to withdraw more collateral than allowed.");

export const APPROVE_FAILED = () => new Error("Failed to approve token.");

export const SUPPLY_FAILED = () => new Error("Failed to supply to the market.");

export const BORROW_FAILED = () =>
  new Error("Failed to borrow from the market.");

export const SUPPLY_COLLATERAL_FAILED = () =>
  new Error("Failed to supply collateral.");

export const BORROW_SUPPLY_FAILED = () =>
  new Error("Failed to borrow and supply collateral.");

export const WITHDRAW_FAILED = () =>
  new Error("Failed to withdraw from the market.");

export const ACTION_FAILED = () => new Error("Failed to create action.");

export const WITHDRAW_COLLATERAL_FAILED = () =>
  new Error("Failed to withdraw collateral.");
