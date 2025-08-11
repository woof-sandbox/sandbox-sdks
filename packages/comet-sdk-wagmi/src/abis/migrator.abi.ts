export const migratorAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "admin_",
        type: "address",
      },
      {
        internalType: "address",
        name: "governance_",
        type: "address",
      },
      {
        internalType: "address",
        name: "pauser_",
        type: "address",
      },
      {
        components: [
          {
            internalType: "address",
            name: "baseToken",
            type: "address",
          },
          {
            components: [
              {
                internalType: "address",
                name: "liquidityPool",
                type: "address",
              },
              {
                internalType: "bool",
                name: "isToken0",
                type: "bool",
              },
            ],
            internalType: "struct Migrator.FlashData",
            name: "flashData",
            type: "tuple",
          },
        ],
        internalType: "struct Migrator.InitialFlashData[]",
        name: "initialFlashData",
        type: "tuple[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "baseToken",
        type: "address",
      },
    ],
    name: "AlreadyConfigured",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        internalType: "address",
        name: "comet",
        type: "address",
      },
    ],
    name: "AssetNotSupportedInComet",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "baseToken",
        type: "address",
      },
    ],
    name: "BaseTokenIsNotSupported",
    type: "error",
  },
  {
    inputs: [],
    name: "BaseTokenMismatch",
    type: "error",
  },
  {
    inputs: [],
    name: "BaseTokenNotMatchPool",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "borrowBalance",
        type: "uint256",
      },
    ],
    name: "BorrowIsNotFullRepaid",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "CallerIsNotAuthorized",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "comet",
        type: "address",
      },
    ],
    name: "CometIsNotSupported",
    type: "error",
  },
  {
    inputs: [],
    name: "EmptyAssetsData",
    type: "error",
  },
  {
    inputs: [],
    name: "EnforcedPause",
    type: "error",
  },
  {
    inputs: [],
    name: "ExpectedPause",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "governance",
        type: "address",
      },
    ],
    name: "GovernanceAlreadySet",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address",
      },
    ],
    name: "InputZeroAssetAmount",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "requiredAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "flashAmount",
        type: "uint256",
      },
    ],
    name: "InsufficientFlashAmount",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "baseTokenMigrate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "baseTokenBalance",
        type: "uint256",
      },
    ],
    name: "InvalidBaseTokenAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidCallbackHash",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidZeroAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "NativeTransferNotSupported",
    type: "error",
  },
  {
    inputs: [],
    name: "NothingToMigrate",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "SenderNotUniswapPool",
    type: "error",
  },
  {
    inputs: [],
    name: "SourceEqualsTargetComet",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "AdminTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "baseToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "liquidityPool",
        type: "address",
      },
    ],
    name: "FlashDataConfigured",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "baseToken",
        type: "address",
      },
    ],
    name: "FlashDataRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newGovernance",
        type: "address",
      },
    ],
    name: "GovernanceSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "srcComet",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "trgComet",
        type: "address",
      },
    ],
    name: "Migration",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newPauser",
        type: "address",
      },
    ],
    name: "PauserSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "srcComet",
        type: "address",
      },
      {
        internalType: "address",
        name: "trgComet",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "flashAmount",
        type: "uint256",
      },
    ],
    name: "fullMigrate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "baseToken",
        type: "address",
      },
    ],
    name: "getFlashData",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "liquidityPool",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isToken0",
            type: "bool",
          },
        ],
        internalType: "struct Migrator.FlashData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "governance",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "srcComet",
        type: "address",
      },
      {
        internalType: "address",
        name: "trgComet",
        type: "address",
      },
      {
        components: [
          {
            internalType: "address",
            name: "asset",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        internalType: "struct Migrator.AssetData[]",
        name: "assetsData",
        type: "tuple[]",
      },
      {
        internalType: "uint256",
        name: "flashAmount",
        type: "uint256",
      },
    ],
    name: "partialMigrate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pauser",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "baseToken",
        type: "address",
      },
    ],
    name: "removeFlashData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "baseToken",
        type: "address",
      },
      {
        components: [
          {
            internalType: "address",
            name: "liquidityPool",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isToken0",
            type: "bool",
          },
        ],
        internalType: "struct Migrator.FlashData",
        name: "flashData",
        type: "tuple",
      },
    ],
    name: "setFlashData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newGovernance",
        type: "address",
      },
    ],
    name: "setGovernance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newPauser",
        type: "address",
      },
    ],
    name: "setPauser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "transferAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "fee0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "fee1",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "uniswapV3FlashCallback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;
