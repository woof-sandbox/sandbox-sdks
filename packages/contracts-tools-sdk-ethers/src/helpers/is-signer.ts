import { Signer } from 'ethers';

export const isSigner = (driver: Signer) => {
  return typeof driver?.getAddress === 'function';
};
