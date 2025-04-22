export interface IConfigController {
  address: `0x${string}`;
  owner: `0x${string}`;
  guardian: `0x${string}`;
  curator: `0x${string}`;
  curatorFee: number;
  marketsLength: number;
  revenueTokensLength: number;
}
