export const CHANGE_CURVE_FAILED = () =>
  new Error("Failed to change base asset curve.");

export const SET_CONFIG_FAILED = () =>
  new Error("Failed to set configuration.");

export const SET_FEE_FAILED = () => new Error("Failed to set fee status.");

export const TRANSFER_DAO_FAILED = () =>
  new Error("Failed to transfer DAO ownership.");

export const TRANSFER_OWNER_FAILED = () =>
  new Error("Failed to transfer owner.");

export const SET_TREASURY_FAILED = () =>
  new Error("Failed to set treasury address.");

export const WHITELIST_BASE_ASSET_FAILED = () =>
  new Error("Failed to whitelist base asset.");
