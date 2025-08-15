export const ACCEPT_CURATOR_ROLE_FAILED = () =>
  new Error("Failed to accept curator role.");

export const CANCEL_CURATOR_PROPOSAL_FAILED = () =>
  new Error("Failed to cancel curator proposal.");

export const CLAIM_REVENUE_FAILED = () => new Error("Failed to claim revenue.");

export const GRANT_OWNERSHIP_FAILED = () =>
  new Error("Failed to grant ownership.");

export const CONFIG_INITIALIZATION_FAILED = () =>
  new Error("Failed to initialize config controller.");

export const PROPOSE_CURATOR_FAILED = () =>
  new Error("Failed to propose curator.");

export const REMOVE_CURATOR_FAILED = () =>
  new Error("Failed to remove curator.");

export const SET_GUARDIAN_FAILED = () => new Error("Failed to set guardian.");

export const SET_PROPOSAL_DURATIONS_FAILED = () =>
  new Error("Failed to set proposal durations.");
