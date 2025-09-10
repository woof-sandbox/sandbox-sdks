# @woof-software/comet-sdk-wagmi

## Description

`comet-sdk-wagmi` is a TypeScript library that extends [`@woof-software/comet-sdk`](https://www.npmjs.com/package/@woof-software/comet-sdk) with wagmi/viem-based contract wrappers, fetchers, and utilities. It enables seamless interaction with Comet protocol entities and DeFi analytics in React/TypeScript dApps, supporting multicall, user/market analytics, and DeFi operations.

### Key Features

- **Wagmi-based contract wrappers** for Comet, ERC20, Bulker, ConfigController, and more
- **Augmented fetchers** for user, market, collateral, and protocol data (multichain-ready)
- **Type-safe, composable classes** for all protocol entities
- **High-level wrappers** for user and admin operations (supply, borrow, approve, migrate, etc.)
- **Utility functions** for formatting, multicall, and address management
- **Full compatibility** with `@wagmi/core`, `viem`, `@woof-software/comet-sdk`, and `@woof-software/subgraph-sdk`

## Installation

Before installing this package, make sure you have the following **peer dependencies** installed:

```bash
pnpm add \
  @woof-software/comet-sdk \
  @woof-software/subgraph-sdk \
  @wagmi/core \
  viem
```
Then:

```bash
pnpm add @woof-software/comet-sdk-wagmi
```

## Quickstart

### Configure wagmi

```ts
import { createConfig, http } from "@wagmi/core";
import { arbitrum, mainnet } from "@wagmi/core/chains";

const wagmiConfig = createConfig({
  chains: [mainnet, arbitrum],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
  },
});
```

Or use the built-in config:

```ts
import { wagmiConfig } from "@woof-software/comet-sdk-wagmi";
```

### Fetch protocol data

All main protocol entities are extended with wagmi-based fetchers:

```ts
import { Market, User, Collateral, Curve, UserMarket, SandboxController, ConfigController } from "@woof-software/comet-sdk-wagmi";

// Fetch a single market
const market = await Market.fetchMarket("0xCometAddress", sepolia.id, wagmiConfig);

// Fetch all markets
const markets = await Market.fetchMarkets(
    {
      [arbitrum.id]: [
        "0xCometAddress1" as Address,
        "0xCometAddress2" as Address,
      ]
    },
    config
);

// Fetch a user
const user = await User.fetch("0xUserAddress", "URL_Subgraph");

// Fetch user active markets
const activeMarkets = await User.fetchActiveMarkets("0xUserAddress", "URL_Subgraph");

// Fetch collaterals
const collaterals = await Collateral.fetch("0xCometAddress", sepolia.id);

// Fetch curves
const curves = await Curve.fetch("0xCometAddress", sepolia.id);

// Fetch user market data
const userMarket = await UserMarket.fetchUserMarket("0xCometAddress", "0xUserAddress", sepolia.id, wagmiConfig);

// Fetch sandbox controller
const sandbox = await SandboxController.fetch("0xControllerAddress", sepolia.id, wagmiConfig);

// Fetch config controller
const config = await ConfigController.fetch("0xControllerAddress", sepolia.id, wagmiConfig);

// Fetch sandbox Base
const base = await SandboxController.fetchBase("0xCometAddress", sepolia.id, wagmiConfig);
```

### Mock fetchers

For testing, you can use the `fetchMock`/`fetchMocks` methods:

```ts
const mockMarket = await Market.fetchMarketMock();
const mockUser = await User.fetchMock();
const mockCollaterals = await Collateral.fetchMocks();
const mockCurves = await Curve.fetchMocks();
const mockBase = await Base.fetchMock();
```

## API Reference

- **Entities with fetchers:**
  - `Market.fetchMarket`, `Market.fetchMarkets`, `Market.fetchMarketMock`
  - `User.fetch`, `User.fetchActiveMarkets`, `User.fetchMock`
  - `Collateral.fetch`, `Collateral.fetchMocks`
  - `Curve.fetch`, `Curve.fetchMocks`
  - `UserMarket.fetchUserMarket`, `UserMarket.fetchUserMarkets`
  - `SandboxController.fetch`
  - `ConfigController.fetch`
- **Other exports:**
  - `abis`, `constants`, `config`, `contracts`, `utils`, `wrappers`


### Utilities

* **FormattingUtils** — formatting for numbers, tokens, percentages, addresses
* **WagmiUtils** — multicall result helper,  etc

```ts
import { FormattingUtils } from "@woof-software/comet-sdk-wagmi";

console.log(FormattingUtils.formatTokenValue(1234567890123456789n, 18)); // "1.234567890123456789"
```

### Config & ABI

* All contract ABIs exported
* Chain, address, and subgraph config exports

## API Structure

* `@woof-software/comet-sdk-wagmi/augment` — augmented entities and fetchers
* `@woof-software/comet-sdk-wagmi/contracts` — contract wrappers
* `@woof-software/comet-sdk-wagmi/wrappers` — high-level operation wrappers
* `@woof-software/comet-sdk-wagmi/utils` — utilities
* `@woof-software/comet-sdk-wagmi/config` — addresses, chains, subgraph URLs
* `@woof-software/comet-sdk-wagmi/abis` — all supported contract ABIs


