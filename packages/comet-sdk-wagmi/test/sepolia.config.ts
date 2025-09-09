import type { Address } from "viem";

export const SepoliaConfig = {
  rpcUrl: "https://1rpc.io/sepolia",
  comet1: "0x4e24e491b68f2718fce98f0bc5064716db695619" as Address,
  configController1: "0x8659d18550969998d2e023be5a7a5fbeb1a77706" as Address,
  comet2: "0xacb1c4d4de3ce962673326fb9c53d56ce4881cf4" as Address,
  configController2: "0x7b2a1dc52f9ef075f05c35003d45bcc063ef7727" as Address,
  userMarket: "0xa7ecbffdf700383f981f003048faf598886637d3" as Address,
  configControllerImplementation:
    "0x8e0265d8473d5a144f60e60f0d0bb48e81479753" as Address,
  configControllerFactory:
    "0x989c545362a6ad8534f91b970cf2ac5d97fa8dff" as Address,
  sandboxController: "0xb99ad54cbafe262908c352d06fce0c874b69b261" as Address,
  TokenAddresses: {
    usdc: "0x306134121e8b55dfa9faba05de590e639a1f7d6b" as Address,
    weth: "0x7c96e7d262659ed6ed79910c2590666d8da87e66" as Address,
    wbtc: "0xb01f67f936b018edf565311a0ab55f3e1a05dbaf" as Address,
    comp: "0x2001c123a7d08d355b323d21e2c24b4bcb35c2fe" as Address,
    link: "0x75b3598a06abf790a25ff4b956799945c38d0bf5" as Address,
  },
} as const;
